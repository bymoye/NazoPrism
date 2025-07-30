'use client';
import gsap from 'gsap';
import { ReactLenis } from 'lenis/react';
import React, { ReactNode, memo } from 'react';
import { useEffect, useRef } from 'react';

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
  // 启用全局平滑滚动
  const lenisRef = useRef<any>(null);

  useEffect(() => {
    function update(time: number) {
      lenisRef.current?.lenis?.raf(time * 1000);
    }

    gsap.ticker.add(update);

    return () => gsap.ticker.remove(update);
  }, []);

  return (
    <>
      <ReactLenis root options={{ autoRaf: false }} ref={lenisRef}>
        <Scrollbar />
        <BackgroundCarousel />
        <Navigation />
        <main>{children}</main>
        <ToTop />
        <Footer />
      </ReactLenis>
    </>
  );
});

ClientLayout.displayName = 'ClientLayout';

export default ClientLayout;
