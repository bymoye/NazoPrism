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
 * 获取当前页面的垂直滚动百分比
 * @returns {number} 一个在 0 和 1 之间的小数，表示滚动进度。
 */
export function getScrollPercent(): number {
  const de = document.documentElement;
  const scrollTop = de.scrollTop;

  // 总共可以滚动的距离 = 文档总高度 - 视口高度
  const scrollableHeight = de.scrollHeight - de.clientHeight;

  // 如果内容不足或恰好一屏，无法滚动
  if (scrollableHeight <= 0) {
    return scrollTop > 0 ? 1 : 0;
  }

  const tolerance = 1; // 1px 的容差

  // 如果滚动距离离顶部在 1px 容差范围内，直接返回 0
  if (scrollTop <= tolerance) {
    return 0;
  }

  // 如果滚动距离离底部在 1px 容差范围内，直接返回 1
  if (scrollTop >= scrollableHeight - tolerance) {
    return 1;
  }

  // 正常计算中间过程的百分比
  return scrollTop / scrollableHeight;
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
