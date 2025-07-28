'use client';

import React, { useState, useMemo } from 'react';

import { SAMPLE_ARTICLES } from '../../config/site.config';
import styles from '../../styles/components/ArticleIndex.module.scss';
import { ArticleIndexProps } from '../../types/components';

import Article from './Article';

/**
 * 文章索引组件，显示带分页功能的文章列表
 *
 * @param props - 组件属性
 * @returns 文章索引组件
 */
const ArticleIndex = ({
  articles = SAMPLE_ARTICLES,
  title,
  showPinned = true,
  itemsPerPage = 10,
  className,
  ...props
}: ArticleIndexProps) => {
  const [currentPage, setCurrentPage] = useState(1);

  // 排序文章：置顶文章优先，然后按日期排序
  const sortedArticles = useMemo(() => {
    return articles.toSorted((a: (typeof articles)[0], b: (typeof articles)[0]) => {
      // 首先按置顶状态排序
      if (showPinned) {
        if (a.pinned && !b.pinned) return -1;
        if (!a.pinned && b.pinned) return 1;
      }

      // 然后按日期排序（最新的在前）
      return +new Date(b.time) - +new Date(a.time);
    });
  }, [articles, showPinned]);

  // 分页逻辑
  const totalPages = Math.ceil(sortedArticles.length / itemsPerPage);
  const startIndex = (currentPage - 1) * itemsPerPage;
  const endIndex = startIndex + itemsPerPage;
  const currentArticles = sortedArticles.slice(startIndex, endIndex);

  // 分离置顶文章和普通文章用于显示
  const pinnedArticles = showPinned
    ? currentArticles.filter((article: (typeof articles)[0]) => article.pinned)
    : [];
  const regularArticles = currentArticles.filter(
    (article: (typeof articles)[0]) => !article.pinned,
  );

  /**
   * 处理页面切换
   *
   * @param page - 目标页码
   */
  const handlePageChange = (page: number) => {
    setCurrentPage(page);
    // 滚动到文章列表顶部
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  /**
   * 渲染分页组件
   *
   * @returns 分页组件或null
   */
  const renderPagination = () => {
    if (totalPages <= 1) return null;

    return (
      <nav className={styles.pagination} aria-label='Article pagination'>
        {currentPage > 1 && (
          <button
            onClick={() => handlePageChange(currentPage - 1)}
            className={styles.paginationButton}
            aria-label='Previous page'
          >
            ←
          </button>
        )}

        {Array.from({ length: totalPages }, (_, i) => i + 1).map(page => (
          <button
            key={page}
            onClick={() => handlePageChange(page)}
            className={`${styles.paginationButton} ${page === currentPage ? styles.paginationActive : ''}`}
            aria-current={page === currentPage ? 'page' : undefined}
          >
            {page}
          </button>
        ))}

        {currentPage < totalPages && (
          <button
            onClick={() => handlePageChange(currentPage + 1)}
            className={styles.paginationButton}
            aria-label='Next page'
          >
            →
          </button>
        )}
      </nav>
    );
  };

  return (
    <div className={`${styles.page} ${className ?? ''}`} {...props}>
      <div className={styles.content}>
        {title && <h1 className={styles.title}>{title}</h1>}

        {/* 置顶文章区域 */}
        {pinnedArticles.length && (
          <section className={styles.pinnedSection}>
            <h2 className={styles.sectionTitle}>置顶文章</h2>
            {pinnedArticles.map((article: (typeof articles)[0]) => (
              <Article
                key={article.id}
                article={article}
                showExcerpt={true}
                showTags={true}
                showReadTime={true}
              />
            ))}
          </section>
        )}

        {/* 普通文章区域 */}
        {regularArticles.length && (
          <section className={styles.articlesSection}>
            {pinnedArticles.length && <h2 className={styles.sectionTitle}>最新文章</h2>}
            {regularArticles.map((article: (typeof articles)[0]) => (
              <Article
                key={article.id}
                article={article}
                showExcerpt={true}
                showTags={true}
                showReadTime={true}
              />
            ))}
          </section>
        )}

        {/* 分页 */}
        {renderPagination()}

        {/* 文章数量信息 */}
        <div className={styles.articleInfo}>
          显示 {startIndex + 1}-{Math.min(endIndex, sortedArticles.length)} 篇， 共{' '}
          {sortedArticles.length} 篇文章
        </div>
      </div>
    </div>
  );
};

export default ArticleIndex;
