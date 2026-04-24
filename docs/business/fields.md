# 数据库字段含义

## 采购 PO 相关字段

### PO 状态字段（预付款 PO 多维状态）

```typescript
status:              'pending' | 'ordered' | 'partial' | 'done' | 'cancelled'
auditStatus:         'pending' | 'review' | 'rejected' | 'confirmed'
collectStatus:       'pending' | 'partial' | 'all' | 'none'
prePaidPaymentStatus:'none' | 'partial' | 'all'
deliveryStatus:       string
```

### ID 体系

| 字段 | 含义 |
|------|------|
| **采购单 ID** | 整个采购订单的唯一标识 |
| **PO 单品 ID** | 某个特定采购订单中具体产品信息的唯一标识，仅当前订单有效 |
| **产品 ID** | 产品本身的 ID，所有订单中相同产品共享 |
| **报价 ID** | 报价的唯一标识 |

## 备货单相关字段

```
prepareOrder                        备货单 id
prepareOrderItem                     备货单单品 id
prepareOrderProductProportion        列表中的某一项 id
```

## 键盘组件字段

### 基础参数

| 字段 | 含义 |
|------|------|
| `beenOut` | 现在实际的数据（通过 vuex 存储）|
| `shouldOut` | 客户需要的数量 |
| `originalNumber` | 同步 `e.number`，区别：number 用于显示，originalValue 用于计算 |
| `Defaults` | 默认值 |
| `e.quantity` | 预期数量 |
| `value` | 框中显示的内容（`e.number` 默认是空的）|

### 事件

```
@showBoard    启动键盘
@delete       超出取值范围则设置 e.number 为 null
@change       加减操作
```

### 限制字段

```
max             最大值
disablePlus     禁用加号
disableDel      禁用减号
```

### 位置标识

```
shelfId         货架 id
index           当前操作的产品 itemCode
```

### 批量场景

```
originalQuantity                当前产品的规格（同 quantity）
allComfirmOutStockNum            选择了多少箱
originalAllComfirmOutStockNum    当前产品的规格
```

## 库存状态字段

```
isTrue           库存是否充足
isTemp           是否还有库存
isExpiry         产品过期
isDisablePlus    禁用数字组件
```

## ItemCode 概念

**ItemCode**：唯一表示某一个商品，类似商品 SKU。

- 不同的 PO 中**相同产品**的 ItemCode 是**不同的**
- ItemCode 代表 PO 中对应的产品

## 客户端订单状态

```
pending     待处理
picking     打包中
picked      打包完成
ordered     待收货
shipping    待配送
delivered   配送完成
complete    完成
```

## 商品展示字段

```
isOther: true                     // 分类页（新品推荐、搜索）
isActiveLoog: true                // 特价促销
isActive: true                    // 今日疯抢 / 是否合作
isSale                            // 是否下架
isBin                             // 是否删除
isValid                           // 是否有效
```

## 促销字段

```
goodPromotionLong / isShowLongType     // 特价促销
goodPromotionShort / isShowShortType   // 限时抢购
```

## 赠品字段

```
freeGood                 // 赠品有哪些
goodMarketing            // 赠品的设置
originGoodMarketing      // 赠品原价设置
```

## 价格字段

```
goodOrigin               // 原价
goodPriceBargain         // 协议价
averagePrice             // 购物车某个商品的总价
activePrice              // 商品的库存和活动状态
showNum                  // 省了多少钱
```

## priceStructure 为什么是数组

因为某些商品有多个价格：协议价、折扣价、原价。如果折扣价批次买完了还需要继续买，只能购买原价的，所以会存在多个价格。

## 合作商字段

```
saleSupplier           // 合作商 id
saleSupplierSetting    // 合作商设置
```

## 库存核心表

| 表名 | 含义 |
|------|------|
| `RealProduct` | 收货的实际库存（批次维度）|
| `Stock` | 货位维度的库存 |
| `StockRecord` | 库存记录 |
| `CollectOrderItem` | PO 收货入库后产生的数据 |
| `ProductGroup` | 领货模板 |
| `SaleOrder` | 领货单 |
| `GoodLowestPrice` | 商品最低售价 |

## 生产库存相关表

| 表名 | 含义 |
|------|------|
| `SiteOrder` | 生产盘点单（按部门+配送日期）|
| `SiteOrderItem` | 盘点单中每个产品的记录 |
| `SiteRecord` | 生产库存变动记录 |
| `ProductionStockLoss` | 生产损耗记录 |

## 寄售相关表

| 表名 | 含义 |
|------|------|
| `ConsigneeOrder` | 寄售订单表（订单层面）|
| `ConsigneeOrderProcessing` | 配单流程记录表 |

## 关键字段的含义解释

### orgQuantity2B vs quantity2B

- **orgQuantity2B**：系统根据公式自动算出来的库存值（上次盘点量 + 入库 - 配单 - 退货 - 损耗），代表"理论上应该有多少"
- **quantity2B**：员工盘点时手动输入的实际数量，代表"实际点了多少"

### realProducts 字段

在 `purchaseOrderItem` 中，什么情况下 `realProducts` 字段会存在多条数据？

**答**：当采购时录入多个保质期，**并且填写了货柜号**的情况。

### RealProduct 和 Stock 关系

```
RealProduct.quantity ≈ Σ Stock.quantity（where itemCode 相同）
```

- **RealProduct**：收货（采购入库）时创建，代表一批实体商品。`quantity` = 这批货不管放在哪里一共还剩多少
- **Stock**：货位维度的库存。`shelf + itemCode` 组合 → 某货位上这批货放了多少

## 税务字段

- **TIN 码**：企业的唯一标识符
- **UUID**：税务系统中的 id

## 其他业务字段

```
isOneBill       判断是否合并账单
debit           应收（借方）
credit          实收（贷方）
Balance         累计欠款
```
