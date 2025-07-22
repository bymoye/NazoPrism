import js from '@eslint/js';
import typescriptPlugin from '@typescript-eslint/eslint-plugin';
import typescriptParser from '@typescript-eslint/parser';
import astroParser from 'astro-eslint-parser';
import astroPlugin from 'eslint-plugin-astro';
import globals from 'globals';

export default [
  js.configs.recommended,

  // 基础 TypeScript 配置
  {
    plugins: {
      '@typescript-eslint': typescriptPlugin,
    },
    rules: {
      ...typescriptPlugin.configs.recommended.rules,
      'no-undef': 'off',
      '@typescript-eslint/no-unused-vars': ['warn', { argsIgnorePattern: '^_' }],
      '@typescript-eslint/no-explicit-any': 'warn',
    },
  },

  // JavaScript/TypeScript 文件配置
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

  // Astro 文件配置
  {
    files: ['**/*.astro'],
    plugins: {
      astro: astroPlugin,
    },
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
    rules: {
      // 应用推荐的 Astro 规则
      ...astroPlugin.configs.recommended.rules,

      // Astro 特定规则
      'astro/no-conflict-set-directives': 'error',
      'astro/no-unused-define-vars-in-style': 'error',
      'astro/no-set-html-directive': 'warn',
      'astro/prefer-class-list-directive': 'warn',
      'astro/prefer-object-class-list': 'warn',
      'astro/prefer-split-class-list': 'warn',
      'astro/sort-attributes': 'warn',

      // 在 Astro 文件中禁用一些可能冲突的规则
      '@typescript-eslint/no-unused-vars': [
        'warn',
        {
          argsIgnorePattern: '^_',
          varsIgnorePattern: '^_',
          ignoreRestSiblings: true,
        },
      ],
    },
  },

  // 忽略文件
  {
    ignores: ['dist/', 'node_modules/', '.astro/', '*.config.*'],
  },
];
