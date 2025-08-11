/**
 * @file utils/theme-manager.ts
 * @description 主题管理工具
 */

import { makeCSSTheme, type MakeCSSThemeOptions, type ThemeColors } from '@poupe/theme-builder';
import { extractColors } from 'extract-colors/lib/worker-wrapper';

import { isObject } from './type-guards';

/** 常量定义 */

const DARK_MODE = 'dark';
const LIGHT_MODE = 'light';
const DATASET_THEME_ATTRIBUTE = 'theme';
const THEME_SET_BY_USER = 'themeSetByUser';
const THEME_STYLE_ID = 'nazo-prism-theme';
const THEME_STORAGE_KEY = 'theme'; // 保留以备将来使用
void THEME_STORAGE_KEY; // 标记为已使用

/** 默认主题颜色数组 */
const DEFAULT_COLORS = ['#74ccc3', '#5a9b94', '#8fd4cc', '#4a7c75', '#3d6b65'];

/** 主题颜色键名数组 */
const THEME_KEYS: Array<keyof ThemeColors<never>> = [
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
 * @returns 主题对象
 */
const generateTheme = (colors: string[]): ReturnType<typeof makeCSSTheme> => {
  const themeColors: Record<string, string> = {};

  for (let index = 0; index < Math.min(colors.length, THEME_KEYS.length); index++) {
    const themeKey = THEME_KEYS.at(index);
    const color = colors.at(index);
    if (themeKey && color && typeof themeKey === 'string') {
      Object.assign(themeColors, { [themeKey]: color });
    }
  }

  const typedThemeColors = themeColors as ThemeColors<never>;

  const options: Partial<MakeCSSThemeOptions> = {
    darkMode: "[data-theme='dark']",
    lightMode: "[data-theme='light']",
    prefix: 'md-',
    darkSuffix: '',
    lightSuffix: '',
    scheme: 'vibrant',
  };

  return makeCSSTheme(typedThemeColors, options);
};

/**
 * 获取当前深色模式状态
 *
 * @returns 是否为深色模式
 */
const PREFERS_COLOR_SCHEME_DARK = '(prefers-color-scheme: dark)';

const isDarkMode = (): boolean => {
  const themeValue = document.documentElement.getAttribute(`data-${DATASET_THEME_ATTRIBUTE}`);
  return (
    themeValue === DARK_MODE ||
    (!themeValue && window.matchMedia(PREFERS_COLOR_SCHEME_DARK).matches)
  );
};

/**
 * 设置深色/浅色模式
 *
 * @param isDark - 是否设置为深色模式
 */
const setDarkMode = (isDark: boolean): void => {
  document.documentElement.setAttribute(
    `data-${DATASET_THEME_ATTRIBUTE}`,
    isDark ? DARK_MODE : LIGHT_MODE,
  );
};

/**
 * 应用主题到DOM
 *
 * @param theme - 要应用的主题对象
 */
const applyTheme = (theme: ReturnType<typeof makeCSSTheme>): void => {
  let styleElement = document.querySelector(`#${THEME_STYLE_ID}`);
  if (!styleElement) {
    styleElement = document.createElement('style');
    styleElement.id = THEME_STYLE_ID;
    document.head.append(styleElement);
  }

  if (theme.styles.length === 0) {
    styleElement.textContent = '';
    return;
  }

  const rulesObject = theme.styles[0];
  if (!rulesObject || !isObject(rulesObject)) {
    styleElement.textContent = '';
    return;
  }
  const cssContent = Object.entries(rulesObject)
    .map(([selector, rules]) => {
      if (!isObject(rules)) {
        return '';
      }
      const varsString = Object.entries(rules as Record<string, unknown>)
        .map(([property, value]) => {
          let stringValue: string;
          if (typeof value === 'string') {
            stringValue = value;
          } else if (typeof value === 'number') {
            stringValue = String(value);
          } else {
            stringValue = JSON.stringify(value);
          }
          return `  ${property}: ${stringValue};`;
        })
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
  /** 检查缓存 */
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
      colorValidator: (red, green, blue, alpha = 255) => alpha > 250,
    });
    const extractedColors = colors.map(({ hex }) => hex);
    const finalColors = extractedColors.length > 0 ? extractedColors : DEFAULT_COLORS;

    /** 缓存提取的颜色 */
    themeColorCache.set(imageUrl, finalColors);
    return finalColors;
  } catch {
    /** 即使失败也缓存默认颜色，避免重复请求 */
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
  } catch {
    /** 预载失败不影响主流程，静默处理 */
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
  document.documentElement.setAttribute(`data-${THEME_SET_BY_USER}`, 'true');
};

/**
 * 从颜色数组更新主题
 *
 * @param colors - 颜色数组，用于生成主题
 */
const updateThemeFromColors = (colors: string[]): void => {
  const validColors = colors.length > 0 ? colors : DEFAULT_COLORS;
  currentTheme = generateTheme(validColors);
  applyTheme(currentTheme);
};

/**
 * 从图片更新主题
 *
 * @param imageUrl - 当前图片URL
 * @param nextImageUrl - 可选，下一张图片URL，用于预载
 */
const updateThemeFromImage = async (imageUrl: string, nextImageUrl?: string): Promise<void> => {
  const colors = await extractColorsFromImage(imageUrl);
  updateThemeFromColors(colors);

  /** 预载下一张图片的主题色 */
  if (nextImageUrl && nextImageUrl !== imageUrl) {
    /** 异步预载，不阻塞当前主题更新 */
    preloadImageTheme(nextImageUrl).catch(() => {
      /** 预载失败不影响主流程，静默处理 */
    });
  }
};

/**
 * 初始化主题系统
 *
 * @returns 返回清理函数，用于移除事件监听器
 */
const initTheme = (): (() => void) => {
  const currentThemeValue = document.documentElement.getAttribute(
    `data-${DATASET_THEME_ATTRIBUTE}`,
  );
  if (!currentThemeValue) {
    const prefersDark = window.matchMedia(PREFERS_COLOR_SCHEME_DARK).matches;
    document.documentElement.setAttribute(
      `data-${DATASET_THEME_ATTRIBUTE}`,
      prefersDark ? DARK_MODE : LIGHT_MODE,
    );
  }

  if (!currentTheme) {
    updateThemeFromColors(DEFAULT_COLORS);
  }

  const mediaQuery = window.matchMedia(PREFERS_COLOR_SCHEME_DARK);
  const listener = ({ matches }: MediaQueryListEvent) => {
    const userSetTheme = document.documentElement.getAttribute(`data-${THEME_SET_BY_USER}`);
    if (!userSetTheme) {
      setDarkMode(matches);
    }
  };

  mediaQuery.addEventListener('change', listener);
  return () => {
    mediaQuery.removeEventListener('change', listener);
  };
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
