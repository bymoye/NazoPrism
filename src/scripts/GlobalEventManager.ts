/**
 * @file src/scripts/GlobalEventManager.ts
 * @description 高性能全局事件管理器
 */

import { debounce, createScrollProcessor } from '../utils/debounce';

/**
 * 事件处理器配置接口
 */
interface EventHandlerConfig {
  handler: (event?: Event) => void;
  once?: boolean;
}

/**
 * 全局事件管理器类
 * 使用单例模式管理全局事件监听器，提供高性能的事件分发机制
 */
class GlobalEventManager {
  #scrollHandlers = new Map<string, EventHandlerConfig>();
  #resizeHandlers = new Map<string, EventHandlerConfig>();
  #astroHandlers = new Map<string, EventHandlerConfig>();
  #astroBeforeSwapHandlers = new Map<string, EventHandlerConfig>();
  #visibilityChangeHandlers = new Map<string, EventHandlerConfig>();
  #focusHandlers = new Map<string, EventHandlerConfig>();
  #beforeUnloadHandlers = new Map<string, EventHandlerConfig>();

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
  #createDispatcher(handlers: Map<string, EventHandlerConfig>, eventName: string) {
    return (event?: Event) => {
      const toRemove: string[] = [];

      handlers.forEach((config, id) => {
        try {
          config.handler(event);
          if (config.once) {
            toRemove.push(id);
          }
        } catch (error) {
          if (import.meta.env.DEV) {
            console.warn(`[EventManager] Error in '${eventName}' handler with ID '${id}':`, error);
          }
        }
      });

      // 移除一次性事件处理器
      toRemove.forEach(id => handlers.delete(id));
    };
  }

  /**
   * 初始化全局事件管理器
   * 绑定唯一的、经过性能优化的事件监听器到 window/document
   */
  init(): void {
    if (this.#isInitialized) return;

    // 为scroll事件创建特殊的处理器
    const scrollDispatcher = createScrollProcessor(
      () => this.#createDispatcher(this.#scrollHandlers, 'scroll')(),
      2,
    );

    // 为resize事件创建防抖处理器
    const resizeDispatcher = debounce(() => {
      this.#createDispatcher(this.#resizeHandlers, 'resize')();
    }, 100);

    const astroDispatcher = this.#createDispatcher(this.#astroHandlers, 'astro:page-load');
    const astroBeforeSwapDispatcher = this.#createDispatcher(
      this.#astroBeforeSwapHandlers,
      'astro:before-swap',
    );
    const visibilityChangeDispatcher = this.#createDispatcher(
      this.#visibilityChangeHandlers,
      'visibilitychange',
    );
    const focusDispatcher = this.#createDispatcher(this.#focusHandlers, 'focus');
    const beforeUnloadDispatcher = this.#createDispatcher(
      this.#beforeUnloadHandlers,
      'beforeunload',
    );
    window.addEventListener('scroll', scrollDispatcher, { passive: true });
    window.addEventListener('resize', resizeDispatcher, { passive: true });
    window.addEventListener('focus', focusDispatcher);
    window.addEventListener('beforeunload', beforeUnloadDispatcher);
    document.addEventListener('astro:page-load', astroDispatcher);
    document.addEventListener('astro:before-swap', astroBeforeSwapDispatcher);
    document.addEventListener('visibilitychange', visibilityChangeDispatcher);

    this.#isInitialized = true;
  }

  /**
   * 注册 scroll 事件处理器
   */
  onScroll(id: string, handler: (event?: Event) => void, once = false): void {
    this.#scrollHandlers.set(id, { handler, once });
  }

  /**
   * 注册 resize 事件处理器
   */
  onResize(id: string, handler: (event?: Event) => void, once = false): void {
    this.#resizeHandlers.set(id, { handler, once });
  }

  /**
   * 注册 Astro 页面加载事件处理器
   */
  onAstroPageLoad(id: string, handler: (event?: Event) => void, once = false): void {
    this.#astroHandlers.set(id, { handler, once });
  }

  /**
   * 注册 Astro 页面切换前事件处理器
   */
  onAstroBeforeSwap(id: string, handler: (event?: Event) => void, once = false): void {
    this.#astroBeforeSwapHandlers.set(id, { handler, once });
  }

  /**
   * 注册页面可见性变化事件处理器
   */
  onVisibilityChange(id: string, handler: (event?: Event) => void, once = false): void {
    this.#visibilityChangeHandlers.set(id, { handler, once });
  }

  /**
   * 注册窗口焦点事件处理器
   */
  onFocus(id: string, handler: (event?: Event) => void, once = false): void {
    this.#focusHandlers.set(id, { handler, once });
  }

  /**
   * 注册页面卸载前事件处理器
   */
  onBeforeUnload(id: string, handler: (event?: Event) => void, once = false): void {
    this.#beforeUnloadHandlers.set(id, { handler, once });
  }



  /**
   * 根据 ID 移除一个或多个事件处理器
   */
  offEvents(ids: string | string[]): void {
    const idArray = Array.isArray(ids) ? ids : [ids];
    
    idArray.forEach(id => {
      this.#scrollHandlers.delete(id);
      this.#resizeHandlers.delete(id);
      this.#astroHandlers.delete(id);
      this.#astroBeforeSwapHandlers.delete(id);
      this.#visibilityChangeHandlers.delete(id);
      this.#focusHandlers.delete(id);
      this.#beforeUnloadHandlers.delete(id);
    });
  }

  /**
   * 获取管理器状态信息（调试用）
   */
  getStats() {
    return {
      scrollHandlers: this.#scrollHandlers.size,
      resizeHandlers: this.#resizeHandlers.size,
      astroHandlers: this.#astroHandlers.size,
      astroBeforeSwapHandlers: this.#astroBeforeSwapHandlers.size,
      visibilityChangeHandlers: this.#visibilityChangeHandlers.size,
      focusHandlers: this.#focusHandlers.size,
      beforeUnloadHandlers: this.#beforeUnloadHandlers.size,

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
    this.#astroBeforeSwapHandlers.clear();
    this.#visibilityChangeHandlers.clear();
    this.#focusHandlers.clear();
    this.#beforeUnloadHandlers.clear();

    this.#isInitialized = false;
    GlobalEventManager.#instance = null;
  }
}

// 导出便捷函数，保持向后兼容
const globalEventManager = GlobalEventManager.getInstance();

export const initGlobalEventManager = () => globalEventManager.init();

export const onScroll = (id: string, handler: (event?: Event) => void, once = false) =>
  globalEventManager.onScroll(id, handler, once);
export const onResize = (id: string, handler: (event?: Event) => void, once = false) =>
  globalEventManager.onResize(id, handler, once);
export const onAstroPageLoad = (id: string, handler: (event?: Event) => void, once = false) =>
  globalEventManager.onAstroPageLoad(id, handler, once);
export const onAstroBeforeSwap = (id: string, handler: (event?: Event) => void, once = false) =>
  globalEventManager.onAstroBeforeSwap(id, handler, once);
export const onVisibilityChange = (id: string, handler: (event?: Event) => void, once = false) =>
  globalEventManager.onVisibilityChange(id, handler, once);
export const onFocus = (id: string, handler: (event?: Event) => void, once = false) =>
  globalEventManager.onFocus(id, handler, once);
export const onBeforeUnload = (id: string, handler: (event?: Event) => void, once = false) =>
  globalEventManager.onBeforeUnload(id, handler, once);

export const offEvents = (ids: string | string[]) => globalEventManager.offEvents(ids);
export const getEventStats = () => globalEventManager.getStats();

export { globalEventManager };
