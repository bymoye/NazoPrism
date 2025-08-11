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
const ErrorBoundary = ({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) => {
  useEffect(() => {
    /** 记录错误信息用于调试 */
    console.error('页面错误:', error);
  }, [error]);

  return (
    <ErrorPage
      error={error}
      handleRetry={reset}
      isShowDetails={process.env.NODE_ENV === 'development'}
      message='当前页面无法正常加载。请尝试刷新页面或返回首页。'
      title='页面加载失败'
    />
  );
};

export default ErrorBoundary;
