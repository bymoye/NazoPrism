'use client';

import Image from 'next/image';
import Link from 'next/link';
import { memo, useEffect, useRef } from 'react';

import styles from '@/styles/components/Article.module.css';
import type { ArticleProps } from '@/types/components';

/**
 * 文章卡片组件
 *
 * 用于展示单篇文章的完整信息卡片，具有以下功能：
 * - 响应式文章封面图片展示
 * - 文章标题、时间、分类等元信息显示
 * - 可选的摘要、标签、阅读时间显示
 * - 交叉观察器实现的进入动画效果
 * - 外部链接跳转支持
 * - 完全可定制的显示选项
 *
 * @component
 * @param props - 组件属性
 * @param props.article - 文章数据对象
 * @param props.showExcerpt - 是否显示文章摘要，默认true
 * @param props.showTags - 是否显示文章标签，默认false
 * @param props.showReadTime - 是否显示阅读时间，默认false
 * @param props.className - 自定义CSS类名
 * @returns 文章卡片组件JSX元素
 */
const Article = memo<ArticleProps>(
  ({
    article,
    showExcerpt = true,
    showTags = false,
    showReadTime = false,
    className,
    ...props
  }: ArticleProps) => {
    const articleRef = useRef<HTMLElement>(null);

    // 使用交叉观察器实现动画效果
    useEffect(() => {
      const element = articleRef.current;
      if (!element) {
        return;
      }

      const observer = new IntersectionObserver(
        (entries) => {
          for (const entry of entries) {
            if (entry.isIntersecting && styles.postListShow) {
              entry.target.classList.add(styles.postListShow);
              observer.unobserve(entry.target);
            }
          }
        },
        {
          threshold: 0.1,
          rootMargin: '50px 0px',
        }
      );

      observer.observe(element);

      return () => {
        observer.unobserve(element);
      };
    }, []);

    return (
      <article
        className={`${styles.postListThumb} ${className ?? ''}`}
        data-article-id={article.id}
        data-show-class={styles.postListShow}
        data-thumb-class={styles.postListThumb}
        ref={articleRef}
        {...props}
      >
        {/* Image container */}
        <div className={styles.postThumb}>
          <Link
            className={styles.imageA}
            href={article.url}
            rel="noopener noreferrer"
            target="_blank"
          >
            <Image
              alt={article.title}
              className={styles.postThumbImg || ''}
              fill
              priority={false}
              sizes="(max-width: 768px) 100vw, 55vw"
              src={article.cover}
              style={{ objectFit: 'cover' }}
            />
          </Link>
        </div>

        {/* Content wrapper */}
        <div className={styles.postContentWrap}>
          <h2 className={styles.title}>{article.title}</h2>

          <div className={styles.time}>
            {article.time}
            {showReadTime && article.readTime && (
              <span> • {article.readTime}</span>
            )}
          </div>

          {showExcerpt && (
            <div className={styles.content}>
              {article.excerpt ?? article.content ?? ''}
            </div>
          )}

          <div className={styles.category}>{article.category}</div>

          {showTags && article.tags?.length && (
            <div className={styles.tags}>
              {article.tags.map((tag) => (
                <span className={styles.tag} key={tag}>
                  {tag}
                </span>
              ))}
            </div>
          )}

          <Link
            className={styles.url}
            href={article.url}
            rel="noopener noreferrer"
            target="_blank"
          >
            阅读更多
          </Link>
        </div>
      </article>
    );
  }
);

Article.displayName = 'Article';

export default Article;
