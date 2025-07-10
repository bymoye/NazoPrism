/**
 * Page Visibility Manager
 * 正确处理页面可见性变化，不会错误地清理脚本
 */

interface VisibilityHandler {
    id: string;
    onHidden: () => void;
    onVisible: () => void;
}

class PageVisibilityManager {
    private static instance: PageVisibilityManager;
    private handlers: Map<string, VisibilityHandler> = new Map();
    private isVisible: boolean = !document.hidden;
    private isInitialized = false;

    private constructor() { }

    static getInstance(): PageVisibilityManager {
        if (!PageVisibilityManager.instance) {
            PageVisibilityManager.instance = new PageVisibilityManager();
        }
        return PageVisibilityManager.instance;
    }

    /**
     * 初始化页面可见性管理器
     */
    init(): void {
        if (this.isInitialized) return;



        // 监听页面可见性变化
        document.addEventListener('visibilitychange', this.handleVisibilityChange);

        window.addEventListener('focus', this.handleFocus);

        this.isInitialized = true;

    }

    /**
     * 处理可见性变化
     */
    private handleVisibilityChange = (): void => {
        const wasVisible = this.isVisible;
        this.isVisible = !document.hidden;



        if (wasVisible !== this.isVisible) {
            this.notifyHandlers();
        }
    };

    /**
     * 处理窗口获得焦点
     */
    private handleFocus = (): void => {
        if (!this.isVisible) {
            this.isVisible = true;

            this.notifyHandlers();
        }
    };


    /**
     * 通知所有处理器
     */
    private notifyHandlers(): void {
        this.handlers.forEach(({ onHidden, onVisible }, id) => {
            try {
                if (this.isVisible) {
                    onVisible();
                } else {
                    onHidden();
                }
            } catch (error) {
                // 静默处理错误
            }
        });
    }

    /**
     * 注册可见性处理器
     */
    register(id: string, onHidden: () => void, onVisible: () => void): void {
        this.handlers.set(id, { id, onHidden, onVisible });

    }

    /**
     * 移除可见性处理器
     */
    unregister(id: string): void {
        this.handlers.delete(id);
    }

    /**
     * 获取当前可见性状态
     */
    get visible(): boolean {
        return this.isVisible;
    }

    /**
     * 获取注册的处理器数量
     */
    get handlerCount(): number {
        return this.handlers.size;
    }

    /**
     * 清理所有处理器
     */
    destroy(): void {
        if (!this.isInitialized) return;



        // 移除事件监听器
        document.removeEventListener('visibilitychange', this.handleVisibilityChange);
        window.removeEventListener('focus', this.handleFocus);

        // 清理所有处理器
        this.handlers.clear();

        this.isInitialized = false;

    }
}

// 导出单例实例
export const pageVisibilityManager = PageVisibilityManager.getInstance();

/**
 * 便捷的注册函数
 */
export function onPageVisibilityChange(
    id: string,
    onHidden: () => void,
    onVisible: () => void
): void {
    pageVisibilityManager.register(id, onHidden, onVisible);
}

/**
 * 移除可见性处理器
 */
export function offPageVisibilityChange(id: string): void {
    pageVisibilityManager.unregister(id);
}

/**
 * 初始化页面可见性管理器
 */
export function initPageVisibilityManager(): void {
    pageVisibilityManager.init();
}

/**
 * 获取当前页面可见性状态
 */
export function isPageVisible(): boolean {
    return pageVisibilityManager.visible;
}

/**
 * 获取统计信息
 */
export function getVisibilityStats(): { handlerCount: number; isVisible: boolean } {
    return {
        handlerCount: pageVisibilityManager.handlerCount,
        isVisible: pageVisibilityManager.visible
    };
}
