/**
 * 统一的工具函数库
 * 避免重复实现，提供一致的API
 */

/**
 * 防抖函数 - 延迟执行，在指定时间内重复调用会重置计时器
 */
export function debounce<T extends (...args: any[]) => void>(fn: T, delay: number): T {
    let timer: ReturnType<typeof setTimeout>;
    return function (this: any, ...args: any[]) {
        clearTimeout(timer);
        timer = setTimeout(() => fn.apply(this, args), delay);
    } as T;
}

/**
 * 节流函数 - 限制执行频率，在指定时间内最多执行一次
 */
export function throttle<T extends (...args: any[]) => void>(fn: T, limit: number): T {
    let inThrottle: boolean;
    return function (this: any, ...args: any[]) {
        if (!inThrottle) {
            fn.apply(this, args);
            inThrottle = true;
            setTimeout(() => inThrottle = false, limit);
        }
    } as T;
}

/**
 * 请求动画帧防抖 - 使用 requestAnimationFrame 进行防抖，适合动画和滚动
 */
export function rafDebounce<T extends (...args: any[]) => void>(fn: T): T {
    let rafId: number | null = null;
    return function (this: any, ...args: any[]) {
        if (rafId) {
            cancelAnimationFrame(rafId);
        }
        rafId = requestAnimationFrame(() => {
            fn.apply(this, args);
            rafId = null;
        });
    } as T;
}

/**
 * 高性能滚动防抖 - 带阈值检查的 RAF 防抖，避免微小变化触发
 */
export function rafScrollDebounce<T extends (...args: any[]) => void>(
    fn: T,
    threshold: number = 1
): T {
    let rafId: number | null = null;
    let lastScrollTop = 0;
    let isFirstCall = true;

    return function (this: any, ...args: any[]) {
        const currentScrollTop = document.documentElement.scrollTop || document.body.scrollTop || 0;

        // 首次调用或滚动距离超过阈值才执行
        if (isFirstCall || Math.abs(currentScrollTop - lastScrollTop) >= threshold) {
            if (rafId) {
                cancelAnimationFrame(rafId);
            }

            rafId = requestAnimationFrame(() => {
                lastScrollTop = currentScrollTop;
                isFirstCall = false;
                fn.apply(this, args);
                rafId = null;
            });
        }
    } as T;
}

// 保持向后兼容
export default debounce;
