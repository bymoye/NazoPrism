'use client';

import { useLenis } from 'lenis/react';
import Link from 'next/link';
import { useEffect, useRef, useState } from 'react';

import { useNavigationContext } from '@/contexts/NavigationContext';
import { useMobileDetection } from '@/hooks/useMobileDetection';
import { SITE_CONFIG } from '@/lib/site.config';
import styles from '@/styles/components/Navigation.module.css';

/**
 * Logo component for the navigation
 * @returns Logo JSX element with site title
 */
const Logo = () => (
  <Link aria-label='返回首页' className={styles['logoLink']} href='/'>
    <div className={styles['logoContainer']}>
      <div className={styles['logoIcon']}>
        <svg
          fill='none'
          height='32'
          viewBox='0 0 32 32'
          width='32'
          xmlns='http://www.w3.org/2000/svg'
        >
          <title>网站Logo</title>
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
      <span className={styles['logoText']}>{SITE_CONFIG.title}</span>
    </div>
  </Link>
);

/**
 * Desktop navigation links component
 * @returns Desktop navigation links JSX element
 */
const DesktopNavLinks = () => {
  const { isCurrentPath } = useNavigationContext();
  return (
    <ul className={styles['navList']}>
      {SITE_CONFIG.navigation.map(item => {
        const isCurrent = isCurrentPath(item.href);
        const navLinkClasses = [styles['navLink'], isCurrent && styles['current']]
          .filter(Boolean)
          .join(' ');

        return (
          <li key={item.href} className={styles['navItem']}>
            <Link
              aria-current={isCurrent ? 'page' : undefined}
              className={navLinkClasses}
              href={item.href}
            >
              <span className={styles['navLinkText']}>{item.name}</span>
              <div className={styles['navLinkIndicator']} />
            </Link>
          </li>
        );
      })}
    </ul>
  );
};

/**
 * 导航隐藏的滚动阈值
 */
const SCROLL_HIDE_THRESHOLD = 400;

/**
 * 主导航组件
 *
 * @returns 导航组件
 */
const Navigation = () => {
  const { isCurrentPath } = useNavigationContext();
  const isMobile = useMobileDetection();
  const [isHidden, setIsHidden] = useState(false);
  const [isDrawerOpen, setIsDrawerOpen] = useState(false);

  const drawerRef = useRef<HTMLDivElement>(null);
  const overlayRef = useRef<HTMLDivElement>(null);
  const animationRef = useRef<{
    drawer: Animation | null;
    overlay: Animation | null;
  }>({
    drawer: null,
    overlay: null,
  });
  const lastScrollY = useRef(0);

  /**
   * 滚动隐藏逻辑
   */
  const lenis = useLenis(({ scroll }) => {
    setIsHidden(scroll > SCROLL_HIDE_THRESHOLD && scroll >= lastScrollY.current && !isDrawerOpen);
    lastScrollY.current = scroll;
  });

  /**
   * 播放抽屉动画
   * @param isGoingToOpen - 抽屉是否正在打开
   */
  const playAnimation = (isGoingToOpen: boolean) => {
    const { drawer, overlay } = animationRef.current;
    if (!(drawer && overlay)) {
      return;
    }
    if (isGoingToOpen) {
      lenis?.stop();
    } else {
      lenis?.start();
    }
    drawer.playbackRate = isGoingToOpen ? 1 : -1;
    overlay.playbackRate = isGoingToOpen ? 1 : -1;

    drawer.play();
    overlay.play();
  };

  /**
   * 监听移动端状态变化，处理分辨率切换
   */
  useEffect(() => {
    /**
     * 播放抽屉动画（内部函数）
     * @param isGoingToOpen - 抽屉是否正在打开
     */
    const playAnimationInternal = (isGoingToOpen: boolean) => {
      const { drawer, overlay } = animationRef.current;
      if (!(drawer && overlay)) {
        return;
      }
      if (isGoingToOpen) {
        lenis?.stop();
      } else {
        lenis?.start();
      }
      drawer.playbackRate = isGoingToOpen ? 1 : -1;
      overlay.playbackRate = isGoingToOpen ? 1 : -1;

      drawer.play();
      overlay.play();
    };

    /** 当从移动端切换到PC端时，关闭抽屉菜单并解除滚动锁定 */
    if (!isMobile && isDrawerOpen) {
      playAnimationInternal(false);
      setIsDrawerOpen(false);
    }
  }, [isMobile, isDrawerOpen, lenis]);

  /**
   * 抽屉菜单动画初始化
   */
  useEffect(() => {
    if (drawerRef.current && overlayRef.current) {
      animationRef.current.drawer = drawerRef.current.animate(
        [
          {
            transform: 'translateX(-50%) translateY(-100%)',
            opacity: 0,
            visibility: 'hidden',
          },
          {
            transform: 'translateX(-50%) translateY(0)',
            opacity: 1,
            visibility: 'visible',
          },
        ],
        {
          duration: 400,
          easing: 'cubic-bezier(0.4, 0, 0.2, 1)',
          fill: 'forwards',
        },
      );
      animationRef.current.overlay = overlayRef.current.animate(
        [
          { opacity: 0, visibility: 'hidden' },
          { opacity: 1, visibility: 'visible' },
        ],
        {
          duration: 300,
          easing: 'cubic-bezier(0.4, 0, 0.2, 1)',
          fill: 'forwards',
        },
      );

      animationRef.current.drawer.pause();
      animationRef.current.overlay.pause();
    }

    /** 在effect内部复制ref值 */
    const currentAnimations = animationRef.current;
    return () => {
      if (currentAnimations.drawer) {
        currentAnimations.drawer.cancel();
      }
      if (currentAnimations.overlay) {
        currentAnimations.overlay.cancel();
      }
    };
  }, []);

  /**
   * 处理抽屉菜单切换
   */
  const handleToggleDrawer = () => {
    const { drawer, overlay } = animationRef.current;
    if (!(drawer && overlay)) {
      return;
    }
    /** 避免歧义，isDrawerOpen表示当前是否打开，isGoingToOpen表示是否即将打开 */
    const isGoingToOpen = !isDrawerOpen;
    playAnimation(isGoingToOpen);

    setIsDrawerOpen(isGoingToOpen);
  };

  return (
    <>
      <nav
        className={[styles['nav'], isHidden && styles['hidden']].filter(Boolean).join(' ')}
        id='navigation'
      >
        {/* 桌面端导航 */}
        <div className={styles['navDesktop']}>
          <div className={styles['navLogo']}>
            <Logo />
          </div>
          <div className={styles['navMenu']}>
            <DesktopNavLinks />
          </div>
        </div>

        {/* 移动端导航 */}
        <div className={styles['navMobile']}>
          <button
            aria-expanded={isDrawerOpen}
            aria-label={isDrawerOpen ? '关闭导航菜单' : '打开导航菜单'}
            className={`${styles['hamburgerButton']} ${isDrawerOpen && styles['active']}`}
            type='button'
            onClick={handleToggleDrawer}
          >
            <span className={styles['hamburgerLine']} />
            <span className={styles['hamburgerLine']} />
            <span className={styles['hamburgerLine']} />
          </button>
          <div className={styles['navLogoMobile']}>
            <Logo />
          </div>
          <div className={styles['spacer']} />
        </div>
      </nav>

      {/* 移动端抽屉菜单和遮罩 */}
      <div
        ref={overlayRef}
        aria-hidden='true'
        className={styles['drawerOverlay']}
        onClick={handleToggleDrawer}
      />
      <div ref={drawerRef} className={styles['mobileDrawer']}>
        <div className={styles['drawerContent']}>
          <ul className={styles['drawerNavList']}>
            {SITE_CONFIG.navigation.map(item => {
              const isCurrent = isCurrentPath(item.href);
              const drawerLinkClasses = [styles['drawerNavLink'], isCurrent && styles['current']]
                .filter(Boolean)
                .join(' ');

              return (
                <li key={item.href} className={styles['drawerNavItem']}>
                  <Link
                    aria-current={isCurrent ? 'page' : undefined}
                    className={drawerLinkClasses}
                    href={item.href}
                    onClick={handleToggleDrawer}
                  >
                    <span className={styles['drawerNavLinkText']}>{item.name}</span>
                    <div className={styles['drawerNavLinkIndicator']} />
                  </Link>
                </li>
              );
            })}
          </ul>
        </div>
      </div>
    </>
  );
};

Navigation.displayName = 'Navigation';

export default Navigation;
