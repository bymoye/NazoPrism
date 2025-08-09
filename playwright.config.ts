import { defineConfig, devices } from '@playwright/test';

/**
 * Playwright端到端测试配置
 * @see https://playwright.dev/docs/test-configuration
 */
export default defineConfig({
  testDir: './tests/e2e',
  /* 并行运行测试 */
  fullyParallel: true,
  /* 在CI中失败时不重试 */
  forbidOnly: !!process.env.CI,
  /* 在CI中重试失败的测试 */
  retries: process.env.CI ? 2 : 0,
  /* 在CI中选择工作进程数量 */
  workers: process.env.CI ? 1 : 4,
  /* 报告器配置 */
  reporter: 'html',
  /* 全局测试设置 */
  use: {
    /* 基础URL */
    baseURL: 'http://localhost:3000',
    /* 收集失败测试的跟踪信息 */
    trace: 'on-first-retry',
  },

  /* 配置不同浏览器的测试项目 */
  projects: [
    {
      name: 'chromium',
      use: { ...devices['Desktop Chrome'] },
    },

    {
      name: 'firefox',
      use: { ...devices['Desktop Firefox'] },
    },

    {
      name: 'webkit',
      use: { ...devices['Desktop Safari'] },
    },

    /* 移动端测试 */
    {
      name: 'Mobile Chrome',
      use: { ...devices['Pixel 5'] },
    },
    {
      name: 'Mobile Safari',
      use: { ...devices['iPhone 12'] },
    },
  ],

  /* 在测试开始前启动开发服务器 */
  webServer: {
    command: 'npm run dev',
    port: 3000,
    reuseExistingServer: !process.env.CI,
    timeout: 120_000, // 增加超时时间到120秒
    stdout: 'pipe', // 显示服务器输出用于调试
    stderr: 'pipe', // 显示服务器错误用于调试
  },
});
