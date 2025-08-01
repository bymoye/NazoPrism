/**
 * @file config/site.config.ts
 * @description Next.js应用程序站点配置
 */

import type { ExtendedArticle } from '@/types/content';

/**
 * 站点配置类型定义
 */
interface SiteConfiguration {
  readonly title: string;
  readonly description: string;
  readonly author: string;
  readonly url: string;
  readonly navigation: ReadonlyArray<{
    readonly name: string;
    readonly href: string;
  }>;
  readonly social: {
    readonly github: string;
    readonly twitter: string;
  };
  readonly backgroundApi: {
    readonly endpoint: string;
    readonly fallbackImages: readonly string[];
  };
  readonly avatar: string;
}

export const SITE_CONFIG: SiteConfiguration = {
  title: 'NazoPrism',
  description: '沉淪在無盡的深淵中...',
  author: 'nazo',
  url: 'https://nazo-prism.vercel.app',

  // 导航链接
  navigation: [
    { name: 'Home', href: '/' },
    { name: 'About', href: '/about' },
    { name: 'Users', href: '/users' },
  ] as const,

  // 社交链接
  social: {
    github: 'https://github.com/bymoye',
    twitter: 'https://twitter.com/bymoye',
  } as const,

  // 背景图片API配置
  backgroundApi: {
    endpoint: 'https://api.nmxc.ltd/randimg',
    fallbackImages: [
      'https://picsum.photos/1920/1080?random=1',
      'https://picsum.photos/1920/1080?random=2',
      'https://picsum.photos/1920/1080?random=3',
    ] as const,
  } as const,

  // 头像
  avatar: 'https://avatars.githubusercontent.com/u/1?v=4',
} as const;

/**
 * 重新导出类型以保持向后兼容性
 */
export type { Article, ExtendedArticle } from '@/types/content';

/**
 * 示例文章数据
 */
export const SAMPLE_ARTICLES: ExtendedArticle[] = [
  {
    id: 1,
    url: '/articles/modern-web-development',
    title: '现代Web开发的最佳实践',
    time: '2024-01-15',
    content: '探索现代Web开发中的最新技术栈和最佳实践。',
    category: '前端开发',
    cover: 'https://picsum.photos/800/600?random=1',
    author: 'NazoPrism',
    readTime: '8分钟',
    tags: ['React', 'TypeScript'],
    excerpt: '深入理解现代Web开发的核心概念和实践方法。',
    pinned: true,
  },
  {
    id: 2,
    url: '/articles/typescript-features',
    title: 'TypeScript 核心特性',
    time: '2024-01-10',
    content: '探讨TypeScript的核心特性和应用场景。',
    category: '编程语言',
    cover: 'https://picsum.photos/800/600?random=2',
    author: 'Tech Writer',
    readTime: '12分钟',
    tags: ['TypeScript', '编程'],
    excerpt: '掌握TypeScript的核心特性，提升开发效率。',
    pinned: false,
  },
  {
    id: 3,
    url: '/articles/web-performance',
    title: 'Web 性能优化',
    time: '2024-01-08',
    content: 'Web应用性能优化的实用技巧和策略。',
    category: '性能优化',
    cover: 'https://picsum.photos/800/600?random=3',
    author: 'Performance Expert',
    readTime: '10分钟',
    tags: ['性能优化', 'Web开发'],
    excerpt: '掌握Web性能优化的核心技术。',
    pinned: false,
  },
];
