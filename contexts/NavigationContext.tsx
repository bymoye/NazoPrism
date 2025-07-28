'use client';

import React, { createContext, useContext, useCallback, ReactNode, useState } from 'react';
import { usePathname, useRouter } from 'next/navigation';

/**
 * 导航项接口
 */
interface NavigationItem {
  /** 导航项名称 */
  name: string;
  /** 导航链接 */
  href: string;
  /** 是否为外部链接 */
  external?: boolean;
}

/**
 * 导航上下文类型定义
 */
interface NavigationContextType {
  /** 当前路径 */
  currentPath: string;
  /** 菜单是否打开 */
  isMenuOpen: boolean;
  /** 设置菜单打开状态 */
  setMenuOpen: (open: boolean) => void;
  /** 关闭菜单 */
  closeMenu: () => void;
  /** 导航到指定路径 */
  navigate: (path: string) => void;
  /** 检查是否为当前路径 */
  isCurrentPath: (path: string) => boolean;
}

const NavigationContext = createContext<NavigationContextType | undefined>(undefined);

/**
 * 导航提供者组件属性接口
 */
interface NavigationProviderProps {
  /** 子组件 */
  children: ReactNode;
}

/**
 * 导航提供者组件
 *
 * @param props - 组件属性
 * @returns 导航提供者组件
 */
export const NavigationProvider = ({ children }: NavigationProviderProps) => {
  const pathname = usePathname();
  const router = useRouter();
  const [isMenuOpen, setIsMenuOpen] = useState(false);

  const setMenuOpen = useCallback((open: boolean) => {
    setIsMenuOpen(open);
  }, []);

  const closeMenu = useCallback(() => {
    setIsMenuOpen(false);
  }, []);

  const navigate = useCallback(
    (path: string) => {
      setIsMenuOpen(false);
      router.push(path);
    },
    [router],
  );

  const isCurrentPath = useCallback(
    (path: string) => {
      if (!pathname) return false;
      return pathname === path || (path !== '/' && pathname.startsWith(path));
    },
    [pathname],
  );

  return (
    <NavigationContext.Provider
      value={{
        currentPath: pathname ?? '/',
        isMenuOpen,
        setMenuOpen,
        closeMenu,
        navigate,
        isCurrentPath,
      }}
    >
      {children}
    </NavigationContext.Provider>
  );
};

/**
 * 使用导航上下文的Hook
 *
 * @returns 导航上下文对象
 * @throws 当在NavigationProvider外部使用时抛出错误
 */
export const useNavigationContext = () => {
  const context = useContext(NavigationContext);
  if (context === undefined) {
    throw new Error('useNavigationContext must be used within a NavigationProvider');
  }
  return context;
};

export type { NavigationContextType, NavigationItem };
