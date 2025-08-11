'use client';

import Image from 'next/image';
import Link from 'next/link';
import { useEffect, useRef } from 'react';

import styles from '@/styles/components/Article.module.css';
import type { ArticleProps } from '@/types/components';

/**
 * 文章卡片组件
 *
 * @param props.article - 文章数据
 * @param props.showImage - 是否显示封面图片
 * @param props.showCategory - 是否显示分类
 * @param props.showTags - 是否显示标签
 * @param props.showExcerpt - 是否显示摘要
 * @param props.showDate - 是否显示日期
 * @param props.showReadTime - 是否显示阅读时间
 * @param props.className - 自定义CSS类名
 * @returns 文章卡片组件
 */
const Article = ({
  article,
  showExcerpt = true,
  showTags = false,
  showReadTime = false,
  className,
  ...props
}: ArticleProps) => {
  const articleRef = useRef<HTMLElement>(null);

  /** 使用交叉观察器实现动画效果 */
  useEffect(() => {
    const element = articleRef.current;
    if (!element) {
      return;
    }

    const showClass = styles['postListShow'];
    const observer = new IntersectionObserver(
      entries => {
        for (const entry of entries) {
          if (entry.isIntersecting && showClass) {
            entry.target.classList.add(showClass);
            observer.unobserve(entry.target);
          }
        }
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
      className={`${styles['postListThumb']} ${className ?? ''}`}
      data-article-id={article.id}
      data-show-class={styles['postListShow']}
      data-thumb-class={styles['postListThumb']}
      {...props}
    >
      {/* Image container */}
      <div className={styles['postThumb']}>
        <Link
          className={styles['imageA']}
          href={article.url}
          rel='noopener noreferrer'
          target='_blank'
        >
          <Image
            fill
            alt={article.title}
            className={styles['postThumbImg']}
            priority={false}
            sizes='(max-width: 768px) 100vw, 55vw'
            src={article.cover}
            style={{ objectFit: 'cover' }}
          />
        </Link>
      </div>

      {/* Content wrapper */}
      <div className={styles['postContentWrap']}>
        <h2 className={styles['title']}>{article.title}</h2>

        <div className={styles['time']}>
          {article.time}
          {showReadTime && article.readTime ? <span> • {article.readTime}</span> : null}
        </div>

        {showExcerpt && (article.excerpt || article.content) ? (
          <div className={styles['content']}>{article.excerpt || article.content || ''}</div>
        ) : null}

        <div className={styles['category']}>{article.category}</div>

        {showTags && article.tags?.length ? (
          <div className={styles['tags']}>
            {article.tags.map(tag => (
              <span key={tag} className={styles['tag']}>
                {tag}
              </span>
            ))}
          </div>
        ) : null}

        <Link
          className={styles['url']}
          href={article.url}
          rel='noopener noreferrer'
          target='_blank'
        >
          阅读更多
        </Link>
      </div>
    </article>
  );
};

export default Article;
