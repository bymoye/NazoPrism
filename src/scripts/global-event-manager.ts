/**
 * Global Event Manager
 * 统一管理所有事件监听器，防止重复注册和内存泄漏
 * 使用统一的工具函数，避免重复实现
 */

import { debounce, createScrollProcessor } from '../utils/debounce';

interface EventHandler {
  id: string;
  handler: () => void;
  options?: AddEventListenerOptions;
}

class GlobalEventManager {
  private static instance: GlobalEventManager;
  private scrollHandlers: Map<string, EventHandler> = new Map();
  private resizeHandlers: Map<string, EventHandler> = new Map();
  private astroHandlers: Map<string, EventHandler> = new Map();

  private scrollListener: (() => void) | null = null;
  private resizeListener: (() => void) | null = null;
  private astroListener: (() => void) | null = null;

  private isInitialized = false;

  private constructor() {}

  static getInstance(): GlobalEventManager {
    if (!GlobalEventManager.instance) {
      GlobalEventManager.instance = new GlobalEventManager();
    }
    return GlobalEventManager.instance;
  }

  /**
   * 初始化全局事件监听器
   */
  init(): void {
    if (this.isInitialized) return;

    // 创建统一的 scroll 监听器 - 使用高性能滚动防抖，带阈值检查
    this.scrollListener = createScrollProcessor(_ => {
      this.scrollHandlers.forEach(({ handler }) => {
        try {
          handler();
        } catch {
          // 静默处理错误
        }
      });
    }, 2); // 2px 阈值

    // 创建统一的 resize 监听器 - 使用传统防抖
    this.resizeListener = debounce(() => {
      this.resizeHandlers.forEach(({ handler }) => {
        try {
          handler();
        } catch {
          // 静默处理错误
        }
      });
    }, 100);

    // 创建统一的 Astro 页面加载监听器
    this.astroListener = () => {
      this.astroHandlers.forEach(({ handler }) => {
        try {
          handler();
        } catch {
          // 静默处理错误
        }
      });
    };

    // 注册全局监听器
    window.addEventListener('scroll', this.scrollListener, { passive: true });
    window.addEventListener('resize', this.resizeListener, { passive: true });
    document.addEventListener('astro:page-load', this.astroListener);

    this.isInitialized = true;
  }

  /**
   * 注册 scroll 事件处理器
   */
  onScroll(id: string, handler: () => void, options?: AddEventListenerOptions): void {
    this.scrollHandlers.set(id, { id, handler, options });
  }

  /**
   * 注册 resize 事件处理器
   */
  onResize(id: string, handler: () => void, options?: AddEventListenerOptions): void {
    this.resizeHandlers.set(id, { id, handler, options });
  }

  /**
   * 注册 Astro 页面加载事件处理器
   */
  onAstroPageLoad(id: string, handler: () => void, options?: AddEventListenerOptions): void {
    this.astroHandlers.set(id, { id, handler, options });
  }

  /**
   * 移除指定的事件处理器
   */
  off(id: string): void {
    const removed = [];

    if (this.scrollHandlers.delete(id)) removed.push('scroll');
    if (this.resizeHandlers.delete(id)) removed.push('resize');
    if (this.astroHandlers.delete(id)) removed.push('astro');
  }

  /**
   * 清理所有事件监听器
   */
  destroy(): void {
    if (!this.isInitialized) return;

    // 移除全局监听器
    if (this.scrollListener) {
      window.removeEventListener('scroll', this.scrollListener);
    }
    if (this.resizeListener) {
      window.removeEventListener('resize', this.resizeListener);
    }
    if (this.astroListener) {
      document.removeEventListener('astro:page-load', this.astroListener);
    }

    // 清理所有处理器
    this.scrollHandlers.clear();
    this.resizeHandlers.clear();
    this.astroHandlers.clear();

    this.isInitialized = false;
  }
}

// 导出单例实例
export const globalEventManager = GlobalEventManager.getInstance();

/**
 * 便捷的注册函数
 */
export function onScroll(id: string, handler: () => void): void {
  globalEventManager.onScroll(id, handler);
}

export function onResize(id: string, handler: () => void): void {
  globalEventManager.onResize(id, handler);
}

export function onAstroPageLoad(id: string, handler: () => void): void {
  globalEventManager.onAstroPageLoad(id, handler);
}

export function offEvents(id: string): void {
  globalEventManager.off(id);
}

/**
 * 初始化全局事件管理器
 */
export function initGlobalEventManager(): void {
  globalEventManager.init();
}
