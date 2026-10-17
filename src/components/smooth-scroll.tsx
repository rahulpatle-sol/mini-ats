"use client";

import Lenis from "lenis";
import { useEffect, type ReactNode } from "react";

/**
 * Sherians-style buttery smooth scroll (Lenis) for the landing page,
 * synced with GSAP ScrollTrigger's ticker.
 */
export function SmoothScroll({ children }: { children: ReactNode }) {
  useEffect(() => {
    if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) return;

    let lenis: Lenis | null = null;
    let rafOff: (() => void) | null = null;

    const boot = async () => {
      const gsap = (await import("gsap")).default;
      const { ScrollTrigger } = await import("gsap/ScrollTrigger");
      gsap.registerPlugin(ScrollTrigger);

      lenis = new Lenis({
        duration: 1.15,
        easing: (t) => Math.min(1, 1.001 - Math.pow(2, -10 * t)),
        smoothWheel: true,
        touchMultiplier: 1.4,
      });

      // Lenis → ScrollTrigger sync (the important bit)
      lenis.on("scroll", ScrollTrigger.update);
      const ticker = (time: number) => {
        lenis?.raf(time * 1000);
      };
      gsap.ticker.add(ticker);
      gsap.ticker.lagSmoothing(0);

      rafOff = () => {
        gsap.ticker.remove(ticker);
      };
      (window as unknown as { __lenis?: Lenis }).__lenis = lenis;
    };

    void boot();

    return () => {
      rafOff?.();
      lenis?.destroy();
      delete (window as unknown as { __lenis?: Lenis }).__lenis;
    };
  }, []);

  return <>{children}</>;
}
