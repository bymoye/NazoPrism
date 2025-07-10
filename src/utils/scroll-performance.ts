/**
 * 滚动性能监控和优化工具
 * 用于监控滚动事件的性能表现
 */

interface ScrollMetrics {
    totalEvents: number;
    processedEvents: number;
    skippedEvents: number;
    averageProcessingTime: number;
    lastProcessingTime: number;
}

class ScrollPerformanceMonitor {
    private metrics: ScrollMetrics = {
        totalEvents: 0,
        processedEvents: 0,
        skippedEvents: 0,
        averageProcessingTime: 0,
        lastProcessingTime: 0
    };

    private processingTimes: number[] = [];
    private maxSamples = 100; // 保留最近100次的处理时间

    /**
     * 记录滚动事件处理开始
     */
    startProcessing(): number {
        this.metrics.totalEvents++;
        return performance.now();
    }

    /**
     * 记录滚动事件处理完成
     */
    endProcessing(startTime: number, wasSkipped: boolean = false): void {
        const endTime = performance.now();
        const processingTime = endTime - startTime;

        if (wasSkipped) {
            this.metrics.skippedEvents++;
        } else {
            this.metrics.processedEvents++;
            this.metrics.lastProcessingTime = processingTime;
            
            // 更新处理时间记录
            this.processingTimes.push(processingTime);
            if (this.processingTimes.length > this.maxSamples) {
                this.processingTimes.shift();
            }

            // 计算平均处理时间
            this.metrics.averageProcessingTime = 
                this.processingTimes.reduce((sum, time) => sum + time, 0) / this.processingTimes.length;
        }
    }

    /**
     * 获取性能指标
     */
    getMetrics(): ScrollMetrics & { 
        skipRate: number; 
        efficiency: number;
        isPerformant: boolean;
    } {
        const skipRate = this.metrics.totalEvents > 0 
            ? (this.metrics.skippedEvents / this.metrics.totalEvents) * 100 
            : 0;
        
        const efficiency = this.metrics.totalEvents > 0
            ? (this.metrics.processedEvents / this.metrics.totalEvents) * 100
            : 0;

        // 认为平均处理时间小于1ms且跳过率大于50%为高性能
        const isPerformant = this.metrics.averageProcessingTime < 1 && skipRate > 50;

        return {
            ...this.metrics,
            skipRate,
            efficiency,
            isPerformant
        };
    }

    /**
     * 重置指标
     */
    reset(): void {
        this.metrics = {
            totalEvents: 0,
            processedEvents: 0,
            skippedEvents: 0,
            averageProcessingTime: 0,
            lastProcessingTime: 0
        };
        this.processingTimes = [];
    }

    /**
     * 输出性能报告到控制台
     */
    logReport(): void {
        const metrics = this.getMetrics();
        console.group('📊 滚动性能报告');
        console.log(`总事件数: ${metrics.totalEvents}`);
        console.log(`处理事件数: ${metrics.processedEvents}`);
        console.log(`跳过事件数: ${metrics.skippedEvents}`);
        console.log(`跳过率: ${metrics.skipRate.toFixed(1)}%`);
        console.log(`处理效率: ${metrics.efficiency.toFixed(1)}%`);
        console.log(`平均处理时间: ${metrics.averageProcessingTime.toFixed(2)}ms`);
        console.log(`最近处理时间: ${metrics.lastProcessingTime.toFixed(2)}ms`);
        console.log(`性能状态: ${metrics.isPerformant ? '✅ 优秀' : '⚠️ 需要优化'}`);
        console.groupEnd();
    }
}

// 全局实例
export const scrollPerformanceMonitor = new ScrollPerformanceMonitor();

/**
 * 高性能滚动处理装饰器
 * 自动监控滚动处理函数的性能
 */
export function withScrollPerformanceMonitoring<T extends (...args: any[]) => void>(
    fn: T,
    threshold: number = 1
): T {
    let lastScrollTop = 0;
    let isFirstCall = true;

    return function (this: any, ...args: any[]) {
        const startTime = scrollPerformanceMonitor.startProcessing();
        const currentScrollTop = document.documentElement.scrollTop || document.body.scrollTop || 0;
        
        // 检查是否应该跳过此次处理
        const shouldSkip = !isFirstCall && Math.abs(currentScrollTop - lastScrollTop) < threshold;
        
        if (shouldSkip) {
            scrollPerformanceMonitor.endProcessing(startTime, true);
            return;
        }

        // 执行实际的滚动处理
        lastScrollTop = currentScrollTop;
        isFirstCall = false;
        fn.apply(this, args);
        
        scrollPerformanceMonitor.endProcessing(startTime, false);
    } as T;
}

/**
 * 定期输出性能报告（开发环境）
 */
if (import.meta.env.DEV) {
    setInterval(() => {
        const metrics = scrollPerformanceMonitor.getMetrics();
        if (metrics.totalEvents > 0) {
            scrollPerformanceMonitor.logReport();
            scrollPerformanceMonitor.reset();
        }
    }, 30000); // 每30秒输出一次报告
}
