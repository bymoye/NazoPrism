import type { Metadata } from 'next';
import styles from '@/styles/pages/users.module.css';

/**
 * 用户页面元数据配置
 */
export const metadata: Metadata = {
  title: '用户 - NazoPrism',
  description: '用户相关页面',
};

/**
 * 用户页面组件
 *
 * @returns 用户页面组件
 */
const UsersPage = () => {
  return (
    <div className={styles.pageContent}>
      <h1>用户</h1>
      <p>这里是用户页面的内容。</p>
    </div>
  );
};

export default UsersPage;
