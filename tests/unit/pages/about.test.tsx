import { render, screen } from '@testing-library/react';
import AboutPage from '@/app/about/page';
import { ThemeProvider } from '@/contexts/ThemeContext';

// Mock extract-colors to avoid ES module issues
jest.mock('extract-colors', () => ({
  extractColors: jest.fn(),
}));

// Mock theme-manager
jest.mock('@/utils/theme-manager', () => ({
  themeManager: {
    initTheme: jest.fn().mockReturnValue(() => {
      // Mock cleanup function
    }),
    updateThemeFromColors: jest.fn(),
    updateThemeFromImage: jest.fn().mockResolvedValue(undefined),
    setDarkMode: jest.fn(),
    isDarkMode: jest.fn().mockReturnValue(false),
  },
}));

const renderWithTheme = (component: React.ReactElement) => {
  return render(<ThemeProvider>{component}</ThemeProvider>);
};

describe('About Page', () => {
  it('renders without crashing', () => {
    renderWithTheme(<AboutPage />);
    expect(
      screen.getByRole('heading', { name: '关于我们' })
    ).toBeInTheDocument();
  });

  it('displays the about page title', () => {
    renderWithTheme(<AboutPage />);
    expect(
      screen.getByRole('heading', { name: '关于我们' })
    ).toBeInTheDocument();
  });

  it('has proper page content', () => {
    renderWithTheme(<AboutPage />);
    expect(
      screen.getByRole('heading', { name: '关于我们' })
    ).toBeInTheDocument();
    expect(screen.getByText('这里是关于页面的内容。')).toBeInTheDocument();
  });
});
