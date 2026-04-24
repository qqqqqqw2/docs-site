# UniApp

## 获取标签高度

### 方法一：通过 ID 精确获取

```javascript
getHeight() {
  const winInfo = uni.getSystemInfoSync()
  const query = uni.createSelectorQuery().in(this)
  query.select('#dataClass').boundingClientRect(data => {
    this.winHeight = Number(winInfo.windowHeight - data.height)
  }).exec()
}
```

**注意事项**：
1. 在 `onLoad` 或 `onShow` 中使用需要在 `this.$nextTick(() => {})` 中执行
2. 获取 `v-if` 状态为 `false` 的盒子时，需等状态改为 `true` 后触发
3. 要精确获取盒子高度，盒子子标签**不能使用 position 定位**，只能在父标签使用

### 方法二：直接获取窗口高度

```javascript
getHeight() {
  uni.getSystemInfo({
    success: (res) => {
      this.winHeight = res.windowHeight
    },
  })
}
```

**坑**：`success` 必须用**箭头函数**，否则无法访问 this。

```javascript
// ❌ 错误
uni.getSystemInfo({
  success: function(res) {
    this.winHeight = res.windowHeight // this 指向错误
  }
})

// ✅ 正确
uni.getSystemInfo({
  success: (res) => {
    this.winHeight = res.windowHeight
  }
})
```

## $nextTick 用法

```javascript
async onShow() {
  await this.$nextTick()
  // DOM 更新完成后的逻辑
}
```

## 移动端适配

### 安全区域

```css
/* 顶部偏移：状态栏 + 导航栏 */
top: calc(var(--window-top) + var(--status-bar-height));

/* 底部安全区 */
bottom: calc(var(--window-bottom) + 20rpx);
```

### 为什么用 `calc(var(--window-top) + var(--status-bar-height))` 而不是 `var(--status-bar-height)`？

更安全：它考虑了所有可能的顶部偏移情况，在不同设备和不同场景下都能正确工作。

### 状态栏 vs 导航栏

- **状态栏（`--status-bar-height`）**：最顶部显示信号、时间、电量的那一小条
- **导航栏（`--window-top`）**：一般在状态栏下方，显示标题和返回按钮

### 为什么移动端 `--window-top` 为 0？

因为不管是默认导航栏还是自定义导航栏 `<u-navbar>`，UniApp 会自动处理导航栏位置，页面内容会自动从导航栏下方开始，所以 `--window-top` 为 0 是正确的。

### 列表 top 和 bottom

```css
.listTop {
  top: calc(var(--window-top) + var(--status-bar-height) + 110rpx);
  bottom: calc(var(--window-bottom) + 20rpx);
}

.isPadListTop {
  top: calc(var(--window-top) + var(--status-bar-height) + 110rpx);
  bottom: calc(var(--window-bottom) + 20rpx);
}
```

### 使用 position fixed 避免被遮挡

在 App 开发过程中，使用 `uni.getSystemInfo` 获取屏幕尺寸时，不同机型尺寸不一样。如果直接使用 `res.windowHeight` 作为滚动区域，下方有其他标签会被遮挡。

**解决办法**：用 `position: fixed` 定位固定，配合安全区域适配。

## 下拉刷新

```vue
<scroll-view
  refresher-enabled
  :refresher-triggered="triggered"
  @refresherrefresh="onRefresh"
>
  <!-- 内容 -->
</scroll-view>
```

## Loading 展示

```vue
<Loading v-if="isShowLoading"></Loading>
```

## 判断对象属性是否存在

```javascript
// 方式一：if 判断
if (obj.alias) { ... }

// 方式二：三元运算符
obj.alias ? obj.alias : null

// 方式三：短路运算
obj.alias || obj.nameCn
```

## 可选链操作符

```javascript
// item.priceQuoted.alias 必须先保证 priceQuoted 存在
item.priceQuoted.alias ? item.priceQuoted.alias : item.product.nameCn

// 如果 alias 不存在：
// - 属性存在但值是 undefined/null/''/0/NaN/false → 判断为假
// - 推荐使用 ?. 链式判断：
item.priceQuoted?.alias ?? item.product.nameCn
```

## 常见问题

### 1. `<u--textarea>` 无法手动换行

**解决**：将 `confirmType` 属性由默认的 `done` 改为 `null`。

### 2. `scroll-view` 滚动条不显示

**步骤**：
1. 给 `scroll-view` 固定高度和宽度
2. 添加 CSS：

```css
.custom-scroll ::v-deep ::-webkit-scrollbar {
  width: 4px !important;
  height: 1px !important;
  background: #ccc !important;
  -webkit-appearance: auto !important;
  display: block;
}

.custom-scroll ::v-deep ::-webkit-scrollbar-thumb {
  border-radius: 10px !important;
  box-shadow: inset 0 0 5px rgba(0, 0, 0, 0.2) !important;
  background: #7b7979 !important;
}

.custom-scroll ::v-deep ::-webkit-scrollbar-track {
  background: #FFFFFF !important;
}
```

### 3. 字符串比较不一致（空格/大小写）

```javascript
// ❌ 问题：nameCn 和 name 内容相同但比较结果是 false
this.quotationlist.find(x => x.product.nameCn === item.name)

// ✅ 解决：统一处理空格和大小写
this.quotationlist.find(x => {
  const nameCn = String(x.product.nameCn).trim().toLowerCase()
  const itemName = String(item.name).trim().toLowerCase()
  return nameCn === itemName
})
```

## 键盘组件传参

```javascript
// 基础参数
beenOut          // 当前实际数据（vuex 存储）
shouldOut        // 客户需要的数量
originalNumber   // 同步 e.number，区别在于 number 用于显示，originalValue 用于计算
Defaults         // 默认值
e.quantity       // 预期数量
value            // 框中显示的内容（e.number 默认是空的）

// 事件
@showBoard       // 启动键盘
@delete          // 超出取值范围时设置 e.number 为 null
@change          // 加减操作

// 限制
max              // 最大值
disablePlus      // 禁用加号
disableDel       // 禁用减号

// 标识
shelfId          // 货架 id
index            // 当前操作的产品 itemCode

// 批量操作
originalQuantity              // 同 quantity
allComfirmOutStockNum         // 选择了多少箱
originalAllComfirmOutStockNum // 当前产品的规格
```

### 键盘弹窗触发参数

```javascript
showKeyBoard    // 触发显示弹窗
max             // 最大值
quantity        // 当前框中显示的值
@closeBoard     // 关闭弹窗
title           // 标题
ifFloat         // 是否包含小数
shelfId         // 货架 Id
index           // 当前操作的产品 itemCode
@change         // 值变化
```

## UniApp 状态字段

```
isTrue          // 库存是否充足
isTemp          // 是否还有库存
isExpiry        // 产品过期
isDisablePlus   // 禁用数字组件
```

### 订单状态组合

| status | collectStatus | 状态说明 |
|--------|---------------|---------|
| `pending` | `pending` | 待确认 |
| `ordered` | `pending` | 待收货 |
| `ordered` | `partial` | 部分收货 |
| `done` | `all` | 全部收货 |
| `done` | `none` | 全部没来 |
| `ordered` | `partial` | 部分收货 |
| `isBin: true`, status `cancelled` | - | 已经删除 |

## 客户移动端业务字段

### 订单状态

```
pending     待处理
picking     打包中
picked      打包完成
ordered     待收货
shipping    待配送
delivered   配送完成
complete    完成
```

### 商品展示

```
isOther: true              // 分类页（新品推荐、搜索）
isActiveLoog: true         // 特价促销
isActive: true             // 今日疯抢
isSale                     // 是否下架
isBin                      // 是否删除
isActive                   // 是否合作
isValid                    // 是否有效
```

### 促销字段

```
goodPromotionLong / isShowLongType     // 特价促销
goodPromotionShort / isShowShortType   // 限时抢购
```

### 赠品相关

```
freeGood              // 赠品有哪些
goodMarketing         // 赠品的设置
originGoodMarketing   // 赠品原价设置
```

### 价格字段

```
goodOrigin            // 原价
goodPriceBargain      // 协议价
averagePrice          // 购物车某个商品的总价
activePrice           // 商品的库存和活动状态
showNum               // 省了多少钱
```

### 为什么 priceStructure 是数组？

因为某些商品有多个价格：协议价、折扣价、原价。如果折扣价批次买完了还需要继续买，只能购买原价的，所以会存在多个价格。

### 合作商关系

```
saleSupplier          // 合作商 id
saleSupplierSetting   // 合作商设置
```

### 采购单相关 ID

| 名称 | 含义 |
|------|------|
| 采购单 ID | 整个采购订单的唯一标识 |
| PO 单品 ID | 某个特定采购订单中具体产品信息的唯一标识（仅在当前采购订单有效）|
| 产品 ID | 产品本身的 ID，所有订单中相同产品共享 |
| 报价 ID | 报价的唯一标识 |

## 英文 UI 规范

| 场景 | 推荐写法 | 示例 |
|------|---------|------|
| 普通文本 | `today / tomorrow` | `I will process it tomorrow.` |
| 句子开头 | `Today / Tomorrow` | `Today we update the data.` |
| 按钮、Tab、标题 | `Today / Tomorrow`（首字母大写）| `Today Orders, Tomorrow Plan` |

## 调试技巧

### 获取元素宽度

```javascript
document.getElementById('text-break-box')?.offsetWidth
```

### 在 template 中打印

在 Vue 模板中可以直接打印数据做调试：

```vue
<template>
  <div>{{ console.log(data) }}</div>
</template>
```

### style 样式调试

很多后台页面的样式规范在 `<style scoped>` 中：

```scss
.n-input,
.n-select,
.n-cascader {
  width: 250px;
}

:deep(.long .n-form-item-label) {
  white-space: pre-wrap;
  line-height: 1.5;
}
```

## App 打包流程

1. `pro` 文件版本更改（`manifest.json` 里的 `versionName` 和 `versionCode`）
2. 制作应用 wgt 包（HBuilderX 发行 → 原生 App - 制作应用 wgt 包）
3. 进入打包好的文件夹，将 wgt 文件上传至后台

## 常见业务场景

### Date 类型处理

```javascript
// 2026-01-07T16:00:00.000Z
// 表示 UTC 时间 2026-01-07 16:00:00
// 中国（UTC+8）本地时间：2026-01-08 00:00:00

// T: 时间分隔符
// Z: Zulu Time = UTC 时间
```

### 账单打印

```javascript
// 共享打印账单样式（dev 和 pro 表示新加坡）
${env === 'dev' || env === 'pro' ? billTemp.css : billTemp.myscss}
```

### CN/DN 账单

- **CN（Credit Note）**：抵扣最后要付款的金额
- **DN（Debit Note）**：累加最后要付款的金额

### 合并账单（isOneBill）

在订单详情中可切换是否合并账单。

查账接口会返回 `bills` 数组字段，当订单存在售后问题时会产生多条数据。当 `isOneBill` 为 true 时导出 PDF 账单会合并。

### 代理客户

二手贩子，赚取中间商差价。

### 采购单完成

采购单必须**上传凭证之后**才会变成已完成状态。

### 切菜业务

公司所有切菜都在马来西亚加工车间，针对新加坡和新山客户订单进行处理：
- 截单时间之前：当天送到
- 截单时间之后：第二天才能送

### TIN 码和 UUID（税务）

- **TIN 码**：企业的唯一标识符
- **UUID**：税务系统中的 id

### 预览账单

需要通过 `window.open()` 打开新页面：

```javascript
const url = `预览账单地址?name=${billId}&type=${pdfType}`
window.open(url)

// 接收端获取参数
const getQueryString = (key) => {
  const match = window.location.search.match(new RegExp(`[?&]${key}=([^&]*)`))
  return match ? decodeURIComponent(match[1]) : null
}
```
