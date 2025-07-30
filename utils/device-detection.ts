/**
 * @file utils/device-detection.ts
 * @description 设备检测工具函数
 */

/**
 * 检测当前设备是否为移动端
 *
 * @returns 如果是移动端设备返回 true，否则返回 false
 */
export const isMobileDevice = (): boolean => {
  // 服务端渲染时返回 false
  if (typeof window === 'undefined') {
    return false;
  }

  // 检查用户代理字符串
  const userAgent = navigator.userAgent.toLowerCase();
  const mobileKeywords = [
    'android',
    'webos',
    'iphone',
    'ipad',
    'ipod',
    'blackberry',
    'windows phone',
    'mobile',
    'opera mini',
  ];

  const isMobileUserAgent = mobileKeywords.some(keyword => userAgent.includes(keyword));

  // 检查屏幕宽度（移动端通常小于768px）
  const isMobileScreen = window.innerWidth < 768;

  // 检查触摸支持
  const hasTouchSupport = 'ontouchstart' in window || navigator.maxTouchPoints > 0;

  // 综合判断：用户代理包含移动设备关键词，或者屏幕宽度小于768px且支持触摸
  return isMobileUserAgent || (isMobileScreen && hasTouchSupport);
};

/**
 * 创建一个响应式的移动端检测Hook（用于React组件）
 *
 * @returns 当前是否为移动端设备的状态
 */
export const useMobileDetection = (): boolean => {
  // 这里只是导出函数，实际的Hook实现会在hooks目录中
  return isMobileDevice();
};
