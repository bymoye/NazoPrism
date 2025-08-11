import { render, screen } from '@testing-library/react';
import UsersPage from '@/app/users/page';
import { ThemeProvider } from '@/contexts/ThemeContext';

// Mock extract-colors to avoid ES module issues
jest.mock('extract-colors', () => ({
  extractColors: jest.fn(),
}));

// Mock theme-manager
jest.mock('@/utils/theme-manager', () => ({
  themeManager: {
    initTheme: jest.fn(() => () => {
      // Mock cleanup function
    }), // 返回清理函数
    updateThemeFromColors: jest.fn(),
    updateThemeFromImage: jest.fn().mockResolvedValue(undefined),
    setDarkMode: jest.fn(),
    isDarkMode: jest.fn().mockReturnValue(false),
  },
}));

// Mock type-guards
jest.mock('@/utils/type-guards', () => ({
  isArray: jest.fn(value => Array.isArray(value)),
  isError: jest.fn(value => value instanceof Error),
}));

const renderWithTheme = (component: React.ReactElement) => {
  return render(<ThemeProvider>{component}</ThemeProvider>);
};

describe('Users Page', () => {
  it('renders without crashing', () => {
    renderWithTheme(<UsersPage />);
    expect(screen.getByText('用户')).toBeInTheDocument();
  });

  it('displays the users page title', () => {
    renderWithTheme(<UsersPage />);
    expect(screen.getByText('用户')).toBeInTheDocument();
  });

  it('has proper page content', () => {
    renderWithTheme(<UsersPage />);
    expect(screen.getByText('用户')).toBeInTheDocument();
    expect(screen.getByText('这里是用户页面的内容。')).toBeInTheDocument();
  });
});
