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
  /** 提取的主题色 */
  themeColor?: number;
}

interface IBlurAnimator {
  animation: Animation | null;
  animationFrameId: number | null;
  maxBlur: number;
  lastTargetState: number;
  isInitialized: boolean;

  init(): boolean;
  updateBlur(shouldBlur: boolean): void;
  destroy(): void;
  _tick(): void;
}

interface ICarouselManager {
  svgElement: SVGSVGElement | null;
  currentImg: SVGImageElement | null;
  currentIndex: number;
  backgrounds: string[];
  timerRef: number | null;
  isPaused: boolean;
  originalTitle: string;
  init(backgrounds: string[]): void;
  reinit(): void;
  switchBackground(): void;
  startTimer(): void;
  pauseCarousel(): void;
  resumeCarousel(): void;
  destroy(): void;
  _ensureImageCount(maxImages?: number): void;
  _createImageElement(href: string): SVGImageElement;
  _precacheImages(urls: string[]): void;
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
  BLUR_DURATION: 400,
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
/** 模块是否已初始化 */
let isInitialized = false;

let activeAnimation: Animation | null = null;

// 模糊动画器实现
const blurAnimator: IBlurAnimator = {
  animation: null,
  animationFrameId: null,
  maxBlur: CONFIG.MAX_BLUR,
  lastTargetState: -1,
  isInitialized: false,

  init(): boolean {
    if (!gaussianBlurElement) {
      console.error('[blurAnimator] 初始化失败：gaussianBlurElement 未设置');
      return false;
    }

    if (this.isInitialized) {
      console.warn('[blurAnimator] 已经初始化，跳过重复初始化');
      return true;
    }

    try {
      const keyframeEffect = new KeyframeEffect(null, [{ offset: 0 }, { offset: 1 }], {
        duration: CONFIG.BLUR_DURATION,
        fill: 'forwards',
        easing: 'ease-in-out',
      });

      this.animation = new Animation(keyframeEffect, document.timeline);
      this.animation.pause();
      this._tick();
      this.isInitialized = true;

      console.log('[blurAnimator] 初始化成功');
      return true;
    } catch (error) {
      console.error('[blurAnimator] 初始化失败:', error);
      return false;
    }
  },

  _tick() {
    if (this.animation && gaussianBlurElement) {
      const progress = this.animation.effect?.getComputedTiming().progress;
      if (typeof progress === 'number') {
        const currentBlur = this.maxBlur * progress;
        gaussianBlurElement.setAttribute('stdDeviation', currentBlur.toString());
      }
    }
    this.animationFrameId = requestAnimationFrame(() => this._tick());
  },

  updateBlur(shouldBlur: boolean): void {
    if (!this.isInitialized || !this.animation) return;

    const currentTargetState = shouldBlur ? 1 : 0;
    if (currentTargetState === this.lastTargetState) return;

    try {
      if (currentTargetState === 1) {
        this.animation.playbackRate = 1;
        this.animation.play();
      } else {
        this.animation.reverse();
      }
      this.lastTargetState = currentTargetState;
    } catch (error) {
      console.error('[blurAnimator] 更新模糊状态失败:', error);
    }
  },

  destroy(): void {
    if (!this.isInitialized) return;

    try {
      if (this.animation) {
        this.animation.cancel();
      }
      if (this.animationFrameId) {
        cancelAnimationFrame(this.animationFrameId);
      }
    } catch (error) {
      console.error('[blurAnimator] 销毁过程中出现错误:', error);
    }
    this.animation = null;
    this.animationFrameId = null;
    this.lastTargetState = -1;
    this.isInitialized = false;

    console.log('[blurAnimator] 已销毁');
  },
};

// 轮播管理器实现
const carouselManager: ICarouselManager = {
  svgElement: null,
  currentImg: null,
  currentIndex: 0,
  backgrounds: [],
  timerRef: null,
  isPaused: false,
  originalTitle: '',
  // isSwitching: false,

  init(backgrounds: string[]) {
    this.backgrounds = backgrounds;
    this.originalTitle = document.title;
    this.currentIndex = 0;
    this.isPaused = false;

    // 获取SVG元素
    this.svgElement = document.querySelector(SELECTORS.SVG_ELEMENT);
    if (!this.svgElement) {
      console.error('[CarouselManager] SVG element not found:', SELECTORS.SVG_ELEMENT);
      return;
    }

    // 清理旧图片
    const existingImages = this.svgElement.querySelectorAll(SELECTORS.IMAGE_ELEMENTS);
    existingImages.forEach(img => img.remove());

    // 获取模糊元素并初始化模糊动画器
    gaussianBlurElement = this.svgElement.querySelector(SELECTORS.BLUR_FILTER);
    if (gaussianBlurElement) {
      if (!blurAnimator.init()) {
        console.error('[CarouselManager] 模糊动画器初始化失败');
      }
    } else {
      console.error('[CarouselManager] Blur filter not found:', SELECTORS.BLUR_FILTER);
    }

    // 创建初始图片
    if (backgrounds.length > 0) {
      this.currentImg = this._createImageElement(backgrounds[0]);
      this.svgElement.appendChild(this.currentImg);
      this._ensureImageCount(1);

      // 异步更新主题色
      updateThemeFromBackground(backgrounds[0]);

      // 预缓存所有背景图片
      this._precacheImages(backgrounds);
    }

    console.log('[CarouselManager] 初始化完成');
  },

  reinit() {
    // 获取现有SVG元素并清理图片
    const existingSvg = document.querySelector(SELECTORS.SVG_ELEMENT);
    if (existingSvg) {
      const images = existingSvg.querySelectorAll(SELECTORS.IMAGE_ELEMENTS);
      images.forEach(img => img.remove());
    }

    // 重新获取SVG元素
    this.svgElement = existingSvg as SVGSVGElement;

    // 重新创建图片
    if (this.backgrounds.length > 0) {
      this.currentImg = this._createImageElement(this.backgrounds[this.currentIndex]);
      this.svgElement?.appendChild(this.currentImg);
      this._ensureImageCount(1);
    }

    console.log('[CarouselManager] 重新初始化完成');
  },

  switchBackground() {
    if (
      this.backgrounds.length <= 1 ||
      this.isPaused ||
      !this.currentImg ||
      !this.svgElement ||
      activeAnimation
    ) {
      return;
    }

    const nextIndex = (this.currentIndex + 1) % this.backgrounds.length;
    const currentImg = this.currentImg;
    const nextImg = this._createImageElement(this.backgrounds[nextIndex]);

    updateThemeFromBackground(this.backgrounds[nextIndex]);
    currentImg.before(nextImg);

    // 捕获动画实例
    activeAnimation = currentImg.animate([{ opacity: 1 }, { opacity: 0 }], {
      duration: CONFIG.SWITCH_DURATION,
    });

    // 监听动画的完成或取消
    activeAnimation.finished
      .then(() => {
        // 动画正常完成
        currentImg.remove();
        this.currentImg = nextImg;
        this.currentIndex = nextIndex;
      })
      .catch(error => {
        // 如果动画被手动 .cancel()，会触发 catch
        if (error.name !== 'AbortError') {
          console.error('[CarouselManager] 动画发生意外:', error);
        }
      })
      .finally(() => {
        // 无论成功还是失败，最终都要释放控制器，允许下一次切换
        activeAnimation = null;
        this.startTimer();
      });
  },

  startTimer() {
    if (this.timerRef) clearTimeout(this.timerRef); // 使用 clearTimeout
    if (this.isPaused) return;

    this.timerRef = window.setTimeout(() => {
      this.switchBackground();
    }, CONFIG.SWITCH_INTERVAL);
  },

  pauseCarousel() {
    this.isPaused = true;
    if (this.timerRef) clearTimeout(this.timerRef); // 使用 clearTimeout
    this.timerRef = null;
    document.title = '等你回来~ | ' + this.originalTitle;
  },

  resumeCarousel() {
    this.isPaused = false;
    document.title = this.originalTitle;
    this.startTimer();
  },

  _createImageElement(href: string): SVGImageElement {
    const image = document.createElementNS(SVG_NS, 'image');
    image.setAttribute('href', href);
    image.setAttribute('x', '-5');
    image.setAttribute('y', '-5');
    image.setAttribute('height', '102%');
    image.setAttribute('width', '102%');
    image.setAttribute('preserveAspectRatio', 'xMidYMid slice');
    image.style.filter = 'url(#bg-carousel-blur-filter)';
    return image;
  },

  _ensureImageCount(maxImages: number = 2) {
    if (!this.svgElement) return;

    const images = this.svgElement.querySelectorAll(SELECTORS.IMAGE_ELEMENTS);
    if (images.length > maxImages) {
      console.warn(
        `[CarouselManager] 发现${images.length}个图片元素，超过限制${maxImages}个，正在清理...`,
      );

      const imagesToRemove = Array.from(images).slice(0, images.length - maxImages);
      imagesToRemove.forEach(img => img.remove());

      const remainingImages = this.svgElement!.querySelectorAll(SELECTORS.IMAGE_ELEMENTS);
      if (remainingImages.length > 0) {
        this.currentImg = remainingImages[remainingImages.length - 1] as SVGImageElement;
      }
    }
  },

  destroy() {
    if (this.timerRef) clearTimeout(this.timerRef);
    if (this.svgElement) {
      const images = this.svgElement.querySelectorAll(SELECTORS.IMAGE_ELEMENTS);
      images.forEach(img => img.remove());
    }

    if (activeAnimation) {
      activeAnimation.cancel();
      activeAnimation = null;
    }
    this.svgElement = null;
    this.currentImg = null;
    this.currentIndex = 0;
    this.backgrounds = [];
    this.timerRef = null;
    this.isPaused = false;
    this.originalTitle = '';
    console.log('[CarouselManager] 已销毁');
  },

  _precacheImages(urls: string[]): void {
    urls.forEach(url => {
      if (!imageCache.has(url)) {
        imageCache.set(url, { isLoaded: false });
      }
    });
    console.log(`[CarouselManager] 预缓存 ${urls.length} 张图片`);
  },
};

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
      const existing = imageCache.get(imageUrl) || { isLoaded: false };
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
 * 初始化背景轮播组件
 */
export function initBackgroundCarousel(backgrounds: string[]): void {
  console.log('[Carousel] 初始化背景轮播组件');

  if (!isInitialized) {
    // 首次初始化
    isInitialized = true;
    carouselManager.init(backgrounds);
    setupEventListeners();
    registerGlobalCleanup(destroyCarousel);
  } else {
    // 重新初始化
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
  isInitialized = false;

  console.log('[Carousel] 组件已完全销毁');
}
