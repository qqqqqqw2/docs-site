# 代码规范

## Prop 定义规范

```javascript
props: {
  userName: {
    type: String,       // 必须指定类型
    required: true,     // required 或 default 二选一
    default: '',
  },
}
```

**硬性要求**：
- 必须使用 camelCase（小驼峰）
- 必须指定类型
- 必须加上注释表明含义
- 必须加上 `required` 或 `default`

## 组件 class 和 style 统一写法

### class 统一放在 :class 中

```vue
<view :class="['ebuy-red', 'flex_m', 'ma-t4', item.showTag.isShowEconomize ? 'ma-l2' : '']"></view>
```

### style 统一放在 :style 中

```vue
<view :style="{'text-align':'center','font-weight':'bold',width:winWidth/3 + 'px'}">数量</view>
```

## 组件作用域

必须为组件设置作用域：

```vue
<style scoped>
/* ... */
</style>
```

## 标签换行规则

特性元素较多时应主动换行：

```vue
<MyComponent
  foo="a"
  bar="b"
  baz="c">
</MyComponent>
```

## 模板表达式规则

组件模板应该**只包含简单的表达式**，复杂的表达式则应该重构为：
- **computed**（计算属性）
- **method**（方法）

```vue
<!-- ❌ 不推荐 -->
<div>{{ list.filter(x => x.status === 'active').map(x => x.name).join(', ') }}</div>

<!-- ✅ 推荐 -->
<div>{{ activeNames }}</div>

<script>
const activeNames = computed(() =>
  list.value.filter(x => x.status === 'active').map(x => x.name).join(', ')
)
</script>
```

## v-for 必须设置 key

- 最好是 id
- 不要用 index（会导致复用错误）

```vue
<li v-for="item in list" :key="item.id"></li>
```

## v-if vs v-show

- **v-show**：运行时频繁切换，使用 v-show（只是 display 切换）
- **v-if**：运行时条件很少改变，使用 v-if（真正销毁/创建 DOM）

## script 标签内部顺序

```
components
  > props
  > data
  > computed
  > watch
  > filter
  > 钩子函数（生命周期）
  > methods
```

## 不要手动操作 DOM

因使用 vue 框架，在项目开发中尽量使用 vue 的**数据驱动**更新 DOM。

不到万不得已不要手动操作 DOM，包括：增删改 DOM 元素。

## 命名规则

| 类型 | 规则 | 示例 |
|------|------|------|
| **组件名** | 大驼峰（PascalCase）| `UserProfile` |
| **局部变量** | 小驼峰（camelCase）| `userName` |
| **常量** | 全大写+下划线 | `MAX_LENGTH`、`API_URL` |
| **事件名** | 小写+中划线 | `click-button`、`input-change` |
| **data/methods** | 小驼峰 | `getUserInfo` |
| **CSS 类名** | 小写+中划线 | `.my-component__button`、`.my-component--active` |

事件命名示例：

```vue
<MyComponent @submit-form="onSubmit" />
```

## v-if 和 v-for 不同时使用

**不管 Vue 2 还是 Vue 3，不要将 v-if 和 v-for 同时使用**，会影响性能。

**优先级差异**：
- **Vue 2**：`v-for` 优先级高于 `v-if`
- **Vue 3**：`v-if` 优先级高于 `v-for`

**推荐做法**：用 computed 过滤数据，再用 v-for 渲染。

## nvue 开发注意点

1. **v-if=false 也会渲染样式**：如果盒子使用 `v-if` 条件为 false，设置的 `margin`、`padding`、`border` 也会渲染出来
2. **文字样式必须写在 text 中**：否则不生效
3. **样式不能简写**：`margin`、`padding`、`border` 不能简写，要用 `border-width`、`border-style`、`border-color`
4. **flex 默认是垂直方向**：注意和 web 不一样

## 英文 UI 规范

| 场景 | 推荐写法 | 示例 |
|------|---------|------|
| 普通文本 | `today` / `tomorrow` | I will process it tomorrow. |
| 句子开头 | `Today` / `Tomorrow` | Today we update the data. |
| 按钮、Tab、标题 | `Today` / `Tomorrow`（首字母大写）| Today Orders, Tomorrow Plan |

## 目录结构

```
src/
├── views/           # 页面结构/路由终点
├── features/        # 业务功能模块（业务逻辑、页面、接口）
├── hooks/           # 逻辑复用（组合式函数）
└── components/      # 通用自定义组件
```

### features 子目录（以 user 模块为例）

```
userList/
├── use-api-center.ts    # 管理该模块所有接口
├── interfaces/          # 规范类型
├── use-user-center.ts   # 封装接口调用逻辑
└── index.ts             # 通过中间件连接起来
```

## 后台新增模块流程

1. 在 `src/configuration.ts` 的 `pageConfig` 添加新模块和子页面配置
2. 新页面的 `path`、`name` 要唯一，和文件夹名对应
3. 页面文件放在 `src/views/pages/你的path/index.vue`
4. 组件路径会被自动拼接为 `./views/pages/test/test2/index.vue`
5. 访问路径会被自动拼接为 `/layout/test/test2`

### 路由配置属性

- `belongsTo`：指定子路由属于哪个父模块
- `isHideChildren`：是否显示子菜单
- `isHide`：是否隐藏菜单
- `isCache`：是否缓存页面
- `Key`：权限标识符

## 页面逻辑封装模式

```javascript
// index.ts
export default function index() {
  const deleteOtherBill = () => { ... }
  const updateBill = () => { ... }
  return { deleteOtherBill, updateBill }
}

// 其他文件引用
let { deleteOtherBill } = index()
```

**好处**：调用方不关心实现细节，维护更容易。

## 环境变量文件

| 文件 | 场景 | 命令 |
|------|------|------|
| `.env.development` | 开发测试环境 | `npm run dev` |
| `.env.production` | 生产环境 | `npm run build` |
| `.env.staging` | 预发布/测试环境 | `npm run build --mode staging` |
| `.env.preview` | 部署到预服务器 | `npm run build --mode preview` |
