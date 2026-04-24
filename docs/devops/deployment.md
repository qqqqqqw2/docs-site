# 服务器部署完整流程

> 适用场景：Linux 服务器（Ubuntu/CentOS）部署前端 + 后端项目
> 技术栈：Nginx + Node.js + PM2（可选 Docker、MySQL）

## 一、部署前准备

### 1.1 拿到服务器信息

- **IP 地址**：如 `YOUR_SERVER_IP`
- **登录用户名**：通常是 `root`
- **登录密码** 或 **SSH 密钥**

### 1.2 SSH 登录服务器

```bash
ssh root@服务器IP
# 例：ssh root@YOUR_SERVER_IP
```

首次连接会提示确认指纹，输入 `yes`，再输入密码（盲打，不显示字符）。

### 1.3 检查服务器环境

```bash
cat /etc/os-release    # 看系统版本
df -h                  # 看磁盘空间
free -h                # 看内存
docker --version       # 看 Docker 是否已装
nginx -v               # 看 Nginx 是否已装
node -v                # 看 Node 是否已装
```

## 二、服务器环境安装

### 2.1 更新软件源

```bash
sudo apt update              # Ubuntu/Debian
# sudo yum update -y         # CentOS
```

### 2.2 安装 Nginx

```bash
sudo apt install -y nginx
nginx -v                              # 验证版本

sudo systemctl status nginx           # 看运行状态（按 q 退出）
sudo systemctl start nginx            # 启动
sudo systemctl restart nginx          # 重启
sudo systemctl reload nginx           # 重载配置（推荐，不中断服务）
sudo systemctl enable nginx           # 开机自启
```

::: tip Nginx 是什么
一款高性能 Web 服务器，专门负责接收用户的网络请求，然后决定怎么处理这些请求。
Nginx 是网站的"大门"和"调度员"，所有用户请求都先到它这里，它决定是直接返回静态文件、还是转发给后端服务、还是做加密处理、还是分发到其他服务器。
:::

### 2.3 安装 Node.js（推荐 LTS 20）

```bash
# 通过 NodeSource 安装最新 LTS
curl -fsSL https://deb.nodesource.com/setup_20.x | sudo -E bash -
sudo apt install -y nodejs

node -v
npm -v

# 配置 npm 国内源（加速）
npm config set registry https://registry.npmmirror.com
npm config get registry              # 查看当前源
```

### 2.4 安装 PM2（Node 进程守护工具）

```bash
sudo npm install -g pm2
pm2 --version
```

### 2.5 安装 Docker（可选）

```bash
# 官方一键脚本（适合 Ubuntu 22.04+）
curl -fsSL https://get.docker.com | sudo bash

# 旧系统（Ubuntu 20.04 EOL）用 apt 源版本
sudo apt install -y docker.io
sudo systemctl start docker
sudo systemctl enable docker
docker --version
```

::: tip Docker 是什么
Docker 把"应用 + 环境 + 依赖"打包成集装箱，让程序在任何地方运行效果完全一致，彻底解决"我电脑上能跑"的问题。
:::

### 2.6 安装 docker-compose

```bash
sudo apt install -y docker-compose
docker-compose --version
```

### 2.7 安装 Git

```bash
sudo apt install -y git
git --version
```

## 三、部署流程总览

```
[本地开发] → [打包] → [上传] → [服务器装依赖] → [启动后端] → [配置 Nginx] → [浏览器访问]
```

## 四、前端部署

### 4.1 本地打包

```bash
cd 前端项目目录
npm install                  # 装依赖（首次）
npm run build                # 打包生成 dist/
ls dist                      # 验证 dist 存在
```

### 4.2 上传 dist 到服务器

**方法一：scp（简单，每次全量）**

```bash
# 在本地执行
scp -r dist/* root@服务器IP:/var/www/项目名/
```

::: warning 常见坑
`scp -r dist root@...` 会创建 `项目名/dist/` 多一层目录！
用 `dist/*` 或 `rsync` 上传内容到目标目录里。
:::

**方法二：rsync（增量上传，更快）**

```bash
rsync -av --delete dist/ root@服务器IP:/var/www/项目名/
```

### 4.3 服务器目录结构

```
/var/www/项目名/
├── index.html
├── assets/
└── ...
```

## 五、后端部署

### 5.1 上传代码（排除 node_modules）

```bash
# 在本地执行
rsync -av --exclude='node_modules' --exclude='.DS_Store' \
    backend/ root@服务器IP:/var/www/项目名-backend/
```

### 5.2 服务器装依赖

```bash
# 在服务器执行
cd /var/www/项目名-backend
npm config set registry https://registry.npmmirror.com
npm install --production    # --production 只装生产依赖
```

### 5.3 用 PM2 启动并守护

```bash
# 启动
pm2 start src/index.js --name 项目名

# 保存当前进程列表（重启服务器后能恢复）
pm2 save

# 配置开机自启（执行后会输出一条 sudo 命令，复制粘贴执行）
pm2 startup
```

### 5.4 PM2 常用命令

```bash
pm2 list                          # 查看所有进程
pm2 logs 项目名                    # 看日志
pm2 logs 项目名 --lines 100        # 看最后100行
pm2 restart 项目名                 # 重启
pm2 stop 项目名                    # 停止
pm2 delete 项目名                  # 删除进程
pm2 monit                          # 实时监控（按 q 退出）
```

### 5.5 验证后端运行

```bash
curl http://localhost:3000/api/health
# 应该返回 JSON 数据
```

## 六、Nginx 配置（核心）

### 6.1 创建项目配置文件

```bash
sudo nano /etc/nginx/sites-available/项目名
```

### 6.2 标准模板（前端 + 后端 API 反向代理）

```nginx
server {
    listen 80;
    server_name YOUR_SERVER_IP;       # 改成你的域名或IP

    # 前端静态文件路径
    root /var/www/项目名;
    index index.html;

    # 前端路由（SPA 单页应用必加）
    location / {
        try_files $uri $uri/ /index.html;
    }

    # 后端 API 反向代理
    location /api/ {
        proxy_pass http://localhost:3000;
        proxy_http_version 1.1;
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto $scheme;
    }

    # 静态资源缓存（可选，提升性能）
    location ~* \.(js|css|png|jpg|jpeg|gif|ico|svg|woff|woff2|ttf)$ {
        expires 7d;
        add_header Cache-Control "public, no-transform";
    }

    # 上传文件大小限制（默认1M，文件上传场景需要调大）
    client_max_body_size 50M;
}
```

### 6.3 启用配置 + 删除默认配置

```bash
# 软链接到 sites-enabled 才生效
sudo ln -s /etc/nginx/sites-available/项目名 /etc/nginx/sites-enabled/

# 删除默认配置（避免冲突）
sudo rm /etc/nginx/sites-enabled/default

# 测试配置语法
sudo nginx -t

# 重载配置（推荐，不中断服务）
sudo systemctl reload nginx
```

### 6.4 多项目部署（不同域名）

```nginx
# 项目A
server {
    listen 80;
    server_name a.example.com;
    root /var/www/projectA;
    location / { try_files $uri $uri/ /index.html; }
    location /api/ { proxy_pass http://localhost:3000; }
}

# 项目B
server {
    listen 80;
    server_name b.example.com;
    root /var/www/projectB;
    location / { try_files $uri $uri/ /index.html; }
    location /api/ { proxy_pass http://localhost:3001; }
}
```

## 七、HTTPS 配置（有域名时）

```bash
# 安装 certbot
sudo apt install -y certbot python3-certbot-nginx

# 自动申请并配置（会自动改 Nginx 配置）
sudo certbot --nginx -d yourdomain.com

# 自动续期（证书 90 天有效）
sudo certbot renew --dry-run    # 测试续期
# crontab 自动续期已自动配置，不用手动处理
```

## 八、代码更新流程

### 前端更新

```bash
# 本地
npm run build
rsync -av --delete dist/ root@服务器IP:/var/www/项目名/
# 浏览器刷新即可（Nginx 会自动读取新文件）
```

### 后端更新

```bash
# 本地
rsync -av --exclude='node_modules' backend/ root@服务器IP:/var/www/项目名-backend/

# 服务器
cd /var/www/项目名-backend
npm install --production    # 如果 package.json 有变化
pm2 restart 项目名          # 重启服务
```

## 九、问题排查清单

### 浏览器访问出错

| 现象 | 排查 |
|------|------|
| 无法访问 / 超时 | 1. 服务器是否开机？`ping IP`<br>2. 安全组/防火墙是否开放 80 端口？<br>3. Nginx 是否运行？`systemctl status nginx` |
| 403 Forbidden | 1. 文件路径是否正确？`ls /var/www/项目名/`<br>2. 是否有 index.html？<br>3. 文件权限：`chmod -R 755 /var/www/项目名/` |
| 404 Not Found | 1. URL 是否正确？<br>2. Nginx `root` 路径是否正确？<br>3. SPA 是否配置 `try_files` |
| 502 Bad Gateway | 1. 后端服务是否运行？`pm2 list`<br>2. 后端端口是否一致？`curl localhost:3000`<br>3. PM2 日志：`pm2 logs` |
| 504 Gateway Timeout | 后端响应慢，看 PM2 日志排查代码问题 |
| API 跨域 CORS 错误 | 通过 Nginx 反向代理后不应该有跨域，检查前端请求路径是否走的 `/api/` |

### 服务器命令问题

| 现象 | 解决 |
|------|------|
| `command not found` | 该工具未安装，先 `apt install` |
| `Permission denied` | 加 `sudo`，或检查文件权限 `chmod`/`chown` |
| `Connection refused` | 服务未启动，`systemctl start` 启动 |
| npm install 慢/卡 | 切换淘宝源：`npm config set registry https://registry.npmmirror.com` |
| 磁盘满 | `df -h` 查看，删除 `/tmp` 或日志文件 |

## 十、安全加固（生产环境必做）

```bash
# 1. 修改 SSH 端口（默认22容易被扫描）
sudo nano /etc/ssh/sshd_config
# 改 Port 22 → Port 12345
sudo systemctl restart ssh

# 2. 禁用密码登录，只用密钥
# 本地生成密钥：ssh-keygen
# 上传公钥：ssh-copy-id root@IP
# 服务器禁用密码：PasswordAuthentication no

# 3. 配置防火墙
sudo ufw allow 22         # SSH
sudo ufw allow 80         # HTTP
sudo ufw allow 443        # HTTPS
sudo ufw enable

# 4. 创建非 root 用户
sudo adduser deploy
sudo usermod -aG sudo deploy
```

## 十一、完整部署命令清单（按顺序）

```bash
# === 服务器端：环境初始化 ===
ssh root@服务器IP
sudo apt update
sudo apt install -y nginx
curl -fsSL https://deb.nodesource.com/setup_20.x | sudo -E bash -
sudo apt install -y nodejs
sudo apt install -y docker.io
sudo apt install -y docker-compose
sudo npm install -g pm2

# === 本地端：前端打包上传 ===
cd 前端项目目录
npm run build
scp -r dist/* root@服务器IP:/var/www/项目名/

# === 本地端：后端上传 ===
rsync -av --exclude='node_modules' backend/ \
    root@服务器IP:/var/www/项目名-backend/

# === 服务器端：后端启动 ===
cd /var/www/项目名-backend
npm config set registry https://registry.npmmirror.com
npm install
pm2 start src/index.js --name 项目名
pm2 save
pm2 startup  # 复制输出的 sudo 命令再执行

# === 服务器端：Nginx 配置 ===
sudo nano /etc/nginx/sites-available/项目名
# 粘贴 Nginx 配置 → Ctrl+O → 回车 → Ctrl+X
sudo ln -s /etc/nginx/sites-available/项目名 /etc/nginx/sites-enabled/
sudo rm /etc/nginx/sites-enabled/default
sudo nginx -t
sudo systemctl reload nginx
```
