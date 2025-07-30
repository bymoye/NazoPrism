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

  experimental: {
    optimizePackageImports: ['react', 'react-dom'],
  },

  // 图像优化配置 (已禁用)
  images: {
    unoptimized: true,
  },
};

export default nextConfig;
