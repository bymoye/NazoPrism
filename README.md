# NazoPrism

基于 Next.js 的博客系统，支持动态主题和响应式设计。

## 主要功能

- 动态主题系统：从背景图片自动提取颜色生成主题
- 深色/浅色模式切换
- 响应式设计，适配移动端和桌面端
- 平滑滚动效果
- 动画过渡效果
- 背景图片轮播
- 文章展示系统
- SEO 优化
- 静态导出支持
- TypeScript 开发

## 技术栈

- Next.js 15 + React 18
- TypeScript
- Tailwind CSS
- GSAP（动画）
- Lenis（平滑滚动）
- @poupe/theme-builder（主题生成）
- extract-colors（颜色提取）
- Biome（代码检查和格式化）
- Jest + Testing Library（测试）

## 项目结构

```
src/
├── app/                    # Next.js 页面
├── components/             # React 组件
│   ├── layouts/           # 布局组件
│   └── ui/                # UI 组件
├── hooks/                 # 自定义 Hooks
├── utils/                 # 工具函数
├── types/                 # 类型定义
└── constants/             # 常量配置
```

## 快速开始

### 环境要求

- Node.js 18+
- npm 或 yarn

### 安装运行

```bash
# 克隆项目
git clone https://github.com/bymoye/NazoPrism.git
cd NazoPrism

# 安装依赖
npm install

# 启动开发服务器
npm run dev
```

访问 http://localhost:3000

### 可用命令

```bash
# 开发
npm run dev          # 启动开发服务器
npm run build        # 构建生产版本
npm run start        # 启动生产服务器

# 代码质量
npm run validate     # 运行完整检查
npm run lint         # 代码检查
npm run format       # 代码格式化
npm run type-check   # 类型检查

# 测试
npm run test         # 运行测试
npm run test:watch   # 监听模式测试
```

## 配置

### 站点配置

在 `src/lib/site.config.ts` 中配置站点信息：

```typescript
export const SITE_CONFIG: SiteConfiguration = {
  title: 'NazoPrism',
  description: '一个现代化的博客系统',
  author: 'Your Name',
  url: 'https://yourdomain.com',

  // 导航配置
  navigation: [
    { name: '首页', href: '/' },
    { name: '关于', href: '/about' },
    { name: '文章', href: '/articles' },
    { name: '联系', href: '/contact' },
  ],

  // 社交链接
  social: {
    github: 'https://github.com/yourusername',
    twitter: 'https://twitter.com/yourusername',
    email: 'your.email@example.com',
  },

  // 背景图片 API 配置
  backgroundApi: {
    baseUrl: 'https://trae-api-sg.mchost.guru/api/ide/v1/text_to_image',
    prompts: ['abstract geometric patterns', 'minimalist landscape', 'digital art background'],
    imageSize: 'landscape_16_9' as const,
  },

  // 头像配置
  avatar:
    'https://trae-api-sg.mchost.guru/api/ide/v1/text_to_image?prompt=professional%20avatar&image_size=square',
};
```

### Next.js 配置

项目配置为静态导出模式：

```javascript
/** @type {import('next').NextConfig} */
const nextConfig = {
  output: 'export', // 静态导出模式
  distDir: 'dist', // 构建输出目录
  trailingSlash: true, // URL 尾部斜杠
  poweredByHeader: false, // 移除 X-Powered-By 头

  // Turbopack 配置 (开发模式)
  turbopack: true,

  // 编译器配置
  compiler: {
    removeConsole: process.env.NODE_ENV === 'production',
    styledComponents: true,
  },

  // 实验性功能
  experimental: {
    esmExternals: true,
    optimizePackageImports: ['gsap', 'lenis'],
  },

  // 图片配置
  images: {
    unoptimized: true, // 静态导出需要
  },
};

module.exports = nextConfig;
```

## 开发指南

### 添加新页面

在 `app` 目录下创建页面：

```typescript
// src/app/about/page.tsx
import type { Metadata } from 'next';

export const metadata: Metadata = {
  title: '关于我们',
  description: '了解更多关于我们的信息'
};

export default function About() {
  return (
    <main className="container mx-auto px-4 py-8">
      <h1 className="text-4xl font-bold mb-6">关于我们</h1>
      <p className="text-lg leading-relaxed">
        这里是关于页面的内容...
      </p>
    </main>
  );
}
```

### 创建组件

在 `src/components/ui` 目录下创建组件：

```typescript
// src/components/ui/Button.tsx
import type { BaseComponentProps } from '@/types/components';

/**
 * 按钮组件属性接口
 */
interface ButtonProps extends BaseComponentProps {
  /** 按钮文本 */
  children: React.ReactNode;
  /** 点击事件处理函数 */
  onClick?: () => void;
  /** 按钮变体 */
  variant?: 'primary' | 'secondary' | 'outline';
}

/**
 * 通用按钮组件
 * @param props 按钮属性
 * @returns 按钮组件
 */
export default function Button({
  children,
  onClick,
  variant = 'primary',
  className = '',
  ...props
}: ButtonProps) {
  const baseClasses = 'px-4 py-2 rounded-lg font-medium transition-colors';
  const variantClasses = {
    primary: 'bg-primary text-primary-foreground hover:bg-primary/90',
    secondary: 'bg-secondary text-secondary-foreground hover:bg-secondary/80',
    outline: 'border border-border bg-transparent hover:bg-accent'
  };

  return (
    <button
      onClick={onClick}
      className={`${baseClasses} ${variantClasses[variant]} ${className}`}
      {...props}
    >
      {children}
    </button>
  );
}
```

### 使用主题系统

```typescript
import { themeManager } from '@/utils/theme-manager';

// 初始化主题系统
themeManager.initTheme();

// 应用自定义颜色主题
const colors = ['#3b82f6', '#ef4444', '#10b981'];
themeManager.updateThemeFromColors(colors);

// 切换深色/浅色模式
themeManager.toggleDarkMode();

// 从图片自动提取颜色并应用主题
themeManager.updateThemeFromImage('/path/to/image.jpg');

// 检查当前是否为深色模式
const isDark = themeManager.isDarkMode();
```

### 使用自定义 Hooks

```typescript
import { useMobileDetection } from '@/hooks/useMobileDetection';
import { useScrollDirection } from '@/hooks/useScrollDirection';

function MyComponent() {
  const isMobile = useMobileDetection();
  const scrollDirection = useScrollDirection();

  return (
    <div className={`
      ${isMobile ? 'mobile-layout' : 'desktop-layout'}
      ${scrollDirection === 'down' ? 'hide-header' : 'show-header'}
    `}>
      {/* 组件内容 */}
    </div>
  );
}
```

## 部署

### 静态部署

```bash
npm run build
```

构建完成后，将 `dist` 目录部署到：

- GitHub Pages
- Netlify
- Vercel
- Cloudflare Pages

### Vercel 部署

- 构建命令：`npm run build`
- 输出目录：`dist`
- Node.js 版本：18.x

### Netlify 部署

创建 `netlify.toml`：

```toml
[build]
  command = "npm run build"
  publish = "dist"
```

## 贡献

1. Fork 项目
2. 创建功能分支
3. 提交更改
4. 创建 Pull Request

### 提交规范

```
feat: 新功能
fix: 修复问题
docs: 文档更新
style: 代码格式
refactor: 重构
test: 测试
```

## 代码规范

- TypeScript 严格模式
- 使用 Biome 进行代码检查
- 组件使用 PascalCase 命名
- 文件使用 kebab-case 命名
- 提供 JSDoc 注释
- 编写单元测试

## 许可证

MIT License

## 相关链接

- [Next.js 文档](https://nextjs.org/docs)
- [React 文档](https://react.dev/)
- [Tailwind CSS 文档](https://tailwindcss.com/docs)
- [GSAP 文档](https://greensock.com/docs/)
- [Biome 文档](https://biomejs.dev/)
