import { CorePalette, hexFromArgb } from '@material/material-color-utilities';
import type {
  ColorExtractionWorkerMessage,
  ColorExtractionWorkerResponse,
  WorkerMessageData,
} from '../types/worker';
import ColorExtractionWorker from './color-extraction-worker.ts?worker';

/**
 * Material Design 3 主题颜色接口
 */
export interface IThemeColors {
  primary: string;
  onPrimary: string;
  primaryContainer: string;
  onPrimaryContainer: string;
  secondary: string;
  onSecondary: string;
  secondaryContainer: string;
  onSecondaryContainer: string;
  tertiary: string;
  onTertiary: string;
  tertiaryContainer: string;
  onTertiaryContainer: string;
  error: string;
  onError: string;
  errorContainer: string;
  onErrorContainer: string;
  background: string;
  onBackground: string;
  surface: string;
  onSurface: string;
  surfaceVariant: string;
  onSurfaceVariant: string;
  outline: string;
  outlineVariant: string;
  shadow: string;
  scrim: string;
  inverseSurface: string;
  inverseOnSurface: string;
  inversePrimary: string;
  surfaceDim: string;
  surfaceBright: string;
  surfaceContainerLowest: string;
  surfaceContainerLow: string;
  surfaceContainer: string;
  surfaceContainerHigh: string;
  surfaceContainerHighest: string;
}

// --- 模块内常量 ---
const THEME_STORAGE_KEY = 'nazo-prism-theme-colors';
const DYNAMIC_STYLE_TAG_ID = 'dynamic-material-theme-styles';
const DEFAULT_SEED_COLOR = 0xff78ccc0; // 默认种子色
const WORKER_TIMEOUT = 10000; // 10秒

/**
 * 查找或创建一个用于动态注入样式的 <style> 元素
 */
function getOrCreateStyleElement(id: string): HTMLStyleElement {
  let styleEl = document.getElementById(id) as HTMLStyleElement | null;
  if (!styleEl) {
    styleEl = document.createElement('style');
    styleEl.id = id;
    document.head.appendChild(styleEl);
  }
  return styleEl;
}

class ThemeManagerImpl {
  private currentTheme: IThemeColors | null = null;
  private lastAppliedImageUrl: string | null = null;
  private isUpdatingTheme = false;
  private readonly defaultTheme: IThemeColors;

  private worker: Worker | null = null;
  private workerMessageId = 0;
  private pendingWorkerRequests = new Map<
    number,
    { resolve: (color: number) => void; reject: (error: Error) => void }
  >();

  private colorSchemeQuery: MediaQueryList | null = null;

  constructor() {
    this.defaultTheme = this.generateTheme(DEFAULT_SEED_COLOR, this.prefersDarkMode());
    this.initializeWorker();
    this.listenForColorSchemeChanges();
  }

  private initializeWorker(): void {
    try {
      this.worker = new ColorExtractionWorker();
      this.worker.onmessage = (e: MessageEvent<WorkerMessageData>) => {
        const data = e.data;
        if ('type' in data && data.type === 'ready') return;
        const response = data as ColorExtractionWorkerResponse;
        const request = this.pendingWorkerRequests.get(response.messageId);
        if (!request) return;
        this.pendingWorkerRequests.delete(response.messageId);
        if (response.success) request.resolve(response.color);
        else request.reject(new Error(response.error || 'Worker 颜色提取失败'));
      };
      this.worker.onerror = error => {
        console.error('颜色提取 Worker 发生致命错误:', error);
        this.pendingWorkerRequests.forEach(({ reject }) => reject(new Error('Worker 发生错误')));
        this.pendingWorkerRequests.clear();
      };
    } catch (error) {
      console.error('无法初始化颜色提取 Worker:', error);
      this.worker = null;
    }
  }

  private async extractColorFromImage(imageUrl: string): Promise<number> {
    if (!this.worker) throw new Error('颜色提取 Worker 不可用');

    const messageId = ++this.workerMessageId;

    // Promise 逻辑保持不变
    const colorPromise = new Promise<number>((resolve, reject) => {
      this.pendingWorkerRequests.set(messageId, { resolve, reject });
      setTimeout(() => {
        if (this.pendingWorkerRequests.has(messageId)) {
          this.pendingWorkerRequests.delete(messageId);
          reject(new Error(`Worker 处理超时 (${WORKER_TIMEOUT / 1000}秒)`));
        }
      }, WORKER_TIMEOUT);
    });

    try {
      const response = await fetch(imageUrl);
      if (!response.ok) throw new Error(`图片加载失败: ${response.status}`);
      const blob = await response.blob();

      const arrayBuffer = await blob.arrayBuffer();

      const message: ColorExtractionWorkerMessage = {
        arrayBuffer,
        messageId,
      };

      this.worker.postMessage(message, [arrayBuffer]);
    } catch (error) {
      this.pendingWorkerRequests.delete(messageId);
      throw error;
    }

    return colorPromise;
  }

  private hexToRgb(hex: string): string {
    const hexValue = hex.startsWith('#') ? hex.substring(1) : hex;
    const [r, g, b] = hexValue.match(/.{1,2}/g)?.map(c => parseInt(c, 16)) || [0, 0, 0];
    return `${r}, ${g}, ${b}`;
  }

  private loadThemeFromSession(): IThemeColors | null {
    try {
      const storedTheme = sessionStorage.getItem(THEME_STORAGE_KEY);
      return storedTheme ? (JSON.parse(storedTheme) as IThemeColors) : null;
    } catch (error) {
      console.warn('从 sessionStorage 加载主题失败:', error);
      return null;
    }
  }

  private saveThemeToSession(theme: IThemeColors): void {
    try {
      sessionStorage.setItem(THEME_STORAGE_KEY, JSON.stringify(theme));
    } catch (error) {
      console.warn('保存主题到 sessionStorage 失败:', error);
    }
  }

  private listenForColorSchemeChanges(): void {
    if (!window.matchMedia) return;
    this.colorSchemeQuery = window.matchMedia('(prefers-color-scheme: dark)');
    this.colorSchemeQuery.addEventListener('change', this.handleColorSchemeChange);
  }

  private handleColorSchemeChange = (e: MediaQueryListEvent) => {
    const isDark = e.matches;
    const currentTheme = this.getCurrentTheme();
    const currentSeedColor = parseInt(currentTheme.primary.substring(1), 16);
    const newTheme = this.generateTheme(currentSeedColor, isDark);
    this.applyTheme(newTheme);
  };

  public generateTheme(sourceColor: number, isDark: boolean = false): IThemeColors {
    const palette = CorePalette.of(sourceColor);
    const tones: Record<keyof IThemeColors, number> = {
      primary: isDark ? 80 : 40,
      onPrimary: isDark ? 20 : 100,
      primaryContainer: isDark ? 30 : 90,
      onPrimaryContainer: isDark ? 90 : 10,
      secondary: isDark ? 80 : 40,
      onSecondary: isDark ? 20 : 100,
      secondaryContainer: isDark ? 30 : 90,
      onSecondaryContainer: isDark ? 90 : 10,
      tertiary: isDark ? 80 : 40,
      onTertiary: isDark ? 20 : 100,
      tertiaryContainer: isDark ? 30 : 90,
      onTertiaryContainer: isDark ? 90 : 10,
      error: isDark ? 80 : 40,
      onError: isDark ? 20 : 100,
      errorContainer: isDark ? 30 : 90,
      onErrorContainer: isDark ? 90 : 10,
      background: isDark ? 6 : 98,
      onBackground: isDark ? 90 : 10,
      surface: isDark ? 6 : 98,
      onSurface: isDark ? 90 : 10,
      surfaceVariant: isDark ? 30 : 90,
      onSurfaceVariant: isDark ? 80 : 30,
      outline: isDark ? 60 : 50,
      outlineVariant: isDark ? 30 : 80,
      shadow: 0,
      scrim: 0,
      inverseSurface: isDark ? 90 : 20,
      inverseOnSurface: isDark ? 20 : 95,
      inversePrimary: isDark ? 40 : 80,
      surfaceDim: isDark ? 6 : 87,
      surfaceBright: isDark ? 24 : 98,
      surfaceContainerLowest: isDark ? 4 : 100,
      surfaceContainerLow: isDark ? 10 : 96,
      surfaceContainer: isDark ? 12 : 94,
      surfaceContainerHigh: isDark ? 17 : 92,
      surfaceContainerHighest: isDark ? 22 : 90,
    };
    // This logic is complex, but kept as per your original implementation's apparent intent.
    const theme: { [K in keyof IThemeColors]?: string } = {};
    for (const key in tones) {
      const role = key as keyof IThemeColors;
      let p;
      if (role.startsWith('secondary')) p = palette.a2;
      else if (role.startsWith('tertiary')) p = palette.a3;
      else if (role.startsWith('error')) p = palette.error;
      else if (role.includes('Variant')) p = palette.n2;
      else if (
        ['background', 'surface', 'shadow', 'scrim', 'inverseSurface', 'inverseOnSurface'].includes(
          role,
        ) ||
        /Container(Lowest|Low|High|Highest)?$/.test(role)
      )
        p = palette.n1;
      else p = palette.a1;
      theme[role] = hexFromArgb(p.tone(tones[role]));
    }
    return theme as IThemeColors;
  }

  public getCurrentTheme(): IThemeColors {
    if (this.currentTheme) return this.currentTheme;
    const sessionTheme = this.loadThemeFromSession();
    if (sessionTheme) {
      this.currentTheme = sessionTheme;
      return sessionTheme;
    }
    return this.defaultTheme;
  }

  public applyTheme(theme: IThemeColors): void {
    requestAnimationFrame(() => {
      const cssVarsString = Object.entries(theme)
        .map(
          ([key, value]) =>
            `--md-sys-color-${key.replace(/([A-Z])/g, '-$1').toLowerCase()}: ${this.hexToRgb(value)};`,
        )
        .join('\n');
      const styleEl = getOrCreateStyleElement(DYNAMIC_STYLE_TAG_ID);
      const newRule = `:root { ${cssVarsString} }`;
      if (styleEl.textContent !== newRule) {
        styleEl.textContent = newRule;
      }
      this.currentTheme = theme;
      this.saveThemeToSession(theme);
    });
  }

  public async updateThemeFromImage(
    imageUrl: string,
    isDark: boolean = this.prefersDarkMode(),
  ): Promise<number | undefined> {
    if (this.lastAppliedImageUrl === imageUrl && this.currentTheme) return;
    if (this.isUpdatingTheme) {
      console.warn('主题正在更新中，本次请求被忽略。');
      return;
    }

    this.isUpdatingTheme = true;
    try {
      const sourceColor = await this.extractColorFromImage(imageUrl);
      const theme = this.generateTheme(sourceColor, isDark);
      this.applyTheme(theme);
      this.lastAppliedImageUrl = imageUrl;
      return sourceColor;
    } catch (error) {
      console.error(`从图片 '${imageUrl}' 更新主题失败，应用默认主题`, error);
      // 失败时，也使用当前的 isDark 状态来生成默认主题
      this.applyTheme(this.generateTheme(DEFAULT_SEED_COLOR, isDark));
      return undefined;
    } finally {
      this.isUpdatingTheme = false;
    }
  }

  public async updateThemeFromColor(sourceColor: number, isDark: boolean = false): Promise<number> {
    try {
      const theme = this.generateTheme(sourceColor, isDark);
      this.applyTheme(theme);
      return sourceColor;
    } catch (error) {
      console.error('从颜色更新主题失败:', error);
      const defaultTheme = this.generateTheme(DEFAULT_SEED_COLOR, isDark);
      this.applyTheme(defaultTheme);
      return DEFAULT_SEED_COLOR;
    }
  }

  public prefersDarkMode(): boolean {
    if (!window.matchMedia) return false;
    if (!this.colorSchemeQuery) {
      this.colorSchemeQuery = window.matchMedia('(prefers-color-scheme: dark)');
    }
    return this.colorSchemeQuery.matches;
  }

  public getPersistedThemeInfo(): { imageUrl: string | null; hasTheme: boolean } {
    return {
      imageUrl: this.lastAppliedImageUrl,
      hasTheme: this.currentTheme !== null || sessionStorage.getItem(THEME_STORAGE_KEY) !== null,
    };
  }

  /**
   * 关闭所有后台活动并清理资源
   */
  public shutdown(): void {
    if (this.worker) {
      this.worker.terminate();
      this.worker = null;
      this.pendingWorkerRequests.forEach(({ reject }) => reject(new Error('Worker 已关闭')));
      this.pendingWorkerRequests.clear();
    }
    if (this.colorSchemeQuery) {
      this.colorSchemeQuery.removeEventListener('change', this.handleColorSchemeChange);
    }
  }
}

/**
 * 导出的 themeManager 单例实例
 */
export const themeManager = new ThemeManagerImpl();
