/**
 * @file src/scripts/GlobalEventManager.ts
 * @description 高性能全局事件管理器
 */

import { debounce, createScrollProcessor } from '../utils/debounce';

/**
 * 全局事件管理器类
 * 使用单例模式管理全局事件监听器，提供高性能的事件分发机制
 */
class GlobalEventManager {
  #scrollHandlers = new Map<string, () => void>();
  #resizeHandlers = new Map<string, () => void>();
  #astroHandlers = new Map<string, () => void>();
  #isInitialized = false;

  // 单例实例
  static #instance: GlobalEventManager | null = null;

  /**
   * 私有构造函数，确保单例模式
   */
  private constructor() {}

  /**
   * 获取单例实例
   */
  static getInstance(): GlobalEventManager {
    if (!GlobalEventManager.#instance) {
      GlobalEventManager.#instance = new GlobalEventManager();
    }
    return GlobalEventManager.#instance;
  }

  /**
   * 创建事件分发器的私有方法
   */
  #createDispatcher(handlers: Map<string, () => void>, eventName: string) {
    return () => {
      handlers.forEach((handler, id) => {
        try {
          handler();
        } catch (error) {
          if (import.meta.env.DEV) {
            console.warn(`[EventManager] Error in '${eventName}' handler with ID '${id}':`, error);
          }
        }
      });
    };
  }

  /**
   * 初始化全局事件管理器
   * 绑定唯一的、经过性能优化的事件监听器到 window/document
   */
  init(): void {
    if (this.#isInitialized) return;

    const scrollDispatcher = createScrollProcessor(
      this.#createDispatcher(this.#scrollHandlers, 'scroll'),
      2,
    );
    const resizeDispatcher = debounce(this.#createDispatcher(this.#resizeHandlers, 'resize'), 100);
    const astroDispatcher = this.#createDispatcher(this.#astroHandlers, 'astro:page-load');

    window.addEventListener('scroll', scrollDispatcher, { passive: true });
    window.addEventListener('resize', resizeDispatcher, { passive: true });
    document.addEventListener('astro:page-load', astroDispatcher);

    this.#isInitialized = true;
  }

  /**
   * 注册 scroll 事件处理器
   */
  onScroll(id: string, handler: () => void): void {
    this.#scrollHandlers.set(id, handler);
  }

  /**
   * 注册 resize 事件处理器
   */
  onResize(id: string, handler: () => void): void {
    this.#resizeHandlers.set(id, handler);
  }

  /**
   * 注册 Astro 页面加载事件处理器
   */
  onAstroPageLoad(id: string, handler: () => void): void {
    this.#astroHandlers.set(id, handler);
  }

  /**
   * 根据 ID 移除一个或多个事件处理器
   */
  offEvents(id: string): void {
    this.#scrollHandlers.delete(id);
    this.#resizeHandlers.delete(id);
    this.#astroHandlers.delete(id);
  }

  /**
   * 获取管理器状态信息（调试用）
   */
  getStats() {
    return {
      scrollHandlers: this.#scrollHandlers.size,
      resizeHandlers: this.#resizeHandlers.size,
      astroHandlers: this.#astroHandlers.size,
      isInitialized: this.#isInitialized,
    };
  }

  /**
   * 销毁管理器（用于测试或特殊情况）
   */
  destroy(): void {
    this.#scrollHandlers.clear();
    this.#resizeHandlers.clear();
    this.#astroHandlers.clear();
    this.#isInitialized = false;
    GlobalEventManager.#instance = null;
  }
}

// 导出便捷函数，保持向后兼容
const globalEventManager = GlobalEventManager.getInstance();

export const initGlobalEventManager = () => globalEventManager.init();

export const onScroll = (id: string, handler: () => void) =>
  globalEventManager.onScroll(id, handler);
export const onResize = (id: string, handler: () => void) =>
  globalEventManager.onResize(id, handler);
export const onAstroPageLoad = (id: string, handler: () => void) =>
  globalEventManager.onAstroPageLoad(id, handler);
export const offEvents = (id: string) => globalEventManager.offEvents(id);
