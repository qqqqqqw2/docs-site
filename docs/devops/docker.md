# Docker 部署

## Docker 简介

Docker 把"应用 + 环境 + 依赖"打包成**集装箱**，让程序在任何地方运行效果完全一致，彻底解决"我电脑上能跑"的问题。

## 安装

```bash
# 官方一键脚本（适合 Ubuntu 22.04+）
curl -fsSL https://get.docker.com | sudo bash

# 旧系统用 apt 源版本
sudo apt install -y docker.io
sudo systemctl start docker
sudo systemctl enable docker
docker --version

# 安装 docker-compose
sudo apt install -y docker-compose
docker-compose --version
```

## Dockerfile 基础

### 后端 Node.js 模板

```dockerfile
FROM node:20-alpine
WORKDIR /app

# 先拷贝 package.json，利用缓存
COPY package*.json ./
RUN npm install --production

# 再拷贝代码
COPY . .

EXPOSE 3000
CMD ["node", "src/index.js"]
```

### 多阶段构建（减小镜像体积）

```dockerfile
# 构建阶段
FROM node:20-alpine AS builder
WORKDIR /app
COPY package*.json ./
RUN npm install
COPY . .
RUN npm run build

# 运行阶段
FROM node:20-alpine
WORKDIR /app
COPY --from=builder /app/dist ./dist
COPY --from=builder /app/node_modules ./node_modules
COPY package.json ./
EXPOSE 3000
CMD ["node", "dist/index.js"]
```

### 前端 Nginx 模板

```dockerfile
# 构建阶段
FROM node:20-alpine AS builder
WORKDIR /app
COPY package*.json ./
RUN npm install
COPY . .
RUN npm run build

# 运行阶段
FROM nginx:alpine
COPY --from=builder /app/dist /usr/share/nginx/html
COPY nginx.conf /etc/nginx/conf.d/default.conf
EXPOSE 80
CMD ["nginx", "-g", "daemon off;"]
```

## 基础命令

```bash
# 构建镜像
docker build -t myapp:v1 .

# 运行容器
docker run -d \
  --name myapp \
  -p 3000:3000 \
  --restart always \
  myapp:v1

# 查看容器
docker ps                    # 运行中的
docker ps -a                 # 所有

# 停止/启动/重启
docker stop myapp
docker start myapp
docker restart myapp

# 查看日志
docker logs myapp
docker logs -f myapp         # 实时跟踪

# 进入容器
docker exec -it myapp bash
docker exec -it myapp sh     # 如果是 alpine

# 删除容器和镜像
docker rm myapp              # 删除容器（要先停止）
docker rmi myapp:v1          # 删除镜像
docker system prune          # 清理无用数据
```

## docker-compose.yml 模板

### 前端 + 后端 + MySQL + Redis

```yaml
version: '3.8'

services:
  backend:
    build: ./backend
    ports:
      - "3000:3000"
    environment:
      - DB_HOST=mysql
      - DB_PASSWORD=yourpassword
    depends_on:
      - mysql
    restart: always

  mysql:
    image: mysql:8.0
    environment:
      MYSQL_ROOT_PASSWORD: yourpassword
      MYSQL_DATABASE: mydb
    volumes:
      - ./mysql-data:/var/lib/mysql
    ports:
      - "3306:3306"
    restart: always

  redis:
    image: redis:7-alpine
    ports:
      - "6379:6379"
    restart: always

  nginx:
    image: nginx:alpine
    ports:
      - "80:80"
    volumes:
      - ./nginx.conf:/etc/nginx/conf.d/default.conf
      - ./frontend-dist:/usr/share/nginx/html
    depends_on:
      - backend
    restart: always
```

### docker-compose 命令

```bash
docker-compose up -d           # 后台启动所有服务
docker-compose down            # 停止并删除
docker-compose logs -f backend # 查看某服务日志
docker-compose restart backend # 重启某个服务
docker-compose ps              # 查看状态
docker-compose build           # 重新构建
docker-compose pull            # 拉取最新镜像
```

## MongoDB 容器化

```yaml
services:
  mongodb:
    image: mongo:7
    ports:
      - "27017:27017"
    environment:
      MONGO_INITDB_ROOT_USERNAME: admin
      MONGO_INITDB_ROOT_PASSWORD: yourpassword
      MONGO_INITDB_DATABASE: mydb
    volumes:
      - ./mongodb-data:/data/db
    restart: always
```

## 镜像优化技巧

### 1. 使用 alpine 基础镜像

镜像体积：
- `node:20` → 约 900MB
- `node:20-alpine` → 约 160MB

### 2. 合并 RUN 减少层数

```dockerfile
# ❌ 多层
RUN apt-get update
RUN apt-get install -y curl
RUN apt-get install -y wget

# ✅ 合并
RUN apt-get update && \
    apt-get install -y curl wget && \
    rm -rf /var/lib/apt/lists/*
```

### 3. .dockerignore

```
node_modules
.git
.env
*.log
dist
```

### 4. 先拷贝 package.json

利用层缓存：只有 package.json 变化时才重新 `npm install`。

## 常用数据卷

```bash
# 命名卷（推荐，Docker 管理）
volumes:
  - mysql-data:/var/lib/mysql

volumes:
  mysql-data:

# 绑定挂载（调试用）
volumes:
  - ./code:/app

# 匿名卷
volumes:
  - /app/node_modules
```

## 常见问题

### 容器启动失败

```bash
docker logs 容器名        # 看日志找原因
docker inspect 容器名      # 看配置
```

### 网络问题

```bash
# 容器间通信，用服务名作为 hostname
# 例如 backend 要连 mysql：host=mysql:3306

# 查看网络
docker network ls
docker network inspect bridge
```

### 清理无用数据

```bash
docker system prune              # 清理停止的容器、无用镜像
docker system prune -a           # 清理所有无用数据
docker volume prune              # 清理无用数据卷
```

### 磁盘占用大

```bash
docker system df                 # 查看 Docker 磁盘使用
```
