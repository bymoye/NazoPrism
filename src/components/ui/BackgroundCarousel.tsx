'use client';

import { useLenis } from 'lenis/react';
import { memo, useCallback, useEffect, useRef, useState } from 'react';

import { useThemeContext } from '@/contexts/ThemeContext';
import { useMobileDetection } from '@/hooks/useMobileDetection';
import { SITE_CONFIG } from '@/lib/site.config';
import { httpClient } from '@/utils/http-client';
import { isArray } from '@/utils/type-guards';

/**
 * 轮播图配置接口
 */
interface CarouselConfig {
  /** 最大模糊值 */
  maxBlur: number;
  /** 切换间隔时间（毫秒） */
  switchInterval: number;
  /** 切换动画持续时间（毫秒） */
  switchDuration: number;
  /** 模糊动画持续时间（毫秒） */
  blurDuration: number;
  /** 滚动边距 */
  scrollMargin: string;
}

/**
 * 轮播图配置
 */
const config: CarouselConfig = {
  maxBlur: 5,
  switchInterval: 10_000,
  switchDuration: 1500,
  blurDuration: 600,
  scrollMargin: '300px 0px 0px 0px',
};
/**
 * 背景轮播图组件
 *
 * 提供动态背景图片轮播功能，具有以下特性：
 * - 自动从API获取背景图片，支持移动端和桌面端不同配置
 * - 基于滚动位置的动态模糊效果
 * - 平滑的图片切换动画和主题色提取
 * - 响应式设计，支持移动端优化
 * - 自动轮播和暂停控制
 * - SVG滤镜实现的高性能模糊效果
 *
 * @component
 * @returns 背景轮播图组件JSX元素
 */
const BackgroundCarousel = memo(() => {
  const svgRef = useRef<SVGSVGElement>(null);
  const gaussianBlurRef = useRef<SVGFEGaussianBlurElement>(null);
  const currentImageRef = useRef<SVGImageElement | null>(null);
  const animationRef = useRef<Animation | null>(null);
  const timerRef = useRef<NodeJS.Timeout | null>(null);
  const blurAnimationRef = useRef<number | null>(null);

  const { updateThemeFromImage } = useThemeContext();
  const isMobile = useMobileDetection();

  const [currentIndex, setCurrentIndex] = useState(0);

  /**
   * 获取背景图片列表
   *
   * @returns 背景图片URL数组
   */
  const fetchBackgrounds = useCallback(async (): Promise<readonly string[]> => {
    try {
      // 根据设备类型构建不同的查询参数
      const queryParams = isMobile
        ? { number: 1, encode: 'json', platform: 'mobile' }
        : { number: 5, encode: 'json' };

      const response = await httpClient.get<{ code: number; url: string[] }>(
        'https://api.nmxc.ltd/randimg',
        {
          queryParams,
          headers: { Accept: 'application/json' },
          cache: 'no-cache',
        }
      );

      const { code, url } = response.data;
      if (code === 200 && isArray<string>(url)) {
        return url.filter((urlString: string) => {
          try {
            new URL(urlString);
            return true;
          } catch {
            return false;
          }
        });
      }
      throw new Error('API返回错误');
    } catch (_error) {
      console.warn('[BackgroundCarousel] 获取失败，使用备用图片:', _error);
      return SITE_CONFIG.backgroundApi.fallbackImages;
    }
  }, [isMobile]);

  // 背景图片状态管理
  const [backgrounds, setBackgrounds] = useState<string[]>([]);

  useEffect(() => {
    fetchBackgrounds().then((urls) => setBackgrounds(urls as string[]));
  }, [fetchBackgrounds]);

  // 使用useRef存储updateThemeFromImage函数，避免依赖项变化
  const updateThemeFromImageRef = useRef(updateThemeFromImage);
  updateThemeFromImageRef.current = updateThemeFromImage;

  /**
   * 创建SVG图片元素
   *
   * @param href - 图片链接
   * @returns SVG图片元素
   */
  const createImageElement = useCallback((href: string): SVGImageElement => {
    const image = document.createElementNS(
      'http://www.w3.org/2000/svg',
      'image'
    );
    const attributes = {
      href,
      x: '-5',
      y: '-5',
      height: '102%',
      width: '102%',
      preserveAspectRatio: 'xMidYMid slice',
      crossorigin: 'anonymous',
    };

    for (const [key, value] of Object.entries(attributes)) {
      image.setAttribute(key, value);
    }
    image.style.filter = 'url(#bg-carousel-blur-filter)';

    return image;
  }, []);

  const currentBlurRef = useRef(0);
  const targetBlurRef = useRef(0);
  const isAnimatingRef = useRef(false);

  /**
   * 模糊动画函数
   *
   * @param targetValue - 目标模糊值
   */
  const animateBlur = useCallback((targetValue: number) => {
    if (!gaussianBlurRef.current) {
      return;
    }

    // 更新目标值
    targetBlurRef.current = targetValue;

    // 获取当前实际的模糊值
    const currentStdDeviation =
      gaussianBlurRef.current.getAttribute('stdDeviation');
    const currentBlur = currentStdDeviation
      ? Number.parseFloat(currentStdDeviation)
      : 0;

    // 避免微小变化的动画
    if (Math.abs(targetValue - currentBlur) < 0.1) {
      // 确保精确设置最终值
      gaussianBlurRef.current.setAttribute('stdDeviation', `${targetValue}`);
      currentBlurRef.current = targetValue;
      isAnimatingRef.current = false;
      return;
    }

    // 如果正在动画中且目标值改变，则从当前位置开始新动画（反向播放）
    if (blurAnimationRef.current) {
      cancelAnimationFrame(blurAnimationRef.current);
    }

    const startTime = performance.now();
    const startBlur = currentBlur;
    const blurDiff = targetValue - startBlur;
    isAnimatingRef.current = true;

    const animate = (timestamp: number) => {
      // 检查组件是否仍然挂载
      if (!gaussianBlurRef.current) {
        blurAnimationRef.current = null;
        isAnimatingRef.current = false;
        return;
      }

      // 检查目标值是否在动画过程中发生了变化
      if (targetBlurRef.current !== targetValue) {
        // 目标值已改变，重新开始动画
        isAnimatingRef.current = false;
        animateBlur(targetBlurRef.current);
        return;
      }

      const elapsed = timestamp - startTime;
      const progress = Math.min(elapsed / config.blurDuration, 1);

      // 使用easeInOutQuad缓动函数
      const easedProgress =
        progress < 0.5
          ? 2 * progress * progress
          : -1 + (4 - 2 * progress) * progress;

      const newBlur = startBlur + blurDiff * easedProgress;

      gaussianBlurRef.current.setAttribute('stdDeviation', `${newBlur}`);
      currentBlurRef.current = newBlur;

      if (progress < 1) {
        blurAnimationRef.current = requestAnimationFrame(animate);
      } else {
        // 确保最终值精确
        gaussianBlurRef.current.setAttribute('stdDeviation', `${targetValue}`);
        currentBlurRef.current = targetValue;
        blurAnimationRef.current = null;
        isAnimatingRef.current = false;
      }
    };

    blurAnimationRef.current = requestAnimationFrame(animate);
  }, []);

  const isScrolledRef = useRef<boolean>(false);
  const scrollThreshold = 200;

  useLenis(({ actualScroll }) => {
    const shouldBeScrolled = actualScroll > scrollThreshold;
    if (shouldBeScrolled !== isScrolledRef.current) {
      isScrolledRef.current = shouldBeScrolled;
      animateBlur(shouldBeScrolled ? config.maxBlur : 0);
    }
  });

  const [isPaused, setIsPaused] = useState(false);

  // Handle page visibility changes
  useEffect(() => {
    const handleVisibilityChange = () => {
      const { hidden } = document;
      setIsPaused(hidden);
      document.title = hidden
        ? `等你回来~ | ${document.title.replace('等你回来~ | ', '')}`
        : document.title.replace('等你回来~ | ', '');
    };

    document.addEventListener('visibilitychange', handleVisibilityChange);
    return () =>
      document.removeEventListener('visibilitychange', handleVisibilityChange);
  }, []);

  // 背景切换逻辑 - 恢复预提取功能
  const switchBackground = useCallback(() => {
    if (
      !backgrounds.length ||
      isPaused ||
      !currentImageRef.current ||
      !svgRef.current ||
      animationRef.current ||
      isMobile // 移动端禁用轮播
    ) {
      return;
    }

    const nextIndex = (currentIndex + 1) % backgrounds.length;
    const currentImg = currentImageRef.current;
    const nextImageUrl = backgrounds[nextIndex];
    if (!nextImageUrl) {
      return;
    }
    const nextImg = createImageElement(nextImageUrl);

    currentImg.before(nextImg);
    setCurrentIndex(nextIndex);
    currentImageRef.current = nextImg;

    // 淡出动画
    animationRef.current = currentImg.animate(
      [{ opacity: 1 }, { opacity: 0 }],
      {
        duration: config.switchDuration,
      }
    );

    animationRef.current.finished
      .then(() => {
        if (currentImg.parentNode) {
          currentImg.remove();
        }
      })
      .catch((error) => {
        if (error.name !== 'AbortError') {
          console.error('[BackgroundCarousel] 背景切换动画错误:', error);
        }
      })
      .finally(() => {
        animationRef.current = null;
      });

    // 更新主题色并预提取下一张图片的主题色
    const preloadIndex = (nextIndex + 1) % backgrounds.length;
    const preloadImageUrl =
      backgrounds.length > 1 ? backgrounds[preloadIndex] : undefined;

    updateThemeFromImageRef
      .current(nextImageUrl, preloadImageUrl)
      .catch((error) => {
        console.error('[BackgroundCarousel] 主题更新失败:', error);
      });

    // 开发环境下记录背景切换
    if (process.env.NODE_ENV === 'development') {
      console.log(
        `[BackgroundCarousel] 背景切换: ${currentIndex} -> ${nextIndex}`
      );
    }
  }, [backgrounds, currentIndex, createImageElement, isPaused, isMobile]);

  // 正确的定时器管理 - 使用setTimeout递归调用
  useEffect(() => {
    if (!backgrounds.length || isPaused || isMobile) {
      if (timerRef.current) {
        clearTimeout(timerRef.current);
        timerRef.current = null;
      }
      return;
    }

    const scheduleNext = () => {
      timerRef.current = setTimeout(() => {
        switchBackground();
        scheduleNext(); // 递归调用，确保在切换完成后再开始下一轮计时
      }, config.switchInterval);
    };

    scheduleNext();

    return () => {
      if (timerRef.current) {
        clearTimeout(timerRef.current);
        timerRef.current = null;
      }
    };
  }, [backgrounds, isPaused, isMobile, switchBackground]);

  // 初始化逻辑 - 恢复预提取功能
  useEffect(() => {
    if (!(backgrounds.length && svgRef.current)) {
      return;
    }

    // 清理现有图片
    for (const img of svgRef.current.querySelectorAll('image')) {
      img.remove();
    }

    // 创建初始图片
    const firstImageUrl = backgrounds[0];
    if (!firstImageUrl) {
      return;
    }

    if (process.env.NODE_ENV === 'development') {
      console.log(`[BackgroundCarousel] 初始化背景图片: ${firstImageUrl}`);
    }

    const initialImg = createImageElement(firstImageUrl);
    svgRef.current.appendChild(initialImg);
    currentImageRef.current = initialImg;
    setCurrentIndex(0);

    // 提取初始主题色，移动端不预提取第二张图片
    const secondImageUrl =
      !isMobile && backgrounds.length > 1 ? backgrounds[1] : undefined;
    updateThemeFromImageRef
      .current(firstImageUrl, secondImageUrl)
      .catch((_error) => {
        console.error('[BackgroundCarousel] 初始主题色提取失败:', _error);
      });
  }, [backgrounds, createImageElement, isMobile]);

  // Cleanup on unmount
  useEffect(() => {
    return () => {
      const currentAnimation = animationRef.current;
      const currentTimer = timerRef.current;

      if (currentAnimation) {
        currentAnimation.cancel();
      }
      if (currentTimer) {
        clearTimeout(currentTimer);
      }
    };
  }, []);

  return (
    <svg
      aria-label="背景图"
      id="bg-carousel-svg"
      ref={svgRef}
      role="img"
      style={{
        position: 'fixed',
        width: '100%',
        height: '100%',
        zIndex: -999,
        top: 0,
        left: 0,
        transform: 'translateZ(0)',
      }}
    >
      <defs>
        <filter id="bg-carousel-blur-filter">
          <feGaussianBlur
            colorInterpolationFilters="sRGB"
            edgeMode="none"
            ref={gaussianBlurRef}
            stdDeviation="0"
          />
        </filter>
      </defs>
    </svg>
  );
});

BackgroundCarousel.displayName = 'BackgroundCarousel';

export default BackgroundCarousel;
