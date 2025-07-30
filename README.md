# 🌟 NazoPrism

> 一个基于 Next.js 构建的现代化博客前端，采用 Material Design 3 设计语言，具有智能主题系统和流畅的用户体验。

[![Next.js](https://img.shields.io/badge/Next.js-15.4.3-000000?style=flat-square&logo=next.js)](https://nextjs.org/)
[![React](https://img.shields.io/badge/React-19.1.0-61DAFB?style=flat-square&logo=react)](https://reactjs.org/)
[![TypeScript](https://img.shields.io/badge/TypeScript-5.8.3-3178C6?style=flat-square&logo=typescript)](https://www.typescriptlang.org/)
[![Material Design 3](https://img.shields.io/badge/Material%20Design-3-1976D2?style=flat-square&logo=material-design)](https://m3.material.io/)
[![License](https://img.shields.io/badge/License-MIT-green?style=flat-square)](LICENSE)

## ✨ 项目概述

NazoPrism 是一个高性能、现代化的博客前端应用，采用 **Next.js 15.4.3** 和 **React 19.1.0** 构建，完全遵循 **Material Design 3** 设计规范。项目具有智能主题系统、动态背景轮播、Web Workers 优化等先进特性，为用户提供卓越的阅读体验。

### 🎯 设计理念

- **🎨 Material Design 3**: 完全遵循 Google 最新设计语言
- **🌈 智能主题**: 基于背景图片自动提取主题色
- **⚡ 性能优先**: Web Workers + 预加载 + 代码分割
- **📱 响应式**: 完美适配各种设备和屏幕尺寸
- **♿ 可访问性**: 符合 WCAG 2.1 标准

## 🛠️ 技术栈

### 核心框架

- **[Next.js](https://nextjs.org/)** `15.4.3` - 现代化 React 全栈框架
- **[React](https://reactjs.org/)** `19.1.0` - 用户界面构建库
- **[TypeScript](https://www.typescriptlang.org/)** `5.8.3` - 类型安全的 JavaScript

### 设计系统

- **[Material Design 3](https://m3.material.io/)** - Google 最新设计语言
- **[Color Thief](https://github.com/lokesh/color-thief)** `2.6.0` - 智能颜色提取库
- **[Culori](https://culorijs.org/)** `4.0.2` - 现代颜色处理和色板生成库
- **CSS Variables** - 动态主题系统

### 开发工具

- **[ESLint](https://eslint.org/)** `9.31.0` - 代码质量检查
- **[Prettier](https://prettier.io/)** `3.6.2` - 代码格式化
- **[Jest](https://jestjs.io/)** `30.0.5` - 单元测试框架
- **[Testing Library](https://testing-library.com/)** - React 组件测试

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
- **🎭 SPA 导航**: 基于 Next.js App Router 的无刷新页面切换
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
├── 📂 app/                         # Next.js App Router
│   ├── page.tsx                    # 🏠 首页
│   ├── about/page.tsx              # ℹ️ 关于页
│
│   ├── users/page.tsx              # 👥 用户页
│   ├── layout.tsx                  # 📐 根布局
│   └── globals.css                 # 🌍 全局样式
│
├── 📂 components/                  # React 组件层
│   ├── layouts/                    # 布局组件
│   │   ├── BaseLayout.tsx          # 🏠 基础布局
│   │   └── Layout.tsx              # 📐 主布局
│   │
│   └── ui/                         # UI 组件
│       ├── Article.tsx             # 📄 文章展示组件
│       ├── ArticleIndex.tsx        # 📋 文章列表组件
│       ├── BackgroundCarousel.tsx  # 🌅 背景轮播组件
│       ├── Footer.tsx              # 🦶 页脚组件
│       ├── Navigation.tsx          # 🧭 导航栏组件
│       ├── Scrollbar.tsx           # 📜 滚动条组件
│       └── ToTop.tsx               # ⬆️ 返回顶部组件
│
├── 📂 hooks/                       # React Hooks
│   ├── useArticleAnimation.ts      # ✨ 文章动画 Hook
│   └── useIntersectionObserver.ts  # 👁️ 交叉观察器 Hook
│
├── 📂 contexts/                    # React Context
│   └── ThemeContext.tsx            # 🎨 主题上下文
│

│
├── 📂 utils/                       # 工具函数层
│   ├── theme-manager.ts            # 🎨 主题管理器
│   ├── debounce.ts                 # ⏱️ 防抖工具
│   ├── scroll-utils.ts             # 📜 滚动工具
│   └── type-guards.ts              # 🔍 类型守卫
│
├── 📂 __tests__/                   # 测试文件
│   ├── components/                 # 组件测试
│   ├── hooks/                      # Hook 测试
│   └── pages/                      # 页面测试
│
├── 📦 public/                      # 静态资源
├── ⚙️ next.config.js               # 🚀 Next.js 配置
├── 📝 tsconfig.json                # 🔧 TypeScript 配置
├── 📦 package.json                 # 📋 项目依赖
├── 🧪 jest.config.js               # 🧪 Jest 测试配置
└── 📖 README.md                    # 📚 项目文档
```

### 🏗️ 架构特点

- **🧩 组件化**: React 组件 + TypeScript 类型安全
- **📦 模块化**: 清晰的功能模块划分
- **🪝 Hook 化**: 自定义 React Hooks 管理状态和副作用
- **🎨 主题化**: 完整的 Material Design 3 主题系统
- **⚡ 性能化**: Next.js 优化 + Web Workers + 代码分割

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

🎉 打开 [http://localhost:3000](http://localhost:3000) 即可预览！

### 📜 可用脚本

```bash
# 🔧 开发相关
npm run dev          # 启动开发服务器
npm run build        # 构建生产版本
npm run start        # 启动生产服务器

# 🔍 代码质量
npm run type-check   # TypeScript 类型检查
npm run lint         # ESLint 代码检查
npm run lint:fix     # 自动修复 ESLint 问题
npm run format       # Prettier 代码格式化
npm run format:check # 检查代码格式

# 🧪 测试相关
npm run test         # 运行单元测试
npm run test:watch   # 监听模式运行测试
npm run test:coverage # 生成测试覆盖率报告

# 🛠️ 工具命令
npm run clean        # 清理构建文件
npm run prebuild     # 构建前检查
```

### ⚙️ 项目配置

编辑 `next.config.js` 自定义 Next.js 设置：

```javascript
/** @type {import('next').NextConfig} */
const nextConfig = {
  output: 'standalone',
  trailingSlash: true,
  images: {
    domains: ['picsum.photos'],
    unoptimized: false,
  },
  // 其他配置...
};

export default nextConfig;
```

编辑 `config/site.config.ts` 自定义应用设置：

```typescript
export const SITE_CONFIG = {
  // 🌐 站点信息
  title: 'NazoPrism',
  description: '现代化博客前端',
  author: 'Nazo',
  url: 'https://nazoprism.example.com',

  // 🌅 背景轮播
  backgroundApi: {
    interval: 8000, // 切换间隔 (毫秒)
    enableAutoPlay: true,
  },
};
```

## 🛠️ 开发指南

### 📄 添加新页面

```bash
# 在 app/ 创建新页面目录和文件
mkdir app/blog
touch app/blog/page.tsx
```

Next.js 会自动生成路由：`/blog`

### 🧩 创建新组件

```typescript
// 1. 创建 React 组件 (components/ui/MyComponent.tsx)
import styles from './MyComponent.module.css';

interface MyComponentProps {
  title: string;
}

export default function MyComponent({ title }: MyComponentProps) {
  return (
    <div className={styles.container}>
      <h1>{title}</h1>
    </div>
  );
}

// 2. 创建样式文件 (components/ui/MyComponent.module.css)
.container {
  /* 组件样式 (CSS Modules 自动作用域隔离) */
}

// 3. 创建自定义 Hook (hooks/useMyComponent.ts)
export function useMyComponent() {
  // Hook 逻辑
}
```

### 🎨 样式开发

```scss
/* 全局样式 - app/globals.css */
:root {
  --custom-color: rgb(var(--color-primary));
}

/* 组件样式 - components/ui/Component.module.css */
.button {
  /* 使用 M3 设计规范 */
  background: rgb(var(--color-primary));
}
```

### 🌈 主题定制

```typescript
// 使用主题上下文
import { useTheme } from '@/contexts/ThemeContext';

function MyComponent() {
  const { setTheme, currentTheme } = useTheme();

  const handleThemeChange = () => {
    setTheme({
      primary: [103, 80, 164],
      secondary: [125, 82, 96],
      // ... 更多颜色
    });
  };

  return <button onClick={handleThemeChange}>切换主题</button>;
}
```

## 🚀 部署指南

### 🌐 静态部署

项目构建为静态站点，可部署到任何静态托管平台：

```bash
# 构建生产版本
npm run build

# 输出目录: out/
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
          path: ./out
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
npm run format     # 代码格式化
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

- **[Next.js 官方文档](https://nextjs.org/docs)** - 框架文档
- **[React 官方文档](https://react.dev/)** - React 文档
- **[Material Design 3](https://m3.material.io/)** - 设计规范
- **[TypeScript 手册](https://www.typescriptlang.org/docs/)** - 语言文档

### 🛠️ 开发工具

- **[VS Code](https://code.visualstudio.com/)** - 推荐编辑器
- **[ES7+ React/Redux/React-Native snippets](https://marketplace.visualstudio.com/items?itemName=dsznajder.es7-react-js-snippets)** - React 代码片段
- **[TypeScript Importer](https://marketplace.visualstudio.com/items?itemName=pmneo.tsimporter)** - 自动导入
- **[Material Theme](https://marketplace.visualstudio.com/items?itemName=Equinusocio.vsc-material-theme)** - 主题

### 🌟 灵感来源

- **[Material You](https://material.io/blog/announcing-material-you)** - 动态主题设计
- **[Next.js App Router](https://nextjs.org/docs/app)** - 现代路由架构
- **[React Server Components](https://react.dev/blog/2023/03/22/react-labs-what-we-have-been-working-on-march-2023#react-server-components)** - 服务端组件理念

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
