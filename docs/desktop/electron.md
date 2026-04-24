# Electron 上手指南

## Electron 介绍

用 Web 技术（HTML/CSS/JS）开发跨平台桌面应用的框架，由 GitHub 开源。一套代码打包成 Windows（.exe）、macOS（.dmg）、Linux（.deb）三端原生应用。

**底层**：Chromium（浏览器内核）+ Node.js 的组合
- Chromium 提供 UI 渲染能力（把浏览器封装进桌面 App）
- Node.js 提供文件系统、网络、原生 API 调用能力

## 核心架构（三进程模型）

```
┌─────────────────────────────────────────┐
│ 主进程 main.js                          │
│ - Node.js 环境                          │
│ - 创建窗口 (BrowserWindow)              │
│ - 调用系统 API（文件/打印机/串口）        │
│ - 管理 App 生命周期                     │
│ - 每个 App 只有一个                      │
└──────────────┬──────────────────────────┘
               │ IPC 通信
               ▼
┌─────────────────────────────────────────┐
│ 预加载 preload.js                       │
│ - 主进程和渲染进程的"安全桥梁"           │
│ - 用 contextBridge 暴露白名单方法       │
└──────────────┬──────────────────────────┘
               ▼
┌─────────────────────────────────────────┐
│ 渲染进程 (Vue / HTML)                   │
│ - Chromium 浏览器环境                   │
│ - 负责 UI 展示和用户交互                 │
│ - 通过 window.electron.xxx 调主进程     │
│ - 每个 BrowserWindow 一个渲染进程        │
└─────────────────────────────────────────┘
```

**一句话记住**：主进程干脏活（系统 API），渲染进程管 UI，preload 是他俩之间的安检门。

## 从零搭建完整流程

### Step 1：创建项目

```bash
# 方案 A：基于 Vite + Vue（推荐）
npm create vite@latest my-app -- --template vue
cd my-app
npm install
npm install electron electron-builder vite-plugin-electron -D

# 方案 B：纯 HTML
mkdir my-app && cd my-app
npm init -y
npm install electron electron-builder -D
```

### Step 2：写主进程 main.js

```javascript
const { app, BrowserWindow, ipcMain, globalShortcut } = require('electron')
const path = require('path')

function createWindow() {
  const win = new BrowserWindow({
    width: 1200,
    height: 800,
    frame: false,  // 无边框（自定义标题栏）
    webPreferences: {
      preload: path.join(__dirname, 'preload.js'),
      nodeIntegration: false,    // 安全：不在渲染进程开 Node
      contextIsolation: true,    // 安全：上下文隔离
    },
  })

  // 开发模式加 Vite URL，生产加本地文件
  if (process.env.VITE_DEV_SERVER_URL) {
    win.loadURL(process.env.VITE_DEV_SERVER_URL)
  } else {
    win.loadFile('dist/index.html')
  }

  // 监听渲染进程发来的事件
  ipcMain.on('closeWindow', () => win.close())
  ipcMain.on('minWindow', () => win.minimize())

  // 双向调用（带返回值）
  ipcMain.handle('getPrinters', async () => {
    return await win.webContents.getPrintersAsync()
  })

  return win
}

// 单实例锁（防多开）
const gotLock = app.requestSingleInstanceLock()
if (!gotLock) {
  app.quit()
} else {
  app.whenReady().then(() => {
    createWindow()
    // 注册全局快捷键
    globalShortcut.register('ctrl+shift+i', () => {
      BrowserWindow.getFocusedWindow()?.webContents.openDevTools()
    })
  })
}

// Windows/Linux 所有窗口关闭时退出
app.on('window-all-closed', () => {
  if (process.platform !== 'darwin') app.quit()
})
```

### Step 3：写预加载 preload.js

```javascript
const { contextBridge, ipcRenderer } = require('electron')

contextBridge.exposeInMainWorld('electron', {
  // 单向发送：不需要返回值
  closeWindow: () => ipcRenderer.send('closeWindow'),
  minWindow: () => ipcRenderer.send('minWindow'),

  // 双向调用：需要返回值
  getPrinters: () => ipcRenderer.invoke('getPrinters'),

  // 监听主进程推送
  onUpdateWeight: (callback) => ipcRenderer.on('updateWeight', callback),
})
```

### Step 4：渲染进程里调用

```vue
<template>
  <div class="titlebar">
    <button @click="minimize">—</button>
    <button @click="close">×</button>
  </div>
  <div>
    打印机列表：
    <ul><li v-for="p in printers" :key="p.name">{{ p.name }}</li></ul>
  </div>
</template>

<script setup>
import { ref, onMounted } from 'vue'

const printers = ref([])

const minimize = () => window.electron.minWindow()
const close = () => window.electron.closeWindow()

onMounted(async () => {
  printers.value = await window.electron.getPrinters()
})
</script>
```

### Step 5：配置 package.json

```json
{
  "main": "electron/dist/main.js",
  "scripts": {
    "dev": "vite",
    "build": "vite build && electron-builder --win --x64"
  },
  "build": {
    "productName": "我的应用",
    "appId": "com.mycompany.myapp",
    "win": {
      "icon": "build/icon.ico",
      "target": ["nsis"]
    },
    "mac": {
      "icon": "build/icon.icns",
      "target": ["dmg"]
    },
    "directories": {
      "output": "release"
    }
  }
}
```

### Step 6：本地运行 & 打包

```bash
# 开发
npm run dev

# 打包
npm run build
# Windows 输出：release/我的应用 Setup 1.0.0.exe
# macOS 输出：release/我的应用-1.0.0.dmg
```

## 进阶功能

### 1. 串口通信（如连接电子秤）

```javascript
const { SerialPort } = require('serialport')

const port = new SerialPort({
  path: 'COM1',     // Windows 串口名
  baudRate: 1200,   // 波特率（电子秤常用 1200/9600）
  dataBits: 8,
  parity: 'none',
  stopBits: 1,
  autoOpen: false,
})

// 渲染进程请求打开串口
ipcMain.on('openSerialPort', () => {
  port.open(err => {
    if (err) win.webContents.send('updateWeight', 'error')
  })
})

// 串口有数据时推给渲染进程
port.on('data', data => {
  const weight = parseFloat(data.toString())
  win.webContents.send('updateWeight', weight)
})
```

### 2. Python 子进程（如打印机驱动）

```javascript
const { exec, execFile } = require('child_process')
const path = require('path')

function startPythonServer() {
  const pyPath = path.join(process.resourcesPath, 'printer.exe')
  execFile(pyPath, { windowsHide: true }, (err) => {
    if (err) console.error('Python 启动失败:', err)
  })
}

app.whenReady().then(() => {
  startPythonServer()
  createWindow()
})

// 退出时清理 Python 进程
app.on('window-all-closed', () => {
  exec('taskkill /f /t /im printer.exe')
  app.quit()
})
```

**配套打包配置**：

```json
"build": {
  "extraResources": [
    { "from": "dist/printer.exe", "to": "printer.exe" }
  ]
}
```

### 3. 自动更新

```javascript
const { autoUpdater } = require('electron-updater')

app.whenReady().then(() => {
  createWindow()
  autoUpdater.checkForUpdatesAndNotify()
})

autoUpdater.on('update-available', () => {
  console.log('有新版本')
})

autoUpdater.on('update-downloaded', () => {
  autoUpdater.quitAndInstall()
})
```

配套的 `package.json`：

```json
"build": {
  "publish": [{
    "provider": "generic",
    "url": "https://your-server.com/updates/"
  }]
}
```

### 4. 无边框自定义标题栏

```javascript
const win = new BrowserWindow({
  frame: false,  // 关键：无系统标题栏
})
```

渲染进程自己画标题栏：

```html
<div class="titlebar" style="-webkit-app-region: drag;">
  <span>我的应用</span>
  <div style="-webkit-app-region: no-drag;">
    <button onclick="window.electron.minWindow()">—</button>
    <button onclick="window.electron.closeWindow()">×</button>
  </div>
</div>
```

- `-webkit-app-region: drag`：让区域可以拖动窗口
- `-webkit-app-region: no-drag`：里面的按钮要排除，否则无法点击

### 5. Splash 启动画面

```javascript
const splash = new BrowserWindow({
  width: 400,
  height: 400,
  frame: false,
  transparent: true,
  show: false,
})

splash.on('ready-to-show', () => {
  if (!splash.isDestroyed()) splash.show()
})

win.on('ready-to-show', () => {
  setTimeout(() => {
    if (!splash.isDestroyed()) splash.close()
    win.show()
  }, 1000)
})

splash.loadFile('splash.html')
```

### 6. 开机自启

```javascript
app.setLoginItemSettings({
  openAtLogin: true,
})
```

### 7. 全局快捷键

```javascript
// 屏蔽 F11
globalShortcut.register('F11', () => {})

// 自定义调试工具快捷键
globalShortcut.register('ctrl+t', () => {
  mainWindow.webContents.openDevTools()
})
```

### 8. 打印机列表

```javascript
ipcMain.handle('getPrinters', async () => {
  return await win.webContents.getPrintersAsync()
})
```

### 9. 获取 WiFi 名称

```javascript
const wifiName = require('wifi-name')

ipcMain.handle('getWifiName', async () => {
  return await wifiName()
})
```

## IPC 通信两种模式

### 单向（send / on）

```javascript
// 渲染进程
ipcRenderer.send('channel', data)

// 主进程
ipcMain.on('channel', (event, data) => {
  // 处理...
})
```

### 双向 Promise（invoke / handle）

```javascript
// 渲染进程
const result = await ipcRenderer.invoke('channel', data)

// 主进程
ipcMain.handle('channel', async (event, data) => {
  return result
})
```

## 完整打包发布 SOP

```bash
# 1. 配置图标（放到 build/ 目录）
# - Windows: build/icon.ico (256x256)
# - macOS: build/icon.icns
# - Linux: build/icon.png

# 2. 更新版本号（package.json）
# "version": "1.0.0" → "1.0.1"

# 3. 打包 Windows
npm run build -- --win --x64

# 4. 打包 macOS（需要在 Mac 上打）
npm run build -- --mac --dmg

# 5. 代码签名（可选）
# Windows: 用 EV 代码签名证书
# macOS: codesign + notarytool

# 6. 发布
# - 传到公司 FTP / 内部服务器
# - 如果用 electron-updater，服务器路径要和 package.json 的 publish.url 一致
```

## macOS 代码签名 + Apple 公证流程

### 1. 打包 .app 并生成 .dmg

```bash
# electron-builder 或 UniApp 云打包生成 .app
# 用 create-dmg 或 hdiutil create 打成 .dmg 镜像
```

### 2. 代码签名

```bash
codesign --deep --force --options runtime \
  --sign "Developer ID Application: 公司名 (TeamID)" \
  YourApp.app
```

- 用 Apple 开发者账号的 Developer ID Application 证书
- `--options runtime` 启用 hardened runtime（公证必需）

### 3. 打 dmg 再签名

```bash
codesign --sign "Developer ID Application: ..." YourApp.dmg
```

### 4. Apple 公证

```bash
xcrun notarytool submit YourApp.dmg \
  --apple-id xxx@xxx.com \
  --team-id TEAMID \
  --password app-specific-password \
  --wait
```

等待 Apple 扫描通过（几分钟到几小时）。

### 5. 公证钉附

```bash
xcrun stapler staple YourApp.dmg
```

把公证结果"钉"到 .dmg 里，离线也能验证。

### 6. 验证

```bash
spctl -a -t open --context context:primary-signature YourApp.dmg
```

## 常见坑

| 坑 | 表现 | 解决 |
|----|------|------|
| 渲染进程报 `require is not defined` | nodeIntegration: true + contextIsolation: false（旧写法）| 改用 preload + contextBridge |
| 打包后白屏 | 资源路径错误 | 检查 main.js 里 loadFile 的相对路径 |
| 包体积超大（>200MB）| node_modules 全被打进去 | 改 package.json 的 dependencies vs devDependencies |
| 打包慢 | 每次全量打包 | 缓存 node_modules，CI 里加 cache |
| 串口找不到 | Windows 权限问题 | 以管理员身份运行 |
| macOS 打开被拦截 | 没签名 / 没公证 | 走 codesign + notarytool 流程 |
| 自动更新报错 | 证书校验失败 | 开发阶段用 `dev-app-update.yml` 跳过 |

## 包体积优化

1. **asar 打包压缩代码**（electron-builder 默认开启）
2. **移除不需要的 locales**
3. **node_modules 只保留生产依赖**（`npm install --production`）
4. **v8 snapshot 加速启动**
5. **大资源放 extraResources 外置**，不打进包里
