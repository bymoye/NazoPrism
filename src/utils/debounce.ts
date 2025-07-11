/**
 * 统一的工具函数库
 * 避免重复实现，提供一致的API
 */

import { getScrollTop } from './scroll-utils';

/**
 * 防抖函数 - 支持头部和尾部执行选项
 */
export function debounce<F extends (...args: unknown[]) => unknown>(
  fn: F,
  delay: number,
  leading: boolean = false,
): (this: ThisParameterType<F>, ...args: Parameters<F>) => void {
  let timer: ReturnType<typeof setTimeout> | null = null;

  return function (this: ThisParameterType<F>, ...args: Parameters<F>): void {
    const later = () => {
      timer = null;
      if (!leading) {
        fn.apply(this, args);
      }
    };

    const callNow = leading && !timer;

    if (timer) {
      clearTimeout(timer);
    }
    timer = setTimeout(later, delay);

    if (callNow) {
      fn.apply(this, args);
    }
  };
}

/**
 * 节流函数 - 限制执行频率，在指定时间内最多执行一次
 */
export function throttle<F extends (...args: unknown[]) => unknown>(
  fn: F,
  limit: number,
  trailing: boolean = true,
): (this: ThisParameterType<F>, ...args: Parameters<F>) => void {
  let inThrottle: boolean = false;
  let lastArgs: Parameters<F> | null = null;

  return function (this: ThisParameterType<F>, ...args: Parameters<F>): void {
    if (!inThrottle) {
      inThrottle = true;
      fn.apply(this, args);
      setTimeout(() => {
        inThrottle = false;
        if (trailing && lastArgs) {
          fn.apply(this, lastArgs);
          lastArgs = null;
        }
      }, limit);
    } else {
      lastArgs = args;
    }
  };
}

/**
 * 请求动画帧防抖 - 使用 requestAnimationFrame 进行防抖，适合动画和滚动
 */
export function rafDebounce<F extends (...args: unknown[]) => void>(
  fn: F,
): (this: ThisParameterType<F>, ...args: Parameters<F>) => void {
  let rafId: number | null = null;

  return function (this: ThisParameterType<F>, ...args: Parameters<F>) {
    if (rafId) {
      cancelAnimationFrame(rafId);
    }
    rafId = requestAnimationFrame(() => {
      fn.apply(this, args);
      rafId = null;
    });
  };
}

/**
 * 高性能滚动防抖
 */
export function createScrollProcessor(
  onScroll: (scrollTop: number) => void, // 回调函数直接接收 scrollTop
  threshold: number = 1,
): () => void {
  // 返回的函数不接收参数，因为滚动事件的上下文已经由内部处理
  let rafId: number | null = null;
  let lastScrollTop: number | null = null;

  return function () {
    if (rafId) {
      cancelAnimationFrame(rafId);
    }

    rafId = requestAnimationFrame(() => {
      const currentScrollTop = getScrollTop();

      if (lastScrollTop === null || Math.abs(currentScrollTop - lastScrollTop) >= threshold) {
        lastScrollTop = currentScrollTop;
        // 直接将计算出的 scrollTop 传递给回调
        onScroll(currentScrollTop);
      }
      rafId = null;
    });
  };
}
