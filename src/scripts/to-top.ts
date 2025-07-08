import debounce from "../utils/debounce";
import { getScrollTop, smoothScrollTo } from "../utils/scroll-utils";

// ToTop button manager
export class ToTopManager {
    private button: HTMLElement | null;
    private isVisible: boolean = false;
    private scrollHandler: (() => void) | null = null;
    private clickHandler: (() => void) | null = null;
    private readonly SCROLL_THRESHOLD = 300;

    constructor() {
        this.button = document.getElementById("to-top");
        this.init();
    }

    private updateVisibility = (): void => {
        const scrollTop = getScrollTop();
        const shouldShow = scrollTop > this.SCROLL_THRESHOLD;

        if (shouldShow !== this.isVisible) {
            this.isVisible = shouldShow;
            if (this.button) {
                this.button.style.transform = this.isVisible ? "scale(1)" : "scale(0)";
            }
        }
    };

    private scrollToTop = (): void => {
        smoothScrollTo(0);
    };

    private init(): void {
        if (!this.button) return;

        // 创建防抖处理函数
        this.scrollHandler = debounce(this.updateVisibility, 100);
        this.clickHandler = this.scrollToTop;

        // 添加事件监听
        window.addEventListener("scroll", this.scrollHandler, { passive: true });
        this.button.addEventListener("click", this.clickHandler);

        // 初始状态检查
        this.updateVisibility();
    }

    public destroy(): void {
        if (this.scrollHandler) {
            window.removeEventListener("scroll", this.scrollHandler);
        }
        if (this.button && this.clickHandler) {
            this.button.removeEventListener("click", this.clickHandler);
        }
    }

    public reinit(): void {
        this.destroy();
        this.button = document.getElementById("to-top");
        this.init();
    }
}

// 全局实例管理
let toTopManager: ToTopManager | null = null;

export function initToTop(): void {
    if (toTopManager) {
        toTopManager.reinit();
    } else {
        toTopManager = new ToTopManager();
    }
}

export function destroyToTop(): void {
    if (toTopManager) {
        toTopManager.destroy();
        toTopManager = null;
    }
}