'use client';

import ErrorPage from '@/components/ui/ErrorPage';

/**
 * 自定义 404 页面组件
 *
 * @returns 404 页面组件
 */
const NotFound = () => {
  return (
    <ErrorPage
      handleGoHome={() => {
        window.location.assign('/');
      }}
      handleRetry={() => {
        window.history.back();
      }}
      message='抱歉，您访问的页面不存在。请检查网址是否正确，或返回首页继续浏览。'
      title='页面未找到'
    />
  );
};

export default NotFound;
