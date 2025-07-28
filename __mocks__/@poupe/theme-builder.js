// Mock implementation of @poupe/theme-builder
export const makeCSSTheme = jest.fn((colors, _options) => ({
  styles: [
    {
      ':root': {
        '--md-primary': colors.primary || '#74ccc3',
        '--md-secondary': colors.secondary || '#5a9b94',
        '--md-tertiary': colors.tertiary || '#8fd4cc',
        '--md-neutral': colors.neutral || '#4a7c75',
        '--md-neutral-variant': colors.neutralVariant || '#3d6b65',
        '--md-error': colors.error || '#ff5722',
      },
    },
  ],
}));
