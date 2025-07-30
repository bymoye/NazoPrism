/**
 * @file constants/index.ts
 * @description 应用程序常量定义
 */

/**
 * API 相关常量
 */
export const API_ENDPOINTS = {
  BACKGROUND_IMAGES: 'https://api.nmxc.ltd/randimg',
} as const;

/**
 * 应用程序配置常量
 */
export const APP_CONFIG = {
  DEFAULT_THEME_COLOR: '#6750a4',
  SCROLL_THRESHOLD: 100,
  ANIMATION_DURATION: 300,
} as const;

/**
 * 本地存储键名常量
 */
export const STORAGE_KEYS = {
  THEME_SEED_COLOR: 'theme-seed-color',
  THEME_IS_DARK: 'theme-is-dark',
  USER_PREFERENCES: 'user-preferences',
} as const;

/**
 * 错误消息常量
 */
export const ERROR_MESSAGES = {
  NETWORK_ERROR: '网络连接失败，请检查网络设置',
  THEME_UPDATE_FAILED: '主题更新失败',
  IMAGE_LOAD_FAILED: '图片加载失败',
} as const;