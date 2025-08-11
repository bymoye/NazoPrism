'use client';

import { useState } from 'react';

import Article from './Article';

import { SAMPLE_ARTICLES } from '@/lib/site.config';
import styles from '@/styles/components/ArticleIndex.module.css';
import type { ArticleIndexProps } from '@/types/components';

/**
 * 文章索引组件
 *
 * @param props.articles - 文章数组
 * @param props.currentPage - 当前页码
 * @param props.totalPages - 总页数
 * @param props.onPageChange - 页码变化回调
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

  /** 排序文章：置顶文章优先，然后按日期排序 */
  const sortedArticles = articles.toSorted((a: (typeof articles)[0], b: (typeof articles)[0]) => {
    /** 首先按置顶状态排序 */
    if (showPinned) {
      if (a.pinned && !b.pinned) {
        return -1;
      }
      if (!a.pinned && b.pinned) {
        return 1;
      }
    }

    /** 然后按日期排序（最新的在前） */
    return Number(new Date(b.time)) - Number(new Date(a.time));
  });

  /** 分页逻辑 */
  const totalPages = Math.ceil(sortedArticles.length / itemsPerPage);
  const startIndex = (currentPage - 1) * itemsPerPage;
  const endIndex = startIndex + itemsPerPage;
  const currentArticles = sortedArticles.slice(startIndex, endIndex);

  /** 分离置顶文章和普通文章用于显示 */
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
    /** 滚动到文章列表顶部 */
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const handlePrevClick = (): void => {
    handlePageChange(currentPage - 1);
  };

  const handlePageClick = (page: number): void => {
    handlePageChange(page);
  };

  const handlePageButtonClick = (page: number) => () => {
    handlePageClick(page);
  };

  const handleNextClick = (): void => {
    handlePageChange(currentPage + 1);
  };

  /**
   * 渲染分页组件
   *
   * @returns 分页组件或null
   */
  const renderPagination = () => {
    if (totalPages <= 1) {
      return null;
    }

    return (
      <nav aria-label='Article pagination' className={styles['pagination']}>
        {Boolean(currentPage > 1) && (
          <button
            aria-label='Previous page'
            className={styles['paginationButton']}
            type='button'
            onClick={handlePrevClick}
          >
            ←
          </button>
        )}

        {Array.from({ length: totalPages }, (unusedValue, index) => {
          void unusedValue; // 标记为已使用
          return index + 1;
        }).map(page => (
          <button
            key={page}
            aria-current={page === currentPage ? 'page' : undefined}
            className={`${styles['paginationButton']} ${page === currentPage ? styles['paginationActive'] : ''}`}
            type='button'
            onClick={handlePageButtonClick(page)}
          >
            {page}
          </button>
        ))}

        {Boolean(currentPage < totalPages) && (
          <button
            aria-label='Next page'
            className={styles['paginationButton']}
            type='button'
            onClick={handleNextClick}
          >
            →
          </button>
        )}
      </nav>
    );
  };

  return (
    <div className={`${styles['page']} ${className ?? ''}`} {...props}>
      <div className={styles['content']}>
        {Boolean(title) && <h1 className={styles['title']}>{title}</h1>}

        {/* 置顶文章区域 */}
        {pinnedArticles.length > 0 && (
          <section className={styles['pinnedSection']}>
            <h2 className={styles['sectionTitle']}>置顶文章</h2>
            {pinnedArticles.map((article: (typeof articles)[0]) => (
              <Article key={article.id} showExcerpt showReadTime showTags article={article} />
            ))}
          </section>
        )}

        {/* 普通文章区域 */}
        {regularArticles.length > 0 && (
          <section className={styles['articlesSection']}>
            {Boolean(title) && <h2 className={styles['sectionTitle']}>最新文章</h2>}
            {regularArticles.map((article: (typeof articles)[0]) => (
              <Article key={article.id} showExcerpt showReadTime showTags article={article} />
            ))}
          </section>
        )}

        {/* 分页 */}
        {renderPagination()}

        {/* 文章数量信息 */}
        <div className={styles['articleInfo']}>
          显示 {startIndex + 1}-{Math.min(endIndex, sortedArticles.length)} 篇， 共{' '}
          {sortedArticles.length} 篇文章
        </div>
      </div>
    </div>
  );
};

export default ArticleIndex;
