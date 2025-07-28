import React from 'react';
import { render } from '@testing-library/react';
import '@testing-library/jest-dom';
import { AppProvider } from '../../contexts/AppContext';
import { ThemeProvider } from '../../contexts/ThemeContext';
import BackgroundCarousel from '../../components/ui/BackgroundCarousel';

// Mock extract-colors to avoid ES module issues
jest.mock('extract-colors', () => ({
  extractColors: jest.fn(),
}));

// Mock theme-manager
jest.mock('../../utils/theme-manager', () => ({
  themeManager: {
    initTheme: jest.fn().mockResolvedValue(() => {}),
    updateThemeFromColors: jest.fn(),
    updateThemeFromImage: jest.fn().mockResolvedValue(undefined),
    setDarkMode: jest.fn(),
    isDarkMode: jest.fn().mockReturnValue(false),
  },
}));

// Mock the SITE_CONFIG
jest.mock('../../config/site.config', () => ({
  SITE_CONFIG: {
    backgroundApi: {
      endpoint: 'https://api.nmxc.ltd/randimg?number=5&encode=json',
      fallbackImages: ['/images/bg1.jpg', '/images/bg2.jpg', '/images/bg3.jpg'],
    },
  },
}));

// Mock fetch
global.fetch = jest.fn();

const renderWithProviders = (component: React.ReactElement) => {
  return render(
    <AppProvider>
      <ThemeProvider>{component}</ThemeProvider>
    </AppProvider>,
  );
};

// Mock the timer functions
jest.useFakeTimers();

describe('BackgroundCarousel', () => {
  // Mock console.log to avoid test output
  const originalConsoleLog = console.log;
  const originalConsoleWarn = console.warn;

  beforeAll(() => {
    console.log = jest.fn();
    console.warn = jest.fn();
  });

  afterAll(() => {
    console.log = originalConsoleLog;
    console.warn = originalConsoleWarn;
  });

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

    // Check if the SVG element is rendered
    const svgElement = document.querySelector('#bg-carousel-svg');
    expect(svgElement).toBeInTheDocument();
  });

  it('creates SVG with proper structure', () => {
    renderWithProviders(<BackgroundCarousel />);

    const svgElement = document.querySelector('#bg-carousel-svg');
    expect(svgElement).toHaveAttribute('id', 'bg-carousel-svg');

    // Check for filter definition
    const filter = document.querySelector('#bg-carousel-blur-filter');
    expect(filter).toBeInTheDocument();

    // Check for gaussian blur element
    const gaussianBlur = document.querySelector('feGaussianBlur');
    expect(gaussianBlur).toBeInTheDocument();
    expect(gaussianBlur).toHaveAttribute('stdDeviation', '0');
  });

  it('handles page visibility changes', () => {
    renderWithProviders(<BackgroundCarousel />);

    // Reset document title
    document.title = 'Test Page';

    // Simulate page becoming hidden
    Object.defineProperty(document, 'hidden', { value: true, writable: true });
    document.dispatchEvent(new Event('visibilitychange'));

    expect(document.title).toContain('等你回来~');

    // Simulate page becoming visible
    Object.defineProperty(document, 'hidden', { value: false, writable: true });
    document.dispatchEvent(new Event('visibilitychange'));

    expect(document.title).toBe('Test Page');
  });

  it('cleans up resources on unmount', () => {
    const { unmount } = renderWithProviders(<BackgroundCarousel />);

    // Component should unmount without errors
    expect(() => unmount()).not.toThrow();
  });
});
