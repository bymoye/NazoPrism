import ThemeManager from '../utils/theme-manager';

/**
 * Initialize Material Design 3 theme system
 */
export function initTheme(): void {
  const themeManager = ThemeManager.getInstance();

  // 获取当前主题色（优先从 sessionStorage，然后是内存，最后是默认）
  const currentTheme = themeManager.getCurrentTheme();

  // 应用主题色
  themeManager.applyTheme(currentTheme);
}
