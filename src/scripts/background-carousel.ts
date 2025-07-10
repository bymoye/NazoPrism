import ThemeManager from '../utils/theme-manager';
import { onScroll } from './global-event-manager';
import { onPageVisibilityChange } from './page-visibility-manager';

// 背景轮播状态管理
interface CarouselState {
    currentIndex: number;
    isTransitioning: boolean;
    backgrounds: string[];
    currentBlur: number;
    timerRef: number | null;
    activeLayer: 1 | 2;
    bgLayer1: HTMLElement | null;
    bgLayer2: HTMLElement | null;
    animationFrameId: number | null;
    isPaused: boolean;
    originalTitle: string;
    allThemeColorsExtracted: boolean;
}



// 配置常量
const CONFIG = {
    SCROLL_THRESHOLD: 100,
    BLUR_DELTA: 0.1,
    MAX_BLUR: 8,
    MIN_BLUR: 0,
    SWITCH_INTERVAL: 5000,
    TRANSITION_DURATION: 1500,
};

// 缓动函数 - ease-in-out
function easeInOut(t: number): number {
    return t < 0.5 ? 2 * t * t : -1 + (4 - 2 * t) * t;
}
// 图片缓存数据结构
interface ImageCacheData {
    isLoaded: boolean;
    blob?: Blob;
    blobUrl?: string;
    themeColor?: number;
}
// 背景轮播管理器
export class BackgroundCarouselManager {
    private state: CarouselState;
    private imageCache = new Map<string, ImageCacheData>(); // 合并的缓存结构
    private activeAnimations = new Map<HTMLElement | string, number>(); // 支持元素和全局动画
    private themeManager: ThemeManager;

    constructor(backgrounds: string[]) {
        this.state = {
            currentIndex: 0,
            isTransitioning: false,
            backgrounds,
            currentBlur: 0,
            timerRef: null,
            activeLayer: 1,
            bgLayer1: null,
            bgLayer2: null,
            animationFrameId: null,
            isPaused: false,
            originalTitle: document.title,
            allThemeColorsExtracted: false,
        };
        this.themeManager = ThemeManager.getInstance();

        // 将实例暴露到全局，以便 ThemeManager 可以访问缓存的 Blob 数据
        (window as any).backgroundCarouselManager = this;
    }





    // 预加载图片并缓存 Blob 数据用于后续所有操作
    private async preloadImage(url: string): Promise<void> {
        const cached = this.imageCache.get(url);
        if (cached?.isLoaded) {
            return Promise.resolve();
        }

        try {
            // 使用 fetch 获取图片数据，创建 blob 和 blob URL
            const response = await fetch(url);
            if (!response.ok) return;

            const blob = await response.blob();
            const blobUrl = URL.createObjectURL(blob);

            // 创建 Image 对象验证图片可用性
            const img = new Image();

            return new Promise<void>((resolve) => {
                img.onload = () => {
                    // 缓存 blob 和 blob URL
                    this.imageCache.set(url, {
                        isLoaded: true,
                        blob: blob,
                        blobUrl: blobUrl,
                        themeColor: cached?.themeColor
                    });
                    resolve();
                };
                img.onerror = () => {
                    // 清理失败的 blob URL
                    URL.revokeObjectURL(blobUrl);
                    resolve();
                };
                img.src = blobUrl;
            });
        } catch (error) {
            // 静默处理错误
        }
    }

    // 获取缓存的图片 Blob 数据
    getCachedImageBlob(url: string): Blob | undefined {
        return this.imageCache.get(url)?.blob;
    }

    // 获取缓存的 Blob URL
    getCachedBlobUrl(url: string): string | undefined {
        return this.imageCache.get(url)?.blobUrl;
    }



    // 设置主题色缓存
    setCachedThemeColor(url: string, color: number): void {
        const existing = this.imageCache.get(url) || { isLoaded: false };
        this.imageCache.set(url, {
            ...existing,
            themeColor: color
        });

        // 检查是否所有主题色都已提取完成
        this.checkAndShutdownWorker();
    }

    // 检查是否有缓存的主题色
    hasThemeColorCache(url: string): boolean {
        return this.imageCache.get(url)?.themeColor !== undefined;
    }



    // 设置背景图片 - 优先使用缓存的 blob URL
    private setBackgroundImage(element: HTMLElement, url: string): void {
        // 优先使用缓存的 blob URL
        const blobUrl = this.getCachedBlobUrl(url);
        const finalUrl = blobUrl || url;

        element.style.backgroundImage = `url(${finalUrl})`;
        element.style.filter = `blur(${this.state.currentBlur}px)`;
    }

    // 更新模糊效果
    private updateBlurEffect(): void {
        if (this.state.bgLayer1) {
            this.state.bgLayer1.style.filter = `blur(${this.state.currentBlur}px)`;
        }
        if (this.state.bgLayer2) {
            this.state.bgLayer2.style.filter = `blur(${this.state.currentBlur}px)`;
        }
    }

    // 简单的通用动画函数
    private animate(
        target: HTMLElement | string,
        startValue: number,
        endValue: number,
        duration: number,
        updateCallback: (value: number) => void,
        callback?: () => void
    ): void {
        // 取消之前的动画
        const prevAnimation = this.activeAnimations.get(target);
        if (prevAnimation) {
            cancelAnimationFrame(prevAnimation);
        }

        const startTime = performance.now();
        const deltaValue = endValue - startValue;

        const animateFrame = (currentTime: number) => {
            const elapsed = currentTime - startTime;
            const progress = Math.min(elapsed / duration, 1);
            const easedProgress = easeInOut(progress);

            const currentValue = startValue + deltaValue * easedProgress;
            updateCallback(currentValue);

            if (progress < 1) {
                const frameId = requestAnimationFrame(animateFrame);
                this.activeAnimations.set(target, frameId);
            } else {
                this.activeAnimations.delete(target);
                if (callback) callback();
            }
        };

        const frameId = requestAnimationFrame(animateFrame);
        this.activeAnimations.set(target, frameId);
    }

    // 透明度动画
    private animateOpacity(
        element: HTMLElement,
        startOpacity: number,
        endOpacity: number,
        duration: number,
        callback?: () => void
    ): void {
        this.animate(
            element,
            startOpacity,
            endOpacity,
            duration,
            (value) => {
                element.style.opacity = value.toString();
            },
            callback
        );
    }

    // 背景切换
    private async switchBackground(): Promise<void> {
        if (this.state.isTransitioning || this.state.backgrounds.length <= 1 || this.state.isPaused) {
            return;
        }

        try {
            this.state.isTransitioning = true;
            const nextIndex = (this.state.currentIndex + 1) % this.state.backgrounds.length;

            const currentLayer = this.state.activeLayer === 1 ? this.state.bgLayer1 : this.state.bgLayer2;
            const nextLayer = this.state.activeLayer === 1 ? this.state.bgLayer2 : this.state.bgLayer1;

            if (!currentLayer || !nextLayer) {
                this.state.isTransitioning = false;
                return;
            }

            // 预加载下一张图片
            await this.preloadImage(this.state.backgrounds[nextIndex]);
            this.setBackgroundImage(nextLayer, this.state.backgrounds[nextIndex]);

            // 立即开始主题更新，确保与背景切换同步
            this.updateThemeFromBackground(this.state.backgrounds[nextIndex]);

            // 使用JS动画进行过渡
            this.animateOpacity(nextLayer, 0, 1, CONFIG.TRANSITION_DURATION, undefined);
            this.animateOpacity(currentLayer, 1, 0, CONFIG.TRANSITION_DURATION, () => {
                this.state.currentIndex = nextIndex;
                this.state.activeLayer = this.state.activeLayer === 1 ? 2 : 1;
                this.state.isTransitioning = false;


            });
        } catch (error) {
            this.state.isTransitioning = false;
            this.startTimer();
        }
    }

    // 从背景图片更新主题
    private async updateThemeFromBackground(imageUrl: string): Promise<void> {
        const isDark = this.themeManager.prefersDarkMode();

        // 检查缓存
        const cachedColor = this.getCachedThemeColor(imageUrl);
        if (cachedColor !== undefined) {
            await this.themeManager.updateThemeFromColor(cachedColor, isDark);
            return;
        }

        // 提取新颜色
        try {
            const extractedColor = await this.themeManager.updateThemeFromImage(imageUrl, isDark);
            if (extractedColor !== undefined) {
                this.setCachedThemeColor(imageUrl, extractedColor);
            }
        } catch (error) {
            // 使用默认主题
            const defaultTheme = this.themeManager.generateTheme(0xFF6750A4, isDark);
            this.themeManager.applyTheme(defaultTheme);
        }
    }

    // 模糊效果动画
    private animateBlur(targetBlur: number): void {
        this.animate(
            'blur-effect', // 使用字符串键避免冲突
            this.state.currentBlur,
            targetBlur,
            300,
            (value) => {
                this.state.currentBlur = value;
                this.updateBlurEffect();
            }
        );
    }

    // 处理滚动
    private handleScroll = (): void => {
        const scrollTop = document.documentElement.scrollTop || document.body.scrollTop;
        const targetBlur = scrollTop > CONFIG.SCROLL_THRESHOLD ? CONFIG.MAX_BLUR : CONFIG.MIN_BLUR;
        const blurDifference = Math.abs(targetBlur - this.state.currentBlur);

        if (blurDifference > 0.5) {
            this.animateBlur(targetBlur);
        }
    };

    // 启动定时器
    private startTimer(): void {
        if (this.state.timerRef) clearInterval(this.state.timerRef);
        if (!this.state.isPaused) {
            this.state.timerRef = window.setInterval(
                () => this.switchBackground(),
                CONFIG.SWITCH_INTERVAL
            );
        }
    }

    // 暂停背景切换
    private pauseCarousel(): void {
        this.state.isPaused = true;
        if (this.state.timerRef) {
            clearInterval(this.state.timerRef);
            this.state.timerRef = null;
        }
        // 更改网站标题
        document.title = "🌸 等你回来~ | " + this.state.originalTitle;
    }

    // 恢复背景切换
    private resumeCarousel(): void {
        this.state.isPaused = false;
        // 恢复原始标题
        document.title = this.state.originalTitle;
        this.startTimer();
    }

    // 检查并可能关闭Worker
    private checkAndShutdownWorker(): void {
        if (this.state.allThemeColorsExtracted) return;

        const allExtracted = this.state.backgrounds.every(url =>
            this.getCachedThemeColor(url) !== undefined
        );

        if (allExtracted) {
            this.state.allThemeColorsExtracted = true;
            this.themeManager.shutdownWorker();
            console.log('🎨 所有背景图主题色提取完成，已关闭颜色提取Worker以节省资源');
        }
    }

    // 设置事件监听器和启动定时器
    private setupEventListeners(): void {
        // 使用全局事件管理器添加事件监听
        onScroll('background-carousel', this.handleScroll);

        // 注册页面可见性变化监听
        onPageVisibilityChange(
            'background-carousel',
            () => this.pauseCarousel(),
            () => this.resumeCarousel()
        );

        this.startTimer();
    }

    public async initialize(): Promise<void> {
        this.state.bgLayer1 = document.getElementById("bg-layer-1");
        this.state.bgLayer2 = document.getElementById("bg-layer-2");

        if (!this.state.bgLayer1 || !this.state.bgLayer2) {
            return;
        }

        const hasExistingBackground = this.state.bgLayer1.style.backgroundImage ||
            this.state.bgLayer2.style.backgroundImage;

        if (hasExistingBackground) {
            const themeInfo = this.themeManager.getPersistedThemeInfo();
            if (!themeInfo.hasTheme) {
                const currentBgUrl = this.state.backgrounds[this.state.currentIndex];
                this.updateThemeFromBackground(currentBgUrl);
            }
            this.setupEventListeners();
            return;
        }

        // 预加载当前和下一张图片
        const preloadPromises: Promise<void>[] = [];
        if (this.state.backgrounds.length > 0) {
            preloadPromises.push(this.preloadImage(this.state.backgrounds[0]));
            if (this.state.backgrounds.length > 1) {
                preloadPromises.push(this.preloadImage(this.state.backgrounds[1]));
            }
        }

        await Promise.all(preloadPromises);

        // 设置初始背景（考虑恢复的状态）
        if (this.state.backgrounds.length > 0) {
            const currentBgUrl = this.state.backgrounds[this.state.currentIndex];
            const activeLayer = this.state.activeLayer === 1 ? this.state.bgLayer1 : this.state.bgLayer2;
            const inactiveLayer = this.state.activeLayer === 1 ? this.state.bgLayer2 : this.state.bgLayer1;

            if (activeLayer) {
                this.setBackgroundImage(activeLayer, currentBgUrl);

                // 先应用主题，再显示背景，避免闪烁
                this.updateThemeFromBackground(currentBgUrl).then(() => {
                    // 初始化时直接设置透明度，不播放动画
                    activeLayer.style.opacity = '1';
                });
            }

            // 预加载下一张背景到非活动层
            if (this.state.backgrounds.length > 1 && inactiveLayer) {
                const nextIndex = (this.state.currentIndex + 1) % this.state.backgrounds.length;
                this.setBackgroundImage(inactiveLayer, this.state.backgrounds[nextIndex]);
            }
        }

        // 设置事件监听器和启动定时器
        this.setupEventListeners();

        // 异步预加载剩余图片
        if (this.state.backgrounds.length > 2) {
            setTimeout(() => {
                this.state.backgrounds.slice(2).forEach((url) => this.preloadImage(url));
            }, 2000);
        }



    }

    public reinitialize(): void {
        this.state.bgLayer1 = document.getElementById("bg-layer-1");
        this.state.bgLayer2 = document.getElementById("bg-layer-2");

        if (!this.state.bgLayer1 || !this.state.bgLayer2) {
            return;
        }

        // 恢复当前背景状态
        if (this.state.backgrounds.length > 0) {
            const currentBgUrl = this.state.backgrounds[this.state.currentIndex];
            const activeLayer = this.state.activeLayer === 1 ? this.state.bgLayer1 : this.state.bgLayer2;
            const inactiveLayer = this.state.activeLayer === 1 ? this.state.bgLayer2 : this.state.bgLayer1;

            if (activeLayer) {
                this.setBackgroundImage(activeLayer, currentBgUrl);
                activeLayer.style.opacity = '1';
            }

            if (inactiveLayer) {
                const nextIndex = (this.state.currentIndex + 1) % this.state.backgrounds.length;
                this.setBackgroundImage(inactiveLayer, this.state.backgrounds[nextIndex]);
                inactiveLayer.style.opacity = '0';
            }

            const themeInfo = this.themeManager.getPersistedThemeInfo();
            if (!themeInfo.hasTheme || themeInfo.imageUrl !== currentBgUrl) {
                this.updateThemeFromBackground(currentBgUrl);
            }
        }

        // 重新注册滚动事件（确保在页面切换后正确绑定）
        onScroll('background-carousel', this.handleScroll);

        // 重新注册页面可见性变化监听
        onPageVisibilityChange(
            'background-carousel',
            () => this.pauseCarousel(),
            () => this.resumeCarousel()
        );

        // 重新处理当前滚动状态
        this.handleScroll();

    }

    // 获取缓存的主题色
    private getCachedThemeColor(imageUrl: string): number | undefined {
        return this.imageCache.get(imageUrl)?.themeColor;
    }
}

// 全局背景轮播管理器实例 - 覆盖整个页面生命周期，永不销毁
let carouselManager: BackgroundCarouselManager | null = null;

// 初始化背景轮播 - 只在首次调用时创建，之后保持持久化
export function initBackgroundCarousel(backgrounds: string[]): void {
    if (!carouselManager) {
        carouselManager = new BackgroundCarouselManager(backgrounds);
        carouselManager.initialize();
    } else {
        const bgLayer1 = document.getElementById("bg-layer-1") as HTMLElement;
        const bgLayer2 = document.getElementById("bg-layer-2") as HTMLElement;
        const hasPersistedContent = bgLayer1?.style.backgroundImage || bgLayer2?.style.backgroundImage;

        if (hasPersistedContent) {
            return;
        } else {
            carouselManager.reinitialize();
        }
    }
}