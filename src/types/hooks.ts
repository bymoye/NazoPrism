/**
 * @file types/hooks.ts
 * @description Hook相关的类型定义
 */

/**
 * useTheme hook返回类型
 */
export interface UseThemeReturn {
  theme: {
    seedColor: number;
    isDark: boolean;
    cssVariables: Record<string, string>;
  };
  /** 更新主题颜色 */
  updateTheme: (color: number) => Promise<void>;
  /** 直接设置深色模式 */
  setDarkMode: (isDark: boolean) => void;
  /** 切换深色模式 */
  toggleDarkMode: () => void;
  /** 是否正在加载 */
  isLoading: boolean;
  /** 错误信息 */
  error: string | null;
}
