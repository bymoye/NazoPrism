import { render, screen } from '@testing-library/react';
import { ThemeProvider } from '@/contexts/ThemeContext';
import HomePage from '@/app/page';

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

// Mock the BackgroundCarousel
jest.mock('../../components/ui/BackgroundCarousel', () => {
  const MockBackgroundCarousel = () => {
    return <div data-testid='background-carousel'>Background Carousel</div>;
  };
  return MockBackgroundCarousel;
});

// Mock the Cover component
jest.mock('../../components/ui/Cover', () => {
  const MockCover = () => {
    return <div data-testid='cover'>Cover Component</div>;
  };
  return MockCover;
});

// Mock the ArticleIndex component
jest.mock('../../components/ui/ArticleIndex', () => {
  const MockArticleIndex = () => {
    return <div data-testid='article-index'>Article Index</div>;
  };
  return MockArticleIndex;
});

const renderWithTheme = (component: React.ReactElement) => {
  return render(<ThemeProvider>{component}</ThemeProvider>);
};

describe('Home Page', () => {
  it('renders without crashing', () => {
    renderWithTheme(<HomePage />);
    expect(screen.getByTestId('cover')).toBeInTheDocument();
    expect(screen.getByTestId('article-index')).toBeInTheDocument();
  });

  it('renders the cover component', () => {
    renderWithTheme(<HomePage />);
    expect(screen.getByTestId('cover')).toBeInTheDocument();
  });

  it('renders the article index', () => {
    renderWithTheme(<HomePage />);
    expect(screen.getByTestId('article-index')).toBeInTheDocument();
  });
});
