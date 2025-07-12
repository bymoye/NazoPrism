import { themeManager } from '../utils/theme-manager';
import { offEvents, onScroll } from './global-event-manager';
import { offPageVisibilityChange, onPageVisibilityChange } from './page-visibility-manager';
import { registerGlobalCleanup } from './cleanup-manager';

interface CarouselState {
  currentIndex: number;
  isTransitioning: boolean;
  backgrounds: string[];
  currentBlur: number;
  blurTarget: number;
  timerRef: number | null;
  activeLayer: 1 | 2;
  bgLayer1: HTMLElement | null;
  bgLayer2: HTMLElement | null;
  animationFrameId: number | null;
  isPaused: boolean;
  originalTitle: string;
  allThemeColorsExtracted: boolean;
  isRenderLoopActive: boolean;
}

interface ImageCacheData {
  isLoaded: boolean;
  blob?: Blob;
  blobUrl?: string;
  themeColor?: number;
}

const CONFIG = {
  SCROLL_THRESHOLD: 100,
  MAX_BLUR: 8,
  MIN_BLUR: 0,
  SWITCH_INTERVAL: 10000,
  TRANSITION_DURATION: 1500,
};

const state: CarouselState = {
  currentIndex: 0,
  isTransitioning: false,
  backgrounds: [],
  currentBlur: 0,
  blurTarget: 0,
  timerRef: null,
  activeLayer: 1,
  bgLayer1: null,
  bgLayer2: null,
  animationFrameId: null,
  isPaused: false,
  originalTitle: '',
  allThemeColorsExtracted: false,
  isRenderLoopActive: false,
};

const imageCache = new Map<string, ImageCacheData>();
const activeAnimations = new Map<HTMLElement | string, number>();
let isInitialized = false;

// --- 2. 内部核心逻辑 ---

function easeInOut(t: number): number {
  return t < 0.5 ? 2 * t * t : -1 + (4 - 2 * t) * t;
}

async function preloadImage(url: string): Promise<void> {
  if (imageCache.has(url)) return;
  try {
    const response = await fetch(url);
    if (!response.ok) throw new Error(`Fetch failed: ${response.status}`);
    const blob = await response.blob();
    const blobUrl = URL.createObjectURL(blob);
    const img = new Image();
    img.src = blobUrl;
    await img.decode();
    imageCache.set(url, { isLoaded: true, blob, blobUrl });
  } catch (error) {
    console.error(`[Carousel] Failed to preload image ${url}:`, error);
  }
}

function setBackgroundImage(element: HTMLElement, url: string): void {
  const finalUrl = imageCache.get(url)?.blobUrl || url;
  Object.assign(element.style, {
    backgroundImage: `url(${finalUrl})`,
    backgroundSize: 'cover',
    backgroundPosition: 'center center',
    filter: `blur(${state.currentBlur}px)`,
  });
}

const updateBlurEffect = () => {
  const blurVal = `blur(${state.currentBlur.toFixed(2)}px)`;
  if (state.bgLayer1) state.bgLayer1.style.filter = blurVal;
  if (state.bgLayer2) state.bgLayer2.style.filter = blurVal;
};

const renderLoop = () => {
  const blurDiff = state.blurTarget - state.currentBlur;
  if (Math.abs(blurDiff) < 0.01) {
    if (state.currentBlur !== state.blurTarget) {
      state.currentBlur = state.blurTarget;
      updateBlurEffect();
    }
    state.isRenderLoopActive = false;
    return;
  }
  state.currentBlur += blurDiff * 0.1;
  updateBlurEffect();
  state.animationFrameId = requestAnimationFrame(renderLoop);
};

const handleScroll = () => {
  const scrollTop = document.documentElement.scrollTop;
  const newBlurTarget = scrollTop > CONFIG.SCROLL_THRESHOLD ? CONFIG.MAX_BLUR : CONFIG.MIN_BLUR;
  if (state.blurTarget === newBlurTarget) return;
  state.blurTarget = newBlurTarget;
  if (!state.isRenderLoopActive) {
    state.isRenderLoopActive = true;
    state.animationFrameId = requestAnimationFrame(renderLoop);
  }
};

function animate(
  target: HTMLElement,
  start: number,
  end: number,
  duration: number,
  onUpdate: (v: number) => void,
  onComplete?: () => void,
) {
  const prevAnim = activeAnimations.get(target);
  if (prevAnim) cancelAnimationFrame(prevAnim);
  const startTime = performance.now();
  const frame = (time: number) => {
    const progress = Math.min((time - startTime) / duration, 1);
    onUpdate(start + (end - start) * easeInOut(progress));
    if (progress < 1) {
      activeAnimations.set(target, requestAnimationFrame(frame));
    } else {
      activeAnimations.delete(target);
      onComplete?.();
    }
  };
  activeAnimations.set(target, requestAnimationFrame(frame));
}

async function switchBackground() {
  if (state.isTransitioning || state.backgrounds.length <= 1 || state.isPaused) return;

  state.isTransitioning = true;
  try {
    const nextIndex = (state.currentIndex + 1) % state.backgrounds.length;
    const currentLayer = state.activeLayer === 1 ? state.bgLayer1 : state.bgLayer2;
    const nextLayer = state.activeLayer === 1 ? state.bgLayer2 : state.bgLayer1;
    if (!currentLayer || !nextLayer) throw new Error('Layers not found');

    await preloadImage(state.backgrounds[nextIndex]);
    setBackgroundImage(nextLayer, state.backgrounds[nextIndex]);
    updateThemeFromBackground(state.backgrounds[nextIndex]);

    animate(
      nextLayer,
      0,
      1,
      CONFIG.TRANSITION_DURATION,
      value => (nextLayer.style.opacity = String(value)),
    );
    animate(
      currentLayer,
      1,
      0,
      CONFIG.TRANSITION_DURATION,
      value => (currentLayer.style.opacity = String(value)),
      () => {
        state.currentIndex = nextIndex;
        state.activeLayer = state.activeLayer === 1 ? 2 : 1;
        state.isTransitioning = false;
      },
    );
  } catch (e) {
    console.error('[Carousel] Failed to switch background:', e);
    state.isTransitioning = false;
  }
}

async function updateThemeFromBackground(imageUrl: string) {
  const isDark = themeManager.prefersDarkMode();
  const cachedColor = imageCache.get(imageUrl)?.themeColor;
  if (cachedColor !== undefined) {
    await themeManager.updateThemeFromColor(cachedColor, isDark);
    return;
  }
  try {
    const color = await themeManager.updateThemeFromImage(imageUrl, isDark);
    if (color !== undefined) {
      const existing = imageCache.get(imageUrl) || { isLoaded: false };
      imageCache.set(imageUrl, { ...existing, themeColor: color });
      checkAndShutdownWorker();
    }
  } catch {
    themeManager.applyTheme(themeManager.generateTheme(0xff6750a4, isDark));
  }
}

function checkAndShutdownWorker() {
  if (state.allThemeColorsExtracted) return;
  const allExtracted = state.backgrounds.every(
    url => imageCache.get(url)?.themeColor !== undefined,
  );
  if (allExtracted) {
    state.allThemeColorsExtracted = true;
    themeManager.shutdown();
    console.log('🎨 所有背景图主题色提取完成，已关闭颜色提取Worker以节省资源');
  }
}

const startTimer = () => {
  if (state.timerRef) clearInterval(state.timerRef);
  if (!state.isPaused)
    state.timerRef = window.setInterval(switchBackground, CONFIG.SWITCH_INTERVAL);
};
const pauseCarousel = () => {
  state.isPaused = true;
  if (state.timerRef) clearInterval(state.timerRef);
  state.timerRef = null;
  document.title = '等你回来~ | ' + state.originalTitle;
};
const resumeCarousel = () => {
  state.isPaused = false;
  document.title = state.originalTitle;
  startTimer();
};

function setupEventListeners() {
  offEvents('background-carousel');
  offPageVisibilityChange('background-carousel');
  onScroll('background-carousel', handleScroll);
  onPageVisibilityChange('background-carousel', pauseCarousel, resumeCarousel);
  startTimer();
}

async function runInitialSetup(backgrounds: string[]) {
  state.backgrounds = backgrounds;
  state.originalTitle = document.title;
  state.bgLayer1 = document.getElementById('bg-layer-1');
  state.bgLayer2 = document.getElementById('bg-layer-2');
  if (!state.bgLayer1 || !state.bgLayer2) return;

  if (state.backgrounds.length > 0) {
    await preloadImage(state.backgrounds[0]);
    if (state.backgrounds.length > 1) await preloadImage(state.backgrounds[1]);

    const activeLayer = state.activeLayer === 1 ? state.bgLayer1 : state.bgLayer2;
    setBackgroundImage(activeLayer, state.backgrounds[0]);
    await updateThemeFromBackground(state.backgrounds[0]);
    activeLayer.style.opacity = '1';
  }

  setupEventListeners();
  handleScroll();
  if (state.backgrounds.length > 2) {
    // 浏览器主线程空闲时，才去预加载剩余的图片
    requestIdleCallback(
      () => {
        state.backgrounds.slice(2).forEach(preloadImage);
      },
      { timeout: 2000 },
    );
  }
}

function runReinitialization() {
  state.bgLayer1 = document.getElementById('bg-layer-1');
  state.bgLayer2 = document.getElementById('bg-layer-2');
  if (!state.bgLayer1 || !state.bgLayer2) return;

  const currentBgUrl = state.backgrounds[state.currentIndex];
  const activeLayer = state.activeLayer === 1 ? state.bgLayer1 : state.bgLayer2;
  const inactiveLayer = state.activeLayer === 1 ? state.bgLayer2 : state.bgLayer1;
  if (activeLayer && currentBgUrl) {
    setBackgroundImage(activeLayer, currentBgUrl);
    activeLayer.style.opacity = '1';
  }
  if (inactiveLayer) inactiveLayer.style.opacity = '0';

  setupEventListeners();
  handleScroll();
}

export function getCachedImageBlob(url: string): Blob | undefined {
  return imageCache.get(url)?.blob;
}

/**
 * 初始化背景轮播。这是此模块的唯一入口。
 * @param backgrounds 要轮播的背景图片 URL 数组。
 */
export function initBackgroundCarousel(backgrounds: string[]): void {
  if (!isInitialized) {
    isInitialized = true;
    runInitialSetup(backgrounds);
    // 职责明确：自己注册自己的全局清理任务
    registerGlobalCleanup(destroyCarousel);
  } else {
    runReinitialization();
  }
}

/**
 * 完整的销毁函数，用于全局清理。
 */
export function destroyCarousel(): void {
  if (!isInitialized) return;

  // 清理所有定时器和动画帧
  if (state.timerRef) clearInterval(state.timerRef);
  if (state.animationFrameId) cancelAnimationFrame(state.animationFrameId);

  // 清理所有事件监听器
  offEvents('background-carousel');
  offPageVisibilityChange('background-carousel');

  // 清理 Blob URL 释放内存
  imageCache.forEach(cache => {
    if (cache.blobUrl) URL.revokeObjectURL(cache.blobUrl);
  });
  imageCache.clear();

  // 重置状态
  isInitialized = false;
}
