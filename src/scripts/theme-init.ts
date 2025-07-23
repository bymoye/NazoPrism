import { themeManager } from '../utils/theme-manager';

/**
 * Initialize Material Design 3 theme system
 */
export async function initTheme(): Promise<void> {
  const currentSeedColor = themeManager.getCurrentSeedColor();
  const isDark = themeManager.prefersDarkMode();
  await themeManager.updateThemeFromColor(currentSeedColor, isDark);
}
