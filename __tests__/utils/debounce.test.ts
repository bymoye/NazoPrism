/**
 * 测试防抖和节流工具函数
 */

import { debounce } from '../../utils/debounce';

jest.useFakeTimers();

describe('debounce', () => {
  afterEach(() => {
    jest.clearAllTimers();
  });

  test('应该延迟执行函数', () => {
    const mockFn = jest.fn();
    const debouncedFn = debounce(mockFn, 100);

    debouncedFn('test');
    expect(mockFn).not.toHaveBeenCalled();

    jest.advanceTimersByTime(100);
    expect(mockFn).toHaveBeenCalledWith('test');
  });

  test('应该取消之前的调用', () => {
    const mockFn = jest.fn();
    const debouncedFn = debounce(mockFn, 100);

    debouncedFn('first');
    debouncedFn('second');

    jest.advanceTimersByTime(100);
    expect(mockFn).toHaveBeenCalledWith('second');
    expect(mockFn).toHaveBeenCalledTimes(1);
  });
});
