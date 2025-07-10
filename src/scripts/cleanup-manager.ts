/**
 * Global Cleanup Manager
 * 管理所有组件的清理，防止内存泄漏
 */

import { destroyProgressBar } from './progress-bar';

interface CleanupHandler {
    name: string;
    cleanup: () => void;
}

class CleanupManager {
    private static instance: CleanupManager;
    private handlers: CleanupHandler[] = [];
    private isCleanupRegistered = false;

    private constructor() { }

    static getInstance(): CleanupManager {
        if (!CleanupManager.instance) {
            CleanupManager.instance = new CleanupManager();
        }
        return CleanupManager.instance;
    }

    /**
     * 注册清理处理器
     */
    register(name: string, cleanup: () => void): void {
        this.handlers.push({ name, cleanup });


        // 第一次注册时设置页面卸载监听器
        if (!this.isCleanupRegistered) {
            this.setupCleanupListeners();
            this.isCleanupRegistered = true;
        }
    }

    /**
     * 移除清理处理器
     */
    unregister(name: string): void {
        const index = this.handlers.findIndex(h => h.name === name);
        if (index !== -1) {
            this.handlers.splice(index, 1);

        }
    }

    /**
     * 执行所有清理
     */
    cleanupAll(): void {
        this.handlers.forEach(({ cleanup }) => {
            try {
                cleanup();
            } catch (error) {
                // 静默处理错误
            }
        });

        this.handlers = [];
    }

    /**
     * 设置页面卸载监听器
     */
    private setupCleanupListeners(): void {
        // 页面卸载时清理
        window.addEventListener('beforeunload', () => {
            this.cleanupAll();
        });

    }
}

/**
 * 全局清理管理器实例
 */
export const cleanupManager = CleanupManager.getInstance();

/**
 * 注册组件清理
 */
export function registerCleanup(name: string, cleanup: () => void): void {
    cleanupManager.register(name, cleanup);
}

/**
 * 移除组件清理
 */
export function unregisterCleanup(name: string): void {
    cleanupManager.unregister(name);
}

/**
 * 手动执行清理
 */
export function performCleanup(): void {
    cleanupManager.cleanupAll();
}

/**
 * 初始化清理管理器
 */
export function initCleanupManager(): void {


    // 注册内置组件的清理
    registerCleanup('progress-bar', () => {
        destroyProgressBar();
    });
}
