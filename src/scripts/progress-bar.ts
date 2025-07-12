import { getScrollPercent } from '../utils/scroll-utils';
import { offEvents, onResize, onScroll } from './global-event-manager';
import { registerGlobalCleanup } from './cleanup-manager';
import { debounce } from '../utils/debounce';

const THROTTLED_EVENT_ID = 'progress-bar-throttle';
const DEBOUNCED_EVENT_ID = 'progress-bar-debounce';

const state = {
  progressBar: null as HTMLElement | null,
  lastPercent: -1,
};

let isInitialized = false;
let resizeObserver: ResizeObserver | null = null;

const updateProgress = (): void => {
  if (!state.progressBar) return;
  const scrollPercent = getScrollPercent();
  if (Math.abs(scrollPercent - state.lastPercent) > 0.001) {
    state.lastPercent = scrollPercent;
    state.progressBar.style.transform = `scaleX(${scrollPercent})`;
  }
};

function initInternal(): void {
  onScroll(THROTTLED_EVENT_ID, updateProgress);
  onResize(THROTTLED_EVENT_ID, updateProgress);

  // 2. 防抖校准：负责滚动结束后的最终精确位置
  const finalUpdate = debounce(() => {
    updateProgress();
  }, 100); // 100ms 的延迟，用户停止滚动100ms后触发

  onScroll(DEBOUNCED_EVENT_ID, finalUpdate);
  onResize(DEBOUNCED_EVENT_ID, finalUpdate); // resize 结束也校准

  // --------------------

  const debouncedLayoutUpdate = debounce(updateProgress, 50);
  resizeObserver = new ResizeObserver(debouncedLayoutUpdate);
  resizeObserver.observe(document.body);

  updateProgress();
}

export function destroyProgressBar(): void {
  if (!isInitialized) return;

  // 销毁时，必须同时清理两个事件处理器
  offEvents(THROTTLED_EVENT_ID);
  offEvents(DEBOUNCED_EVENT_ID);

  if (resizeObserver) {
    resizeObserver.disconnect();
    resizeObserver = null;
  }

  state.progressBar = null;
  state.lastPercent = -1;
  isInitialized = false;
}

export function initProgressBar(): void {
  state.progressBar = document.querySelector('#scrollbar');

  if (!state.progressBar) {
    if (isInitialized) {
      destroyProgressBar();
    }
    return;
  }

  if (isInitialized) {
    updateProgress();
  } else {
    initInternal();
    isInitialized = true;
    registerGlobalCleanup(destroyProgressBar);
  }
}
