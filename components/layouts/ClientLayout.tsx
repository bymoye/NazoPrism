'use client';

import React, { ReactNode, memo } from 'react';

import BackgroundCarousel from '@/components/ui/BackgroundCarousel';
import Footer from '@/components/ui/Footer';
import Navigation from '@/components/ui/Navigation';
import Scrollbar from '@/components/ui/Scrollbar';
import ToTop from '@/components/ui/ToTop';

/**
 * 客户端布局组件属性接口
 */
interface ClientLayoutProps {
  /** 子组件 */
  children: ReactNode;
}

/**
 * 客户端布局组件，包含页面的基本布局结构
 *
 * @param props - 组件属性
 * @returns 客户端布局组件
 */
const ClientLayout = memo<ClientLayoutProps>(({ children }: ClientLayoutProps) => {
  return (
    <>
      <Scrollbar />
      <BackgroundCarousel />
      <Navigation />
      <main>{children}</main>
      <ToTop />
      <Footer />
    </>
  );
});

ClientLayout.displayName = 'ClientLayout';

export default ClientLayout;
