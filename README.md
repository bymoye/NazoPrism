# NazoPrism

一个基于 Next.js 15 的博客前端项目，使用 Material Design 3 设计语言。

## 技术栈

- **Next.js** 15.4.4 - React 框架
- **React** 19.1.0 - 用户界面库
- **TypeScript** 5.8.3 - 类型安全
- **Material Design 3** - 设计系统

## 主要功能

- 智能主题系统：根据背景图片自动提取主题色
- 响应式设计：适配各种设备
- 背景轮播：自动切换背景图片
- 滚动效果：背景模糊度随滚动变化
- 深色/浅色主题切换

## 项目结构

```
NazoPrism/
├── app/                    # Next.js App Router 页面
│   ├── page.tsx           # 首页
│   ├── about/page.tsx     # 关于页
│   ├── users/page.tsx     # 用户页
│   └── layout.tsx         # 根布局
├── src/
│   ├── components/        # React 组件
│   │   ├── layouts/       # 布局组件
│   │   └── ui/           # UI 组件
│   ├── contexts/         # React Context
│   ├── hooks/            # 自定义 Hooks
│   ├── utils/            # 工具函数
│   ├── types/            # TypeScript 类型
│   ├── styles/           # 样式文件
│   └── lib/              # 配置文件
├── tests/                # 测试文件
│   ├── unit/             # 单元测试
│   └── e2e/              # 端到端测试
└── public/               # 静态资源
```

## 快速开始

### 环境要求

- Node.js 18.0.0+
- npm/yarn/pnpm

### 安装和运行

```bash
# 克隆项目
git clone https://github.com/bymoye/NazoPrism.git
cd NazoPrism

# 安装依赖
npm install

# 启动开发服务器
npm run dev
```

访问 [http://localhost:3000](http://localhost:3000) 查看效果。

### 可用命令

```bash
# 开发
npm run dev          # 启动开发服务器
npm run build        # 构建生产版本
npm run start        # 启动生产服务器

# 代码质量
npm run type-check   # TypeScript 类型检查
npm run lint         # ESLint 检查
npm run lint:fix     # 自动修复 ESLint 问题
npm run format       # Prettier 格式化
npm run format:check # 检查代码格式

# 测试
npm run test         # 运行单元测试
npm run test:watch   # 监听模式运行测试
npm run test:coverage # 生成测试覆盖率报告
npm run test:e2e     # 运行端到端测试

# 工具
npm run clean        # 清理构建文件
npm run validate     # 运行所有检查
```

## 配置

### 站点配置

编辑 `src/lib/site.config.ts`：

```typescript
export const SITE_CONFIG = {
  title: 'NazoPrism',
  description: '现代化博客前端',
  author: 'Nazo',
  url: 'https://nazoprism.example.com',

  // 背景轮播设置
  backgroundApi: {
    interval: 8000,
    enableAutoPlay: true,
  },
};
```

### Next.js 配置

编辑 `next.config.js`：

```javascript
/** @type {import('next').NextConfig} */
const nextConfig = {
  output: 'standalone',
  trailingSlash: true,
  images: {
    domains: ['picsum.photos'],
    unoptimized: false,
  },
};

export default nextConfig;
```

## 开发指南

### 添加新页面

在 `app/` 目录下创建新的页面文件：

```bash
mkdir app/blog
touch app/blog/page.tsx
```

### 创建组件

```typescript
// src/components/ui/MyComponent.tsx
interface MyComponentProps {
  title: string;
}

export default function MyComponent({ title }: MyComponentProps) {
  return (
    <div>
      <h1>{title}</h1>
    </div>
  );
}
```

### 使用主题系统

```typescript
import { useTheme } from '@/contexts/ThemeContext';

function MyComponent() {
  const { setTheme, currentTheme } = useTheme();

  const handleThemeChange = () => {
    setTheme({
      primary: [103, 80, 164],
      secondary: [125, 82, 96],
    });
  };

  return <button onClick={handleThemeChange}>切换主题</button>;
}
```

## 部署

### 静态部署

```bash
npm run build
# 输出目录: out/
```

### Vercel 部署

```bash
npm i -g vercel
vercel --prod
```

## 贡献

1. Fork 项目
2. 创建功能分支 (`git checkout -b feature/amazing-feature`)
3. 提交更改 (`git commit -m 'Add amazing feature'`)
4. 推送到分支 (`git push origin feature/amazing-feature`)
5. 创建 Pull Request

### 代码规范

- 使用 TypeScript 进行类型检查
- 遵循 ESLint 和 Prettier 配置
- 编写测试用例
- 使用约定式提交格式

## 许可证

MIT License - 查看 [LICENSE](LICENSE) 文件了解详情。

## 相关链接

- [Next.js 文档](https://nextjs.org/docs)
- [React 文档](https://react.dev/)
- [Material Design 3](https://m3.material.io/)
- [TypeScript 文档](https://www.typescriptlang.org/docs/)
