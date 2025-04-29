import { useEffect, useRef, useCallback, useState } from "react";
import { SvgAnimate, SvgImage } from "./SvgElements";
import debounce from "components/utils/debounce";

const SCROLL_THRESHOLD = 100;
const BLUR_DELTA = 0.1;
const MAX_BLUR = 8;
const MIN_BLUR = 0;

const SvgBackground = () => {
  const svgRef = useRef<SVGSVGElement | null>(null);
  const imageListRef = useRef<SVGImageElement[]>([]);
  const currentIndexRef = useRef<number>(0);
  const timerRef = useRef<NodeJS.Timeout | null>(null);
  const stdDeviationRef = useRef<number>(0);
  const [stdDeviation, setStdDeviation] = useState<number>(0);

  const _blur_check = (scrollTop: number) => {
    return (
      (scrollTop > SCROLL_THRESHOLD && stdDeviationRef.current < MAX_BLUR) ||
      (scrollTop <= SCROLL_THRESHOLD && stdDeviationRef.current > MIN_BLUR)
    );
  };

  const _blur = useCallback(() => {
    const scrollTop =
      document.documentElement.scrollTop || document.body.scrollTop;
    const delta = scrollTop > SCROLL_THRESHOLD ? BLUR_DELTA : -BLUR_DELTA;
    stdDeviationRef.current = parseFloat(
      (stdDeviationRef.current + delta).toFixed(1)
    );
    setStdDeviation(stdDeviationRef.current);

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

  const background = useCallback(() => {
    if (imageListRef.current.length === 0 || !svgRef.current) {
      clearInterval(timerRef.current);
      return;
    }

    const prevIndex = currentIndexRef.current;
    currentIndexRef.current =
      (currentIndexRef.current + 1) % imageListRef.current.length;

    const currentImage = imageListRef.current[currentIndexRef.current];
    const previousImage = imageListRef.current[prevIndex];
    const animate = SvgAnimate();

    currentImage.style.opacity = "0";
    svgRef.current.appendChild(currentImage);
    currentImage.appendChild(animate);
    animate.beginElement();

    animate.addEventListener("endEvent", () => {
      previousImage.style.opacity = "0";
      currentImage.style.opacity = "1";
      animate.remove();
    });
  }, []);

  const startTimer = useCallback(() => {
    timerRef.current = setInterval(background, 5000);
  }, [background]);

  const stopTimer = useCallback(() => {
    clearInterval(timerRef.current);
  }, []);

  useEffect(() => {
    handleScroll();
    window.addEventListener("scroll", handleScroll);
    document.addEventListener("visibilitychange", () => {
      document.hidden ? stopTimer() : startTimer();
    });

    return () => {
      window.removeEventListener("scroll", handleScroll);
      document.removeEventListener("visibilitychange", () => {});
      clearInterval(timerRef.current);
    };
  }, [handleScroll, startTimer, stopTimer]);

  useEffect(() => {
    const fetchImages = async () => {
      try {
        const device =
          window.screen.height > window.screen.width ? "mobile" : "pc";
        const url = `https://api.nmxc.ltd/randimg?method=${device}&number=3&encode=json`;
        const res = await fetch(url);
        if (res.ok && svgRef.current) {
          const data = await res.json();
          // TODO: 这里需要处理数据的格式
          // const imgurl = data.url;
          const imgurl = [
            "https://fp1.fghrsh.net/2020/01/14/7249e2902b45b4620019519a82db1d2e.jpg!q80.webp",
            "https://fp1.fghrsh.net/2020/01/14/bb445e2a101bbf5a4ca017782dd73b89.jpg!q80.webp",
            "https://fp1.fghrsh.net/2020/01/14/4939be2513c620c6c15b057b3137307e.jpg!q80.webp",
          ];
          imageListRef.current = imgurl.map((item) => SvgImage(item));
          startTimer();
        }
      } catch (error) {
        console.error("Failed to fetch images:", error);
        imageListRef.current = [
          "https://fp1.fghrsh.net/2020/01/31/34ac8d52912eb5ffa639ab23cbced140.jpg!q80.webp",
        ].map((item) => SvgImage(item));
        startTimer();
      }
    };

    fetchImages();
  }, []);

  return (
    <svg
      style={{
        position: "fixed",
        width: "100%",
        height: "100%",
        zIndex: "-999",
      }}
      ref={svgRef}
    >
      <image
        href="https://fp1.fghrsh.net/2020/01/31/34ac8d52912eb5ffa639ab23cbced140.jpg!q80.webp"
        x="-4%"
        y="-4%"
        height="108%"
        width="108%"
        preserveAspectRatio="xMidYMid slice"
        filter="url(#svg_blurfilter)"
      />
      <filter id="svg_blurfilter">
        <feGaussianBlur
          stdDeviation={stdDeviation}
          colorInterpolationFilters="sRGB"
        />
      </filter>
    </svg>
  );
};

export default SvgBackground;
