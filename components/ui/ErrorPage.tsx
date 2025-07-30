'use client';

import styles from '@/styles/components/ErrorPage.module.css';

/**
 * 错误页面组件属性接口
 */
interface ErrorPageProps {
  /** 错误标题 */
  title?: string;
  /** 错误消息 */
  message?: string;
  /** 错误对象 */
  error?: Error;
  /** 是否显示错误详情 */
  showDetails?: boolean;
  /** 重试回调函数 */
  onRetry?: () => void;
  /** 返回首页回调函数 */
  onGoHome?: () => void;
}

/**
 * 错误页面组件，用于显示全页面错误信息
 *
 * @param props - 组件属性
 * @returns 错误页面组件
 */
const ErrorPage = ({
  title = '页面出错了',
  message = '抱歉，页面遇到了意外错误。请稍后重试或返回首页。',
  error,
  showDetails = false,
  onRetry,
  onGoHome,
}: ErrorPageProps) => {
  const handleRetry = () => {
    if (onRetry) {
      onRetry();
    } else {
      window.location.reload();
    }
  };

  const handleGoHome = () => {
    if (onGoHome) {
      onGoHome();
    } else {
      window.location.href = '/';
    }
  };

  return (
    <div className={styles.errorPage}>
      <div className={styles.errorContainer}>
        <div className={styles.errorIcon}>
          <svg width='64' height='64' viewBox='0 0 24 24' fill='none' stroke='currentColor'>
            <circle cx='12' cy='12' r='10' />
            <line x1='15' y1='9' x2='9' y2='15' />
            <line x1='9' y1='9' x2='15' y2='15' />
          </svg>
        </div>

        <h1 className={styles.errorTitle}>{title}</h1>
        <p className={styles.errorMessage}>{message}</p>

        {error && showDetails && (
          <details className={styles.errorDetails}>
            <summary>查看错误详情</summary>
            <div className={styles.errorInfo}>
              <h3>错误信息:</h3>
              <pre>{error.message}</pre>
              {error.stack && (
                <>
                  <h3>错误堆栈:</h3>
                  <pre>{error.stack}</pre>
                </>
              )}
            </div>
          </details>
        )}

        <div className={styles.errorActions}>
          <button onClick={handleRetry} className={`${styles.button} ${styles.primaryButton}`}>
            重新加载
          </button>
          <button onClick={handleGoHome} className={`${styles.button} ${styles.secondaryButton}`}>
            返回首页
          </button>
        </div>
      </div>
    </div>
  );
};

export default ErrorPage;
