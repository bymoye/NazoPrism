'use client';

import Link from 'next/link';
import { memo } from 'react';

import { SITE_CONFIG } from '@/lib/site.config';
import styles from '@/styles/components/Footer.module.css';
import type { FooterProps } from '@/types/components';

/**
 * 网站页脚组件
 *
 * 提供网站底部信息展示，包括：
 * - 版权信息和作者署名
 * - 社交媒体链接（GitHub、Twitter等）
 * - 技术栈信息展示
 * - 支持自定义站点配置
 *
 * @component
 * @param props - 组件属性
 * @param props.siteConfig - 可选的站点配置，默认使用全局配置
 * @param props.className - 可选的自定义CSS类名
 * @returns 页脚组件JSX元素
 */
const Footer = memo<FooterProps>(
  ({ siteConfig = SITE_CONFIG, className, ...props }: FooterProps) => {
    // 获取当前年份
    const currentYear = new Date().getFullYear();

    return (
      <footer className={`${styles.footer} ${className ?? ''}`} {...props}>
        <div className={styles.footerContent}>
          {/* Main copyright */}
          <div className={styles.copyright}>
            <p>
              Copyright © {currentYear} by {siteConfig.author} All Rights
              Reserved.
            </p>
          </div>

          {/* Social links */}
          {siteConfig.social && (
            <div className={styles.socialLinks}>
              {siteConfig.social.github && (
                <Link
                  aria-label="GitHub"
                  className={styles.socialLink}
                  href={siteConfig.social.github}
                  rel="noopener noreferrer"
                  target="_blank"
                >
                  <svg
                    fill="currentColor"
                    height="20"
                    viewBox="0 0 24 24"
                    width="20"
                    xmlns="http://www.w3.org/2000/svg"
                  >
                    <title>GitHub</title>
                    <path d="M12 0C5.374 0 0 5.373 0 12 0 17.302 3.438 21.8 8.207 23.387c.599.111.793-.261.793-.577v-2.234c-3.338.726-4.033-1.416-4.033-1.416-.546-1.387-1.333-1.756-1.333-1.756-1.089-.745.083-.729.083-.729 1.205.084 1.839 1.237 1.839 1.237 1.07 1.834 2.807 1.304 3.492.997.107-.775.418-1.305.762-1.604-2.665-.305-5.467-1.334-5.467-5.931 0-1.311.469-2.381 1.236-3.221-.124-.303-.535-1.524.117-3.176 0 0 1.008-.322 3.301 1.23A11.509 11.509 0 0112 5.803c1.02.005 2.047.138 3.006.404 2.291-1.552 3.297-1.23 3.297-1.23.653 1.653.242 2.874.118 3.176.77.84 1.235 1.911 1.235 3.221 0 4.609-2.807 5.624-5.479 5.921.43.372.823 1.102.823 2.222v3.293c0 .319.192.694.801.576C20.566 21.797 24 17.3 24 12c0-6.627-5.373-12-12-12z" />
                  </svg>
                </Link>
              )}
              {siteConfig.social.twitter && (
                <Link
                  aria-label="Twitter"
                  className={styles.socialLink}
                  href={siteConfig.social.twitter}
                  rel="noopener noreferrer"
                  target="_blank"
                >
                  <svg
                    fill="currentColor"
                    height="20"
                    viewBox="0 0 24 24"
                    width="20"
                    xmlns="http://www.w3.org/2000/svg"
                  >
                    <title>Twitter</title>
                    <path d="M23.953 4.57a10 10 0 01-2.825.775 4.958 4.958 0 002.163-2.723c-.951.555-2.005.959-3.127 1.184a4.92 4.92 0 00-8.384 4.482C7.69 8.095 4.067 6.13 1.64 3.162a4.822 4.822 0 00-.666 2.475c0 1.71.87 3.213 2.188 4.096a4.904 4.904 0 01-2.228-.616v.06a4.923 4.923 0 003.946 4.827 4.996 4.996 0 01-2.212.085 4.936 4.936 0 004.604 3.417 9.867 9.867 0 01-6.102 2.105c-.39 0-.779-.023-1.17-.067a13.995 13.995 0 007.557 2.209c9.053 0 13.998-7.496 13.998-13.985 0-.21 0-.42-.015-.63A9.935 9.935 0 0024 4.59z" />
                  </svg>
                </Link>
              )}
            </div>
          )}

          {/* Additional info */}
          <div className={styles.additionalInfo}>
            <p>Powered by Next.js • Designed with Material Design 3</p>
          </div>
        </div>
      </footer>
    );
  }
);

Footer.displayName = 'Footer';

export default Footer;
