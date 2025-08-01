/**
 * @file types/components.ts
 * @description 组件特定的类型定义
 */

import type { HTMLAttributes, ReactNode } from 'react';

import type { Article } from './content';

/**
 * 基础组件属性接口
 */
export interface BaseComponentProps extends HTMLAttributes<HTMLElement> {
  children?: ReactNode;
}

/**
 * Article组件属性
 */
export interface ArticleProps extends BaseComponentProps {
  readonly article: Article;
  readonly showExcerpt?: boolean;
  readonly showTags?: boolean;
  readonly showReadTime?: boolean;
}

/**
 * ArticleIndex组件属性
 */
export interface ArticleIndexProps extends BaseComponentProps {
  readonly articles?: readonly Article[];
  readonly title?: string;
  readonly showPinned?: boolean;
  readonly itemsPerPage?: number;
}

/**
 * ToTop组件属性
 */
export interface ToTopProps extends BaseComponentProps {
  readonly threshold?: number;
  readonly smooth?: boolean;
}

/**
 * Footer组件属性
 */
export interface FooterProps extends BaseComponentProps {
  readonly siteConfig?: {
    readonly author: string;
    readonly social: {
      readonly github: string;
      readonly twitter: string;
    };
  };
}
