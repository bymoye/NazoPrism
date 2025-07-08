import debounce from "../utils/debounce";
import { getScrollPercent } from "../utils/scroll-utils";

// Progress bar manager
export class ProgressBarManager {
    private progressBar: HTMLElement | null;
    private scrollHandler: (() => void) | null = null;
    private color: string = "#00BCD4";

    constructor() {
        this.progressBar = document.getElementById("scrollbar");
        this.init();
    }

    private updateProgress = (): void => {
        if (!this.progressBar) return;

        const scrollPercent = getScrollPercent();
        const width = scrollPercent * 100;

        this.progressBar.style.width = `${width}%`;
        this.progressBar.style.backgroundColor = this.color;
    };

    private init(): void {
        if (!this.progressBar) return;

        // 创建防抖处理函数
        this.scrollHandler = debounce(this.updateProgress, 100);

        // 添加事件监听
        window.addEventListener("scroll", this.scrollHandler, { passive: true });
        window.addEventListener("resize", this.scrollHandler, { passive: true });

        // 初始更新
        this.updateProgress();
    }

    public destroy(): void {
        if (this.scrollHandler) {
            window.removeEventListener("scroll", this.scrollHandler);
            window.removeEventListener("resize", this.scrollHandler);
        }
    }

    public reinit(): void {
        this.destroy();
        this.progressBar = document.getElementById("scrollbar");
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