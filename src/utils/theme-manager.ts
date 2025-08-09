/**
 * @file utils/theme-manager.ts
 * @description 主题管理工具
 */

import {
  type MakeCSSThemeOptions,
  makeCSSTheme,
  type ThemeColors,
} from '@poupe/theme-builder';
import { extractColors } from 'extract-colors/lib/worker-wrapper';

import { isObject } from './type-guards';

/** 默认主题颜色数组 */
const DEFAULT_COLORS = ['#74ccc3', '#5a9b94', '#8fd4cc', '#4a7c75', '#3d6b65'];

/** 主题颜色键名数组 */
const THEME_KEYS: (keyof ThemeColors<never>)[] = [
  'primary',
  'secondary',
  'tertiary',
  'neutral',
  'neutralVariant',
  'error',
];

/** 当前应用的主题对象 */
let currentTheme: ReturnType<typeof makeCSSTheme> | null = null;

/** 主题色缓存映射表 */
const themeColorCache = new Map<string, string[]>();

/**
 * 生成主题
 *
 * @param colors - 颜色数组，用于生成主题
 * @returns 生成的主题对象
 */
const generateTheme = (colors: string[]): ReturnType<typeof makeCSSTheme> => {
  const themeColors = colors.slice(0, THEME_KEYS.length).reduce(
    (acc, color, index) => {
      const themeKey = THEME_KEYS[index];
      if (themeKey) {
        acc[themeKey] = color;
      }
      return acc;
    },
    {} as Record<string, string>
  ) as ThemeColors<never>;

  const options: Partial<MakeCSSThemeOptions> = {
    darkMode: "[data-theme='dark']",
    lightMode: "[data-theme='light']",
    prefix: 'md-',
    darkSuffix: '',
    lightSuffix: '',
    scheme: 'vibrant',
  };

  return makeCSSTheme(themeColors, options);
};

/**
 * 获取当前深色模式状态
 *
 * @returns 是否为深色模式
 */
const isDarkMode = (): boolean => {
  return (
    document.documentElement.dataset.theme === 'dark' ||
    (!document.documentElement.dataset.theme &&
      window.matchMedia('(prefers-color-scheme: dark)').matches)
  );
};

/**
 * 设置深色/浅色模式
 *
 * @param isDark - 是否设置为深色模式
 */
const setDarkMode = (isDark: boolean): void => {
  document.documentElement.dataset.theme = isDark ? 'dark' : 'light';
};

/**
 * 应用主题到DOM
 *
 * @param theme - 要应用的主题对象
 */
const applyTheme = (theme: ReturnType<typeof makeCSSTheme>): void => {
  let styleElement = document.getElementById('nazo-prism-theme');
  if (!styleElement) {
    styleElement = document.createElement('style');
    styleElement.id = 'nazo-prism-theme';
    document.head.append(styleElement);
  }

  if (!(theme?.styles?.length && isObject(theme.styles.at(0)))) {
    styleElement.textContent = '';
    return;
  }

  const rulesObject = theme.styles.at(0);
  if (!rulesObject) {
    styleElement.textContent = '';
    return;
  }
  const cssContent = Object.entries(rulesObject)
    .map(([selector, rules]) => {
      if (!isObject(rules)) {
        return '';
      }
      const varsString = Object.entries(rules)
        .map(([property, value]) => `  ${property}: ${value};`)
        .join('\n');
      return `${selector} {\n${varsString}\n}`;
    })
    .filter(Boolean)
    .join('\n\n');

  styleElement.textContent = cssContent;
};

/**
 * 从图片提取颜色
 *
 * @param imageUrl - 图片URL地址
 * @returns 提取的颜色数组（十六进制格式）
 */
const extractColorsFromImage = async (imageUrl: string): Promise<string[]> => {
  // 检查缓存
  if (themeColorCache.has(imageUrl)) {
    const cachedColors = themeColorCache.get(imageUrl);
    if (cachedColors) {
      return cachedColors;
    }
  }

  try {
    const colors = await extractColors(imageUrl, {
      pixels: 10_000,
      distance: 0.22,
      colorValidator: (_r, _g, _b, a = 255) => a > 250,
    });
    const extractedColors = colors?.map(({ hex }) => hex);
    const finalColors = extractedColors?.length
      ? extractedColors
      : DEFAULT_COLORS;

    // 缓存提取的颜色
    themeColorCache.set(imageUrl, finalColors);
    return finalColors;
  } catch (error) {
    // 记录错误信息用于调试
    console.error('从图片提取颜色失败:', error, '图片URL:', imageUrl);
    // 即使失败也缓存默认颜色，避免重复请求
    themeColorCache.set(imageUrl, DEFAULT_COLORS);
    return DEFAULT_COLORS;
  }
};

/**
 * 预载图片主题色
 *
 * @param imageUrl - 要预载的图片URL
 */
const preloadImageTheme = async (imageUrl: string): Promise<void> => {
  if (themeColorCache.has(imageUrl)) {
    return; // 已缓存
  }

  try {
    await extractColorsFromImage(imageUrl);
  } catch (error) {
    // 预载失败不影响主流程，记录错误用于调试
    console.error('预载图片主题色失败:', error, '图片URL:', imageUrl);
  }
};

/**
 * 切换深色/浅色模式
 *
 * @param forceDark - 可选，强制设置的模式。如果未提供则自动切换
 */
const toggleDarkMode = (forceDark?: boolean): void => {
  const newIsDark = forceDark ?? !isDarkMode();
  setDarkMode(newIsDark);
  document.documentElement.dataset.themeSetByUser = 'true';
};

/**
 * 从颜色数组更新主题
 *
 * @param colors - 颜色数组，用于生成主题
 */
const updateThemeFromColors = (colors: string[]): void => {
  const validColors = colors.length ? colors : DEFAULT_COLORS;
  currentTheme = generateTheme(validColors);
  applyTheme(currentTheme);
};

/**
 * 从图片更新主题
 *
 * @param imageUrl - 当前图片URL
 * @param nextImageUrl - 可选，下一张图片URL，用于预载
 */
const updateThemeFromImage = async (
  imageUrl: string,
  nextImageUrl?: string
): Promise<void> => {
  const colors = await extractColorsFromImage(imageUrl);
  updateThemeFromColors(colors);

  // 预载下一张图片的主题色
  if (nextImageUrl && nextImageUrl !== imageUrl) {
    // 异步预载，不阻塞当前主题更新
    preloadImageTheme(nextImageUrl).catch((error) => {
      // 预载失败不影响主流程，记录错误用于调试
      console.error(
        `异步预载下一张图片主题色失败: ${error} 图片URL: ${nextImageUrl}`
      );
    });
  }
};

/**
 * 初始化主题系统
 *
 * @returns 返回清理函数，用于移除事件监听器
 */
const initTheme = (): (() => void) => {
  if (!document.documentElement.dataset.theme) {
    const prefersDark = window.matchMedia(
      '(prefers-color-scheme: dark)'
    ).matches;
    document.documentElement.dataset.theme = prefersDark ? 'dark' : 'light';
  }

  if (!currentTheme) {
    updateThemeFromColors(DEFAULT_COLORS);
  }

  const mediaQuery = window.matchMedia('(prefers-color-scheme: dark)');
  const listener = ({ matches }: MediaQueryListEvent) => {
    if (!document.documentElement.dataset.themeSetByUser) {
      setDarkMode(matches);
    }
  };

  mediaQuery.addEventListener('change', listener);
  return () => mediaQuery.removeEventListener('change', listener);
};

export const themeManager = {
  initTheme,
  updateThemeFromImage,
  updateThemeFromColors,
  extractColorsFromImage,
  preloadImageTheme,
  toggleDarkMode,
  setDarkMode,
  isDarkMode,
};

/**
 * 清理主题缓存
 */
export const clearThemeCache = (): void => {
  themeColorCache.clear();
};
