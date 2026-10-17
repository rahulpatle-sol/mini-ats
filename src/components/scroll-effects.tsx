"use client";

import { useEffect, useRef, useState } from "react";

/** Toggles `visible` class when the element enters the viewport. */
export function Reveal({
  children,
  delay = 0,
  className = "",
}: {
  children: React.ReactNode;
  delay?: number;
  className?: string;
}) {
  const ref = useRef<HTMLDivElement>(null);
  const [visible, setVisible] = useState(false);

  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    const io = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          setVisible(true);
          io.disconnect();
        }
      },
      { threshold: 0.15, rootMargin: "0px 0px -40px 0px" },
    );
    io.observe(el);
    return () => io.disconnect();
  }, []);

  return (
    <div
      ref={ref}
      className={`reveal ${visible ? "visible" : ""} ${className}`}
      style={{ transitionDelay: `${delay}ms` }}
    >
      {children}
    </div>
  );
}

/** SVG path that draws itself as you scroll past it. */
export function ScrollDraw({ d, stroke = "var(--accent)", strokeWidth = 2.5, className = "" }: { d: string; stroke?: string; strokeWidth?: number; className?: string }) {
  const ref = useRef<SVGPathElement>(null);
  const [progress, setProgress] = useState(0);

  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    const len = el.getTotalLength();
    el.style.strokeDasharray = String(len);
    el.style.strokeDashoffset = String(len);

    function onScroll() {
      const rect = el!.getBoundingClientRect();
      const vh = window.innerHeight;
      // 0 when element bottom enters viewport, 1 when element top reaches viewport middle
      const raw = (vh - rect.top) / (vh * 0.5 + rect.height * 0.5);
      const p = Math.min(1, Math.max(0, raw));
      setProgress(p);
      el!.style.strokeDashoffset = String(len * (1 - p));
    }

    onScroll();
    window.addEventListener("scroll", onScroll, { passive: true });
    window.addEventListener("resize", onScroll, { passive: true });
    return () => {
      window.removeEventListener("scroll", onScroll);
      window.removeEventListener("resize", onScroll);
    };
  }, []);

  return <path ref={ref} d={d} stroke={stroke} strokeWidth={strokeWidth} fill="none" strokeLinecap="round" className={className} data-progress={progress} />;
}

/** Fades + slides in on scroll. Wrap sections in this. */
export function ParallaxCard({ children, speed = 0.06, className = "" }: { children: React.ReactNode; speed?: number; className?: string }) {
  const ref = useRef<HTMLDivElement>(null);
  const [offset, setOffset] = useState(0);

  useEffect(() => {
    function onScroll() {
      const el = ref.current;
      if (!el) return;
      const rect = el.getBoundingClientRect();
      const vh = window.innerHeight;
      const center = rect.top + rect.height / 2 - vh / 2;
      setOffset(-center * speed);
    }
    onScroll();
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, [speed]);

  return (
    <div ref={ref} className={className} style={{ transform: `translateY(${offset}px)` }}>
      {children}
    </div>
  );
}
