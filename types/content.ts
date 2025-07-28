/**
 * @file types/content.ts
 * @description 内容相关的类型定义
 */

/**
 * 文章类型定义
 */
export interface Article {
  id: number;
  title: string;
  time: string;
  content: string;
  category: string;
  url: string;
  cover: string;
  author: string;
  readTime: string;
  tags: readonly string[];
  excerpt: string;
  pinned: boolean;
  slug?: string;
}

/**
 * 扩展文章接口，包含额外字段
 */
export interface ExtendedArticle extends Article {
  /** 浏览次数 */
  views?: number;
  /** 点赞数 */
  likes?: number;
}
