'use client';

import Image from 'next/image';
import type React from 'react';

import { SITE_CONFIG } from '@/lib/site.config';
import styles from '@/styles/components/Cover.module.scss';

/**
 * 网站封面组件
 *
 * @component
 * @returns 封面组件JSX元素
 */
const Cover: React.FC = () => {
  return (
    <figure className={styles['siteCover']}>
      <div className={styles['focusInfo']}>
        <Image
          priority
          alt='网站头像'
          className={styles['avatar']}
          height={130}
          src={SITE_CONFIG.avatar}
          width={130}
        />
        {/* 网站描述文字 */}
        <div className={styles['focusInfoText']}>{SITE_CONFIG.description}</div>
      </div>
    </figure>
  );
};

Cover.displayName = 'Cover';

export default Cover;
