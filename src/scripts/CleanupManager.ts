/**
 * @file src/scripts/CleanupManager.ts
 * @description 清理管理器
 */

/**
 * 清理管理器类
 * 管理页面级和全局级的清理任务，确保资源正确释放
 */
class CleanupManager {
  #pageHandlers = new Set<() => void>();
  #globalHandlers = new Set<() => void>();
  #areListenersRegistered = false;

  // 单例实例
  static #instance: CleanupManager | null = null;

  /**
   * 私有构造函数，确保单例模式
   */
  private constructor() {}

  /**
   * 获取单例实例
   */
  static getInstance(): CleanupManager {
    if (!CleanupManager.#instance) {
      CleanupManager.#instance = new CleanupManager();
    }
    return CleanupManager.#instance;
  }

  /**
   * 执行所有页面级的清理函数
   * 由 astro:before-swap 事件调用
   */
  #cleanupPageScope(): void {
    console.log('🧹 Running page-scope cleanup for', this.#pageHandlers.size, 'tasks.');
    this.#pageHandlers.forEach(cleanup => {
      try {
        cleanup();
      } catch (e) {
        console.error('[CleanupManager] Error during page cleanup:', e);
      }
    });
    this.#pageHandlers.clear();
  }

  /**
   * 执行所有全局级的清理函数
   * 由 beforeunload 事件调用
   */
  #cleanupGlobalScope(): void {
    console.log('🌍 Running global-scope cleanup for', this.#globalHandlers.size, 'tasks.');
    this.#globalHandlers.forEach(cleanup => {
      try {
        cleanup();
      } catch (e) {
        console.error('[CleanupManager] Error during global cleanup:', e);
      }
    });
    this.#globalHandlers.clear();
  }

  /**
   * 确保事件监听器只被注册一次
   */
  #ensureListeners(): void {
    if (this.#areListenersRegistered) return;

    // 使用箭头函数绑定 this 上下文
    document.addEventListener('astro:before-swap', () => this.#cleanupPageScope());
    window.addEventListener('beforeunload', () => this.#cleanupGlobalScope());

    this.#areListenersRegistered = true;
  }

  /**
   * 注册一个【页面级】的清理函数
   * 它会在每次 Astro 页面导航时被自动执行和清理
   */
  registerPageCleanup(cleanup: () => void): () => void {
    this.#ensureListeners();
    this.#pageHandlers.add(cleanup);

    return () => {
      this.#pageHandlers.delete(cleanup);
    };
  }

  /**
   * 注册一个【全局级】的清理函数
   * 它只会在用户关闭标签页或离开网站时执行一次
   */
  registerGlobalCleanup(cleanup: () => void): () => void {
    this.#ensureListeners();
    this.#globalHandlers.add(cleanup);

    return () => {
      this.#globalHandlers.delete(cleanup);
    };
  }

  /**
   * 手动触发所有【页面级】清理
   * 主要用于调试或特殊场景
   */
  performPageCleanup(): void {
    this.#cleanupPageScope();
  }

  /**
   * 手动触发所有【全局级】清理
   * 主要用于调试或特殊场景
   */
  performGlobalCleanup(): void {
    this.#cleanupGlobalScope();
  }

  /**
   * 获取管理器状态信息（调试用）
   */
  getStats() {
    return {
      pageHandlers: this.#pageHandlers.size,
      globalHandlers: this.#globalHandlers.size,
      areListenersRegistered: this.#areListenersRegistered,
    };
  }

  /**
   * 销毁管理器（用于测试）
   */
  destroy(): void {
    this.#pageHandlers.clear();
    this.#globalHandlers.clear();
    this.#areListenersRegistered = false;
    CleanupManager.#instance = null;
  }
}

// 导出便捷函数，保持向后兼容
const cleanupManager = CleanupManager.getInstance();

export const registerPageCleanup = (cleanup: () => void) =>
  cleanupManager.registerPageCleanup(cleanup);
export const registerGlobalCleanup = (cleanup: () => void) =>
  cleanupManager.registerGlobalCleanup(cleanup);
export const performPageCleanup = () => cleanupManager.performPageCleanup();
export const performGlobalCleanup = () => cleanupManager.performGlobalCleanup();
