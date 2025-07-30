/**
 * @file __tests__/utils/theme-manager.test.ts
 * @description 测试主题管理器
 */

import { themeManager, clearThemeCache } from '@/utils/theme-manager';

// 内联测试数据
const testData = {
  colors: [{ hex: '#74ccc3' }, { hex: '#5a9b94' }, { hex: '#4a8b84' }],
  theme: {
    styles: [
      {
        ':root': {
          '--md-primary': '#74ccc3',
          '--md-secondary': '#5a9b94',
        },
      },
    ],
  },
};

// Mock extract-colors
jest.mock('extract-colors/lib/worker-wrapper', () => ({
  extractColors: jest.fn(),
}));

// Mock @poupe/theme-builder
jest.mock('@poupe/theme-builder', () => ({
  makeCSSTheme: jest.fn(),
}));

// Mock type-guards
jest.mock('../../utils/type-guards', () => ({
  isObject: jest.fn(),
}));

import { extractColors } from 'extract-colors/lib/worker-wrapper';
import { makeCSSTheme } from '@poupe/theme-builder';
import { isObject } from '@/utils/type-guards';

// Type assertions for mocked functions
const mockedExtractColors = extractColors as jest.MockedFunction<any>;
const mockedMakeCSSTheme = makeCSSTheme as jest.MockedFunction<any>;
const mockedIsObject = isObject as jest.MockedFunction<any>;

// Mock DOM methods
Object.defineProperty(window, 'matchMedia', {
  writable: true,
  value: jest.fn().mockImplementation(query => ({
    matches: false,
    media: query,
    onchange: null,
    addListener: jest.fn(),
    removeListener: jest.fn(),
    addEventListener: jest.fn(),
    removeEventListener: jest.fn(),
    dispatchEvent: jest.fn(),
  })),
});

// Mock document methods
Object.defineProperty(document, 'getElementById', {
  writable: true,
  value: jest.fn(),
});

Object.defineProperty(document, 'createElement', {
  writable: true,
  value: jest.fn(),
});

Object.defineProperty(document, 'head', {
  writable: true,
  value: {
    append: jest.fn(),
  },
});

describe('themeManager', () => {
  let mockStyleElement: {
    id: string;
    textContent: string;
  };
  let mockMediaQuery: {
    matches: boolean;
    addEventListener: jest.Mock;
    removeEventListener: jest.Mock;
  };
  let consoleWarnSpy: jest.SpyInstance;

  beforeEach(() => {
    jest.clearAllMocks();

    // Clear theme cache before each test
    clearThemeCache();

    // Mock console.warn to prevent test output pollution
    consoleWarnSpy = jest.spyOn(console, 'warn').mockImplementation(() => {});

    // Reset document.documentElement.dataset
    for (const key in document.documentElement.dataset) {
      if (Object.hasOwn(document.documentElement.dataset, key)) {
        delete document.documentElement.dataset[key];
      }
    }

    // Mock style element
    mockStyleElement = {
      id: '',
      textContent: '',
    };

    (document.createElement as jest.Mock).mockReturnValue(mockStyleElement);
    (document.getElementById as jest.Mock).mockReturnValue(null);

    // Mock media query
    mockMediaQuery = {
      matches: false,
      addEventListener: jest.fn(),
      removeEventListener: jest.fn(),
    };

    (window.matchMedia as jest.Mock).mockReturnValue(mockMediaQuery);

    // Mock makeCSSTheme
    mockedMakeCSSTheme.mockResolvedValue({
      styles: [
        {
          ':root': {
            '--md-primary': '#74ccc3',
            '--md-secondary': '#5a9b94',
          },
          "[data-theme='dark']": {
            '--md-primary': '#74ccc3',
            '--md-secondary': '#5a9b94',
          },
        },
      ],
    });

    // Mock isObject
    mockedIsObject.mockImplementation(
      (value: unknown) => value !== null && typeof value === 'object' && !Array.isArray(value),
    );

    // Mock extractColors
    mockedExtractColors.mockResolvedValue([
      {
        hex: '#74ccc3',
        red: 116,
        green: 204,
        blue: 195,
        area: 0.4,
        saturation: 0.5,
        lightness: 0.6,
        intensity: 0.7,
        hue: 180,
      },
      {
        hex: '#5a9b94',
        red: 90,
        green: 155,
        blue: 148,
        area: 0.3,
        saturation: 0.4,
        lightness: 0.5,
        intensity: 0.6,
        hue: 175,
      },
      {
        hex: '#8fd4cc',
        red: 143,
        green: 212,
        blue: 204,
        area: 0.3,
        saturation: 0.3,
        lightness: 0.7,
        intensity: 0.8,
        hue: 170,
      },
    ]);
  });

  afterEach(() => {
    consoleWarnSpy.mockRestore();
  });

  describe('initTheme', () => {
    test('应该初始化主题系统', async () => {
      const cleanup = await themeManager.initTheme();

      expect(document.documentElement.dataset.theme).toBeDefined();
      expect(mockedMakeCSSTheme).toHaveBeenCalled();
      expect(typeof cleanup).toBe('function');
    });
  });

  describe('setDarkMode', () => {
    test('应该设置深色模式', () => {
      themeManager.setDarkMode(true);
      expect(document.documentElement.dataset.theme).toBe('dark');
    });

    test('应该设置浅色模式', () => {
      themeManager.setDarkMode(false);
      expect(document.documentElement.dataset.theme).toBe('light');
    });
  });

  describe('isDarkMode', () => {
    test('应该检测深色模式状态', () => {
      document.documentElement.dataset.theme = 'dark';
      expect(themeManager.isDarkMode()).toBe(true);

      document.documentElement.dataset.theme = 'light';
      expect(themeManager.isDarkMode()).toBe(false);
    });

    test('应该回退到系统偏好', () => {
      delete document.documentElement.dataset.theme;
      mockMediaQuery.matches = true;

      expect(themeManager.isDarkMode()).toBe(true);
    });
  });

  describe('toggleDarkMode', () => {
    test('应该切换深色模式', () => {
      document.documentElement.dataset.theme = 'light';

      themeManager.toggleDarkMode();

      expect(document.documentElement.dataset.theme).toBe('dark');
      expect(document.documentElement.dataset.themeSetByUser).toBe('true');
    });

    test('应该强制设置深色模式', () => {
      document.documentElement.dataset.theme = 'light';

      themeManager.toggleDarkMode(true);

      expect(document.documentElement.dataset.theme).toBe('dark');
    });

    test('应该强制设置浅色模式', () => {
      document.documentElement.dataset.theme = 'dark';

      themeManager.toggleDarkMode(false);

      expect(document.documentElement.dataset.theme).toBe('light');
    });
  });

  describe('updateThemeFromColors', () => {
    test('应该从颜色数组更新主题', async () => {
      const colors = ['#ff0000', '#00ff00', '#0000ff'];

      await themeManager.updateThemeFromColors(colors);

      expect(mockedMakeCSSTheme).toHaveBeenCalledWith(
        expect.objectContaining({
          primary: '#ff0000',
          secondary: '#00ff00',
          tertiary: '#0000ff',
        }),
        expect.any(Object),
      );
    });

    test('应该使用默认颜色当输入为空', async () => {
      await themeManager.updateThemeFromColors([]);

      expect(mockedMakeCSSTheme).toHaveBeenCalledWith(
        expect.objectContaining({
          primary: '#74ccc3',
        }),
        expect.any(Object),
      );
    });

    test('应该应用生成的主题到DOM', async () => {
      await themeManager.updateThemeFromColors(['#ff0000']);

      expect(document.createElement).toHaveBeenCalledWith('style');
      expect(mockStyleElement.id).toBe('nazo-prism-theme');
      expect(mockStyleElement.textContent).toContain('--md-primary');
    });
  });

  describe('extractColorsFromImage', () => {
    test('应该从图片提取颜色', async () => {
      const imageUrl = 'https://example.com/image.jpg';

      const colors = await themeManager.extractColorsFromImage(imageUrl);

      expect(mockedExtractColors).toHaveBeenCalledWith(imageUrl, {
        pixels: 10000,
        distance: 0.22,
        colorValidator: expect.any(Function),
      });
      expect(colors).toEqual(['#74ccc3', '#5a9b94', '#8fd4cc']);
    });

    test('应该处理提取失败的情况', async () => {
      mockedExtractColors.mockRejectedValueOnce(new Error('提取失败'));

      const colors = await themeManager.extractColorsFromImage('invalid-url');

      expect(colors).toEqual(['#74ccc3', '#5a9b94', '#8fd4cc', '#4a7c75', '#3d6b65']);
    });
  });

  describe('updateThemeFromImage', () => {
    test('应该从图片更新主题', async () => {
      const imageUrl = 'https://example.com/image.jpg';

      await themeManager.updateThemeFromImage(imageUrl);

      expect(mockedExtractColors).toHaveBeenCalledWith(imageUrl, expect.any(Object));
      expect(mockedMakeCSSTheme).toHaveBeenCalledWith(
        expect.objectContaining({
          primary: '#74ccc3',
        }),
        expect.any(Object),
      );
    });

    test('应该处理图片加载失败', async () => {
      mockedExtractColors.mockRejectedValueOnce(new Error('图片加载失败'));

      await expect(themeManager.updateThemeFromImage('invalid-url')).resolves.not.toThrow();
      expect(mockedMakeCSSTheme).toHaveBeenCalledWith(
        expect.objectContaining({
          primary: '#74ccc3',
        }),
        expect.any(Object),
      );
    });
  });

  describe('DOM操作', () => {
    test('应该重用现有的style元素', async () => {
      (document.getElementById as jest.Mock).mockReturnValue(mockStyleElement);

      await themeManager.updateThemeFromColors(['#ff0000']);

      expect(document.createElement).not.toHaveBeenCalled();
      expect(mockStyleElement.textContent).toContain('--md-primary');
    });
  });
});
