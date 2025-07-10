/**
 * 应用统一初始化脚本
 * 集成所有优化功能：性能监控、Service Worker、虚拟滚动等
 */

import { initBackgroundCarousel } from './background-carousel';
import { initNavigation } from './navigation';
import { initProgressBar } from './progress-bar';
import { initToTop } from './to-top';
import { initArticleAnimations } from './article-animations';
import { initGlobalEventManager } from './global-event-manager';
import { initPageVisibilityManager } from './page-visibility-manager';
import { initCleanupManager } from './cleanup-manager';
import { initTheme } from './theme-init';


import { SITE_CONFIG } from '../config';


interface AppConfig {
    debug: boolean;
}

class AppInitializer {
    private static instance: AppInitializer;
    private config: AppConfig;
    private isInitialized = false;

    private constructor() {
        this.config = {
            debug: process.env.NODE_ENV === 'development'
        };
    }

    static getInstance(): AppInitializer {
        if (!AppInitializer.instance) {
            AppInitializer.instance = new AppInitializer();
        }
        return AppInitializer.instance;
    }

    /**
     * 初始化应用
     */
    async init(customConfig?: Partial<AppConfig>): Promise<void> {
        if (this.isInitialized) {
            console.warn('⚠️ App already initialized');
            return;
        }

        // 合并配置
        this.config = { ...this.config, ...customConfig };



        try {
            await this.initializeCore();
            await this.initializeEnhancements();
            await this.initializeOptimizations();

            this.isInitialized = true;


            this.dispatchInitEvent();

        } catch (error) {
            throw error;
        }
    }

    /**
     * 初始化核心功能
     */
    private async initializeCore(): Promise<void> {


        const coreComponents = [
            {
                name: 'Global Event Manager',
                init: () => initGlobalEventManager(),
                critical: true
            },
            {
                name: 'Cleanup Manager',
                init: () => initCleanupManager(),
                critical: true
            },
            {
                name: 'Page Visibility Manager',
                init: () => initPageVisibilityManager(),
                critical: false
            },
            {
                name: 'Theme System',
                init: () => initTheme(),
                critical: false
            },
            {
                name: 'Background Carousel',
                init: () => initBackgroundCarousel(SITE_CONFIG.backgroundApi.fallbackImages),
                critical: false
            },
            {
                name: 'Navigation',
                init: () => initNavigation(),
                critical: false
            },
            {
                name: 'Progress Bar',
                init: () => initProgressBar(),
                critical: false
            },
            {
                name: 'To Top Button',
                init: () => initToTop(),
                critical: false
            },
            {
                name: 'Article Animations',
                init: () => initArticleAnimations(),
                critical: false
            },
        ];

        for (const component of coreComponents) {
            try {
                component.init();
            } catch (error) {
                if (component.critical) {
                    throw new Error(`Critical component initialization failed: ${component.name}`);
                }
            }
        }
    }

    /**
     * 初始化增强功能
     */
    private async initializeEnhancements(): Promise<void> {

    }

    /**
     * 初始化性能优化
     */
    private async initializeOptimizations(): Promise<void> {
        this.initializeLazyLoading();
        this.preloadCriticalResources();
    }



    /**
     * 初始化图片懒加载
     */
    private initializeLazyLoading(): void {
        if ('IntersectionObserver' in window) {
            const imageObserver = new IntersectionObserver((entries) => {
                entries.forEach(entry => {
                    if (entry.isIntersecting) {
                        const img = entry.target as HTMLImageElement;
                        const src = img.dataset.src;

                        if (src) {
                            img.src = src;
                            img.removeAttribute('data-src');
                            imageObserver.unobserve(img);
                        }
                    }
                });
            }, {
                rootMargin: '50px 0px',
                threshold: 0.1
            });

            // 观察所有带有 data-src 的图片
            document.querySelectorAll('img[data-src]').forEach(img => {
                imageObserver.observe(img);
            });


        }
    }

    /**
     * 预加载关键资源
     */
    private preloadCriticalResources(): void {
        // CSS files are handled by Astro's build system and imported in components
        // No need to preload them manually as they're bundled appropriately

    }

    /**
     * 发送初始化完成事件
     */
    private dispatchInitEvent(): void {
        const event = new CustomEvent('app:initialized', {
            detail: {
                config: this.config,
                timestamp: Date.now()
            }
        });

        document.dispatchEvent(event);
    }

    /**
     * 获取应用状态
     */
    getStatus(): { initialized: boolean; config: AppConfig } {
        return {
            initialized: this.isInitialized,
            config: this.config
        };
    }

    /**
     * 更新配置
     */
    updateConfig(newConfig: Partial<AppConfig>): void {
        this.config = { ...this.config, ...newConfig };
        console.log('📋 Config updated:', this.config);
    }
}

// 导出单例实例
export const appInitializer = AppInitializer.getInstance();

/**
 * 初始化应用（便捷函数）
 */
export function initApp(config?: Partial<AppConfig>): Promise<void> {
    return appInitializer.init(config);
}

/**
 * 获取应用状态
 */
export function getAppStatus(): { initialized: boolean; config: AppConfig } {
    return appInitializer.getStatus();
}

// 监听页面转换事件（Astro）
if (typeof window !== 'undefined') {
    document.addEventListener('astro:page-load', () => {
        const backgroundContainer = document.getElementById('background-carousel-container');
        const bgLayer1 = backgroundContainer?.querySelector('#bg-layer-1') as HTMLElement;
        const bgLayer2 = backgroundContainer?.querySelector('#bg-layer-2') as HTMLElement;
        const hasPersistedBackground = backgroundContainer &&
            (bgLayer1?.style.backgroundImage || bgLayer2?.style.backgroundImage);

        if (!hasPersistedBackground) {
            initBackgroundCarousel(SITE_CONFIG.backgroundApi.fallbackImages);
        }

        initTheme();
        initArticleAnimations();
        initToTop();
    });
}
