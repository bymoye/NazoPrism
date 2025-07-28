import nextJest from 'next/jest.js';

/**
 * 创建Jest配置函数
 */
const createJestConfig = nextJest({
  // 提供Next.js应用路径以加载next.config.js和.env文件
  dir: './',
});

/**
 * Jest自定义配置
 */
const customJestConfig = {
  // 测试环境设置
  testEnvironment: 'jsdom',
  setupFilesAfterEnv: ['<rootDir>/jest.setup.ts'],

  // 测试文件匹配模式
  testMatch: ['**/__tests__/**/*.(ts|tsx|js|jsx)', '**/*.(test|spec).(ts|tsx|js|jsx)'],

  // 忽略的测试路径
  testPathIgnorePatterns: [
    '<rootDir>/.next/',
    '<rootDir>/node_modules/',
    '<rootDir>/out/',
    '<rootDir>/dist/',
  ],

  // 模块名称映射
  moduleNameMapper: {
    // 路径别名映射
    '^@/(.*)$': '<rootDir>/$1',
    '^@/components/(.*)$': '<rootDir>/components/$1',
    '^@/contexts/(.*)$': '<rootDir>/contexts/$1',
    '^@/hooks/(.*)$': '<rootDir>/hooks/$1',
    '^@/utils/(.*)$': '<rootDir>/utils/$1',
    '^@/types/(.*)$': '<rootDir>/types/$1',
    '^@/styles/(.*)$': '<rootDir>/styles/$1',

    // 第三方库模拟
    '^@poupe/theme-builder$': '<rootDir>/__mocks__/@poupe/theme-builder.js',

    // CSS和静态资源模拟
    '\\.(css|less|scss|sass)$': 'identity-obj-proxy',
    '\\.(jpg|jpeg|png|gif|eot|otf|webp|svg|ttf|woff|woff2|mp4|webm|wav|mp3|m4a|aac|oga)$':
      '<rootDir>/__mocks__/fileMock.js',
  },

  // 转换忽略模式
  transformIgnorePatterns: ['node_modules/(?!(extract-colors|@poupe\\/theme-builder|@next|next)/)'],

  // ESM支持
  extensionsToTreatAsEsm: ['.ts', '.tsx'],
  globals: {
    'ts-jest': {
      useESM: true,
      tsconfig: {
        jsx: 'react-jsx',
      },
    },
  },

  // 覆盖率收集配置
  collectCoverageFrom: [
    'components/**/*.{js,jsx,ts,tsx}',
    'contexts/**/*.{js,jsx,ts,tsx}',
    'hooks/**/*.{js,jsx,ts,tsx}',
    'utils/**/*.{js,jsx,ts,tsx}',
    'app/**/*.{js,jsx,ts,tsx}',
    '!**/*.d.ts',
    '!**/node_modules/**',
    '!**/.next/**',
    '!**/coverage/**',
    '!**/*.config.{js,mjs,ts}',
    '!**/jest.setup.ts',
  ],

  // 覆盖率阈值
  coverageThreshold: {
    global: {
      branches: 70,
      functions: 70,
      lines: 70,
      statements: 70,
    },
  },

  // 覆盖率报告格式
  coverageReporters: ['text', 'lcov', 'html'],

  // 测试超时设置
  testTimeout: 10000,

  // 详细输出
  verbose: true,

  // 错误时停止
  bail: false,

  // 最大并发数
  maxWorkers: '50%',
};

// 导出Jest配置，确保next/jest能够加载异步的Next.js配置
export default createJestConfig(customJestConfig);
