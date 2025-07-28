/** @type {import('next').NextConfig} */
const nextConfig = {
  trailingSlash: true,

  poweredByHeader: false,

  compiler: {
    removeConsole: process.env.NODE_ENV === 'production',
    styledComponents: true,
  },

  // 实验性功能，有助于优化打包体积
  experimental: {
    optimizePackageImports: ['react', 'react-dom'],
  },

  // 图像优化配置 (已禁用)
  images: {
    unoptimized: true, // 禁用图像优化，适用于主要使用远程图片的场景
  },

  // Sass 全局路径配置
  sassOptions: {
    includePaths: ['./styles'],
  },

  // 安全头配置，非常重要的安全加固
  async headers() {
    return [
      {
        source: '/:path*', // 匹配所有路径
        headers: [
          {
            key: 'X-Content-Type-Options',
            value: 'nosniff',
          },
          {
            key: 'X-Frame-Options',
            value: 'DENY',
          },
          {
            key: 'X-XSS-Protection',
            value: '1; mode=block',
          },
        ],
      },
    ];
  },
};

export default nextConfig;
