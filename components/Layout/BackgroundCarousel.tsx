import styles from "@/styles/BackgroundCarousel.module.css";
import debounce from "components/utils/debounce";
import { useCallback, useEffect, useRef, useState } from "react";

const SCROLL_THRESHOLD = 100;
const BLUR_DELTA = 0.1;
const MAX_BLUR = 8;
const MIN_BLUR = 0;

const BackgroundCarousel: React.FC = () => {
  const currentIndexRef = useRef<number>(0);
  const isSwitchingRef = useRef<boolean>(false);

  const [backgrounds, setBackgrounds] = useState<string[]>([]);
  const [currentBgOpacity, setCurrentBgOpacity] = useState(1);
  const [nextBgOpacity, setNextBgOpacity] = useState(0);
  const [currentBgUrl, setCurrentBgUrl] = useState<string | null>(null);
  const [nextBgUrl, setNextBgUrl] = useState<string | null>(null);
  const [stdDeviation, setStdDeviation] = useState<number>(0);
  const currentBlur = useRef<number>(0);

  const timerRef = useRef<NodeJS.Timeout | null>(null);

  // 预载图片
  const preloadImage = (url: string): Promise<void> => {
    return new Promise((resolve) => {
      const img = new Image();
      img.src = url;
      img.onload = () => resolve();
      img.onerror = () => resolve();
    });
  };

  useEffect(() => {
    const fetchBackgrounds = async () => {
      try {
        const device =
          window.screen.height > window.screen.width ? "mobile" : "pc";
        const response = await fetch(
          `https://api.nmxc.ltd/randimg?method=${device}&number=3&encode=json`
        );
        if (!response.ok) {
          throw new Error("获取背景图片失败");
        }
        const data = await response.json();
        // todo: 接口恢复数据格式后，取消注释
        // const urls = data.url;
        const urls = [
          "https://fp1.fghrsh.net/2020/01/14/7249e2902b45b4620019519a82db1d2e.jpg!q80.webp",
          "https://fp1.fghrsh.net/2020/01/14/bb445e2a101bbf5a4ca017782dd73b89.jpg!q80.webp",
          "https://fp1.fghrsh.net/2020/01/14/4939be2513c620c6c15b057b3137307e.jpg!q80.webp",
        ];
        setBackgrounds(urls);
        await Promise.all(urls.map(preloadImage));
      } catch (error) {
        console.error("获取背景图片时出错:", error);
      }
    };
    fetchBackgrounds();
  }, []);

  useEffect(() => {
    if (backgrounds.length > 0) {
      setCurrentBgUrl(backgrounds[0]);
      setNextBgUrl(backgrounds[1 % backgrounds.length]);
    }
  }, [backgrounds]);

  const animateOpacity = (
    setCurrentOpacity: (value: number) => void,
    setNextOpacity: (value: number) => void,
    duration: number,
    onComplete: () => void
  ) => {
    const startTime = performance.now();
    function step(timestamp: number) {
      const elapsed = timestamp - startTime;
      const progress = Math.min(elapsed / duration, 1);
      const currentOpacity = 1 - progress;
      const nextOpacity = progress;
      setCurrentOpacity(currentOpacity);
      setNextOpacity(nextOpacity);
      if (progress < 1) {
        requestAnimationFrame(step);
      } else {
        onComplete();
      }
    }
    requestAnimationFrame(step);
  };

  const switchBackground = async () => {
    if (isSwitchingRef.current || backgrounds.length === 0) return;
    isSwitchingRef.current = true;

    const nextIndex = (currentIndexRef.current + 1) % backgrounds.length;
    const nextBgUrl = backgrounds[nextIndex];
    await preloadImage(nextBgUrl);
    setNextBgUrl(nextBgUrl);

    animateOpacity(setCurrentBgOpacity, setNextBgOpacity, 1000, () => {
      setCurrentBgUrl(nextBgUrl);
      setCurrentBgOpacity(1);
      setNextBgOpacity(0);
      currentIndexRef.current = nextIndex;
      isSwitchingRef.current = false;
    });
  };

  const _blur_check = (scrollTop: number) => {
    return (
      (scrollTop > SCROLL_THRESHOLD && currentBlur.current < MAX_BLUR) ||
      (scrollTop <= SCROLL_THRESHOLD && currentBlur.current > MIN_BLUR)
    );
  };

  const _blur = useCallback(() => {
    const scrollTop =
      document.documentElement.scrollTop || document.body.scrollTop;
    const delta = scrollTop > SCROLL_THRESHOLD ? BLUR_DELTA : -BLUR_DELTA;
    currentBlur.current = parseFloat((currentBlur.current + delta).toFixed(1));
    setStdDeviation(currentBlur.current);

    if (_blur_check(scrollTop)) {
      requestAnimationFrame(_blur);
    }
  }, []);

  const blur_rs = useCallback(() => {
    const scrollTop =
      document.documentElement.scrollTop || document.body.scrollTop;
    if (_blur_check(scrollTop)) {
      requestAnimationFrame(_blur);
    }
  }, [_blur]);

  const handleScroll = useCallback(debounce(blur_rs, 100), [blur_rs]);

  const startTimer = () => {
    timerRef.current = setInterval(switchBackground, 5000);
  };

  const stopTimer = () => {
    if (timerRef.current) {
      clearInterval(timerRef.current);
      timerRef.current = null;
    }
  };

  useEffect(() => {
    if (backgrounds.length > 0) {
      handleScroll();
      window.addEventListener("scroll", handleScroll);
      document.addEventListener("visibilitychange", () => {
        document.hidden ? stopTimer() : startTimer();
      });
      startTimer();
    }
    return () => {
      window.removeEventListener("scroll", handleScroll);
      document.removeEventListener("visibilitychange", () => {
        document.hidden ? stopTimer() : startTimer();
      });
      stopTimer();
    };
  }, [backgrounds, handleScroll]);

  if (backgrounds.length === 0) {
    return <></>;
  }

  return (
    <>
      <div
        id="current-bg"
        className={styles.bg}
        style={{
          filter: `blur(${stdDeviation}px)`,
          opacity: currentBgOpacity,
          backgroundImage: `url(${currentBgUrl})`,
        }}
      />
      <div
        id="next-bg"
        className={styles.bg}
        style={{
          filter: `blur(${stdDeviation}px)`,
          opacity: nextBgOpacity,
          backgroundImage: `url(${nextBgUrl})`,
        }}
      />
    </>
  );
};

export default BackgroundCarousel;
