import type { Metadata } from 'next';

import ArticleIndex from '@/components/ui/ArticleIndex';
import Cover from '@/components/ui/Cover';

/**
 * 首页元数据配置
 */
export const metadata: Metadata = {
  title: 'NazoPrism - 首页',
  description: '沉淪在無盡的深淵中...',
};

// SSG配置 - 静态生成
export const dynamic = 'force-static';
export const revalidate = 3600; // 1小时重新验证

/**
 * 首页组件
 *
 * @returns 首页组件
 */
const HomePage = () => {
  return (
    <>
      <Cover />
      <ArticleIndex />
    </>
  );
};

export default HomePage;
