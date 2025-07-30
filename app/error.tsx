'use client';

import { useEffect } from 'react';

import ErrorPage from '@/components/ui/ErrorPage';

/**
 * 错误页面组件
 *
 * @param error - 错误对象
 * @param reset - 重置函数
 * @returns 错误页面组件
 */
const Error = ({ error, reset }: { error: Error & { digest?: string }; reset: () => void }) => {
  useEffect(() => {
    // 记录错误详情
    console.error('Page error caught:', error);

    // 可以在这里添加错误报告服务
    // 示例: reportError(error);
  }, [error]);

  return (
    <ErrorPage
      title='页面加载失败'
      message='当前页面无法正常加载。请尝试刷新页面或返回首页。'
      error={error}
      showDetails={process.env.NODE_ENV === 'development'}
      onRetry={reset}
    />
  );
};

export default Error;
