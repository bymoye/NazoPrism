/**
 * 应用统一初始化脚本
 * 集成所有优化功能：性能监控、Service Worker、虚拟滚动等
 */
import { initArticleAnimations } from './article-animations';
import { initBackgroundCarousel } from './background-carousel';
import { initCleanupManager } from './cleanup-manager';
import { initGlobalEventManager } from './global-event-manager';
import { initNavigation } from './navigation';
import { initPageVisibilityManager } from './page-visibility-manager';
import { initProgressBar } from './progress-bar';
import { initTheme } from './theme-init';
import { initToTop } from './to-top';

import { SITE_CONFIG } from '../config';

document.addEventListener('astro:before-swap', event => {
  const themeJson = sessionStorage.getItem('nazo-prism-theme-colors');
  if (!themeJson) return;

  try {
    const themeColors = JSON.parse(themeJson);
    const style = document.createElement('style');

    // 将保存的颜色动态生成 CSS 变量
    const cssVars = Object.entries(themeColors)
      .map(([key, value]) => {
        const cssVarName = `--md-sys-color-${key.replace(/([A-Z])/g, '-$1').toLowerCase()}`;

        // 将十六进制颜色 #RRGGBB 转换为 R, G, B
        const hex = String(value).replace('#', '');
        const r = parseInt(hex.substring(0, 2), 16);
        const g = parseInt(hex.substring(2, 4), 16);
        const b = parseInt(hex.substring(4, 6), 16);

        return `${cssVarName}: ${r}, ${g}, ${b};`;
      })
      .join('\n');

    // 将 CSS 变量注入到 :root
    style.textContent = `:root { ${cssVars} }`;

    // 将这个 <style> 标签添加到新页面的 <head> 中
    event.newDocument.head.appendChild(style);
  } catch (e) {
    console.error('Failed to apply theme during page swap:', e);
  }
});

interface AppConfig {
  debug: boolean;
}

class AppInitializer {
  private static instance: AppInitializer;
  private config: AppConfig;
  private isInitialized = false;

  private constructor() {
    this.config = {
      debug: process.env.NODE_ENV === 'development',
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
        critical: true,
      },
      {
        name: 'Cleanup Manager',
        init: () => initCleanupManager(),
        critical: true,
      },
      {
        name: 'Page Visibility Manager',
        init: () => initPageVisibilityManager(),
        critical: false,
      },
      {
        name: 'Theme System',
        init: () => initTheme(),
        critical: false,
      },
      {
        name: 'Background Carousel',
        init: () => initBackgroundCarousel(SITE_CONFIG.backgroundApi.fallbackImages),
        critical: false,
      },
      {
        name: 'Navigation',
        init: () => initNavigation(),
        critical: false,
      },
      {
        name: 'Progress Bar',
        init: () => initProgressBar(),
        critical: false,
      },
      {
        name: 'To Top Button',
        init: () => initToTop(),
        critical: false,
      },
      {
        name: 'Article Animations',
        init: () => initArticleAnimations(),
        critical: false,
      },
    ];

    for (const component of coreComponents) {
      try {
        component.init();
      } catch {
        if (component.critical) {
          throw new Error(`Critical component initialization failed: ${component.name}`);
        }
      }
    }
  }

  /**
   * 初始化增强功能
   */
  private async initializeEnhancements(): Promise<void> {}

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
      const imageObserver = new IntersectionObserver(
        entries => {
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
        },
        {
          rootMargin: '50px 0px',
          threshold: 0.1,
        },
      );

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
        timestamp: Date.now(),
      },
    });

    document.dispatchEvent(event);
  }

  /**
   * 获取应用状态
   */
  getStatus(): { initialized: boolean; config: AppConfig } {
    return {
      initialized: this.isInitialized,
      config: this.config,
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
    const hasPersistedBackground =
      backgroundContainer && (bgLayer1?.style.backgroundImage || bgLayer2?.style.backgroundImage);

    if (!hasPersistedBackground) {
      initBackgroundCarousel(SITE_CONFIG.backgroundApi.fallbackImages);
    }

    initTheme();
    initArticleAnimations();
    initToTop();
  });
}
