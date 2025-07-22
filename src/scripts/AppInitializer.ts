/**
 * @file src/scripts/AppInitializer.ts
 * @description 应用初始化器
 */

import { initArticleAnimations } from './ArticleAnimationManager';
import { initBackgroundCarousel } from './BackgroundCarouselManager';
import { initGlobalEventManager } from './GlobalEventManager';
import { initNavigationManager } from './NavigationManager';
import { initPageVisibilityManager } from './PageVisibilityManager';
import { initTheme } from './theme-init';
import { initToTopManager } from './ToTopManager';
import { intersectionObserverManager } from './IntersectionObserverManager';
import { registerGlobalCleanup } from './CleanupManager';

import { SITE_CONFIG } from '../config';

/**
 * 应用配置接口
 */
interface AppConfig {
  debug: boolean;
  enableLazyLoading: boolean;
  enableBackgroundCarousel: boolean;
}

/**
 * 组件初始化配置接口
 */
interface ComponentConfig {
  name: string;
  init: () => void | Promise<void>;
  critical: boolean;
}

/**
 * 应用初始化器类
 * 统一管理整个应用的初始化流程
 */
class AppInitializer {
  #isInitialized = false;
  #config: AppConfig = {
    debug: process.env.NODE_ENV === 'development',
    enableLazyLoading: true,
    enableBackgroundCarousel: true,
  };

  // 单例实例
  static #instance: AppInitializer | null = null;

  /**
   * 私有构造函数，确保单例模式
   */
  private constructor() {
    this.#setupAstroLifecycleHooks();
  }

  /**
   * 获取单例实例
   */
  static getInstance(): AppInitializer {
    if (!AppInitializer.#instance) {
      AppInitializer.#instance = new AppInitializer();
    }
    return AppInitializer.#instance;
  }

  /**
   * 设置 Astro 生命周期钩子
   */
  #setupAstroLifecycleHooks(): void {
    // Astro 生命周期钩子：页面切换前的主题持久化
    document.addEventListener('astro:before-swap', event => {
      const themeJson = sessionStorage.getItem('nazo-prism-theme-colors');
      if (!themeJson) return;

      try {
        const themeColors = JSON.parse(themeJson);
        const style = document.createElement('style');

        const cssVars = Object.entries(themeColors)
          .map(([key, value]) => {
            const cssVarName = `--md-sys-color-${key.replace(/([A-Z])/g, '-$1').toLowerCase()}`;
            const hex = String(value).substring(1);
            const [r, g, b] = hex.match(/.{1,2}/g)?.map(c => parseInt(c, 16)) || [0, 0, 0];
            return `${cssVarName}: ${r}, ${g}, ${b};`;
          })
          .join('\n');

        style.textContent = `:root { ${cssVars} }`;
        event.newDocument.head.appendChild(style);
      } catch (e) {
        console.error('主题应用失败 (astro:before-swap):', e);
      }
    });

    // Astro 页面加载后重新初始化组件
    document.addEventListener('astro:page-load', () => {
      initArticleAnimations();
      initToTopManager(); // 重新初始化 ToTop 按钮
      initNavigationManager(); // 重新初始化导航
    });
  }

  /**
   * 初始化所有核心功能模块
   */
  async #initializeCoreModules(): Promise<void> {
    const coreComponents: ComponentConfig[] = [
      {
        name: 'Global Event Manager',
        init: initGlobalEventManager,
        critical: true,
      },
      {
        name: 'Page Visibility Manager',
        init: initPageVisibilityManager,
        critical: false,
      },
      {
        name: 'Theme System',
        init: initTheme,
        critical: false,
      },
      {
        name: 'Navigation',
        init: initNavigationManager,
        critical: false,
      },
      {
        name: 'To Top Button',
        init: initToTopManager,
        critical: false,
      },
    ];

    // 同步初始化其他组件
    for (const component of coreComponents) {
      try {
        await component.init();
      } catch (error) {
        if (component.critical) {
          throw new Error(`关键组件初始化失败: ${component.name}`);
        } else {
          // 对于非关键组件，在开发模式下打印警告
          if (this.#config.debug) {
            console.warn(`非关键组件初始化失败: ${component.name}`, error);
          }
        }
      }
    }

    // 异步初始化背景轮播组件
    if (this.#config.enableBackgroundCarousel) {
      try {
        await initBackgroundCarousel(SITE_CONFIG.backgroundApi.fallbackImages);
      } catch (error) {
        if (this.#config.debug) {
          console.warn('背景轮播组件初始化失败:', error);
        }
      }
    }

    // 注册 IntersectionObserver 管理器的全局清理
    registerGlobalCleanup(() => {
      intersectionObserverManager.destroy();
    });
  }

  /**
   * 初始化懒加载
   * 优先使用原生 loading="lazy"，此脚本作为补充和兼容
   */
  #initializeLazyLoading(): void {
    if (!this.#config.enableLazyLoading || !('IntersectionObserver' in window)) {
      return;
    }

    const imageObserver = new IntersectionObserver(
      (entries, observer) => {
        entries.forEach(entry => {
          if (entry.isIntersecting) {
            const img = entry.target as HTMLImageElement;
            const src = img.dataset.src;
            if (src) {
              img.src = src;
              img.removeAttribute('data-src');
            }
            // 加载后停止观察
            observer.unobserve(img);
          }
        });
      },
      { rootMargin: '50px 0px', threshold: 0.01 },
    );

    // 观察初始页面上的所有 [data-src] 图片
    document.querySelectorAll('img[data-src]').forEach(img => imageObserver.observe(img));

    // 使用 MutationObserver 来观察后续动态添加到 DOM 的图片
    const mutationObserver = new MutationObserver(mutations => {
      for (const mutation of mutations) {
        if (mutation.type === 'childList') {
          mutation.addedNodes.forEach(node => {
            if (node.nodeType === Node.ELEMENT_NODE) {
              (node as Element)
                .querySelectorAll('img[data-src]')
                .forEach(img => imageObserver.observe(img));
            }
          });
        }
      }
    });

    mutationObserver.observe(document.body, { childList: true, subtree: true });
  }

  /**
   * 初始化性能优化相关的杂项
   */
  #initializeOptimizations(): void {
    this.#initializeLazyLoading();
  }

  /**
   * 发送初始化完成的自定义事件
   */
  #dispatchInitEvent(): void {
    const event = new CustomEvent('app:initialized', {
      detail: { config: this.#config, timestamp: Date.now() },
    });
    document.dispatchEvent(event);
  }

  /**
   * 初始化整个应用
   */
  async init(customConfig?: Partial<AppConfig>): Promise<void> {
    if (this.#isInitialized) {
      if (this.#config.debug) console.warn('⚠️ 应用已初始化，跳过重复操作。');
      return;
    }

    this.#config = { ...this.#config, ...customConfig };

    try {
      if (this.#config.debug) console.log('🚀 应用开始初始化...');

      await this.#initializeCoreModules();
      this.#initializeOptimizations();

      this.#isInitialized = true;
      this.#dispatchInitEvent();

      if (this.#config.debug) console.log('✅ 应用初始化完成！');
    } catch (error) {
      console.error('❌ 应用初始化过程中发生严重错误:', error);
      throw error;
    }
  }

  /**
   * 获取应用状态信息（调试用）
   */
  getStats() {
    return {
      isInitialized: this.#isInitialized,
      config: this.#config,
    };
  }

  /**
   * 更新配置
   */
  updateConfig(newConfig: Partial<AppConfig>): void {
    this.#config = { ...this.#config, ...newConfig };
  }

  /**
   * 重新初始化应用（用于测试）
   */
  async reinit(customConfig?: Partial<AppConfig>): Promise<void> {
    this.#isInitialized = false;
    await this.init(customConfig);
  }

  /**
   * 销毁应用（用于测试）
   */
  destroy(): void {
    this.#isInitialized = false;
    AppInitializer.#instance = null;
  }
}

// 导出便捷函数，保持向后兼容
const appInitializer = AppInitializer.getInstance();

export const initApp = (customConfig?: Partial<AppConfig>) => appInitializer.init(customConfig);
