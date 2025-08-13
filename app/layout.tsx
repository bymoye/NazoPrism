import type { Metadata, Viewport } from 'next';
import Script from 'next/script';
import type { ReactNode } from 'react';

import ClientLayout from '@/components/layouts/ClientLayout';
import { Providers } from '@/contexts';

import '@/styles/globals.scss';

// 常量定义
const SITE_NAME = 'NazoPrism';
const LOCALE = 'zh_CN';
const SITE_DESCRIPTION = '沉淪在無盡的深淵中...';

/**
 * 视口配置
 */
export const viewport: Viewport = {
  width: 'device-width',
  initialScale: 1,
  maximumScale: 1,
  minimumScale: 1,
  userScalable: false,
};

/**
 * 应用程序元数据配置
 */
export const metadata: Metadata = {
  title: {
    default: SITE_NAME,
    template: `%s | ${SITE_NAME}`,
  },
  description: SITE_DESCRIPTION,
  icons: {
    icon: '/favicon.ico',
  },
  authors: [{ name: 'bymoye' }],
  creator: 'bymoye',
  publisher: SITE_NAME,
  robots: {
    index: true,
    follow: true,
  },
  openGraph: {
    type: 'website',
    locale: LOCALE,
    url: 'https://nazo-prism.vercel.app',
    siteName: SITE_NAME,
    title: SITE_NAME,
    description: SITE_DESCRIPTION,
  },
  twitter: {
    card: 'summary_large_image',
    title: SITE_NAME,
    description: SITE_DESCRIPTION,
    creator: '@bymoye',
  },
};

/**
 * 根布局组件
 *
 * @param children - 子组件
 * @returns 根布局组件
 */
const RootLayout = ({ children }: { children: ReactNode }) => {
  return (
    <html data-scroll-behavior='smooth' lang={LOCALE}>
      <head>
        <Script id='scroll-timeline-polyfill' strategy='beforeInteractive'>{`
          if (!CSS.supports('animation-timeline: scroll()')) {
            let polyfillScript = document.createElement('script');
            polyfillScript.src = 'https://static.nazo.run/scroll-timeline/scroll-timeline.js';
            polyfillScript.onerror = function(err) {
              console.error('加载 scroll-timeline Polyfill 失败：', err);
            };
            document.head.appendChild(polyfillScript);
          }
        `}</Script>
      </head>
      <body>
        <Providers>
          <ClientLayout>{children}</ClientLayout>
        </Providers>
      </body>
    </html>
  );
};

export default RootLayout;
