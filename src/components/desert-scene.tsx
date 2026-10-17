"use client";

import { useEffect, useRef } from "react";

/**
 * Warm desert landing scene — animated SVG:
 * gradient dusk sky, glowing sun, parallax dunes that breathe,
 * birds gliding, and drifting dust motes.
 * Pure CSS/SVG + rAF; no images.
 */
export function DesertScene({ className = "" }: { className?: string }) {
  const rootRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const root = rootRef.current;
    if (!root) return;
    const reduce = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    if (reduce) return;

    let raf = 0;
    let mx = 0.5;
    let my = 0.5;
    let cx = 0.5;
    let cy = 0.5;

    const onMove = (e: PointerEvent) => {
      mx = e.clientX / window.innerWidth;
      my = e.clientY / window.innerHeight;
    };

    const tick = () => {
      cx += (mx - cx) * 0.04;
      cy += (my - cy) * 0.04;
      const dx = (cx - 0.5) * 2;
      const dy = (cy - 0.5) * 2;
      root.style.setProperty("--px", dx.toFixed(4));
      root.style.setProperty("--py", dy.toFixed(4));
      raf = requestAnimationFrame(tick);
    };

    window.addEventListener("pointermove", onMove, { passive: true });
    raf = requestAnimationFrame(tick);
    return () => {
      window.removeEventListener("pointermove", onMove);
      cancelAnimationFrame(raf);
    };
  }, []);

  return (
    <div ref={rootRef} className={`desert-scene relative overflow-hidden ${className}`} aria-hidden>
      <svg viewBox="0 0 1200 800" preserveAspectRatio="xMidYMid slice" className="absolute inset-0 h-full w-full">
        <defs>
          <linearGradient id="ds-sky" x1="0" y1="0" x2="0" y2="1">
            <stop offset="0%" stopColor="#1a0f0a" />
            <stop offset="35%" stopColor="#3d1e12" />
            <stop offset="62%" stopColor="#8b3a1f" />
            <stop offset="82%" stopColor="#d97a45" />
            <stop offset="100%" stopColor="#f0a868" />
          </linearGradient>
          <radialGradient id="ds-sun" cx="50%" cy="50%" r="50%">
            <stop offset="0%" stopColor="#ffe8c4" stopOpacity="1" />
            <stop offset="35%" stopColor="#ffb86b" stopOpacity="0.95" />
            <stop offset="70%" stopColor="#e8763a" stopOpacity="0.35" />
            <stop offset="100%" stopColor="#e8763a" stopOpacity="0" />
          </radialGradient>
          <linearGradient id="ds-dune1" x1="0" y1="0" x2="0" y2="1">
            <stop offset="0%" stopColor="#c4623f" />
            <stop offset="100%" stopColor="#7a3420" />
          </linearGradient>
          <linearGradient id="ds-dune2" x1="0" y1="0" x2="0" y2="1">
            <stop offset="0%" stopColor="#a04a2e" />
            <stop offset="100%" stopColor="#5c2616" />
          </linearGradient>
          <linearGradient id="ds-dune3" x1="0" y1="0" x2="0" y2="1">
            <stop offset="0%" stopColor="#6e2e1a" />
            <stop offset="100%" stopColor="#2e1209" />
          </linearGradient>
          <filter id="ds-glow" x="-60%" y="-60%" width="220%" height="220%">
            <feGaussianBlur stdDeviation="18" />
          </filter>
        </defs>

        {/* sky */}
        <rect width="1200" height="800" fill="url(#ds-sky)" />

        {/* stars in upper sky */}
        <g className="desert-stars" fill="#fff7e8">
          {[
            [80, 60], [180, 120], [300, 40], [420, 90], [560, 50],
            [700, 100], [820, 35], [940, 80], [1080, 55], [1140, 130],
            [140, 180], [380, 160], [640, 170], [900, 150], [1020, 190],
          ].map(([x, y], i) => (
            <circle key={i} cx={x} cy={y} r={i % 3 === 0 ? 1.6 : 1} opacity={0.5 + (i % 4) * 0.12}>
              <animate attributeName="opacity" values={`${0.3 + (i % 3) * 0.15};0.9;${0.3 + (i % 3) * 0.15}`} dur={`${3 + (i % 5)}s`} repeatCount="indefinite" />
            </circle>
          ))}
        </g>

        {/* sun glow + disc — parallax via CSS transform on parent g */}
        <g className="desert-sun" style={{ transform: "translate(calc(var(--px, 0) * -18px), calc(var(--py, 0) * -10px))" }}>
          <circle cx="600" cy="430" r="160" fill="url(#ds-sun)" filter="url(#ds-glow)" opacity="0.85" />
          <circle cx="600" cy="430" r="72" fill="#ffd9a0" />
          <circle cx="600" cy="430" r="72" fill="#ffedd0" opacity="0.5">
            <animate attributeName="r" values="72;78;72" dur="6s" repeatCount="indefinite" />
          </circle>
        </g>

        {/* birds */}
        <g className="desert-birds" stroke="#2e1209" strokeWidth="2.2" fill="none" strokeLinecap="round" opacity="0.7">
          <path d="M200 220 q10 -10 20 0 q10 -10 20 0">
            <animateTransform attributeName="transform" type="translate" values="0 0; 340 -40; 700 10; 1100 -30" dur="22s" repeatCount="indefinite" />
          </path>
          <path d="M260 260 q8 -8 16 0 q8 -8 16 0">
            <animateTransform attributeName="transform" type="translate" values="0 0; 280 20; 620 -20; 1000 15" dur="28s" repeatCount="indefinite" />
          </path>
          <path d="M160 300 q7 -7 14 0 q7 -7 14 0">
            <animateTransform attributeName="transform" type="translate" values="0 0; 400 30; 800 -10; 1150 25" dur="34s" repeatCount="indefinite" />
          </path>
        </g>

        {/* dune layers — slow horizontal drift + mouse parallax */}
        <g className="desert-dune desert-dune--far" style={{ transform: "translate(calc(var(--px, 0) * -8px), 0)" }}>
          <path
            d="M0 520 C 150 470, 280 500, 420 480 S 700 440, 860 475 S 1080 500, 1200 470 L 1200 800 L 0 800 Z"
            fill="url(#ds-dune1)"
          >
            <animate attributeName="d"
              values="M0 520 C 150 470, 280 500, 420 480 S 700 440, 860 475 S 1080 500, 1200 470 L 1200 800 L 0 800 Z;M0 480 C 150 500, 280 470, 420 500 S 700 490, 860 450 S 1080 470, 1200 510 L 1200 800 L 0 800 Z;M0 520 C 150 470, 280 500, 420 480 S 700 440, 860 475 S 1080 500, 1200 470 L 1200 800 L 0 800 Z"
              dur="18s" repeatCount="indefinite" />
          </path>
        </g>

        <g className="desert-dune desert-dune--mid" style={{ transform: "translate(calc(var(--px, 0) * -16px), 0)" }}>
          <path
            d="M0 600 C 200 540, 350 590, 520 560 S 820 520, 1000 570 S 1140 590, 1200 560 L 1200 800 L 0 800 Z"
            fill="url(#ds-dune2)"
          >
            <animate attributeName="d"
              values="M0 600 C 200 540, 350 590, 520 560 S 820 520, 1000 570 S 1140 590, 1200 560 L 1200 800 L 0 800 Z;M0 560 C 200 590, 350 550, 520 590 S 820 560, 1000 530 S 1140 570, 1200 600 L 1200 800 L 0 800 Z;M0 600 C 200 540, 350 590, 520 560 S 820 520, 1000 570 S 1140 590, 1200 560 L 1200 800 L 0 800 Z"
              dur="14s" repeatCount="indefinite" />
          </path>
        </g>

        <g className="desert-dune desert-dune--near" style={{ transform: "translate(calc(var(--px, 0) * -28px), calc(var(--py, 0) * -6px))" }}>
          <path
            d="M0 700 C 180 650, 400 710, 600 670 S 950 640, 1200 690 L 1200 800 L 0 800 Z"
            fill="url(#ds-dune3)"
          >
            <animate attributeName="d"
              values="M0 700 C 180 650, 400 710, 600 670 S 950 640, 1200 690 L 1200 800 L 0 800 Z;M0 670 C 180 710, 400 660, 600 700 S 950 680, 1200 650 L 1200 800 L 0 800 Z;M0 700 C 180 650, 400 710, 600 670 S 950 640, 1200 690 L 1200 800 L 0 800 Z"
              dur="11s" repeatCount="indefinite" />
          </path>
          {/* lone figure walking the ridge — "man on the dunes" */}
          <g className="desert-walker" transform="translate(560, 618)">
            <ellipse cx="0" cy="52" rx="18" ry="3" fill="#000" opacity="0.35" />
            <line x1="0" y1="18" x2="0" y2="46" stroke="#1a0c06" strokeWidth="3.5" strokeLinecap="round" />
            <circle cx="0" cy="12" r="5.5" fill="#1a0c06" />
            <line x1="0" y1="28" x2="-10" y2="40" stroke="#1a0c06" strokeWidth="2.8" strokeLinecap="round">
              <animateTransform attributeName="transform" type="rotate" values="0 0 28; 18 0 28; 0 0 28" dur="1.6s" repeatCount="indefinite" />
            </line>
            <line x1="0" y1="28" x2="10" y2="40" stroke="#1a0c06" strokeWidth="2.8" strokeLinecap="round">
              <animateTransform attributeName="transform" type="rotate" values="0 0 28; -18 0 28; 0 0 28" dur="1.6s" repeatCount="indefinite" />
            </line>
            <line x1="0" y1="46" x2="-8" y2="58" stroke="#1a0c06" strokeWidth="3" strokeLinecap="round">
              <animateTransform attributeName="transform" type="rotate" values="0 0 46; -22 0 46; 0 0 46" dur="1.6s" repeatCount="indefinite" />
            </line>
            <line x1="0" y1="46" x2="8" y2="58" stroke="#1a0c06" strokeWidth="3" strokeLinecap="round">
              <animateTransform attributeName="transform" type="rotate" values="0 0 46; 22 0 46; 0 0 46" dur="1.6s" repeatCount="indefinite" />
            </line>
            <animateTransform attributeName="transform" type="translate" values="480 618; 700 612; 480 618" dur="24s" repeatCount="indefinite" />
          </g>
        </g>

        {/* heat shimmer lines near horizon */}
        <g stroke="#ffd9a0" strokeWidth="1" opacity="0.12">
          <line x1="100" y1="455" x2="220" y2="455">
            <animate attributeName="opacity" values="0.05;0.2;0.05" dur="4s" repeatCount="indefinite" />
          </line>
          <line x1="880" y1="465" x2="1020" y2="465">
            <animate attributeName="opacity" values="0.15;0.04;0.15" dur="5s" repeatCount="indefinite" />
          </line>
        </g>
      </svg>

      {/* dust motes */}
      <div className="desert-motes" />
      <div className="desert-vignette" />
    </div>
  );
}
