import {
  themeFromSourceColor,
  hexFromArgb,
  applyTheme,
  Hct,
  SchemeTonalSpot,
  type Theme
} from '@material/material-color-utilities';
import type {
  ColorExtractionWorkerMessage,
  ColorExtractionWorkerResponse,
  WorkerMessageData,
} from '../types/worker';
import ColorExtractionWorker from './color-extraction-worker.ts?worker';



// --- 模块内常量 ---
const SEED_COLOR_STORAGE_KEY = 'nazo-prism-seed-color';
const DEFAULT_SEED_COLOR = 0xff78ccc0; // 默认种子色
const WORKER_TIMEOUT = 10000; // 10秒



class ThemeManagerImpl {
  #currentSeedColor: number | null = null;
  #lastAppliedImageUrl: string | null = null;
  #isUpdatingTheme = false;

  #worker: Worker | null = null;
  #workerMessageId = 0;
  #pendingWorkerRequests = new Map<
    number,
    { resolve: (color: number) => void; reject: (error: Error) => void }
  >();

  #colorSchemeQuery: MediaQueryList | null = null;

  constructor() {
    this.#initializeWorker();
    this.#listenForColorSchemeChanges();
  }

  #initializeWorker(): void {
    try {
      this.#worker = new ColorExtractionWorker();
      this.#worker.onmessage = (e: MessageEvent<WorkerMessageData>) => {
        const data = e.data;
        if ('type' in data && data.type === 'ready') return;
        const response = data as ColorExtractionWorkerResponse;
        const request = this.#pendingWorkerRequests.get(response.messageId);
        if (!request) return;
        this.#pendingWorkerRequests.delete(response.messageId);
        if (response.success) request.resolve(response.color);
        else request.reject(new Error(response.error || 'Worker 颜色提取失败'));
      };
      this.#worker.onerror = error => {
        console.error('颜色提取 Worker 发生致命错误:', error);
        this.#pendingWorkerRequests.forEach(({ reject }) => reject(new Error('Worker 发生错误')));
        this.#pendingWorkerRequests.clear();
      };
    } catch (error) {
      console.error('无法初始化颜色提取 Worker:', error);
      this.#worker = null;
    }
  }

  async #extractColorFromImage(imageUrl: string): Promise<number> {
    if (!this.#worker) throw new Error('颜色提取 Worker 不可用');

    const messageId = ++this.#workerMessageId;

    // Promise 逻辑保持不变
    const colorPromise = new Promise<number>((resolve, reject) => {
      this.#pendingWorkerRequests.set(messageId, { resolve, reject });
      setTimeout(() => {
        if (this.#pendingWorkerRequests.has(messageId)) {
          this.#pendingWorkerRequests.delete(messageId);
          reject(new Error(`Worker 处理超时 (${WORKER_TIMEOUT / 1000}秒)`));
        }
      }, WORKER_TIMEOUT);
    });

    try {
      /// 判断屏幕的宽高
      const isMobile = window.innerWidth < 768;

      const message: ColorExtractionWorkerMessage = {
        imageUrl,
        messageId,
        isMobile,
      };

      this.#worker.postMessage(message);
    } catch (error) {
      this.#pendingWorkerRequests.delete(messageId);
      throw error;
    }

    return colorPromise;
  }


  /**
   * 从 sessionStorage 加载种子颜色
   */
  #loadSeedColorFromSession(): number | null {
    try {
      const storedSeedColor = sessionStorage.getItem(SEED_COLOR_STORAGE_KEY);
      return storedSeedColor ? parseInt(storedSeedColor, 10) : null;
    } catch (error) {
      console.warn('从 sessionStorage 加载种子颜色失败:', error);
      return null;
    }
  }

  /**
   * 保存种子颜色到 sessionStorage
   */
  #saveSeedColorToSession(seedColor: number): void {
    try {
      sessionStorage.setItem(SEED_COLOR_STORAGE_KEY, seedColor.toString());
    } catch (error) {
      console.warn('保存种子颜色到 sessionStorage 失败:', error);
    }
  }

  #listenForColorSchemeChanges(): void {
    if (!window.matchMedia) return;
    this.#colorSchemeQuery = window.matchMedia('(prefers-color-scheme: dark)');
    this.#colorSchemeQuery.addEventListener('change', this.#handleColorSchemeChange);
  }

  /**
   * 处理系统颜色方案变化
   */
  #handleColorSchemeChange = (e: MediaQueryListEvent) => {
    const isDark = e.matches;
    const currentSeedColor = this.getCurrentSeedColor();
    const newTheme = themeFromSourceColor(currentSeedColor);
    this.#applyTheme(newTheme, isDark);
  };



  /**
   * 使用 DynamicScheme 应用额外的 surface-container 颜色变量
   * @param sourceColor 源颜色 ARGB 值
   * @param isDark 是否为深色模式
   */
  #applyDynamicSchemeColors(sourceColor: number, isDark: boolean = false): void {
    try {
      // 创建 HCT 颜色对象
      const sourceColorHct = Hct.fromInt(sourceColor);
      
      // 创建 DynamicScheme（使用 TonalSpot 变体，这是默认的 Material You 主题）
      const dynamicScheme = new SchemeTonalSpot(sourceColorHct, isDark, 0.0);
      
      // 获取所有 surface-container 相关的颜色
      const surfaceColors = {
        'surface-dim': hexFromArgb(dynamicScheme.surfaceDim),
        'surface-bright': hexFromArgb(dynamicScheme.surfaceBright),
        'surface-container-lowest': hexFromArgb(dynamicScheme.surfaceContainerLowest),
        'surface-container-low': hexFromArgb(dynamicScheme.surfaceContainerLow),
        'surface-container': hexFromArgb(dynamicScheme.surfaceContainer),
        'surface-container-high': hexFromArgb(dynamicScheme.surfaceContainerHigh),
        'surface-container-highest': hexFromArgb(dynamicScheme.surfaceContainerHighest),
      };
      
      // 应用这些颜色变量到 document.body
      for (const [key, color] of Object.entries(surfaceColors)) {
        document.body.style.setProperty(`--md-sys-color-${key}`, color);
      }
    } catch (error) {
      console.error('应用 DynamicScheme 颜色时出错:', error);
    }
  }



  /**
   * 获取当前种子颜色
   */
  public getCurrentSeedColor(): number {
    if (this.#currentSeedColor !== null) return this.#currentSeedColor;
    const sessionSeedColor = this.#loadSeedColorFromSession();
    if (sessionSeedColor !== null) {
      this.#currentSeedColor = sessionSeedColor;
      return sessionSeedColor;
    }
    return DEFAULT_SEED_COLOR;
  }

  /**
   * 使用 Material Color Utilities 的官方 applyTheme API 和 DynamicScheme
   * @param theme Material Design 主题对象
   * @param isDark 是否为深色模式
   */
  #applyTheme(theme: Theme, isDark: boolean = this.prefersDarkMode()): void {
    requestAnimationFrame(() => {
      try {
        // 使用官方的 applyTheme API 直接应用主题
        applyTheme(theme, { target: document.body, dark: isDark });
        
        // 使用 DynamicScheme 生成额外的 surface-container 变量
        this.#applyDynamicSchemeColors(theme.source, isDark);
        
        // 保存种子颜色
        this.#currentSeedColor = theme.source;
        this.#saveSeedColorToSession(theme.source);
      } catch (error) {
        console.error('应用主题时出错:', error);
      }
    });
  }
  


  /**
   * 从图片更新主题
   */
  public async updateThemeFromImage(
    imageUrl: string,
    isDark: boolean = this.prefersDarkMode(),
  ): Promise<number | undefined> {
    if (this.#lastAppliedImageUrl === imageUrl && this.#currentSeedColor !== null) return;
    if (this.#isUpdatingTheme) {
      console.warn('主题正在更新中，本次请求被忽略。');
      return;
    }

    this.#isUpdatingTheme = true;
    try {
      const sourceColor = await this.#extractColorFromImage(imageUrl);
      const theme = themeFromSourceColor(sourceColor);
      this.#applyTheme(theme, isDark);
      this.#lastAppliedImageUrl = imageUrl;
      return sourceColor;
    } catch (error) {
      console.error(`从图片 '${imageUrl}' 更新主题失败，应用默认主题`, error);
      // 失败时，也使用当前的 isDark 状态来生成默认主题
      const defaultTheme = themeFromSourceColor(DEFAULT_SEED_COLOR);
      this.#applyTheme(defaultTheme, isDark);
      return undefined;
    } finally {
      this.#isUpdatingTheme = false;
    }
  }

  /**
   * 从颜色更新主题
   */
  public async updateThemeFromColor(sourceColor: number, isDark: boolean = this.prefersDarkMode()): Promise<number> {
    try {
      const theme = themeFromSourceColor(sourceColor);
      this.#applyTheme(theme, isDark);
      return sourceColor;
    } catch (error) {
      console.error('从颜色更新主题失败:', error);
      const defaultTheme = themeFromSourceColor(DEFAULT_SEED_COLOR);
      this.#applyTheme(defaultTheme, isDark);
      return DEFAULT_SEED_COLOR;
    }
  }

  /**
   * 检查是否偏好深色模式
   */
  public prefersDarkMode(): boolean {
    if (!window.matchMedia) return false;
    if (!this.#colorSchemeQuery) {
      this.#colorSchemeQuery = window.matchMedia('(prefers-color-scheme: dark)');
    }
    return this.#colorSchemeQuery.matches;
  }

  /**
   * 获取持久化的主题信息
   */
  public getPersistedThemeInfo(): { imageUrl: string | null; hasSeedColor: boolean } {
    return {
      imageUrl: this.#lastAppliedImageUrl,
      hasSeedColor: this.#currentSeedColor !== null || sessionStorage.getItem(SEED_COLOR_STORAGE_KEY) !== null,
    };
  }

  /**
   * 仅提取图片颜色，不应用主题（用于预缓存）
   */
  public async extractColorFromImageOnly(imageUrl: string): Promise<number> {
    return this.#extractColorFromImage(imageUrl);
  }

  /**
   * 关闭所有后台活动并清理资源
   */
  public shutdown(): void {
    // 清理所有待处理的Worker请求
    this.#pendingWorkerRequests.forEach(({ reject }) => reject(new Error('Worker 已关闭')));
    this.#pendingWorkerRequests.clear();

    // 终止Worker并清理引用
    if (this.#worker) {
      this.#worker.terminate();
      this.#worker = null;
    }

    // 移除颜色方案变化监听器
    if (this.#colorSchemeQuery) {
      this.#colorSchemeQuery.removeEventListener('change', this.#handleColorSchemeChange);
      this.#colorSchemeQuery = null;
    }
  }
}

/**
 * 导出的 themeManager 单例实例
 */
export const themeManager = new ThemeManagerImpl();
