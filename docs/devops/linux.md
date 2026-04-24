# Linux 常用命令

## 文件与目录

```bash
ls -la              # 列出文件（含隐藏文件、详细信息）
cd 路径              # 切换目录
pwd                 # 当前目录
mkdir -p a/b/c      # 创建多级目录
rm -rf 目录          # 强制递归删除（危险！）
mv 源 目标           # 移动/重命名
cp -r 源 目标        # 递归复制
cat 文件             # 查看文件内容
tail -f 日志         # 实时查看日志末尾
tail -n 100 日志     # 查看最后 100 行
head -n 20 文件      # 查看前 20 行
```

## 权限管理

```bash
chmod 755 文件       # 修改权限
chmod +x 文件         # 添加执行权限
chown user:group 文件 # 修改所有者
```

**权限数字含义**：
- 4 = 读（r）
- 2 = 写（w）
- 1 = 执行（x）

**常见权限**：
- 755：所有者全部 + 其他人读执行
- 644：所有者读写 + 其他人只读
- 777：所有人全部（危险）

## 进程管理

```bash
ps aux | grep node   # 查看 node 进程
kill -9 PID          # 强制杀进程
top                  # 实时进程监控（按 q 退出）
htop                 # 更友好的 top（需安装）
```

## 系统信息

```bash
df -h               # 磁盘使用
du -sh *            # 当前目录下每个文件夹大小
free -h             # 内存使用
uptime              # 系统运行时间
uname -a            # 内核信息
cat /etc/os-release # 系统版本
```

## 网络

```bash
# 查看端口
sudo netstat -tlnp
sudo ss -tlnp

# 查看占用某端口的进程
sudo lsof -i :3000

# 测试网络
ping example.com
curl http://localhost:3000

# 查看路由
ip addr
ifconfig
```

## 文件查找

```bash
# 按文件名查找
find /path -name "*.log"

# 按内容查找
grep "关键字" 文件
grep -r "关键字" 目录       # 递归搜索

# 组合使用
find /var/log -name "*.log" -exec grep "error" {} \;

# 查找大文件
find /var -size +100M
```

## 文本处理

```bash
# 查看文件
cat 文件              # 全部
less 文件             # 分页查看（支持搜索 /）
more 文件             # 简单分页

# 统计
wc -l 文件            # 行数
wc -w 文件            # 单词数

# 过滤/替换
grep 关键字 文件       # 查找包含关键字的行
sed 's/old/new/g' 文件 # 替换
awk '{print $1}' 文件  # 按列处理

# 排序去重
sort 文件 | uniq      # 排序并去重
sort 文件 | uniq -c   # 去重并统计数量
```

## 文件传输

```bash
# scp：本地 ↔ 服务器
scp 文件 root@IP:/路径/                # 上传单文件
scp -r 目录 root@IP:/路径/              # 上传整个目录
scp root@IP:/路径/文件 ./               # 下载

# rsync（推荐，增量同步）
rsync -av --exclude='node_modules' 本地目录/ root@IP:/远程目录/
rsync -av --delete 本地/ root@IP:/远程/  # --delete 同步删除
```

**rsync 常用参数**：
- `-a`：归档模式（保留权限、时间等）
- `-v`：显示详细过程
- `-z`：压缩传输
- `--exclude`：排除文件
- `--delete`：目标目录有而源没有的文件会被删除

## nano 编辑器

nano 是服务器上的"记事本"，相对简单。

```bash
nano 文件名

Ctrl+O              # 保存（Write Out）
回车                # 确认文件名
Ctrl+X              # 退出
Ctrl+W              # 搜索
Ctrl+K              # 剪切当前行
Ctrl+U              # 粘贴
```

## vim 编辑器

功能强大但操作复杂。

```bash
vim 文件名

# 模式
i                   # 进入插入模式
Esc                 # 回到命令模式

# 命令
:w                  # 保存
:q                  # 退出
:wq                 # 保存并退出
:q!                 # 强制退出不保存
/关键字              # 搜索
dd                  # 删除当前行
yy                  # 复制当前行
p                   # 粘贴
u                   # 撤销
```

## 压缩与解压

```bash
# tar
tar -czvf archive.tar.gz 目录/    # 压缩
tar -xzvf archive.tar.gz          # 解压

# zip
zip -r archive.zip 目录/           # 压缩
unzip archive.zip                  # 解压
```

## 系统服务管理（systemd）

```bash
sudo systemctl status 服务名       # 查看状态
sudo systemctl start 服务名        # 启动
sudo systemctl stop 服务名         # 停止
sudo systemctl restart 服务名      # 重启
sudo systemctl reload 服务名       # 重载配置
sudo systemctl enable 服务名       # 开机自启
sudo systemctl disable 服务名      # 禁用自启

# 查看日志
sudo journalctl -u 服务名          # 查看服务日志
sudo journalctl -u 服务名 -f        # 实时跟踪
```

## 防火墙（ufw）

```bash
sudo ufw enable                    # 启用
sudo ufw disable                   # 禁用
sudo ufw status                    # 查看状态

sudo ufw allow 22                  # 允许 SSH
sudo ufw allow 80                  # 允许 HTTP
sudo ufw allow 443                 # 允许 HTTPS
sudo ufw allow from IP to any port 端口  # 允许某 IP 访问某端口

sudo ufw delete allow 22           # 删除规则
```

## 用户管理

```bash
# 创建用户
sudo adduser deploy

# 加到 sudo 组
sudo usermod -aG sudo deploy

# 切换用户
su - deploy

# 删除用户
sudo deluser deploy
```

## SSH 密钥

```bash
# 生成密钥
ssh-keygen -t ed25519 -C "email@example.com"

# 上传公钥到服务器
ssh-copy-id root@IP

# 禁用密码登录
sudo nano /etc/ssh/sshd_config
# 改：PasswordAuthentication no
sudo systemctl restart ssh
```

## 常见场景

### 看错误日志

```bash
# 查看最新日志
tail -f /var/log/nginx/error.log

# 搜索错误
grep -i error /var/log/nginx/*.log
```

### 磁盘满了

```bash
df -h                          # 看哪个分区满了
du -h -d 1 /                   # 根目录一级深度大小
du -sh /var/log/*              # 看 /var/log 下每个文件大小
sudo rm /var/log/old.log       # 删除旧日志
```

### 查进程占用端口

```bash
sudo lsof -i :3000
sudo netstat -tlnp | grep 3000
```

### 查进程并杀掉

```bash
ps aux | grep node             # 查 node 进程
kill -9 PID                    # 强制杀
```

### 查看实时系统资源

```bash
top                  # CPU/内存使用
htop                 # 更友好
iotop                # IO 监控
```
