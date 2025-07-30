/**
 * @file __tests__/contexts/AppContext.test.tsx
 * @description 测试应用上下文
 */

import React from 'react';
import { render, screen, act } from '@testing-library/react';
import { renderHook } from '@testing-library/react';
import {
  AppProvider,
  useAppContext,
  type AppState,
  type AppContextType,
} from '@/contexts/AppContext';

describe('AppContext', () => {
  describe('AppProvider', () => {
    test('应该渲染子组件', () => {
      render(
        <AppProvider>
          <div data-testid='child'>Test Child</div>
        </AppProvider>,
      );

      expect(screen.getByTestId('child')).toBeInTheDocument();
      expect(screen.getByTestId('child')).toHaveTextContent('Test Child');
    });

    test('应该提供默认状态', () => {
      const TestComponent = () => {
        const { state } = useAppContext();
        return (
          <div>
            <div data-testid='loading'>{state.isLoading.toString()}</div>
            <div data-testid='error'>{state.error || 'null'}</div>
          </div>
        );
      };

      render(
        <AppProvider>
          <TestComponent />
        </AppProvider>,
      );

      expect(screen.getByTestId('loading')).toHaveTextContent('false');
      expect(screen.getByTestId('error')).toHaveTextContent('null');
    });

    test('应该提供上下文方法', () => {
      const TestComponent = () => {
        const { setLoading, setError } = useAppContext();
        return (
          <div>
            <button data-testid='set-loading' onClick={() => setLoading(true)}>
              Set Loading
            </button>
            <button data-testid='set-error' onClick={() => setError('Test error')}>
              Set Error
            </button>
          </div>
        );
      };

      render(
        <AppProvider>
          <TestComponent />
        </AppProvider>,
      );

      expect(screen.getByTestId('set-loading')).toBeInTheDocument();
      expect(screen.getByTestId('set-error')).toBeInTheDocument();
    });

    test('应该处理多个子组件', () => {
      render(
        <AppProvider>
          <div data-testid='child1'>Child 1</div>
          <div data-testid='child2'>Child 2</div>
        </AppProvider>,
      );

      expect(screen.getByTestId('child1')).toBeInTheDocument();
      expect(screen.getByTestId('child2')).toBeInTheDocument();
    });
  });

  describe('useAppContext', () => {
    test('应该返回上下文值', () => {
      const wrapper = ({ children }: { children: React.ReactNode }) => (
        <AppProvider>{children}</AppProvider>
      );

      const { result } = renderHook(() => useAppContext(), { wrapper });

      expect(result.current).toHaveProperty('state');
      expect(result.current).toHaveProperty('setLoading');
      expect(result.current).toHaveProperty('setError');
      expect(result.current.state.isLoading).toBe(false);
      expect(result.current.state.error).toBeNull();
    });

    test('应该在Provider外部使用时抛出错误', () => {
      const consoleSpy = jest.spyOn(console, 'error').mockImplementation();

      expect(() => {
        renderHook(() => useAppContext());
      }).toThrow('useAppContext must be used within an AppProvider');

      consoleSpy.mockRestore();
    });

    test('应该正确更新loading状态', () => {
      const TestComponent = () => {
        const { state, setLoading } = useAppContext();
        return (
          <div>
            <div data-testid='loading'>{state.isLoading.toString()}</div>
            <button data-testid='toggle-loading' onClick={() => setLoading(!state.isLoading)}>
              Toggle Loading
            </button>
          </div>
        );
      };

      render(
        <AppProvider>
          <TestComponent />
        </AppProvider>,
      );

      expect(screen.getByTestId('loading')).toHaveTextContent('false');

      act(() => {
        screen.getByTestId('toggle-loading').click();
      });

      expect(screen.getByTestId('loading')).toHaveTextContent('true');
    });

    test('应该正确更新error状态', () => {
      const TestComponent = () => {
        const { state, setError } = useAppContext();
        return (
          <div>
            <div data-testid='error'>{state.error || 'null'}</div>
            <button data-testid='set-error' onClick={() => setError('Test error')}>
              Set Error
            </button>
            <button data-testid='clear-error' onClick={() => setError(null)}>
              Clear Error
            </button>
          </div>
        );
      };

      render(
        <AppProvider>
          <TestComponent />
        </AppProvider>,
      );

      expect(screen.getByTestId('error')).toHaveTextContent('null');

      act(() => {
        screen.getByTestId('set-error').click();
      });

      expect(screen.getByTestId('error')).toHaveTextContent('Test error');

      act(() => {
        screen.getByTestId('clear-error').click();
      });

      expect(screen.getByTestId('error')).toHaveTextContent('null');
    });

    test('应该在多个组件间共享状态', () => {
      const Component1 = () => {
        const { state, setLoading } = useAppContext();
        return (
          <div>
            <div data-testid='loading1'>{state.isLoading.toString()}</div>
            <button data-testid='set-loading1' onClick={() => setLoading(true)}>
              Set Loading
            </button>
          </div>
        );
      };

      const Component2 = () => {
        const { state } = useAppContext();
        return <div data-testid='loading2'>{state.isLoading.toString()}</div>;
      };

      render(
        <AppProvider>
          <Component1 />
          <Component2 />
        </AppProvider>,
      );

      expect(screen.getByTestId('loading1')).toHaveTextContent('false');
      expect(screen.getByTestId('loading2')).toHaveTextContent('false');

      act(() => {
        screen.getByTestId('set-loading1').click();
      });

      expect(screen.getByTestId('loading1')).toHaveTextContent('true');
      expect(screen.getByTestId('loading2')).toHaveTextContent('true');
    });
  });

  describe('类型定义', () => {
    test('AppState类型应该正确', () => {
      const state: AppState = {
        isLoading: false,
        error: null,
      };

      expect(state).toHaveProperty('isLoading');
      expect(state).toHaveProperty('error');
      expect(typeof state.isLoading).toBe('boolean');
      expect(state.error === null || typeof state.error === 'string').toBe(true);
    });

    test('AppContextType类型应该正确', () => {
      const wrapper = ({ children }: { children: React.ReactNode }) => (
        <AppProvider>{children}</AppProvider>
      );

      const { result } = renderHook(() => useAppContext(), { wrapper });
      const context: AppContextType = result.current;

      expect(context).toHaveProperty('state');
      expect(context).toHaveProperty('setLoading');
      expect(context).toHaveProperty('setError');
      expect(typeof context.setLoading).toBe('function');
      expect(typeof context.setError).toBe('function');
    });
  });

  describe('边界情况', () => {
    test('应该处理快速连续的状态更新', () => {
      const TestComponent = () => {
        const { state, setLoading, setError } = useAppContext();
        return (
          <div>
            <div data-testid='loading'>{state.isLoading.toString()}</div>
            <div data-testid='error'>{state.error || 'null'}</div>
            <button
              data-testid='rapid-updates'
              onClick={() => {
                setLoading(true);
                setError('Error 1');
                setLoading(false);
                setError('Error 2');
              }}
            >
              Rapid Updates
            </button>
          </div>
        );
      };

      render(
        <AppProvider>
          <TestComponent />
        </AppProvider>,
      );

      act(() => {
        screen.getByTestId('rapid-updates').click();
      });

      expect(screen.getByTestId('loading')).toHaveTextContent('false');
      expect(screen.getByTestId('error')).toHaveTextContent('Error 2');
    });

    test('应该处理嵌套Provider', () => {
      const TestComponent = () => {
        const { state } = useAppContext();
        return <div data-testid='nested'>{state.isLoading.toString()}</div>;
      };

      render(
        <AppProvider>
          <AppProvider>
            <TestComponent />
          </AppProvider>
        </AppProvider>,
      );

      expect(screen.getByTestId('nested')).toHaveTextContent('false');
    });

    test('应该处理空children', () => {
      expect(() => {
        render(<AppProvider>{null}</AppProvider>);
      }).not.toThrow();

      expect(() => {
        render(<AppProvider>{undefined}</AppProvider>);
      }).not.toThrow();
    });
  });
});
