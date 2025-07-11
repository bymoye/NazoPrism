// 通用的滚动相关工具函数

/**
 * 获取当前滚动位置
 */
export function getScrollTop(): number {
  return document.documentElement.scrollTop || document.body.scrollTop || 0;
}

/**
 * 获取文档总高度
 */
export function getScrollHeight(): number {
  return document.documentElement.scrollHeight || document.body.scrollHeight || 0;
}

/**
 * 获取视口高度
 */
export function getClientHeight(): number {
  return document.documentElement.clientHeight || document.body.clientHeight || 0;
}

/**
 * 计算滚动百分比
 */
export function getScrollPercent(): number {
  const scrollTop = getScrollTop();
  const scrollHeight = getScrollHeight();
  const clientHeight = getClientHeight();
  const maxScrollTop = scrollHeight - clientHeight;

  if (maxScrollTop <= 0) return 0;

  // 计算原始百分比
  const rawPercent = scrollTop / maxScrollTop;

  // 处理边界情况，确保精确的 0% 和 100%
  if (rawPercent <= 0.001) return 0; // 接近顶部时返回 0
  if (rawPercent >= 0.999) return 1; // 接近底部时返回 1

  return Math.min(Math.max(rawPercent, 0), 1);
}

/**
 * 平滑滚动到指定位置
 */
export function smoothScrollTo(top: number, behavior: ScrollBehavior = 'smooth'): void {
  window.scrollTo({ top, behavior });
}

/**
 * 检查元素是否在视口内
 */
export function isInViewport(element: Element, threshold: number = 0): boolean {
  const rect = element.getBoundingClientRect();
  const windowHeight = window.innerHeight || document.documentElement.clientHeight;
  const windowWidth = window.innerWidth || document.documentElement.clientWidth;

  return (
    rect.top <= windowHeight * (1 - threshold) &&
    rect.bottom >= windowHeight * threshold &&
    rect.left <= windowWidth * (1 - threshold) &&
    rect.right >= windowWidth * threshold
  );
}
