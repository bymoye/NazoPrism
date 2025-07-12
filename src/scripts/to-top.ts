/**
 * @file src/scripts/to-top.ts
 * @description 返回顶部按钮管理器
 */

import { getScrollTop, smoothScrollTo } from '../utils/scroll-utils';
import { offEvents, onScroll } from './global-event-manager';
import { registerGlobalCleanup } from './cleanup-manager';

const EVENT_ID = 'to-top';
const SCROLL_THRESHOLD = 300; // 显示按钮的滚动阈值

const state = {
  button: null as HTMLElement | null,
  isVisible: false,
  lastScrollTop: 0,
};

let isInitialized = false;

const updateVisibility = () => {
  if (!state.button) return;

  const scrollTop = getScrollTop();

  // 避免微小滚动的性能优化
  if (Math.abs(scrollTop - state.lastScrollTop) < 20) {
    return;
  }
  state.lastScrollTop = scrollTop;

  const shouldShow = scrollTop > SCROLL_THRESHOLD;

  // 仅在状态变化时操作 DOM
  if (shouldShow !== state.isVisible) {
    state.isVisible = shouldShow;
    state.button.classList.toggle('show', shouldShow);
  }
};

// 点击事件处理器
const scrollToTop = () => {
  smoothScrollTo(0);
};

function initInternal(): void {
  // 绑定滚动事件
  onScroll(EVENT_ID, updateVisibility);

  // 直接绑定点击事件
  if (state.button) {
    state.button.addEventListener('click', scrollToTop);
  }

  // 初始化时立即更新一次可见性
  updateVisibility();
}

/**
 * 销毁返回顶部按钮的所有逻辑
 */
export function destroyToTop(): void {
  if (!isInitialized) return;

  // 清理滚动事件监听
  offEvents(EVENT_ID);

  // 清理点击事件监听
  if (state.button) {
    state.button.removeEventListener('click', scrollToTop);
  }

  state.button = null;
  isInitialized = false;
}

/**
 * 初始化返回顶部按钮
 */
export function initToTop(): void {
  state.button = document.getElementById('to-top');

  if (!state.button) {
    if (isInitialized) {
      destroyToTop();
    }
    return;
  }

  if (isInitialized) {
    // 页面切换后，只需确保按钮状态正确
    updateVisibility();
  } else {
    // 首次初始化
    initInternal();
    isInitialized = true;

    // 职责明确：自己注册自己的全局清理任务
    registerGlobalCleanup(destroyToTop);
  }
}
