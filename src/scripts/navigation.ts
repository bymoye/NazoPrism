import debounce from "../utils/debounce";

// 导航栏滚动效果管理
export class NavigationManager {
    private nav: HTMLElement | null;
    private scrollHandler: (() => void) | null = null;
    private scrollThreshold = 20;

    constructor() {
        this.nav = document.getElementById("navigation");
        this.init();
    }

    private updateProgress = () => {
        const scrollPosition = window.scrollY;
        if (scrollPosition > this.scrollThreshold) {
            this.nav?.classList.add("ceil_nav");
        } else {
            this.nav?.classList.remove("ceil_nav");
        }
    };

    private init() {
        // 创建防抖处理函数
        const debouncedUpdate = debounce(this.updateProgress, 100);

        // 移除旧的事件监听器（如果存在）
        if (this.scrollHandler) {
            window.removeEventListener("scroll", this.scrollHandler);
        }

        // 保存新的处理函数引用
        this.scrollHandler = debouncedUpdate;

        // 添加新的事件监听器
        if (this.scrollHandler) {
            window.addEventListener("scroll", this.scrollHandler, { passive: true });
        }

        // 初始化时立即检查滚动位置
        this.updateProgress();
    }

    // 清理方法
    public destroy() {
        if (this.scrollHandler) {
            window.removeEventListener("scroll", this.scrollHandler);
            this.scrollHandler = null;
        }
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
    }
}

// 清理导航管理器
export function destroyNavigation() {
    if (navigationManager) {
        navigationManager.destroy();
        navigationManager = null;
    }
}