import { CorePalette, hexFromArgb } from '@material/material-color-utilities';
import type {
  ColorExtractionWorkerMessage,
  ColorExtractionWorkerResponse,
  WorkerMessageData,
} from '../types/worker';

import ColorExtractionWorker from './color-extraction-worker.ts?worker';

/**
 * Material Design 3 主题颜色接口
 * 包含完整的 M3 颜色系统定义
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

// SessionStorage 键名
const THEME_STORAGE_KEY = 'nazo-prism-theme-colors';

// 默认主题色 - (120,204,192,1) RGBA 转换为 RGB
const defaultThemeColors: IThemeColors = {
  primary: '#78CCC0', // 120, 204, 192
  onPrimary: '#FFFFFF', // 255, 255, 255
  primaryContainer: '#A8E6DC', // 168, 230, 220
  onPrimaryContainer: '#004A42', // 0, 74, 66

  secondary: '#6B9B96', // 107, 155, 150
  onSecondary: '#FFFFFF', // 255, 255, 255
  secondaryContainer: '#C1F0EA', // 193, 240, 234
  onSecondaryContainer: '#1F4A46', // 31, 74, 70

  tertiary: '#7A8B9A', // 122, 139, 154
  onTertiary: '#FFFFFF', // 255, 255, 255
  tertiaryContainer: '#B8C9D8', // 184, 201, 216
  onTertiaryContainer: '#2A3A49', // 42, 58, 73

  error: '#B3261E', // 179, 38, 30
  onError: '#FFFFFF', // 255, 255, 255
  errorContainer: '#F9DEDC', // 249, 222, 220
  onErrorContainer: '#410E0B', // 65, 14, 11

  background: '#F0F8F6', // 240, 248, 246
  onBackground: '#1A1C1B', // 26, 28, 27
  surface: '#F0F8F6', // 240, 248, 246
  onSurface: '#1A1C1B', // 26, 28, 27

  surfaceVariant: '#DAE5E2', // 218, 229, 226
  onSurfaceVariant: '#3F4946', // 63, 73, 70
  outline: '#6F7975', // 111, 121, 117
  outlineVariant: '#BFC9C5', // 191, 201, 197

  shadow: '#000000', // 0, 0, 0
  scrim: '#000000', // 0, 0, 0
  inverseSurface: '#2F3130', // 47, 49, 48
  inverseOnSurface: '#F0F1F0', // 240, 241, 240
  inversePrimary: '#8CD4C8', // 140, 212, 200

  surfaceDim: '#D0D8D5', // 208, 216, 213
  surfaceBright: '#F0F8F6', // 240, 248, 246
  surfaceContainerLowest: '#FFFFFF', // 255, 255, 255
  surfaceContainerLow: '#EAF2EF', // 234, 242, 239
  surfaceContainer: '#E4ECE9', // 228, 236, 233
  surfaceContainerHigh: '#DEE6E3', // 222, 230, 227
  surfaceContainerHighest: '#D8E0DD', // 216, 224, 221
};

// 全局主题状态 - 与背景轮播管理器一样，覆盖整个页面生命周期
let globalThemeState: {
    currentTheme: IThemeColors | null;
    lastAppliedImageUrl: string | null;
    pendingThemeUpdate: Promise<number> | null;
} = {
  currentTheme: null,
  lastAppliedImageUrl: null,
  pendingThemeUpdate: null,
};

class ThemeManager {
  private static instance: ThemeManager;
  private colorExtractionWorker: Worker | null = null;
  private workerMessageId = 0;
  private pendingWorkerRequests = new Map<
        number,
        { resolve: (color: number) => void; reject: (error: Error) => void }
    >();

  private constructor() {
    this.initializeWorker();
  }

  /**
           * 初始化 Worker 用于离屏颜色提取
           */
  private initializeWorker(): void {
    try {
      // TODO: 重新启用 Worker 当兼容性问题解决后
      // 使用 TypeScript Worker（Vite 会自动处理 .ts 文件）
      this.colorExtractionWorker = new ColorExtractionWorker();

      this.colorExtractionWorker.onmessage = (e: MessageEvent<WorkerMessageData>) => {
        const data = e.data;

        if ('type' in data && data.type === 'ready') {
          return;
        }

        // 处理颜色提取响应
        const response = data as ColorExtractionWorkerResponse;
        const request = this.pendingWorkerRequests.get(response.messageId);
        if (request) {
          this.pendingWorkerRequests.delete(response.messageId);

          if (response.success) {
            request.resolve(response.color);
          } else {
            request.reject(new Error(response.error || 'Worker color extraction failed'));
          }
        }
      };

      this.colorExtractionWorker.onerror = () => {
        this.pendingWorkerRequests.forEach(({ reject }) => {
          reject(new Error('Worker error'));
        });
        this.pendingWorkerRequests.clear();
      };
    } catch (error) {
      this.colorExtractionWorker = null;
      throw new Error(`Failed to initialize color extraction worker: ${error}`);
    }
  }

  static getInstance(): ThemeManager {
    if (!ThemeManager.instance) {
      ThemeManager.instance = new ThemeManager();
    }
    return ThemeManager.instance;
  }

  /**
           * Extract dominant color from image URL using Worker with blob data
           */
  async extractColorFromImage(imageUrl: string): Promise<number> {
    if (!this.colorExtractionWorker) {
      throw new Error('Color extraction worker is not available');
    }

    const messageId = ++this.workerMessageId;

    // 创建 Promise 来等待 Worker 结果
    const colorPromise = new Promise<number>((resolve, reject) => {
      this.pendingWorkerRequests.set(messageId, { resolve, reject });

      // 设置超时
      setTimeout(() => {
        if (this.pendingWorkerRequests.has(messageId)) {
          this.pendingWorkerRequests.delete(messageId);
          reject(new Error('Worker timeout after 10 seconds'));
        }
      }, 10000);
    });

    try {
      // 获取图片 Blob 并直接传递给 Worker
      const blob = await this.getImageBlob(imageUrl);

      const message: ColorExtractionWorkerMessage = {
        blob,
        messageId,
      };

      this.colorExtractionWorker.postMessage(message);
    } catch (error) {
      this.pendingWorkerRequests.delete(messageId);
      throw error;
    }

    return await colorPromise;
  }

  /**
           * 获取图片 Blob（优先从缓存）
           */
  private async getImageBlob(imageUrl: string): Promise<Blob> {
    // 尝试从缓存获取 Blob
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const carouselManager = (window as any).backgroundCarouselManager;
    if (carouselManager?.getCachedImageBlob) {
      const cachedBlob = carouselManager.getCachedImageBlob(imageUrl);
      if (cachedBlob) return cachedBlob;
    }

    // 从网络获取
    const response = await fetch(imageUrl);
    if (!response.ok) throw new Error(`图片加载失败: ${response.status}`);
    return await response.blob();
  }

  /**
           * Generate Material Design 3 theme from source color
           */
  generateTheme(sourceColor: number, isDark: boolean = false): IThemeColors {
    // Create core palette from source color
    const palette = CorePalette.of(sourceColor);

    // Generate theme with enhanced contrast for better readability
    const theme: IThemeColors = {
      // Primary colors with enhanced contrast
      primary: hexFromArgb(palette.a1.tone(isDark ? 80 : 40)),
      onPrimary: hexFromArgb(palette.a1.tone(isDark ? 10 : 100)), // Enhanced contrast
      primaryContainer: hexFromArgb(palette.a1.tone(isDark ? 30 : 90)),
      onPrimaryContainer: hexFromArgb(palette.a1.tone(isDark ? 90 : 10)),

      // Secondary colors with enhanced contrast
      secondary: hexFromArgb(palette.a2.tone(isDark ? 80 : 40)),
      onSecondary: hexFromArgb(palette.a2.tone(isDark ? 10 : 100)), // Enhanced contrast
      secondaryContainer: hexFromArgb(palette.a2.tone(isDark ? 30 : 90)),
      onSecondaryContainer: hexFromArgb(palette.a2.tone(isDark ? 90 : 10)),

      // Tertiary colors with enhanced contrast
      tertiary: hexFromArgb(palette.a3.tone(isDark ? 80 : 40)),
      onTertiary: hexFromArgb(palette.a3.tone(isDark ? 10 : 100)), // Enhanced contrast
      tertiaryContainer: hexFromArgb(palette.a3.tone(isDark ? 30 : 90)),
      onTertiaryContainer: hexFromArgb(palette.a3.tone(isDark ? 90 : 10)),

      // Error colors with enhanced contrast
      error: hexFromArgb(palette.error.tone(isDark ? 80 : 40)),
      onError: hexFromArgb(palette.error.tone(isDark ? 10 : 100)), // Enhanced contrast
      errorContainer: hexFromArgb(palette.error.tone(isDark ? 30 : 90)),
      onErrorContainer: hexFromArgb(palette.error.tone(isDark ? 90 : 10)),

      // Background and surface colors with maximum contrast
      background: hexFromArgb(palette.n1.tone(isDark ? 10 : 99)),
      onBackground: hexFromArgb(palette.n1.tone(isDark ? 95 : 5)), // Maximum contrast

      surface: hexFromArgb(palette.n1.tone(isDark ? 10 : 99)),
      onSurface: hexFromArgb(palette.n1.tone(isDark ? 95 : 5)), // Maximum contrast

      surfaceVariant: hexFromArgb(palette.n2.tone(isDark ? 30 : 90)),
      onSurfaceVariant: hexFromArgb(palette.n2.tone(isDark ? 85 : 20)), // Enhanced contrast

      outline: hexFromArgb(palette.n2.tone(isDark ? 60 : 50)),
      outlineVariant: hexFromArgb(palette.n2.tone(isDark ? 30 : 80)),

      shadow: hexFromArgb(palette.n1.tone(0)),
      scrim: hexFromArgb(palette.n1.tone(0)),

      inverseSurface: hexFromArgb(palette.n1.tone(isDark ? 90 : 20)),
      inverseOnSurface: hexFromArgb(palette.n1.tone(isDark ? 10 : 95)), // Enhanced contrast
      inversePrimary: hexFromArgb(palette.a1.tone(isDark ? 40 : 80)),

      surfaceDim: hexFromArgb(palette.n1.tone(isDark ? 10 : 87)),
      surfaceBright: hexFromArgb(palette.n1.tone(isDark ? 24 : 98)),
      surfaceContainerLowest: hexFromArgb(palette.n1.tone(isDark ? 4 : 100)),
      surfaceContainerLow: hexFromArgb(palette.n1.tone(isDark ? 10 : 96)),
      surfaceContainer: hexFromArgb(palette.n1.tone(isDark ? 12 : 94)),
      surfaceContainerHigh: hexFromArgb(palette.n1.tone(isDark ? 17 : 92)),
      surfaceContainerHighest: hexFromArgb(palette.n1.tone(isDark ? 22 : 90)),
    };

    return theme;
  }

  /**
           * Convert hex color to RGB values
           */
  private hexToRgb(hex: string): string {
    // Remove # if present
    hex = hex.replace('#', '');

    // Parse hex values
    const r = parseInt(hex.substring(0, 2), 16);
    const g = parseInt(hex.substring(2, 4), 16);
    const b = parseInt(hex.substring(4, 6), 16);

    return `${r}, ${g}, ${b}`;
  }

  /**
           * 从 sessionStorage 加载主题色
           */
  private loadThemeFromSession(): IThemeColors | null {
    try {
      const storedTheme = sessionStorage.getItem(THEME_STORAGE_KEY);
      if (storedTheme) {
        return JSON.parse(storedTheme) as IThemeColors;
      }
    } catch (error) {
      console.warn('Failed to load theme from sessionStorage:', error);
    }
    return null;
  }

  /**
           * 保存主题色到 sessionStorage
           */
  private saveThemeToSession(theme: IThemeColors): void {
    try {
      sessionStorage.setItem(THEME_STORAGE_KEY, JSON.stringify(theme));
    } catch (error) {
      console.warn('Failed to save theme to sessionStorage:', error);
    }
  }

  /**
           * 获取当前主题色（优先从 session，然后是内存，最后是默认）
           */
  public getCurrentTheme(): IThemeColors {
    // 1. 优先从内存中获取
    if (globalThemeState.currentTheme) {
      return globalThemeState.currentTheme;
    }

    // 2. 从 sessionStorage 中获取
    const sessionTheme = this.loadThemeFromSession();
    if (sessionTheme) {
      globalThemeState.currentTheme = sessionTheme;
      return sessionTheme;
    }

    // 3. 使用默认主题色
    globalThemeState.currentTheme = defaultThemeColors;
    return defaultThemeColors;
  }

  /**
           * Apply theme to CSS variables with transition - 原子性操作，不可中断
           */
  applyTheme(theme: IThemeColors): void {
    const root = document.documentElement;

    // 使用 requestAnimationFrame 确保在下一个渲染帧中原子性地应用所有颜色
    requestAnimationFrame(() => {
      // 批量应用所有主题颜色，确保原子性
      const updates: Array<[string, string]> = [];

      Object.entries(theme).forEach(([key, value]) => {
        const cssVarName = `--md-sys-color-${key.replace(/([A-Z])/g, '-$1').toLowerCase()}`;
        const rgbValue = this.hexToRgb(value);
        updates.push([cssVarName, rgbValue]);
      });

      // 在单个渲染帧中应用所有更新，确保原子性
      updates.forEach(([cssVarName, rgbValue]) => {
        root.style.setProperty(cssVarName, rgbValue);
      });

      // 存储当前主题到全局状态和 sessionStorage
      globalThemeState.currentTheme = theme;
      this.saveThemeToSession(theme);
    });
  }

  /**
           * Update theme based on image URL - 确保主题变换不被打断
           */
  async updateThemeFromImage(
    imageUrl: string,
    isDark: boolean = false,
  ): Promise<number | undefined> {
    if (globalThemeState.lastAppliedImageUrl === imageUrl) {
      return undefined;
    }

    if (globalThemeState.pendingThemeUpdate) {
      try {
        await globalThemeState.pendingThemeUpdate;
      } catch {
        // 静默处理错误
      }
    }

    // 创建新的主题更新操作
    globalThemeState.pendingThemeUpdate = this.performThemeUpdate(imageUrl, isDark);

    try {
      const extractedColor = await globalThemeState.pendingThemeUpdate;
      globalThemeState.lastAppliedImageUrl = imageUrl;
      return extractedColor;
    } catch {
      return undefined;
    } finally {
      globalThemeState.pendingThemeUpdate = null;
    }
  }

  /**
           * Update theme based on extracted color - 使用缓存的颜色直接更新主题
           */
  async updateThemeFromColor(sourceColor: number, isDark: boolean = false): Promise<number> {
    try {
      const theme = this.generateTheme(sourceColor, isDark);
      this.applyTheme(theme);
      return sourceColor;
    } catch {
      const defaultTheme = this.generateTheme(0xff6750a4, isDark);
      this.applyTheme(defaultTheme);
      return 0xff6750a4;
    }
  }

  /**
           * 执行主题更新 - 不可中断的操作
           */
  private async performThemeUpdate(imageUrl: string, isDark: boolean): Promise<number> {
    try {
      const sourceColor = await this.extractColorFromImage(imageUrl);
      const theme = this.generateTheme(sourceColor, isDark);
      this.applyTheme(theme);
      return sourceColor;
    } catch {
      const defaultTheme = this.generateTheme(0xff6750a4, isDark);
      this.applyTheme(defaultTheme);
      return 0xff6750a4;
    }
  }

  /**
           * Check if user prefers dark mode
           */
  prefersDarkMode(): boolean {
    return window.matchMedia && window.matchMedia('(prefers-color-scheme: dark)').matches;
  }

  /**
           * 关闭颜色提取Worker以节省资源
           */
  shutdownWorker(): void {
    if (this.colorExtractionWorker) {
      this.colorExtractionWorker.terminate();
      this.colorExtractionWorker = null;

      // 清理待处理的请求
      this.pendingWorkerRequests.forEach(({ reject }) => {
        reject(new Error('Worker已关闭'));
      });
      this.pendingWorkerRequests.clear();
    }
  }

  /**
           * 获取当前全局主题信息
           */
  public getPersistedThemeInfo(): { imageUrl: string | null; hasTheme: boolean } {
    return {
      imageUrl: globalThemeState.lastAppliedImageUrl,
      hasTheme: globalThemeState.currentTheme !== null,
    };
  }
}

export default ThemeManager;
