'use client';

import styles from '@/styles/components/Scrollbar.module.css';

/**
 * 滚动条组件
 *
 * 提供页面滚动进度的可视化指示器，特性包括：
 * - 实时反映页面滚动进度
 * - 固定在页面顶部的细线样式
 * - 使用CSS动画实现平滑的进度更新
 * - 响应式设计，适配各种屏幕尺寸
 *
 * @component
 * @returns 滚动条组件JSX元素
 */
const Scrollbar = () => {
  return <ins className={styles.scrollbar} />;
};

export default Scrollbar;
