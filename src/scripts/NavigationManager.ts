/**
 * @file src/scripts/NavigationManager.ts
 * @description 导航栏管理器 - 处理导航栏滚动效果、隐藏/显示和当前页面状态
 */

import { globalEventManager } from './GlobalEventManager';
import { registerGlobalCleanup } from './CleanupManager';
import { debounce } from '../utils/debounce';
import styles from '../styles/components/Navigation.module.css';

/**
 * 导航栏管理器类
 * 负责处理导航栏的滚动效果、智能隐藏/显示和当前页面状态
 */
class NavigationManager {
  #navElement: HTMLElement | null = null;
  #scrollThreshold = 100;
  #hideThreshold = 400; // 修改隐藏导航栏的滚动阈值为400px
  #isNavSticky = false;
  #isNavHidden = false;
  #lastScrollTop = 0;
  #scrollDirection: 'up' | 'down' = 'up';
  #eventId = 'navigation';
  #isInitialized = false;

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
   * 处理滚动事件的核心逻辑
   * 优化版本：减少DOM读写操作，避免强制重排
   */
  #handleScrollCore = (): void => {
    if (!this.#navElement) return;

    // 一次性读取scrollTop，避免重复读取导致重排
    const scrollTop = window.pageYOffset || document.documentElement.scrollTop;
    const scrollDelta = scrollTop - this.#lastScrollTop;
    
    // 如果滚动距离太小，跳过处理以减少不必要的计算
    if (Math.abs(scrollDelta) < 5) {
      return;
    }
    
    // 更新滚动方向（增加阈值避免微小滚动造成的抖动）
    if (Math.abs(scrollDelta) > 10) {
      this.#scrollDirection = scrollDelta > 0 ? 'down' : 'up';
    }
    
    // 批量处理DOM操作，减少重排
    const shouldBeSticky = scrollTop > this.#scrollThreshold;
    const shouldHideNav = this.#shouldHideNavigation(scrollTop, scrollDelta);
    
    // 只有状态真正改变时才操作DOM
    let needsUpdate = false;
    const classesToAdd: string[] = [];
    const classesToRemove: string[] = [];
    
    if (shouldBeSticky !== this.#isNavSticky) {
      this.#isNavSticky = shouldBeSticky;
      needsUpdate = true;
      if (shouldBeSticky) {
        classesToAdd.push(styles.ceilNav);
      } else {
        classesToRemove.push(styles.ceilNav);
      }
    }
    
    if (shouldHideNav !== this.#isNavHidden) {
      this.#isNavHidden = shouldHideNav;
      needsUpdate = true;
      if (shouldHideNav) {
        classesToAdd.push(styles.hidden);
      } else {
        classesToRemove.push(styles.hidden);
      }
    }
    
    // 批量更新CSS类，减少DOM操作次数
    if (needsUpdate) {
      if (classesToAdd.length > 0) {
        this.#navElement.classList.add(...classesToAdd);
      }
      if (classesToRemove.length > 0) {
        this.#navElement.classList.remove(...classesToRemove);
      }
    }
    
    this.#lastScrollTop = scrollTop;
  };

  /**
   * 处理滚动事件
   * 高性能版本：使用更激进的节流策略避免强制重排
   */
  #handleScroll = debounce((): void => {
    // 使用 requestAnimationFrame 确保在渲染帧中执行，避免强制重排
    requestAnimationFrame(() => {
      this.#handleScrollCore();
    });
  }, 32); // 降低到约30fps，减少计算频率

  /**
   * 判断是否应该隐藏导航栏
   */
  #shouldHideNavigation(scrollTop: number, _scrollDelta: number): boolean {
    // 在页面顶部时不隐藏
    if (scrollTop <= this.#hideThreshold) {
      return false;
    }
    
    // 向上滚动时显示导航栏
    if (this.#scrollDirection === 'up') {
      return false;
    }
    
    // 向下滚动且超过阈值时隐藏导航栏
    if (this.#scrollDirection === 'down' && scrollTop > this.#hideThreshold) {
      return true;
    }
    
    return this.#isNavHidden;
  }

  /**
   * 更新当前页面状态
   */
  #updateCurrentPage(): void {
    if (!this.#navElement) return;

    const currentPath = window.location.pathname;
    const navLinks = this.#navElement.querySelectorAll('a[href]');

    navLinks.forEach(link => {
      const href = link.getAttribute('href');
      const isCurrentPage = href === currentPath || 
                            (href === '/' && currentPath === '/') ||
                            (href !== '/' && href && currentPath.startsWith(href));
      
      if (isCurrentPage) {
        link.setAttribute('aria-current', 'page');
        link.classList.add('current-page');
      } else {
        link.removeAttribute('aria-current');
        link.classList.remove('current-page');
      }
    });
  }

  /**
   * 强制显示导航栏
   */
  showNavigation(): void {
    if (!this.#navElement) return;
    
    this.#isNavHidden = false;
    this.#navElement.classList.remove(styles.hidden);
  }

  /**
   * 强制隐藏导航栏
   */
  hideNavigation(): void {
    if (!this.#navElement) return;
    
    this.#isNavHidden = true;
    this.#navElement.classList.add(styles.hidden);
  }

  /**
   * 重置导航栏状态
   */
  resetNavigation(): void {
    if (!this.#navElement) return;
    
    this.#isNavSticky = false;
    this.#isNavHidden = false;
    this.#lastScrollTop = 0;
    this.#scrollDirection = 'up';
    
    this.#navElement.classList.remove(styles.ceilNav, styles.hidden);
  }

  /**
   * 初始化导航栏管理器
   */
  init(): void {
    if (this.#isInitialized) {
      // 如果已经初始化，只需要更新当前页面状态
      this.#updateCurrentPage();
      return;
    }

    // 查找导航栏元素
    this.#navElement = document.querySelector('nav') || document.querySelector('[role="navigation"]');
    
    if (!this.#navElement) {
      console.warn('NavigationManager: 未找到导航栏元素');
      return;
    }

    // 注册滚动事件监听
    globalEventManager.onScroll(this.#eventId, this.#handleScroll);

    // 监听页面加载事件，更新当前页面状态
    globalEventManager.onAstroPageLoad(`${this.#eventId}-page-load`, () => {
      this.#updateCurrentPage();
      this.resetNavigation(); // 页面切换时重置导航栏状态
    });

    // 注册清理函数
    registerGlobalCleanup(() => {
      this.#destroy();
    });

    // 初始化当前页面状态
    this.#updateCurrentPage();
    
    // 初始检查滚动状态
    this.#handleScroll();

    this.#isInitialized = true;
  }

  /**
   * 销毁管理器
   */
  #destroy(): void {
    if (!this.#isInitialized) return;

    globalEventManager.offEvents([
      this.#eventId,
      `${this.#eventId}-page-load`
    ]);
    
    this.#navElement = null;
    this.#isNavSticky = false;
    this.#isNavHidden = false;
    this.#lastScrollTop = 0;
    this.#isInitialized = false;
  }

  /**
   * 获取当前状态信息（调试用）
   */
  getStats() {
    return {
      isInitialized: this.#isInitialized,
      isNavSticky: this.#isNavSticky,
      isNavHidden: this.#isNavHidden,
      scrollThreshold: this.#scrollThreshold,
      hideThreshold: this.#hideThreshold,
      scrollDirection: this.#scrollDirection,
      lastScrollTop: this.#lastScrollTop,
      hasNavElement: !!this.#navElement,
    };
  }

  /**
   * 设置滚动阈值
   */
  setScrollThreshold(threshold: number): void {
    this.#scrollThreshold = Math.max(0, threshold);
  }

  /**
   * 设置隐藏阈值
   */
  setHideThreshold(threshold: number): void {
    this.#hideThreshold = Math.max(0, threshold);
  }
}

// 导出单例实例
export const navigationManager = NavigationManager.getInstance();

/**
 * 初始化导航栏管理器
 */
export function initNavigation(): void {
  navigationManager.init();
}
