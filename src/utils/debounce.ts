/**
 * @file src/utils/debounce.ts
 * @description 防抖函数工具
 */

/**
 * 防抖函数 - 在指定时间内只执行最后一次调用
 * @param func 要防抖的函数
 * @param wait 等待时间（毫秒）
 * @param immediate 是否立即执行第一次调用
 * @returns 防抖后的函数
 */
export function debounce<T extends (...args: any[]) => any>(
  func: T,
  wait: number,
  immediate = false
): (...args: Parameters<T>) => void {
  let timeout: ReturnType<typeof setTimeout> | null = null;
  let result: ReturnType<T>;

  return function executedFunction(...args: Parameters<T>) {
    const later = () => {
      timeout = null;
      if (!immediate) result = func(...args);
    };

    const callNow = immediate && !timeout;
    
    if (timeout) {
      clearTimeout(timeout);
    }
    
    timeout = setTimeout(later, wait);
    
    if (callNow) {
      result = func(...args);
    }
    
    return result;
  };
}

/**
 * 节流函数 - 在指定时间内最多执行一次
 * @param func 要节流的函数
 * @param limit 时间限制（毫秒）
 * @returns 节流后的函数
 */
export function throttle<T extends (...args: any[]) => any>(
  func: T,
  limit: number
): (...args: Parameters<T>) => void {
  let inThrottle: boolean;
  let lastResult: ReturnType<T>;

  return function executedFunction(...args: Parameters<T>) {
    if (!inThrottle) {
      lastResult = func(...args);
      inThrottle = true;
      setTimeout(() => {
        inThrottle = false;
      }, limit);
    }
    return lastResult;
  };
}

/**
 * 延迟执行函数
 * @param func 要延迟执行的函数
 * @param delay 延迟时间（毫秒）
 * @returns Promise
 */
export function delay<T extends (...args: any[]) => any>(
  func: T,
  delay: number
): (...args: Parameters<T>) => Promise<ReturnType<T>> {
  return function delayedFunction(...args: Parameters<T>) {
    return new Promise<ReturnType<T>>((resolve) => {
      setTimeout(() => {
        resolve(func(...args));
      }, delay);
    });
  };
}

/**
 * 创建一个可取消的延迟函数
 * @param func 要延迟执行的函数
 * @param delay 延迟时间（毫秒）
 * @returns 包含执行和取消方法的对象
 */
export function createCancelableDelay<T extends (...args: any[]) => any>(
  func: T,
  delay: number
) {
  let timeoutId: ReturnType<typeof setTimeout> | null = null;
  let isExecuted = false;

  return {
    execute(...args: Parameters<T>): Promise<ReturnType<T>> {
      return new Promise<ReturnType<T>>((resolve, reject) => {
        if (isExecuted) {
          reject(new Error('Function already executed'));
          return;
        }

        timeoutId = setTimeout(() => {
          isExecuted = true;
          timeoutId = null;
          resolve(func(...args));
        }, delay);
      });
    },

    cancel(): boolean {
      if (timeoutId && !isExecuted) {
        clearTimeout(timeoutId);
        timeoutId = null;
        return true;
      }
      return false;
    },

    get isExecuted(): boolean {
      return isExecuted;
    },

    get isPending(): boolean {
      return timeoutId !== null && !isExecuted;
    }
  };
}

/**
 * 创建滚动事件处理器 - 针对滚动事件的特殊优化
 * @param func 要执行的函数
 * @param frameSkip 跳过的帧数，用于降低执行频率
 * @returns 优化后的滚动处理函数
 */
export function createScrollProcessor(
  func: () => void,
  frameSkip = 1
): () => void {
  let frameCount = 0;
  let isScheduled = false;

  return function scrollProcessor() {
    if (isScheduled) return;

    isScheduled = true;
    requestAnimationFrame(() => {
      frameCount++;
      if (frameCount >= frameSkip) {
        func();
        frameCount = 0;
      }
      isScheduled = false;
    });
  };
}