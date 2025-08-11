/* eslint-disable */
import '@testing-library/jest-dom';

/**
 * 声明queueMicrotask全局函数
 */
declare global {
  function queueMicrotask(callback: () => void): void;
}

/**
 * IntersectionObserver模拟实现
 */
globalThis.IntersectionObserver = class MockIntersectionObserver {
  readonly #callback: IntersectionObserverCallback;
  readonly #options: IntersectionObserverInit | undefined;
  readonly #observedElements = new Set<Element>();

  constructor(callback: IntersectionObserverCallback, options?: IntersectionObserverInit) {
    this.#callback = callback;
    this.#options = options;
  }

  observe = (target: Element): void => {
    this.#observedElements.add(target);
    this.#callback(
      [
        {
          target,
          isIntersecting: true,
          intersectionRatio: 1,
          boundingClientRect: target.getBoundingClientRect(),
          intersectionRect: target.getBoundingClientRect(),
          rootBounds: null,
          time: performance.now(),
        } satisfies IntersectionObserverEntry,
      ],
      this as IntersectionObserver,
    );
  };

  unobserve = (target: Element): void => {
    this.#observedElements.delete(target);
  };

  disconnect = (): void => {
    this.#observedElements.clear();
  };

  takeRecords = (): IntersectionObserverEntry[] => [];

  get root(): Element | null {
    return (this.#options?.root as Element | null) ?? null;
  }

  get rootMargin(): string {
    return this.#options?.rootMargin ?? '0px';
  }

  get thresholds(): readonly number[] {
    const { threshold } = this.#options ?? {};
    return Array.isArray(threshold) ? threshold : [threshold ?? 0];
  }
};

/**
 * ResizeObserver模拟实现
 */
globalThis.ResizeObserver = class MockResizeObserver {
  observe = (target: Element, options?: ResizeObserverOptions): void => {
    void target;
    void options;
  };
  unobserve = (target: Element): void => {
    void target;
  };
  disconnect = (): void => {
    /** ResizeObserver标准API要求的方法，用于断开所有观察 */
  };
};

/**
 * matchMedia模拟实现
 */
Object.assign(window, {
  matchMedia: jest.fn(
    (query: string): MediaQueryList => ({
      matches: false,
      media: query,
      onchange: null,
      addEventListener: jest.fn((eventType: string, callback: EventListener) => {
        if (eventType === 'load') {
          queueMicrotask(() => {
            callback(new Event('load'));
          });
        }
      }),
      removeEventListener: jest.fn(),
      addListener: jest.fn(),
      removeListener: jest.fn(),
      dispatchEvent: jest.fn(),
    }),
  ),
});

/**
 * Worker模拟实现
 */
globalThis.Worker = class MockWorker implements Worker {
  url: string;
  readonly #handlers = new Map<string, EventListener>();

  onerror: ((this: AbstractWorker, ev: ErrorEvent) => unknown) | null = null;
  onmessage: ((this: Worker, ev: MessageEvent) => unknown) | null = null;
  onmessageerror: ((this: Worker, ev: MessageEvent) => unknown) | null = null;

  constructor(url: URL | string) {
    this.url = url.toString();
  }

  postMessage = (data: { messageId: string; extractMultiple?: boolean }): void => {
    queueMicrotask(() => {
      const messageHandler = this.#handlers.get('message');
      if (messageHandler) {
        const mockResponseData = {
          success: true,
          messageId: data.messageId,
          isPalette: data.extractMultiple ?? false,
          ...(data.extractMultiple
            ? {
                colors: [0xff_00_00, 0x00_ff_00, 0x00_00_ff],
                rgbColors: [
                  [255, 0, 0],
                  [0, 255, 0],
                  [0, 0, 255],
                ],
              }
            : {
                color: 0xff_00_00,
                rgb: [255, 0, 0],
              }),
        } as const;

        messageHandler(new MessageEvent('message', { data: mockResponseData }));
      }
    });
  };

  terminate = (): void => {
    this.#handlers.clear();
  };

  addEventListener = (type: string, listener: EventListener): void => {
    this.#handlers.set(type, listener);
  };

  removeEventListener = (type: string, listener: EventListener): void => {
    void listener;
    this.#handlers.delete(type);
  };

  dispatchEvent = (event: Event): boolean => {
    void event;
    return true;
  };
};

/**
 * OffscreenCanvas模拟实现
 */
globalThis.OffscreenCanvas = class MockOffscreenCanvas {
  readonly #eventHandlers = new Map<string, EventListener>();
  width = 300;
  height = 150;
  oncontextlost: ((this: OffscreenCanvas, ev: Event) => unknown) | null = null;
  oncontextrestored: ((this: OffscreenCanvas, ev: Event) => unknown) | null = null;

  getContext = jest.fn().mockReturnValue({
    canvas: this,
    drawImage: jest.fn(),
    getImageData: jest.fn(() => ({
      data: new Uint8ClampedArray(4),
      width: 1,
      height: 1,
      colorSpace: 'srgb' as PredefinedColorSpace,
    })),
  });

  constructor(width = 300, height = 150) {
    this.width = width;
    this.height = height;
  }

  transferToImageBitmap = (): ImageBitmap =>
    ({
      width: this.width,
      height: this.height,
      close: jest.fn(),
    }) satisfies ImageBitmap;

  /** eslint-disable-next-line unicorn/no-useless-promise-resolve-reject */
  convertToBlob = async (): Promise<Blob> => Promise.resolve(new Blob());

  addEventListener = (type: string, listener: EventListener): void => {
    this.#eventHandlers.set(type, listener);
    if (type === 'contextlost') this.oncontextlost = listener as typeof this.oncontextlost;
    else if (type === 'contextrestored')
      this.oncontextrestored = listener as typeof this.oncontextrestored;
  };

  removeEventListener = (type: string, listener: EventListener): void => {
    void listener;
    this.#eventHandlers.delete(type);
    if (type === 'contextlost') this.oncontextlost = null;
    else if (type === 'contextrestored') this.oncontextrestored = null;
  };

  dispatchEvent = (event: Event): boolean => {
    void event;
    return true;
  };
};

/**
 * createImageBitmap模拟实现
 */
declare global {
  function createImageBitmap(image: ImageBitmapSource): Promise<ImageBitmap>;
}

globalThis.createImageBitmap = jest.fn().mockResolvedValue({
  width: 100,
  height: 100,
  close: jest.fn(),
} satisfies ImageBitmap);

/**
 * localStorage模拟实现
 */
Object.assign(globalThis, {
  localStorage: {
    length: 0,
    key: jest.fn(),
    getItem: jest.fn(),
    setItem: jest.fn(),
    removeItem: jest.fn(),
    clear: jest.fn(),
  } satisfies Storage,
});

/**
 * 控制台过滤实现
 */
const { error: originalError, warn: originalWarn } = console;

const errorFilters = [
  'Warning: An update to',
  'not wrapped in act',
  'ReactDOMTestUtils.act',
  'The current testing environment is not configured to support act',
  'You seem to have overlapping act() calls',
  '主题更新失败',
  '从图片更新主题失败',
  '从图片提取颜色失败',
  '主题操作失败',
];

const warnFilters = ['[BackgroundCarousel]'];

const shouldFilter = (message: unknown, filters: string[]): boolean =>
  typeof message === 'string' && filters.some(filter => message.includes(filter));

Object.assign(console, {
  error: (...args: unknown[]): void => {
    if (!shouldFilter(args[0], errorFilters)) {
      originalError(...args);
    }
  },
  warn: (...args: unknown[]): void => {
    if (!shouldFilter(args[0], warnFilters)) {
      originalWarn(...args);
    }
  },
});
