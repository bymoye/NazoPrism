'use client';

import { usePathname, useRouter } from 'next/navigation';
import { createContext, type ReactNode, useContext, useState } from 'react';

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
  setMenuOpen: (_open: boolean) => void;
  /** 关闭菜单 */
  closeMenu: () => void;
  /** 导航到指定路径 */
  navigate: (_path: string) => void;
  /** 检查是否为当前路径 */
  isCurrentPath: (_path: string) => boolean;
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

  const setMenuOpen = (open: boolean) => {
    setIsMenuOpen(open);
  };

  const closeMenu = () => {
    setIsMenuOpen(false);
  };

  const navigate = (path: string) => {
    setIsMenuOpen(false);
    router.push(path);
  };

  const isCurrentPath = (path: string) => {
    if (!pathname) {
      return false;
    }
    return pathname === path || (path !== '/' && pathname.startsWith(path));
  };

  const contextValue = {
    currentPath: pathname || '/',
    isMenuOpen,
    setMenuOpen,
    closeMenu,
    navigate,
    isCurrentPath,
  };

  return <NavigationContext.Provider value={contextValue}>{children}</NavigationContext.Provider>;
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
    throw new Error('useNavigationContext 必须在 NavigationProvider 内使用');
  }
  return context;
};

export type { NavigationContextType, NavigationItem };
