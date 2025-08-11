'use client';

import { createContext, type ReactNode, useContext, useState } from 'react';

/**
 * 应用状态接口
 */
interface AppState {
  /** 是否正在加载 */
  isLoading: boolean;
  /** 错误信息 */
  error: string | null;
}

/**
 * 应用上下文类型定义
 */
interface AppContextType {
  /** 应用状态 */
  state: AppState;
  /** 设置加载状态 */
  setLoading: (_loading: boolean) => void;
  /** 设置错误信息 */
  setError: (_error: string | null) => void;
}

const AppContext = createContext<AppContextType | undefined>(undefined);

/**
 * 应用提供者组件属性接口
 */
interface AppProviderProps {
  /** 子组件 */
  children: ReactNode;
}

/**
 * 应用提供者组件
 *
 * @param props - 组件属性
 * @returns 应用提供者组件
 */
export const AppProvider = ({ children }: AppProviderProps) => {
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const contextValue = {
    state: { isLoading, error },
    setLoading: setIsLoading,
    setError,
  };

  return <AppContext.Provider value={contextValue}>{children}</AppContext.Provider>;
};

/**
 * 使用应用上下文的Hook
 *
 * @returns 应用上下文对象
 * @throws 当在AppProvider外部使用时抛出错误
 */
export const useAppContext = () => {
  const context = useContext(AppContext);
  if (context === undefined) {
    throw new Error('useAppContext must be used within an AppProvider');
  }
  return context;
};

export type { AppState, AppContextType };
