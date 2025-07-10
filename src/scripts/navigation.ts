import { registerCleanup } from "./cleanup-manager";
import { onScroll, offEvents } from "./global-event-manager";

// 导航栏滚动效果管理
export class NavigationManager {
    private nav: HTMLElement | null;
    private scrollThreshold = 20;
    private readonly id = 'navigation';
    private lastScrollPosition = 0;
    private isNavSticky = false;

    constructor() {
        this.nav = document.getElementById("navigation");
        this.init();
    }

    private updateNavigation = () => {
        if (!this.nav) return;

        const scrollPosition = window.scrollY;

        const scrollDifference = Math.abs(scrollPosition - this.lastScrollPosition);
        if (scrollDifference < 5) return; // 5px 阈值，避免微小滚动

        this.lastScrollPosition = scrollPosition;

        const shouldBeSticky = scrollPosition > this.scrollThreshold;

        if (shouldBeSticky !== this.isNavSticky) {
            this.isNavSticky = shouldBeSticky;

            if (this.isNavSticky) {
                this.nav.classList.add("ceil_nav");
            } else {
                this.nav.classList.remove("ceil_nav");
            }
        }
    };

    private init() {
        // 使用全局事件管理器注册滚动事件
        onScroll(this.id, this.updateNavigation);

        // 初始化时立即检查滚动位置
        this.updateNavigation();
    }

    // 清理方法
    public destroy() {
        // 使用全局事件管理器移除事件监听器
        offEvents(this.id);

        // 重置状态
        this.nav = null;
    }

    // 重新初始化
    public reinit() {
        this.destroy();
        this.nav = document.getElementById("navigation");
        this.init();
    }
}

// 全局实例管理
let navigationManager: NavigationManager | null = null;

// 初始化导航管理器
export function initNavigation() {
    if (navigationManager) {
        navigationManager.reinit();
    } else {
        navigationManager = new NavigationManager();
        // 注册清理函数
        registerCleanup('navigation', destroyNavigation);
    }
}

// 清理导航管理器
export function destroyNavigation() {
    if (navigationManager) {
        navigationManager.destroy();
        navigationManager = null;
    }
}