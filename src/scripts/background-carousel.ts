import { themeManager } from '../utils/theme-manager';
import { offPageVisibilityChange, onPageVisibilityChange } from './page-visibility-manager';
import { registerGlobalCleanup } from './cleanup-manager';
import { offEvents, onScroll } from './global-event-manager';

/**
 * 轮播组件的状态接口
 */
interface CarouselState {
  /** 背景容器元素 */
  backgroundContainer: HTMLElement | null;
  /** 第一个图片元素 */
  img1: HTMLImageElement | null;
  /** 第二个图片元素 */
  img2: HTMLImageElement | null;
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
  /** 最大模糊值 */
  MAX_BLUR: '5px',
  /** 最小模糊值（无模糊） */
  MIN_BLUR: 'none',
  /** 自动切换间隔时间（毫秒） */
  SWITCH_INTERVAL: 10000,
};

/**
 * 轮播组件的全局状态
 */
const state: CarouselState = {
  currentIndex: 0,
  backgrounds: [],
  timerRef: null,
  img1: null,
  img2: null,
  isPaused: false,
  originalTitle: '',
  allThemeColorsExtracted: false,
  backgroundContainer: null,
};

/** 图片缓存映射，存储图片数据和主题色 */
const imageCache = new Map<string, ImageCacheData>();
/** 模块是否已初始化 */
let isInitialized = false;

// --- 核心逻辑函数 ---

/**
 * 处理页面滚动事件，根据滚动位置应用模糊效果
 */
const handleScroll = () => {
  const scrollTop = document.documentElement.scrollTop || document.body.scrollTop;
  if (state.backgroundContainer) {
    // 当滚动超过阈值时应用模糊效果，否则移除模糊
    state.backgroundContainer.style.filter =
      scrollTop > CONFIG.SCROLL_THRESHOLD ? `blur(${CONFIG.MAX_BLUR})` : CONFIG.MIN_BLUR;
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
 * 实现两个img元素之间的切换显示
 */
function switchBackground() {
  // 检查切换条件：图片数量、暂停状态、元素存在性
  if (state.backgrounds.length <= 1 || state.isPaused || !state.img1 || !state.img2) return;
  const nextIndex = (state.currentIndex + 1) % state.backgrounds.length;
  // 确定当前显示的图片和下一个要显示的图片
  const currentImg = state.img1.hidden ? state.img2 : state.img1;
  const nextImg = currentImg === state.img1 ? state.img2 : state.img1;

  // 设置下一张图片的URL
  nextImg.src = state.backgrounds[nextIndex];

  // 更新主题色
  updateThemeFromBackground(state.backgrounds[nextIndex]);

  // 切换显示/隐藏状态
  currentImg.hidden = true;
  nextImg.hidden = false;

  // 更新当前索引
  state.currentIndex = nextIndex;
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
 * 创建图片元素并添加到容器中
 */
function createImageElements() {
  if (!state.backgroundContainer) return;

  // 创建两个img元素用于轮播切换
  state.img1 = document.createElement('img');
  state.img2 = document.createElement('img');

  // 设置初始图片源
  if (state.backgrounds.length > 0) {
    state.img1.src = state.backgrounds[0];
    // 异步更新第一张图片的主题色
    updateThemeFromBackground(state.backgrounds[0]);
  }
  if (state.backgrounds.length > 1) {
    state.img2.src = state.backgrounds[1];
  }

  // 初始状态：显示第一张，隐藏第二张
  state.img2.hidden = true;

  // 将图片元素添加到容器中
  state.backgroundContainer.appendChild(state.img1);
  state.backgroundContainer.appendChild(state.img2);
}

/**
 * 执行初始化设置
 * @param backgrounds - 背景图片URL数组
 */
async function runInitialSetup(backgrounds: string[]) {
  // 保存背景图片列表和原始标题
  state.backgrounds = backgrounds;
  state.originalTitle = document.title;

  // 查找背景容器元素
  state.backgroundContainer = document.querySelector('#bg-carousel-container');

  if (!state.backgroundContainer) {
    console.error('[Carousel] Background container #bg-carousel-container not found');
    return;
  }

  // 创建图片元素并设置事件监听器
  createImageElements();
  setupEventListeners();
  handleScroll();

  // 预加载主题色：为所有背景图初始化缓存并开始主题色提取
  if (backgrounds.length > 0) {
    backgrounds.forEach(url => {
      if (!imageCache.has(url)) {
        imageCache.set(url, { isLoaded: false });
        updateThemeFromBackground(url);
      }
    });
  }
}

/**
 * 执行重新初始化
 * 用于页面重新加载或组件重新挂载时
 */
function runReinitialization() {
  // 重新获取背景容器元素
  state.backgroundContainer = document.querySelector('#bg-carousel-container');
  if (!state.backgroundContainer) return;

  // 清空容器内容并重新创建图片元素
  state.backgroundContainer.innerHTML = '';
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

  // 清理DOM元素
  if (state.backgroundContainer) {
    state.backgroundContainer.innerHTML = '';
  }

  // 清理缓存数据
  imageCache.clear();

  // 重置所有状态到初始值
  Object.assign(state, {
    currentIndex: 0,
    backgrounds: [],
    timerRef: null,
    img1: null,
    img2: null,
    isPaused: false,
    originalTitle: '',
    allThemeColorsExtracted: false,
    backgroundContainer: null,
  });

  // 标记为未初始化状态
  isInitialized = false;
}
