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
    return Math.min(Math.max(scrollTop / maxScrollTop, 0), 1);
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