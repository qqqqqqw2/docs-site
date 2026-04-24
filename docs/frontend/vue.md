# Vue 2 / Vue 3

## Vue 2 vs Vue 3 核心区别

### 1. 性能

- **Vue 3**：虚拟 DOM 重写更快、体积更小、编译器优化（静态提升、Tree-shaking）
- **Vue 2**：虚拟 DOM 较旧，体积略大

### 2. 响应式系统

- **Vue 3**：`Proxy` 实现，能监听数组索引变化和对象属性新增/删除
- **Vue 2**：`Object.defineProperty`，无法监听属性新增/删除、数组索引直接修改

### 3. API 风格

- **Vue 2**：选项式 API（options API）
- **Vue 3**：新增组合式 API（Composition API），用 `setup`、`ref`、`reactive`

### 4. TypeScript 支持

- **Vue 3**：原生支持，类型推导好
- **Vue 2**：较差

### 5. 工具链

- **Vue 3**：推荐 Vite（快、模块热更新）
- **Vue 2**：通常用 Vue CLI，构建慢

### 6. 生命周期

| Vue 2 | Vue 3 |
|-------|-------|
| `created` | `setup()`（等效）|
| `mounted` | `onMounted` |
| `destroyed` | `onUnmounted` |
| `beforeDestroy` | `onBeforeUnmount` |

### 7. Vue 3 新特性

**Fragments：支持多个根节点**

```vue
<template>
  <h1>标题</h1>
  <p>段落</p>
</template>
```

**Teleport：可将组件渲染到 DOM 任意位置**

```vue
<Teleport to="body">
  <div>渲染到 body 下</div>
</Teleport>
```

**Suspense：支持异步组件加载占位**

```vue
<Suspense>
  <template #default>
    <AsyncComponent />
  </template>
  <template #fallback>
    <div>Loading...</div>
  </template>
</Suspense>
```

## Scoped 原理

**作用**：让样式只作用于当前组件，避免影响其他组件。

**原理**：Vue 编译 `.vue` 文件时，如果发现 `<style scoped>`：
1. 为当前组件生成唯一 hash（如 `data-v-abc123`）
2. 该组件中渲染的所有元素都会自动加上这个作用域标记
3. CSS 选择器自动加上 `[data-v-abc123]` 后缀

因为其他组件的 DOM 没有这个标记，所以样式不会相互影响。

## v-if vs v-for

**不要同时使用！**（影响性能）

**优先级差异**：
- **Vue 2**：`v-for` > `v-if`
- **Vue 3**：`v-if` > `v-for`

**推荐做法**：用 computed 过滤数据，再用 `v-for` 渲染。

## v-if vs v-show

- **v-if**：条件变化少时用，真正销毁/创建 DOM
- **v-show**：频繁切换用，只是 `display` 切换

## 组件通信

### 1. 父 → 子（Props）

```vue
<!-- 父 -->
<child-component :message="parentMessage" />

<!-- 子 -->
<script>
export default {
  props: {
    message: String,
  },
}
</script>
```

### 2. 子 → 父（Emit）

```vue
<!-- 父 -->
<child-component @childEvent="handleChildEvent" />

<!-- 子 -->
this.$emit('childEvent', 'Hello from Child')
```

### 3. 祖 → 孙（provide / inject）

```javascript
// 祖先组件
provide() {
  return {
    message: 'Hello from Grandparent'
  }
}

// 孙子组件
inject: ['message']
```

### 4. 全局状态（Vuex / Pinia）

### 5. 插槽（Slots）

**默认插槽**

```vue
<!-- 子组件 -->
<slot></slot>

<!-- 父组件 -->
<Child>内容</Child>
```

**命名插槽**

```vue
<!-- 子组件 -->
<div class="modal">
  <header><slot name="header"></slot></header>
  <main><slot></slot></main>
  <footer><slot name="footer"></slot></footer>
</div>

<!-- 父组件 -->
<Child>
  <template v-slot:header>
    <h1>标题</h1>
  </template>
  <p>主体内容</p>
  <template v-slot:footer>
    <button>关闭</button>
  </template>
</Child>
```

**作用域插槽（子传父）**

```vue
<!-- 子组件 -->
<slot :message="message" :row="data"></slot>

<!-- 父组件 -->
<Child>
  <template #default="{ message }">
    <p>{{ message }}</p>
  </template>
</Child>
```

## 渲染函数 h（Vue 3）

动态生成虚拟 DOM 节点，等价于模板语法但更灵活。

```typescript
h(type, props, children)
// type: 标签或组件
// props: 属性对象
// children: 子节点
```

### 渲染原生标签

直接传字符串或数组：

```javascript
h('div', null, 'Hello')
h('div', { class: 'box' }, [h('span', null, 'a'), h('span', null, 'b')])
```

### 渲染组件

需要用 `default` 插槽格式：

```javascript
return h(
  NButton,
  {
    style: 'color: var(--primary-color); cursor: pointer;',
    onClick: () => emit('company', row as unknown as Share),
  },
  {
    default: () => [
      h('div', null, (row as unknown as Share).company.nameCn),
      h('div', null, (row as unknown as Share).company.nameEn),
    ],
  }
)
```

## defineEmits（Vue 3）

用来声明和类型化组件自定义事件的 API。

```typescript
interface EmitType {
  (e: 'refresh'): void
  (e: 'changePage', data: number): void
  (e: 'purchaseDetails', data: Purchase): void
}

const emit = defineEmits<EmitType>()
```

- `void` 表示 emit 事件无返回值（通知父组件，不关心处理结果）
- 保证类型安全：调用 emit 时参数类型会被检查

## defineExpose（Vue 3）

将子组件的变量或方法暴露给父组件。

```vue
<!-- 子组件 -->
<script setup>
const viewOperationRecord = () => { ... }
defineExpose({ viewOperationRecord })
</script>

<!-- 父组件 -->
<template>
  <Child ref="operationRef" />
</template>

<script setup>
const operationRef = ref()

// 调用子组件方法
operationRef.value?.viewOperationRecord({
  id: 'role',
  form: 'role',
})
</script>
```

## $nextTick

Vue 完成 DOM 更新后执行某个回调，确保 DOM 已渲染完成再操作。

```javascript
async onShow() {
  await this.$nextTick()
  // DOM 更新完成后的逻辑
}
```

## $forceUpdate

强制触发组件重新渲染，即使数据本身没变化。

```javascript
this.$forceUpdate()
```

## 标签强制刷新的两种方式

### 方式一：通过 key

```vue
<div :key="valKey"></div>

<script setup>
const valKey = ref(0)
watchEffect(() => {
  // 修改 key 会让 Vue 把这个 DOM 当成全新的，销毁后重建
  if (consignee.value) {
    valKey.value++
  }
})
</script>
```

### 方式二：组件自带 reload 方法

```vue
<div ref="divRef"></div>

<script setup>
divRef.value.reload() // 组件自身提供刷新方法
</script>
```

## watchEffect vs watch

- **watchEffect**：不需要指定观察对象，自动跟踪函数中使用的响应式数据
- **watch**：显式指定要观察的响应式数据，可拿到新旧值

```javascript
// watchEffect 自动跟踪
watchEffect(() => {
  console.log(`count 的值是: ${count.value}`)
})

// watch 显式指定
watch(count, (newVal, oldVal) => {
  console.log(`count 变了，从 ${oldVal} 到 ${newVal}`)
})
```

## onLoad vs onShow（UniApp）

- **onLoad**：进入页面时触发一次，用于页面数据初始化
- **onShow**：每次展示时都会触发，适合页面更新和数据刷新

## 环境变量

```
.env.development   # 本地开发，npm run dev
.env.production    # 正式环境，npm run build
.env.staging       # 预发布/测试环境，npm run build --mode staging
.env.preview       # 预览部署，npm run build --mode preview
```

## Vuex 四个核心概念

| 概念 | 作用 | 类比 |
|------|------|------|
| **state** | 存储全局响应式数据 | 仓库/冰箱里的食材 |
| **getters** | 对 state 做计算或筛选（计算属性） | 切片师把食材切好摆盘 |
| **mutations** | 唯一能直接修改 state（同步） | 厨师炒菜改变食材 |
| **actions** | 异步操作，不能直接改 state | 服务员去外面采购 |

## 代码规范

### Prop 定义

```javascript
props: {
  userName: {        // 必须用驼峰命名
    type: String,     // 必须指定类型
    required: true,   // required 或 default 二选一
    default: '',
  },
}
```

必须加上注释说明含义。

### 组件 class 和 style

**class 统一写法**

```vue
<view :class="['ebuy-red', 'flex_m', 'ma-t4', item.showTag.isShowEconomize ? 'ma-l2' : '']"></view>
```

**style 统一写法**

```vue
<view :style="{'text-align':'center','font-weight':'bold',width:winWidth/3 + 'px'}">数量</view>
```

### 组件标签换行

特性较多时主动换行：

```vue
<MyComponent
  foo="a"
  bar="b"
  baz="c">
</MyComponent>
```

### 模板表达式

只包含简单表达式，复杂逻辑重构为 computed 或 method。

### v-for 必须设置 key

最好是 id，不要用 index。

### 命名规则

| 类型 | 规则 | 示例 |
|------|------|------|
| 组件名 | 大驼峰（PascalCase） | `UserProfile` |
| 局部变量 | 小驼峰（camelCase） | `userName` |
| 常量 | 全大写+下划线 | `MAX_LENGTH`、`API_URL` |
| 事件名 | 小写+中划线 | `click-button` |
| data/methods | 小驼峰 | `getUserInfo` |
| CSS 类名 | 小写+中划线 | `.my-component__button` |

### script 标签内部顺序

```
components > props > data > computed > watch > filter > 钩子函数 > methods
```

### 避免手动操作 DOM

使用 vue 框架时，尽量使用数据驱动更新 DOM，避免手动增删改 DOM 元素。

### 为组件设置作用域

必须用 `<style scoped>`。

## 接口返回类型示例

```typescript
export interface Payload<T = unknown> {
  total: number
  data: T[]
  [k: string | number]: unknown  // 允许后端返回额外字段
}

// 使用
const { code, msg, payload } = await request.get<never, Respond<Payload<RetailGoods>>>(url)
```

## 表单相关属性

```vue
<n-form-item path="xxx" rule-path="custom-rule">
  <n-input />
</n-form-item>
```

- `path`：对应表单数据的字段
- `rule-path`：使用哪条校验规则

## 校验输入是否为空

```javascript
// 可能的场景：val 是 [startDate, endDate]
val[1]?.toString().trim() !== ''
// 如果 val[1] 是 undefined，undefined ≠ ''，结果是 true
```

## 常用 UI 组件属性

### common-upload（上传组件）

```vue
<common-upload
  image
  accept=".jpg,.jpeg,.png"
  :action="action"
  :data="{ bucket: 'm-ebuy-canteen' }"
  name="uploadComm"
  :size="1"
  :max="5"
  :defaultFileUrl="canteen.photos"
  @change="handlerUploadPhotosChange"
  @finish="handlerUploadPhotosFinish"
  remark="图片大小不超过1M，最多5张"
/>
```

- `image`：是否开启图片模式
- `accept`：接受的文件类型
- `:action`：上传的服务器接口
- `:data`：同时发送的额外数据
- `name`：HTTP 请求中的字段名
- `:size`：单文件最大体积（M）
- `:max`：最多文件数量
- `:defaultFileUrl`：初始化已有文件
- `@change`：修改/删除图片时触发
- `@finish`：单个上传成功时触发

### action-header 搜索组件

```javascript
const optionList = [
  {
    label: '标题',           // 搜索项标题
    type: 'text',            // 类型（text/date/daterange/month/dateSelect）
    placeholder: '请输入',    // 提示文字
    searchVar: 'name',       // 返回字段名
    searchVal: '',           // 默认值
    searchType: 'canteen',   // 下拉框类型：canteen/company/other
    width: 100,              // 宽度
    ifRequire: true,         // 是否必填
    noReset: false,          // 重置时不清空
    ifRowButton: true,       // 搜索按钮放右侧
    slotName: 'custom',      // 插槽名
  },
]
```

**备注**：
- `type === 'dateSelect'`：有默认值的日期选择器
- `type === 'date | daterange | month | year'`：没有默认值

### 处理数据未初始化场景

```javascript
watchEffect(() => {
  if (consigneeOptions.value && consigneeOptions.value.length) {
    optionList.value.forEach((item) => {
      if (item.label === '售卖渠道') item.selectOptions = consigneeOptions.value
    })
  }
})
```

### common-modal 弹窗

- `showModal`：是否显示弹窗
- `showHeader`：是否显示弹窗标题
- `size`：弹窗大小
- `footer`：是否显示底部按钮

### n-form-item

- `:show-require-mark`：是否不显示必填星号
- `:show-feedback="false"`：是否展示校验反馈

## 窗口消息提示

```javascript
window.$message.success('成功')
window.$message.warning('警告')
window.$message.error('错误')

// 提示弹窗
window.$dialog.warning({
  maskClosable: false,  // 点击遮罩层是否关闭
  bordered: true,       // 内容区是否显示边框
})
```

## 后台新增模块流程

1. 在 `src/configuration.ts` 的 `pageConfig` 添加新模块和子页面配置
2. 新页面的 `path`、`name` 要唯一，和文件夹名对应
3. 页面文件放在 `src/views/pages/你的path/index.vue`
4. 路由会被自动拼接为 `./views/pages/test/test2/index.vue`
5. 访问路径会被自动拼接为 `/layout/test/test2`

### 路由配置属性

- `belongsTo`：指定子路由属于哪个父模块
- `isHideChildren`：是否显示子菜单
- `isHide`：是否隐藏菜单
- `isCache`：是否缓存页面
- `Key`：权限标识符

## 目录介绍

| 目录 | 作用 |
|------|------|
| `views` | 页面结构/路由终点 |
| `features` | 业务功能模块（业务逻辑、页面、接口）|
| `hooks` | 逻辑复用（组合式函数） |
| `components` | 通用自定义组件 |

### features 子目录示例（userList）

```
userList/
  ├─ use-api-center.ts    # 管理该模块所有接口
  ├─ interfaces/          # 规范类型
  ├─ use-user-center.ts   # 封装接口调用逻辑
  └─ index.ts             # 通过中间件连接起来
```

## 页面逻辑封装模式

```javascript
// index.ts
export default function index() {
  const deleteOtherBill = () => { ... }
  return { deleteOtherBill }
}

// 其他文件引用
let { deleteOtherBill } = index()
```

这种方式让调用方不关心实现细节，维护更容易。

## 数据大屏入口加载

```html
<!-- index.html -->
<script type="module" src="/src/main.ts"></script>
```

```javascript
// main.ts
// 通过 jQuery 选择器找到 DOM，用 .html() 插入数据
$('.page > .main > .sales').html(...)

// 对比原生 JS
const main = document.querySelector('.main')
main.innerHTML = '<div>数据</div>'
```

## nvue 开发注意点

1. **v-if=false 也会渲染样式**：如果一个盒子使用 `v-if`，条件为 false，但设置的 `margin`、`padding`、`border` 也会渲染出来
2. **文字样式必须写在 text 中**：否则不生效
3. **样式不能简写**：`margin`、`padding`、`border` 不能简写，要用 `border-width`、`border-style`、`border-color`
4. **flex 默认方向是垂直**：注意和 web 不一样

