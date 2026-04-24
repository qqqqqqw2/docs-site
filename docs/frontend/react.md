# React 对比

## React vs Vue 3 核心对比

| 功能 | React | Vue 3 | 说明 |
|------|-------|-------|------|
| **状态管理** | `useState()` / `useRef()` | `ref()` / `reactive()` | 都用于创建响应式状态；React 是不可变值，Vue 是响应式代理 |
| **计算属性** | `useMemo()` / `useCallback()` | `computed()` | 都是基于依赖的缓存计算。Vue 自动依赖收集，React 需手动声明依赖 |
| **副作用** | `useEffect()` | `watch()` / `watchEffect()` | 都是监听状态变化执行副作用。Vue 的依赖追踪更自动化 |
| **上下文共享** | `useContext()` | `provide()` / `inject()` | 都用于跨层级共享数据 |
| **避免重复渲染** | `memo()` | `shallowRef()` | React 通过手动缓存；Vue 依靠响应式系统自动追踪 |
| **模板语法** | `JSX`（`return()`）| `<template>` | JSX 可直接写 `{}` 表达式 |
| **事件处理** | 组件内部定义的函数 | `methods` | 通过事件绑定调用 |
| **变量访问** | `count` | `this.count` | React 中没有 this |
| **事件绑定** | `onClick={fn}` | `@click="fn"` | 事件名从 Vue 风格变成驼峰命名 |
| **全局状态** | `Redux` | `Vuex` / `Pinia` | - |

## 关键差异点

### React 没有 v-model

React 要通过 `value` + `onChange` 实现双向绑定：

```jsx
// React
function MyInput() {
  const [text, setText] = useState('')
  return (
    <input
      value={text}
      onChange={(e) => setText(e.target.value)}
    />
  )
}
```

```vue
<!-- Vue -->
<template>
  <input v-model="text" />
</template>

<script setup>
const text = ref('')
</script>
```

## Hooks 与 Composition API

- **React** 是第一个提出 Hooks 概念的框架（2018）
- **Vue** 在 3.0（2020）中借鉴了 React Hooks 的思想，演化成 **Composition API**

## 构建工具 vs 组件 API

**构建工具**（Vue CLI、Vite）：
- 项目构建工具
- Vue 3 和 React 都可以用 Vite 搭建

**Hooks 是什么**：
- Hooks 是组件逻辑写法的一部分（React 内部特性）
- Composition API 是 Vue 3 的内部特性，类似 Hooks 用函数组织逻辑

## JSX vs TSX

- 写法 90% 相同
- TSX 多了类型注释

```tsx
// TSX
function Counter({ initial }: { initial: number }) {
  const [count, setCount] = useState<number>(initial)
  return <div>{count}</div>
}
```

## useState 的数组解构

```jsx
const [todos, setTodos] = useState([])
// 变量 1（todos）代表此数据
// 变量 2（setTodos）用来修改数据
// 用数组解构，可以自由命名
```

## Koa（相关 Node 框架）

Koa 和 Express 类似，但使用 async/await 洋葱模型，异常处理更优雅。（详见后端 > Express & Koa）
