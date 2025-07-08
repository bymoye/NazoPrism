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

// 防抖函数
function debounce<T extends (...args: any[]) => void>(
    func: T,
    wait: number
): T {
    let timeout: ReturnType<typeof setTimeout>;
    return function (this: any, ...args: any[]) {
        clearTimeout(timeout);
        timeout = setTimeout(() => func.apply(this, args), wait);
    } as T;
}

// 背景轮播管理器
export class BackgroundCarouselManager {
    private state: CarouselState;
    private imageCache = new Map<string, boolean>();
    private activeAnimations = new Map<HTMLElement, number>();
    private blurAnimationId: number | null = null;
    private debouncedScroll: (() => void) | null = null;
    private isPaused: boolean = false;
    private pausedAnimations: Map<HTMLElement, { startTime: number; progress: number }> = new Map();

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
    }

    // 预加载图片
    private preloadImage(url: string): Promise<void> {
        if (this.imageCache.has(url)) {
            return Promise.resolve();
        }

        return new Promise((resolve) => {
            const img = new Image();
            img.src = url;
            img.onload = () => {
                this.imageCache.set(url, true);
                resolve();
            };
            img.onerror = () => resolve();
        });
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

        // 检查是否有暂停的动画状态
        const pausedState = this.pausedAnimations.get(element);
        if (pausedState) {
            // 恢复动画，调整开始时间
            const elapsedBeforePause = pausedState.progress * duration;
            startTime = performance.now() - elapsedBeforePause;
            this.pausedAnimations.delete(element);
        }

        const animate = (currentTime: number) => {
            if (this.isPaused) {
                // 保存当前进度
                const elapsed = currentTime - startTime;
                const progress = Math.min(elapsed / duration, 1);
                this.pausedAnimations.set(element, { startTime, progress });
                return;
            }

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

        this.state.isTransitioning = true;
        const nextIndex = (this.state.currentIndex + 1) % this.state.backgrounds.length;

        const currentLayer =
            this.state.activeLayer === 1 ? this.state.bgLayer1 : this.state.bgLayer2;
        const nextLayer =
            this.state.activeLayer === 1 ? this.state.bgLayer2 : this.state.bgLayer1;

        if (!currentLayer || !nextLayer) {
            this.state.isTransitioning = false;
            return;
        }

        // 预加载下一张图片
        await this.preloadImage(this.state.backgrounds[nextIndex]);
        this.setBackgroundImage(nextLayer, this.state.backgrounds[nextIndex]);

        // 使用JS动画进行过渡
        this.animateOpacity(nextLayer, 0, 1, CONFIG.TRANSITION_DURATION, undefined);
        this.animateOpacity(currentLayer, 1, 0, CONFIG.TRANSITION_DURATION, () => {
            this.state.currentIndex = nextIndex;
            this.state.activeLayer = this.state.activeLayer === 1 ? 2 : 1;
            this.state.isTransitioning = false;
        });
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
            }
        };

        this.blurAnimationId = requestAnimationFrame(animate);
    }

    // 处理滚动
    private handleScroll = (): void => {
        const scrollTop =
            document.documentElement.scrollTop || document.body.scrollTop;
        const targetBlur =
            scrollTop > CONFIG.SCROLL_THRESHOLD ? CONFIG.MAX_BLUR : CONFIG.MIN_BLUR;

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

    // 停止定时器
    private stopTimer(): void {
        if (this.state.timerRef) {
            clearInterval(this.state.timerRef);
            this.state.timerRef = null;
        }
    }

    // 初始化
    public async initialize(): Promise<void> {
        // 获取元素引用
        this.state.bgLayer1 = document.getElementById("bg-layer-1");
        this.state.bgLayer2 = document.getElementById("bg-layer-2");

        if (!this.state.bgLayer1 || !this.state.bgLayer2) {
            console.error("Background layers not found");
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

        // 设置初始背景
        if (this.state.backgrounds.length > 0) {
            this.setBackgroundImage(this.state.bgLayer1, this.state.backgrounds[0]);
            this.animateOpacity(this.state.bgLayer1, 0, 1, 1000);

            if (this.state.backgrounds.length > 1 && this.state.bgLayer2) {
                this.setBackgroundImage(this.state.bgLayer2, this.state.backgrounds[1]);
            }
        }

        // 添加事件监听
        this.debouncedScroll = debounce(this.handleScroll, 50);
        window.addEventListener("scroll", this.debouncedScroll, { passive: true });

        // 处理页面可见性变化
        document.addEventListener("visibilitychange", () => {
            if (document.hidden) {
                this.pause();
            } else {
                this.resume();
            }
        });

        // 处理窗口焦点变化
        window.addEventListener("blur", () => {
            this.pause();
        });

        window.addEventListener("focus", () => {
            this.resume();
        });

        // 启动定时器
        this.startTimer();

        // 异步预加载剩余图片
        if (this.state.backgrounds.length > 2) {
            setTimeout(() => {
                this.state.backgrounds.slice(2).forEach((url) => this.preloadImage(url));
            }, 2000);
        }

        console.log("Background carousel initialized with JS animations");
    }

    // 清理
    public destroy(): void {
        if (this.debouncedScroll) {
            window.removeEventListener("scroll", this.debouncedScroll);
        }
        this.stopTimer();
        this.activeAnimations.forEach((frameId) => {
            cancelAnimationFrame(frameId);
        });
        this.activeAnimations.clear();
        if (this.blurAnimationId) {
            cancelAnimationFrame(this.blurAnimationId);
        }
    }

    // 暂停所有动画
    private pause(): void {
        if (this.isPaused) return;

        this.isPaused = true;
        this.stopTimer();

        // 暂停模糊动画
        if (this.blurAnimationId) {
            cancelAnimationFrame(this.blurAnimationId);
            this.blurAnimationId = null;
        }
    }

    // 恢复所有动画
    private resume(): void {
        if (!this.isPaused) return;

        this.isPaused = false;
        this.startTimer();

        // 恢复所有暂停的动画
        this.pausedAnimations.forEach((_, element) => {
            const currentOpacity = parseFloat(element.style.opacity || '0');
            // 触发动画继续
            const frameId = this.activeAnimations.get(element);
            if (frameId) {
                requestAnimationFrame((time) => {
                    // 动画会在下一帧自动继续
                });
            }
        });
    }
}

// 全局实例管理
let carouselManager: BackgroundCarouselManager | null = null;

// 初始化背景轮播
export function initBackgroundCarousel(backgrounds: string[]): void {
    if (!carouselManager) {
        carouselManager = new BackgroundCarouselManager(backgrounds);
        carouselManager.initialize();
    }
}

// 销毁背景轮播
export function destroyBackgroundCarousel(): void {
    if (carouselManager) {
        carouselManager.destroy();
        carouselManager = null;
    }
}