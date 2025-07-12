const pageHandlers = new Set<() => void>();
const globalHandlers = new Set<() => void>();
let areListenersRegistered = false;

/**
 * 执行所有页面级的清理函数。
 * 由 astro:before-swap 事件调用。
 */
function cleanupPageScope(): void {
  console.log('🧹 Running page-scope cleanup for', pageHandlers.size, 'tasks.');
  pageHandlers.forEach(cleanup => {
    try {
      cleanup();
    } catch (e) {
      console.error('[CleanupManager] Error during page cleanup:', e);
    }
  });
  pageHandlers.clear(); // 清理完后清空
}

/**
 * 执行所有全局级的清理函数。
 * 由 beforeunload 事件调用。
 */
function cleanupGlobalScope(): void {
  console.log('🌍 Running global-scope cleanup for', globalHandlers.size, 'tasks.');
  globalHandlers.forEach(cleanup => {
    try {
      cleanup();
    } catch (e) {
      console.error('[CleanupManager] Error during global cleanup:', e);
    }
  });
  globalHandlers.clear();
}

/**
 * 确保事件监听器只被注册一次。
 */
function ensureListeners(): void {
  if (areListenersRegistered) return;

  // 监听 Astro 的页面交换事件，用于页面级清理
  document.addEventListener('astro:before-swap', cleanupPageScope);

  // 监听浏览器卸载事件，用于全局清理
  window.addEventListener('beforeunload', cleanupGlobalScope);

  areListenersRegistered = true;
}

/**
 * 注册一个【页面级】的清理函数。
 * 它会在每次 Astro 页面导航时被自动执行和清理。
 * @param cleanup 要执行的清理函数。
 * @returns 一个函数，调用它即可手动注销此清理任务。
 */
export function registerPageCleanup(cleanup: () => void): () => void {
  ensureListeners();
  pageHandlers.add(cleanup);

  return () => {
    pageHandlers.delete(cleanup);
  };
}

/**
 * 注册一个【全局级】的清理函数。
 * 它只会在用户关闭标签页或离开网站时执行一次。
 * @param cleanup 要执行的清理函数。
 * @returns 一个函数，调用它即可手动注销此清理任务。
 */
export function registerGlobalCleanup(cleanup: () => void): () => void {
  ensureListeners();
  globalHandlers.add(cleanup);

  return () => {
    globalHandlers.delete(cleanup);
  };
}

/**
 * 手动触发所有【页面级】清理。
 * 主要用于调试或特殊场景。
 */
export function performPageCleanup(): void {
  cleanupPageScope();
}

/**
 * 手动触发所有【全局级】清理。
 * 主要用于调试或特殊场景。
 */
export function performGlobalCleanup(): void {
  cleanupGlobalScope();
}
