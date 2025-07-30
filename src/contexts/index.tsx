'use client';

import React, { ReactNode } from 'react';

import { AppProvider } from './AppContext';
import { NavigationProvider } from './NavigationContext';
import { ThemeProvider } from './ThemeContext';

/**
 * 提供者组件属性接口
 */
interface ProvidersProps {
  /** 子组件 */
  children: ReactNode;
}

/**
 * 组合所有上下文提供者的根组件
 *
 * @param props - 组件属性
 * @returns 提供者组合组件
 */
export const Providers = ({ children }: ProvidersProps) => {
  return (
    <AppProvider>
      <ThemeProvider>
        <NavigationProvider>{children}</NavigationProvider>
      </ThemeProvider>
    </AppProvider>
  );
};

// 重新导出所有上下文和Hook以便使用
export { AppProvider, useAppContext } from './AppContext';
export { ThemeProvider, useThemeContext } from './ThemeContext';
export { NavigationProvider, useNavigationContext } from './NavigationContext';

// 重新导出类型
export type { AppState, AppContextType } from './AppContext';
export type { ThemeContextType } from './ThemeContext';
export type { NavigationContextType, NavigationItem } from './NavigationContext';
