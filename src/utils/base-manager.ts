/**
 * 基础管理器类，提供通用的生命周期管理
 */
export abstract class BaseManager {
    protected destroyed: boolean = false;

    /**
     * 初始化管理器
     */
    protected abstract init(): void;

    /**
     * 清理资源
     */
    public abstract destroy(): void;

    /**
     * 重新初始化
     */
    public reinit(): void {
        this.destroy();
        this.destroyed = false;
        this.init();
    }

    /**
     * 检查管理器是否已销毁
     */
    protected checkDestroyed(): boolean {
        if (this.destroyed) {
            console.warn(`Manager ${this.constructor.name} has been destroyed`);
            return true;
        }
        return false;
    }

    /**
     * 安全地获取DOM元素
     */
    protected getElement<T extends HTMLElement>(id: string): T | null {
        const element = document.getElementById(id) as T | null;
        if (!element && !this.destroyed) {
            console.warn(`Element with id "${id}" not found`);
        }
        return element;
    }

    /**
     * 安全地添加事件监听器
     */
    protected addEventListener(
        target: EventTarget,
        event: string,
        handler: EventListener,
        options?: AddEventListenerOptions
    ): void {
        if (!this.checkDestroyed()) {
            target.addEventListener(event, handler, options);
        }
    }

    /**
     * 安全地移除事件监听器
     */
    protected removeEventListener(
        target: EventTarget,
        event: string,
        handler: EventListener,
        options?: EventListenerOptions
    ): void {
        target.removeEventListener(event, handler, options);
    }
}

/**
 * 单例管理器工厂
 */
export class SingletonManager<T extends BaseManager> {
    private instance: T | null = null;
    private readonly ManagerClass: new () => T;

    constructor(ManagerClass: new () => T) {
        this.ManagerClass = ManagerClass;
    }

    /**
     * 获取或创建实例
     */
    public getInstance(): T {
        if (!this.instance) {
            this.instance = new this.ManagerClass();
        } else if ((this.instance as any).destroyed) {
            this.instance.reinit();
        }
        return this.instance;
    }

    /**
     * 销毁实例
     */
    public destroy(): void {
        if (this.instance) {
            this.instance.destroy();
            this.instance = null;
        }
    }
}