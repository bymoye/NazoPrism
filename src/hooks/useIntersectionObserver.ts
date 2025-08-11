/**
 * @file hooks/useIntersectionObserver.ts
 * @description 交叉观察器Hook
 */

import { useEffect, useRef } from 'react';

type ObserverCallback = (_entries: IntersectionObserverEntry[]) => void;

interface UseIntersectionObserverOptions extends IntersectionObserverInit {
  enabled?: boolean;
}

/**
 * 交叉观察器Hook，用于监听元素与视口的交叉状态
 *
 * @param callback - 交叉状态变化时的回调函数
 * @param options - 观察器配置选项
 * @returns 包含observe、unobserve、disconnect方法的对象
 */
export const useIntersectionObserver = (
  callback: ObserverCallback,
  options: UseIntersectionObserverOptions = {},
) => {
  const { root = null, rootMargin = '0px', threshold = 0, enabled = true } = options;
  const observerRef = useRef<IntersectionObserver | null>(null);
  const targetsRef = useRef<Set<Element>>(new Set());

  useEffect(() => {
    if (!enabled) {
      observerRef.current?.disconnect();
      observerRef.current = null;
      targetsRef.current.clear();
      return;
    }

    const observer = new IntersectionObserver(callback, {
      root,
      rootMargin,
      threshold,
    });
    observerRef.current = observer;

    for (const target of targetsRef.current) {
      observer.observe(target);
    }

    return () => {
      observer.disconnect();
    };
  }, [enabled, root, rootMargin, threshold, callback]);

  const observe = (target: Element) => {
    if (!enabled) {
      return;
    }
    targetsRef.current.add(target);
    if (observerRef.current) {
      observerRef.current.observe(target);
    }
  };

  const unobserve = (target: Element) => {
    targetsRef.current.delete(target);
    if (observerRef.current) {
      observerRef.current.unobserve(target);
    }
  };

  const disconnect = () => {
    if (observerRef.current) {
      observerRef.current.disconnect();
    }
    targetsRef.current.clear();
  };

  return { observe, unobserve, disconnect };
};

export type { ObserverCallback, UseIntersectionObserverOptions };
