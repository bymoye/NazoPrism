import { expect, test } from '@playwright/test';

/**
 * 导航组件端到端测试
 * 测试移动端导航背景和抽屉功能
 */

// 正则表达式常量
const OPEN_CLASS_REGEX = /open/;
test.describe('Navigation Component', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('/');
  });

  test.describe('桌面端导航', () => {
    test('应该显示正确的导航背景样式', async ({ page }) => {
      // 设置桌面端视口
      await page.setViewportSize({ width: 1200, height: 800 });

      // 等待导航加载
      const nav = page.locator('nav[id="navigation"]');
      await expect(nav).toBeVisible();

      // 检查导航是否有正确的背景样式（非透明）
      const navStyles = await nav.evaluate((el) => {
        const styles = window.getComputedStyle(el);
        return {
          background: styles.background,
          backdropFilter: styles.backdropFilter,
          boxShadow: styles.boxShadow,
        };
      });

      // 验证背景不是透明的
      expect(navStyles.background).not.toBe('transparent');
      expect(navStyles.background).not.toBe('rgba(0, 0, 0, 0)');
      expect(navStyles.backdropFilter).not.toBe('none');
    });
  });

  test.describe('移动端导航', () => {
    test('应该显示正确的移动端导航背景样式', async ({ page }) => {
      // 设置移动端视口
      await page.setViewportSize({ width: 375, height: 667 });

      // 等待移动端检测生效
      await page.waitForTimeout(200);

      // 等待导航加载
      const nav = page.locator('nav[id="navigation"]');
      await expect(nav).toBeVisible();

      // 检查移动端导航是否有正确的背景样式（非透明）
      const navStyles = await nav.evaluate((el) => {
        const styles = window.getComputedStyle(el);
        return {
          background: styles.background,
          backdropFilter: styles.backdropFilter,
          boxShadow: styles.boxShadow,
        };
      });

      // 验证移动端背景不是透明的
      expect(navStyles.background).not.toBe('transparent');
      expect(navStyles.background).not.toBe('rgba(0, 0, 0, 0)');
      expect(navStyles.backdropFilter).not.toBe('none');
    });

    test('汉堡菜单按钮应该正常工作', async ({ page }) => {
      // 设置移动端视口
      await page.setViewportSize({ width: 375, height: 667 });

      // 等待移动端检测生效
      await page.waitForTimeout(200);

      // 等待汉堡按钮加载
      const hamburgerButton = page.locator('button[aria-label="打开导航菜单"]');
      await expect(hamburgerButton).toBeVisible();

      // 初始状态下抽屉应该是关闭的
      const drawer = page.locator('[class*="mobileDrawer"]');
      await expect(drawer).not.toHaveClass(OPEN_CLASS_REGEX);

      // 点击汉堡按钮打开抽屉
      await hamburgerButton.click();

      // 等待抽屉打开
      await expect(drawer).toHaveClass(OPEN_CLASS_REGEX);

      // 验证抽屉内容可见
      const drawerContent = page.locator('[class*="drawerContent"]');
      await expect(drawerContent).toBeVisible();
    });

    test('抽屉展开时不应该出现页面边缘白线', async ({ page }) => {
      // 设置移动端视口
      await page.setViewportSize({ width: 375, height: 667 });

      // 等待移动端检测生效
      await page.waitForTimeout(200);

      // 记录初始页面宽度
      const initialWidth = await page.evaluate(() => document.body.scrollWidth);

      // 打开抽屉
      const hamburgerButton = page.locator('button[aria-label="打开导航菜单"]');
      await hamburgerButton.click();

      // 等待抽屉动画完成
      await page.waitForTimeout(500);

      // 检查页面宽度是否保持一致（没有出现滚动条导致的宽度变化）
      const finalWidth = await page.evaluate(() => document.body.scrollWidth);
      expect(finalWidth).toBe(initialWidth);

      // 检查body是否有正确的padding-right来补偿滚动条
      const bodyStyles = await page.evaluate(() => {
        const styles = window.getComputedStyle(document.body);
        return {
          overflow: styles.overflow,
          paddingRight: styles.paddingRight,
        };
      });

      // 验证overflow被设置为hidden
      expect(bodyStyles.overflow).toBe('hidden');

      // 关闭抽屉
      const overlay = page.locator('[class*="drawerOverlay"]');
      await overlay.click();

      // 等待抽屉关闭动画完成
      await page.waitForTimeout(500);

      // 验证body样式恢复正常
      const restoredBodyStyles = await page.evaluate(() => {
        const styles = window.getComputedStyle(document.body);
        return {
          overflow: styles.overflow,
          paddingRight: styles.paddingRight,
        };
      });

      expect(restoredBodyStyles.paddingRight).toBe('0px');
    });

    test('点击抽屉外部应该关闭抽屉', async ({ page }) => {
      // 设置移动端视口
      await page.setViewportSize({ width: 375, height: 667 });

      // 等待移动端检测生效
      await page.waitForTimeout(200);

      // 打开抽屉
      const hamburgerButton = page.locator('button[aria-label="打开导航菜单"]');
      await hamburgerButton.click();

      // 验证抽屉已打开
      const drawer = page.locator('[class*="mobileDrawer"]');
      await expect(drawer).toHaveClass(OPEN_CLASS_REGEX);

      // 点击遮罩层关闭抽屉
      const overlay = page.locator('[class*="drawerOverlay"]');
      await overlay.click();

      // 验证抽屉已关闭
      await expect(drawer).not.toHaveClass(OPEN_CLASS_REGEX);
    });
  });

  test.describe('导航链接功能', () => {
    test('导航链接应该正常工作', async ({ page }) => {
      // 设置桌面端视口
      await page.setViewportSize({ width: 1200, height: 800 });

      // 查找导航链接
      const navLinks = page.locator('nav a[href]');
      const linkCount = await navLinks.count();

      // 验证至少有一个导航链接
      expect(linkCount).toBeGreaterThan(0);

      // 测试第一个链接（通常是Logo或首页链接）
      if (linkCount > 0) {
        const firstLink = navLinks.first();
        await expect(firstLink).toBeVisible();

        // 验证链接有href属性
        const href = await firstLink.getAttribute('href');
        expect(href).toBeTruthy();
      }
    });
  });
});
