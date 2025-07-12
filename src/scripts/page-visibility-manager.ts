/**
 * @file src/scripts/page-visibility-manager.ts
 * @description 页面可见性状态管理器
 */

interface VisibilityHandler {
  onHidden: () => void;
  onVisible: () => void;
}

const handlers = new Map<string, VisibilityHandler>();
let isVisible = !document.hidden;
let isInitialized = false;

/**
 * 通知所有注册的处理器当前页面的可见性状态。
 */
function notifyHandlers(): void {
  const currentlyVisible = !document.hidden;

  handlers.forEach((handler, id) => {
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
 * 检查并更新可见性状态，仅在状态变化时通知处理器。
 * 这是被 'visibilitychange' 和 'focus' 事件调用的核心函数。
 */
function updateVisibilityState(): void {
  const currentlyVisible = !document.hidden;
  if (isVisible === currentlyVisible) {
    return; // 状态未改变，无需任何操作
  }

  isVisible = currentlyVisible;
  notifyHandlers();
}

/**
 * 初始化页面可见性管理器，绑定事件监听。
 */
export function initPageVisibilityManager(): void {
  if (isInitialized) return;

  document.addEventListener('visibilitychange', updateVisibilityState);
  window.addEventListener('focus', updateVisibilityState); // focus 事件可以修正一些边缘情况下的状态

  isInitialized = true;
}

/**
 * 注册一个回调，以便在页面可见性变化时收到通知。
 * @param id - 唯一的处理器 ID。
 * @param onHidden - 当页面变为不可见时调用的函数。
 * @param onVisible - 当页面恢复可见时调用的函数。
 */
export function onPageVisibilityChange(
  id: string,
  onHidden: () => void,
  onVisible: () => void,
): void {
  handlers.set(id, { onHidden, onVisible });
}

/**
 * 根据 ID 移除一个可见性变化处理器。
 * @param id - 要移除的处理器 ID。
 */
export function offPageVisibilityChange(id: string): void {
  handlers.delete(id);
}

/**
 * 获取当前页面是否可见。
 * @returns 如果页面可见，则为 true；否则为 false。
 */
export function isPageVisible(): boolean {
  return isVisible;
}

/**
 * 获取关于可见性管理器的统计信息，用于调试。
 */
export function getVisibilityStats(): { handlerCount: number; isVisible: boolean } {
  return {
    handlerCount: handlers.size,
    isVisible: isVisible,
  };
}
