/**
 * @file src/scripts/NavigationManager.ts
 * @description 导航栏滚动效果管理器
 */

import { registerGlobalCleanup } from './CleanupManager';
import { onScroll, offEvents } from './GlobalEventManager';
import { getScrollTop } from '../utils/scroll-utils';
import styles from '../styles/components/Navigation.module.css';

/**
 * 导航管理器类
 * 管理导航栏的滚动效果和当前页面状态
 */
class NavigationManager {
  #nav: HTMLElement | null = null;
  #scrollThreshold = 20;
  #lastScrollPosition = 0;
  #isNavSticky = false;
  #isInitialized = false;
  #eventId = 'navigation';
  #currentPath = '';

  // 单例实例
  static #instance: NavigationManager | null = null;

  /**
   * 私有构造函数，确保单例模式
   */
  private constructor() {}

  /**
   * 获取单例实例
   */
  static getInstance(): NavigationManager {
    if (!NavigationManager.#instance) {
      NavigationManager.#instance = new NavigationManager();
    }
    return NavigationManager.#instance;
  }

  /**
   * 更新导航栏状态的私有方法
   */
  #updateNavigation = (): void => {
    if (!this.#nav) return;

    const scrollPosition = getScrollTop();

    // 避免微小滚动的阈值检查
    if (Math.abs(scrollPosition - this.#lastScrollPosition) < 5) {
      return;
    }

    this.#lastScrollPosition = scrollPosition;
    const shouldBeSticky = scrollPosition > this.#scrollThreshold;

    // 仅在状态变化时操作 DOM
    if (shouldBeSticky !== this.#isNavSticky) {
      this.#isNavSticky = shouldBeSticky;
      this.#nav.classList.toggle(styles.ceilNav, this.#isNavSticky);
    }
  };

  /**
   * 检查是否为当前页面
   */
  #isCurrentPage(href: string): boolean {
    const normalizedCurrentPath =
      this.#currentPath.length > 1 ? this.#currentPath.replace(/\/$/, '') : '/';
    const normalizedHref = href.length > 1 ? href.replace(/\/$/, '') : '/';

    if (normalizedHref === '/') {
      return normalizedCurrentPath === '/';
    }
    return normalizedCurrentPath.startsWith(normalizedHref);
  }

  /**
   * 更新当前页面状态
   */
  #updateCurrentPageState(): void {
    if (!this.#nav) return;

    const currentPath = window.location.pathname;
    if (currentPath === this.#currentPath) return;

    this.#currentPath = currentPath;

    // 更新导航链接的当前状态
    const navLinks = this.#nav.querySelectorAll('a[href]');
    navLinks.forEach(link => {
      const href = link.getAttribute('href');
      if (!href) return;

      const isCurrent = this.#isCurrentPage(href);

      // 更新 aria-current 属性
      if (isCurrent) {
        link.setAttribute('aria-current', 'page');
      } else {
        link.removeAttribute('aria-current');
      }

      // 更新 CSS 类
      link.classList.toggle(styles.current, isCurrent);
    });
  }

  /**
   * 内部初始化方法
   */
  #initInternal(): void {
    onScroll(this.#eventId, this.#updateNavigation);
    // 初始化时立即检查一次滚动位置
    this.#updateNavigation();
    // 初始化时更新当前页面状态
    this.#updateCurrentPageState();
  }

  /**
   * 销毁导航栏管理器，移除事件监听并重置状态
   */
  #destroy(): void {
    if (!this.#isInitialized) return;

    offEvents(this.#eventId);

    this.#nav = null;
    this.#lastScrollPosition = 0;
    this.#isNavSticky = false;
    this.#isInitialized = false;
    this.#currentPath = '';
  }

  /**
   * 初始化导航管理器
   * 在 Astro 页面过渡中可被安全地重复调用
   */
  init(): void {
    this.#nav = document.querySelector('#navigation');

    // 统一处理导航栏不存在于当前页面的情况
    if (!this.#nav) {
      // 如果之前初始化过，则执行清理
      if (this.#isInitialized) {
        this.#destroy();
      }
      return;
    }

    if (this.#isInitialized) {
      // 如果已经初始化过，说明是页面切换
      // 我们已经获取了新的 DOM 引用，需要更新滚动状态和当前页面状态
      this.#updateNavigation();
      this.#updateCurrentPageState();
      return;
    }

    // 如果是首次初始化
    this.#initInternal();
    this.#isInitialized = true;

    // 注册全局清理
    registerGlobalCleanup(() => this.#destroy());
  }

  /**
   * 获取当前状态信息（调试用）
   */
  getStats() {
    return {
      hasNav: !!this.#nav,
      scrollThreshold: this.#scrollThreshold,
      lastScrollPosition: this.#lastScrollPosition,
      isNavSticky: this.#isNavSticky,
      isInitialized: this.#isInitialized,
      currentPath: this.#currentPath,
    };
  }

  /**
   * 设置滚动阈值
   */
  setScrollThreshold(threshold: number): void {
    this.#scrollThreshold = threshold;
  }
}

// 导出便捷函数，保持向后兼容
const navigationManager = NavigationManager.getInstance();

export const initNavigationManager = () => navigationManager.init();
