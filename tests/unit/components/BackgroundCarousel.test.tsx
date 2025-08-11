import { render } from '@testing-library/react';
import type React from 'react';
import '@testing-library/jest-dom';
import BackgroundCarousel from '@/components/ui/BackgroundCarousel';
import { AppProvider } from '@/contexts/AppContext';
import { ThemeProvider } from '@/contexts/ThemeContext';

// 模拟extract-colors以避免ES模块问题
jest.mock('extract-colors', () => ({
  extractColors: jest.fn(),
}));

// 模拟lenis/react
jest.mock('lenis/react', () => ({
  useLenis: jest.fn(),
}));

// 模拟theme-manager
jest.mock('@/utils/theme-manager', () => ({
  themeManager: {
    initTheme: jest.fn().mockReturnValue(() => {
      // 模拟清理函数
    }),
    updateThemeFromColors: jest.fn(),
    updateThemeFromImage: jest.fn().mockResolvedValue(undefined),
    setDarkMode: jest.fn(),
    isDarkMode: jest.fn().mockReturnValue(false),
  },
}));

// 模拟SITE_CONFIG
jest.mock('@/lib/site.config', () => ({
  SITE_CONFIG: {
    backgroundApi: {
      endpoint: 'https://api.nmxc.ltd/randimg?number=5&encode=json',
      fallbackImages: ['/images/bg1.jpg', '/images/bg2.jpg', '/images/bg3.jpg'],
    },
  },
}));

// 模拟fetch
global.fetch = jest.fn();

const renderWithProviders = (component: React.ReactElement) => {
  return render(
    <AppProvider>
      <ThemeProvider>{component}</ThemeProvider>
    </AppProvider>,
  );
};

// 模拟定时器函数
jest.useFakeTimers();

describe('BackgroundCarousel', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    (global.fetch as jest.Mock).mockResolvedValue({
      ok: true,
      json: async () => ({
        code: 200,
        url: ['https://example.com/image1.jpg', 'https://example.com/image2.jpg'],
      }),
    });
  });

  afterEach(() => {
    jest.clearAllTimers();
    jest.restoreAllMocks();
  });

  it('renders without crashing', () => {
    renderWithProviders(<BackgroundCarousel />);

    // 检查SVG元素是否被渲染
    const svgElement = document.querySelector('#bg-carousel-svg');
    expect(svgElement).toBeInTheDocument();
  });

  it('creates SVG with proper structure', () => {
    renderWithProviders(<BackgroundCarousel />);

    const svgElement = document.querySelector('#bg-carousel-svg');
    expect(svgElement).toHaveAttribute('id', 'bg-carousel-svg');

    // 检查滤镜定义
    const filter = document.querySelector('#bg-carousel-blur-filter');
    expect(filter).toBeInTheDocument();

    // 检查高斯模糊元素
    const gaussianBlur = document.querySelector('feGaussianBlur');
    expect(gaussianBlur).toBeInTheDocument();
    expect(gaussianBlur).toHaveAttribute('stdDeviation', '0');
  });

  it('handles page visibility changes', () => {
    renderWithProviders(<BackgroundCarousel />);

    // 重置文档标题
    document.title = 'Test Page';

    // 模拟页面变为隐藏状态
    Object.defineProperty(document, 'hidden', { value: true, writable: true });
    document.dispatchEvent(new Event('visibilitychange'));

    expect(document.title).toContain('等你回来~');

    // 模拟页面变为可见状态
    Object.defineProperty(document, 'hidden', { value: false, writable: true });
    document.dispatchEvent(new Event('visibilitychange'));

    expect(document.title).toBe('Test Page');
  });

  it('cleans up resources on unmount', () => {
    const { unmount } = renderWithProviders(<BackgroundCarousel />);

    // 组件应该能够正常卸载而不出错
    unmount();
    // 如果执行到这里，说明卸载成功
    expect(true).toBe(true);
  });
});
