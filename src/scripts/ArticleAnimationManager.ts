/**
 * @file src/scripts/ArticleAnimationManager.ts
 * @description 文章动画管理器
 */

/**
 * 文章动画管理器类
 * 管理文章元素的进入动画效果
 */
class ArticleAnimationManager {
  #intersectionObserver: IntersectionObserver | null = null;
  #mutationObserver: MutationObserver | null = null;
  #targetSelector = '[data-thumb-class]';
  #isInitialized = false;

  // 单例实例
  static #instance: ArticleAnimationManager | null = null;

  /**
   * 私有构造函数，确保单例模式
   */
  private constructor() {}

  /**
   * 获取单例实例
   */
  static getInstance(): ArticleAnimationManager {
    if (!ArticleAnimationManager.#instance) {
      ArticleAnimationManager.#instance = new ArticleAnimationManager();
    }
    return ArticleAnimationManager.#instance;
  }

  /**
   * 创建并返回一个 IntersectionObserver 实例
   */
  #createIntersectionObserver(): IntersectionObserver {
    return new IntersectionObserver(
      (entries, observer) => {
        for (const entry of entries) {
          if (entry.isIntersecting) {
            // 从data属性获取CSS Modules生成的动画类名
            const showClass = (entry.target as HTMLElement).dataset.showClass;
            if (showClass) {
              entry.target.classList.add(showClass);
            }
            // 动画触发后，停止观察该元素，以提升性能
            observer.unobserve(entry.target);
          }
        }
      },
      {
        threshold: 0.1,
        rootMargin: '0px 0px -5% 0px',
      },
    );
  }

  /**
   * 观察一个根元素下的所有目标子元素
   */
  #observeChildren(root: Element): void {
    if (!this.#intersectionObserver) return;

    const targets = root.querySelectorAll(this.#targetSelector);
    targets.forEach(target => {
      // 从data属性获取CSS Modules生成的动画类名并重置状态
      const showClass = (target as HTMLElement).dataset.showClass;
      if (showClass) {
        target.classList.remove(showClass);
      }
      this.#intersectionObserver!.observe(target);
    });
  }

  /**
   * 创建 MutationObserver 来监听动态添加的元素
   */
  #createMutationObserver(): MutationObserver {
    return new MutationObserver(mutations => {
      for (const mutation of mutations) {
        if (mutation.type === 'childList') {
          for (const node of mutation.addedNodes) {
            // 只关心被添加的元素节点
            if (node.nodeType === Node.ELEMENT_NODE) {
              this.#observeChildren(node as Element);
            }
          }
        }
      }
    });
  }

  /**
   * 销毁并清理所有观察者
   */
  #destroy(): void {
    if (this.#intersectionObserver) {
      this.#intersectionObserver.disconnect();
      this.#intersectionObserver = null;
    }
    if (this.#mutationObserver) {
      this.#mutationObserver.disconnect();
      this.#mutationObserver = null;
    }
    this.#isInitialized = false;
  }

  /**
   * 初始化动画管理器
   */
  init(): void {
    // 如果已存在，先销毁旧的实例，确保从干净的状态开始
    if (this.#isInitialized) {
      this.#destroy();
    }

    this.#intersectionObserver = this.#createIntersectionObserver();

    // 1. 立即观察当前页面上已存在的文章
    this.#observeChildren(document.body);

    // 2. 创建 MutationObserver 监听后续动态添加的文章
    this.#mutationObserver = this.#createMutationObserver();

    // 开始监听整个文档的变化
    this.#mutationObserver.observe(document.body, {
      childList: true,
      subtree: true,
    });

    this.#isInitialized = true;
  }

  /**
   * 销毁动画管理器
   * 应在 Astro 的 'astro:before-swap' 事件中调用
   */
  destroy(): void {
    this.#destroy();
  }

  /**
   * 获取管理器状态信息（调试用）
   */
  getStats() {
    return {
      hasIntersectionObserver: !!this.#intersectionObserver,
      hasMutationObserver: !!this.#mutationObserver,
      targetSelector: this.#targetSelector,
      isInitialized: this.#isInitialized,
    };
  }

  /**
   * 设置目标选择器
   */
  setTargetSelector(selector: string): void {
    this.#targetSelector = selector;
  }

  /**
   * 手动观察指定元素
   */
  observeElement(element: Element): void {
    if (!this.#intersectionObserver) return;

    const showClass = (element as HTMLElement).dataset.showClass;
    if (showClass) {
      element.classList.remove(showClass);
    }
    this.#intersectionObserver.observe(element);
  }

  /**
   * 手动停止观察指定元素
   */
  unobserveElement(element: Element): void {
    if (!this.#intersectionObserver) return;
    this.#intersectionObserver.unobserve(element);
  }
}

// 导出便捷函数，保持向后兼容
const articleAnimationManager = ArticleAnimationManager.getInstance();

export const initArticleAnimations = () => articleAnimationManager.init();
export const destroyArticleAnimations = () => articleAnimationManager.destroy();
