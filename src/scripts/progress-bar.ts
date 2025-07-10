import { getScrollPercent } from '../utils/scroll-utils';
import { offEvents, onResize, onScroll } from './global-event-manager';

// Progress bar manager
export class ProgressBarManager {
  private progressBar: HTMLElement | null;
  private color: string = '#00BCD4';
  private readonly id = 'progress-bar';
  private lastWidth = -1;

  constructor() {
    this.progressBar = document.getElementById('scrollbar');
    this.init();
  }

  private updateProgress = (): void => {
    if (!this.progressBar) return;

    const scrollPercent = getScrollPercent();
    const width = Math.round(scrollPercent * 100 * 10) / 10;

    if (Math.abs(width - this.lastWidth) > 0.5) {
      this.lastWidth = width;
      this.progressBar.style.width = `${width}%`;
      this.progressBar.style.backgroundColor = this.color;
    }
  };

  private init(): void {
    if (!this.progressBar) return;

    // 使用全局事件管理器注册事件
    onScroll(this.id, this.updateProgress);
    onResize(this.id, this.updateProgress);

    // 初始更新
    this.updateProgress();
  }

  public destroy(): void {
    // 使用全局事件管理器移除事件监听器
    offEvents(this.id);
  }

  public reinit(): void {
    this.destroy();
    this.progressBar = document.getElementById('scrollbar');
    this.init();
  }

  public setColor(color: string): void {
    this.color = color;
    this.updateProgress();
  }
}

// 全局实例管理
let progressBarManager: ProgressBarManager | null = null;

export function initProgressBar(): void {
  if (progressBarManager) {
    progressBarManager.reinit();
  } else {
    progressBarManager = new ProgressBarManager();
  }
}

export function destroyProgressBar(): void {
  if (progressBarManager) {
    progressBarManager.destroy();
    progressBarManager = null;
  }
}

export function setProgressBarColor(color: string): void {
  if (progressBarManager) {
    progressBarManager.setColor(color);
  }
}
