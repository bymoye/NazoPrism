// Article animations using Intersection Observer
export class ArticleAnimationManager {
  private observer: IntersectionObserver;

  constructor() {
    this.observer = new IntersectionObserver(
      entries => {
        entries.forEach(entry => {
          if (entry.isIntersecting) {
            entry.target.classList.add('post_list_show');
            this.observer.unobserve(entry.target);
          }
        });
      },
      {
        threshold: 0.5,
        rootMargin: '0px 0px -10% 0px', // 优化触发时机
      },
    );
  }

  public init(): void {
    const articles = document.querySelectorAll('.post_list_thumb');
    articles.forEach(article => {
      // 重置状态以支持页面切换
      article.classList.remove('post_list_show');
      this.observer.observe(article);
    });
  }

  public destroy(): void {
    this.observer.disconnect();
  }
}

// 全局实例管理
let articleAnimationManager: ArticleAnimationManager | null = null;

export function initArticleAnimations(): void {
  if (!articleAnimationManager) {
    articleAnimationManager = new ArticleAnimationManager();
  }
  articleAnimationManager.init();
}

export function destroyArticleAnimations(): void {
  if (articleAnimationManager) {
    articleAnimationManager.destroy();
    articleAnimationManager = null;
  }
}
