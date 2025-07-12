let intersectionObs: IntersectionObserver | null = null;
let mutationObs: MutationObserver | null = null;

const ANIMATION_CLASS = 'post_list_show';
const TARGET_SELECTOR = '.post_list_thumb';

/**
 * 创建并返回一个 IntersectionObserver 实例
 */
function createIntersectionObserver(): IntersectionObserver {
  return new IntersectionObserver(
    (entries, observer) => {
      for (const entry of entries) {
        if (entry.isIntersecting) {
          entry.target.classList.add(ANIMATION_CLASS);
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
 * @param {Element} root - 从哪个父元素下开始查找
 */
function observeChildren(root: Element): void {
  if (!intersectionObs) return;
  const targets = root.querySelectorAll(TARGET_SELECTOR);
  targets.forEach(target => {
    // 重置状态，以防因页面切换导致样式残留
    target.classList.remove(ANIMATION_CLASS);
    intersectionObs!.observe(target);
  });
}

/**
 * 初始化动画管理器
 */
export function initArticleAnimations(): void {
  // 如果已存在，先销毁旧的实例，确保从干净的状态开始
  if (intersectionObs || mutationObs) {
    destroyArticleAnimations();
  }

  intersectionObs = createIntersectionObserver();

  // 1. 立即观察当前页面上已存在的文章
  observeChildren(document.body);

  // 2. 创建 MutationObserver 监听后续动态添加的文章
  mutationObs = new MutationObserver(mutations => {
    for (const mutation of mutations) {
      if (mutation.type === 'childList') {
        for (const node of mutation.addedNodes) {
          // 只关心被添加的元素节点
          if (node.nodeType === Node.ELEMENT_NODE) {
            observeChildren(node as Element);
          }
        }
      }
    }
  });

  // 开始监听整个文档的变化
  mutationObs.observe(document.body, {
    childList: true,
    subtree: true,
  });
}

/**
 * 销毁并清理所有观察者
 * 应在 Astro 的 'astro:before-swap' 事件中调用
 */
export function destroyArticleAnimations(): void {
  if (intersectionObs) {
    intersectionObs.disconnect();
    intersectionObs = null;
  }
  if (mutationObs) {
    mutationObs.disconnect();
    mutationObs = null;
  }
}
