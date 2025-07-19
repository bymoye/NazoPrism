import { themeManager } from '../utils/theme-manager';
import { offPageVisibilityChange, onPageVisibilityChange } from './page-visibility-manager';
import { registerGlobalCleanup } from './cleanup-manager';
import { offEvents, onScroll } from './global-event-manager';

/**
 * 轮播组件的状态接口
 */
interface CarouselState {
  /** SVG元素 */
  svgElement: SVGSVGElement | null;
  /** 当前显示的图片元素 */
  currentImg: SVGImageElement | null;
  /** 当前显示的背景图片索引 */
  currentIndex: number;
  /** 背景图片URL数组 */
  backgrounds: string[];
  /** 定时器引用，用于控制自动切换 */
  timerRef: number | null;
  /** 是否暂停轮播 */
  isPaused: boolean;
  /** 原始页面标题 */
  originalTitle: string;
  /** 是否已提取完所有主题色 */
  allThemeColorsExtracted: boolean;
  /** 高斯模糊元素 */
  gaussianBlur: SVGFEGaussianBlurElement | null;
  /** 是否正在切换中（防止并发切换） */
  isSwitching: boolean;
}

/**
 * 图片缓存数据接口
 */
interface ImageCacheData {
  /** 是否已加载 */
  isLoaded: boolean;
  /** 提取的主题色 */
  themeColor?: number;
}

/**
 * 轮播配置常量
 */
const CONFIG = {
  /** 滚动阈值，超过此值时应用模糊效果 */
  SCROLL_THRESHOLD: 200,
  /** 模糊强度 */
  BLUR_STRENGTH: '5',
  /** 自动切换间隔时间（毫秒） */
  SWITCH_INTERVAL: 10000,
  /** 动画持续时间 */
  ANIMATION_DURATION: '1500ms',
};

/**
 * 轮播组件的全局状态
 */
const state: CarouselState = {
  currentIndex: 0,
  backgrounds: [],
  timerRef: null,
  currentImg: null,
  isPaused: false,
  originalTitle: '',
  allThemeColorsExtracted: false,
  svgElement: null,
  gaussianBlur: null,
  isSwitching: false,
};

/** 图片缓存映射，存储图片数据和主题色 */
const imageCache = new Map<string, ImageCacheData>();
/** 模块是否已初始化 */
let isInitialized = false;

// --- 核心逻辑函数 ---

/** SVG命名空间 */
const SVG_NS = 'http://www.w3.org/2000/svg';

/**
 * 创建SVG动画元素
 * @returns SVG animate元素
 */
function createOpacityAnimation(): SVGAnimateElement {
  const animate = document.createElementNS(SVG_NS, 'animate');
  animate.setAttribute('attributeName', 'opacity');
  animate.setAttribute('from', '1');
  animate.setAttribute('to', '0');
  animate.setAttribute('begin', 'null');
  animate.setAttribute('dur', CONFIG.ANIMATION_DURATION);
  animate.setAttribute('repeatCount', '1');
  animate.setAttribute('fill', 'freeze');
  return animate;
}

/**
 * 创建SVG图片元素
 * @param href - 图片链接
 * @returns SVG image元素
 */
function createImageElement(href: string): SVGImageElement {
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
 * 模糊效果控制状态
 */
const blurState = {
  /** 是否正在进行模糊动画 */
  isAnimating: false,
  /** 当前模糊值 */
  currentBlurValue: 0,
  /** 目标模糊值 */
  targetBlurValue: 0,
  /** 动画步长 */
  step: 0.1,
};

/**
 * 检查模糊动画是否应该停止
 * @param scrollTop - 当前滚动位置
 * @returns 是否应该停止动画
 */
function shouldStopBlurAnimation(scrollTop: number): boolean {
  return (
    (scrollTop > CONFIG.SCROLL_THRESHOLD && blurState.currentBlurValue === 5) ||
    (scrollTop <= CONFIG.SCROLL_THRESHOLD && blurState.currentBlurValue === 0)
  );
}

/**
 * 执行模糊动画的单步
 */
function performBlurStep() {
  if (!state.gaussianBlur) return;

  // 根据目标值调整当前模糊值
  if (blurState.targetBlurValue > blurState.currentBlurValue) {
    blurState.currentBlurValue = parseFloat(
      (blurState.currentBlurValue + blurState.step).toFixed(1),
    );
  } else if (blurState.targetBlurValue < blurState.currentBlurValue) {
    blurState.currentBlurValue = parseFloat(
      (blurState.currentBlurValue - blurState.step).toFixed(1),
    );
  }

  // 限制模糊值范围
  blurState.currentBlurValue = Math.max(0, Math.min(5, blurState.currentBlurValue));

  // 更新DOM元素
  state.gaussianBlur.setAttribute('stdDeviation', blurState.currentBlurValue.toString());

  // 检查是否需要继续动画
  if (Math.abs(blurState.currentBlurValue - blurState.targetBlurValue) > 0.05) {
    requestAnimationFrame(performBlurStep);
  } else {
    // 动画完成，设置精确的目标值
    blurState.currentBlurValue = blurState.targetBlurValue;
    state.gaussianBlur.setAttribute('stdDeviation', blurState.currentBlurValue.toString());
    blurState.isAnimating = false;
  }
}

/**
 * 启动模糊动画
 * @param scrollTop - 当前滚动位置
 */
function startBlurAnimation(scrollTop: number) {
  if (!blurState.isAnimating && !shouldStopBlurAnimation(scrollTop)) {
    blurState.isAnimating = true;
    blurState.targetBlurValue = scrollTop > CONFIG.SCROLL_THRESHOLD ? 5 : 0;
    requestAnimationFrame(performBlurStep);
  }
}

/**
 * 处理页面滚动事件，根据滚动位置调整模糊效果
 */
const handleScroll = () => {
  const scrollTop = document.documentElement.scrollTop || document.body.scrollTop;
  if (state.gaussianBlur) {
    startBlurAnimation(scrollTop);
  }
};

/**
 * 从背景图片更新主题色
 * @param imageUrl - 图片URL
 */
async function updateThemeFromBackground(imageUrl: string) {
  const isDark = themeManager.prefersDarkMode();
  const cachedColor = imageCache.get(imageUrl)?.themeColor;

  // 如果缓存中已有主题色，直接使用
  if (cachedColor !== undefined) {
    await themeManager.updateThemeFromColor(cachedColor, isDark);
    return;
  }

  try {
    // 从图片提取主题色
    const color = await themeManager.updateThemeFromImage(imageUrl, isDark);
    if (color !== undefined) {
      // 将提取的主题色存入缓存
      const existing = imageCache.get(imageUrl) || { isLoaded: false };
      imageCache.set(imageUrl, { ...existing, themeColor: color });
      checkAndShutdownWorker();
    }
  } catch {
    // 提取失败时使用默认主题色
    themeManager.applyTheme(themeManager.generateTheme(0xff6750a4, isDark));
  }
}

/**
 * 确保SVG中的图片元素数量在合理范围内
 * @param maxImages - 允许的最大图片数量（默认2个，正常1个+过渡时1个）
 */
function ensureImageCount(maxImages: number = 2) {
  if (!state.svgElement) return;

  const images = state.svgElement.querySelectorAll('image');

  // 如果图片数量超过限制，移除多余的图片
  if (images.length > maxImages) {
    console.warn(`[Carousel] 发现${images.length}个图片元素，超过限制${maxImages}个，正在清理...`);

    // 保留最新的图片，移除旧的图片
    const imagesToRemove = Array.from(images).slice(0, images.length - maxImages);
    imagesToRemove.forEach(img => {
      img.remove();
      console.log('[Carousel] 移除多余的图片元素');
    });

    // 更新当前图片状态到最新的图片
    const remainingImages = state.svgElement.querySelectorAll('image');
    if (remainingImages.length > 0) {
      state.currentImg = remainingImages[remainingImages.length - 1] as SVGImageElement;
    }
  }
}

/**
 * 检查是否所有背景图的主题色都已提取完成，如果是则关闭Worker以节省资源
 */
function checkAndShutdownWorker() {
  if (state.allThemeColorsExtracted) return;

  // 检查是否所有背景图都已提取主题色
  const allExtracted = state.backgrounds.every(
    url => imageCache.get(url)?.themeColor !== undefined,
  );

  if (allExtracted) {
    state.allThemeColorsExtracted = true;
    themeManager.shutdown();
    console.log('🎨 所有背景图主题色提取完成，已关闭颜色提取Worker以节省资源');
  }
}

/**
 * 切换背景图片
 * 使用SVG动画实现平滑过渡
 */
function switchBackground() {
  // 检查切换条件：图片数量、暂停状态、当前图片存在性、是否正在切换
  if (
    state.backgrounds.length <= 1 ||
    state.isPaused ||
    !state.currentImg ||
    !state.svgElement ||
    state.isSwitching
  ) {
    return;
  }

  // 设置切换状态，防止并发切换
  state.isSwitching = true;

  // 安全检查：确保当前SVG中没有过多的图片元素
  ensureImageCount(1);

  const nextIndex = (state.currentIndex + 1) % state.backgrounds.length;
  const currentImg = state.currentImg;

  // 创建新的图片元素
  const nextImg = createImageElement(state.backgrounds[nextIndex]);

  // 更新主题色
  updateThemeFromBackground(state.backgrounds[nextIndex]);

  // 创建淡出动画
  const fadeOutAnimation = createOpacityAnimation();

  // 将新图片插入到当前图片之前（显示在下层）
  currentImg.before(nextImg);

  // 为当前图片添加淡出动画
  currentImg.appendChild(fadeOutAnimation);

  // 开始动画
  fadeOutAnimation.beginElement();

  // 定义动画结束处理函数
  const handleAnimationEnd = () => {
    // 清理动画元素
    fadeOutAnimation.remove();

    // 移除旧图片
    currentImg.remove();

    // 更新状态
    state.currentImg = nextImg;
    state.currentIndex = nextIndex;

    // 重置切换状态
    state.isSwitching = false;

    // 最终安全检查：确保只有一个图片元素
    ensureImageCount(1);

    // 移除事件监听器避免内存泄漏
    fadeOutAnimation.removeEventListener('endEvent', handleAnimationEnd);
  };

  // 监听动画结束事件
  fadeOutAnimation.addEventListener('endEvent', handleAnimationEnd);
}

/**
 * 启动自动切换定时器
 */
const startTimer = () => {
  // 清除现有定时器
  if (state.timerRef) clearInterval(state.timerRef);

  // 如果未暂停则启动新的定时器
  if (!state.isPaused) {
    state.timerRef = window.setInterval(switchBackground, CONFIG.SWITCH_INTERVAL);
  }
};

/**
 * 暂停轮播
 * 在页面不可见时调用
 */
const pauseCarousel = () => {
  state.isPaused = true;
  if (state.timerRef) clearInterval(state.timerRef);
  state.timerRef = null;
  // 更新页面标题提示用户
  document.title = '等你回来~ | ' + state.originalTitle;
};

/**
 * 恢复轮播
 * 在页面重新可见时调用
 */
const resumeCarousel = () => {
  state.isPaused = false;
  // 恢复原始页面标题
  document.title = state.originalTitle;
  startTimer();
};

/**
 * 设置事件监听器
 * 包括滚动监听和页面可见性监听
 */
function setupEventListeners() {
  // 清除之前的页面可见性监听器
  offPageVisibilityChange('background-carousel');

  // 设置滚动监听器
  // window.addEventListener('scroll', handleScroll);
  onScroll('background-carousel-scroll', handleScroll);

  // 设置页面可见性监听器，用于暂停/恢复轮播
  onPageVisibilityChange('background-carousel', pauseCarousel, resumeCarousel);

  // 启动定时器
  startTimer();
}

/**
 * 初始化SVG元素和创建第一张图片
 */
function createImageElements() {
  // 从DOM获取硬编码的SVG元素
  state.svgElement = document.querySelector('#bg-carousel-svg');
  if (!state.svgElement) {
    console.error('[Carousel] SVG element #bg-carousel-svg not found');
    return;
  }

  // 清理可能存在的旧图片元素
  const existingImages = state.svgElement.querySelectorAll('image');
  existingImages.forEach(img => img.remove());

  // 从DOM获取硬编码的高斯模糊元素
  state.gaussianBlur = state.svgElement.querySelector('#bg-carousel-blur-filter feGaussianBlur');
  if (!state.gaussianBlur) {
    console.error('[Carousel] Blur filter not found');
    return;
  }

  // 初始化模糊状态
  blurState.currentBlurValue = parseFloat(state.gaussianBlur.getAttribute('stdDeviation') || '0');
  blurState.targetBlurValue = blurState.currentBlurValue;

  // 创建初始图片
  if (state.backgrounds.length > 0) {
    state.currentImg = createImageElement(state.backgrounds[0]);
    state.svgElement.appendChild(state.currentImg);

    // 确保只有一个图片元素
    ensureImageCount(1);

    // 异步更新第一张图片的主题色
    updateThemeFromBackground(state.backgrounds[0]);
  }
}

/**
 * 执行初始化设置
 * @param backgrounds - 背景图片URL数组
 */
async function runInitialSetup(backgrounds: string[]) {
  // 保存背景图片列表和原始标题
  state.backgrounds = backgrounds;
  state.originalTitle = document.title;

  createImageElements();
  setupEventListeners();
  handleScroll();

  if (backgrounds.length > 0) {
    const firstUrl = backgrounds[0];
    if (!imageCache.has(firstUrl)) {
      imageCache.set(firstUrl, { isLoaded: false });
    }
  }
}

/**
 * 执行重新初始化
 * 用于页面重新加载或组件重新挂载时
 */
function runReinitialization() {
  // 获取现有的SVG元素并清理图片
  const existingSvg = document.querySelector('#bg-carousel-svg');
  if (existingSvg) {
    // 只清理image元素
    const images = existingSvg.querySelectorAll('image');
    images.forEach(img => img.remove());
  }

  // 重新初始化组件
  createImageElements();

  // 重新设置事件监听器
  setupEventListeners();
  handleScroll();
}

/**
 * 初始化背景轮播组件
 *
 * 这是此模块的唯一公共入口函数。首次调用时进行完整初始化，
 * 后续调用时进行重新初始化以适应DOM变化。
 *
 * @param backgrounds - 要轮播的背景图片URL数组
 *
 * @example
 * ```typescript
 * initBackgroundCarousel([
 *   'https://example.com/image1.jpg',
 *   'https://example.com/image2.jpg',
 *   'https://example.com/image3.jpg'
 * ]);
 * ```
 */
export function initBackgroundCarousel(backgrounds: string[]): void {
  console.log('[Carousel] 初始化背景轮播组件');
  if (!isInitialized) {
    // 首次初始化
    isInitialized = true;
    runInitialSetup(backgrounds);
    // 注册全局清理任务，确保页面卸载时正确清理资源
    registerGlobalCleanup(destroyCarousel);
  } else {
    // 重新初始化
    runReinitialization();
  }
}

/**
 * 完整销毁轮播组件
 *
 * 清理所有相关资源，包括定时器、事件监听器、DOM元素等。
 * 确保没有内存泄漏，适用于页面卸载或组件销毁时调用。
 *
 * @public
 */
export function destroyCarousel(): void {
  if (!isInitialized) return;

  // 清理定时器，停止自动切换
  if (state.timerRef) clearInterval(state.timerRef);

  // 移除事件监听器
  offEvents('background-carousel-scroll');
  offPageVisibilityChange('background-carousel');

  if (state.svgElement) {
    const images = state.svgElement.querySelectorAll('image');
    images.forEach(img => img.remove());
  }

  // 清理缓存数据
  imageCache.clear();

  // 重置所有状态到初始值
  Object.assign(state, {
    currentIndex: 0,
    backgrounds: [],
    timerRef: null,
    currentImg: null,
    isPaused: false,
    originalTitle: '',
    allThemeColorsExtracted: false,
    svgElement: null,
    gaussianBlur: null,
    isSwitching: false,
  });

  // 重置模糊状态
  Object.assign(blurState, {
    isAnimating: false,
    currentBlurValue: 0,
    targetBlurValue: 0,
    step: 0.1,
  });

  // 标记为未初始化状态
  isInitialized = false;
}
