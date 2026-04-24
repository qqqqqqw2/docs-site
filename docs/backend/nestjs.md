# NestJS

## 核心概念

### Service、Controller、Module

| 概念 | 作用 |
|------|------|
| **Service** | 承载业务逻辑的核心 |
| **Controller** | 通过 `@Get`、`@Post` 等装饰器定义路由入口，接收请求参数，把工作交给对应的 Service |
| **Module** | 把相关的 Controller、Service、数据库模型等组织成一个独立功能块 |

**简单记忆**：
- Module 负责"装配与组织"
- Controller 负责"请求入口"
- Service 负责"业务实现"

## 参数装饰器

通过参数装饰器，将数据注入到控制器方法的参数上。

| 装饰器 | 作用 |
|--------|------|
| `@Body()` | 整个 body 解析成普通对象注入到参数 |
| `@Query()` | URL 上的查询字符串解析成普通对象注入 |
| `@Request()` | Express 框架的 Req 实例，能访问 header、cookies、IP、session |
| `@InjectModel()` | 将集合的 Model 注入到此文件 |
| `@Prop()` | 声明一个字段 |
| `@Schema()` | 定义一个 Schema 类 |

## 关键关键词

```typescript
// 类创建实例时自动执行的函数
constructor(
  // 只能在类内部使用，不能被修改的依赖项
  private readonly appendOrderModel: Model<AppendOrderDocument>
) {}

// 让该类拥有 Document 的所有方法和属性（_id、save()、toObject()）
export class AppendOrder extends Document {}
```

**使用注入的 Model**：

```typescript
this.appendOrderModel.find()
this.appendOrderModel.create()
```

## 访问对象属性的两种方式

```typescript
// 点表示法：属性名必须是有效的标识符，TS 会做类型检查
obj.property

// 方括号表示法：属性名可以是字符串、变量、表达式，可以绕过 TS 类型检查
obj['property']
obj[dynamicKey]
```

## 从定义表到使用表的完整流程

### 1. 定义 TS 类，确定集合结构

```typescript
@Schema()
export class Order extends Document {
  @Prop()
  code: string
}
```

### 2. 转换 Schema

```typescript
SchemaFactory.createForClass(Order)
```

**作用**：将 `@Schema()` 装饰的 TypeScript 类转换为 Mongoose 能识别的 Schema 对象。

**为什么**：原本的 Mongoose 结构是 JS，不认识 TS 类。

### 3. 引入 Model

**@Module 的 4 个属性**：

| 属性 | 作用 | 类比 |
|------|------|------|
| `imports` | 引入数据库 Model | 请外援支持 |
| `controllers` | 接收请求，调用 Service，返回结果 | 接单的前台 |
| `providers` | 数据库增删改查、业务判断、所有依赖注入的内容 | 真正干活的员工 |
| `exports` | 把本模块能力提供给别人用 | 提供服务给其他团队 |

**注意**：将 Service 文件写入 `providers` 中，Service 就可注入 `imports` 的 Model。

### 4. 注入 Model

```typescript
// 解释：@Module 中引入了 AppendOrder，NestJS 会创建一个 Provider，
// 自动将 name 转成 ${name}Model 作为 Provider Token
// 所以 @InjectModel('AppendOrder') 等价于 @Inject('AppendOrderModel')

@InjectModel('AppendOrder')
private readonly appendOrderModel: Model<AppendOrderDocument>
```

## NestJS 连接数据库

| 世界 | 概念 | 比喻 |
|------|------|------|
| MongoDB 连接 | 一个数据库连接对象 | 一个仓库 |
| providers 容器 | 存放依赖的仓库管理局 | 仓库登记册 |
| `@InjectConnection('commDB')` | 领取仓库的方法 | 去登记处说"我要 commDB 仓库的钥匙" |
| `connectionName: 'commDB'` | 这个仓库的名称 | - |

## Service 文件如何注入表

```typescript
MongooseModule.forFeature([
  {
    name: Global.name,                              // 模型在 Nest 里的名字/token（其实就是字符串 'Global'）
    schema: GlobalSchema,                            // 模型的字段结构定义（SchemaFactory.createForClass 产物）
    collection: 'global',                            // 数据库里真正的表名
  },
])
```

- `MongooseModule.forFeature` 作用：**在连接数据库的基础上，注册模型**
- `Global.name` 等价于 `export class Global extends Document` 中的 `Global`

### 流程图

```
OrderSchema
    ↓
MongooseModule.forFeature(...)
    ↓
OrderModule
    ↓
OrderService
    ↓
@InjectModel('Order')
```

## DTO（Data Transfer Object）

### 作用

用于**类型约束**和**参数校验**。

### 触发条件

```typescript
// main.ts 开启全局校验
app.useGlobalPipes(new ValidationPipe())

// 当控制器的参数类型是一个 class DTO，就会触发校验
@Post('canteen')
createCanteen(
  @Body() body: CreateCanteenDTO,  // 这里就会触发
  @Request() { user }: Requestparameter,
): Promise<Response> {
  return this.canteenService.createCanteen(body, user)
}
```

### 配合 DTO

```typescript
export class CreateCanteenDTO {
  @IsNotEmpty({ message: '餐厅名称不能为空' })
  readonly nameCn: string

  @IsNotEmpty({ message: '餐厅英文名称不能为空' })
  readonly nameEn: string
}
```

### 整体流程

1. 客户端发送请求
2. Nest 把 body 按 `CreateCanteenDTO` 类型交给 `ValidationPipe`
3. `ValidationPipe` 用 `class-validator` 检查 `@IsNotEmpty` 等装饰器
4. 如果有错误，接口直接返回 400，并提示某个字段不能为空

### DTO 类 vs TS 类型注释

| 项目 | TS 类型注释 | DTO 类 |
|------|-------------|--------|
| 编译后代码存在 | ❌ 编译时被擦除 | ✅ 编译后还在 |
| 运行时检查 | ❌ | ✅ 被框架用来做校验、转换 |
| 用途 | 只在编译阶段起作用 | 既是类型注释又是运行时校验 |

## Common 文件夹概念

NestJS 的四大组件：

### Middleware（中间件）

**最早执行**，能操作 `req/res`，在进入 Nest 路由系统之前处理和业务无关的通用事情：
- 日志
- 跨域
- 解析 token

### Guard（守卫）

**在调用 Controller 之前**，判断权限，是否允许进入路由。

### Pipe（管道）

**参数校验**，在进入 Controller 方法之前，对参数做处理：
- 把 body 映射到 DTO 并做校验
- 数据不合法直接抛出异常

### Interceptor（拦截器）

**在 Controller 方法调用前和调用后都能插一脚**：
- 统一包装返回结构
- 统计耗时
- 做缓存
- 对返回数据做二次加工

## Middleware 使用

**作用**：给指定接口挂上"门禁/前置处理器"。这些中间件：
- 在 Controller 之前执行
- 用来做校验、预处理、拦截非法请求等

### 绑定到指定路由

```typescript
export class CanteenModule {
  configure(consumer: MiddlewareConsumer) {
    consumer
      .apply(SomeMiddleware)
      .forRoutes({ path, method })
  }
}
```

- `configure`：NestJS 约定方法，在 Nest 启动时会被调用
- `consumer`：把 middleware 绑定到哪些路由上

### 中间件典型操作

```typescript
// 1. 校验 id 是否合法
// 2. 校验是否存在该 canteen
// 3. 校验当前用户是否有权限
// 4. 挂载数据到 req 上
```

## 接口请求参数类型

### post 和 delete 传参差异

**axios 的 put 和 post**：第二个参数就是请求体（body），直接传对象：

```typescript
await request.put<EditRetailGoodsParams, Respond>(
  `${import.meta.env.VITE_APP_RETAIL}/good/${params._id}`,
  params  // 直接传对象
)
```

**delete 不同**：第二个参数是 `config`（配置对象），body 必须写在 `config.data` 里：

```typescript
await request.delete<{ deleteRemark: string }, Respond>(
  `${import.meta.env.VITE_APP_RETAIL}/good/${id}`,
  {
    data: { deleteRemark },  // 必须写在 config.data 中
  }
)
```

### get 请求

```typescript
const { code, msg, payload } = await request.get<never, Respond<Payload<RetailGoods>>>(url)
```

- `never` 表示 GET 不能传 body
- get 可以将参数自动拼接到 URL

```
结果：/api?consignee=xxx&deliverStart=xxx&deliverEnd=xxx
```

## 接口响应泛型

```typescript
// Respond<T>：接口返回的类型，T 代表请求参数类型
const upOrDownGoods: ApiPromiseFun<Respond<string>, string> = async (id) => {
  const { code, msg } = await request.post<never, Respond<string>>(
    `${import.meta.env.VITE_APP_RETAIL}/good/isSale/${id}`
  )
  return { code, msg }
}
```
