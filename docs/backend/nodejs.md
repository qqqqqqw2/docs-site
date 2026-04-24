# Node.js & Mongoose

## 基础概念

### 导入导出

```javascript
// CommonJS
module.exports = ...    // 导出给别人用
const x = require(...)  // 从别人那里导入
```

### 环境变量

```javascript
const env = process.env.NODE_ENV
// NODE_ENV 值来自启动 Node 程序时传入的环境变量
```

### ObjectId

```javascript
const ObjectId = mongoose.Schema.Types.ObjectId
```

`ObjectId` 是 MongoDB 内部的特殊类型，保证全局唯一性，用来定义文档的 key。

### 概念对应

| MongoDB | SQL | 说明 |
|---------|-----|------|
| 集合（Collection）| 表 | 一组文档 |
| 文档（Document）| 行 | 一条记录 |

## 连接数据库

```javascript
const conn = mongoose.createConnection(Key.ebuyDBUrl)
```

## 事务（Transaction）

**定义**：数据库中保证多步操作要么全部成功、要么全部失败的机制。

### 事务流程

```javascript
// 1. 创建会话
let session = ebuyConn.startSession()

// 2. 开启事务
session.startTransaction()

try {
  // 3. 所有写操作带 { session }
  await Model.create(data, { session })
  await Model.updateOne(query, update, { session })

  // 4. 提交事务
  await session.commitTransaction()
} catch (err) {
  // 5. 失败则回滚
  await session.abortTransaction()
} finally {
  // 6. 释放资源
  await session.endSession()
}
```

### 关键点

**MongoDB 事务必须基于 session 执行。**

任何带 `session` 的数据库写操作（`create`、`update`、`delete`）：
- 不会立即真实写入数据库
- 而是保存到**事务缓冲区**
- 等事务 `commit()` 后才真正落库
- 事务 `abort()` 就全部取消

### 加入事务的写法

```javascript
Model.create(data, { session })
Model.updateOne(query, update, { session })
Model.deleteOne(query, { session })
doc.save({ session })
```

### 完整示例

```javascript
let session = await Transaction.startTransaction("ebuyDB")
try {
  let changeQuantity = quantity - ifExit.stock
  let goodStockRecordPayload = {
    scope: 'inventory',
    retailGood: id,
    createdBy: user._id,
  }
  goodStockRecordPayload.type = changeQuantity > 0 ? 'in' : 'out'
  goodStockRecordPayload.change = Math.round(changeQuantity * 100) / 100

  if (quantity || quantity == 0) {
    let goodInfo = await RetailGood.findOneAndUpdate(
      { _id: id },
      { $set: { stock: quantity } }, // 更新必须用 $set 否则会替换整个文档
      { session, new: true }           // new: true 返回更新后的数据
    )
    goodStockRecordPayload.stockQuantity = Math.round(goodInfo.stock * 100) / 100
  } else {
    await RetailGood.deleteOne({ _id: id }, { session })
    goodStockRecordPayload.stockQuantity = 0
  }

  let newStockRecord = new RetailGoodStockRecord(goodStockRecordPayload)
  await newStockRecord.save({ session })

  await Transaction.commitTransaction(session)

  let newGood = await RetailGood.findById(id).lean()
  return createResponse(Code.OK, "盘点成功", { stock: newGood.stock })
} catch (error) {
  console.log(error)
  await Transaction.rollbackTransaction(session)
  return createResponse(Code.CONFLICT, '服务器异常，请稍后重试')
}
```

## Mongoose 三大核心概念

| 名称 | 作用 | 类比 |
|------|------|------|
| **Schema**（架构） | 定义字段结构、类型、验证规则 | 表结构（数据库字段定义） |
| **Model**（模型） | 对数据库执行 CRUD 的类 | ORM 模型对象 |
| **Document**（文档） | 每一条数据记录 | 数据库表中的一行 |

### Schema 定义

```javascript
const mongoose = require("mongoose")
const ObjectId = mongoose.Schema.Types.ObjectId

const Schema = mongoose.Schema({
  nameCn: { type: String, required: true },
  address: String,
  isOpen: { type: Boolean, default: true },
  manager: { type: ObjectId, ref: "User" },
  createdAt: { type: Date, default: Date.now },
})
```

### Model CRUD

```javascript
// ============ 查找 ============
Canteen.find()                              // 查多个文档（返回数组）
Canteen.find({ warehouse, status: 'enabled', type: 'A' })  // 匹配多个字段
Canteen.findById(id)                        // 根据 _id 查
Canteen.findOne({ name: 'xxx' })            // 查单个文档（返回对象）

// 字段筛选
Canteen.find().select('name address')        // 只要 name, address
Canteen.find().select('-password')           // 排除 password

// 排序
Canteen.find().sort({ createdAt: -1 })       // 倒序

// 分页
Canteen.find()
  .skip(10)   // 跳过 10 条
  .limit(10)  // 取 10 条

// ============ lean vs 普通查询 ============
Canteen.find().lean()   // 返回普通 js 对象（性能更好）
Canteen.find()          // 返回 Mongoose 文档对象（有 save、validate 等方法）

// 统计
Canteen.countDocuments()

// ============ 创建 ============
Canteen.create({ nameCn: 'xxx' })

// ============ 更新 ============
// updateOne 只能修改
Canteen.updateOne({ _id }, { nameCn: '新名字' })

// findOneAndUpdate 返回更新后的数据
Canteen.findOneAndUpdate(
  { _id: id },                   // 参数1：查询条件
  { stock: quantity },            // 参数2：更新数据
  { session, new: true }          // 参数3：配置项（new: true 返回最新数据）
)

// ============ 删除 ============
Canteen.deleteOne({ _id })

// ============ 关联查询 ============
Canteen.find().populate("manager")

// ============ Document 操作 ============
const doc = new Canteen(payload)
await doc.save()

// ============ 批量操作 ============
await Canteen.insertMany([payload1, payload2])
await Canteen.deleteMany({ itemCode: "A001" })
await Canteen.updateMany(
  { quantity: 0 },
  { $set: { disabled: true } }
)
```

### Document 操作

```javascript
await doc.save()              // 新增或修改文档
await doc.remove()            // 删除文档
let obj = doc.toObject()      // 文档转普通对象
ctx.body = doc.toJSON()       // 序列化为 JSON 返回接口
await doc.populate('owner')   // 填充关联字段（类似 JOIN）
doc.validate()                // 验证字段是否符合 Schema 规则
doc.isModified()              // 判断某字段是否被修改过
```

## populate 关联查询

```javascript
populate("invoice")  // 简单形式
populate({
  path: 'invoice',     // 关联字段名
  select: 'name',      // 返回哪些字段
  match: { ... },      // 过滤条件
  options: { ... },    // 排序、限制
  populate: { ... },   // 多级关联
})
```

## MongoDB 查询操作符

### 比较类

| 操作符 | 作用 | 示例 |
|--------|------|------|
| `$eq` | 等于 | `{ age: { $eq: 18 } }` |
| `$ne` | 不等于 | `{ age: { $ne: 18 } }` |
| `$gt` | 大于 | `{ price: { $gt: 100 } }` |
| `$gte` | 大于等于 | `{ price: { $gte: 100 } }` |
| `$lt` | 小于 | `{ price: { $lt: 100 } }` |
| `$lte` | 小于等于 | `{ price: { $lte: 100 } }` |
| `$in` | 在列表中 | `{ id: { $in: [...] } }` |
| `$nin` | 不在列表中 | `{ id: { $nin: [...] } }` |

### 逻辑类

| 操作符 | 作用 |
|--------|------|
| `$or` | OR 条件 |
| `$and` | AND 条件 |
| `$not` | 取反 |
| `$nor` | 所有条件都不满足 |

```javascript
{ $or: [条件1, 条件2, 条件3] }
```

### 特殊操作符

| 操作符 | 作用 |
|--------|------|
| `$inc` | 原子自增/自减 |
| `$exists` | 字段是否存在 |
| `$set` | 设置字段值 |

```javascript
// $inc 自增
if (vaildQuantity = 5) {
  // quantity = quantity - 5
  { $inc: { quantity: -vaildQuantity } }
}

// $exists
{ field: { $exists: true } }
```

### 正则相关

| 操作符 | 作用 | 示例 |
|--------|------|------|
| `$regex` | 模糊查询 | `{ nameCn: { $regex: search, $options: 'i' } }` |
| `$options` | 正则选项 | `"i"` 忽略大小写 |

### 数组类

| 操作符 | 作用 |
|--------|------|
| `$size` | 数组长度 |
| `$all` | 数组包含所有指定值（类似 every）|
| `$elemMatch` | 数组元素符合条件（类似 some），数组+对象必须用这个 |

## aggregate 聚合管道

**使用场景**：只要条件依赖关联表或数组，就一定会用到 `aggregate`。

**核心规则**：凡是依赖 `$lookup` 出来的字段，一律在 `$lookup` 之后处理。

### 常用 6 个阶段

#### $match 筛选

从集合中挑出符合条件的文档，类似 SQL 的 WHERE。

```javascript
{ $match: { status: 'active' } }
```

#### $lookup 关联

MongoDB 的"左连接"，把另一张表的数据拉进来（类似 SQL 的 LEFT JOIN）。结果永远是数组。

```javascript
{
  $lookup: {
    from: 'suppliersnapshot',           // 被关联的集合名
    localField: 'supplierSnapshot',     // 当前集合的字段，存的是被关联集合的引用值
    foreignField: '_id',                 // 用来和 localField 对比
    as: 'supplierSnapshot',              // 结果字段名
  },
}
```

#### $unwind 拆数组

把数组字段拆成多条文档，每个元素一条（类似 SQL 的 JOIN + UNNEST）。

```javascript
// 拆前：
{
  _id: 1,
  supplierSnapshot: [
    { name: "Tom", age: 18 },
    { name: "Jerry", age: 20 }
  ]
}

// $unwind 操作：
{
  $unwind: {
    path: '$supplierSnapshot',             // 需要拆的数组字段
    preserveNullAndEmptyArrays: true,       // 保证没匹配到的行还在
  },
}

// 拆后：
{ _id: 1, supplierSnapshot: { name: "Tom", age: 18 } }
{ _id: 1, supplierSnapshot: { name: "Jerry", age: 20 } }
```

#### $group 分组统计

按某个规则分组并做统计计算（相当于 SQL 的 GROUP BY）。

```javascript
{
  $group: {
    _id: '$category',
    total: { $sum: '$amount' },
  },
}
```

#### $addFields 添加字段

在每条文档里添加或修改字段（类似 SQL 的 SELECT ... AS newField）。

```javascript
// 原集合：
{
  _id: 1,
  isPrepaid: true,
  expectedOn: ISODate("2026-01-20"),
  batches: [
    { expectedOn: ISODate("2026-01-18") },
    { expectedOn: ISODate("2026-01-22") }
  ]
}

// $addFields 操作：
{
  $addFields: {
    effectiveExpectedOn: {
      $cond: {
        if: '$isPrepaid',
        then: { $min: '$batches.expectedOn' },  // 拿数组中最早的日期
        else: '$expectedOn',
      },
    },
  },
}

// 结果：
{
  _id: 1,
  isPrepaid: true,
  expectedOn: ISODate("2026-01-20"),
  batches: [...],
  effectiveExpectedOn: ISODate("2026-01-18"),  // 新字段
}
```

#### $project 控制输出

决定最终输出哪些字段，可重命名或计算（类似 SQL 的 SELECT field1, field2 AS alias）。

#### $sort 排序

```javascript
{ $sort: { createdAt: -1 } }
```

### 其他聚合操作符

#### $cond 三元运算符

```javascript
{ $cond: { if: <条件>, then: <值1>, else: <值2> } }
```

#### 复杂嵌套判断

```javascript
// 判断数组是否非空
{ $gt: [{ $size: { $ifNull: ["$goods.unDeliverOns", []] } }, 0] }

// 拆解：
// 第一层：$ifNull[变量, []] 判断变量是否为空，为空则用空数组
// 第二层：$size{变量} 判断数组长度
// 第三层：$gt:[变量1, 变量2] 判断变量1是否大于变量2
```

#### $reduce 归约

```javascript
{
  $reduce: {
    input: "$goods.unDeliverOns",  // 需要操作的数组
    initialValue: "",               // 初始值
    in: { ... },                    // 每一项返回的结果
  },
}
```

### 其他常用方法

```javascript
.exec()             // 真正把请求发给 MongoDB 执行
concat              // 数组连接
newPos.push(...copies)  // 展开数组
```

## Studio 3T 查询技巧

### 通过 ID 查询

```javascript
db.getCollection("canteen").find({
  _id: ObjectId("691af1050a3e54698402c093")  // 必须包 ObjectId
})
```

### 字段是否存在

```javascript
{ field: { $exists: true } }
```

### 更新语句

```javascript
db.collection.updateOne(
  { _id: ObjectId("xxx") },
  { $set: { name: "A" } }
)
```

### 日期查询

```javascript
{
  startAt: {
    $gte: ISODate("2026-03-01T00:00:00Z")
  }
}
```

### 关联表查询必须用管道

```javascript
db.order.aggregate([
  { $lookup: { ... } }
])
```

## Excel 读写

### 读 Excel

```javascript
const excelBuffer = await rp({
  uri: retailGoodSales.link,  // 本地路径或服务器路径
  method: 'GET',
  encoding: null,
})
const [sheet] = xlsx.parse(excelBuffer)
```

**注意**：
- `xlsx.parse(excelBuffer)` 返回的是数组（因为一个 xlsx 可能有多个 Sheet）
- 解构 `const [sheet] = ...` 等价于 `xlsx.parse(...)[0]`

### 写 Excel

```javascript
const fs = require('fs')        // Node.js 自带文件系统模块
const path = require('path')    // 处理文件路径的工具

// xlsx.build 返回的不是路径或字符串，而是 Buffer
const buffer = xlsx.build([
  { name: "sheetName", data: excelDataMap },
])

// __dirname 是当前文件所在物理目录
const filePath = path.join(__dirname, `../../../static/productExcel/${fileName}`)
fs.writeFileSync(filePath, buffer)
```

**分工**：
- `xlsx.build` 负责"造文件"
- `fs.writeFileSync` 负责"落地文件"

### ExcelJS 库

```javascript
const ExcelJS = require('exceljs')

const workbook = new ExcelJS.Workbook()
const worksheet = workbook.addWorksheet("Sheet 名称")
worksheet.addRow([])  // 插入一行内容
await workbook.xlsx.writeFile("test.xlsx")
```

## 分布式锁（拿锁机制）

**核心目的**：防止同一份数据在同一时间被多个人同时修改。

```javascript
async getLock(usage, user) {
  try {
    let index = 0

    let retry = async (usage, user) => {
      // 最多询问 2000 次，每次间隔 10ms
      // 实际效果 2000 × 10ms = 20 秒
      if (index >= 2000) {
        return false
      }

      // 真正拿锁的地方
      const msgOptions = {
        uri: `${Key.goRedisUrl}/lock/${usage}/${user}`,
        method: 'GET',
        json: true,
      }
      let res = await rp(msgOptions)

      // 判断是否拿到锁
      if (res && res.ok) {
        return true
      } else {
        index++
        await new Promise(resolve => setTimeout(resolve, 10))  // 延迟 10ms
        return await retry(usage, user)
      }
    }

    let lock = await retry(usage, user)
    return lock
  } catch (error) {
    console.error('Error in getLock:', error)
    return false
  }
}
```

### 轮询锁流程

```
没拿到 → 等 10ms → 再问一次 → 拿到 / 继续等
```

## 数据库表关键记录

### 库存相关

| 表 | 说明 |
|----|------|
| `RealProduct` | 收货的实际库存（批次维度）|
| `Stock` | 货位维度的库存 |
| `StockRecord` | 库存记录 |
| `CollectOrderItem` | PO 收货入库后产生的数据 |
| `ProductGroup` | 领货模板 |
| `SaleOrder` | 领货单 |
| `GoodLowestPrice` | 商品最低售价 |

### RealProduct 和 Stock 关系

**RealProduct 是收货（采购入库）时创建的，代表一批实体商品：**
- 每次采购收货 → 生成一个 RealProduct，分配唯一 `itemCode`（批次码）
- 记录这批货：是什么商品、从哪个采购单来的、生产日期、保质期、总数量
- `quantity` = 这批货不管放在哪里，一共还剩多少

**Stock 是货位维度的库存：**
- `shelf + itemCode` 组合 → 某货位上这批货放了多少
- 同一批货（同一 itemCode）可以分散在多个货位 → 对应多条 Stock 记录

**关系**：
```
RealProduct.quantity ≈ Σ Stock.quantity（where itemCode 相同）
```

### realProducts 什么时候会有多条数据？

当采购时录入了多个保质期，**并且填写了货柜号**的情况。

### 寄售订单

- `ConsigneeOrder`：寄售订单表（订单层面）
- `ConsigneeOrderProcessing`：配单流程记录表，关联某个订单，记录谁配的、开始和结束时间

**注意**：一个订单可能对应多条记录，因为每次换配单员，旧的虽然失效但依然存在。
