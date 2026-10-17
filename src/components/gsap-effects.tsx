"use client";

import { useGSAP } from "@gsap/react";
import gsap from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import { useRef, type ReactNode } from "react";

if (typeof window !== "undefined") {
  gsap.registerPlugin(ScrollTrigger, useGSAP);
}

/**
 * GSAP ScrollTrigger parallax image — image lags behind scroll inside a
 * clipped frame (classic cinematic depth).
 */
export function GsapParallaxImage({
  src,
  /** 0 … 30. Higher = image travels more (dramatic). */
  amount = 12,
  className = "",
  overlay,
  children,
}: {
  src: string;
  amount?: number;
  className?: string;
  overlay?: ReactNode;
  children?: ReactNode;
}) {
  const wrap = useRef<HTMLDivElement>(null);
  const img = useRef<HTMLDivElement>(null);

  useGSAP(
    () => {
      if (!img.current || !wrap.current) return;
      gsap.fromTo(
        img.current,
        { yPercent: -amount },
        {
          yPercent: amount,
          ease: "none",
          scrollTrigger: {
            trigger: wrap.current,
            start: "top bottom",
            end: "bottom top",
            scrub: true,
          },
        },
      );
    },
    { scope: wrap, dependencies: [amount] },
  );

  return (
    <div ref={wrap} className={`relative overflow-hidden ${className}`}>
      <div
        ref={img}
        className="absolute inset-[-18%] bg-cover bg-center will-change-transform"
        style={{ backgroundImage: `url(${src})` }}
        aria-hidden
      />
      {overlay}
      {children}
    </div>
  );
}

/**
 * Text/heading that slides up + fades as it enters the viewport.
 * Pass multiple block children + stagger for line-by-line reveals.
 */
export function GsapReveal({
  children,
  y = 64,
  stagger = 0,
  delay = 0,
  className = "",
}: {
  children: ReactNode;
  y?: number;
  stagger?: number;
  delay?: number;
  className?: string;
}) {
  const ref = useRef<HTMLDivElement>(null);

  useGSAP(
    () => {
      const el = ref.current;
      if (!el) return;
      const targets = stagger > 0 ? Array.from(el.children) : [el];
      gsap.fromTo(
        targets,
        { y, opacity: 0 },
        {
          y: 0,
          opacity: 1,
          duration: 1.1,
          delay,
          stagger,
          ease: "power3.out",
          scrollTrigger: {
            trigger: el,
            start: "top 88%",
            toggleActions: "play none none none",
          },
        },
      );
    },
    { scope: ref, dependencies: [y, stagger, delay] },
  );

  return (
    <div ref={ref} className={className}>
      {children}
    </div>
  );
}

/** Horizontal drift — element slides in from the side on scroll. */
export function GsapDrift({
  children,
  from = -80,
  className = "",
}: {
  children: ReactNode;
  from?: number;
  className?: string;
}) {
  const ref = useRef<HTMLDivElement>(null);

  useGSAP(
    () => {
      const el = ref.current;
      if (!el) return;
      gsap.fromTo(
        el,
        { x: from, opacity: 0 },
        {
          x: 0,
          opacity: 1,
          duration: 1.2,
          ease: "power3.out",
          scrollTrigger: { trigger: el, start: "top 90%" },
        },
      );
    },
    { scope: ref, dependencies: [from] },
  );

  return (
    <div ref={ref} className={className}>
      {children}
    </div>
  );
}

/** Hero content gently scales down + fades as you scroll past it. */
export function GsapPinScale({
  children,
  className = "",
}: {
  children: ReactNode;
  className?: string;
}) {
  const ref = useRef<HTMLDivElement>(null);

  useGSAP(
    () => {
      const el = ref.current;
      if (!el) return;
      gsap.to(el, {
        scale: 0.94,
        opacity: 0.4,
        ease: "none",
        scrollTrigger: {
          trigger: el,
          start: "top top",
          end: "bottom top",
          scrub: true,
        },
      });
    },
    { scope: ref },
  );

  return (
    <div ref={ref} className={className}>
      {children}
    </div>
  );
}

/** Parallax layer: children translate at a custom speed (background lag). */
export function GsapParallax({
  children,
  speed = 15,
  className = "",
}: {
  children: ReactNode;
  /** percent travel across the scroll range */
  speed?: number;
  className?: string;
}) {
  const ref = useRef<HTMLDivElement>(null);

  useGSAP(
    () => {
      const el = ref.current;
      if (!el) return;
      gsap.fromTo(
        el,
        { yPercent: -speed },
        {
          yPercent: speed,
          ease: "none",
          scrollTrigger: {
            trigger: el.parentElement ?? el,
            start: "top bottom",
            end: "bottom top",
            scrub: true,
          },
        },
      );
    },
    { scope: ref, dependencies: [speed] },
  );

  return (
    <div ref={ref} className={`will-change-transform ${className}`}>
      {children}
    </div>
  );
}
