/**
 * @file src/scripts/PageVisibilityManager.ts
 * @description 页面可见性状态管理器
 */

interface VisibilityHandler {
  onHidden: () => void;
  onVisible: () => void;
}

/**
 * 页面可见性管理器类
 * 管理页面可见性状态变化的监听和通知
 */
class PageVisibilityManager {
  #handlers = new Map<string, VisibilityHandler>();
  #isVisible = !document.hidden;
  #isInitialized = false;

  // 单例实例
  static #instance: PageVisibilityManager | null = null;

  /**
   * 私有构造函数，确保单例模式
   */
  private constructor() {}

  /**
   * 获取单例实例
   */
  static getInstance(): PageVisibilityManager {
    if (!PageVisibilityManager.#instance) {
      PageVisibilityManager.#instance = new PageVisibilityManager();
    }
    return PageVisibilityManager.#instance;
  }

  /**
   * 通知所有注册的处理器当前页面的可见性状态
   */
  #notifyHandlers(): void {
    const currentlyVisible = !document.hidden;

    this.#handlers.forEach((handler, id) => {
      try {
        if (currentlyVisible) {
          handler.onVisible();
        } else {
          handler.onHidden();
        }
      } catch (error) {
        if (import.meta.env.DEV) {
          console.warn(`[VisibilityManager] Error in handler with ID '${id}':`, error);
        }
      }
    });
  }

  /**
   * 检查并更新可见性状态，仅在状态变化时通知处理器
   * 这是被 'visibilitychange' 和 'focus' 事件调用的核心函数
   */
  #updateVisibilityState = (): void => {
    const currentlyVisible = !document.hidden;
    if (this.#isVisible === currentlyVisible) {
      return; // 状态未改变，无需任何操作
    }

    this.#isVisible = currentlyVisible;
    this.#notifyHandlers();
  };

  /**
   * 初始化页面可见性管理器，绑定事件监听
   */
  init(): void {
    if (this.#isInitialized) return;

    document.addEventListener('visibilitychange', this.#updateVisibilityState);
    window.addEventListener('focus', this.#updateVisibilityState); // focus 事件可以修正一些边缘情况下的状态

    this.#isInitialized = true;
  }

  /**
   * 注册一个回调，以便在页面可见性变化时收到通知
   */
  onPageVisibilityChange(id: string, onHidden: () => void, onVisible: () => void): void {
    this.#handlers.set(id, { onHidden, onVisible });
  }

  /**
   * 根据 ID 移除一个可见性变化处理器
   */
  offPageVisibilityChange(id: string): void {
    this.#handlers.delete(id);
  }

  /**
   * 获取当前页面是否可见
   */
  isPageVisible(): boolean {
    return this.#isVisible;
  }

  /**
   * 获取关于可见性管理器的统计信息，用于调试
   */
  getStats() {
    return {
      handlerCount: this.#handlers.size,
      isVisible: this.#isVisible,
      isInitialized: this.#isInitialized,
    };
  }

  /**
   * 手动触发可见性状态更新（用于测试）
   */
  forceUpdate(): void {
    this.#updateVisibilityState();
  }

  /**
   * 销毁管理器（用于测试）
   */
  destroy(): void {
    if (this.#isInitialized) {
      document.removeEventListener('visibilitychange', this.#updateVisibilityState);
      window.removeEventListener('focus', this.#updateVisibilityState);
    }

    this.#handlers.clear();
    this.#isVisible = !document.hidden;
    this.#isInitialized = false;
    PageVisibilityManager.#instance = null;
  }
}

// 导出便捷函数，保持向后兼容
export const pageVisibilityManager = PageVisibilityManager.getInstance();

export const initPageVisibilityManager = () => pageVisibilityManager.init();

export const onPageVisibilityChange = (id: string, onHidden: () => void, onVisible: () => void) =>
  pageVisibilityManager.onPageVisibilityChange(id, onHidden, onVisible);
export const offPageVisibilityChange = (id: string) =>
  pageVisibilityManager.offPageVisibilityChange(id);
export const isPageVisible = () => pageVisibilityManager.isPageVisible();
export const getVisibilityStats = () => pageVisibilityManager.getStats();
