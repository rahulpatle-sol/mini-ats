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

/**
 * Sherians-style scroll parallax layer.
 * Moves the child vertically (and optionally scales/fades) based on how far
 * the parent section is from the viewport center. Positive `speed` moves
 * slower than scroll (background); negative moves faster (foreground).
 */
export function ParallaxLayer({
  children,
  speed = 0.25,
  className = "",
  enableScale = false,
}: {
  children: React.ReactNode;
  /** -0.5 … 0.5. Higher = lags behind scroll (deep bg). Negative = races ahead. */
  speed?: number;
  className?: string;
  enableScale?: boolean;
}) {
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) return;

    let raf = 0;
    let current = 0;
    let target = 0;

    const tick = () => {
      current += (target - current) * 0.08; // smooth lerp — the "buttery" feel
      const scale = enableScale ? 1 + Math.abs(current) * 0.0004 : 1;
      el.style.transform = `translate3d(0, ${current.toFixed(2)}px, 0) scale(${scale.toFixed(4)})`;
      raf = requestAnimationFrame(tick);
    };

    const onScroll = () => {
      const rect = el.getBoundingClientRect();
      const vh = window.innerHeight;
      // -1 (below viewport) → 0 (center) → 1 (above viewport)
      const progress = (rect.top + rect.height / 2 - vh / 2) / (vh / 2);
      target = -progress * speed * 120;
    };

    onScroll();
    window.addEventListener("scroll", onScroll, { passive: true });
    window.addEventListener("resize", onScroll, { passive: true });
    raf = requestAnimationFrame(tick);

    return () => {
      cancelAnimationFrame(raf);
      window.removeEventListener("scroll", onScroll);
      window.removeEventListener("resize", onScroll);
    };
  }, [speed, enableScale]);

  return (
    <div ref={ref} className={className} style={{ willChange: "transform" }}>
      {children}
    </div>
  );
}

/**
 * Classic background-image parallax: the image translates inside a clipped
 * container so it feels like a window into a deeper scene.
 */
export function ParallaxBg({
  src,
  speed = 0.35,
  className = "",
  overlay,
  children,
}: {
  src: string;
  /** How much the image lags (0.2 slow … 0.6 dramatic). */
  speed?: number;
  className?: string;
  /** Optional gradient/dark overlay element on top of the image. */
  overlay?: React.ReactNode;
  children?: React.ReactNode;
}) {
  const wrapRef = useRef<HTMLDivElement>(null);
  const imgRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const wrap = wrapRef.current;
    const img = imgRef.current;
    if (!wrap || !img) return;
    if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) return;

    let raf = 0;
    let current = 0;
    let target = 0;

    const tick = () => {
      current += (target - current) * 0.07;
      img.style.transform = `translate3d(0, ${current.toFixed(2)}px, 0) scale(1.15)`;
      raf = requestAnimationFrame(tick);
    };

    const onScroll = () => {
      const rect = wrap.getBoundingClientRect();
      const vh = window.innerHeight;
      // how far section center is from viewport center, normalized
      const progress = (rect.top + rect.height / 2 - vh / 2) / vh;
      target = progress * speed * -160; // negative → image drifts opposite
    };

    onScroll();
    window.addEventListener("scroll", onScroll, { passive: true });
    window.addEventListener("resize", onScroll, { passive: true });
    raf = requestAnimationFrame(tick);

    return () => {
      cancelAnimationFrame(raf);
      window.removeEventListener("scroll", onScroll);
      window.removeEventListener("resize", onScroll);
    };
  }, [speed]);

  return (
    <div ref={wrapRef} className={`relative overflow-hidden ${className}`}>
      <div
        ref={imgRef}
        className="absolute inset-[-12%] bg-cover bg-center will-change-transform"
        style={{ backgroundImage: `url(${src})` }}
        aria-hidden
      />
      {overlay}
      {children}
    </div>
  );
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

/**
 * Sticky section: content stays pinned while you scroll, then releases.
 * Classic "scroll story" beat — use sparingly (hero, one showcase).
 */
export function StickyBeat({ children, className = "" }: { children: React.ReactNode; className?: string }) {
  return (
    <div className={`sticky top-0 flex min-h-svh items-center ${className}`}>
      {children}
    </div>
  );
}
