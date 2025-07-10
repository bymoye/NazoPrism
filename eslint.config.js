import js from '@eslint/js';
import typescript from '@typescript-eslint/eslint-plugin';
import typescriptParser from '@typescript-eslint/parser';
import astroParser from 'astro-eslint-parser';

export default [
  js.configs.recommended,
  {
    files: ['**/*.{js,mjs,cjs,ts,tsx}'],
    languageOptions: {
      parser: typescriptParser,
      parserOptions: {
        ecmaVersion: 'latest',
        sourceType: 'module',
      },
      globals: {
        // 浏览器环境
        window: 'readonly',
        document: 'readonly',
        console: 'readonly',
        setTimeout: 'readonly',
        clearTimeout: 'readonly',
        setInterval: 'readonly',
        clearInterval: 'readonly',
        requestAnimationFrame: 'readonly',
        cancelAnimationFrame: 'readonly',
        fetch: 'readonly',
        URL: 'readonly',
        Blob: 'readonly',
        Image: 'readonly',
        HTMLElement: 'readonly',
        HTMLImageElement: 'readonly',
        Element: 'readonly',
        IntersectionObserver: 'readonly',
        CustomEvent: 'readonly',
        MessageEvent: 'readonly',
        Worker: 'readonly',
        performance: 'readonly',
        sessionStorage: 'readonly',
        localStorage: 'readonly',
        ScrollBehavior: 'readonly',
        AddEventListenerOptions: 'readonly',

        // Worker 环境
        DedicatedWorkerGlobalScope: 'readonly',
        createImageBitmap: 'readonly',
        OffscreenCanvas: 'readonly',

        // Node.js 环境
        process: 'readonly',
      },
    },
    plugins: {
      '@typescript-eslint': typescript,
    },
    rules: {
      // 基础代码风格规则
      indent: ['error', 2],
      quotes: ['error', 'single'],
      semi: ['error', 'always'],
      'comma-dangle': ['error', 'always-multiline'],
      'object-curly-spacing': ['error', 'always'],
      'array-bracket-spacing': ['error', 'never'],

      // 放宽一些规则
      'no-unused-vars': 'off',
      'no-undef': 'error',
      'no-useless-catch': 'off', // 允许简单的 try-catch 包装

      // TypeScript 规则
      '@typescript-eslint/no-unused-vars': ['warn', { argsIgnorePattern: '^_' }],
      '@typescript-eslint/explicit-function-return-type': 'off',
      '@typescript-eslint/no-explicit-any': 'warn',

      // 暂时关闭命名规范，保持现有代码风格
      '@typescript-eslint/naming-convention': 'off',
    },
  },
  {
    // Astro 文件配置
    files: ['**/*.astro'],
    languageOptions: {
      parser: astroParser,
      parserOptions: {
        parser: '@typescript-eslint/parser',
        extraFileExtensions: ['.astro'],
        sourceType: 'module',
      },
      globals: {
        // Astro 全局变量
        Astro: 'readonly',
        // 浏览器环境
        window: 'readonly',
        document: 'readonly',
        console: 'readonly',
        setTimeout: 'readonly',
        clearTimeout: 'readonly',
        setInterval: 'readonly',
        clearInterval: 'readonly',
        requestAnimationFrame: 'readonly',
        cancelAnimationFrame: 'readonly',
        fetch: 'readonly',
        URL: 'readonly',
        Blob: 'readonly',
        Image: 'readonly',
        HTMLElement: 'readonly',
        Element: 'readonly',
        IntersectionObserver: 'readonly',
        CustomEvent: 'readonly',
        MessageEvent: 'readonly',
        Worker: 'readonly',
        performance: 'readonly',
        sessionStorage: 'readonly',
        localStorage: 'readonly',
      },
    },
    rules: {
      // 基础代码风格规则
      indent: ['error', 2],
      quotes: ['error', 'single'],
      semi: ['error', 'always'],
      'comma-dangle': ['error', 'always-multiline'],
      'object-curly-spacing': ['error', 'always'],
      'array-bracket-spacing': ['error', 'never'],

      // 放宽一些规则
      'no-unused-vars': 'off',
      'no-undef': 'error',
    },
  },
  {
    // 忽略特定文件
    ignores: [
      'dist/',
      'node_modules/',
      '.astro/',
      '**/*.astro', // 暂时忽略 Astro 文件，直到解析器稳定
    ],
  },
];
