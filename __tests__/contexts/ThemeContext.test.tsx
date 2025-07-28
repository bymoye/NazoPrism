/**
 * @file __tests__/contexts/ThemeContext.test.tsx
 * @description 测试 ThemeContext
 */

/* eslint-disable @typescript-eslint/no-explicit-any */

import React from 'react';
import { render, screen, act, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { ThemeProvider, useThemeContext } from '../../contexts/ThemeContext';

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

// Mock localStorage
const mockLocalStorage = {
  getItem: jest.fn(),
  setItem: jest.fn(),
  removeItem: jest.fn(),
  clear: jest.fn(),
};
Object.defineProperty(window, 'localStorage', {
  value: mockLocalStorage,
});

// Test component to access theme context
const TestComponent = () => {
  const {
    seedColor,
    isDark,
    isLoading,
    error,
    updateTheme,
    updateThemeFromImage,
    toggleDarkMode,
    setDarkMode,
  } = useThemeContext();

  return (
    <div>
      <div data-testid='seed-color'>{seedColor}</div>
      <div data-testid='is-dark'>{isDark.toString()}</div>
      <div data-testid='is-loading'>{isLoading.toString()}</div>
      <div data-testid='error'>{error || 'no-error'}</div>
      <button data-testid='toggle-dark-mode' onClick={toggleDarkMode}>
        Toggle Dark Mode
      </button>
      <button data-testid='set-dark-mode' onClick={() => setDarkMode(true)}>
        Set Dark Mode
      </button>
      <button data-testid='set-light-mode' onClick={() => setDarkMode(false)}>
        Set Light Mode
      </button>
      <button data-testid='update-theme' onClick={() => updateTheme(0xff5722)}>
        Update Theme
      </button>
      <button
        data-testid='update-theme-from-image'
        onClick={() => updateThemeFromImage('test-image.jpg')}
      >
        Update Theme From Image
      </button>
    </div>
  );
};

describe('ThemeContext', () => {
  let themeManager: {
    initTheme: jest.MockedFunction<any>;
    updateThemeFromColors: jest.MockedFunction<any>;
    updateThemeFromImage: jest.MockedFunction<any>;
    setDarkMode: jest.MockedFunction<any>;
    isDarkMode: jest.MockedFunction<any>;
  };

  beforeAll(async () => {
    const imported = (await import('../../utils/theme-manager')) as {
      themeManager: {
        initTheme: jest.MockedFunction<any>;
        updateThemeFromColors: jest.MockedFunction<any>;
        updateThemeFromImage: jest.MockedFunction<any>;
        setDarkMode: jest.MockedFunction<any>;
        isDarkMode: jest.MockedFunction<any>;
      };
    };
    themeManager = imported.themeManager;
  });

  beforeEach(() => {
    jest.clearAllMocks();
    mockLocalStorage.getItem.mockClear();
    mockLocalStorage.setItem.mockClear();
  });

  test('应该提供默认主题状态', async () => {
    render(
      <ThemeProvider>
        <TestComponent />
      </ThemeProvider>,
    );

    await waitFor(() => {
      const seedColorElement = screen.getByTestId('seed-color');
      expect(seedColorElement).toBeInTheDocument();
      expect(screen.getByTestId('is-dark')).toHaveTextContent('false');
      expect(screen.getByTestId('is-loading')).toHaveTextContent('false');
      expect(screen.getByTestId('error')).toHaveTextContent('no-error');
    });
  });

  test('应该能够切换深色模式', async () => {
    const user = userEvent.setup();

    render(
      <ThemeProvider>
        <TestComponent />
      </ThemeProvider>,
    );

    const toggleButton = screen.getByTestId('toggle-dark-mode');

    await act(async () => {
      await user.click(toggleButton);
    });

    expect(themeManager.setDarkMode).toHaveBeenCalledWith(true);
  });

  test('应该能够设置特定的深色模式状态', async () => {
    const user = userEvent.setup();

    render(
      <ThemeProvider>
        <TestComponent />
      </ThemeProvider>,
    );

    const setDarkButton = screen.getByTestId('set-dark-mode');

    await act(async () => {
      await user.click(setDarkButton);
    });

    expect(themeManager.setDarkMode).toHaveBeenCalledWith(true);
  });

  test('应该能够更新主题颜色', async () => {
    const user = userEvent.setup();

    render(
      <ThemeProvider>
        <TestComponent />
      </ThemeProvider>,
    );

    const updateButton = screen.getByTestId('update-theme');

    await act(async () => {
      await user.click(updateButton);
    });

    expect(themeManager.updateThemeFromColors).toHaveBeenCalledWith(['#ff5722']);
  });

  test('应该能够从图片更新主题', async () => {
    const user = userEvent.setup();

    render(
      <ThemeProvider>
        <TestComponent />
      </ThemeProvider>,
    );

    const updateFromImageButton = screen.getByTestId('update-theme-from-image');

    await act(async () => {
      await user.click(updateFromImageButton);
      // 等待异步操作完成
      await new Promise(resolve => setTimeout(resolve, 10));
    });

    expect(themeManager.updateThemeFromImage).toHaveBeenCalledWith('test-image.jpg', undefined);
  });

  test('应该处理主题更新错误', async () => {
    const user = userEvent.setup();
    themeManager.updateThemeFromColors.mockImplementation(() => {
      throw new Error('主题更新失败');
    });

    render(
      <ThemeProvider>
        <TestComponent />
      </ThemeProvider>,
    );

    const updateButton = screen.getByTestId('update-theme');

    await act(async () => {
      await user.click(updateButton);
      // 等待状态更新完成
      await new Promise(resolve => setTimeout(resolve, 0));
    });

    await waitFor(() => {
      expect(screen.getByTestId('error')).toHaveTextContent('主题更新失败');
    });
  });

  test('应该处理从图片更新主题的错误', async () => {
    const user = userEvent.setup();
    themeManager.updateThemeFromImage.mockRejectedValue(new Error('图片加载失败'));

    render(
      <ThemeProvider>
        <TestComponent />
      </ThemeProvider>,
    );

    const updateFromImageButton = screen.getByTestId('update-theme-from-image');

    await act(async () => {
      await user.click(updateFromImageButton);
      // 等待异步操作和状态更新完成
      await new Promise(resolve => setTimeout(resolve, 10));
    });

    await waitFor(() => {
      expect(screen.getByTestId('error')).toHaveTextContent('从图片更新主题失败');
    });
  });

  test('应该在初始化时调用 themeManager.initTheme', async () => {
    render(
      <ThemeProvider>
        <TestComponent />
      </ThemeProvider>,
    );

    await waitFor(() => {
      expect(themeManager.initTheme).toHaveBeenCalled();
    });
  });
});
