import styles from '@/styles/pages/page.module.css';

import type { Metadata } from 'next';

/**
 * 关于页面元数据配置
 */
export const metadata: Metadata = {
  title: '关于我们 - NazoPrism',
  description: '了解更多关于我们的信息',
};

/**
 * 关于页面组件
 *
 * @returns 关于页面组件
 */
const AboutPage = () => {
  return (
    <div className={styles.pageContent}>
      <h1>关于我们</h1>
      <p>这里是关于页面的内容。</p>
    </div>
  );
};

export default AboutPage;
