/**
 * @file src/scripts/scroll-observer-manager.ts
 * @description 滚动相关的 IntersectionObserver 统一管理器
 * 基于哨兵元素提供滚动状态检测功能
 */

import { intersectionObserverManager } from './intersection-observer-manager';
import { registerGlobalCleanup } from './cleanup-manager';

interface ScrollCallback {
  (isScrolled: boolean): void;
}

interface ScrollObserverConfig {
  id: string;
  callback: ScrollCallback;
  rootMargin?: string;
  threshold?: number;
}

class ScrollObserverManager {
  private sentinelElement: HTMLElement | null = null;
  private registeredCallbacks = new Map<string, ScrollCallback>();
  private isInitialized = false;
  private cleanupRegistered = false;

  /**
   * 初始化滚动观察器管理器
   * 查找哨兵元素并设置基础观察器
   */
  private init(): void {
    if (this.isInitialized) return;

    this.sentinelElement = document.querySelector('#sentinel');
    if (!this.sentinelElement) {
      console.warn('[ScrollObserver] 哨兵元素 #sentinel 未找到');
      return;
    }

    this.isInitialized = true;

    // 注册全局清理任务（只注册一次）
    if (!this.cleanupRegistered) {
      registerGlobalCleanup(() => this.destroy());
      this.cleanupRegistered = true;
    }

    console.log('[ScrollObserver] 管理器初始化完成');
  }

  /**
   * 注册滚动状态回调
   * @param config - 配置对象
   */
  register(config: ScrollObserverConfig): void {
    this.init();

    if (!this.sentinelElement) {
      console.error(`[ScrollObserver] 无法注册 ${config.id}：哨兵元素不存在`);
      return;
    }

    // 如果已存在同名回调，先注销
    if (this.registeredCallbacks.has(config.id)) {
      this.unregister(config.id);
    }

    // 创建包装回调函数
    const wrappedCallback = (entries: IntersectionObserverEntry[]) => {
      entries.forEach(entry => {
        // 当哨兵元素不在视口中时，说明页面已经滚动了一定距离
        const isScrolled = !entry.isIntersecting;
        config.callback(isScrolled);
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
      [this.sentinelElement],
    );

    // 保存回调引用
    this.registeredCallbacks.set(config.id, config.callback);

    console.log(`[ScrollObserver] 注册滚动回调: ${config.id}`);
  }

  /**
   * 注销滚动状态回调
   * @param id - 回调标识
   */
  unregister(id: string): void {
    if (this.registeredCallbacks.has(id)) {
      intersectionObserverManager.unregister(`scroll-${id}`);
      this.registeredCallbacks.delete(id);
      console.log(`[ScrollObserver] 注销滚动回调: ${id}`);
    }
  }

  /**
   * 销毁所有滚动观察器
   */
  destroy(): void {
    this.registeredCallbacks.forEach((_, id) => {
      intersectionObserverManager.unregister(`scroll-${id}`);
    });

    this.registeredCallbacks.clear();
    this.sentinelElement = null;
    this.isInitialized = false;
    this.cleanupRegistered = false;

    console.log('[ScrollObserver] 管理器已销毁');
  }

  /**
   * 获取当前注册的回调信息
   */
  getRegisteredCallbacks(): string[] {
    return Array.from(this.registeredCallbacks.keys());
  }
}

// 导出单例实例
export const scrollObserverManager = new ScrollObserverManager();
