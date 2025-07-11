import { themeManager } from '../utils/theme-manager';

/**
 * Initialize Material Design 3 theme system
 */
export function initTheme(): void {
  const currentTheme = themeManager.getCurrentTheme();
  themeManager.applyTheme(currentTheme);
}
