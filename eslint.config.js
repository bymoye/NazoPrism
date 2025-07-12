import js from '@eslint/js';
import typescriptPlugin from '@typescript-eslint/eslint-plugin';
import typescriptParser from '@typescript-eslint/parser';
import astroParser from 'astro-eslint-parser';
import unicorn from 'eslint-plugin-unicorn';
import globals from 'globals';

export default [
  js.configs.recommended,

  {
    plugins: {
      '@typescript-eslint': typescriptPlugin,
      unicorn: unicorn,
    },
    rules: {
      ...typescriptPlugin.configs.recommended.rules,

      // 现有规则保持不变
      'no-undef': 'off',
      '@typescript-eslint/no-unused-vars': ['warn', { argsIgnorePattern: '^_' }],
      '@typescript-eslint/no-explicit-any': 'warn',

      // Unicorn 浏览器友好规则
      'unicorn/prefer-query-selector': 'error',
      'unicorn/prefer-dom-node-text-content': 'error',
      'unicorn/filename-case': [
        'error',
        {
          cases: { kebabCase: true },
          ignore: ['README.md', 'LICENSE', 'CHANGELOG.md'],
        },
      ],
    },
  },

  {
    files: ['**/*.{js,mjs,cjs,ts,tsx}'],
    languageOptions: {
      parser: typescriptParser,
      parserOptions: {
        ecmaVersion: 'latest',
        sourceType: 'module',
      },
      globals: {
        ...globals.browser,
      },
    },
    rules: {
      'no-useless-catch': 'off',
    },
  },

  {
    files: ['**/*.astro'],
    languageOptions: {
      parser: astroParser,
      parserOptions: {
        parser: '@typescript-eslint/parser',
        extraFileExtensions: ['.astro'],
      },
      globals: {
        ...globals.browser,
        Astro: 'readonly',
      },
    },
  },

  {
    ignores: ['dist/', 'node_modules/', '.astro/'],
  },
];
