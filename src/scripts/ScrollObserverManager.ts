/**
 * @file src/scripts/ScrollObserverManager.ts
 * @description 滚动相关的 IntersectionObserver 统一管理器
 */

import { intersectionObserverManager } from './IntersectionObserverManager';
import { registerGlobalCleanup } from './CleanupManager';

interface ScrollCallback {
  (isScrolled: boolean): void;
}

interface ScrollObserverConfig {
  id: string;
  callback: ScrollCallback;
  rootMargin?: string;
  threshold?: number;
}

/**
 * 滚动观察器管理器类
 * 基于哨兵元素提供滚动状态检测功能
 */
class ScrollObserverManager {
  #sentinelElement: HTMLElement | null = null;
  #registeredCallbacks = new Map<string, ScrollCallback>();
  #isInitialized = false;
  #cleanupRegistered = false;

  // 单例实例
  static #instance: ScrollObserverManager | null = null;

  /**
   * 私有构造函数，确保单例模式
   */
  private constructor() {}

  /**
   * 获取单例实例
   */
  static getInstance(): ScrollObserverManager {
    if (!ScrollObserverManager.#instance) {
      ScrollObserverManager.#instance = new ScrollObserverManager();
    }
    return ScrollObserverManager.#instance;
  }

  /**
   * 初始化滚动观察器管理器
   * 查找哨兵元素并设置基础观察器
   */
  #init(): void {
    // 每次都重新查找哨兵元素，因为页面切换后DOM会变化
    this.#sentinelElement = document.querySelector('#sentinel');
    if (!this.#sentinelElement) {
      console.warn('[ScrollObserver] 哨兵元素 #sentinel 未找到');
      return;
    }

    if (!this.#isInitialized) {
      this.#isInitialized = true;

      // 注册全局清理任务（只注册一次）
      if (!this.#cleanupRegistered) {
        registerGlobalCleanup(() => this.#destroy());
        this.#cleanupRegistered = true;
      }

      console.log('[ScrollObserver] 管理器初始化完成');
    } else {
      console.log('[ScrollObserver] 管理器重新获取哨兵元素');
    }
  }

  /**
   * 销毁所有滚动观察器
   */
  #destroy(): void {
    this.#registeredCallbacks.forEach((_, id) => {
      intersectionObserverManager.unregister(`scroll-${id}`);
    });

    this.#registeredCallbacks.clear();
    this.#sentinelElement = null;
    this.#isInitialized = false;
    this.#cleanupRegistered = false;

    console.log('[ScrollObserver] 管理器已销毁');
  }

  /**
   * 注册滚动状态回调
   */
  register(config: ScrollObserverConfig): void {
    this.#init();

    if (!this.#sentinelElement) {
      console.error(`[ScrollObserver] 无法注册 ${config.id}：哨兵元素不存在`);
      return;
    }

    // 如果已存在同名回调，智能处理重复注册
    if (this.#registeredCallbacks.has(config.id)) {
      // 检查当前观察器是否还在观察正确的哨兵元素
      const isObserving = intersectionObserverManager.isTargetObserved(`scroll-${config.id}`, this.#sentinelElement);
      if (isObserving) {
        // 如果已经在观察正确的元素，只更新回调函数
        this.#registeredCallbacks.set(config.id, config.callback);
        return;
      } else {
        // 如果观察的元素不正确，先注销再重新注册
        this.unregister(config.id);
      }
    }

    // 创建包装回调函数
    const wrappedCallback = (entries: IntersectionObserverEntry[]) => {
      entries.forEach(entry => {
        // 当哨兵元素不在视口中时，说明页面已经滚动了一定距离
        const isScrolled = !entry.isIntersecting;
        const currentCallback = this.#registeredCallbacks.get(config.id);
        if (currentCallback) {
          currentCallback(isScrolled);
        }
      });
    };

    // 注册到 IntersectionObserver 管理器
    intersectionObserverManager.register(
      `scroll-${config.id}`,
      wrappedCallback,
      {
        rootMargin: config.rootMargin || '0px',
        threshold: config.threshold || 0,
      },
      [this.#sentinelElement],
    );

    // 保存回调引用
    this.#registeredCallbacks.set(config.id, config.callback);

    console.log(`[ScrollObserver] 注册滚动回调: ${config.id}，哨兵元素:`, this.#sentinelElement);
  }

  /**
   * 注销滚动状态回调
   */
  unregister(id: string): void {
    if (this.#registeredCallbacks.has(id)) {
      intersectionObserverManager.unregister(`scroll-${id}`);
      this.#registeredCallbacks.delete(id);
      console.log(`[ScrollObserver] 注销滚动回调: ${id}`);
    }
  }

  /**
   * 获取当前注册的回调信息
   */
  getRegisteredCallbacks(): string[] {
    return Array.from(this.#registeredCallbacks.keys());
  }

  /**
   * 获取管理器状态信息（调试用）
   */
  getStats() {
    return {
      hasSentinel: !!this.#sentinelElement,
      registeredCallbacks: this.#registeredCallbacks.size,
      isInitialized: this.#isInitialized,
      cleanupRegistered: this.#cleanupRegistered,
    };
  }

  /**
   * 手动销毁管理器（用于测试）
   */
  destroy(): void {
    this.#destroy();
    ScrollObserverManager.#instance = null;
  }
}

// 导出单例实例，保持向后兼容
export const scrollObserverManager = ScrollObserverManager.getInstance();
