import { getScrollPercent } from '../utils/scroll-utils';
import { offEvents, onResize, onScroll } from './global-event-manager';

// Progress bar manager
export class ProgressBarManager {
  private progressBar: HTMLElement | null;
  private readonly id = 'progress-bar';
  private lastWidth = -1;

  constructor() {
    this.progressBar = document.getElementById('scrollbar');
    this.init();
  }

  private updateProgress = (): void => {
    if (!this.progressBar) return;

    const scrollPercent = getScrollPercent();

    let width: number;
    if (scrollPercent === 0) {
      width = 0;
    } else if (scrollPercent === 1) {
      width = 100;
    } else {
      width = Math.round(scrollPercent * 100 * 10) / 10;
    }

    if (Math.abs(width - this.lastWidth) > 0.1) {
      this.lastWidth = width;
      this.progressBar.style.width = `${width}%`;
    }
  };

  private init(): void {
    if (!this.progressBar) return;

    onScroll(this.id, this.updateProgress);
    onResize(this.id, this.updateProgress);
    this.updateProgress();
  }

  public destroy(): void {
    offEvents(this.id);
  }

  public reinit(): void {
    this.destroy();
    this.progressBar = document.getElementById('scrollbar');
    this.lastWidth = -1;
    this.init();
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
