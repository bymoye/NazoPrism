'use client';

import { useLenis } from 'lenis/react';
import Link from 'next/link';
import React, { useState, memo, useRef } from 'react';

import { useNavigationContext } from '@/contexts/NavigationContext';
import { SITE_CONFIG } from '@/lib/site.config';
import styles from '@/styles/components/Navigation.module.css';

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
  const lastScrollY = useRef(0);

  useLenis(({ scroll }) => {
    setIsSticky(scroll > 200);

    setIsHidden(scroll > lastScrollY.current && scroll > 400);
    lastScrollY.current = scroll;
  });

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
