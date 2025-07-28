'use client';

import Link from 'next/link';
import React, { useEffect, useState, useCallback, memo } from 'react';

import { SITE_CONFIG } from '../../config/site.config';
import { useNavigationContext } from '../../contexts/NavigationContext';
import styles from '../../styles/components/Navigation.module.scss';

/**
 * 网站导航组件
 *
 * @component
 * @returns 导航组件JSX元素
 */
const Navigation = memo(() => {
  const { isCurrentPath } = useNavigationContext();
  const [isSticky, setIsSticky] = useState(false);
  const [isHidden, setIsHidden] = useState(false);
  const [lastScrollY, setLastScrollY] = useState(0);

  /**
   * 处理滚动事件
   */
  const handleScroll = useCallback(() => {
    const currentScrollY = window.scrollY;

    // 确定导航栏是否应该粘性定位
    setIsSticky(currentScrollY > 200);

    // 确定导航栏是否应该隐藏（向下滚动时）
    if (currentScrollY > lastScrollY && currentScrollY > 400) {
      setIsHidden(true);
    } else {
      setIsHidden(false);
    }

    setLastScrollY(currentScrollY);
  }, [lastScrollY]);

  // 设置滚动事件监听器
  useEffect(() => {
    window.addEventListener('scroll', handleScroll, { passive: true });
    return () => window.removeEventListener('scroll', handleScroll);
  }, [handleScroll]);

  return (
    <nav
      id='navigation'
      className={`${styles.nav} ${isSticky ? styles.ceilNav : ''} ${isHidden ? styles.hidden : ''}`}
    >
      {/* Logo Section */}
      <div className={styles.navLogo}>
        <Link href='/' className={styles.logoLink} aria-label='返回首页'>
          <div className={styles.logoContainer}>
            <div className={styles.logoIcon}>
              <svg
                fill='none'
                height='32'
                viewBox='0 0 32 32'
                width='32'
                xmlns='http://www.w3.org/2000/svg'
              >
                <circle cx='16' cy='16' fill='currentColor' opacity='0.1' r='14' />
                <path
                  d='M8 16L14 22L24 10'
                  stroke='currentColor'
                  strokeLinecap='round'
                  strokeLinejoin='round'
                  strokeWidth='2.5'
                />
              </svg>
            </div>
            <span className={styles.logoText}>{SITE_CONFIG.title}</span>
          </div>
        </Link>
      </div>

      {/* Navigation Menu */}
      <div className={styles.navMenu}>
        <ul className={styles.navList}>
          {SITE_CONFIG.navigation.map(item => {
            const isCurrent = isCurrentPath(item.href);
            return (
              <li key={item.href} className={styles.navItem}>
                <Link
                  href={item.href}
                  className={`${styles.navLink} ${isCurrent ? styles.current : ''}`}
                  aria-current={isCurrent ? 'page' : undefined}
                >
                  <span className={styles.navLinkText}>{item.name}</span>
                  <div className={styles.navLinkIndicator} />
                </Link>
              </li>
            );
          })}
        </ul>
      </div>
    </nav>
  );
});

Navigation.displayName = 'Navigation';

export default Navigation;
