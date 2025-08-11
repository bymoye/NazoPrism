'use client';

import { useLenis } from 'lenis/react';
import { useState } from 'react';

import styles from '@/styles/components/ToTop.module.css';
import type { ToTopProps } from '@/types/components';

/**
 * 回到顶部按钮组件
 *
 * @param props - 组件属性
 * @param props.threshold - 显示按钮的滚动阈值，默认300px
 * @param props.smooth - 是否使用平滑滚动，默认true
 * @param props.className - 自定义CSS类名
 * @returns 回到顶部按钮组件
 */
const ToTop = ({ threshold = 300, smooth = true, className, ...props }: ToTopProps) => {
  const [isVisible, setIsVisible] = useState(false);

  const lenis = useLenis();

  /**
   * 处理滚动到页面顶部
   */
  const handleScrollToTop = () => {
    lenis?.scrollTo(0, {
      duration: smooth ? 1.5 : 0,
    });
  };

  /**
   * 监听滚动事件，更新按钮可见性
   */
  useLenis(
    ({ actualScroll }) => {
      setIsVisible(actualScroll > threshold);
    },
    [threshold],
  );

  return (
    <button
      aria-label='回到顶部'
      className={`${styles['toTopBtn']} ${isVisible ? styles['show'] : ''} ${className ?? ''}`}
      id='to-top'
      type='button'
      onClick={handleScrollToTop}
      {...props}
    >
      <svg
        aria-hidden='true'
        className={styles['toTopIcon']}
        fill='none'
        viewBox='0 0 24 24'
        xmlns='http://www.w3.org/2000/svg'
      >
        <path
          d='M7.41 15.41L12 10.83L16.59 15.41L18 14L12 8L6 14L7.41 15.41Z'
          fill='currentColor'
        />
      </svg>
    </button>
  );
};

export default ToTop;
