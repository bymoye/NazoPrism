/**
 * @file __tests__/hooks/useTheme.test.tsx
 * @description 测试主题管理Hook
 */

import { renderHook, act } from '@testing-library/react';
import { useTheme } from '@/hooks/useTheme';
import { useThemeContext } from '@/contexts/ThemeContext';
import { UseThemeReturn } from '@/types/hooks';

// Mock ThemeContext
jest.mock('../../contexts/ThemeContext', () => ({
  useThemeContext: jest.fn(),
}));

const mockUseThemeContext = useThemeContext as jest.MockedFunction<typeof useThemeContext>;

describe('useTheme', () => {
  const mockContextValue = {
    seedColor: 0xff0000,
    isDark: false,
    isLoading: false,
    error: null,
    updateTheme: jest.fn(),
    updateThemeFromImage: jest.fn(),
    toggleDarkMode: jest.fn(),
    setDarkMode: jest.fn(),
    cssVariables: {},
    theme: {
      seedColor: 0xff0000,
      isDark: false,
      cssVariables: {},
    },
  };

  beforeEach(() => {
    jest.clearAllMocks();
    mockUseThemeContext.mockReturnValue(mockContextValue);
  });

  test('应该返回正确的主题状态和方法', () => {
    const { result } = renderHook(() => useTheme());

    expect(result.current).toHaveProperty('theme');
    expect(result.current).toHaveProperty('updateTheme');
    expect(result.current).toHaveProperty('setDarkMode');
    expect(result.current).toHaveProperty('toggleDarkMode');
    expect(result.current).toHaveProperty('isLoading');
    expect(result.current).toHaveProperty('error');

    expect(typeof result.current.updateTheme).toBe('function');
    expect(typeof result.current.setDarkMode).toBe('function');
    expect(typeof result.current.toggleDarkMode).toBe('function');
  });

  test('应该返回正确的主题对象', () => {
    const { result } = renderHook(() => useTheme());

    expect(result.current.theme).toEqual({
      seedColor: 0xff0000,
      isDark: false,
      cssVariables: {},
    });
  });

  test('应该返回正确的加载状态和错误信息', () => {
    mockUseThemeContext.mockReturnValue({
      ...mockContextValue,
      isLoading: true,
      error: 'Theme error',
    });

    const { result } = renderHook(() => useTheme());

    expect(result.current.isLoading).toBe(true);
    expect(result.current.error).toBe('Theme error');
  });

  test('应该调用context的updateTheme方法', async () => {
    const { result } = renderHook(() => useTheme());
    const newColor = 0x00ff00;

    await act(async () => {
      await result.current.updateTheme(newColor);
    });

    expect(mockContextValue.updateTheme).toHaveBeenCalledWith(newColor);
    expect(mockContextValue.updateTheme).toHaveBeenCalledTimes(1);
  });

  test('应该调用context的setDarkMode方法', () => {
    const { result } = renderHook(() => useTheme());

    act(() => {
      result.current.setDarkMode(true);
    });

    expect(mockContextValue.setDarkMode).toHaveBeenCalledWith(true);
    expect(mockContextValue.setDarkMode).toHaveBeenCalledTimes(1);

    act(() => {
      result.current.setDarkMode(false);
    });

    expect(mockContextValue.setDarkMode).toHaveBeenCalledWith(false);
    expect(mockContextValue.setDarkMode).toHaveBeenCalledTimes(2);
  });

  test('应该调用context的toggleDarkMode方法', () => {
    const { result } = renderHook(() => useTheme());

    act(() => {
      result.current.toggleDarkMode();
    });

    expect(mockContextValue.toggleDarkMode).toHaveBeenCalledTimes(1);
  });

  test('应该在seedColor或isDark变化时更新主题对象', () => {
    const { result, rerender } = renderHook(() => useTheme());
    const initialTheme = result.current.theme;

    // 更新seedColor
    mockUseThemeContext.mockReturnValue({
      ...mockContextValue,
      seedColor: 0x00ff00,
    });

    rerender();
    const updatedTheme = result.current.theme;

    expect(updatedTheme).not.toBe(initialTheme);
    expect(updatedTheme.seedColor).toBe(0x00ff00);
  });

  test('应该在isDark变化时更新主题对象', () => {
    const { result, rerender } = renderHook(() => useTheme());
    const initialTheme = result.current.theme;

    // 更新isDark
    mockUseThemeContext.mockReturnValue({
      ...mockContextValue,
      isDark: true,
    });

    rerender();
    const updatedTheme = result.current.theme;

    expect(updatedTheme).not.toBe(initialTheme);
    expect(updatedTheme.isDark).toBe(true);
  });

  test('应该保持函数引用的稳定性', () => {
    const { result, rerender } = renderHook(() => useTheme());
    const initialUpdateTheme = result.current.updateTheme;
    const initialSetDarkMode = result.current.setDarkMode;
    const initialToggleDarkMode = result.current.toggleDarkMode;

    rerender();

    expect(result.current.updateTheme).toBe(initialUpdateTheme);
    expect(result.current.setDarkMode).toBe(initialSetDarkMode);
    expect(result.current.toggleDarkMode).toBe(initialToggleDarkMode);
  });

  test('应该处理异步updateTheme调用', async () => {
    const mockAsyncUpdateTheme = jest.fn().mockResolvedValue(undefined);
    mockUseThemeContext.mockReturnValue({
      ...mockContextValue,
      updateTheme: mockAsyncUpdateTheme,
    });

    const { result } = renderHook(() => useTheme());
    const newColor = 0x0000ff;

    await act(async () => {
      await result.current.updateTheme(newColor);
    });

    expect(mockAsyncUpdateTheme).toHaveBeenCalledWith(newColor);
  });

  test('应该处理updateTheme的错误', async () => {
    const mockError = 'Update theme failed';
    const mockFailingUpdateTheme = jest.fn().mockRejectedValue(new Error(mockError));
    mockUseThemeContext.mockReturnValue({
      ...mockContextValue,
      updateTheme: mockFailingUpdateTheme,
    });

    const { result } = renderHook(() => useTheme());
    const newColor = 0x0000ff;

    await expect(async () => {
      await act(async () => {
        await result.current.updateTheme(newColor);
      });
    }).rejects.toThrow(mockError);

    expect(mockFailingUpdateTheme).toHaveBeenCalledWith(newColor);
  });

  test('应该处理不同的seedColor值', () => {
    const testColors = [0x000000, 0xffffff, 0xff0000, 0x00ff00, 0x0000ff, 0x123456];

    testColors.forEach(color => {
      mockUseThemeContext.mockReturnValue({
        ...mockContextValue,
        seedColor: color,
      });

      const { result } = renderHook(() => useTheme());
      expect(result.current.theme.seedColor).toBe(color);
    });
  });

  test('应该处理不同的isDark值', () => {
    [true, false].forEach(isDark => {
      mockUseThemeContext.mockReturnValue({
        ...mockContextValue,
        isDark,
      });

      const { result } = renderHook(() => useTheme());
      expect(result.current.theme.isDark).toBe(isDark);
    });
  });

  test('应该处理不同的加载状态', () => {
    [true, false].forEach(isLoading => {
      mockUseThemeContext.mockReturnValue({
        ...mockContextValue,
        isLoading,
      });

      const { result } = renderHook(() => useTheme());
      expect(result.current.isLoading).toBe(isLoading);
    });
  });

  test('应该处理不同的错误状态', () => {
    const testErrors = [null, 'Network error', 'Validation error', 'String error'];

    testErrors.forEach(error => {
      mockUseThemeContext.mockReturnValue({
        ...mockContextValue,
        error,
      });

      const { result } = renderHook(() => useTheme());
      expect(result.current.error).toBe(error);
    });
  });

  test('应该正确处理多次连续的主题更新', async () => {
    const { result } = renderHook(() => useTheme());
    const colors = [0xff0000, 0x00ff00, 0x0000ff];

    for (const color of colors) {
      await act(async () => {
        await result.current.updateTheme(color);
      });
    }

    expect(mockContextValue.updateTheme).toHaveBeenCalledTimes(3);
    colors.forEach((color, index) => {
      expect(mockContextValue.updateTheme).toHaveBeenNthCalledWith(index + 1, color);
    });
  });

  test('应该正确处理多次连续的深色模式切换', () => {
    const { result } = renderHook(() => useTheme());

    act(() => {
      result.current.toggleDarkMode();
      result.current.toggleDarkMode();
      result.current.toggleDarkMode();
    });

    expect(mockContextValue.toggleDarkMode).toHaveBeenCalledTimes(3);
  });

  test('应该正确处理混合的深色模式操作', () => {
    const { result } = renderHook(() => useTheme());

    act(() => {
      result.current.setDarkMode(true);
      result.current.toggleDarkMode();
      result.current.setDarkMode(false);
      result.current.toggleDarkMode();
    });

    expect(mockContextValue.setDarkMode).toHaveBeenCalledTimes(2);
    expect(mockContextValue.setDarkMode).toHaveBeenNthCalledWith(1, true);
    expect(mockContextValue.setDarkMode).toHaveBeenNthCalledWith(2, false);
    expect(mockContextValue.toggleDarkMode).toHaveBeenCalledTimes(2);
  });

  test('应该返回符合UseThemeReturn类型的对象', () => {
    const { result } = renderHook(() => useTheme());
    const themeReturn: UseThemeReturn = result.current;

    // 验证返回值符合类型定义
    expect(themeReturn).toHaveProperty('theme');
    expect(themeReturn.theme).toHaveProperty('seedColor');
    expect(themeReturn.theme).toHaveProperty('isDark');
    expect(themeReturn.theme).toHaveProperty('cssVariables');
    expect(themeReturn).toHaveProperty('updateTheme');
    expect(themeReturn).toHaveProperty('setDarkMode');
    expect(themeReturn).toHaveProperty('toggleDarkMode');
    expect(themeReturn).toHaveProperty('isLoading');
    expect(themeReturn).toHaveProperty('error');
  });
});
