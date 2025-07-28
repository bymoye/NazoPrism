'use client';

import React, { useState, useEffect, useCallback, memo } from 'react';

import styles from '../../styles/components/ToTop.module.scss';
import { ToTopProps } from '../../types/components';

/**
 * 回到顶部按钮组件
 *
 * @param props - 组件属性
 * @param props.threshold - 显示按钮的滚动阈值，默认300px
 * @param props.smooth - 是否使用平滑滚动，默认true
 * @param props.className - 自定义CSS类名
 * @returns 回到顶部按钮组件
 */
const ToTop = memo<ToTopProps>(
  ({ threshold = 300, smooth = true, className, ...props }: ToTopProps) => {
    const [isVisible, setIsVisible] = useState(false);

    /**
     * 滚动到页面顶部
     */
    const scrollToTop = useCallback(() => {
      if (smooth) {
        window.scrollTo({
          top: 0,
          behavior: 'smooth',
        });
      } else {
        window.scrollTo(0, 0);
      }
    }, [smooth]);

    /**
     * 处理键盘事件
     *
     * @param event - 键盘事件对象
     */
    const handleKeyDown = useCallback(
      (event: React.KeyboardEvent) => {
        if (event.key === 'Enter' || event.key === ' ') {
          event.preventDefault();
          scrollToTop();
        }
      },
      [scrollToTop],
    );

    /**
     * 处理滚动事件以控制按钮可见性
     */
    useEffect(() => {
      /**
       * 检查滚动位置并更新按钮可见性
       */
      const handleScroll = (): void => {
        const scrolled = window.scrollY > threshold;
        setIsVisible(scrolled);
      };

      /**
       * 节流处理滚动事件
       */
      let ticking = false;
      const throttledHandleScroll = (): void => {
        if (!ticking) {
          requestAnimationFrame(() => {
            handleScroll();
            ticking = false;
          });
          ticking = true;
        }
      };

      // 添加滚动事件监听器
      window.addEventListener('scroll', throttledHandleScroll, { passive: true });

      // 检查初始滚动位置
      handleScroll();

      // 移除事件监听器
      return () => {
        window.removeEventListener('scroll', throttledHandleScroll);
      };
    }, [threshold]);

    return (
      <button
        id='to-top'
        type='button'
        aria-label='回到顶部'
        className={`${styles.toTopBtn} ${isVisible ? styles.show : ''} ${className ?? ''}`}
        onClick={scrollToTop}
        onKeyDown={handleKeyDown}
        {...props}
      >
        <svg
          className={styles.toTopIcon}
          fill='none'
          viewBox='0 0 24 24'
          xmlns='http://www.w3.org/2000/svg'
          aria-hidden='true'
        >
          <path
            d='M7.41 15.41L12 10.83L16.59 15.41L18 14L12 8L6 14L7.41 15.41Z'
            fill='currentColor'
          />
        </svg>
      </button>
    );
  },
);

ToTop.displayName = 'ToTop';

export default ToTop;
