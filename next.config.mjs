export const reactStrictMode = true;
const nextConfig = {
  // 启用静态导出
  output: "export",

  // 其他配置...
  // 注意：如果使用了 next/image 并且不是部署在 Vercel，
  // 可能需要配置 images.unoptimized = true 或使用自定义 loader，
  // 因为默认的 Vercel 图像优化服务在静态导出后不可用。
  // images: {
  //   unoptimized: true,
  // },
};

export default nextConfig;
