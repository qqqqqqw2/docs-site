# TypeScript

## 类型断言

**JS 断言**：运行时判断某个条件是否为 true。

```javascript
console.assert(user !== null, "用户不能为空")
```

**TS 断言**：告诉编译器一个值的具体类型，编译器不再做类型检查（风险自担）。

### 两种写法

```typescript
// 1. 尖括号语法（JSX 中不能用）
let someValue: any = "hello"
let strLength: number = (<string>someValue).length

// 2. as 语法（推荐，JSX 中唯一可用）
let strLength2: number = (someValue as string).length
```

## unknown vs any

- **any**：放弃类型检查，任何操作都不报错，不安全
- **unknown**：类型安全版本，必须先做类型断言或类型守卫才能使用

```typescript
// any：任何操作都不会报错
let x: any = "hello"
x.foo.bar // 不报错，但运行时可能崩

// unknown：必须收窄类型
let y: unknown = "hello"
// y.foo // ❌ 报错
if (typeof y === "string") {
  y.toUpperCase() // ✅ 类型收窄后可以操作
}
```

## 双重类型断言

```typescript
// ❌ 错误：row 和 Share 类型不兼容，直接断言会报错
row as Share

// ✅ 正确：先断言为 unknown，再断言为目标类型
row as unknown as Share

const list = inject('salesList') as Ref<Sales[]>
```

**为什么？**
TypeScript 不允许直接把一个类型断言成完全不兼容的另一个类型。只能先断言 `unknown`（顶级类型），再断言为目标类型。

**注意**：这只是让 TS 不报错，实际数据结构还是要自己保证。

## type vs interface

两者都可以定义对象类型，但有区别：

### 定义方式

```typescript
type Point = { x: number; y: number }

interface Point {
  x: number
  y: number
}
```

### 扩展方式

```typescript
// interface 用 extends 继承
interface A { x: number }
interface B extends A { y: number }

// type 用 & 交叉
type A = { x: number }
type B = A & { y: number }
```

### 合并能力

```typescript
// interface 相同名字会自动合并
interface User { name: string }
interface User { age: number }
// 合并后 User 有 name 和 age

// type 不能重复声明
type User = { name: string }
type User = { age: number } // ❌ 报错
```

### 使用场景

- **type**：定义联合类型、交叉类型、对象类型、工具类型
- **interface**：定义对象类型，尤其是需要扩展的

## 联合类型 / 交叉类型

```typescript
// 联合类型（或）：ID 可以是 number 或 string
type ID = number | string

// 交叉类型（与）：Worker 同时有 Person 和 Employee 的属性
type Person = { name: string; age: number }
type Employee = { company: string; position: string }
type Worker = Person & Employee
```

## 类型注释

### Vue 3 提供的泛型接口

```typescript
// ComputedRef: 计算属性
const isVisible: ComputedRef<boolean> = computed(() => ...)

// Ref: 响应式引用
const list = inject('salesList') as Ref<Sales[]>
```

### 函数类型接口

```typescript
// 传入参数 T，返回 K
export interface Fun<T = unknown, K = void> {
  (params?: T): K
}
```

### 索引签名

```typescript
// 键是任意字符串，值是 number 数组
interface Shortcuts {
  [K: string]: [number, number]
}

// 允许扩展额外字段
interface Payload<T = unknown> {
  total: number
  data: T[]
  [k: string | number]: unknown
}
```

### 响应式变量

```typescript
const skuContent = ref<string>('')
```

## 泛型

不指定具体数据类型，在使用时再确定。

### 泛型函数

```typescript
function identity<T>(arg: T): T {
  return arg
}

identity(123)      // number
identity("hello")  // string
```

### 泛型接口

```typescript
interface GenericIdentity<T> {
  value: T
  getValue(): T
}

const numberIdentity: GenericIdentity<number> = {
  value: 42,
  getValue() { return this.value }
}

const stringIdentity: GenericIdentity<string> = {
  value: "Hello",
  getValue() { return this.value }
}
```

## 数组创建方式

```typescript
// 推荐：数组字面量
let arr: Center[] = []

// 不推荐：构造函数
let arr = new Array<Center>()
```

**区别**：
- `[]` 语法更简洁，推荐使用
- `new Array()` 允许动态指定数组长度，但容易出意外

## Array.from() vs Array.fill()

```typescript
// from: 从类数组对象或可迭代对象创建新数组（浅拷贝）
Array.from(document.querySelectorAll('div'))

// fill: 将数组所有元素填充为相同值
new Array(5).fill(0) // [0, 0, 0, 0, 0]
```

## Symbol

ES6 引入的基础类型，唯一且不可变。

```typescript
const a = Symbol()
const b = Symbol()
console.log(a === b) // false，每次创建都唯一
```

### 用途

**1. 用作对象属性 key，避免命名冲突**

```typescript
const obj = {}
obj.id = 1
obj.id = 999 // 会覆盖

const ID = Symbol('id')
obj[ID] = 1 // 用 Symbol 做 key 永远不会被覆盖
```

**2. 作为依赖注入的唯一标识**

### 特点

- **唯一性**：每次 `Symbol()` 都是全新的
- **不可变**：创建后无法修改
- **不可枚举**：`for...in`、`Object.keys()` 无法遍历到
- **可作为对象 key**：不会和其他 key 冲突

## readonly

Vue 3 提供的 API，把响应式对象变成只读，防止外部直接修改。

```typescript
const state = reactive({ count: 0 })
const readonlyState = readonly(state)
readonlyState.count++ // ❌ 报错
```

## UnwrapRef

用于获取 ref 包裹的原始类型，让 reactive 对象里的 ref 能自动转换。

```typescript
state.value = next as UnwrapRef<T>
```

## Commit 类型示例

```typescript
export type Commit<T> = (val: T) => void

// 使用
let fn: Commit<number>
fn = (x: number) => { console.log(x) }
```

## Object.entries

把对象的键值对转成数组。

```typescript
Object.entries({ name: 'John', age: 30, city: 'NY' })
// 结果：[['name', 'John'], ['age', 30], ['city', 'NY']]
```

## Map 使用

```typescript
// 创建 Map：Key 是字符串，value 是 SupplierProduct 对象
const map = new Map<string, SupplierProduct>()

// 存数据
map.set(item._id, item)

// 取数据
map.get(item._id)

// 判断是否存在
map.has(item._id)

// 转成数组
Array.from(map.values())
```

## Set（去重）

```typescript
// new Set() 返回的是 Set 类型，不是数组
const s = new Set([1, 2, 3])

// 转成普通数组
const arr = [...new Set([1, 2, 3, 3, 2, 1])]
// [1, 2, 3]
```

## 接口响应类型实例

```typescript
// Respond<T>：接口返回的类型，T 代表请求参数类型
const upOrDownGoods: ApiPromiseFun<Respond<string>, string> = async (id) => {
  const { code, msg } = await request.post<never, Respond<string>>(
    `${import.meta.env.VITE_APP_RETAIL}/good/isSale/${id}`
  )
  return { code, msg }
}
```

## 请求方法的参数类型差异

```typescript
// GET 请求用 never 表示不能传 body
const { code, msg, payload } = await request.get<never, Respond<Payload<RetailGoods>>>(url)

// POST: 第一个是请求参数类型，第二个是返回数据类型
request.post<EditRetailGoodsParams, Respond>(url, params)

// PUT: body 直接传对象
await request.put<EditRetailGoodsParams, Respond>(
  `${url}/${params._id}`,
  params
)

// DELETE: body 必须写在 config.data 里（第二个参数是配置对象）
await request.delete<{ deleteRemark: string }, Respond>(
  `${url}/${id}`,
  { data: { deleteRemark } }
)
```

**为什么 DELETE 不一样？**
axios 的 put/post 第二个参数是请求体（body）直接传对象，而 delete 的第二个参数是 config（配置对象），body 必须写在 `config.data` 里。
