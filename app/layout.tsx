import ClientLayout from '@/components/layouts/ClientLayout';
import { Providers } from '@/contexts';

import type { Metadata, Viewport } from 'next';
import type { ReactNode } from 'react';
import '@/styles/globals.css';
import '@/styles/md-sys-variables.css';

/**
 * 视口配置
 */
export const viewport: Viewport = {
  width: 'device-width',
  initialScale: 1.0,
};

/**
 * 应用程序元数据配置
 */
export const metadata: Metadata = {
  title: {
    default: 'NazoPrism',
    template: '%s | NazoPrism',
  },
  description: '沉淪在無盡的深淵中...',
  icons: {
    icon: '/favicon.ico',
  },
  authors: [{ name: 'bymoye' }],
  creator: 'bymoye',
  publisher: 'NazoPrism',
  robots: {
    index: true,
    follow: true,
  },
  openGraph: {
    type: 'website',
    locale: 'zh_CN',
    url: 'https://nazo-prism.vercel.app',
    siteName: 'NazoPrism',
    title: 'NazoPrism',
    description: '沉淪在無盡的深淵中...',
  },
  twitter: {
    card: 'summary_large_image',
    title: 'NazoPrism',
    description: '沉淪在無盡的深淵中...',
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
    <html lang='zh-CN' data-scroll-behavior='smooth'>
      <head>
        <script
          dangerouslySetInnerHTML={{
            __html: `
              if (!CSS.supports('animation-timeline: scroll()')) {
                var script = document.createElement('script');
                script.src = 'https://static.nazo.run/scroll-timeline/scroll-timeline.js';
                script.onerror = function(err) {
                  console.error('加载 scroll-timeline Polyfill 失败：', err);
                };
                document.head.appendChild(script);
              }
            `,
          }}
        />
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
