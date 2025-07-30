'use client';

import React, {
  createContext,
  useContext,
  useCallback,
  useEffect,
  ReactNode,
  useMemo,
  useState,
} from 'react';
import { themeManager } from '@/utils/theme-manager';
import { isError, isArray } from '@/utils/type-guards';

/**
 * 主题错误处理辅助函数
 *
 * @param error - 捕获的错误对象
 * @param operation - 执行的操作名称
 */
const handleThemeError = (error: unknown, operation: string) => {
  const errorMessage = isError(error) ? error.message : `${operation}失败`;
  console.error(`${operation}失败:`, errorMessage);
};

/**
 * 主题上下文类型定义
 */
interface ThemeContextType {
  /** 当前主题的种子颜色（数值格式） */
  seedColor: number;
  /** 是否为深色模式 */
  isDark: boolean;
  /** 主题是否正在加载中 */
  isLoading: boolean;
  /** 错误信息，如果有的话 */
  error: string | null;

  /**
   * 更新主题的方法
   * @param colorOrColors - 单个颜色数值或颜色字符串数组
   */
  updateTheme: (colorOrColors: number | string[]) => Promise<void>;

  /**
   * 从图片更新主题的方法
   * @param imageUrl - 主图片URL
   * @param nextImageUrl - 备用图片URL（可选）
   * @param onImageFailed - 图片加载失败时的回调函数（可选）
   */
  updateThemeFromImage: (
    imageUrl: string,
    nextImageUrl?: string,
    onImageFailed?: (failedImageUrl: string) => void,
  ) => Promise<void>;

  /** 切换深色模式的方法 */
  toggleDarkMode: () => void;

  /**
   * 直接设置深色模式的方法
   * @param isDark - 是否启用深色模式
   */
  setDarkMode: (isDark: boolean) => void;
}

/**
 * 主题上下文对象
 */
const ThemeContext = createContext<ThemeContextType | undefined>(undefined);

/**
 * 主题提供者组件的属性接口
 */
interface ThemeProviderProps {
  /** 子组件 */
  children: ReactNode;
}

/**
 * 主题提供者组件
 *
 * @param props - 组件属性
 * @returns 主题提供者组件
 */
export const ThemeProvider = ({ children }: ThemeProviderProps) => {
  const [seedColor, setSeedColor] = useState(0x6750a4);
  const [isDark, setIsDark] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  /**
   * 更新主题的方法
   *
   * @param colorOrColors - 单个颜色数值或颜色字符串数组
   */
  const updateTheme = useCallback(async (colorOrColors: number | string[]) => {
    setIsLoading(true);
    setError(null);

    try {
      if (isArray<string>(colorOrColors)) {
        await themeManager.updateThemeFromColors(colorOrColors);
      } else {
        const hexColor = `#${colorOrColors.toString(16).padStart(6, '0')}`;
        await themeManager.updateThemeFromColors([hexColor]);
        setSeedColor(colorOrColors);
      }
      setIsDark(themeManager.isDarkMode());
    } catch (error) {
      handleThemeError(error, '主题更新');
      setError('主题更新失败');
    } finally {
      setIsLoading(false);
    }
  }, []);

  /**
   * 从图片更新主题的方法
   *
   * @param imageUrl - 主图片URL
   * @param nextImageUrl - 备用图片URL（可选）
   * @param onImageFailed - 图片加载失败时的回调函数（可选）
   */
  const updateThemeFromImage = useCallback(
    async (
      imageUrl: string,
      nextImageUrl?: string,
      onImageFailed?: (failedImageUrl: string) => void,
    ) => {
      setIsLoading(true);
      setError(null);

      try {
        await themeManager.updateThemeFromImage(imageUrl, nextImageUrl);
        setIsDark(themeManager.isDarkMode());
      } catch (error) {
        handleThemeError(error, '从图片更新主题');
        setError('从图片更新主题失败');
        onImageFailed?.(imageUrl);
      } finally {
        setIsLoading(false);
      }
    },
    [],
  );

  /**
   * 设置深色模式的方法
   *
   * @param isDarkMode - 是否启用深色模式
   */
  const setDarkMode = useCallback((isDarkMode: boolean) => {
    themeManager.setDarkMode(isDarkMode);
    setIsDark(isDarkMode);
  }, []);

  /**
   * 切换深色模式的方法
   */
  const toggleDarkMode = useCallback(() => {
    const newIsDark = !isDark;
    setDarkMode(newIsDark);
  }, [isDark, setDarkMode]);

  // 初始化主题效果钩子
  useEffect(() => {
    // 初始化主题管理器的异步函数
    const initializeTheme = async (): Promise<() => void> => {
      return themeManager.initTheme();
    };

    let cleanup: (() => void) | undefined;

    // 在useEffect内部调用异步函数
    initializeTheme()
      .then(cleanupFn => {
        cleanup = cleanupFn;
      })
      .catch(error => {
        console.error('主题初始化失败:', error);
      });

    // 返回清理函数
    return () => {
      if (cleanup) {
        cleanup();
      }
    };
  }, []);

  // 主题上下文值
  const contextValue: ThemeContextType = useMemo(
    () => ({
      seedColor,
      isDark,
      isLoading,
      error,
      updateTheme,
      updateThemeFromImage,
      toggleDarkMode,
      setDarkMode,
    }),
    [
      seedColor,
      isDark,
      isLoading,
      error,
      updateTheme,
      updateThemeFromImage,
      toggleDarkMode,
      setDarkMode,
    ],
  );

  return <ThemeContext.Provider value={contextValue}>{children}</ThemeContext.Provider>;
};

/**
 * 使用主题上下文的Hook
 *
 * @returns 主题上下文对象
 * @throws 如果在ThemeProvider外部使用则抛出错误
 */
export const useThemeContext = () => {
  const context = useContext(ThemeContext);
  if (context === undefined) {
    throw new Error('useThemeContext 必须在 ThemeProvider 内使用');
  }
  return context;
};

// 导出主题上下文类型供外部使用
export type { ThemeContextType };
