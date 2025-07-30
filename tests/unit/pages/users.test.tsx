import { render, screen } from '@testing-library/react';
import { ThemeProvider } from '@/contexts/ThemeContext';
import UsersPage from '@/app/users/page';

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
