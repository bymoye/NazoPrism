/** @type {import('next').NextConfig} */
const nextConfig = {
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
