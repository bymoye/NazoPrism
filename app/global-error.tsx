'use client';

import { useEffect } from 'react';

import ErrorPage from '../components/ui/ErrorPage';

// Global error handler for Next.js App Router
/**
 * 全局错误处理组件
 * @param error - 错误对象
 * @param reset - 重置函数
 */
const GlobalError = ({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) => {
  useEffect(() => {
    // Log error to console and potentially to external service
    console.error('Global error caught:', error);

    // You can add error reporting service here
    // Example: reportError(error);
  }, [error]);

  return (
    <html lang='zh-CN'>
      <body>
        <ErrorPage
          title='应用程序出错'
          message='应用程序遇到了严重错误。请尝试重新加载页面。'
          error={error}
          showDetails={process.env.NODE_ENV === 'development'}
          onRetry={reset}
        />
      </body>
    </html>
  );
};

export default GlobalError;
