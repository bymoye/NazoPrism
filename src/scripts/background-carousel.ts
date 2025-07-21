import { themeManager } from '../utils/theme-manager';
import { offPageVisibilityChange, onPageVisibilityChange } from './page-visibility-manager';
import { registerGlobalCleanup } from './cleanup-manager';
import { scrollObserverManager } from './scroll-observer-manager';

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
 * 模糊动画器类，用于控制 SVG 高斯模糊效果的动画
 */
class BlurAnimator {
  #animationFrameId: number | null = null;
  readonly #maxBlur: number;
  #lastTargetState: number = -1;
  #isInitialized: boolean = false;
  #gaussianBlurElement: SVGFEGaussianBlurElement | null = null;

  // 动画状态
  #currentBlur: number = 0;
  #targetBlur: number = 0;
  #animationStartTime: number = 0;
  readonly #animationDuration: number;

  constructor(maxBlur: number = CONFIG.MAX_BLUR, animationDuration: number = CONFIG.BLUR_DURATION) {
    this.#maxBlur = maxBlur;
    this.#animationDuration = animationDuration;
  }

  /**
   * 初始化模糊动画器
   * @param gaussianBlurElement SVG 高斯模糊元素
   * @returns 是否初始化成功
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
   * @param shouldBlur 是否应该模糊
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
class CarouselManager {
  #svgElement: SVGSVGElement | null = null;
  #currentImg: SVGImageElement | null = null;
  #currentIndex: number = 0;
  #backgrounds: string[] = [];
  #timerRef: number | null = null;
  #isPaused: boolean = false;
  #originalTitle: string = '';
  #activeAnimation: Animation | null = null;

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
   * @param backgrounds 背景图片数组
   */
  init(backgrounds: string[]): void {
    this.#backgrounds = backgrounds;
    this.#originalTitle = document.title;
    this.#currentIndex = 0;
    this.#isPaused = false;

    // 获取SVG元素
    this.#svgElement = document.querySelector(SELECTORS.SVG_ELEMENT);
    if (!this.#svgElement) {
      console.error('[CarouselManager] SVG element not found:', SELECTORS.SVG_ELEMENT);
      return;
    }

    // 清理旧图片
    const existingImages = this.#svgElement.querySelectorAll(SELECTORS.IMAGE_ELEMENTS);
    existingImages.forEach((img: Element) => img.remove());

    // 获取模糊元素并初始化模糊动画器
    gaussianBlurElement = this.#svgElement.querySelector(SELECTORS.BLUR_FILTER);
    if (gaussianBlurElement) {
      if (!blurAnimator.init(gaussianBlurElement)) {
        console.error('[CarouselManager] 模糊动画器初始化失败');
      }
    } else {
      console.error('[CarouselManager] Blur filter not found:', SELECTORS.BLUR_FILTER);
    }

    // 创建初始图片
    if (backgrounds.length > 0) {
      this.#currentImg = this.#createImageElement(backgrounds[0]);
      this.#svgElement.appendChild(this.#currentImg);
      this.#ensureImageCount(1);

      // 标记第一张图片为已预载（因为已经显示）
      const firstImageData = imageCache.get(backgrounds[0]) || {
        isLoaded: false,
        isPreloaded: false,
      };
      imageCache.set(backgrounds[0], { ...firstImageData, isLoaded: true, isPreloaded: true });

      // 异步更新主题色
      updateThemeFromBackground(backgrounds[0]);

      // 预缓存所有背景图片
      this.#precacheImages(backgrounds);

      // 预载下一张图片
      this.#preloadNextImage();
    }

    console.log('[CarouselManager] 初始化完成');
  }

  /**
   * 重新初始化轮播管理器
   * 这个函数一般都不会被调用, 只是写着备用, 以防万一。
   * 因为svg元素应该会保留整个生命周期，所以正常逻辑来说永远都不会走到这里。
   */
  reinit(): void {
    // 获取现有SVG元素并清理图片
    const existingSvg = document.querySelector(SELECTORS.SVG_ELEMENT);
    if (existingSvg) {
      const images = existingSvg.querySelectorAll(SELECTORS.IMAGE_ELEMENTS);
      images.forEach((img: Element) => img.remove());
    }

    // 重新获取SVG元素
    this.#svgElement = existingSvg as SVGSVGElement;

    // 重新创建图片
    if (this.#backgrounds.length > 0) {
      this.#currentImg = this.#createImageElement(this.#backgrounds[this.#currentIndex]);
      this.#svgElement?.appendChild(this.#currentImg);
      this.#ensureImageCount(1);

      // 标记当前图片为已预载
      const currentImageUrl = this.#backgrounds[this.#currentIndex];
      const currentImageData = imageCache.get(currentImageUrl) || {
        isLoaded: false,
        isPreloaded: false,
      };
      imageCache.set(currentImageUrl, { ...currentImageData, isLoaded: true, isPreloaded: true });

      // 预载下一张图片
      this.#preloadNextImage();
    }
    this.startTimer();
    console.log('[CarouselManager] 重新初始化完成');
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

    updateThemeFromBackground(this.#backgrounds[nextIndex]);
    currentImg.before(nextImg);

    // 捕获动画实例
    this.#activeAnimation = currentImg.animate([{ opacity: 1 }, { opacity: 0 }], {
      duration: CONFIG.SWITCH_DURATION,
    });

    // 监听动画的完成或取消
    this.#activeAnimation.finished
      .then(() => {
        // 动画正常完成
        currentImg.remove();
        this.#currentImg = nextImg;
        this.#currentIndex = nextIndex;

        // 预载下一张图片
        this.#preloadNextImage();
      })
      .catch(error => {
        // 如果动画被手动 .cancel()，会触发 catch
        if (error.name !== 'AbortError') {
          console.error('[CarouselManager] 动画发生意外:', error);
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
    }, CONFIG.SWITCH_INTERVAL);
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
      const images = this.#svgElement.querySelectorAll(SELECTORS.IMAGE_ELEMENTS);
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
    console.log('[CarouselManager] 已销毁');
  }

  /**
   * 创建 SVG 图片元素
   * @param href 图片链接
   * @returns SVG 图片元素
   */
  #createImageElement(href: string): SVGImageElement {
    const image = document.createElementNS(SVG_NS, 'image');
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
   * @param maxImages 最大图片数量
   */
  #ensureImageCount(maxImages: number = 2): void {
    if (!this.#svgElement) return;

    const images = this.#svgElement.querySelectorAll(SELECTORS.IMAGE_ELEMENTS);
    if (images.length > maxImages) {
      console.warn(
        `[CarouselManager] 发现${images.length}个图片元素，超过限制${maxImages}个，正在清理...`,
      );

      const imagesToRemove = Array.from(images).slice(0, images.length - maxImages);
      imagesToRemove.forEach((img: Element) => img.remove());

      const remainingImages = this.#svgElement!.querySelectorAll(SELECTORS.IMAGE_ELEMENTS);
      if (remainingImages.length > 0) {
        this.#currentImg = remainingImages[remainingImages.length - 1] as SVGImageElement;
      }
    }
  }

  /**
   * 预缓存图片
   * @param urls 图片URL数组
   */
  #precacheImages(urls: string[]): void {
    urls.forEach(url => {
      if (!imageCache.has(url)) {
        imageCache.set(url, { isLoaded: false, isPreloaded: false });
      }
    });
    console.log(`[CarouselManager] 初始化 ${urls.length} 张图片缓存`);
  }
  #getOrInitImageCache(url: string): ImageCacheData {
    return imageCache.get(url) ?? { isLoaded: false, isPreloaded: false };
  }
  /**
   * 预载图片
   * @param url 图片URL
   * @returns Promise
   */
  async #preloadImage(url: string): Promise<void> {
    const cachedData = imageCache.get(url);
    if (cachedData?.isPreloaded) {
      // 已经预载过，直接返回
      return;
    }

    return new Promise((resolve, reject) => {
      const img = new Image();

      img.onload = () => {
        // 更新缓存状态
        const existing = this.#getOrInitImageCache(url);
        imageCache.set(url, {
          ...existing,
          isPreloaded: true,
          isLoaded: true,
        });
        console.log(`[CarouselManager] 预载图片成功: ${url}`);

        // 检查是否所有图片都已预载完成
        checkAndStopPreloading();

        resolve();
      };

      img.onerror = () => {
        console.warn(`[CarouselManager] 预载图片失败: ${url}`);
        // 即使预载失败，也标记为已尝试，避免重复尝试
        const existing = this.#getOrInitImageCache(url);
        imageCache.set(url, { ...existing, isPreloaded: true });

        // 即使失败也要检查预载状态
        checkAndStopPreloading();

        reject(new Error(`预载图片失败: ${url}`));
      };

      img.src = url;
    });
  }

  /**
   * 预载下一张图片
   */
  #preloadNextImage(): void {
    if (this.#backgrounds.length <= 1) {
      // 只有一张或没有图片，无需预载
      return;
    }

    if (allImagesPreloaded) {
      // 所有图片已预载完成，停止预载
      return;
    }

    const nextIndex = (this.#currentIndex + 1) % this.#backgrounds.length;
    const nextImageUrl = this.#backgrounds[nextIndex];

    // 异步预载，不阻塞主流程
    this.#preloadImage(nextImageUrl).catch(error => {
      // 预载失败不影响主功能，只记录警告
      console.warn('[CarouselManager] 预载下一张图片失败:', error);
    });
  }
}

/**
 * 轮播配置常量
 */
const CONFIG = {
  /** 模糊强度 */
  MAX_BLUR: 5,
  /** 自动切换间隔时间（毫秒） */
  SWITCH_INTERVAL: 10000,
  /** 切换动画持续时间（毫秒） */
  SWITCH_DURATION: 1500,
  /** 模糊动画持续时间（毫秒） */
  BLUR_DURATION: 600,
  /** 滚动触发阈值 */
  SCROLL_MARGIN: '300px 0px 0px 0px',
} as const;

// --- 模块级共享变量 ---
const OBSERVER_ID = 'background-carousel';
const SVG_NS = 'http://www.w3.org/2000/svg';

// DOM 选择器常量
const SELECTORS = {
  SVG_ELEMENT: '#bg-carousel-svg',
  BLUR_FILTER: '#bg-carousel-blur-filter feGaussianBlur',
  IMAGE_ELEMENTS: 'image',
} as const;

/** 图片缓存映射，存储图片数据和主题色 */
const imageCache = new Map<string, ImageCacheData>();
/** 高斯模糊元素引用 */
let gaussianBlurElement: SVGFEGaussianBlurElement | null = null;
/** 是否已提取完所有主题色 */
let allThemeColorsExtracted = false;
/** 是否已预载完所有图片 */
let allImagesPreloaded = false;
/** 模块是否已初始化 */
let isInitialized = false;

// 模糊动画器实例
const blurAnimator = new BlurAnimator();

// 轮播管理器实例
const carouselManager = new CarouselManager();

// --- 工具函数 ---

/**
 * 滚动状态变化回调函数
 */
const handleScrollChange = (isScrolled: boolean) => {
  blurAnimator.updateBlur(isScrolled);
};

/**
 * 从背景图片更新主题色
 */
async function updateThemeFromBackground(imageUrl: string): Promise<void> {
  if (!imageUrl) {
    console.warn('[updateThemeFromBackground] 图片URL为空');
    return;
  }

  const isDark = themeManager.prefersDarkMode();
  const cachedData = imageCache.get(imageUrl);

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
      const existing = imageCache.get(imageUrl) || { isLoaded: false, isPreloaded: false };
      imageCache.set(imageUrl, { ...existing, themeColor: color });
      checkAndShutdownWorker();
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
function checkAndShutdownWorker() {
  if (allThemeColorsExtracted) return;

  const allExtracted = carouselManager.backgrounds.every(
    url => imageCache.get(url)?.themeColor !== undefined,
  );

  if (allExtracted) {
    allThemeColorsExtracted = true;
    themeManager.shutdown();
    console.log('🎨 所有背景图主题色提取完成，已关闭颜色提取Worker以节省资源');
  }
}

/**
 * 检查是否所有背景图都已预载完成
 */
function checkAndStopPreloading() {
  if (allImagesPreloaded) return;

  const allPreloaded = carouselManager.backgrounds.every(
    url => imageCache.get(url)?.isPreloaded === true,
  );

  if (allPreloaded) {
    allImagesPreloaded = true;
    console.log('🖼️ 所有背景图预载完成，停止预载功能以节省资源');
  }
}

/**
 * 设置事件监听器
 */
function setupEventListeners() {
  // 清除之前的监听器
  offPageVisibilityChange('background-carousel');
  scrollObserverManager.unregister(OBSERVER_ID);

  // 注册滚动状态观察器
  scrollObserverManager.register({
    id: OBSERVER_ID,
    callback: handleScrollChange,
    rootMargin: CONFIG.SCROLL_MARGIN,
    threshold: 0,
  });

  // 设置页面可见性监听器
  onPageVisibilityChange(
    'background-carousel',
    () => carouselManager.pauseCarousel(),
    () => carouselManager.resumeCarousel(),
  );

  // 启动定时器
  carouselManager.startTimer();
}

// --- 公共接口 ---

/**
 * 从 API 获取背景图片数据
 */
async function fetchBackgrounds(): Promise<string[]> {
  try {
    const response = await fetch('https://api.nmxc.ltd/randimg?number=5&encode=json');
    if (!response.ok) {
      throw new Error(`HTTP ${response.status}: ${response.statusText}`);
    }

    const data = await response.json();
    if (data.code === 200 && Array.isArray(data.url)) {
      console.log(`[Carousel] 成功获取 ${data.url.length} 张背景图片`);
      return data.url;
    } else {
      throw new Error('API 返回数据格式错误');
    }
  } catch (error) {
    console.error('[Carousel] 获取背景图片失败:', error);
    // 返回空数组，让调用者处理fallback
    return [];
  }
}

/**
 * 初始化背景轮播组件
 */
export async function initBackgroundCarousel(fallbackBackgrounds?: string[]): Promise<void> {
  console.log('[Carousel] 初始化背景轮播组件');

  // 尝试从 API 获取背景图片
  let backgrounds = await fetchBackgrounds();

  // 如果 API 获取失败，使用 fallback 图片
  if (backgrounds.length === 0 && fallbackBackgrounds && fallbackBackgrounds.length > 0) {
    console.warn('[Carousel] 使用备用背景图片');
    backgrounds = fallbackBackgrounds;
  }

  // 如果没有任何可用的背景图片，则退出
  if (backgrounds.length === 0) {
    console.error('[Carousel] 没有可用的背景图片，跳过初始化');
    return;
  }

  if (!isInitialized) {
    // 首次初始化
    isInitialized = true;
    carouselManager.init(backgrounds);
    setupEventListeners();
    registerGlobalCleanup(destroyCarousel);
  } else {
    // 重新初始化
    carouselManager.backgrounds = backgrounds;
    carouselManager.reinit();
    setupEventListeners();
  }
}

/**
 * 销毁轮播组件
 */
export function destroyCarousel(): void {
  if (!isInitialized) return;

  // 移除事件监听器
  scrollObserverManager.unregister(OBSERVER_ID);
  offPageVisibilityChange('background-carousel');

  // 销毁管理器
  carouselManager.destroy();
  blurAnimator.destroy();
  // 清理缓存和模块状态
  imageCache.clear();
  gaussianBlurElement = null;
  allThemeColorsExtracted = false;
  allImagesPreloaded = false;
  isInitialized = false;

  console.log('[Carousel] 组件已完全销毁');
}
