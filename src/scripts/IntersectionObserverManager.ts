/**
 * @file src/scripts/IntersectionObserverManager.ts
 * @description 统一的、可复用 IntersectionObserver 的智能管理器
 */

interface ObserverCallback {
  (entries: IntersectionObserverEntry[], observer: IntersectionObserver): void;
}

interface RegistrationConfig {
  callback: ObserverCallback;
  targets: Element[];
}

/**
 * IntersectionObserver 管理器类
 * 实现了基于 options 的观察器池化，以达到最佳性能
 */
class IntersectionObserverManager {
  #observersPool = new Map<string, IntersectionObserver>();
  #idToOptionsKeyMap = new Map<string, string>();
  #observerSubscribers = new Map<string, Map<string, RegistrationConfig>>();

  // 单例实例
  static #instance: IntersectionObserverManager | null = null;

  /**
   * 私有构造函数，确保单例模式
   */
  private constructor() {}

  /**
   * 获取单例实例
   */
  static getInstance(): IntersectionObserverManager {
    if (!IntersectionObserverManager.#instance) {
      IntersectionObserverManager.#instance = new IntersectionObserverManager();
    }
    return IntersectionObserverManager.#instance;
  }

  /**
   * 注册一个新的观察任务
   */
  register(
    id: string,
    callback: ObserverCallback,
    options: IntersectionObserverInit = {},
    targets: Element[] = [],
  ): void {
    if (this.#idToOptionsKeyMap.has(id)) {
      console.warn(`[IntersectionObserver] ID '${id}' 已经被注册，将先注销旧的再注册新的。`);
      this.unregister(id);
    }

    const optionsKey = JSON.stringify(options);
    let observer = this.#observersPool.get(optionsKey);
    let wasReused = true;

    if (!observer) {
      wasReused = false;
      const dispatchCallback: ObserverCallback = (entries, obs) => {
        const subscribers = this.#observerSubscribers.get(optionsKey);
        subscribers?.forEach(config => {
          const relevantEntries = entries.filter(entry => config.targets.includes(entry.target));
          if (relevantEntries.length > 0) {
            config.callback(relevantEntries, obs);
          }
        });
      };

      observer = new IntersectionObserver(dispatchCallback, options);
      this.#observersPool.set(optionsKey, observer);
      this.#observerSubscribers.set(optionsKey, new Map());
    }

    const config: RegistrationConfig = { callback, targets: [...targets] };
    this.#observerSubscribers.get(optionsKey)!.set(id, config);
    this.#idToOptionsKeyMap.set(id, optionsKey);

    targets.forEach(target => observer!.observe(target));

    // 根据 wasReused 标志打印正确的日志
    if (wasReused) {
      console.log(`[IntersectionObserver] 注册任务: '${id}' (复用了 Key: ${optionsKey} 的观察器)`);
    } else {
      console.log(`[IntersectionObserver] 注册任务: '${id}' (创建了新的观察器 Key: ${optionsKey})`);
    }
  }

  /**
   * 为已有的注册任务添加新的观察目标
   */
  addTargets(id: string, targets: Element[]): void {
    const optionsKey = this.#idToOptionsKeyMap.get(id);
    if (!optionsKey) {
      console.warn(`[IntersectionObserver] 添加目标失败：未找到 ID '${id}'`);
      return;
    }

    const observer = this.#observersPool.get(optionsKey);
    const config = this.#observerSubscribers.get(optionsKey)?.get(id);

    if (observer && config) {
      targets.forEach(target => {
        if (!config.targets.includes(target)) {
          observer.observe(target);
          config.targets.push(target);
        }
      });
    }
  }

  /**
   * 从已有的注册任务中移除特定的观察目标
   */
  removeTargets(id: string, targets: Element[]): void {
    const optionsKey = this.#idToOptionsKeyMap.get(id);
    if (!optionsKey) return;

    const observer = this.#observersPool.get(optionsKey);
    const config = this.#observerSubscribers.get(optionsKey)?.get(id);

    if (observer && config) {
      targets.forEach(target => {
        observer.unobserve(target);
      });
      config.targets = config.targets.filter(t => !targets.includes(t));
    }
  }

  /**
   * 注销一个注册任务
   */
  unregister(id: string): void {
    const optionsKey = this.#idToOptionsKeyMap.get(id);
    if (!optionsKey) return;

    const observer = this.#observersPool.get(optionsKey);
    const subscribers = this.#observerSubscribers.get(optionsKey);
    const config = subscribers?.get(id);

    if (observer && config) {
      config.targets.forEach(target => observer.unobserve(target));
    }

    if (subscribers?.delete(id)) {
      console.log(`[IntersectionObserver] 注销任务: '${id}'`);
    }

    this.#idToOptionsKeyMap.delete(id);

    if (subscribers?.size === 0) {
      observer?.disconnect();
      this.#observersPool.delete(optionsKey);
      this.#observerSubscribers.delete(optionsKey);
      console.log(`[IntersectionObserver] 销毁无用观察器 (key: ${optionsKey})`);
    }
  }

  /**
   * 销毁管理器创建的所有观察器，清空所有状态
   */
  destroy(): void {
    this.#observersPool.forEach((observer, key) => {
      observer.disconnect();
      console.log(`[IntersectionObserver] 销毁观察器 (key: ${key})`);
    });

    this.#observersPool.clear();
    this.#observerSubscribers.clear();
    this.#idToOptionsKeyMap.clear();

    console.log('[IntersectionObserver] 管理器已完全销毁。');
  }

  /**
   * 获取当前所有观察器池的信息（用于调试）
   */
  getInfo(): void {
    console.group('[IntersectionObserver] 管理器状态报告');
    if (this.#observersPool.size === 0) {
      console.log('当前没有活动的观察器实例。');
    } else {
      this.#observersPool.forEach((_, optionsKey) => {
        const subscribers = this.#observerSubscribers.get(optionsKey);
        console.group(`观察器实例 (Key: ${optionsKey})`);
        if (subscribers) {
          console.log(`拥有 ${subscribers.size} 个订阅任务:`);
          subscribers.forEach((config, id) => {
            console.log(`  - 任务 ID: '${id}', 观察 ${config.targets.length} 个目标`);
          });
        }
        console.groupEnd();
      });
    }
    console.groupEnd();
  }

  /**
   * 获取管理器统计信息
   */
  getStats() {
    return {
      observersCount: this.#observersPool.size,
      registrationsCount: this.#idToOptionsKeyMap.size,
      totalSubscribers: Array.from(this.#observerSubscribers.values()).reduce(
        (sum, map) => sum + map.size,
        0,
      ),
    };
  }
}

// 导出单例实例，保持向后兼容
export const intersectionObserverManager = IntersectionObserverManager.getInstance();
