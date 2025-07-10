# 🌟 NazoPrism

> 一个基于 Astro 构建的现代化博客前端，采用 Material Design 3 设计语言，具有智能主题系统和流畅的用户体验。

[![Astro](https://img.shields.io/badge/Astro-5.11.0-FF5D01?style=flat-square&logo=astro)](https://astro.build/)
[![TypeScript](https://img.shields.io/badge/TypeScript-5.8.3-3178C6?style=flat-square&logo=typescript)](https://www.typescriptlang.org/)
[![Material Design 3](https://img.shields.io/badge/Material%20Design-3-1976D2?style=flat-square&logo=material-design)](https://m3.material.io/)
[![License](https://img.shields.io/badge/License-MIT-green?style=flat-square)](LICENSE)

## ✨ 项目概述

NazoPrism 是一个高性能、现代化的博客前端应用，采用 **Astro 5.11.0** 框架构建，完全遵循 **Material Design 3** 设计规范。项目具有智能主题系统、动态背景轮播、Web Workers 优化等先进特性，为用户提供卓越的阅读体验。

### 🎯 设计理念

- **🎨 Material Design 3**: 完全遵循 Google 最新设计语言
- **🌈 智能主题**: 基于背景图片自动提取主题色
- **⚡ 性能优先**: Web Workers + 预加载 + 代码分割
- **📱 响应式**: 完美适配各种设备和屏幕尺寸
- **♿ 可访问性**: 符合 WCAG 2.1 标准

## 🛠️ 技术栈

### 核心框架

- **[Astro](https://astro.build/)** `5.11.0` - 现代化静态站点生成器
- **[TypeScript](https://www.typescriptlang.org/)** `5.8.3` - 类型安全的 JavaScript
- **[Vite](https://vitejs.dev/)** - 快速构建工具 (Astro 内置)

### 设计系统

- **[Material Design 3](https://m3.material.io/)** - Google 最新设计语言
- **[Material Color Utilities](https://github.com/material-foundation/material-color-utilities)** `0.3.0` - 官方颜色工具库
- **CSS Variables** - 动态主题系统

### 开发工具

- **[ESLint](https://eslint.org/)** `9.30.1` - 代码质量检查
- **[Prettier](https://prettier.io/)** `3.6.2` - 代码格式化
- **[Astro Check](https://docs.astro.build/en/reference/cli-reference/#astro-check)** - 类型检查

## 🚀 核心特性

### 🎨 Material Design 3 设计系统

- **🌈 智能主题色**: 基于背景图片自动提取 Material You 主题色
- **🎯 动态配色**: 实时同步主题色到所有 UI 组件
- **🌓 明暗主题**: 完美支持系统偏好和手动切换
- **📐 标准组件**: 严格遵循 M3 设计规范的 UI 组件

### ⚡ 性能优化

- **🔧 Web Workers**: 图片处理和主题色提取在后台线程执行
- **📦 代码分割**: 智能分包，按需加载，减少初始加载时间
- **🖼️ 图片预加载**: 背景图片智能预加载和缓存管理
- **🎭 PJAX 导航**: 页面间无刷新切换，保持状态持久化
- **⏱️ 防抖优化**: 滚动、窗口调整等事件的高性能防抖处理

### 🎬 视觉体验

- **🌅 背景轮播**: 自动切换背景图片，支持暂停/恢复控制
- **🌊 滚动效果**: 背景模糊度随滚动位置动态变化
- **✨ 平滑动画**: 基于 M3 动画规范的过渡效果
- **📊 进度指示**: 实时显示页面滚动进度
- **🎯 Material 滚动条**: 纯正 M3 风格的自定义滚动条

### 🔧 开发体验

- **📝 TypeScript**: 100% TypeScript 覆盖，类型安全
- **🔍 代码质量**: ESLint + Prettier 自动化代码检查和格式化
- **🏗️ 模块化**: 清晰的架构分层，UI 与逻辑分离
- **🧪 零配置**: 开箱即用的开发环境
- **📱 响应式**: 移动优先的响应式设计

## 📁 项目架构

```
NazoPrism/
├── 📂 src/
│   ├── 🧩 components/              # Astro 组件层
│   │   ├── Article.astro           # 📄 文章展示组件
│   │   ├── ArticleIndex.astro      # 📋 文章列表组件
│   │   ├── Cover.astro             # 🖼️ 封面组件
│   │   ├── Footer.astro            # 🦶 页脚组件
│   │   ├── Navigation.astro        # 🧭 导航栏组件
│   │   ├── Scrollbar.astro         # 📜 滚动条组件
│   │   └── ToTop.astro             # ⬆️ 返回顶部组件
│   │
│   ├── 🏗️ layouts/                 # 布局模板
│   │   ├── BaseLayout.astro        # 🏠 基础布局
│   │   └── Layout.astro            # 📐 主布局
│   │
│   ├── 📄 pages/                   # 页面路由
│   │   ├── index.astro             # 🏠 首页
│   │   ├── about.astro             # ℹ️ 关于页
│   │   ├── login.astro             # 🔐 登录页
│   │   └── users.astro             # 👥 用户页
│   │
│   ├── ⚙️ scripts/                 # 业务逻辑层
│   │   ├── app-init.ts             # 🚀 应用初始化
│   │   ├── article-animations.ts   # ✨ 文章动画控制
│   │   ├── background-carousel.ts  # 🌅 背景轮播管理
│   │   ├── cleanup-manager.ts      # 🧹 资源清理管理
│   │   ├── global-event-manager.ts # 🌐 全局事件管理
│   │   ├── navigation.ts           # 🧭 导航栏逻辑
│   │   ├── page-visibility-manager.ts # 👁️ 页面可见性管理
│   │   ├── progress-bar.ts         # 📊 进度条控制
│   │   ├── theme-init.ts           # 🎨 主题初始化
│   │   └── to-top.ts               # ⬆️ 返回顶部逻辑
│   │
│   ├── 🎨 styles/                  # 样式系统
│   │   ├── global.css              # 🌍 全局样式
│   │   └── material-design.css     # 🎯 Material Design 3 样式
│   │
│   ├── 🔧 utils/                   # 工具函数层
│   │   ├── color-extraction-worker.ts # 🎨 颜色提取 Worker
│   │   ├── debounce.ts             # ⏱️ 防抖工具
│   │   ├── scroll-utils.ts         # 📜 滚动工具
│   │   └── theme-manager.ts        # 🌈 主题管理器
│   │
│   ├── 📝 types/                   # 类型定义
│   │   └── worker.ts               # 🔧 Worker 类型定义
│   │
│   ├── ⚙️ config.ts                # 📋 项目配置
│   └── 🌍 env.d.ts                 # 🔧 环境类型定义
│
├── 📦 public/                      # 静态资源
├── ⚙️ astro.config.mjs             # 🚀 Astro 配置
├── 📝 tsconfig.json                # 🔧 TypeScript 配置
├── 📦 package.json                 # 📋 项目依赖
├── 🎨 prettier.config.js           # ✨ 代码格式化配置
├── 🔍 eslint.config.js             # 📏 代码质量配置
└── 📖 README.md                    # 📚 项目文档
```

### 🏗️ 架构特点

- **🧩 组件化**: Astro 组件 + TypeScript 逻辑分离
- **📦 模块化**: 清晰的功能模块划分
- **🔧 工具化**: 丰富的工具函数和管理器
- **🎨 主题化**: 完整的 Material Design 3 主题系统
- **⚡ 性能化**: Web Workers + 代码分割优化

## 🚀 快速开始

### 📋 环境要求

- **Node.js** `18.0.0+` - 推荐使用 LTS 版本
- **包管理器** - npm / yarn / pnpm
- **现代浏览器** - 支持 ES2022 和 CSS Variables

### ⚡ 一键启动

```bash
# 1️⃣ 克隆项目
git clone https://github.com/bymoye/NazoPrism.git
cd NazoPrism

# 2️⃣ 安装依赖
npm install

# 3️⃣ 启动开发服务器
npm run dev
```

🎉 打开 [http://localhost:4321](http://localhost:4321) 即可预览！

### 📜 可用脚本

```bash
# 🔧 开发相关
npm run dev          # 启动开发服务器 (带类型检查)
npm run build        # 构建生产版本
npm run preview      # 预览生产版本

# 🔍 代码质量
npm run check        # TypeScript 类型检查
npm run lint         # ESLint 代码检查
npm run lint:fix     # 自动修复 ESLint 问题
npm run format       # Prettier 代码格式化
npm run format:check # 检查代码格式

# 🎯 一键操作
npm run style        # 检查代码质量和格式
npm run style:fix    # 自动修复所有代码问题
```

### ⚙️ 项目配置

编辑 `src/config.ts` 自定义项目设置：

```typescript
export const SITE_CONFIG = {
  // 🌐 站点信息
  title: 'NazoPrism',
  description: '现代化博客前端',

  // 🎨 主题配置
  theme: {
    defaultTheme: 'auto', // 'light' | 'dark' | 'auto'
    enableDynamicTheme: true, // 启用动态主题色
  },

  // 🌅 背景轮播
  carousel: {
    interval: 8000, // 切换间隔 (毫秒)
    enableAutoPlay: true,
    pauseOnHover: true,
  },

  // 🔗 API 配置 (可选)
  api: {
    baseUrl: 'https://your-api-url.com',
  },
};
```

## 🛠️ 开发指南

### 📄 添加新页面

```bash
# 在 src/pages/ 创建新页面
touch src/pages/blog.astro
```

Astro 会自动生成路由：`/blog`

### 🧩 创建新组件

```typescript
// 1. 创建 Astro 组件 (src/components/MyComponent.astro)
---
// 组件逻辑
---
<div class="my-component">
  <!-- 组件模板 -->
</div>

<style>
  /* 组件样式 (自动作用域隔离) */
</style>

// 2. 创建 TypeScript 逻辑 (src/scripts/my-component.ts)
export class MyComponentManager {
  // 组件逻辑
}
```

### 🎨 样式开发

```css
/* 全局样式 - src/styles/global.css */
:root {
  --custom-color: rgb(var(--md-sys-color-primary));
}

/* Material Design 3 样式 - src/styles/material-design.css */
.md-button {
  /* 使用 M3 设计规范 */
}
```

### 🌈 主题定制

```typescript
// 扩展主题管理器
import { ThemeManager } from './utils/theme-manager';

const themeManager = new ThemeManager();
themeManager.setCustomTheme({
  primary: [103, 80, 164],
  secondary: [125, 82, 96],
  // ... 更多颜色
});
```

## 🚀 部署指南

### 🌐 静态部署

项目构建为静态站点，可部署到任何静态托管平台：

```bash
# 构建生产版本
npm run build

# 输出目录: dist/
```

### 🔧 Vercel 部署

```bash
# 安装 Vercel CLI
npm i -g vercel

# 部署
vercel --prod
```

### 🤖 GitHub Actions 自动部署

```yaml
# .github/workflows/deploy.yml
name: Deploy to GitHub Pages
on:
  push:
    branches: [main]
jobs:
  deploy:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v4
      - uses: actions/setup-node@v4
        with:
          node-version: 18
      - run: npm ci
      - run: npm run build
      - uses: actions/deploy-pages@v3
        with:
          path: ./dist
```

## 🤝 贡献指南

我们欢迎所有形式的贡献！无论是 Bug 报告、功能建议还是代码贡献。

### 🐛 报告问题

发现 Bug？请 [创建 Issue](https://github.com/bymoye/NazoPrism/issues/new) 并包含：

- 🔍 **问题描述**: 详细描述遇到的问题
- 🔄 **复现步骤**: 如何重现这个问题
- 💻 **环境信息**: 浏览器、Node.js 版本等
- 📸 **截图**: 如果有视觉问题，请附上截图

### ✨ 贡献代码

```bash
# 1️⃣ Fork 并克隆项目
git clone https://github.com/yourusername/NazoPrism.git
cd NazoPrism

# 2️⃣ 创建功能分支
git checkout -b feature/amazing-feature

# 3️⃣ 安装依赖并开发
npm install
npm run dev

# 4️⃣ 确保代码质量
npm run style:fix  # 自动修复代码风格
npm run build      # 确保构建成功

# 5️⃣ 提交更改
git add .
git commit -m "✨ Add amazing feature"
git push origin feature/amazing-feature

# 6️⃣ 创建 Pull Request
```

### 📏 代码规范

- **🎯 TypeScript**: 使用严格的类型检查
- **🎨 代码风格**: 遵循 ESLint + Prettier 配置
- **📝 提交信息**: 使用 [约定式提交](https://www.conventionalcommits.org/zh-hans/)
- **🧪 测试**: 确保所有功能正常工作

### 🎯 提交类型

- `✨ feat`: 新功能
- `🐛 fix`: Bug 修复
- `📝 docs`: 文档更新
- `🎨 style`: 代码格式化
- `♻️ refactor`: 代码重构
- `⚡ perf`: 性能优化
- `🧪 test`: 测试相关

## 📄 许可证

本项目采用 **MIT 许可证** - 查看 [LICENSE](LICENSE) 文件了解详情。

## 🔗 相关链接

### 📚 技术文档

- **[Astro 官方文档](https://docs.astro.build/)** - 框架文档
- **[Material Design 3](https://m3.material.io/)** - 设计规范
- **[TypeScript 手册](https://www.typescriptlang.org/docs/)** - 语言文档

### 🛠️ 开发工具

- **[VS Code](https://code.visualstudio.com/)** - 推荐编辑器
- **[Astro 扩展](https://marketplace.visualstudio.com/items?itemName=astro-build.astro-vscode)** - 语法高亮
- **[Material Theme](https://marketplace.visualstudio.com/items?itemName=Equinusocio.vsc-material-theme)** - 主题

### 🌟 灵感来源

- **[Material You](https://material.io/blog/announcing-material-you)** - 动态主题设计
- **[Astro Islands](https://docs.astro.build/en/concepts/islands/)** - 架构理念

## 💬 社区与支持

### 🆘 获取帮助

- 📋 [GitHub Issues](https://github.com/bymoye/NazoPrism/issues) - 问题报告和功能请求
- 💬 [GitHub Discussions](https://github.com/bymoye/NazoPrism/discussions) - 社区讨论

### 🌟 支持项目

如果这个项目对你有帮助，请考虑：

- ⭐ 给项目点个 Star
- 🐛 报告 Bug 和建议
- 🔄 分享给其他开发者
- 💻 贡献代码

---

<div align="center">

**🌟 感谢使用 NazoPrism！**

_用 ❤️ 和 ☕ 制作_

<!-- [![Star History Chart](https://api.star-history.com/svg?repos=bymoye/NazoPrism&type=Date)](https://star-history.com/#bymoye/NazoPrism&Date) -->

</div>
