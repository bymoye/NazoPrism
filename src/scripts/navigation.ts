/**
 * @file src/scripts/navigation.ts
 * @description 导航栏滚动效果管理
 */

import { registerGlobalCleanup } from './cleanup-manager';
import { offEvents, onScroll } from './global-event-manager';
import { getScrollTop } from '../utils/scroll-utils';

const EVENT_ID: string = 'navigation';

const state = {
  nav: null as HTMLElement | null,
  scrollThreshold: 20,
  lastScrollPosition: 0,
  isNavSticky: false,
};

let isInitialized = false;

const updateNavigation = () => {
  if (!state.nav) return;

  const scrollPosition = getScrollTop();

  // 避免微小滚动的阈值检查
  if (Math.abs(scrollPosition - state.lastScrollPosition) < 5) {
    return;
  }

  state.lastScrollPosition = scrollPosition;

  const shouldBeSticky = scrollPosition > state.scrollThreshold;

  // 仅在状态变化时操作 DOM
  if (shouldBeSticky !== state.isNavSticky) {
    state.isNavSticky = shouldBeSticky;
    state.nav.classList.toggle('ceil_nav', state.isNavSticky);
  }
};

function initInternal() {
  // 使用全局事件管理器注册滚动事件
  onScroll(EVENT_ID, updateNavigation);
  // 初始化时立即检查一次滚动位置
  updateNavigation();
}

/**
 * 销毁导航栏管理器，移除事件监听并重置状态。
 * 这个函数将被注册到全局清理器中。
 */
export function destroyNavigation() {
  if (!isInitialized) return;
  offEvents(EVENT_ID);
  state.nav = null;
  state.lastScrollPosition = 0;
  state.isNavSticky = false;
  isInitialized = false;
}

/**
 * 初始化导航管理器。
 * 在 Astro 页面过渡中可被安全地重复调用。
 */
export function initNavigation() {
  // 优化点：将 DOM 查询提升到函数顶部，避免重复
  state.nav = document.getElementById('navigation');

  // 统一处理导航栏不存在于当前页面的情况
  if (!state.nav) {
    // 如果之前初始化过（说明是从有导航栏的页面跳转过来的），
    // 则执行清理，移除旧的事件监听等。
    if (isInitialized) {
      destroyNavigation();
    }
    return; // 当前页面无事可做，直接返回
  }

  if (isInitialized) {
    // 如果已经初始化过，说明是页面切换。
    // 我们已经获取了新的 DOM 引用，只需立即更新一次状态即可。
    updateNavigation();
    return;
  }
  // 如果是首次初始化
  initInternal(); // 绑定事件监听
  isInitialized = true;
  registerGlobalCleanup(destroyNavigation); // 注册全局清理
}
