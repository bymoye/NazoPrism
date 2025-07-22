/**
 * @file src/scripts/ToTopManager.ts
 * @description 返回顶部按钮管理器 - 使用现代 ES2022+ 特性重构
 */

import { smoothScrollTo } from '../utils/scroll-utils';
import { scrollObserverManager } from './ScrollObserverManager';
import { registerGlobalCleanup } from './CleanupManager';
import { globalEventManager } from './GlobalEventManager';
import styles from '../styles/components/ToTop.module.css';

/**
 * 返回顶部管理器类
 * 管理返回顶部按钮的显示/隐藏和点击行为
 */
class ToTopManager {
  #button: HTMLElement | null = null;
  #isVisible = false;
  #isInitialized = false;
  #observerId = 'to-top';

  // 单例实例
  static #instance: ToTopManager | null = null;

  /**
   * 私有构造函数，确保单例模式
   */
  private constructor() {}

  /**
   * 获取单例实例
   */
  static getInstance(): ToTopManager {
    if (!ToTopManager.#instance) {
      ToTopManager.#instance = new ToTopManager();
    }
    return ToTopManager.#instance;
  }

  /**
   * 滚动状态变化回调函数
   * 当页面滚动状态改变时触发
   */
  #handleScrollChange = (isScrolled: boolean): void => {
    if (!this.#button) return;

    // 仅在状态变化时操作 DOM
    if (isScrolled !== this.#isVisible) {
      this.#isVisible = isScrolled;
      this.#button.classList.toggle(styles.show, isScrolled);
    }
  };

  /**
   * 点击事件处理器
   */
  #scrollToTop = (): void => {
    smoothScrollTo(0);
  };

  /**
   * 内部初始化方法
   */
  #initInternal(): void {
    // 注册滚动状态观察器
    scrollObserverManager.register({
      id: this.#observerId,
      callback: this.#handleScrollChange,
      rootMargin: '300px 0px 0px 0px', // 当哨兵元素距离视口顶部300px时触发
      threshold: 0,
    });

    // 使用 GlobalEventManager 统一管理点击事件
    globalEventManager.onClick('to-top-button', this.#scrollToTop);
  }

  /**
   * 销毁返回顶部按钮的所有逻辑
   */
  #destroy(): void {
    if (!this.#isInitialized) return;

    // 清理滚动观察器
    scrollObserverManager.unregister(this.#observerId);

    // 使用 GlobalEventManager 移除点击事件监听
    globalEventManager.offEvents('to-top-button');

    this.#button = null;
    this.#isInitialized = false;
  }

  /**
   * 初始化返回顶部按钮
   */
  init(): void {
    this.#button = document.querySelector('#to-top');

    if (!this.#button) {
      if (this.#isInitialized) {
        this.#destroy();
      }
      return;
    }

    if (this.#isInitialized) {
      // 页面切换后，只需要重置状态和重新绑定事件
      this.#isVisible = false;
      this.#button.classList.remove(styles.show);

      // 重新绑定点击事件（防止元素被替换）
      globalEventManager.offEvents('to-top-button');
      globalEventManager.onClick('to-top-button', this.#scrollToTop);
    } else {
      // 首次初始化
      this.#initInternal();
      this.#isInitialized = true;

      // 注册全局清理任务
      registerGlobalCleanup(() => this.#destroy());
    }
  }

  /**
   * 获取当前状态信息（调试用）
   */
  getStats() {
    return {
      hasButton: !!this.#button,
      isVisible: this.#isVisible,
      isInitialized: this.#isInitialized,
    };
  }

  /**
   * 手动显示/隐藏按钮
   */
  setVisible(visible: boolean): void {
    if (!this.#button) return;

    this.#isVisible = visible;
    this.#button.classList.toggle(styles.show, visible);
  }
}

// 导出便捷函数，保持向后兼容
const toTopManager = ToTopManager.getInstance();

export const initToTopManager = () => toTopManager.init();
