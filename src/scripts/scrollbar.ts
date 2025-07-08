import { getScrollTop, getScrollHeight, getClientHeight, getScrollPercent } from "../utils/scroll-utils";

// Custom scrollbar manager
export class ScrollbarManager {
    private scrollbar: HTMLElement | null;
    private scrollThumb: HTMLElement | null;
    private isDragging: boolean = false;
    private startY: number = 0;
    private startScrollTop: number = 0;
    private scrollHandler: (() => void) | null = null;
    private mouseDownHandler: ((e: MouseEvent) => void) | null = null;
    private mouseMoveHandler: ((e: MouseEvent) => void) | null = null;
    private mouseUpHandler: (() => void) | null = null;
    private wheelHandler: ((e: WheelEvent) => void) | null = null;
    private readonly MIN_THUMB_HEIGHT = 30;
    private readonly WHEEL_MULTIPLIER = 3;

    constructor() {
        this.scrollbar = document.getElementById("custom-scrollbar");
        this.scrollThumb = document.getElementById("scroll-thumb");
        this.init();
    }

    private updateScrollbar = (): void => {
        if (!this.scrollbar || !this.scrollThumb) return;

        const scrollHeight = getScrollHeight();
        const clientHeight = getClientHeight();
        const scrollPercent = getScrollPercent();

        // 计算滚动条高度
        const scrollbarHeight = (clientHeight / scrollHeight) * clientHeight;
        const actualHeight = Math.max(scrollbarHeight, this.MIN_THUMB_HEIGHT);

        // 计算滚动条位置
        const maxThumbTop = clientHeight - actualHeight;
        const thumbTop = scrollPercent * maxThumbTop;

        // 更新样式
        this.scrollThumb.style.height = `${actualHeight}px`;
        this.scrollThumb.style.transform = `translateY(${thumbTop}px)`;

        // 显示/隐藏滚动条
        const shouldShow = scrollHeight > clientHeight;
        this.scrollbar.style.opacity = shouldShow ? "1" : "0";
        this.scrollbar.style.pointerEvents = shouldShow ? "auto" : "none";
    };

    private handleMouseDown = (e: MouseEvent): void => {
        if (!this.scrollThumb) return;

        this.isDragging = true;
        this.startY = e.clientY;
        this.startScrollTop = getScrollTop();

        document.body.style.userSelect = "none";
        this.scrollThumb.style.transition = "none";
    };

    private handleMouseMove = (e: MouseEvent): void => {
        if (!this.isDragging || !this.scrollThumb) return;

        const deltaY = e.clientY - this.startY;
        const scrollHeight = getScrollHeight();
        const clientHeight = getClientHeight();
        const maxScrollTop = scrollHeight - clientHeight;

        // 计算滚动比例
        const scrollRatio = deltaY / (clientHeight - this.scrollThumb.offsetHeight);
        const newScrollTop = this.startScrollTop + (scrollRatio * maxScrollTop);

        // 限制滚动范围
        const clampedScrollTop = Math.max(0, Math.min(newScrollTop, maxScrollTop));

        window.scrollTo({
            top: clampedScrollTop,
            behavior: "auto"
        });
    };

    private handleMouseUp = (): void => {
        if (!this.scrollThumb) return;

        this.isDragging = false;
        document.body.style.userSelect = "";
        this.scrollThumb.style.transition = "";
    };

    private handleWheel = (e: WheelEvent): void => {
        if (!this.scrollbar || !this.scrollbar.contains(e.target as Node)) return;

        e.preventDefault();
        const scrollAmount = e.deltaY * this.WHEEL_MULTIPLIER;

        window.scrollBy({
            top: scrollAmount,
            behavior: "auto"
        });
    };

    private init(): void {
        if (!this.scrollbar || !this.scrollThumb) return;

        // 创建事件处理函数
        this.scrollHandler = this.updateScrollbar;
        this.mouseDownHandler = this.handleMouseDown;
        this.mouseMoveHandler = this.handleMouseMove;
        this.mouseUpHandler = this.handleMouseUp;
        this.wheelHandler = this.handleWheel;

        // 添加事件监听
        window.addEventListener("scroll", this.scrollHandler, { passive: true });
        window.addEventListener("resize", this.scrollHandler, { passive: true });
        this.scrollThumb.addEventListener("mousedown", this.mouseDownHandler);
        document.addEventListener("mousemove", this.mouseMoveHandler);
        document.addEventListener("mouseup", this.mouseUpHandler);
        this.scrollbar.addEventListener("wheel", this.wheelHandler, { passive: false });

        // 初始更新
        this.updateScrollbar();
    }

    public destroy(): void {
        if (this.scrollHandler) {
            window.removeEventListener("scroll", this.scrollHandler);
            window.removeEventListener("resize", this.scrollHandler);
        }
        if (this.scrollThumb && this.mouseDownHandler) {
            this.scrollThumb.removeEventListener("mousedown", this.mouseDownHandler);
        }
        if (this.mouseMoveHandler) {
            document.removeEventListener("mousemove", this.mouseMoveHandler);
        }
        if (this.mouseUpHandler) {
            document.removeEventListener("mouseup", this.mouseUpHandler);
        }
        if (this.scrollbar && this.wheelHandler) {
            this.scrollbar.removeEventListener("wheel", this.wheelHandler);
        }
    }

    public reinit(): void {
        this.destroy();
        this.scrollbar = document.getElementById("custom-scrollbar");
        this.scrollThumb = document.getElementById("scroll-thumb");
        this.init();
    }
}

// 全局实例管理
let scrollbarManager: ScrollbarManager | null = null;

export function initScrollbar(): void {
    if (scrollbarManager) {
        scrollbarManager.reinit();
    } else {
        scrollbarManager = new ScrollbarManager();
    }
}

export function destroyScrollbar(): void {
    if (scrollbarManager) {
        scrollbarManager.destroy();
        scrollbarManager = null;
    }
}