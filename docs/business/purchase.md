# 采购与入库

## 采购单完整流程

```
采购单录入 → 采购单列表 → 点击"更多"进入 PO 流程
    ↓
上传 Invoice
    ↓
审核列表（初审 + 复审）
    ↓
财务管理中创建对应的发票
    ↓
上传税务发票
    ↓
完成
```

**注意**：采购单只有在**上传凭证之后**才会变成已完成状态。

## 预付款 PO 审核流程

### 多维状态管理

预付款 PO 采用 4 个独立状态字段并行流转：

```typescript
status:              'pending' | 'ordered' | 'partial' | 'done' | 'cancelled'
auditStatus:         'pending' | 'review' | 'rejected' | 'confirmed'
collectStatus:       'pending' | 'partial' | 'all' | 'none'
prePaidPaymentStatus:'none' | 'partial' | 'all'
```

每个维度 4-5 个取值，组合起来十几种合法业务状态。

### 订单状态组合

| status | collectStatus | 含义 |
|--------|---------------|------|
| `pending` | `pending` | 待确认 |
| `ordered` | `pending` | 待收货 |
| `ordered` | `partial` | 部分收货 |
| `done` | `all` | 全部收货 |
| `done` | `none` | 全部没来 |
| `cancelled` + `isBin: true` | - | 已删除 |

## 采购单 ID 体系

| ID 名称 | 含义 |
|---------|------|
| **采购单 ID** | 整个采购订单的唯一标识 |
| **PO 单品 ID** | 某个特定采购订单中具体产品信息的唯一标识，仅在当前采购订单有效 |
| **产品 ID** | 产品本身的 ID，所有订单中相同产品共享 |
| **报价 ID** | 报价的唯一标识 |

**重点理解**：
- **产品 ID**：指向产品本身，所有订单中的相同产品都共享一个 ID
- **PO 单品 ID**：针对某个特定采购订单中的具体产品信息，会随着每个采购订单的不同而变化

## 收货入库相关表

| 表名 | 作用 |
|------|------|
| `RealProduct` | 收货的实际库存（批次维度）|
| `Stock` | 货位维度的库存 |
| `StockRecord` | 库存记录 |
| `CollectOrderItem` | PO 收货之后入库产生的数据 |

## RealProduct 和 Stock 的关系

**RealProduct** 是在收货（采购入库）时创建的，代表一批实体商品：

```
每次采购收货 → 生成一个 RealProduct
   ↓
分配唯一 itemCode（批次码）
   ↓
记录：
  - 是什么商品
  - 从哪个采购单来的
  - 生产日期
  - 保质期
  - 总数量（quantity）

quantity = 这批货不管放在哪里，一共还剩多少
```

**Stock** 是货位维度的库存：

```
shelf + itemCode 组合 → 某货位上这批货放了多少
同一批货（同一 itemCode）可以分散在多个货位 → 对应多条 Stock 记录
```

### 关系公式

```
RealProduct.quantity ≈ Σ Stock.quantity（where itemCode 相同）
```

## realProducts 多条数据场景

在 `purchaseOrderItem` 中，什么情况下 `realProducts` 字段会存在多条数据？

**当采购时录入多个保质期，并且填写了货柜号的情况。**

## ItemCode 概念

- **ItemCode** 代表 PO 中对应的产品
- 不同的 PO 中**相同产品**的 `ItemCode` 是**不同的**
- 因此 `RealProduct` 记录的是 `ItemCode` 对应的实际库存

## 收货修改保质期

### 什么时候需要用户在收货时确认保质期？

**条件**：
1. 采购时录入了保质期
2. 产品不是时蔬菜和水果

### 普通 PO 需要多个条件

**非本地产品**（本地产品没有货柜号）的情况，才需要在收货时确认保质期。

### 收货路径

```
pendingDetails/recordShelf/index.vue
```

## PO 完成后入库记录

当 PO 完成收货并入库后，可以在**工作台的入库记录**中查看。

## 采购单 status 全值

```typescript
status: 'pending' | 'ordered' | 'partial' | 'done' | 'cancelled'
```

- `pending`：待处理
- `ordered`：已下单
- `partial`：部分收货
- `done`：完成
- `cancelled`：已取消

## 外部调货单（托管商）

托管商户只提供货，**通过外部调货单**调货到公司仓库，然后由 EBUY 负责销售、配单送货、售后。

最后每月按照单个商品生成月度佣金账单，跟托管商收取销售佣金。
