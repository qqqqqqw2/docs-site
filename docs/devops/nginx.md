# Nginx 配置

## Nginx 简介

一款高性能 Web 服务器，专门负责接收用户的网络请求，然后决定怎么处理。Nginx 是网站的"大门"和"调度员"：
- 直接返回静态文件
- 转发给后端服务
- 做加密处理（SSL 终端）
- 分发到其他服务器（负载均衡）

## 安装与基础命令

```bash
sudo apt install -y nginx
nginx -v                              # 验证版本

sudo systemctl status nginx           # 查看运行状态（q 退出）
sudo systemctl start nginx            # 启动
sudo systemctl restart nginx          # 重启
sudo systemctl reload nginx           # 重载配置（推荐，不中断服务）
sudo systemctl enable nginx           # 开机自启

sudo nginx -t                          # 测试配置语法
```

## 配置文件位置

```
/etc/nginx/
├── nginx.conf              # 主配置
├── sites-available/        # 所有可用配置
├── sites-enabled/          # 启用的配置（软链接）
└── conf.d/                 # 额外配置
```

## 标准反向代理模板

```nginx
server {
    listen 80;
    server_name example.com;

    # 前端静态文件
    root /var/www/项目名;
    index index.html;

    # SPA 路由必加
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

    # 静态资源缓存
    location ~* \.(js|css|png|jpg|jpeg|gif|ico|svg|woff|woff2|ttf)$ {
        expires 7d;
        add_header Cache-Control "public, no-transform";
    }

    # 文件上传大小限制
    client_max_body_size 50M;
}
```

## 启用配置

```bash
# 软链接到 sites-enabled 才生效
sudo ln -s /etc/nginx/sites-available/项目名 /etc/nginx/sites-enabled/

# 删除默认配置（避免冲突）
sudo rm /etc/nginx/sites-enabled/default

# 测试配置语法
sudo nginx -t

# 重载配置
sudo systemctl reload nginx
```

## 多项目部署（不同域名）

```nginx
# 项目 A
server {
    listen 80;
    server_name a.example.com;
    root /var/www/projectA;
    location / { try_files $uri $uri/ /index.html; }
    location /api/ { proxy_pass http://localhost:3000; }
}

# 项目 B
server {
    listen 80;
    server_name b.example.com;
    root /var/www/projectB;
    location / { try_files $uri $uri/ /index.html; }
    location /api/ { proxy_pass http://localhost:3001; }
}
```

## 负载均衡

```nginx
upstream backend {
    server 127.0.0.1:3001;
    server 127.0.0.1:3002;
    server 127.0.0.1:3003;
}

server {
    listen 80;
    location /api { proxy_pass http://backend; }
}
```

### 负载均衡策略

- **轮询**（默认）：依次分发到每个服务器
- **least_conn**：分发给当前连接最少的服务器
- **ip_hash**：同一 IP 固定分发到同一服务器（会话保持）

```nginx
upstream backend {
    least_conn;  # 或 ip_hash
    server 127.0.0.1:3001;
    server 127.0.0.1:3002;
}
```

## HTTPS 配置

### 使用 Let's Encrypt 免费证书

```bash
# 安装 certbot
sudo apt install -y certbot python3-certbot-nginx

# 自动申请并配置（会自动改 Nginx 配置）
sudo certbot --nginx -d yourdomain.com

# 自动续期测试（证书 90 天有效）
sudo certbot renew --dry-run
```

certbot 会自动：
1. 申请证书
2. 修改 Nginx 配置添加 443 端口 + SSL 证书路径
3. 配置 80 跳转 443 的 redirect
4. 设置 crontab 自动续期

### 手动配置 HTTPS

```nginx
server {
    listen 443 ssl http2;
    server_name yourdomain.com;

    ssl_certificate /etc/letsencrypt/live/yourdomain.com/fullchain.pem;
    ssl_certificate_key /etc/letsencrypt/live/yourdomain.com/privkey.pem;

    ssl_protocols TLSv1.2 TLSv1.3;
    ssl_ciphers HIGH:!aNULL:!MD5;

    # ... 其他配置
}

# HTTP 跳转 HTTPS
server {
    listen 80;
    server_name yourdomain.com;
    return 301 https://$host$request_uri;
}
```

## WebSocket 代理

```nginx
location /socket.io/ {
    proxy_pass http://localhost:3000;
    proxy_http_version 1.1;
    proxy_set_header Upgrade $http_upgrade;
    proxy_set_header Connection "upgrade";
    proxy_set_header Host $host;
}
```

## 限流配置

```nginx
# 定义限流区域（每秒 10 个请求）
limit_req_zone $binary_remote_addr zone=mylimit:10m rate=10r/s;

server {
    location /api/ {
        limit_req zone=mylimit burst=20 nodelay;
        proxy_pass http://localhost:3000;
    }
}
```

## 常用排查命令

```bash
# 查看 Nginx 错误日志
sudo tail -f /var/log/nginx/error.log

# 查看访问日志
sudo tail -f /var/log/nginx/access.log

# 检查监听端口
sudo netstat -tlnp | grep nginx
sudo ss -tlnp | grep nginx

# 检查 Nginx 进程
ps aux | grep nginx
```

## 常见错误处理

| 错误 | 原因 | 解决 |
|------|------|------|
| 403 Forbidden | 文件权限不足 | `chmod -R 755 /var/www/项目名/` |
| 404 Not Found | 路径错误或 SPA 未配置 `try_files` | 检查 root 路径和 try_files |
| 502 Bad Gateway | 后端服务未启动 | `pm2 list` 检查，`pm2 restart` 重启 |
| 504 Gateway Timeout | 后端响应慢 | 看后端日志排查，或增加 `proxy_read_timeout` |
