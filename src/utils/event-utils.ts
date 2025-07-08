/**
 * 事件管理器 - 统一管理事件监听器的添加和移除
 */
export class EventManager {
    private listeners: Map<string, { target: EventTarget; handler: EventListener; options?: AddEventListenerOptions }[]> = new Map();

    /**
     * 添加事件监听器
     */
    public on(
        target: EventTarget,
        event: string,
        handler: EventListener,
        options?: AddEventListenerOptions
    ): void {
        // 添加到内部记录
        const key = event;
        if (!this.listeners.has(key)) {
            this.listeners.set(key, []);
        }
        this.listeners.get(key)!.push({ target, handler, options });

        // 实际添加事件监听器
        target.addEventListener(event, handler, options);
    }

    /**
     * 移除特定事件的所有监听器
     */
    public off(event: string): void {
        const listeners = this.listeners.get(event);
        if (listeners) {
            listeners.forEach(({ target, handler, options }) => {
                target.removeEventListener(event, handler, options);
            });
            this.listeners.delete(event);
        }
    }

    /**
     * 移除所有事件监听器
     */
    public removeAll(): void {
        this.listeners.forEach((listeners, event) => {
            listeners.forEach(({ target, handler, options }) => {
                target.removeEventListener(event, handler, options);
            });
        });
        this.listeners.clear();
    }

    /**
     * 创建一个防抖的事件处理器
     */
    public static debounce<T extends (...args: any[]) => void>(
        func: T,
        wait: number
    ): T {
        let timeout: ReturnType<typeof setTimeout>;
        return function (this: any, ...args: any[]) {
            clearTimeout(timeout);
            timeout = setTimeout(() => func.apply(this, args), wait);
        } as T;
    }

    /**
     * 创建一个节流的事件处理器
     */
    public static throttle<T extends (...args: any[]) => void>(
        func: T,
        limit: number
    ): T {
        let inThrottle: boolean;
        return function (this: any, ...args: any[]) {
            if (!inThrottle) {
                func.apply(this, args);
                inThrottle = true;
                setTimeout(() => inThrottle = false, limit);
            }
        } as T;
    }
}

/**
 * 页面可见性管理器
 */
export class VisibilityManager {
    private callbacks: Set<(visible: boolean) => void> = new Set();
    private isVisible: boolean = !document.hidden;

    constructor() {
        this.init();
    }

    private init(): void {
        // 监听多种可见性变化事件
        document.addEventListener('visibilitychange', this.handleVisibilityChange);
        window.addEventListener('blur', this.handleBlur);
        window.addEventListener('focus', this.handleFocus);
        window.addEventListener('pageshow', this.handlePageShow);
        window.addEventListener('pagehide', this.handlePageHide);
    }

    private handleVisibilityChange = (): void => {
        this.updateVisibility(!document.hidden);
    };

    private handleBlur = (): void => {
        this.updateVisibility(false);
    };

    private handleFocus = (): void => {
        this.updateVisibility(true);
    };

    private handlePageShow = (): void => {
        this.updateVisibility(true);
    };

    private handlePageHide = (): void => {
        this.updateVisibility(false);
    };

    private updateVisibility(visible: boolean): void {
        if (this.isVisible !== visible) {
            this.isVisible = visible;
            this.callbacks.forEach(callback => callback(visible));
        }
    }

    /**
     * 添加可见性变化回调
     */
    public onVisibilityChange(callback: (visible: boolean) => void): () => void {
        this.callbacks.add(callback);
        // 返回取消订阅函数
        return () => this.callbacks.delete(callback);
    }

    /**
     * 获取当前可见性状态
     */
    public get visible(): boolean {
        return this.isVisible;
    }

    /**
     * 清理资源
     */
    public destroy(): void {
        document.removeEventListener('visibilitychange', this.handleVisibilityChange);
        window.removeEventListener('blur', this.handleBlur);
        window.removeEventListener('focus', this.handleFocus);
        window.removeEventListener('pageshow', this.handlePageShow);
        window.removeEventListener('pagehide', this.handlePageHide);
        this.callbacks.clear();
    }
}

// 全局可见性管理器实例
export const visibilityManager = new VisibilityManager();