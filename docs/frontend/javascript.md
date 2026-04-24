# JavaScript 基础

## 防抖和节流

**防抖（Debounce）**：触发后等待规定时间再执行，如果在这个时间内又触发了，重新开始计时。
- 应用场景：搜索框输入、按钮频繁点击、窗口 resize

**节流（Throttle）**：规定时间内只会执行一次，下一次触发要等时间段结束后才能再执行。
- 应用场景：窗口滚动、浏览器窗口大小调整、按钮频繁点击

### 防抖实现

```javascript
function debounce(fn, delay) {
  let timer = null
  return function (...args) {
    clearTimeout(timer)
    timer = setTimeout(() => {
      fn.apply(this, args) // 保留 this 和参数
    }, delay)
  }
}

// 使用
const btn = document.querySelector('button')
btn.addEventListener('click', debounce(log, 1000))
```

**为什么要用 apply 而不是 bind/call？**
- `apply`：最直观、无需处理参数格式
- `bind`：属于一次性绑定，第一次点击就绑死 this，后续无法更换
- `call`：功能类似 apply，但需要展开 args 数组，步骤多一步

**为什么要保留 this 和 args？**
因为 fn 是延迟执行的，如果不手动保存并传入，this 会变成 window 或 undefined，参数会丢失，导致回调执行错误。

### 节流实现

```javascript
function throttle(fn, delay) {
  let last = 0 // 上次触发的时间
  return function (...args) {
    const now = Date.now()
    if (now - last > delay) {
      last = now
      fn.apply(this, args)
    }
  }
}

// 使用
window.addEventListener('scroll', throttle(logScroll, 500))
```

## 数组常用方法

### sort 排序

```javascript
arr.sort((a, b) => {
  return b.quantity - a.quantity // 按 quantity 降序
})
```

- 返回值 < 0：a 排在 b 前面
- 返回值 > 0：b 排在 a 前面
- 返回值 = 0：顺序不变
- **sort 会直接修改原数组**

### reverse 倒序

将数组倒序排列。

### splice 增删改

```javascript
arr.splice(index, number, addobj)
// index: 从数组的什么位置开始操作
// number: 删除几个元素
// addobj: 要添加的新元素
```

### reduce 累积

```javascript
const numbers = [1, 2, 3, 4]
const sum = numbers.reduce((accumulator, currentValue) => {
  return accumulator + currentValue
}, 0) // 初始值 0
```

### every / some

```javascript
// every: 所有元素都满足条件才返回 true
x.ispacked = x.orders.every(e => e.status == 'packed')

// some: 只要有一个元素满足条件就返回 true
x.ispacked = x.orders.some(e => e.status == 'packed')
```

### find / findIndex / includes / indexOf

```javascript
// find: 返回首次出现的元素
const user = users.find(u => u.id === 1)

// findIndex: 返回首次出现的索引
const idx = users.findIndex(u => u.id === 1)

// includes: 返回布尔值
const exists = array.includes(value)

// indexOf: 返回首次出现的索引，找不到返回 -1
const index = array.indexOf(value)
```

## 字符串常用方法

### split 分割

```javascript
string.split(separator, limit)
// separator: 用于分割的字符串或正则
// limit: 限制返回数组的长度
```

### join 连接

```javascript
array.join(separator)
// 将数组转成字符串，用 separator 作为分隔符
```

### slice 提取

```javascript
const str = "Hello, world!"
str.slice(7)    // "world!"
str.slice(-6)   // "world!" 负数表示从末尾计数
```

### replace 替换

```javascript
str.replace("#", "$1,") // 将所有 # 替换成 $1,
```

## Math 常用方法

```javascript
Math.round(x)           // 四舍五入到最接近的整数
Math.round(x * 100) / 100  // 四舍五入到小数点后两位
Math.floor(x)           // 向下取整
Math.ceil(x)            // 向上取整
Math.random()           // 0（包括）到 1（不包括）之间的随机数
```

## 时间戳处理

```javascript
new Date().getTime()           // 当前时间戳
new Date().setHours(0, 0, 0, 0) // 当天零点时间戳
moment().valueOf()              // 当前时间戳（需要 moment 库）

// Date 对象
toDateString()  // 转成日期字符串，如 "Mon Oct 23 2023"
```

### Moment 库格式化

```javascript
moment(new Date()).format("YYYY-MM-DD HH:mm:ss")
```

### ISO 8601 日期

```
2026-01-07T16:00:00.000Z
表示的是：UTC 时间 2026 年 1 月 7 日 16:00:00
中国（UTC+8）对应本地时间：2026-01-08 00:00:00

T: Time（时间）的分隔符，用来区分「日期」和「时间」
Z: Zulu Time = UTC 时间，时区标识
```

## 浅拷贝 vs 深拷贝

### 浅拷贝

```javascript
const target = { a: 1, b: 2 }
const source = { b: 4, c: 5 }
const result = Object.assign(target, source)
// target 被修改了：{ a: 1, b: 4, c: 5 }
```

**特性**：
- 仅对第一层属性拷贝，对嵌套对象是浅拷贝（引用共享）
- 相同属性会被源对象覆盖
- 返回的是目标对象本身

### 深拷贝

```javascript
// 方式一：JSON 序列化（最简单，但丢失函数/Date/undefined）
const deepClone = JSON.parse(JSON.stringify(obj))

// 方式二：lodash
const _ = require('lodash')
const deepClone = _.cloneDeep(obj)
```

## 异步 vs 同步

- **同步**：任务按顺序执行，前一个没完成后面无法开始，会阻塞主线程
- **异步**：任务不阻塞程序，可以在后台执行，允许其他任务继续

**JavaScript 是单线程语言**，为了避免长时间阻塞，提供异步机制让任务可以在后台执行。

常见的异步操作：
1. 网络请求（fetch、XMLHttpRequest、axios）
2. 定时器（setTimeout、setInterval）
3. 文件读取（Node.js 的 fs.readFile）

## Promise

### 三种状态

1. **Pending**（待定）：初始状态，异步操作尚未完成
2. **Fulfilled**（已完成）：操作成功完成，并返回结果
3. **Rejected**（已拒绝）：操作失败，返回错误信息

### then / catch

```javascript
promise
  .then(result => { /* 成功回调 */ })
  .catch(error => { /* 失败回调 */ })
```

### 链式调用（避免回调地狱）

```javascript
// ❌ 传统回调地狱
getUser(function(user) {
  getPosts(user.id, function(posts) {
    getComments(posts[0].id, function(comments) {
      console.log('评论内容：', comments)
    })
  })
})

// ✅ Promise 链式调用
getUser()
  .then(user => getPosts(user.id))
  .then(posts => getComments(posts[0].id))
  .then(comments => console.log('评论内容：', comments))
  .catch(error => console.error('出错了：', error))
```

### Promise.all vs Promise.race

```javascript
// Promise.all: 所有 Promise 都成功才成功，一个失败就失败
Promise.all([p1, p2, p3]).then(results => { ... })

// Promise.race: 谁先完成（成功或失败）就返回谁的结果
Promise.race([p1, p2, p3]).then(result => { ... })
```

## 正则表达式

### 元字符

| 字符 | 含义 |
|------|------|
| `.` | 匹配任意单个字符（除换行符） |
| `^` | 字符串开头 |
| `$` | 字符串结尾 |
| `[]` | 字符集合，如 `[aeiou]` |
| `\|` | 或关系，如 `cat\|dog` |
| `()` | 分组 |

### 字符类

| 字符 | 含义 |
|------|------|
| `\d` | 数字 `[0-9]` |
| `\D` | 非数字 |
| `\w` | 字母、数字、下划线 `[a-zA-Z0-9_]` |
| `\W` | 非 \w |
| `\s` | 空白字符（空格、Tab、换行） |
| `\S` | 非空白字符 |

### 量词

| 量词 | 含义 |
|------|------|
| `*` | 零次或多次 |
| `+` | 一次或多次 |
| `?` | 零次或一次 |
| `{n}` | 恰好 n 次 |
| `{n,}` | 至少 n 次 |
| `{n,m}` | n 到 m 次 |

### 边界

| 字符 | 含义 |
|------|------|
| `^` | 匹配字符串开头 |
| `$` | 匹配字符串结尾 |
| `\b` | 单词边界 |
| `\B` | 非单词边界 |

### 标志

- `i`：不区分大小写
- `g`：全局匹配
- `m`：多行模式

### 常用方法

```javascript
const regex = /hello/i
regex.test(str)        // 测试是否匹配，返回布尔值
str.match(regex)        // 返回匹配结果数组
str.replace(regex, "hi") // 替换匹配内容
regex.exec(str)         // 返回匹配结果及详细信息
```

## URL 编码

```javascript
encodeURIComponent(str) // 对特殊字符编码，防止请求失败
decodeURIComponent(str) // 解码还原
```

**使用场景**：
- 构建查询字符串时，对每个参数值进行编码
- 避免特殊字符导致请求失败

## 与 Node.js 通信的传参方式

### 1. URL 参数（params）

```javascript
// 前端
GET /api/users?id=123&name=John

// 后端（Express）
app.get('/api/users', (req, res) => {
  const { id, name } = req.query
})
```

### 2. 请求体（body）

```javascript
// 前端
uni.request({
  url: '/api/users',
  method: 'POST',
  data: { name: 'John', age: 30 },
})

// 后端
app.use(bodyParser.json())
app.post('/api/users', (req, res) => {
  const data = req.body
})
```

### 3. Form-Data（文件上传）

```javascript
// 前端
uni.uploadFile({
  url: '/api/upload',
  filePath: 'path/to/file.jpg',
  name: 'file',
  formData: { name: 'John' },
})

// 后端
const multer = require('multer')
const upload = multer({ dest: 'uploads/' })
app.post('/api/upload', upload.single('file'), (req, res) => {
  const data = req.body
  const file = req.file
})
```

## 原生事件监听

### addEventListener（推荐）

```javascript
element.addEventListener(event, handler, options)
// event: 事件类型
// handler: 回调函数
// options: 是否冒泡、捕获、只执行一次
```

### on 写法

```javascript
element.onclick = fn
window.onload = fn
window.onresize = fn
```

### 常用事件

**鼠标事件**
- `click`、`dblclick`、`mousedown`、`mouseup`
- `mouseover`、`mouseout`、`mousemove`
- `mouseenter`、`mouseleave`（不冒泡）
- `contextmenu`（右键点击）

**键盘事件**
- `keydown`、`keyup`

**文档事件**（通过 window 调用）
- `DOMContentLoaded`：HTML 解析完成
- `load`：所有资源加载完成
- `unload`：文档卸载
- `beforeunload`：用户尝试离开页面
- `resize`：窗口尺寸变化
- `scroll`：滚动

## 事件修饰符

```vue
@click.stop    // 阻止事件冒泡
```

### click vs tap

- `click`：标准浏览器事件，鼠标点击触发
- `tap`：移动端触摸屏专用事件

## ECharts 使用

```html
<script src="https://cdn.jsdelivr.net/npm/echarts@5.3.1/dist/echarts.min.js"></script>
```

```javascript
const chartDom = document.querySelector('#my-id')
const myChart = echarts.init(chartDom)

const option = {
  xAxis: { data: ['A', 'B', 'C', 'D', 'E'] },
  yAxis: {},
  series: [{
    name: '销量',
    type: 'bar',
    data: [5, 20, 36, 10, 10],
  }],
}

myChart.setOption(option)
```

## 其他小知识

### NaN

- 类型为 `number`，表示计算错误或无效数字运算
- `NaN` 和任何值都不相等，**包括它自身**

### 数组解构

```javascript
const [first, second] = [1, 2] // first=1, second=2
const [sheet] = xlsx.parse(buffer) // 取第一项
```

### localeString（千分制）

```javascript
(1234567).toLocaleString() // "1,234,567"
```

### toFixed（小数位）

```javascript
(3.14159).toFixed(2) // "3.14"
```

### 格式化数字（去除多余零）

```javascript
function formatNumber(qty) {
  const n = Number(qty.toFixed(2))
  if (Number.isInteger(n)) return n
  const n1 = Number(n.toFixed(1))
  if (n1 === n) return n1
  return n
}

formatNumber(3.0)    // 3
formatNumber(3.10)   // 3.1
formatNumber(3.14)   // 3.14
```

### 函数和方法的区别

- **函数**：一个独立的代码块
- **方法**：属于某个对象的函数

### 语义化标签

HTML 中有明确意义的标签，通过名称表达页面内容的功能和结构。

常见：`<header>`、`<section>`、`<nav>`、`<footer>`、`<article>`、`<aside>`
