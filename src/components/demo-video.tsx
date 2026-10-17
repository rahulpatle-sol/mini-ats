"use client";

import { useState } from "react";
import { Play, Pause } from "lucide-react";

export function DemoVideo() {
  const [playing, setPlaying] = useState(false);

  return (
    <div className="relative mx-auto w-full max-w-3xl">
      <div className="card overflow-hidden p-0 shadow-2xl">
        {/* Poster frame: an animated mock-up; real video replaces the inner element when available */}
        <div className="relative aspect-video bg-gradient-to-br from-sidebar via-canvas to-accent-soft">
          <svg viewBox="0 0 800 450" className="absolute inset-0 h-full w-full" aria-hidden>
            <rect width="800" height="450" fill="var(--surface)" opacity="0.6" />
            {/* fake sidebar */}
            <rect x="0" y="0" width="160" height="450" fill="var(--sidebar)" />
            <circle cx="30" cy="32" r="8" fill="var(--accent)" />
            <rect x="46" y="26" width="70" height="12" rx="4" fill="var(--muted)" opacity="0.4" />
            {[0, 1, 2, 3].map((i) => (
              <rect key={i} x="16" y={72 + i * 40} width="128" height="28" rx="8" fill={i === 1 ? "var(--accent-soft)" : "transparent"} />
            ))}
            {/* fake kanban columns */}
            {["applied", "screening", "interview", "offer"].map((label, ci) => (
              <g key={label} transform={`translate(${184 + ci * 155}, 24)`}>
                <circle cx="8" cy="10" r="5" fill={["#94a3b8", "#f59e0b", "#8b5cf6", "#0ea5e9"][ci]} />
                <rect x="20" y="4" width="70" height="12" rx="4" fill="var(--muted)" opacity="0.5" />
                <rect x="0" y="32" width="140" height="70" rx="10" fill="var(--surface)" stroke="var(--line)" />
                <rect x="12" y="44" width="80" height="10" rx="4" fill="var(--ink)" opacity="0.7" />
                <rect x="12" y="62" width="110" height="8" rx="4" fill="var(--muted)" opacity="0.4" />
                <rect x="12" y="78" width="50" height="8" rx="4" fill="var(--accent)" opacity="0.5" />
                {ci < 3 && (
                  <>
                    <rect x="0" y="114" width="140" height="60" rx="10" fill="var(--surface)" stroke="var(--line)" />
                    <rect x="12" y="126" width="70" height="10" rx="4" fill="var(--ink)" opacity="0.6" />
                    <rect x="12" y="144" width="100" height="8" rx="4" fill="var(--muted)" opacity="0.35" />
                  </>
                )}
              </g>
            ))}
            {/* animated moving card */}
            <g className={playing ? "video-card-move" : ""}>
              <rect x="184" y="260" width="140" height="56" rx="10" fill="var(--accent-soft)" stroke="var(--accent)" strokeOpacity="0.5" />
              <rect x="196" y="274" width="80" height="10" rx="4" fill="var(--accent)" />
              <rect x="196" y="292" width="100" height="8" rx="4" fill="var(--muted)" opacity="0.5" />
            </g>
          </svg>

          {/* play overlay */}
          <button
            type="button"
            onClick={() => setPlaying((p) => !p)}
            aria-label={playing ? "Pause demo" : "Play demo"}
            className="absolute inset-0 grid place-items-center bg-ink/20 transition-colors hover:bg-ink/30"
          >
            <span className="grid size-16 place-items-center rounded-full bg-accent text-accent-ink shadow-xl transition-transform hover:scale-110">
              {playing ? <Pause size={26} /> : <Play size={26} className="ml-1" />}
            </span>
          </button>
        </div>
      </div>
      <p className="mt-3 text-center text-sm text-muted">
        {playing ? "Demo playing — drag candidates through stages" : "Watch the 30-second workflow demo"}
      </p>
    </div>
  );
}
