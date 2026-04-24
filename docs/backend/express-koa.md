# Express & Koa

## 中间件概念

中间件就是一个函数，用来处理请求 `Request` 和响应 `Response` 之间的逻辑。

## Express vs Koa

| 特性 | Express | Koa |
|------|---------|-----|
| 中间件签名 | `function (req, res, next)` | `async function (ctx, next)` |
| 模型 | 回调链，中间件层级扁平 | async/await + 洋葱模型 |
| 异常处理 | 较繁琐 | try/catch 更优雅 |
| 注册方式 | `.use()` | `.use()` |
| 路由匹配 | `app.use(router)` | `app.use(router.routes())` |

## 注册中间件

Express 和 Koa 都通过 `.use()` 注册中间件（可以匹配任何路由）。

### Koa 示例

```javascript
app.use(async (ctx, next) => {
  console.log('全局中间件')
  await next()  // 继续执行下一个中间件
})
```

### Express 示例

```javascript
app.use((req, res, next) => {
  console.log('全局中间件')
  next()
})
```

### await next() 的作用

继续执行下一个中间件。Koa 的洋葱模型让 `next()` 前后都可以执行逻辑：

```javascript
app.use(async (ctx, next) => {
  console.log('进入 A')
  await next()
  console.log('返回 A')  // 所有后续中间件执行完后才回来
})

app.use(async (ctx, next) => {
  console.log('进入 B')
  await next()
  console.log('返回 B')
})

// 输出顺序：
// 进入 A
// 进入 B
// 返回 B
// 返回 A
```

## Express 与前端通信的传参方式

### 1. URL 参数（params）

**使用场景**：通常用于 GET 请求，参数直接附加在 URL 后。

```javascript
// 示例：/api/users?id=123&name=John

// 接收方式
app.get('/api/users', (req, res) => {
  const { id, name } = req.query  // 使用 req.query 接收
  res.json({ success: true, id, name })
})
```

### 2. 请求体（data）

**使用场景**：通常用于 POST 请求，数据放在请求体中（JSON 格式）。

```javascript
// 前端
uni.request({
  url: '/api/users',
  method: 'POST',
  data: { name: 'John', age: 30 },
})

// 接收方式
app.use(bodyParser.json())  // 解析 JSON 格式的请求体
app.post('/api/users', (req, res) => {
  const data = req.body  // 使用 req.body 接收
  res.json({ success: true, data })
})
```

### 3. Form-Data（表单/文件上传）

**使用场景**：上传文件或表单数据，使用 `multipart/form-data` 编码。

```javascript
// 前端
uni.uploadFile({
  url: '/api/upload',
  filePath: 'path/to/file.jpg',
  name: 'file',
  formData: { name: 'John' },
})

// 接收方式
const multer = require('multer')
const upload = multer({ dest: 'uploads/' })  // 配置上传目录

app.post('/api/upload', upload.single('file'), (req, res) => {
  const data = req.body    // 表单数据
  const file = req.file    // 上传的文件
  res.json({ success: true, data, fileUrl: file.path })
})
```

## 常用 Koa 模式

### 连接 MongoDB

```javascript
const conn = mongoose.createConnection(Key.ebuyDBUrl)
```

### 事务封装

```javascript
let session = await Transaction.startTransaction("ebuyDB")
try {
  // 业务逻辑
  await session.commitTransaction()
} catch (err) {
  await Transaction.rollbackTransaction(session)
}
```

### 响应封装

```javascript
return createResponse(Code.OK, "操作成功", { data })
return createResponse(Code.CONFLICT, '服务器异常，请稍后重试')
```
