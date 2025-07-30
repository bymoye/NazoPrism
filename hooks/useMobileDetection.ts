/**
 * @file hooks/useMobileDetection.ts
 * @description 移动端检测React Hook
 */

import { useState, useEffect } from 'react';
import { isMobileDevice } from '@/utils/device-detection';

/**
 * 响应式移动端检测Hook
 * 监听窗口大小变化，动态判断是否为移动端设备
 *
 * @returns 当前是否为移动端设备的状态
 */
export const useMobileDetection = (): boolean => {
  const [isMobile, setIsMobile] = useState<boolean>(() => {
    // 初始化时检测移动端
    return isMobileDevice();
  });

  useEffect(() => {
    /**
     * 处理窗口大小变化的回调函数
     */
    const handleResize = (): void => {
      setIsMobile(isMobileDevice());
    };

    // 添加窗口大小变化监听器
    window.addEventListener('resize', handleResize, { passive: true });

    // 组件卸载时清理监听器
    return () => {
      window.removeEventListener('resize', handleResize);
    };
  }, []);

  return isMobile;
};
