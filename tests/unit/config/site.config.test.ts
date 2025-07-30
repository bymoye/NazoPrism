/**
 * 测试配置模块的导出
 */

import { SITE_CONFIG, SAMPLE_ARTICLES } from '@/lib/site.config';

describe('config/site.config', () => {
  test('应该导出配置数据', () => {
    expect(SITE_CONFIG).toBeDefined();
    expect(SAMPLE_ARTICLES).toBeDefined();
    expect(typeof SITE_CONFIG).toBe('object');
    expect(Array.isArray(SAMPLE_ARTICLES)).toBe(true);
  });

  test('SITE_CONFIG应该包含必要的字段', () => {
    expect(SITE_CONFIG).toHaveProperty('title');
    expect(SITE_CONFIG).toHaveProperty('description');
    expect(SITE_CONFIG).toHaveProperty('author');
    expect(SITE_CONFIG).toHaveProperty('navigation');
    expect(Array.isArray(SITE_CONFIG.navigation)).toBe(true);
  });

  test('SAMPLE_ARTICLES应该包含有效的文章数据', () => {
    expect(SAMPLE_ARTICLES.length).toBeGreaterThan(0);
    SAMPLE_ARTICLES.forEach(article => {
      expect(article).toHaveProperty('id');
      expect(article).toHaveProperty('title');
      expect(article).toHaveProperty('content');
      expect(article).toHaveProperty('time');
    });
  });
});
