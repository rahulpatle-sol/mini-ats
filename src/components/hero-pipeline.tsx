"use client";

import { useEffect, useRef, useState } from "react";

const STAGES = [
  { label: "Applied", color: "#94a3b8" },
  { label: "Screening", color: "#f59e0b" },
  { label: "Interview", color: "#8b5cf6" },
  { label: "Offer", color: "#0ea5e9" },
  { label: "Hired", color: "#10b981" },
] as const;

/**
 * Auto-draws a hiring pipeline on mount: the path strokes itself in,
 * stage nodes pop in sequence, then a candidate chip slides along the path.
 */
export function HeroPipelineSvg() {
  const pathRef = useRef<SVGPathElement>(null);
  const [drawn, setDrawn] = useState(false);
  const [activeStage, setActiveStage] = useState(-1);

  useEffect(() => {
    const path = pathRef.current;
    if (!path) return;
    const len = path.getTotalLength();
    path.style.strokeDasharray = String(len);
    path.style.strokeDashoffset = String(len);

    // kick off draw
    const raf = requestAnimationFrame(() => {
      path.style.transition = "stroke-dashoffset 2.4s cubic-bezier(0.65, 0, 0.35, 1)";
      path.style.strokeDashoffset = "0";
    });

    const t1 = setTimeout(() => setDrawn(true), 400);

    // light up stages one by one as the path draws past them
    STAGES.forEach((_, i) => {
      setTimeout(() => setActiveStage(i), 500 + i * 420);
    });

    return () => {
      cancelAnimationFrame(raf);
      clearTimeout(t1);
    };
  }, []);

  // node positions matching the path
  const nodes = [
    { x: 70, y: 130 },
    { x: 260, y: 70 },
    { x: 470, y: 130 },
    { x: 680, y: 70 },
    { x: 870, y: 130 },
  ];

  const D = "M 70 130 C 140 130, 170 70, 260 70 C 350 70, 380 130, 470 130 C 560 130, 590 70, 680 70 C 770 70, 800 130, 870 130";

  return (
    <svg viewBox="0 0 940 220" className="w-full" role="img" aria-label="Hiring pipeline: Applied, Screening, Interview, Offer, Hired">
      <defs>
        <linearGradient id="hero-path-grad" x1="0" y1="0" x2="1" y2="0">
          <stop offset="0%" stopColor="var(--accent)" stopOpacity="0.25" />
          <stop offset="50%" stopColor="var(--accent)" />
          <stop offset="100%" stopColor="#10b981" />
        </linearGradient>
        <filter id="hero-glow" x="-40%" y="-40%" width="180%" height="180%">
          <feGaussianBlur stdDeviation="5" result="b" />
          <feMerge>
            <feMergeNode in="b" />
            <feMergeNode in="SourceGraphic" />
          </feMerge>
        </filter>
        <filter id="chip-shadow" x="-30%" y="-60%" width="160%" height="240%">
          <feDropShadow dx="0" dy="3" stdDeviation="5" floodOpacity="0.18" />
        </filter>
      </defs>

      {/* track (always faint) */}
      <path d={D} fill="none" stroke="var(--line)" strokeWidth="3" />

      {/* drawn path */}
      <path
        ref={pathRef}
        d={D}
        fill="none"
        stroke="url(#hero-path-grad)"
        strokeWidth="3.5"
        strokeLinecap="round"
        filter={drawn ? "url(#hero-glow)" : undefined}
      />

      {/* travelling dot along the path */}
      <circle r="6" fill="var(--accent)" filter="url(#hero-glow)">
        <animateMotion dur="4s" repeatCount="indefinite" path={D} keyPoints="0;1" keyTimes="0;1" calcMode="spline" keySplines="0.45 0 0.55 1" />
      </circle>

      {/* stage nodes */}
      {nodes.map((n, i) => {
        const on = activeStage >= i;
        const s = STAGES[i];
        return (
          <g key={s.label} opacity={on ? 1 : 0} style={{ transition: "opacity 0.5s ease" }}>
            <circle cx={n.x} cy={n.y} r={18} fill="var(--surface)" stroke={s.color} strokeWidth={activeStage === i ? 3.5 : 2.5} style={{ transition: "stroke-width 0.3s" }} />
            <circle cx={n.x} cy={n.y} r={8} fill={s.color} />
            {activeStage === i && (
              <circle cx={n.x} cy={n.y} r={26} fill="none" stroke={s.color} strokeWidth="1.5" opacity="0.4">
                <animate attributeName="r" from="20" to="34" dur="1s" repeatCount="indefinite" />
                <animate attributeName="opacity" from="0.5" to="0" dur="1s" repeatCount="indefinite" />
              </circle>
            )}
            <text x={n.x} y={n.y + 42} textAnchor="middle" fill="var(--ink)" fontSize="14" fontWeight="600" fontFamily="system-ui, sans-serif">
              {s.label}
            </text>
          </g>
        );
      })}

      {/* candidate chip that slides through once */}
      <g opacity={drawn ? 1 : 0} style={{ transition: "opacity 0.4s" }} filter="url(#chip-shadow)">
        <g>
          <rect x="-52" y="-16" width="104" height="32" rx="16" fill="var(--accent-soft)" stroke="var(--accent)" strokeWidth="1.5" />
          <circle cx="-34" cy="0" r="8" fill="var(--accent)" />
          <rect x="-20" y="-7" width="56" height="5" rx="2.5" fill="var(--ink)" opacity="0.7" />
          <rect x="-20" y="3" width="40" height="5" rx="2.5" fill="var(--muted)" opacity="0.5" />
          <animateMotion dur="4s" repeatCount="indefinite" path={D} keyPoints="0;1" keyTimes="0;1" calcMode="spline" keySplines="0.45 0 0.55 1" />
        </g>
      </g>
    </svg>
  );
}
