# CSS 布局

## 文字不换行与溢出省略

```css
display: block;                /* 块级元素 */
white-space: nowrap;           /* 不换行（wrap 为换行）*/
overflow: hidden;              /* 超出部分不显示 */
text-overflow: ellipsis;       /* 超出显示省略号 */
```

## 块级元素、行内元素、行内块元素

**块级元素**
- 会产生换行，占据父元素整行
- 可设置宽高
- 代表：`<div>`、`<header>`、`<section>`、`<footer>`
- `display: block`

**行内元素**
- 不能设置宽高，不会换行
- 根据内容自适应宽度
- 只能包含文本和其他行内元素
- 代表：`<span>`、`<a>`、`<img>`（严格说是行内块）
- `display: inline`

**行内块元素**
- 结合块和行内特性：同行显示但可设置宽高
- 代表：`<img>`、`<button>`、`<input>`
- `display: inline-block`

## Flex 弹性布局

```css
display: flex;

flex-direction: row | column;           /* 主轴方向：水平/垂直 */
flex-wrap: nowrap | wrap;               /* 是否换行 */

justify-content:                        /* 主轴对齐 */
  flex-start |        /* 左对齐（默认）*/
  flex-end |          /* 右对齐 */
  center |            /* 居中 */
  space-between |     /* 两端对齐 */
  space-around;       /* 分散对齐 */

align-items:                            /* 次轴对齐 */
  flex-start | flex-end | center | baseline;

align-content: ...;                     /* 多行对齐 */

flex: 1;                                /* 填充剩余空间 */
flex-grow: 1;                           /* 平分剩余空间 */
gap: 10px;                              /* 子元素间距 */
```

### 固定尺寸不压缩（表格表头对齐）

```css
flex: 0 0 130rpx;
/* 等价于 */
flex-grow: 0;      /* 不分配剩余空间 */
flex-shrink: 0;    /* 不压缩 */
flex-basis: 130rpx; /* 宽度 */
```

## Grid 网格布局

```css
display: inline-grid;
grid-template-areas: "a1 a1 a1 a2";
grid-template-rows: repeat(1, 1fr);
grid-template-columns: repeat(4, 1fr);

/* 子元素指定位置 */
.item { grid-area: a1; }
```

## 盒子居中的三种方法

### 方法一：Flex

```css
display: flex;
justify-content: center;
align-items: center;
```

### 方法二：Position

```css
position: absolute;
top: 50%;
left: 50%;
transform: translate(-50%, -50%);
```

### 方法三：JS 动态计算

```javascript
element.style.left = (window.innerWidth - element.offsetWidth) / 2 + 'px'
```

## Transform 属性

对元素做 2D 或 3D 变换，不触发重排。

```css
transform: translate(x, y);    /* 平移 */
transform: rotate(45deg);      /* 旋转（正数顺时针）*/
transform: scale(x, y);        /* 缩放 */
transform: skew(x, y);         /* 倾斜 */
```

## 伪类 vs 伪元素选择器

### 伪类（`:`）- 元素的状态或行为

```css
:hover          /* 鼠标悬停 */
:focus          /* 获得焦点 */
:active         /* 被点击 */
:first-child    /* 父元素的第一个子元素 */
:nth-child(n)   /* 父元素的第 n 个子元素 */
```

### 伪元素（`::`）- 元素的一部分

```css
::before        /* 内容前插入 */
::after         /* 内容后插入 */
```

## 竖屏判断

```css
@media all and (orientation: portrait) {
  /* 竖屏时的样式 */
}
```

- `@media`：判断环境
- `all`：不同设备的屏幕
- `and`：添加条件
- `orientation: portrait`：竖向

## Sass、sass-loader、node-sass 区别

- **sass**：一种 CSS 预处理器语言
- **node-sass**：Node.js 环境下连接 libSass 库的桥梁（已过时，现在推荐 dart-sass）
- **sass-loader**：在 webpack 配置中，将 Sass 编写的样式文件转成常规 CSS

## Sass 嵌套选择器区别

```scss
.container { .title { color: red; } }
/* 等价于 .container .title - 任意层级 */

.container { & > .title { color: red; } }
/* 等价于 .container > .title - 仅直接子元素 */
```

## 移动端滚动条美化

```scss
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

## 安全区域适配（UniApp）

```css
/* 顶部偏移（状态栏 + 导航栏）*/
top: calc(var(--window-top) + var(--status-bar-height));

/* 底部安全区 */
bottom: calc(var(--window-bottom));
```

- `--status-bar-height`：状态栏高度（最顶部信号、时间、电量那条）
- `--window-top`：导航栏高度（标题和返回按钮所在）
- `--window-bottom`：底部安全区

**注意**：移动端设备上 `--window-top` 通常为 0，因为 UniApp 会自动处理导航栏位置。

## 不常用但常见的样式

```css
text-align: center;             /* 文字居中 */
margin: 0 auto;                 /* 盒子居中（需要有宽度）*/

/* 背景图简写 */
background: url('./img.png') no-repeat center / 400px 290px;
/* no-repeat: 不重复
   center: 位置居中
   400px 290px: 宽高 */
```

## flex 实现表格对齐

```css
/* 父容器 */
.table-row {
  display: flex;
  align-items: center;
  justify-content: flex-start;
}

/* 子容器用固定宽度 */
.col {
  flex: 0 0 130rpx;
}
```

表头和表体的每一列都能左对齐，避免内容不同导致错位。
