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

// --- Astro 生命周期钩子：页面切换前的主题持久化 ---
// 这段代码会在页面切换前，将主题色注入到新页面的 <head> 中，防止闪烁
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

// --- 模块化实现 ---

interface AppConfig {
  debug: boolean;
}

let isInitialized = false;
let config: AppConfig = {
  debug: process.env.NODE_ENV === 'development',
};

/**
 * 初始化所有核心功能模块
 */
function initializeCoreModules(): void {
  const coreComponents = [
    { name: 'Global Event Manager', init: initGlobalEventManager, critical: true },
    { name: 'Cleanup Manager', init: initCleanupManager, critical: true },
    { name: 'Page Visibility Manager', init: initPageVisibilityManager, critical: false },
    { name: 'Theme System', init: initTheme, critical: false },
    {
      name: 'Background Carousel',
      init: () => initBackgroundCarousel(SITE_CONFIG.backgroundApi.fallbackImages),
      critical: false,
    },
    { name: 'Navigation', init: initNavigation, critical: false },
    { name: 'Progress Bar', init: initProgressBar, critical: false },
    { name: 'To Top Button', init: initToTop, critical: false },
    // 文章动画可能需要在页面切换后重新初始化，因此从核心初始化中移除
    // { name: 'Article Animations', init: initArticleAnimations, critical: false },
  ];

  for (const component of coreComponents) {
    try {
      component.init();
    } catch (error) {
      if (component.critical) {
        throw new Error(`关键组件初始化失败: ${component.name}`);
      } else {
        // 对于非关键组件，在开发模式下打印警告，而不是静默处理
        if (config.debug) {
          console.warn(`非关键组件初始化失败: ${component.name}`, error);
        }
      }
    }
  }
}

/**
 * 初始化懒加载
 * 优先使用原生 loading="lazy"，此脚本作为补充和兼容
 */
function initializeLazyLoading(): void {
  if (!('IntersectionObserver' in window)) return;

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
function initializeOptimizations(): void {
  initializeLazyLoading();
}

/**
 * 发送初始化完成的自定义事件
 */
function dispatchInitEvent(): void {
  const event = new CustomEvent('app:initialized', {
    detail: { config, timestamp: Date.now() },
  });
  document.dispatchEvent(event);
}

/**
 * 导出的主函数：初始化整个应用
 */
export async function initApp(customConfig?: Partial<AppConfig>): Promise<void> {
  if (isInitialized) {
    if (config.debug) console.warn('⚠️ 应用已初始化，跳过重复操作。');
    return;
  }

  config = { ...config, ...customConfig };

  try {
    if (config.debug) console.log('🚀 应用开始初始化...');

    initializeCoreModules();
    initializeOptimizations();
    // initializeEnhancements(); // 如果有的话

    isInitialized = true;
    dispatchInitEvent();

    if (config.debug) console.log('✅ 应用初始化完成！');
  } catch (error) {
    console.error('❌ 应用初始化过程中发生严重错误:', error);
    // 可在此处添加错误上报逻辑
    throw error;
  }
}

// --- Astro 生命周期钩子：页面加载后 ---
// 此处只应放置那些必须在每次页面切换后重新执行的、针对新页面内容的脚本
document.addEventListener('astro:page-load', () => {
  // 例如：文章页面的入场动画，每次进入新的文章页都需要重新触发
  initArticleAnimations();
});
