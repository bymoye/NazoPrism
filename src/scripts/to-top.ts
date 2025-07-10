import { getScrollTop, smoothScrollTo } from "../utils/scroll-utils";
import { onScroll, offEvents } from "./global-event-manager";

// ToTop button manager
export class ToTopManager {
    private button: HTMLElement | null;
    private isVisible: boolean = false;
    private clickHandler: (() => void) | null = null;
    private readonly SCROLL_THRESHOLD = 300;
    private readonly id = 'to-top';
    private lastScrollTop = 0;

    constructor() {
        this.button = document.getElementById("to-top");
        this.init();
    }

    private updateVisibility = (): void => {
        const scrollTop = getScrollTop();

        const scrollDifference = Math.abs(scrollTop - this.lastScrollTop);
        if (scrollDifference < 20) return;

        this.lastScrollTop = scrollTop;
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

        this.clickHandler = this.scrollToTop;

        // 使用全局事件管理器添加滚动事件监听
        onScroll(this.id, this.updateVisibility);

        // 添加点击事件监听
        this.button.addEventListener("click", this.clickHandler);

        // 初始状态检查
        this.updateVisibility();
    }

    public destroy(): void {
        // 使用全局事件管理器移除滚动事件监听器
        offEvents(this.id);

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