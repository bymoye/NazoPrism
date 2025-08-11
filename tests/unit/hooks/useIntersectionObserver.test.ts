/**
 * @file __tests__/hooks/useIntersectionObserver.test.ts
 * @description 测试 IntersectionObserver hooks
 */

import { act, renderHook } from '@testing-library/react';
import { useIntersectionObserver } from '@/hooks/useIntersectionObserver';

// Mock IntersectionObserver
const mockObserve = jest.fn();
const mockUnobserve = jest.fn();
const mockDisconnect = jest.fn();

class MockIntersectionObserver implements IntersectionObserver {
  readonly root: Element | Document | null = null;
  readonly rootMargin: string = '0px';
  readonly thresholds: readonly number[] = [0];
  private callback: IntersectionObserverCallback;

  constructor(callback: IntersectionObserverCallback, options?: IntersectionObserverInit) {
    this.callback = callback;
    if (options?.root) {
      this.root = options.root;
    }
    if (options?.rootMargin) {
      this.rootMargin = options.rootMargin;
    }
    if (options?.threshold) {
      this.thresholds = Array.isArray(options.threshold) ? options.threshold : [options.threshold];
    }
  }

  observe = mockObserve;
  unobserve = mockUnobserve;
  disconnect = mockDisconnect;

  takeRecords(): IntersectionObserverEntry[] {
    return [];
  }

  // 模拟触发回调
  trigger(entries: IntersectionObserverEntry[]) {
    this.callback(entries, this);
  }
}

// 存储创建的observer实例
let observerInstances: MockIntersectionObserver[] = [];

global.IntersectionObserver = jest.fn().mockImplementation((callback, options) => {
  const instance = new MockIntersectionObserver(callback, options);
  observerInstances.push(instance);
  return instance;
}) as jest.MockedClass<typeof IntersectionObserver>;

describe('useIntersectionObserver', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    observerInstances = [];
  });

  test('应该创建IntersectionObserver实例', () => {
    const callback = jest.fn();
    renderHook(() => useIntersectionObserver(callback));

    expect(global.IntersectionObserver).toHaveBeenCalledWith(callback, {
      root: null,
      rootMargin: '0px',
      threshold: 0,
    });
  });

  test('应该使用自定义选项创建observer', () => {
    const callback = jest.fn();
    const options = {
      root: document.body,
      rootMargin: '10px',
      threshold: 0.5,
    };

    renderHook(() => useIntersectionObserver(callback, options));

    expect(global.IntersectionObserver).toHaveBeenCalledWith(
      callback,
      expect.objectContaining(options),
    );
  });

  test('应该在enabled为false时不创建observer', () => {
    const callback = jest.fn();
    renderHook(() => useIntersectionObserver(callback, { enabled: false }));

    expect(global.IntersectionObserver).not.toHaveBeenCalled();
  });

  test('应该返回observe、unobserve和disconnect方法', () => {
    const callback = jest.fn();
    const { result } = renderHook(() => useIntersectionObserver(callback));

    expect(result.current).toHaveProperty('observe');
    expect(result.current).toHaveProperty('unobserve');
    expect(result.current).toHaveProperty('disconnect');
    expect(typeof result.current.observe).toBe('function');
    expect(typeof result.current.unobserve).toBe('function');
    expect(typeof result.current.disconnect).toBe('function');
  });

  test('observe方法应该观察目标元素', () => {
    const callback = jest.fn();
    const { result } = renderHook(() => useIntersectionObserver(callback));
    const element = document.createElement('div');

    act(() => {
      result.current.observe(element);
    });

    expect(mockObserve).toHaveBeenCalledWith(element);
  });

  test('unobserve方法应该停止观察目标元素', () => {
    const callback = jest.fn();
    const { result } = renderHook(() => useIntersectionObserver(callback));
    const element = document.createElement('div');

    act(() => {
      result.current.observe(element);
      result.current.unobserve(element);
    });

    expect(mockUnobserve).toHaveBeenCalledWith(element);
  });

  test('disconnect方法应该断开所有观察', () => {
    const callback = jest.fn();
    const { result } = renderHook(() => useIntersectionObserver(callback));

    act(() => {
      result.current.disconnect();
    });

    expect(mockDisconnect).toHaveBeenCalled();
  });

  test('应该在enabled变为false时断开observer', () => {
    const callback = jest.fn();
    const { rerender } = renderHook(
      ({ enabled }: { enabled: boolean }) => useIntersectionObserver(callback, { enabled }),
      { initialProps: { enabled: true } },
    );

    expect(global.IntersectionObserver).toHaveBeenCalled();

    rerender({ enabled: false });

    expect(mockDisconnect).toHaveBeenCalled();
  });

  test('应该在enabled为false时忽略observe调用', () => {
    const callback = jest.fn();
    const { result } = renderHook(() => useIntersectionObserver(callback, { enabled: false }));
    const element = document.createElement('div');

    act(() => {
      result.current.observe(element);
    });

    expect(mockObserve).not.toHaveBeenCalled();
  });

  test('应该在组件卸载时清理observer', () => {
    const callback = jest.fn();
    const { unmount } = renderHook(() => useIntersectionObserver(callback));

    unmount();

    expect(mockDisconnect).toHaveBeenCalled();
  });

  test('应该在选项变化时重新创建observer', () => {
    const callback = jest.fn();
    const { rerender } = renderHook(
      ({ threshold }: { threshold: number }) => useIntersectionObserver(callback, { threshold }),
      { initialProps: { threshold: 0 } },
    );

    expect(global.IntersectionObserver).toHaveBeenCalledTimes(1);

    rerender({ threshold: 0.5 });

    expect(global.IntersectionObserver).toHaveBeenCalledTimes(2);
    expect(mockDisconnect).toHaveBeenCalled();
  });
});
