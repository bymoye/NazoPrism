'use client';
import gsap from 'gsap';
import { type LenisRef, ReactLenis } from 'lenis/react';
import { type ReactNode, useEffect, useRef } from 'react';

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
 * 客户端布局组件
 *
 * @param props.children - 子组件
 * @returns 客户端布局组件
 */
const ClientLayout = ({ children }: ClientLayoutProps) => {
  /** 启用全局平滑滚动 */
  const lenisRef = useRef<LenisRef>(null);

  useEffect(() => {
    function update(time: number) {
      lenisRef.current?.lenis?.raf(time * 1000);
    }

    gsap.ticker.add(update);

    return () => {
      gsap.ticker.remove(update);
    };
  }, []);

  return (
    <ReactLenis ref={lenisRef} root options={{ autoRaf: false }}>
      <Scrollbar />
      <BackgroundCarousel />
      <Navigation />
      <main>{children}</main>
      <ToTop />
      <Footer />
    </ReactLenis>
  );
};

export default ClientLayout;
