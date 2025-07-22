/**
 * @file src/scripts/BackgroundCarouselManager.ts
 * @description 背景轮播管理器
 */

import { themeManager } from '../utils/theme-manager';
import { onPageVisibilityChange, offPageVisibilityChange } from './PageVisibilityManager';
import { registerGlobalCleanup } from './CleanupManager';
import { scrollObserverManager } from './ScrollObserverManager';

/**
 * 图片缓存数据接口
 */
interface ImageCacheData {
  /** 是否已加载 */
  isLoaded: boolean;
  /** 是否已预载 */
  isPreloaded: boolean;
  /** 提取的主题色 */
  themeColor?: number;
}

/**
 * 轮播配置接口
 */
interface CarouselConfig {
  /** 模糊强度 */
  maxBlur: number;
  /** 自动切换间隔时间（毫秒） */
  switchInterval: number;
  /** 切换动画持续时间（毫秒） */
  switchDuration: number;
  /** 模糊动画持续时间（毫秒） */
  blurDuration: number;
  /** 滚动触发阈值 */
  scrollMargin: string;
}

/**
 * 模糊动画器类，用于控制 SVG 高斯模糊效果的动画
 */
class BlurAnimator {
  #animationFrameId: number | null = null;
  #maxBlur: number;
  #lastTargetState: number = -1;
  #isInitialized: boolean = false;
  #gaussianBlurElement: SVGFEGaussianBlurElement | null = null;
  #currentBlur: number = 0;
  #targetBlur: number = 0;
  #animationStartTime: number = 0;
  #animationDuration: number;

  constructor(maxBlur: number = 5, animationDuration: number = 600) {
    this.#maxBlur = maxBlur;
    this.#animationDuration = animationDuration;
  }

  /**
   * 初始化模糊动画器
   */
  init(gaussianBlurElement: SVGFEGaussianBlurElement): boolean {
    if (this.#isInitialized) {
      console.warn('[BlurAnimator] 已经初始化，跳过重复初始化');
      return true;
    }

    if (!gaussianBlurElement) {
      console.error('[BlurAnimator] 初始化失败：gaussianBlurElement 不能为空');
      return false;
    }

    this.#gaussianBlurElement = gaussianBlurElement;
    this.#isInitialized = true;

    // 设置初始状态
    this.#currentBlur = 0;
    this.#targetBlur = 0;
    this.#gaussianBlurElement.setAttribute('stdDeviation', '0');

    console.log('[BlurAnimator] 初始化成功');
    return true;
  }

  /**
   * 更新模糊状态
   */
  updateBlur(shouldBlur: boolean): void {
    if (!this.#isInitialized || !this.#gaussianBlurElement) return;

    const currentTargetState = shouldBlur ? 1 : 0;
    if (currentTargetState === this.#lastTargetState) return;

    this.#targetBlur = shouldBlur ? this.#maxBlur : 0;
    this.#animationStartTime = performance.now();
    this.#lastTargetState = currentTargetState;

    // 如果没有正在运行的动画，启动动画循环
    if (this.#animationFrameId === null) {
      this.#startAnimation();
    }
  }

  /**
   * 启动动画循环
   */
  #startAnimation(): void {
    this.#animationFrameId = requestAnimationFrame(timestamp => this.#tick(timestamp));
  }

  /**
   * 动画帧处理函数
   */
  #tick(timestamp: number): void {
    if (!this.#gaussianBlurElement) return;

    const elapsed = timestamp - this.#animationStartTime;
    const progress = Math.min(elapsed / this.#animationDuration, 1);

    // 使用 ease-in-out 缓动函数
    const easedProgress = this.#easeInOut(progress);

    // 计算当前模糊值
    const startBlur = this.#currentBlur;
    const blurDiff = this.#targetBlur - startBlur;
    this.#currentBlur = startBlur + blurDiff * easedProgress;

    // 更新 DOM
    this.#gaussianBlurElement.setAttribute('stdDeviation', this.#currentBlur.toString());

    // 检查动画是否完成
    if (progress >= 1) {
      // 动画完成，停止 requestAnimationFrame
      this.#currentBlur = this.#targetBlur;
      this.#gaussianBlurElement.setAttribute('stdDeviation', this.#currentBlur.toString());
      this.#animationFrameId = null;
    } else {
      // 继续动画
      this.#animationFrameId = requestAnimationFrame(timestamp => this.#tick(timestamp));
    }
  }

  /**
   * ease-in-out 缓动函数
   */
  #easeInOut(t: number): number {
    return t < 0.5 ? 2 * t * t : -1 + (4 - 2 * t) * t;
  }

  /**
   * 销毁动画器
   */
  destroy(): void {
    if (!this.#isInitialized) return;

    if (this.#animationFrameId !== null) {
      cancelAnimationFrame(this.#animationFrameId);
      this.#animationFrameId = null;
    }

    this.#gaussianBlurElement = null;
    this.#currentBlur = 0;
    this.#targetBlur = 0;
    this.#lastTargetState = -1;
    this.#isInitialized = false;

    console.log('[BlurAnimator] 已销毁');
  }
}

/**
 * 轮播管理器类，用于控制背景图片轮播
 */
class CarouselController {
  // 私有字段 - ES2022 特性
  #svgElement: SVGSVGElement | null = null;
  #currentImg: SVGImageElement | null = null;
  #currentIndex: number = 0;
  #backgrounds: string[] = [];
  #timerRef: number | null = null;
  #isPaused: boolean = false;
  #originalTitle: string = '';
  #activeAnimation: Animation | null = null;
  #config: CarouselConfig;

  constructor(config: CarouselConfig) {
    this.#config = config;
  }

  /**
   * 获取当前背景图片数组
   */
  get backgrounds(): string[] {
    return this.#backgrounds;
  }

  /**
   * 设置背景图片数组
   */
  set backgrounds(value: string[]) {
    this.#backgrounds = value;
  }

  /**
   * 获取当前索引
   */
  get currentIndex(): number {
    return this.#currentIndex;
  }

  /**
   * 初始化轮播管理器
   */
  init(backgrounds: string[]): void {
    this.#backgrounds = backgrounds;
    this.#originalTitle = document.title;
    this.#currentIndex = 0;
    this.#isPaused = false;

    // 获取SVG元素
    this.#svgElement = document.querySelector('#bg-carousel-svg');
    if (!this.#svgElement) {
      console.error('[CarouselController] SVG element not found');
      return;
    }

    // 清理旧图片
    const existingImages = this.#svgElement.querySelectorAll('image');
    existingImages.forEach((img: Element) => img.remove());

    // 创建初始图片
    if (backgrounds.length > 0) {
      this.#currentImg = this.#createImageElement(backgrounds[0]);
      this.#svgElement.appendChild(this.#currentImg);
      this.#ensureImageCount(1);
    }

    console.log('[CarouselController] 初始化完成');
  }

  /**
   * 切换背景图片
   */
  switchBackground(): void {
    if (
      this.#backgrounds.length <= 1 ||
      this.#isPaused ||
      !this.#currentImg ||
      !this.#svgElement ||
      this.#activeAnimation
    ) {
      return;
    }

    const nextIndex = (this.#currentIndex + 1) % this.#backgrounds.length;
    const currentImg = this.#currentImg;
    const nextImg = this.#createImageElement(this.#backgrounds[nextIndex]);

    currentImg.before(nextImg);

    // 捕获动画实例
    this.#activeAnimation = currentImg.animate([{ opacity: 1 }, { opacity: 0 }], {
      duration: this.#config.switchDuration,
    });

    // 监听动画的完成或取消
    this.#activeAnimation.finished
      .then(() => {
        // 动画正常完成
        currentImg.remove();
        this.#currentImg = nextImg;
        this.#currentIndex = nextIndex;
      })
      .catch(error => {
        // 如果动画被手动 .cancel()，会触发 catch
        if (error.name !== 'AbortError') {
          console.error('[CarouselController] 动画发生意外:', error);
        }
      })
      .finally(() => {
        // 无论成功还是失败，最终都要释放控制器，允许下一次切换
        this.#activeAnimation = null;
        this.startTimer();
      });
  }

  /**
   * 启动定时器
   */
  startTimer(): void {
    if (this.#timerRef) clearTimeout(this.#timerRef);
    if (this.#isPaused) return;

    this.#timerRef = window.setTimeout(() => {
      this.switchBackground();
    }, this.#config.switchInterval);
  }

  /**
   * 暂停轮播
   */
  pauseCarousel(): void {
    this.#isPaused = true;
    if (this.#timerRef) clearTimeout(this.#timerRef);
    this.#timerRef = null;
    document.title = '等你回来~ | ' + this.#originalTitle;
  }

  /**
   * 恢复轮播
   */
  resumeCarousel(): void {
    this.#isPaused = false;
    document.title = this.#originalTitle;
    this.startTimer();
  }

  /**
   * 销毁轮播管理器
   */
  destroy(): void {
    if (this.#timerRef) clearTimeout(this.#timerRef);
    if (this.#svgElement) {
      const images = this.#svgElement.querySelectorAll('image');
      images.forEach((img: Element) => img.remove());
    }

    if (this.#activeAnimation) {
      this.#activeAnimation.cancel();
      this.#activeAnimation = null;
    }

    this.#svgElement = null;
    this.#currentImg = null;
    this.#currentIndex = 0;
    this.#backgrounds = [];
    this.#timerRef = null;
    this.#isPaused = false;
    this.#originalTitle = '';
    console.log('[CarouselController] 已销毁');
  }

  /**
   * 创建 SVG 图片元素
   */
  #createImageElement(href: string): SVGImageElement {
    const image = document.createElementNS('http://www.w3.org/2000/svg', 'image');
    image.setAttribute('href', href);
    image.setAttribute('x', '-5');
    image.setAttribute('y', '-5');
    image.setAttribute('height', '102%');
    image.setAttribute('width', '102%');
    image.setAttribute('preserveAspectRatio', 'xMidYMid slice');
    image.style.filter = 'url(#bg-carousel-blur-filter)';
    return image;
  }

  /**
   * 确保图片数量不超过限制
   */
  #ensureImageCount(maxImages: number = 2): void {
    if (!this.#svgElement) return;

    const images = this.#svgElement.querySelectorAll('image');
    if (images.length > maxImages) {
      console.warn(
        `[CarouselController] 发现${images.length}个图片元素，超过限制${maxImages}个，正在清理...`,
      );

      const imagesToRemove = Array.from(images).slice(0, images.length - maxImages);
      imagesToRemove.forEach((img: Element) => img.remove());

      const remainingImages = this.#svgElement!.querySelectorAll('image');
      if (remainingImages.length > 0) {
        this.#currentImg = remainingImages[remainingImages.length - 1] as SVGImageElement;
      }
    }
  }
}

/**
 * 背景轮播管理器主类
 * 统一管理背景轮播的所有功能
 */
class BackgroundCarouselManager {
  #config: CarouselConfig = {
    maxBlur: 5,
    switchInterval: 10000,
    switchDuration: 1500,
    blurDuration: 600,
    scrollMargin: '300px 0px 0px 0px',
  };

  #imageCache = new Map<string, ImageCacheData>();
  #allThemeColorsExtracted = false;
  #allImagesPreloaded = false;
  #isInitialized = false;
  #observerId = 'background-carousel';

  #blurAnimator: BlurAnimator;
  #carouselController: CarouselController;

  // 单例实例
  static #instance: BackgroundCarouselManager | null = null;

  /**
   * 私有构造函数，确保单例模式
   */
  private constructor() {
    this.#blurAnimator = new BlurAnimator(this.#config.maxBlur, this.#config.blurDuration);
    this.#carouselController = new CarouselController(this.#config);
  }

  /**
   * 获取单例实例
   */
  static getInstance(): BackgroundCarouselManager {
    if (!BackgroundCarouselManager.#instance) {
      BackgroundCarouselManager.#instance = new BackgroundCarouselManager();
    }
    return BackgroundCarouselManager.#instance;
  }

  /**
   * 滚动状态变化回调函数
   */
  #handleScrollChange = (isScrolled: boolean): void => {
    this.#blurAnimator.updateBlur(isScrolled);
  };

  /**
   * 从背景图片更新主题色
   */
  async #updateThemeFromBackground(imageUrl: string): Promise<void> {
    if (!imageUrl) {
      console.warn('[updateThemeFromBackground] 图片URL为空');
      return;
    }

    const isDark = themeManager.prefersDarkMode();
    const cachedData = this.#imageCache.get(imageUrl);

    // 使用缓存的主题色
    if (cachedData?.themeColor !== undefined) {
      try {
        await themeManager.updateThemeFromColor(cachedData.themeColor, isDark);
        return;
      } catch (error) {
        console.error('[updateThemeFromBackground] 应用缓存主题色失败:', error);
      }
    }

    // 提取新的主题色
    try {
      const color = await themeManager.updateThemeFromImage(imageUrl, isDark);
      if (color !== undefined) {
        // 更新缓存
        const existing = this.#imageCache.get(imageUrl) || { isLoaded: false, isPreloaded: false };
        this.#imageCache.set(imageUrl, { ...existing, themeColor: color });
        this.#checkAndShutdownWorker();
      }
    } catch (error) {
      console.error('[updateThemeFromBackground] 提取主题色失败:', error);
      // 使用默认主题色
      const defaultTheme = themeManager.generateTheme(0xff6750a4, isDark);
      themeManager.applyTheme(defaultTheme);
    }
  }

  /**
   * 检查是否所有背景图的主题色都已提取完成
   */
  #checkAndShutdownWorker(): void {
    if (this.#allThemeColorsExtracted) return;

    const allExtracted = this.#carouselController.backgrounds.every(
      url => this.#imageCache.get(url)?.themeColor !== undefined,
    );

    if (allExtracted) {
      this.#allThemeColorsExtracted = true;
      themeManager.shutdown();
      console.log('🎨 所有背景图主题色提取完成，已关闭颜色提取Worker以节省资源');
    }
  }

  /**
   * 设置事件监听器
   */
  #setupEventListeners(): void {
    // 清除之前的监听器
    offPageVisibilityChange(this.#observerId);
    scrollObserverManager.unregister(this.#observerId);

    // 注册滚动状态观察器
    scrollObserverManager.register({
      id: this.#observerId,
      callback: this.#handleScrollChange,
      rootMargin: this.#config.scrollMargin,
      threshold: 0,
    });

    // 设置页面可见性监听器
    onPageVisibilityChange(
      this.#observerId,
      () => this.#carouselController.pauseCarousel(),
      () => this.#carouselController.resumeCarousel(),
    );

    // 启动定时器
    this.#carouselController.startTimer();
  }

  /**
   * 从 API 获取背景图片数据
   */
  async #fetchBackgrounds(): Promise<string[]> {
    try {
      const response = await fetch('https://api.nmxc.ltd/randimg?number=5&encode=json');
      if (!response.ok) {
        throw new Error(`HTTP ${response.status}: ${response.statusText}`);
      }

      const data = await response.json();
      if (data.code === 200 && Array.isArray(data.url)) {
        console.log(`[BackgroundCarousel] 成功获取 ${data.url.length} 张背景图片`);
        return data.url;
      } else {
        throw new Error('API 返回数据格式错误');
      }
    } catch (error) {
      console.error('[BackgroundCarousel] 获取背景图片失败:', error);
      return [];
    }
  }

  /**
   * 销毁轮播组件
   */
  #destroy(): void {
    if (!this.#isInitialized) return;

    // 移除事件监听器
    scrollObserverManager.unregister(this.#observerId);
    offPageVisibilityChange(this.#observerId);

    // 销毁管理器
    this.#carouselController.destroy();
    this.#blurAnimator.destroy();

    // 清理缓存和模块状态
    this.#imageCache.clear();
    this.#allThemeColorsExtracted = false;
    this.#allImagesPreloaded = false;
    this.#isInitialized = false;

    console.log('[BackgroundCarousel] 组件已完全销毁');
  }

  /**
   * 初始化背景轮播组件
   */
  async init(fallbackBackgrounds?: string[]): Promise<void> {
    console.log('[BackgroundCarousel] 初始化背景轮播组件');

    // 尝试从 API 获取背景图片
    let backgrounds = await this.#fetchBackgrounds();

    // 如果 API 获取失败，使用 fallback 图片
    if (backgrounds.length === 0 && fallbackBackgrounds && fallbackBackgrounds.length > 0) {
      console.warn('[BackgroundCarousel] 使用备用背景图片');
      backgrounds = fallbackBackgrounds;
    }

    // 如果没有任何可用的背景图片，则退出
    if (backgrounds.length === 0) {
      console.error('[BackgroundCarousel] 没有可用的背景图片，跳过初始化');
      return;
    }

    if (!this.#isInitialized) {
      // 首次初始化
      this.#isInitialized = true;

      // 初始化模糊动画器
      const gaussianBlurElement = document.querySelector(
        '#bg-carousel-blur-filter feGaussianBlur',
      ) as SVGFEGaussianBlurElement;
      if (gaussianBlurElement) {
        this.#blurAnimator.init(gaussianBlurElement);
      }

      this.#carouselController.init(backgrounds);
      this.#setupEventListeners();

      // 注册全局清理
      registerGlobalCleanup(() => this.#destroy());

      // 异步更新主题色
      if (backgrounds.length > 0) {
        this.#updateThemeFromBackground(backgrounds[0]);
      }
    } else {
      // 重新初始化
      this.#carouselController.backgrounds = backgrounds;
      this.#setupEventListeners();
    }
  }

  /**
   * 获取管理器状态信息（调试用）
   */
  getStats() {
    return {
      isInitialized: this.#isInitialized,
      backgroundsCount: this.#carouselController.backgrounds.length,
      currentIndex: this.#carouselController.currentIndex,
      imageCacheSize: this.#imageCache.size,
      allThemeColorsExtracted: this.#allThemeColorsExtracted,
      allImagesPreloaded: this.#allImagesPreloaded,
      config: this.#config,
    };
  }

  /**
   * 更新配置
   */
  updateConfig(newConfig: Partial<CarouselConfig>): void {
    this.#config = { ...this.#config, ...newConfig };
  }

  /**
   * 手动切换到下一张背景
   */
  nextBackground(): void {
    this.#carouselController.switchBackground();
  }

  /**
   * 暂停轮播
   */
  pause(): void {
    this.#carouselController.pauseCarousel();
  }

  /**
   * 恢复轮播
   */
  resume(): void {
    this.#carouselController.resumeCarousel();
  }

  /**
   * 销毁管理器（用于测试）
   */
  destroy(): void {
    this.#destroy();
    BackgroundCarouselManager.#instance = null;
  }
}

// 导出便捷函数，保持向后兼容
const backgroundCarouselManager = BackgroundCarouselManager.getInstance();

export const initBackgroundCarousel = (fallbackBackgrounds?: string[]) =>
  backgroundCarouselManager.init(fallbackBackgrounds);
export const destroyCarousel = () => backgroundCarouselManager.destroy();
