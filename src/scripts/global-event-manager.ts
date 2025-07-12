/**
 * @file src/scripts/global-event-manager.ts
 * @description 高性能全局事件管理器
 */

import { debounce, createScrollProcessor } from '../utils/debounce';

const scrollHandlers = new Map<string, () => void>();
const resizeHandlers = new Map<string, () => void>();
const astroHandlers = new Map<string, () => void>();

let isInitialized = false;

// 统一的事件分发器，增加了开发模式下的错误提示
const createDispatcher = (handlers: Map<string, () => void>, eventName: string) => () => {
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

/**
 * 初始化全局事件管理器。
 * 绑定唯一的、经过性能优化的事件监听器到 window/document。
 */
export function initGlobalEventManager(): void {
  if (isInitialized) return;

  const scrollDispatcher = createScrollProcessor(createDispatcher(scrollHandlers, 'scroll'), 2);
  const resizeDispatcher = debounce(createDispatcher(resizeHandlers, 'resize'), 100);
  const astroDispatcher = createDispatcher(astroHandlers, 'astro:page-load');

  window.addEventListener('scroll', scrollDispatcher, { passive: true });
  window.addEventListener('resize', resizeDispatcher, { passive: true });
  document.addEventListener('astro:page-load', astroDispatcher);

  isInitialized = true;
}

/**
 * 注册 scroll 事件处理器。
 * @param id - 唯一的处理器 ID。
 * @param handler - 事件触发时执行的回调函数。
 */
export function onScroll(id: string, handler: () => void): void {
  scrollHandlers.set(id, handler);
}

/**
 * 注册 resize 事件处理器。
 * @param id - 唯一的处理器 ID。
 * @param handler - 事件触发时执行的回调函数。
 */
export function onResize(id: string, handler: () => void): void {
  resizeHandlers.set(id, handler);
}

/**
 * 注册 Astro 页面加载事件处理器。
 * @param id - 唯一的处理器 ID。
 * @param handler - 事件触发时执行的回调函数。
 */
export function onAstroPageLoad(id: string, handler: () => void): void {
  astroHandlers.set(id, handler);
}

/**
 * 根据 ID 移除一个或多个事件处理器。
 * @param id - 要移除的处理器 ID。
 */
export function offEvents(id: string): void {
  scrollHandlers.delete(id);
  resizeHandlers.delete(id);
  astroHandlers.delete(id);
}
