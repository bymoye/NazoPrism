'use client';

import { useCallback, useMemo } from 'react';
import { useThemeContext } from '../contexts/ThemeContext';
import { UseThemeReturn } from '../types/hooks';

/**
 * 主题管理 Hook
 *
 * @returns 主题状态和操作方法对象
 */
export const useTheme = (): UseThemeReturn => {
  const {
    seedColor,
    isDark,
    isLoading,
    error,
    updateTheme: contextUpdateTheme,
    toggleDarkMode: contextToggleDarkMode,
    setDarkMode: contextSetDarkMode,
  } = useThemeContext();

  /**
   * 更新主题颜色
   *
   * @param color - 种子颜色值
   */
  const updateTheme = useCallback(
    async (color: number) => {
      await contextUpdateTheme(color);
    },
    [contextUpdateTheme],
  );

  /**
   * 设置深色模式
   *
   * @param isDark - 是否为深色模式
   */
  const setDarkMode = useCallback(
    (isDark: boolean) => {
      contextSetDarkMode(isDark);
    },
    [contextSetDarkMode],
  );

  /**
   * 切换深色模式
   */
  const toggleDarkMode = useCallback(() => {
    contextToggleDarkMode();
  }, [contextToggleDarkMode]);

  // 主题对象
  const theme = useMemo(
    () => ({
      seedColor,
      isDark,
      cssVariables: {}, // CSS variables handled by theme-manager
    }),
    [seedColor, isDark],
  );

  /**
   * 返回主题状态和操作方法对象
   */
  return useMemo(
    () => ({
      theme,
      updateTheme,
      setDarkMode,
      toggleDarkMode,
      isLoading,
      error,
    }),
    [theme, updateTheme, setDarkMode, toggleDarkMode, isLoading, error],
  );
};
