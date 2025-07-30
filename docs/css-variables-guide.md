# CSS 变量应用指南

## 概述

本文档详细说明了 NazoPrism 项目中使用的 Material Design 3 主题系统 CSS 变量。这些变量由主题管理器动态生成，用于实现一致的设计语言和主题切换功能。

**重要说明：所有 CSS 变量的值都采用 `rgb(R G B)` 格式，不包含 alpha 通道。**

## 变量格式说明

所有 CSS 变量的值都遵循以下格式：
```css
--variable-name: rgb(255 159 152);
```

- 使用 `rgb()` 函数
- 三个数值分别代表红、绿、蓝通道
- 数值范围：0-255
- 数值之间用空格分隔（不是逗号）
- 不包含 alpha 透明度通道

## 变量分类

### 1. 基础颜色系统

#### 主色调 (Primary)
- `--md-primary`: 主要品牌色，用于重要的交互元素
- `--md-primary-dim`: 主色调的暗化版本
- `--md-primary-container`: 主色调容器背景
- `--md-inverse-primary`: 反转主色调
- `--md-on-primary`: 主色调上的文本颜色
- `--md-on-primary-container`: 主色调容器上的文本颜色

#### 次要色调 (Secondary)
- `--md-secondary`: 次要色调，用于辅助元素
- `--md-secondary-dim`: 次要色调的暗化版本
- `--md-secondary-container`: 次要色调容器背景
- `--md-on-secondary`: 次要色调上的文本颜色
- `--md-on-secondary-container`: 次要色调容器上的文本颜色

#### 第三色调 (Tertiary)
- `--md-tertiary`: 第三色调，用于强调和装饰
- `--md-tertiary-dim`: 第三色调的暗化版本
- `--md-on-tertiary`: 第三色调上的文本颜色

### 2. 表面颜色系统

#### 基础表面
- `--md-surface`: 基础表面颜色
- `--md-surface-dim`: 暗化的表面颜色
- `--md-surface-bright`: 明亮的表面颜色
- `--md-surface-variant`: 表面变体颜色
- `--md-inverse-surface`: 反转表面颜色

#### 表面容器层级
- `--md-surface-container-lowest`: 最低层级容器
- `--md-surface-container-low`: 低层级容器
- `--md-surface-container`: 标准容器
- `--md-surface-container-high`: 高层级容器
- `--md-surface-container-highest`: 最高层级容器

### 3. 文本颜色系统

#### 表面文本颜色
- `--md-on-surface`: 表面上的主要文本颜色
- `--md-on-surface-dim`: 表面上的暗化文本颜色
- `--md-on-surface-bright`: 表面上的明亮文本颜色
- `--md-on-surface-variant`: 表面变体上的文本颜色
- `--md-on-inverse-surface`: 反转表面上的文本颜色

#### 容器文本颜色
- `--md-on-surface-container-lowest`: 最低层级容器上的文本
- `--md-on-surface-container-low`: 低层级容器上的文本
- `--md-on-surface-container`: 标准容器上的文本
- `--md-on-surface-container-high`: 高层级容器上的文本
- `--md-on-surface-container-highest`: 最高层级容器上的文本

### 4. 错误状态颜色

- `--md-error`: 错误状态主色
- `--md-error-container`: 错误状态容器背景
- `--md-on-error`: 错误状态上的文本颜色
- `--md-on-error-container`: 错误状态容器上的文本颜色

### 5. 边框和轮廓

- `--md-outline`: 主要轮廓颜色
- `--md-outline-variant`: 轮廓变体颜色

### 6. 形状系统 (Shape System)

#### 圆角半径
- `--md-sys-shape-corner-none`: 0px - 无圆角
- `--md-sys-shape-corner-extra-small`: 4px - 极小圆角
- `--md-sys-shape-corner-small`: 8px - 小圆角
- `--md-sys-shape-corner-medium`: 12px - 中等圆角
- `--md-sys-shape-corner-large`: 16px - 大圆角
- `--md-sys-shape-corner-extra-large`: 28px - 极大圆角
- `--md-sys-shape-corner-full`: 50% - 完全圆角

### 7. 动画系统 (Motion System)

#### 动画时长
- `--md-sys-motion-duration-short1`: 50ms - 极短动画
- `--md-sys-motion-duration-short2`: 100ms - 短动画
- `--md-sys-motion-duration-short3`: 150ms - 短动画
- `--md-sys-motion-duration-short4`: 200ms - 短动画
- `--md-sys-motion-duration-medium1`: 250ms - 中等动画
- `--md-sys-motion-duration-medium2`: 300ms - 中等动画
- `--md-sys-motion-duration-medium3`: 350ms - 中等动画
- `--md-sys-motion-duration-medium4`: 400ms - 中等动画
- `--md-sys-motion-duration-long1`: 450ms - 长动画
- `--md-sys-motion-duration-long2`: 500ms - 长动画
- `--md-sys-motion-duration-long3`: 550ms - 长动画
- `--md-sys-motion-duration-long4`: 600ms - 长动画
- `--md-sys-motion-duration-theme`: 1500ms - 主题切换动画

#### 缓动函数
- `--md-sys-motion-easing-linear`: linear - 线性缓动
- `--md-sys-motion-easing-standard`: cubic-bezier(0.2, 0, 0, 1) - 标准缓动
- `--md-sys-motion-easing-emphasized`: cubic-bezier(0.2, 0, 0, 1) - 强调缓动
- `--md-sys-motion-easing-decelerated`: cubic-bezier(0, 0, 0.2, 1) - 减速缓动
- `--md-sys-motion-easing-accelerated`: cubic-bezier(0.4, 0, 1, 1) - 加速缓动

### 8. 排版系统 (Typography System)

#### 显示文本
- `--md-sys-typescale-display-large`: 57px/64px - 大型显示文本
- `--md-sys-typescale-display-medium`: 45px/52px - 中型显示文本
- `--md-sys-typescale-display-small`: 36px/44px - 小型显示文本

#### 标题文本
- `--md-sys-typescale-headline-large`: 32px/40px - 大标题
- `--md-sys-typescale-headline-medium`: 28px/36px - 中标题
- `--md-sys-typescale-headline-small`: 24px/32px - 小标题

#### 标题文本
- `--md-sys-typescale-title-large`: 22px/28px - 大标题
- `--md-sys-typescale-title-medium`: 16px/24px - 中标题
- `--md-sys-typescale-title-small`: 14px/20px - 小标题

#### 正文文本
- `--md-sys-typescale-body-large`: 16px/24px - 大正文
- `--md-sys-typescale-body-medium`: 14px/20px - 中正文
- `--md-sys-typescale-body-small`: 12px/16px - 小正文

#### 标签文本
- `--md-sys-typescale-label-large`: 14px/20px - 大标签
- `--md-sys-typescale-label-medium`: 12px/16px - 中标签
- `--md-sys-typescale-label-small`: 11px/16px - 小标签

### 9. 阴影系统 (Elevation System)

- `--md-sys-elevation-level0`: none - 无阴影
- `--md-sys-elevation-level1`: 0 1px 2px 0 rgba(0, 0, 0, 0.3), 0 1px 3px 1px rgba(0, 0, 0, 0.15) - 1级阴影
- `--md-sys-elevation-level2`: 0 1px 2px 0 rgba(0, 0, 0, 0.3), 0 2px 6px 2px rgba(0, 0, 0, 0.15) - 2级阴影
- `--md-sys-elevation-level3`: 0 4px 8px 3px rgba(0, 0, 0, 0.15), 0 1px 3px 0 rgba(0, 0, 0, 0.3) - 3级阴影
- `--md-sys-elevation-level4`: 0 6px 10px 4px rgba(0, 0, 0, 0.15), 0 2px 3px 0 rgba(0, 0, 0, 0.3) - 4级阴影
- `--md-sys-elevation-level5`: 0 8px 12px 6px rgba(0, 0, 0, 0.15), 0 4px 4px 0 rgba(0, 0, 0, 0.3) - 5级阴影

### 6. 交互状态变量

每个主要颜色都有对应的交互状态变量：

#### 主色调交互状态
- `--md-primary-hover`: 悬停状态
- `--md-primary-focus`: 聚焦状态
- `--md-primary-pressed`: 按下状态
- `--md-primary-dragged`: 拖拽状态
- `--md-primary-disabled`: 禁用状态

#### 次要色调交互状态
- `--md-secondary-hover`: 悬停状态
- `--md-secondary-focus`: 聚焦状态
- `--md-secondary-pressed`: 按下状态
- `--md-secondary-dragged`: 拖拽状态
- `--md-secondary-disabled`: 禁用状态

#### 第三色调交互状态
- `--md-tertiary-hover`: 悬停状态
- `--md-tertiary-focus`: 聚焦状态
- `--md-tertiary-pressed`: 按下状态
- `--md-tertiary-dragged`: 拖拽状态
- `--md-tertiary-disabled`: 禁用状态

#### 错误状态交互
- `--md-error-hover`: 悬停状态
- `--md-error-focus`: 聚焦状态
- `--md-error-pressed`: 按下状态
- `--md-error-dragged`: 拖拽状态
- `--md-error-disabled`: 禁用状态

#### 表面交互状态
- `--md-surface-hover`: 表面悬停状态
- `--md-surface-focus`: 表面聚焦状态
- `--md-surface-pressed`: 表面按下状态
- `--md-surface-dragged`: 表面拖拽状态
- `--md-surface-disabled`: 表面禁用状态

#### 表面变体交互状态
- `--md-surface-variant-hover`: 表面变体悬停状态
- `--md-surface-variant-focus`: 表面变体聚焦状态
- `--md-surface-variant-pressed`: 表面变体按下状态
- `--md-surface-variant-dragged`: 表面变体拖拽状态
- `--md-surface-variant-disabled`: 表面变体禁用状态

#### 容器交互状态
- `--md-primary-container-hover`: 主色调容器悬停状态
- `--md-primary-container-focus`: 主色调容器聚焦状态
- `--md-primary-container-pressed`: 主色调容器按下状态
- `--md-primary-container-dragged`: 主色调容器拖拽状态
- `--md-primary-container-disabled`: 主色调容器禁用状态

- `--md-secondary-container-hover`: 次要色调容器悬停状态
- `--md-secondary-container-focus`: 次要色调容器聚焦状态
- `--md-secondary-container-pressed`: 次要色调容器按下状态
- `--md-secondary-container-dragged`: 次要色调容器拖拽状态
- `--md-secondary-container-disabled`: 次要色调容器禁用状态

- `--md-error-container-hover`: 错误状态容器悬停状态
- `--md-error-container-focus`: 错误状态容器聚焦状态
- `--md-error-container-pressed`: 错误状态容器按下状态
- `--md-error-container-dragged`: 错误状态容器拖拽状态
- `--md-error-container-disabled`: 错误状态容器禁用状态

## 使用指南

### 1. 基本使用

```css
.button {
  background-color: var(--md-primary);
  color: var(--md-on-primary);
}

.card {
  background-color: var(--md-surface-container);
  color: var(--md-on-surface-container);
}
```

### 2. 交互状态使用

```css
.button {
  background-color: var(--md-primary);
  transition: background-color 0.2s ease;
}

.button:hover {
  background-color: var(--md-primary-hover);
}

.button:focus {
  background-color: var(--md-primary-focus);
}

.button:active {
  background-color: var(--md-primary-pressed);
}

.button:disabled {
  background-color: var(--md-primary-disabled);
}
```

### 3. 层级使用

```css
.app-background {
  background-color: var(--md-surface);
}

.card-low {
  background-color: var(--md-surface-container-low);
}

.card-high {
  background-color: var(--md-surface-container-high);
}

.modal {
  background-color: var(--md-surface-container-highest);
}
```

### 4. 错误状态使用

```css
.error-message {
  background-color: var(--md-error-container);
  color: var(--md-on-error-container);
  border: 1px solid var(--md-error);
}

.error-button {
  background-color: var(--md-error);
  color: var(--md-on-error);
}
```

### 5. 形状系统使用

```css
.card {
  border-radius: var(--md-sys-shape-corner-large);
}

.button {
  border-radius: var(--md-sys-shape-corner-full);
}

.dialog {
  border-radius: var(--md-sys-shape-corner-extra-large);
}
```

### 6. 动画系统使用

```css
.button {
  transition: 
    background-color var(--md-sys-motion-duration-short4) var(--md-sys-motion-easing-standard),
    transform var(--md-sys-motion-duration-short2) var(--md-sys-motion-easing-emphasized);
}

.theme-transition {
  transition: all var(--md-sys-motion-duration-theme) var(--md-sys-motion-easing-emphasized);
}

.modal {
  animation-duration: var(--md-sys-motion-duration-medium2);
  animation-timing-function: var(--md-sys-motion-easing-decelerated);
}
```

### 7. 排版系统使用

```css
.page-title {
  font-size: var(--md-sys-typescale-display-large);
  line-height: var(--md-sys-typescale-display-large);
}

.section-heading {
  font-size: var(--md-sys-typescale-headline-medium);
  line-height: var(--md-sys-typescale-headline-medium);
}

.body-text {
  font-size: var(--md-sys-typescale-body-medium);
  line-height: var(--md-sys-typescale-body-medium);
}

.button-label {
  font-size: var(--md-sys-typescale-label-large);
  line-height: var(--md-sys-typescale-label-large);
}
```

### 8. 阴影系统使用

```css
.card {
  box-shadow: var(--md-sys-elevation-level1);
}

.floating-button {
  box-shadow: var(--md-sys-elevation-level3);
}

.modal {
  box-shadow: var(--md-sys-elevation-level5);
}

.card:hover {
  box-shadow: var(--md-sys-elevation-level2);
}
```

## 最佳实践

### 1. 颜色对比度
- 始终使用对应的 `on-*` 变量作为文本颜色
- 确保足够的对比度以满足可访问性要求

### 2. 层级关系
- 使用不同的 `surface-container` 层级来创建视觉层次
- 较高层级的元素应使用较高层级的容器颜色

### 3. 交互反馈
- 为所有交互元素添加适当的状态变化
- 使用 CSS 过渡动画来平滑状态变化

### 4. 语义化使用
- `primary`: 用于主要操作和品牌元素
- `secondary`: 用于次要操作和辅助元素
- `tertiary`: 用于强调和装饰元素
- `error`: 仅用于错误状态和警告

### 5. 形状系统最佳实践
- 使用一致的圆角半径来创建统一的视觉语言
- 较小的组件使用较小的圆角，较大的组件使用较大的圆角
- 按钮和交互元素建议使用 `corner-full` 实现完全圆角
- 卡片和容器建议使用 `corner-large` 或 `corner-extra-large`

### 6. 动画系统最佳实践
- 使用标准的动画时长来保持一致性
- 短动画（50-200ms）用于简单的状态变化
- 中等动画（250-400ms）用于复杂的过渡效果
- 长动画（450-600ms）用于页面级别的转换
- 主题切换使用 1500ms 的长动画时长
- 根据动画类型选择合适的缓动函数

### 7. 排版系统最佳实践
- 建立清晰的信息层次结构
- 使用 `display` 级别用于页面主标题
- 使用 `headline` 级别用于章节标题
- 使用 `title` 级别用于子标题
- 使用 `body` 级别用于正文内容
- 使用 `label` 级别用于按钮和标签文本

### 8. 阴影系统最佳实践
- 使用阴影来表达元素的层级关系
- Level 0: 平面元素，无阴影
- Level 1-2: 轻微浮起的元素，如卡片
- Level 3-4: 明显浮起的元素，如按钮和菜单
- Level 5: 最高层级的元素，如模态框和对话框
- 在交互状态中适当调整阴影级别

## 注意事项

1. **动态生成**: 这些变量由主题管理器根据种子颜色动态生成
2. **格式固定**: 所有变量值都是 `rgb(R G B)` 格式，不包含 alpha 通道
3. **自动更新**: 当主题色发生变化时，所有变量会自动更新
4. **兼容性**: 确保在使用时考虑 CSS 变量的浏览器兼容性
5. **性能**: 避免频繁修改这些变量，因为会触发大量重绘

## 主题管理器集成

这些变量通过 `theme-manager.ts` 进行管理：

- 颜色提取：从背景图片中提取主色调
- 主题生成：基于 Material Design 3 规范生成完整主题
- 动态应用：实时更新 CSS 变量到文档根元素
- 状态保存：保存用户的主题偏好设置

通过这套完整的变量系统，项目能够实现一致的视觉设计和流畅的主题切换体验。