'use client';

import Image from 'next/image';
import Link from 'next/link';
import React, { useEffect, useRef, memo } from 'react';

import styles from '../../styles/components/Article.module.scss';
import { ArticleProps } from '../../types/components';

/**
 * 文章卡片组件，用于显示单篇文章的信息
 *
 * @param props - 组件属性
 * @returns 文章卡片组件
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
      if (!element) return;

      const observer = new IntersectionObserver(
        entries => {
          entries.forEach(entry => {
            if (entry.isIntersecting && styles.postListShow) {
              entry.target.classList.add(styles.postListShow);
              observer.unobserve(entry.target);
            }
          });
        },
        {
          threshold: 0.1,
          rootMargin: '50px 0px',
        },
      );

      observer.observe(element);

      return () => {
        observer.unobserve(element);
      };
    }, []);

    return (
      <article
        ref={articleRef}
        className={`${styles.postListThumb} ${className ?? ''}`}
        data-article-id={article.id}
        data-show-class={styles.postListShow}
        data-thumb-class={styles.postListThumb}
        {...props}
      >
        {/* Image container */}
        <div className={styles.postThumb}>
          <Link
            href={article.url}
            className={styles.imageA}
            target='_blank'
            rel='noopener noreferrer'
          >
            <Image
              src={article.cover}
              alt={article.title}
              className={styles.postThumbImg || ''}
              fill
              sizes='(max-width: 768px) 100vw, 55vw'
              style={{ objectFit: 'cover' }}
              priority={false}
            />
          </Link>
        </div>

        {/* Content wrapper */}
        <div className={styles.postContentWrap}>
          <h2 className={styles.title}>{article.title}</h2>

          <div className={styles.time}>
            {article.time}
            {showReadTime && article.readTime && <span> • {article.readTime}</span>}
          </div>

          {showExcerpt && (
            <div className={styles.content}>{article.excerpt ?? article.content ?? ''}</div>
          )}

          <div className={styles.category}>{article.category}</div>

          {showTags && article.tags?.length && (
            <div className={styles.tags}>
              {article.tags.map((tag, index) => (
                <span key={`tag-${index}`} className={styles.tag}>
                  {tag}
                </span>
              ))}
            </div>
          )}

          <Link href={article.url} className={styles.url} target='_blank' rel='noopener noreferrer'>
            阅读更多
          </Link>
        </div>
      </article>
    );
  },
);

Article.displayName = 'Article';

export default Article;
