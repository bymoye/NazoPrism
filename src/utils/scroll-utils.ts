/**
 * 通用的滚动相关工具函数 (专为现代浏览器优化)
 */

/**
 * 获取当前页面垂直滚动的距离。
 * @returns {number} 滚动的像素值。
 * @see https://developer.mozilla.org/en-US/docs/Web/API/Window/scrollY
 */
export function getScrollTop(): number {
  return window.scrollY;
}

/**
 * 获取整个文档内容的总高度。
 * @returns {number} 文档的总高度像素值。
 */
export function getScrollHeight(): number {
  return document.documentElement.scrollHeight;
}

/**
 * 获取浏览器视口（即可见区域）的高度。
 * @returns {number} 视口的高度像素值。
 * @see https://developer.mozilla.org/en-US/docs/Web/API/Window/innerHeight
 */
export function getClientHeight(): number {
  return window.innerHeight;
}

/**
 * 计算当前滚动的百分比 (0 到 1 之间)。
 * @returns {number} 滚动的百分比，例如 0.5 表示滚动了 50%。
 */
export function getScrollPercent(): number {
  const scrollHeight = getScrollHeight();
  const clientHeight = getClientHeight();

  // 如果内容区域不足一屏，无法滚动，则百分比为 0。
  if (scrollHeight <= clientHeight) {
    return 0;
  }

  const scrollTop = getScrollTop();
  const maxScrollable = scrollHeight - clientHeight;
  const rawPercent = scrollTop / maxScrollable;

  // 使用 Math.min 和 Math.max 进行“钳制”，确保结果总是在 [0, 1] 区间内。
  return Math.max(0, Math.min(1, rawPercent));
}

/**
 * 平滑滚动到页面的指定垂直位置。
 * 这是现代浏览器实现平滑滚动的最佳实践。
 * @param {number} top - 滚动到的目标位置 (从页面顶部算起)。
 * @param {ScrollBehavior} behavior - 滚动行为，默认为 'smooth'。
 */
export function smoothScrollTo(top: number, behavior: ScrollBehavior = 'smooth'): void {
  window.scrollTo({ top, behavior });
}
