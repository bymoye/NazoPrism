'use client';

import { useThemeContext } from '@/contexts/ThemeContext';
import type { UseThemeReturn } from '@/types/hooks';

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
   * @returns Promise<void>
   */
  const updateTheme = async (color: number): Promise<void> => {
    return new Promise<void>(resolve => {
      contextUpdateTheme(color);
      resolve();
    });
  };

  /**
   * 设置深色模式
   *
   * @param isDark - 是否为深色模式
   */
  const setDarkMode = (darkMode: boolean) => {
    contextSetDarkMode(darkMode);
  };

  /**
   * 切换深色模式
   */
  const toggleDarkMode = () => {
    contextToggleDarkMode();
  };

  /** 主题对象 */
  const theme = {
    seedColor,
    isDark,
    cssVariables: {} /** CSS变量由theme-manager处理 */,
  };

  /**
   * 返回主题状态和操作方法对象
   */
  return {
    theme,
    updateTheme,
    setDarkMode,
    toggleDarkMode,
    isLoading,
    error,
  };
};
