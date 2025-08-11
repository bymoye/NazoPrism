/**
 * 测试导航上下文
 */

import { render, renderHook, screen } from '@testing-library/react';
import { usePathname, useRouter } from 'next/navigation';
import type React from 'react';
import { NavigationProvider, useNavigationContext } from '@/contexts/NavigationContext';

// Mock Next.js hooks
jest.mock('next/navigation', () => ({
  usePathname: jest.fn(),
  useRouter: jest.fn(),
}));

const mockPush = jest.fn();
const mockUseRouter = useRouter as jest.MockedFunction<typeof useRouter>;
const mockUsePathname = usePathname as jest.MockedFunction<typeof usePathname>;

describe('NavigationContext', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    mockUseRouter.mockReturnValue({
      push: mockPush,
      back: jest.fn(),
      forward: jest.fn(),
      refresh: jest.fn(),
      replace: jest.fn(),
      prefetch: jest.fn(),
    });
    mockUsePathname.mockReturnValue('/');
  });

  const renderWithProvider = (children: React.ReactNode, pathname = '/') => {
    mockUsePathname.mockReturnValue(pathname);
    return render(<NavigationProvider>{children}</NavigationProvider>);
  };

  test('应该提供导航状态', () => {
    const TestComponent = () => {
      const { currentPath, isMenuOpen } = useNavigationContext();
      return (
        <div>
          <div data-testid='current-path'>{currentPath}</div>
          <div data-testid='menu-open'>{isMenuOpen.toString()}</div>
        </div>
      );
    };

    renderWithProvider(<TestComponent />);

    expect(screen.getByTestId('current-path')).toHaveTextContent('/');
    expect(screen.getByTestId('menu-open')).toHaveTextContent('false');
  });

  test('应该检查当前路径', () => {
    const TestComponent = () => {
      const { isCurrentPath } = useNavigationContext();
      return <div data-testid='is-current'>{isCurrentPath('/').toString()}</div>;
    };

    renderWithProvider(<TestComponent />);
    expect(screen.getByTestId('is-current')).toHaveTextContent('true');
  });

  test('应该在Provider外部使用时抛出错误', () => {
    const consoleSpy = jest.spyOn(console, 'error').mockImplementation();

    expect(() => {
      renderHook(() => useNavigationContext());
    }).toThrow('useNavigationContext must be used within a NavigationProvider');

    consoleSpy.mockRestore();
  });
});
