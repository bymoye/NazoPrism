import ThemeManager from '../utils/theme-manager';
import { onScroll } from './global-event-manager';

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

// 背景轮播管理器
// 图片缓存数据结构
interface ImageCacheData {
    isLoaded: boolean;
    blob?: Blob;
    themeColor?: number;
}

export class BackgroundCarouselManager {
    private state: CarouselState;
    private imageCache = new Map<string, ImageCacheData>(); // 合并的缓存结构
    private activeAnimations = new Map<HTMLElement, number>();
    private blurAnimationId: number | null = null;
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
        };
        this.themeManager = ThemeManager.getInstance();

        // 将实例暴露到全局，以便 ThemeManager 可以访问缓存的 Blob 数据
        (window as any).backgroundCarouselManager = this;
    }





    // 预加载图片并缓存 Blob 数据用于 Worker
    private async preloadImage(url: string): Promise<void> {
        const cached = this.imageCache.get(url);
        if (cached?.isLoaded) {
            return Promise.resolve();
        }

        try {
            // 使用 fetch 获取图片数据，这样可以同时缓存 Blob
            const response = await fetch(url);
            if (!response.ok) return;

            const blob = await response.blob();

            // 创建 Image 对象用于显示（从 Blob 创建 URL）
            const imageUrl = URL.createObjectURL(blob);
            const img = new Image();

            return new Promise<void>((resolve) => {
                img.onload = () => {
                    // 更新合并的缓存结构
                    this.imageCache.set(url, {
                        isLoaded: true,
                        blob: blob,
                        themeColor: cached?.themeColor
                    });
                    resolve();
                };
                img.onerror = () => resolve();
                img.src = imageUrl;
            });
        } catch (error) {
            // 静默处理错误
        }
    }

    // 获取缓存的图片 Blob 数据
    getCachedImageBlob(url: string): Blob | undefined {
        return this.imageCache.get(url)?.blob;
    }

    // 获取缓存的主题色
    getCachedThemeColor(url: string): number | undefined {
        return this.imageCache.get(url)?.themeColor;
    }

    // 设置主题色缓存
    setCachedThemeColor(url: string, color: number): void {
        const existing = this.imageCache.get(url) || { isLoaded: false };
        this.imageCache.set(url, {
            ...existing,
            themeColor: color
        });
    }

    // 检查是否有缓存的主题色
    hasThemeColorCache(url: string): boolean {
        return this.imageCache.get(url)?.themeColor !== undefined;
    }



    // 设置背景图片
    private setBackgroundImage(element: HTMLElement, url: string): void {
        element.style.backgroundImage = `url(${url})`;
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

    // JS动画函数
    private animateOpacity(
        element: HTMLElement,
        startOpacity: number,
        endOpacity: number,
        duration: number,
        callback?: () => void
    ): void {
        // 取消该元素之前的动画
        const prevAnimation = this.activeAnimations.get(element);
        if (prevAnimation) {
            cancelAnimationFrame(prevAnimation);
        }

        let startTime = performance.now();
        const deltaOpacity = endOpacity - startOpacity;

        const animate = (currentTime: number) => {
            const elapsed = currentTime - startTime;
            const progress = Math.min(elapsed / duration, 1);
            const easedProgress = easeInOut(progress);

            const currentOpacity = startOpacity + deltaOpacity * easedProgress;
            element.style.opacity = currentOpacity.toString();

            if (progress < 1) {
                const frameId = requestAnimationFrame(animate);
                this.activeAnimations.set(element, frameId);
            } else {
                this.activeAnimations.delete(element);
                if (callback) callback();
            }
        };

        const frameId = requestAnimationFrame(animate);
        this.activeAnimations.set(element, frameId);
    }

    // 背景切换
    private async switchBackground(): Promise<void> {
        if (this.state.isTransitioning || this.state.backgrounds.length <= 1) {
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

    // 从背景图片更新主题 - 确保主题变换不被打断
    private updateThemeFromBackground(imageUrl: string): void {
        const isDark = this.themeManager.prefersDarkMode();

        const cachedColor = this.getCachedThemeColor(imageUrl);
        if (cachedColor !== undefined) {
            this.themeManager.updateThemeFromColor(cachedColor, isDark);
            return;
        }

        this.themeManager.updateThemeFromImage(imageUrl, isDark)
            .then((extractedColor) => {
                if (extractedColor !== undefined) {
                    this.setCachedThemeColor(imageUrl, extractedColor);
                }
            })
            .catch(() => {
                // 静默处理错误
            });
    }

    // 同步版本的主题更新 - 返回Promise以便等待完成
    private async updateThemeFromBackgroundSync(imageUrl: string): Promise<void> {
        const isDark = this.themeManager.prefersDarkMode();

        const cachedColor = this.getCachedThemeColor(imageUrl);
        if (cachedColor !== undefined) {
            await this.themeManager.updateThemeFromColor(cachedColor, isDark);
            return;
        }

        try {
            const extractedColor = await this.themeManager.updateThemeFromImage(imageUrl, isDark);
            if (extractedColor !== undefined) {
                this.setCachedThemeColor(imageUrl, extractedColor);
            }
        } catch (error) {
            // 静默处理错误，使用默认主题
            const defaultTheme = this.themeManager.generateTheme(0xFF6750A4, isDark);
            this.themeManager.applyTheme(defaultTheme);
        }
    }

    // 模糊效果动画
    private animateBlur(targetBlur: number): void {
        if (this.blurAnimationId) {
            cancelAnimationFrame(this.blurAnimationId);
        }

        const startBlur = this.state.currentBlur;
        const deltaBlur = targetBlur - startBlur;
        const startTime = performance.now();
        const duration = 300;

        const animate = (currentTime: number) => {
            const elapsed = currentTime - startTime;
            const progress = Math.min(elapsed / duration, 1);
            const easedProgress = easeInOut(progress);

            this.state.currentBlur = startBlur + deltaBlur * easedProgress;
            this.updateBlurEffect();

            if (progress < 1) {
                this.blurAnimationId = requestAnimationFrame(animate);
            } else {
                this.blurAnimationId = null;

            }
        };

        this.blurAnimationId = requestAnimationFrame(animate);
    }

    // 处理滚动
    private handleScroll = (): void => {
        const scrollTop = document.documentElement.scrollTop || document.body.scrollTop;
        const targetBlur = scrollTop > CONFIG.SCROLL_THRESHOLD ? CONFIG.MAX_BLUR : CONFIG.MIN_BLUR;

        if (Math.abs(targetBlur - this.state.currentBlur) > 0.1) {
            this.animateBlur(targetBlur);
        }
    };

    // 启动定时器
    private startTimer(): void {
        if (this.state.timerRef) clearInterval(this.state.timerRef);
        this.state.timerRef = window.setInterval(
            () => this.switchBackground(),
            CONFIG.SWITCH_INTERVAL
        );
    }

    // 设置事件监听器和启动定时器
    private setupEventListeners(): void {
        // 使用全局事件管理器添加事件监听
        onScroll('background-carousel', this.handleScroll);

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
                this.updateThemeFromBackgroundSync(currentBgUrl).then(() => {
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

        // 重新处理当前滚动状态
        this.handleScroll();

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