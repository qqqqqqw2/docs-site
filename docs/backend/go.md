# Go 语言

## BSON 相关

### bson.M vs bson.D

- **bson.M**：map（键值对，**无序**），字段顺序不保证
- **bson.D**：slice/数组（**有序**的键值对列表），字段顺序会保留

```go
bson.M{
  key: value,
}

bson.D{
  key: val,
  value: val,
}
```

**什么时候用 bson.D**：复合索引查询字段顺序有要求时。

### BSON vs JSON

**1. 类型更丰富**

- **JSON**：只有字符串、数字、布尔、数组、对象、null
- **BSON** 额外支持：
  - `ObjectId`（MongoDB 主键）
  - `Date`（真正的日期类型）
  - `Binary`
  - `Decimal128`
  - `Timestamp`
  - `Regex`
  - `MinKey` / `MaxKey`

**2. 存储方式**

- **JSON**：纯文本
- **BSON**：二进制，解析更快，类型更明确

**3. 实例对比**

```
// JSON
{
  "_id": "66f1c5d2...",
  "deliverOn": 1700000000000
}

// BSON
{
  _id: ObjectId("66f1c5d2..."),
  deliverOn: Date("2024-10-05T00:00:00Z")
}
```

**结论**：
- JSON 可读性更高
- BSON 数据可以用
- 在 Go 里用 `bson.D` 就是为了生成 MongoDB 可识别的 BSON 文档

## 切片 vs 数组

- **数组（array）**：长度固定，值类型的一部分
- **切片（slice）**：动态长度，更常用，底层指向数组

```go
nums := []int{3, 1, 2}
sort.Ints(nums)
// nums 变成 [1, 2, 3]
```

**语法拆解**：
- `[]int`：表示"int 的切片类型"，`[]` 表示切片，`int` 是元素类型
- `{3, 1, 2}`：切片的初始元素
- `:=`：Go 的"短变量声明"，相当于 `var nums = ...`

## Go 函数结构

```go
func (s *CutService) CutOrderItem(data []OrderItemDto) error {
  // ...
}
```

拆解：

| 部分 | 含义 |
|------|------|
| `func` | 关键字，表示定义函数 |
| `(s *CutService)` | 接收者，`s` 等价于 JS 里的 this；`*CutService` 表示指针类型，意思是这个函数**绑定在 CutService 结构体上** |
| `CutOrderItem` | 函数名 |
| `(data []OrderItemDto)` | 参数列表，`data` 是 `OrderItemDto` 的切片 |
| `error` | 返回值类型 |

## 查询数据对比：Go vs NestJS

### NestJS

```typescript
this.sortingCenterModel.find({}).lean()
```

### Go

```go
var sortingCenter []models.SortingCenter
_ = database.SortingCenterModel.Find(bson.M{}, &sortingCenter)
return sortingCenter
```

**等价性**：
```
database.SortingCenterModel.Find(bson.M{}, &sortingCenter)
等价于
sortingCenterModel.find({})
```

## Go 中定义数据结构

```go
type SortingCenter struct {
  ID     primitive.ObjectID `bson:"_id,omitempty" json:"_id,omitempty"`
  NameCn string             `bson:"nameCn,omitempty" json:"nameCn,omitempty"`
  NameEn string             `bson:"nameEn,omitempty" json:"nameEn,omitempty"`
}
```

### 结构字段 tag 解释

- `bson:"_id"`：在 MongoDB（BSON）里，这个字段的名字是 `_id`
- `omitempty`：如果这个字段是零值（空值），就不要输出
- **不写 tag**：按 Go 字段名原样输出，且不会省略空值

## nil 类型

**nil 可以理解为 NodeJS 中的 null**。

**不是所有类型都能用 nil**。只能是：
- 指针
- slice
- map
- chan
- interface
- function
- error

**注意**：Go 里**不存在 undefined** 这个概念，因为 Go 变量必须有类型，并且一定有默认值。

```go
var x int
fmt.Println(x)  // 0

var s string
fmt.Println(s)  // ""

var p *int
fmt.Println(p)  // nil
```

## context 机制

`context` 是 Go 标准库里的一个包。

**可以把 context 理解成**：一根"控制信号电线"，从上层一直传到底层。任何一层出问题就会自动取消。

### 常用函数

| 函数 | 作用 |
|------|------|
| `Background` | 创建根 context |
| `WithCancel` | 手动取消 |
| `WithTimeout` | 超时取消 |
| `WithDeadline` | 定点取消 |
| `WithValue` | 传数据 |

## Go 常用备注

### 日志输出

```go
log.Printf("[Error]: %v", err)
// 必须有格式化占位符，否则不会被打印
```

### 常见占位符

| 占位符 | 作用 |
|--------|------|
| `%v` | 默认格式 |
| `%+v` | 结构体会带字段名 |
| `%s` | 字符串 |
| `%d` | 整数 |
| `%f` | 浮点数 |

### fmt 字符串格式化

```go
fmt.Sprintf("宽: %v", oItem.CutStandard.WidthCn)
```

### Go vs NestJS 语法对比

| Go | NestJS（JS/TS）|
|----|----|
| `bson.M{}` | `{}` |
| `bson.M{"a": 1}` | `{ a: 1 }` |
| `bson.D{ {"$sort", ...} }` | `{ $sort: ... }` |
| `[]Type{...}` | `[ ... ]` |
| `err != nil` | `catch(error)` |

### if 初始化语句

```go
if 初始化语句; 条件表达式 {
  // ...
}
```

例如：

```go
if err := doSomething(); err != nil {
  return err
}
```

### 定义特殊变量

```go
var p *int = nil
// 定义一个类型为整型指针的变量 p，默认不指向任何地址
```
