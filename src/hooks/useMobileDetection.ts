/**
 * @file hooks/useMobileDetection.ts
 * @description 移动端检测React Hook
 */

import { useEffect, useState } from 'react';

import { isMobileDevice } from '@/utils/device-detection';

/**
 * 移动端检测Hook
 *
 * @returns 是否为移动端设备
 */
export const useMobileDetection = (): boolean => {
  /** 直接在初始化时检测移动端状态，适用于SSG场景 */
  const [isMobile, setIsMobile] = useState<boolean>(() => {
    /** 在SSG场景下，window对象在构建时不存在，但在客户端运行时存在 */
    if (typeof window === 'undefined') {
      return false; /** SSG构建时默认为桌面端 */
    }
    return isMobileDevice();
  });

  useEffect(() => {
    /** 确保在客户端运行时进行正确的移动端检测 */
    setIsMobile(isMobileDevice());

    /**
     * 处理窗口大小变化的回调函数
     */
    const handleResize = (): void => {
      setIsMobile(isMobileDevice());
    };

    /** 添加窗口大小变化监听器 */
    window.addEventListener('resize', handleResize, { passive: true });

    /** 组件卸载时清理监听器 */
    return () => {
      window.removeEventListener('resize', handleResize);
    };
  }, []);

  return isMobile;
};
