/** @type {import('next').NextConfig} */
const nextConfig = {
  output: 'export',

  distDir: 'out',

  trailingSlash: true,

  poweredByHeader: false,

  /** 编译器配置 */
  compiler: {
    removeConsole: process.env.NODE_ENV === 'production',
    styledComponents: true,
  },

  /** 实验性功能 */
  experimental: {
    /** 启用ESM外部模块 */
    esmExternals: true,
    /** 包导入优化 */
    optimizePackageImports: ['@poupe/theme-builder', 'gsap', 'lenis', 'extract-colors'],
    /** React编译器支持 */
    reactCompiler: true,
  },

  /** 启用React严格模式 */
  reactStrictMode: true,

  /** 图片配置 */
  images: {
    unoptimized: true,
    formats: ['image/webp', 'image/avif'],
  },
};

export default nextConfig;
