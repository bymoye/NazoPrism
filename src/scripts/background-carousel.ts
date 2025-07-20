import { themeManager } from '../utils/theme-manager';
import { offPageVisibilityChange, onPageVisibilityChange } from './page-visibility-manager';
import { registerGlobalCleanup } from './cleanup-manager';
import { offEvents, onScroll } from './global-event-manager';

/**
 * 轮播组件的状态接口
 */
interface CarouselState {
  /** Canvas元素 */
  canvas: HTMLCanvasElement | null;
  /** Canvas渲染上下文 */
  ctx: CanvasRenderingContext2D | null;
  /** 当前显示的图片 */
  currentImg: HTMLImageElement | null;
  /** 下一张图片（用于过渡） */
  nextImg: HTMLImageElement | null;
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
  /** 当前模糊强度 */
  blurAmount: number;
  /** 是否正在切换中（防止并发切换） */
  isSwitching: boolean;
  /** 过渡动画的透明度 */
  transitionOpacity: number;
  /** 过渡动画ID */
  transitionAnimationId: number | null;
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
  canvas: null,
  ctx: null,
  currentIndex: 0,
  backgrounds: [],
  timerRef: null,
  currentImg: null,
  nextImg: null,
  isPaused: false,
  originalTitle: '',
  allThemeColorsExtracted: false,
  blurAmount: 0,
  isSwitching: false,
  transitionOpacity: 0,
  transitionAnimationId: null,
};

/** 图片缓存映射，存储图片数据和主题色 */
const imageCache = new Map<string, ImageCacheData>();
/** 模块是否已初始化 */
let isInitialized = false;

// --- 核心逻辑函数 ---

/**
 * 创建并加载图片元素
 * @param src - 图片链接
 * @returns Promise<HTMLImageElement>
 */
function loadImage(src: string): Promise<HTMLImageElement> {
  return new Promise((resolve, reject) => {
    const img = new Image();
    img.crossOrigin = 'anonymous';
    img.onload = () => resolve(img);
    img.onerror = reject;
    img.src = src;
  });
}

/**
 * 调整Canvas尺寸以匹配窗口
 */
function resizeCanvas() {
  if (!state.canvas || !state.ctx) return;

  const dpr = window.devicePixelRatio || 1;
  const rect = state.canvas.getBoundingClientRect();

  state.canvas.width = rect.width * dpr;
  state.canvas.height = rect.height * dpr;

  state.ctx.scale(dpr, dpr);
  state.canvas.style.width = rect.width + 'px';
  state.canvas.style.height = rect.height + 'px';
}

/**
 * 在Canvas上绘制图片，保持宽高比并填充整个画布
 * @param img - 要绘制的图片
 * @param opacity - 透明度 (0-1)
 */
function drawImageCover(img: HTMLImageElement, opacity: number = 1) {
  if (!state.canvas || !state.ctx) return;

  const canvasWidth = state.canvas.width / (window.devicePixelRatio || 1);
  const canvasHeight = state.canvas.height / (window.devicePixelRatio || 1);

  // 计算缩放比例以填充整个画布
  const scale = Math.max(canvasWidth / img.width, canvasHeight / img.height);
  const scaledWidth = img.width * scale;
  const scaledHeight = img.height * scale;

  // 居中绘制
  const x = (canvasWidth - scaledWidth) / 2;
  const y = (canvasHeight - scaledHeight) / 2;

  state.ctx.globalAlpha = opacity;
  state.ctx.drawImage(img, x, y, scaledWidth, scaledHeight);
  state.ctx.globalAlpha = 1;
}

/**
 * 应用模糊效果到Canvas
 * @param blurAmount - 模糊强度
 */
function applyBlur(blurAmount: number) {
  if (!state.ctx || blurAmount <= 0) return;

  state.ctx.filter = `blur(${blurAmount}px)`;
}

/**
 * 渲染当前帧
 */
function render() {
  if (!state.canvas || !state.ctx) return;

  // 清空画布
  state.ctx.clearRect(0, 0, state.canvas.width, state.canvas.height);

  // 应用模糊效果
  applyBlur(state.blurAmount);

  // 绘制当前图片
  if (state.currentImg) {
    drawImageCover(state.currentImg, 1);
  }

  // 如果正在过渡，绘制下一张图片
  if (state.nextImg && state.transitionOpacity > 0) {
    drawImageCover(state.nextImg, state.transitionOpacity);
  }

  // 重置滤镜
  state.ctx.filter = 'none';
}

/**
 * 模糊效果控制状态
 */
const blurState = {
  /** 是否正在进行模糊动画 */
  isAnimating: false,
  /** 目标模糊值 */
  targetBlurValue: 0,
  /** 动画步长 */
  step: 0.1,
  /** 上次滚动位置，用于判断滚动方向 */
  lastScrollTop: 0,
};

/**
 * 执行模糊动画的单步
 */
function performBlurStep() {
  // 根据目标值调整当前模糊值
  if (blurState.targetBlurValue > state.blurAmount) {
    state.blurAmount = parseFloat((state.blurAmount + blurState.step).toFixed(1));
  } else if (blurState.targetBlurValue < state.blurAmount) {
    state.blurAmount = parseFloat((state.blurAmount - blurState.step).toFixed(1));
  }

  // 限制模糊值范围
  state.blurAmount = Math.max(0, Math.min(5, state.blurAmount));

  // 重新渲染
  render();

  // 检查是否需要继续动画
  if (Math.abs(state.blurAmount - blurState.targetBlurValue) > 0.05) {
    requestAnimationFrame(performBlurStep);
  } else {
    // 动画完成，设置精确的目标值
    state.blurAmount = blurState.targetBlurValue;
    render();
    blurState.isAnimating = false;
  }
}

/**
 * 启动模糊动画
 * @param scrollTop - 当前滚动位置
 */
function startBlurAnimation(scrollTop: number) {
  // 计算新的目标模糊值
  const newTargetBlurValue = scrollTop > CONFIG.SCROLL_THRESHOLD ? 5 : 0;

  // 如果目标值发生变化，或者当前没有动画在进行
  if (newTargetBlurValue !== blurState.targetBlurValue || !blurState.isAnimating) {
    // 更新目标值
    blurState.targetBlurValue = newTargetBlurValue;

    // 如果当前模糊值已经等于目标值，不需要动画
    if (Math.abs(state.blurAmount - blurState.targetBlurValue) <= 0.05) {
      state.blurAmount = blurState.targetBlurValue;
      render();
      blurState.isAnimating = false;
      return;
    }

    // 开始新的动画（如果还没有在进行）
    if (!blurState.isAnimating) {
      blurState.isAnimating = true;
      requestAnimationFrame(performBlurStep);
    }
  }

  // 更新上次滚动位置
  blurState.lastScrollTop = scrollTop;
}

/**
 * 处理页面滚动事件，根据滚动位置调整模糊效果
 */
const handleScroll = () => {
  const scrollTop = document.documentElement.scrollTop || document.body.scrollTop;
  startBlurAnimation(scrollTop);
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
 * 处理窗口大小变化
 */
function handleResize() {
  resizeCanvas();
  render();
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
 * 执行过渡动画
 */
function performTransition() {
  if (!state.nextImg || state.transitionOpacity >= 1) {
    // 动画完成
    if (state.nextImg) {
      state.currentImg = state.nextImg;
      state.nextImg = null;
    }
    state.transitionOpacity = 0;
    state.isSwitching = false;
    state.transitionAnimationId = null;
    render();
    return;
  }

  // 增加透明度
  state.transitionOpacity += 0.02; // 约50帧完成过渡
  if (state.transitionOpacity > 1) state.transitionOpacity = 1;

  render();
  state.transitionAnimationId = requestAnimationFrame(performTransition);
}

/**
 * 切换背景图片
 * 使用Canvas渐变过渡实现平滑切换
 */
async function switchBackground() {
  // 检查切换条件：图片数量、暂停状态、当前图片存在性、是否正在切换
  if (
    state.backgrounds.length <= 1 ||
    state.isPaused ||
    !state.currentImg ||
    !state.canvas ||
    state.isSwitching
  ) {
    return;
  }

  // 设置切换状态，防止并发切换
  state.isSwitching = true;

  const nextIndex = (state.currentIndex + 1) % state.backgrounds.length;

  try {
    // 加载下一张图片
    state.nextImg = await loadImage(state.backgrounds[nextIndex]);

    // 更新主题色
    updateThemeFromBackground(state.backgrounds[nextIndex]);

    // 更新索引
    state.currentIndex = nextIndex;

    // 开始过渡动画
    state.transitionOpacity = 0;
    if (state.transitionAnimationId) {
      cancelAnimationFrame(state.transitionAnimationId);
    }
    state.transitionAnimationId = requestAnimationFrame(performTransition);
  } catch (error) {
    console.error('[Carousel] 加载图片失败:', error);
    state.isSwitching = false;
  }
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
 * 包括滚动监听、窗口大小变化监听和页面可见性监听
 */
function setupEventListeners() {
  // 清除之前的页面可见性监听器
  offPageVisibilityChange('background-carousel');

  // 设置滚动监听器
  onScroll('background-carousel-scroll', handleScroll);

  // 设置窗口大小变化监听器
  window.addEventListener('resize', handleResize);

  // 设置页面可见性监听器，用于暂停/恢复轮播
  onPageVisibilityChange('background-carousel', pauseCarousel, resumeCarousel);

  // 启动定时器
  startTimer();
}

/**
 * 初始化Canvas元素和加载第一张图片
 */
async function initializeCanvas() {
  // 从DOM获取Canvas元素
  state.canvas = document.querySelector('#bg-carousel-canvas');
  if (!state.canvas) {
    console.error('[Carousel] Canvas element #bg-carousel-canvas not found');
    return;
  }

  // 获取渲染上下文
  state.ctx = state.canvas.getContext('2d');
  if (!state.ctx) {
    console.error('[Carousel] 无法获取Canvas 2D上下文');
    return;
  }

  // 调整Canvas尺寸
  resizeCanvas();

  // 初始化模糊状态
  state.blurAmount = 0;
  blurState.targetBlurValue = 0;
  blurState.lastScrollTop = 0;

  // 加载并显示第一张图片
  if (state.backgrounds.length > 0) {
    try {
      state.currentImg = await loadImage(state.backgrounds[0]);
      render();

      // 异步更新第一张图片的主题色
      updateThemeFromBackground(state.backgrounds[0]);
    } catch (error) {
      console.error('[Carousel] 加载第一张图片失败:', error);
    }
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

  await initializeCanvas();
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
async function runReinitialization() {
  // 重新初始化Canvas
  await initializeCanvas();

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
export async function initBackgroundCarousel(backgrounds: string[]): Promise<void> {
  console.log('[Carousel] 初始化背景轮播组件');
  if (!isInitialized) {
    // 首次初始化
    isInitialized = true;
    await runInitialSetup(backgrounds);
    // 注册全局清理任务，确保页面卸载时正确清理资源
    registerGlobalCleanup(destroyCarousel);
  } else {
    // 重新初始化
    await runReinitialization();
  }
}

/**
 * 完整销毁轮播组件
 *
 * 清理所有相关资源，包括定时器、事件监听器、动画等。
 * 确保没有内存泄漏，适用于页面卸载或组件销毁时调用。
 *
 * @public
 */
export function destroyCarousel(): void {
  if (!isInitialized) return;

  // 清理定时器，停止自动切换
  if (state.timerRef) clearInterval(state.timerRef);

  // 清理过渡动画
  if (state.transitionAnimationId) {
    cancelAnimationFrame(state.transitionAnimationId);
  }

  // 移除事件监听器
  offEvents('background-carousel-scroll');
  offPageVisibilityChange('background-carousel');
  window.removeEventListener('resize', handleResize);

  // 清理Canvas
  if (state.canvas && state.ctx) {
    state.ctx.clearRect(0, 0, state.canvas.width, state.canvas.height);
  }

  // 清理缓存数据
  imageCache.clear();

  // 重置所有状态到初始值
  Object.assign(state, {
    canvas: null,
    ctx: null,
    currentIndex: 0,
    backgrounds: [],
    timerRef: null,
    currentImg: null,
    nextImg: null,
    isPaused: false,
    originalTitle: '',
    allThemeColorsExtracted: false,
    blurAmount: 0,
    isSwitching: false,
    transitionOpacity: 0,
    transitionAnimationId: null,
  });

  // 重置模糊状态
  Object.assign(blurState, {
    isAnimating: false,
    targetBlurValue: 0,
    step: 0.1,
    lastScrollTop: 0,
  });

  // 标记为未初始化状态
  isInitialized = false;
}
