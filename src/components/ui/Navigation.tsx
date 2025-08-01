'use client';

import { useLenis } from 'lenis/react';
import Link from 'next/link';
import { memo, useRef, useState } from 'react';

import { useNavigationContext } from '@/contexts/NavigationContext';
import { SITE_CONFIG } from '@/lib/site.config';
import styles from '@/styles/components/Navigation.module.css';

/**
 * 网站导航组件
 *
 * 提供网站的主要导航功能，包括：
 * - 响应式Logo和站点标题显示
 * - 导航菜单项的渲染和当前页面状态指示
 * - 基于滚动位置的粘性导航和自动隐藏功能
 * - 平滑滚动集成
 *
 * @component
 * @returns 导航组件JSX元素
 */
const Navigation = memo(() => {
  const { isCurrentPath } = useNavigationContext();
  const [isSticky, setIsSticky] = useState(false);
  const [isHidden, setIsHidden] = useState(false);
  const lastScrollY = useRef(0);

  useLenis(({ scroll }) => {
    setIsSticky(scroll > 200);

    setIsHidden(scroll > lastScrollY.current && scroll > 400);
    lastScrollY.current = scroll;
  });

  return (
    <nav
      className={`${styles.nav} ${isSticky ? styles.ceilNav : ''} ${isHidden ? styles.hidden : ''}`}
      id="navigation"
    >
      {/* Logo Section */}
      <div className={styles.navLogo}>
        <Link aria-label="返回首页" className={styles.logoLink} href="/">
          <div className={styles.logoContainer}>
            <div className={styles.logoIcon}>
              <svg
                fill="none"
                height="32"
                viewBox="0 0 32 32"
                width="32"
                xmlns="http://www.w3.org/2000/svg"
              >
                <title>网站Logo</title>
                <circle
                  cx="16"
                  cy="16"
                  fill="currentColor"
                  opacity="0.1"
                  r="14"
                />
                <path
                  d="M8 16L14 22L24 10"
                  stroke="currentColor"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth="2.5"
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
          {SITE_CONFIG.navigation.map((item) => {
            const isCurrent = isCurrentPath(item.href);
            return (
              <li className={styles.navItem} key={item.href}>
                <Link
                  aria-current={isCurrent ? 'page' : undefined}
                  className={`${styles.navLink} ${isCurrent ? styles.current : ''}`}
                  href={item.href}
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
