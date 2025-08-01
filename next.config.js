/** @type {import('next').NextConfig} */
const nextConfig = {
  output: 'export',

  distDir: 'out',

  trailingSlash: true,

  poweredByHeader: false,

  compiler: {
    removeConsole: process.env.NODE_ENV === 'production',
    styledComponents: true,
  },

  // 实验性功能配置
  experimental: {
    // 启用ESM外部化
    esmExternals: true,
    // 优化包导入
    optimizePackageImports: ['lucide-react', '@poupe/theme-builder'],
  },

  // 图像优化配置 (已禁用)
  images: {
    unoptimized: true,
  },
};

export default nextConfig;
