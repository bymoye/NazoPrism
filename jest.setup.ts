import '@testing-library/jest-dom';

/**
 * 模拟IntersectionObserver API
 *
 * 为测试环境提供IntersectionObserver的基本实现
 * 支持observe、unobserve和disconnect方法
 */
(global as any).IntersectionObserver = class MockIntersectionObserver {
  private callback: IntersectionObserverCallback;
  private options: IntersectionObserverInit | undefined;
  private observedElements: Set<Element> = new Set();

  constructor(callback: IntersectionObserverCallback, options?: IntersectionObserverInit) {
    this.callback = callback;
    this.options = options || undefined;
  }

  /**
   * 开始观察目标元素
   * @param target - 要观察的DOM元素
   */
  observe(target: Element): void {
    this.observedElements.add(target);
    // 模拟立即触发回调
    this.callback(
      [
        {
          target,
          isIntersecting: true,
          intersectionRatio: 1,
          boundingClientRect: target.getBoundingClientRect(),
          intersectionRect: target.getBoundingClientRect(),
          rootBounds: null,
          time: Date.now(),
        } as IntersectionObserverEntry,
      ],
      this as any,
    );
  }

  /**
   * 停止观察目标元素
   * @param target - 要停止观察的DOM元素
   */
  unobserve(target: Element): void {
    this.observedElements.delete(target);
  }

  /**
   * 断开观察器连接
   */
  disconnect(): void {
    this.observedElements.clear();
  }

  /**
   * 获取当前观察的记录
   */
  takeRecords(): IntersectionObserverEntry[] {
    return [];
  }

  /**
   * 获取当前观察的根元素
   */
  get root(): Element | null {
    return (this.options?.root as Element | null) || null;
  }

  /**
   * 获取根边距
   */
  get rootMargin(): string {
    return this.options?.rootMargin || '0px';
  }

  /**
   * 获取阈值数组
   */
  get thresholds(): ReadonlyArray<number> {
    const threshold = this.options?.threshold;
    if (Array.isArray(threshold)) return threshold;
    if (typeof threshold === 'number') return [threshold];
    return [0];
  }
};

/**
 * Mock ResizeObserver API
 * 为测试环境提供ResizeObserver的模拟实现
 */
(global as any).ResizeObserver = class MockResizeObserver {
  /**
   * 构造函数
   * @param _callback - 回调函数（在mock中不使用）
   */
  constructor(_callback?: ResizeObserverCallback) {
    // Mock implementation
  }

  /**
   * 断开观察器连接
   */
  disconnect(): void {
    // Mock implementation
  }

  /**
   * 开始观察目标元素
   * @param _target - 要观察的目标元素
   * @param _options - 配置选项（在mock中不使用）
   */
  observe(_target: Element, _options?: ResizeObserverOptions): void {
    // Mock implementation
  }

  /**
   * 停止观察目标元素
   * @param _target - 要停止观察的目标元素
   */
  unobserve(_target: Element): void {
    // Mock implementation
  }
};

/**
 * Mock matchMedia API
 * 为测试环境提供matchMedia的模拟实现
 */
Object.defineProperty(window, 'matchMedia', {
  writable: true,
  value: jest.fn().mockImplementation(
    (query: string): MediaQueryList => ({
      matches: false,
      media: query,
      onchange: null,
      addListener: jest.fn(), // deprecated but kept for compatibility
      removeListener: jest.fn(), // deprecated but kept for compatibility
      addEventListener: jest.fn((_type: string, callback: EventListener) => {
        if (_type === 'load') {
          setTimeout(callback, 0);
        }
      }),
      removeEventListener: jest.fn(),
      dispatchEvent: jest.fn(),
    }),
  ),
});

/**
 * Mock Worker API with proper message handling
 * 为测试环境提供Worker的模拟实现，支持颜色提取功能
 */
(global as any).Worker = class MockWorker {
  public url: string;
  public onmessage: ((event: MessageEvent) => void) | null = null;
  public onerror: ((event: ErrorEvent) => void) | null = null;
  public onmessageerror: ((event: MessageEvent) => void) | null = null;

  /**
   * 构造函数
   * @param url - Worker脚本的URL
   */
  constructor(url: string | URL) {
    this.url = url.toString();
  }

  /**
   * 向Worker发送消息
   * @param data - 要发送的数据
   */
  postMessage(data: any): void {
    // 模拟异步Worker响应
    setTimeout(() => {
      if (this.onmessage) {
        // 模拟成功的颜色提取响应
        const mockResponse: MessageEvent = {
          data: {
            success: true,
            messageId: data.messageId,
            isPalette: data.extractMultiple ?? false,
            ...(data.extractMultiple
              ? {
                  colors: [0xff0000, 0x00ff00, 0x0000ff], // Mock ARGB colors
                  rgbColors: [
                    [255, 0, 0],
                    [0, 255, 0],
                    [0, 0, 255],
                  ], // Mock RGB colors
                }
              : {
                  color: 0xff0000, // Mock ARGB color
                  rgb: [255, 0, 0], // Mock RGB color
                }),
          },
        } as MessageEvent;
        this.onmessage(mockResponse);
      }
    }, 100); // 小延迟模拟处理时间
  }

  /**
   * 终止Worker
   */
  terminate(): void {
    this.onmessage = null;
    this.onerror = null;
    this.onmessageerror = null;
  }

  /**
   * 添加事件监听器
   * @param type - 事件类型
   * @param listener - 事件监听器
   */
  addEventListener(type: string, listener: EventListener): void {
    if (type === 'message') {
      this.onmessage = listener as (event: MessageEvent) => void;
    } else if (type === 'error') {
      this.onerror = listener as (event: ErrorEvent) => void;
    }
  }

  /**
   * 移除事件监听器
   * @param type - 事件类型
   * @param listener - 事件监听器
   */
  removeEventListener(type: string, listener: EventListener): void {
    if (type === 'message') {
      this.onmessage = null;
    } else if (type === 'error') {
      this.onerror = null;
    }
  }
};

/**
 * Mock OffscreenCanvas for Worker environment
 * 为Worker环境提供OffscreenCanvas的模拟实现
 */
(global as any).OffscreenCanvas = class MockOffscreenCanvas {
  public width: number;
  public height: number;

  /**
   * 构造函数
   * @param width - 画布宽度
   * @param height - 画布高度
   */
  constructor(width: number, height: number) {
    this.width = width;
    this.height = height;
  }

  /**
   * 获取绘图上下文
   * @param _type - 上下文类型（在mock中不使用）
   * @returns 模拟的绘图上下文
   */
  getContext(_type: string): any {
    return {
      drawImage: jest.fn(),
      getImageData: jest.fn(() => ({
        data: new Uint8ClampedArray(this.width * this.height * 4),
        width: this.width,
        height: this.height,
      })),
    };
  }

  /**
   * 转换为Blob对象
   * @returns Promise<Blob>
   */
  convertToBlob(): Promise<Blob> {
    return Promise.resolve(new Blob());
  }
};

/**
 * Mock createImageBitmap API
 * 为测试环境提供createImageBitmap的模拟实现
 */
(global as any).createImageBitmap = jest.fn(() =>
  Promise.resolve({
    width: 100,
    height: 100,
    close: jest.fn(),
  }),
);

/**
 * Mock localStorage API
 * 为测试环境提供localStorage的模拟实现
 */
const localStorageMock: Storage = {
  length: 0,
  key: jest.fn(),
  getItem: jest.fn(),
  setItem: jest.fn(),
  removeItem: jest.fn(),
  clear: jest.fn(),
};
(global as any).localStorage = localStorageMock;

/**
 * Console方法的原始实现备份
 * 用于在需要时恢复原始的console行为
 */
const originalError = console.error;
const originalWarn = console.warn;
const originalLog = console.log;

/**
 * 过滤并抑制测试环境中的噪音日志
 * 只抑制React act()警告和组件日志，保留其他重要错误信息
 */

/**
 * 重写console.error以过滤测试噪音
 * @param args - 传递给console.error的参数
 */
console.error = (...args: any[]): void => {
  const message = args.at(0);
  if (
    typeof message === 'string' &&
    (message.includes('Warning: An update to') ||
      message.includes('not wrapped in act') ||
      message.includes('ReactDOMTestUtils.act') ||
      message.includes('The current testing environment is not configured to support act') ||
      message.includes('主题更新失败') ||
      message.includes('从图片更新主题失败'))
  ) {
    return; // 抑制React act警告和主题错误
  }
  originalError.apply(console, args);
};

/**
 * 重写console.warn以过滤测试噪音
 * @param args - 传递给console.warn的参数
 */
console.warn = (...args: any[]): void => {
  const message = args.at(0);
  if (typeof message === 'string' && message.includes('[BackgroundCarousel]')) {
    return; // 抑制BackgroundCarousel警告
  }
  originalWarn.apply(console, args);
};

/**
 * 重写console.log以过滤测试噪音
 * @param args - 传递给console.log的参数
 */
console.log = (...args: any[]): void => {
  const message = args.at(0);
  if (
    typeof message === 'string' &&
    (message.includes('[BackgroundCarousel]') || message.includes('Actual seed color value'))
  ) {
    return; // 抑制BackgroundCarousel日志和测试调试日志
  }
  originalLog.apply(console, args);
};
