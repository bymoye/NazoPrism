/**
 * @file src/scripts/CleanupManager.ts
 * @description 清理管理器
 */

import { globalEventManager } from './GlobalEventManager';

/**
 * 清理资源的元数据接口
 */
interface CleanupMetadata {
  /** 资源名称 */
  name?: string;
  /** 超时时间（毫秒） */
  timeout?: number;
  /** 资源描述 */
  description?: string;
  /** 资源优先级 */
  priority?: 'low' | 'normal' | 'high';
  /** 其他自定义属性 */
  [key: string]: unknown;
}

/**
 * 清理管理器类
 * 管理页面级和全局级的清理任务，确保资源正确释放
 */
class CleanupManager {
  #pageHandlers = new Set<() => void>();
  #globalHandlers = new Set<() => void>();
  #areListenersRegistered = false;

  // 内存泄漏防护相关
  #weakRefs = new Set<WeakRef<object>>();
  #resourceRegistry = new Map<
    string,
    { type: string; timestamp: number; metadata?: CleanupMetadata }
  >();
  #cleanupTimeouts = new Map<string, number>();
  #maxHandlers = 1000; // 防止处理器过多
  #autoCleanupInterval: number | null = null;

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

    // 使用 GlobalEventManager 统一管理事件监听
    globalEventManager.onAstroBeforeSwap('cleanup-manager-page', () => this.#cleanupPageScope());
    globalEventManager.onBeforeUnload('cleanup-manager-global', () => this.#cleanupGlobalScope());

    this.#areListenersRegistered = true;
  }

  /**
   * 注册一个【页面级】的清理函数
   * 它会在每次 Astro 页面导航时被自动执行和清理
   */
  registerPageCleanup(cleanup: () => void, metadata?: CleanupMetadata): () => void {
    this.#ensureListeners();

    // 防止处理器过多导致内存泄漏
    if (this.#pageHandlers.size >= this.#maxHandlers) {
      console.warn(
        `[CleanupManager] 页面级处理器数量已达上限 (${this.#maxHandlers})，可能存在内存泄漏`,
      );
      this.#performLeakDetection();
    }

    this.#pageHandlers.add(cleanup);

    // 注册资源追踪
    const resourceId = this.#generateResourceId();
    this.#resourceRegistry.set(resourceId, {
      type: 'page-cleanup',
      timestamp: Date.now(),
      metadata: metadata || {},
    });

    // 设置超时清理（防止长期未清理的处理器）
    if (metadata?.timeout) {
      const timeoutId = window.setTimeout(() => {
        console.warn(`[CleanupManager] 页面级处理器超时清理: ${metadata.name || resourceId}`);
        this.#pageHandlers.delete(cleanup);
        this.#resourceRegistry.delete(resourceId);
      }, metadata.timeout);

      this.#cleanupTimeouts.set(resourceId, timeoutId);
    }

    return () => {
      this.#pageHandlers.delete(cleanup);
      this.#resourceRegistry.delete(resourceId);

      const timeoutId = this.#cleanupTimeouts.get(resourceId);
      if (timeoutId) {
        clearTimeout(timeoutId);
        this.#cleanupTimeouts.delete(resourceId);
      }
    };
  }

  /**
   * 注册一个【全局级】的清理函数
   * 它只会在用户关闭标签页或离开网站时执行一次
   */
  registerGlobalCleanup(cleanup: () => void, metadata?: CleanupMetadata): () => void {
    this.#ensureListeners();

    // 防止处理器过多导致内存泄漏
    if (this.#globalHandlers.size >= this.#maxHandlers) {
      console.warn(
        `[CleanupManager] 全局级处理器数量已达上限 (${this.#maxHandlers})，可能存在内存泄漏`,
      );
      this.#performLeakDetection();
    }

    this.#globalHandlers.add(cleanup);

    // 注册资源追踪
    const resourceId = this.#generateResourceId();
    this.#resourceRegistry.set(resourceId, {
      type: 'global-cleanup',
      timestamp: Date.now(),
      metadata: metadata || {},
    });

    // 设置超时清理（防止长期未清理的处理器）
    if (metadata?.timeout) {
      const timeoutId = window.setTimeout(() => {
        console.warn(`[CleanupManager] 全局级处理器超时清理: ${metadata.name || resourceId}`);
        this.#globalHandlers.delete(cleanup);
        this.#resourceRegistry.delete(resourceId);
      }, metadata.timeout);

      this.#cleanupTimeouts.set(resourceId, timeoutId);
    }

    return () => {
      this.#globalHandlers.delete(cleanup);
      this.#resourceRegistry.delete(resourceId);

      const timeoutId = this.#cleanupTimeouts.get(resourceId);
      if (timeoutId) {
        clearTimeout(timeoutId);
        this.#cleanupTimeouts.delete(resourceId);
      }
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
   * 生成唯一的资源ID
   */
  #generateResourceId(): string {
    return `cleanup_${Date.now()}_${Math.random().toString(36).substring(2, 11)}`;
  }

  /**
   * 执行内存泄漏检测
   */
  #performLeakDetection(): void {
    console.group('[CleanupManager] 内存泄漏检测');

    // 检查长期存在的资源
    const now = Date.now();
    const oldResources = Array.from(this.#resourceRegistry.entries())
      .filter(([_, resource]) => now - resource.timestamp > 300000) // 5分钟
      .map(([id, resource]) => ({ id, ...resource }));

    if (oldResources.length > 0) {
      console.warn(`发现 ${oldResources.length} 个长期存在的资源:`);
      oldResources.forEach(resource => {
        console.warn(
          `  - ${resource.id}: ${resource.type} (存在时间: ${Math.round((now - resource.timestamp) / 1000)}s)`,
        );
      });
    }

    // 检查弱引用
    const deadRefs = Array.from(this.#weakRefs).filter(ref => ref.deref() === undefined);
    if (deadRefs.length > 0) {
      console.log(`清理 ${deadRefs.length} 个已失效的弱引用`);
      deadRefs.forEach(ref => this.#weakRefs.delete(ref));
    }

    console.groupEnd();
  }

  /**
   * 注册弱引用对象（用于内存泄漏检测）
   */
  registerWeakRef(obj: object, name?: string): WeakRef<object> {
    const weakRef = new WeakRef(obj);
    this.#weakRefs.add(weakRef);

    if (name) {
      console.log(`[CleanupManager] 注册弱引用: ${name}`);
    }

    return weakRef;
  }

  /**
   * 启动自动清理检测（定期检查内存泄漏）
   */
  startAutoCleanup(intervalMs: number = 60000): void {
    if (this.#autoCleanupInterval) {
      clearInterval(this.#autoCleanupInterval);
    }

    this.#autoCleanupInterval = window.setInterval(() => {
      this.#performLeakDetection();
    }, intervalMs);

    console.log(`[CleanupManager] 启动自动清理检测，间隔: ${intervalMs}ms`);
  }

  /**
   * 停止自动清理检测
   */
  stopAutoCleanup(): void {
    if (this.#autoCleanupInterval) {
      clearInterval(this.#autoCleanupInterval);
      this.#autoCleanupInterval = null;
      console.log('[CleanupManager] 停止自动清理检测');
    }
  }

  /**
   * 获取管理器状态信息（调试用）
   */
  getStats() {
    return {
      pageHandlers: this.#pageHandlers.size,
      globalHandlers: this.#globalHandlers.size,
      areListenersRegistered: this.#areListenersRegistered,
      resourceRegistry: this.#resourceRegistry.size,
      weakRefs: this.#weakRefs.size,
      cleanupTimeouts: this.#cleanupTimeouts.size,
      autoCleanupActive: this.#autoCleanupInterval !== null,
    };
  }

  /**
   * 获取详细的资源报告（调试用）
   */
  getResourceReport(): void {
    console.group('[CleanupManager] 资源报告');

    console.log(`页面级处理器: ${this.#pageHandlers.size}`);
    console.log(`全局级处理器: ${this.#globalHandlers.size}`);
    console.log(`资源注册表: ${this.#resourceRegistry.size}`);
    console.log(`弱引用: ${this.#weakRefs.size}`);
    console.log(`清理超时: ${this.#cleanupTimeouts.size}`);

    if (this.#resourceRegistry.size > 0) {
      console.group('资源详情:');
      this.#resourceRegistry.forEach((resource, id) => {
        const age = Math.round((Date.now() - resource.timestamp) / 1000);
        console.log(`${id}: ${resource.type} (${age}s ago)`, resource.metadata);
      });
      console.groupEnd();
    }

    console.groupEnd();
  }

  /**
   * 销毁管理器（用于测试）
   */
  destroy(): void {
    // 停止自动清理
    this.stopAutoCleanup();

    // 清理所有超时
    this.#cleanupTimeouts.forEach(timeoutId => clearTimeout(timeoutId));
    this.#cleanupTimeouts.clear();

    // 清理所有处理器和资源
    this.#pageHandlers.clear();
    this.#globalHandlers.clear();
    this.#resourceRegistry.clear();
    this.#weakRefs.clear();

    this.#areListenersRegistered = false;
    CleanupManager.#instance = null;

    console.log('[CleanupManager] 管理器已完全销毁');
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
