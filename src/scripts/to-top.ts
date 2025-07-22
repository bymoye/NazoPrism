/**
 * @file src/scripts/to-top.ts
 * @description 返回顶部按钮管理器
 */

import { smoothScrollTo } from '../utils/scroll-utils';
import { scrollObserverManager } from './scroll-observer-manager';
import { registerGlobalCleanup } from './cleanup-manager';
import styles from '../styles/components/ToTop.module.css';

const OBSERVER_ID = 'to-top';

const state = {
  button: null as HTMLElement | null,
  isVisible: false,
};

let isInitialized = false;

/**
 * 滚动状态变化回调函数
 * 当页面滚动状态改变时触发
 */
const handleScrollChange = (isScrolled: boolean) => {
  if (!state.button) return;

  // 仅在状态变化时操作 DOM
  if (isScrolled !== state.isVisible) {
    state.isVisible = isScrolled;
    state.button.classList.toggle(styles.show, isScrolled);
  }
};

// 点击事件处理器
const scrollToTop = () => {
  smoothScrollTo(0);
};

function initInternal(): void {
  // 注册滚动状态观察器
  scrollObserverManager.register({
    id: OBSERVER_ID,
    callback: handleScrollChange,
    rootMargin: '300px 0px 0px 0px', // 当哨兵元素距离视口顶部300px时触发
    threshold: 0,
  });

  // 直接绑定点击事件
  state.button?.addEventListener('click', scrollToTop);
}

/**
 * 销毁返回顶部按钮的所有逻辑
 */
export function destroyToTop(): void {
  if (!isInitialized) return;

  // 清理滚动观察器
  scrollObserverManager.unregister(OBSERVER_ID);

  // 清理点击事件监听
  state.button?.removeEventListener('click', scrollToTop);

  state.button = null;
  isInitialized = false;
}

/**
 * 初始化返回顶部按钮
 */
export function initToTop(): void {
  state.button = document.querySelector('#to-top');

  if (!state.button) {
    if (isInitialized) {
      destroyToTop();
    }
    return;
  }

  if (isInitialized) {
    // 页面切换后，先清理旧的观察器，再重新初始化
    scrollObserverManager.unregister(OBSERVER_ID);
    initInternal();
  } else {
    // 首次初始化
    initInternal();
    isInitialized = true;

    // 职责明确：自己注册自己的全局清理任务
    registerGlobalCleanup(destroyToTop);
  }
}
