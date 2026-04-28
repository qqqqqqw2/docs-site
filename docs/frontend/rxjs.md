# RxJS

## 什么是 Subject

通过 RxJS 库创建和使用一个 Subject，并通过其实现发布订阅模式。

**Subject 特点**：
- 可以认为是一种数据类型
- 特殊的观察者
- 同时可以充当 **Observable（被观察的）** 或 **Observer（观察者）**
- 可以发出数据（发布）和接收数据（订阅）

## 核心方法

| 方法 | 作用 |
|------|------|
| `next()` | 用于给订阅者推送新的数据 |
| `subscribe()` | 用来接收数据 |

## 基础使用

```typescript
import { Subject } from 'rxjs'

const subject = new Subject<number>()

// 订阅
subject.subscribe(value => {
  console.log('收到数据:', value)
})

// 推送数据
subject.next(1)
subject.next(2)
subject.next(3)
```

## 项目中的使用场景

### 数据大屏动画完成通知

```typescript
const animationFinishedObservable = new Subject()

const totalScrollNumber = getScrollNumber({
  valueEl: total,
  onComplete() {
    if (isFirst) {
      isFirst = false
      return
    }
    animationFinishedObservable.next()
  },
  render(value) {
    return `总计：${getAmount(value)}`
  },
})
```

### zip 多流合并

```typescript
import * as Rx from 'rxjs'

// 将 orderAddObservable 和 animationFinishedObservable 两个流合并
// 每次两边都发出数据时，才触发一次
Rx.zip(orderAddObservable, animationFinishedObservable).subscribe(
  ([order, _]) => {
    unProcessedOrder.delete(order)
    processNextOrder()
  }
)
```

### 踩过的坑

**定义的函数默认会初始化**：

```typescript
// 数据大屏问题：socket 监听到的第一单，会被删除
// 原因：zip 的初始订阅导致第一次监听被消费掉了
```

## watch vs watchEffect（Vue 3）

RxJS 的订阅模式和 Vue 3 的 `watch`/`watchEffect` 有相似之处。

### 对比

| 特性 | watchEffect | watch |
|------|-------------|-------|
| 指定观察对象 | 不需要（自动跟踪）| 需要显式指定 |
| 拿新旧值 | ❌ | ✅ |
| 启动时机 | 立即执行 | 默认不执行，需要 `immediate: true` |

### watchEffect 自动跟踪

```typescript
watchEffect(() => {
  console.log(`count 的值是: ${count.value}`)
  // 自动跟踪 count，count 变化时重新执行
})
```

### watch 显式指定

```typescript
watch(count, (newVal, oldVal) => {
  console.log(`count 变了，从 ${oldVal} 到 ${newVal}`)
})
```

### 监听多个

```typescript
watch([count, name], ([newCount, newName], [oldCount, oldName]) => {
  // ...
})
```

### 监听 reactive 对象

```typescript
const state = reactive({ count: 0 })

// 直接监听深层属性
watch(
  () => state.count,
  (newVal) => { ... }
)

// 或者深度监听
watch(state, (newVal) => { ... }, { deep: true })
```
