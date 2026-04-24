# 发测试流程

## 后台发测试

```
1. 修改 env.development 和 env.staging 的版本号
2. 终端打包：npm run build:staging
3. 进入 dist 目录 → 压缩 → 最后上传至后台
```

## 员工端和客户端 H5 发测试

```
1. 修改 dev 测试版本号
2. 点击导航栏的"发行" → 网站 PC
3. 进入打包好的文件夹 → 压缩 → 最后上传至后台
```

## App 打包

```
1. pro 文件版本更改（manifest.json 里 versionName 和 versionCode）
2. 制作应用 wgt 包（HBuilderX 发行 → 原生 App - 制作应用 wgt 包）
3. 进入打包好的文件夹 → 将 wgt 文件上传至后台
```

## NestJS 发测试流程

NestJS 需要先 `npm run build` 编译 TS 到 dist 目录，然后重启容器才能加载新代码。

```bash
ssh user@测试服务器IP
docker exec -it coreserver sh
cd /server && npm run build
exit
```

连接公司内网测试服务器时需要**关闭 VPN/代理**。

## 本地测试服务端代码

- URL 不能包含 `/core/api` 或 `/retail/api` 等结构

## 服务端使用正式数据

- 端口需要改成 `3001`
- 需要**关闭代理**

## 服务端发测试

```
1. 进入 Projects 文件
2. 找到对应的服务
3. 找到对应文件夹 → 替换
4. 进入 docker → 找到对应服务 → 点击 Restart 重置
```

## 常见问题与注意事项

### 连接测试服务器前要关闭代理

连接公司内网测试服务器前，必须关闭 VPN/代理，否则可能无法访问。

### 版本号管理

每次发测试前都要**更新版本号**，便于：
- 团队内跟踪当前测试是哪一版
- 定位 bug 对应的代码版本
- 避免缓存问题（客户/员工端强制拉新版）

### 打包后的压缩

打包完 dist 目录后需要压缩成 zip 上传，上传压缩文件比单个文件更快更可靠。
