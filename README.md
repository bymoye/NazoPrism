# NazoPrism

一个基于 Astro 构建的现代化博客前端，采用 TypeScript 开发，具有优雅的动画效果和流畅的用户体验。

## 项目概述

NazoPrism 是一个高性能的博客前端应用，使用 Astro 5.11.0 框架构建，配合后端服务 [NazoNexus](https://github.com/bymoye/NazoNexus) 使用。项目采用了现代化的前端技术栈，实现了丰富的交互效果和优秀的用户体验。

## 技术栈

- **框架**: [Astro](https://astro.build/) 5.11.0
- **语言**: TypeScript
- **样式**: CSS (原生)
- **构建工具**: Vite (Astro 内置)
- **后端服务**: [NazoNexus](https://github.com/bymoye/NazoNexus)

## 主要特性

### 🎨 视觉效果

- **背景轮播**: 自动切换的背景图片，支持模糊效果随滚动变化
- **平滑动画**: 文章卡片的渐入效果、导航栏的粘性效果
- **自定义滚动条**: 美观的自定义滚动条样式
- **进度指示器**: 页面滚动进度条

### 🚀 性能优化

- **View Transitions API**: 页面切换时的平滑过渡效果
- **图片预加载**: 背景图片的智能预加载
- **防抖优化**: 滚动和窗口调整事件的防抖处理
- **代码分离**: UI 和逻辑分离的架构设计

### 📱 用户体验

- **响应式设计**: 适配各种设备尺寸
- **返回顶部**: 平滑的返回顶部功能
- **焦点管理**: 页面失去焦点时暂停背景轮播

## 项目结构

```
NazoPrism/
├── src/
│   ├── components/         # Astro 组件
│   │   ├── Article.astro          # 文章组件
│   │   ├── ArticleIndex.astro     # 文章索引组件
│   │   ├── BackgroundCarousel.astro # 背景轮播组件
│   │   ├── Cover.astro            # 封面组件

│   │   ├── Footer.astro           # 页脚组件
│   │   ├── Navigation.astro       # 导航栏组件
│   │   ├── Scrollbar.astro        # 滚动条组件
│   │   └── ToTop.astro            # 返回顶部组件
│   ├── layouts/            # 布局文件
│   │   ├── BaseLayout.astro       # 基础布局
│   │   └── Layout.astro           # 主布局
│   ├── pages/              # 页面路由
│   │   ├── index.astro            # 首页
│   │   ├── about.astro            # 关于页
│   │   ├── login.astro            # 登录页
│   │   └── users.astro            # 用户页
│   ├── scripts/            # TypeScript 脚本
│   │   ├── article-animations.ts  # 文章动画
│   │   ├── background-carousel.ts # 背景轮播逻辑
│   │   ├── navigation.ts          # 导航栏逻辑
│   │   ├── progress-bar.ts        # 进度条逻辑

│   │   └── to-top.ts              # 返回顶部逻辑
│   ├── styles/             # 样式文件
│   │   └── global.css             # 全局样式
│   ├── utils/              # 工具函数
│   │   ├── base-manager.ts        # 基础管理器类
│   │   ├── debounce.ts            # 防抖函数
│   │   ├── event-utils.ts         # 事件工具
│   │   └── scroll-utils.ts        # 滚动工具
│   ├── config.ts           # 配置文件
│   └── env.d.ts            # 环境类型定义
├── public/                 # 静态资源
├── astro.config.mjs        # Astro 配置
├── tsconfig.json           # TypeScript 配置
├── package.json            # 项目依赖
└── README.md               # 项目说明
```

## 安装与运行

### 前置要求

- Node.js 18.0.0 或更高版本
- npm 或 yarn 包管理器
- 运行中的 [NazoNexus](https://github.com/bymoye/NazoNexus) 后端服务

### 安装步骤

1. 克隆项目

```bash
git clone https://github.com/yourusername/NazoPrism.git
cd NazoPrism
```

2. 安装依赖

```bash
npm install
```

3. 配置后端 API
   编辑 `src/config.ts` 文件，设置正确的后端 API 地址：

```typescript
export const SITE_CONFIG = {
  // ... 其他配置
  api: {
    baseUrl: 'http://your-nazonexus-api-url'
  }
}
```

4. 启动开发服务器

```bash
npm run dev
```

5. 构建生产版本

```bash
npm run build
```

6. 预览生产版本

```bash
npm run preview
```

## 开发指南

### 添加新页面

在 `src/pages/` 目录下创建新的 `.astro` 文件即可自动生成路由。

### 添加新组件

1. 在 `src/components/` 创建 `.astro` 组件文件
2. 在 `src/scripts/` 创建对应的 TypeScript 逻辑文件
3. 遵循 UI 和逻辑分离的原则

### 样式开发

- 全局样式在 `src/styles/global.css`
- 组件样式使用 Astro 的 `<style>` 标签，自动作用域隔离

## 部署

项目可以部署到任何支持静态网站的平台：

- **Vercel**: `npm run build` 后自动部署
- **Netlify**: 同上
- **GitHub Pages**: 使用 GitHub Actions 自动部署
- **自托管**: 将 `dist/` 目录部署到任何 Web 服务器

## 贡献指南

欢迎提交 Issue 和 Pull Request！

1. Fork 本项目
2. 创建你的特性分支 (`git checkout -b feature/AmazingFeature`)
3. 提交你的更改 (`git commit -m 'Add some AmazingFeature'`)
4. 推送到分支 (`git push origin feature/AmazingFeature`)
5. 开启一个 Pull Request

## 许可证

本项目采用 MIT 许可证 - 查看 [LICENSE](LICENSE) 文件了解详情

## 相关项目

- 后端服务: [NazoNexus](https://github.com/bymoye/NazoNexus)
- Astro 框架: [Astro](https://astro.build/)

## 联系方式

如有问题或建议，请通过以下方式联系：

- 提交 [Issue](https://github.com/yourusername/NazoPrism/issues)
