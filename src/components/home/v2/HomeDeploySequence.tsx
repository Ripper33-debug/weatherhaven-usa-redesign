"use client";

import { useEffect, useRef, useState } from "react";
import Link from "next/link";
import { useClientMediaQuery } from "@/hooks/useClientMediaQuery";

/**
 * Scroll-driven technical drawing of a MECC going from stowed to deployed.
 * Figures are the published MECC (8 ft model) numbers: 20 × 8 × 8 ft packed,
 * 243 in deployed width, 420 ft² floor, two people in 10–15 minutes.
 */

const STEPS = [
  {
    title: "Ship",
    body: "It travels as a standard 20-ft ISO container. ISO and CSC certified, it stacks nine high and rides any truck, ship or rail car built for containers.",
  },
  {
    title: "Place",
    body: "Forklift, crane, helicopter or a palletized load system sets it down where the mission needs it.",
  },
  {
    title: "Expand",
    body: "Two people fold out the insulated wings in 10 to 15 minutes, with no special skills.",
  },
  {
    title: "Operate",
    body: "420 ft² of insulated floor for a command post, clinic or workshop. Strike it the same way when the mission moves.",
  },
] as const;

const clamp = (v: number, lo = 0, hi = 1) => Math.min(hi, Math.max(lo, v));
const seg = (p: number, a: number, b: number) => clamp((p - a) / (b - a));
const ease = (t: number) => (t < 0.5 ? 4 * t * t * t : 1 - (-2 * t + 2) ** 3 / 2);
const lerp = (a: number, b: number, t: number) => a + (b - a) * t;

/** 1 ft = 14 drawing units */
const FT = 14;
const BOX_W = 8 * FT; // 112
const BOX_H = 8 * FT; // 112
const WING = ((243 / 12 - 8) / 2) * FT; // ≈ 85.75
const WALL_H = 7 * FT;
/** Plan view uses its own, smaller scale so the deployed footprint fits. */
const PFT = 9;
const P_LEN = 20 * PFT; // 180
const P_W = 8 * PFT; // 72
const P_WING = ((243 / 12 - 8) / 2) * PFT; // ≈ 55

function Corner({ x, y }: { x: number; y: number }) {
  return <rect x={x - 3} y={y - 3} width={6} height={6} fill="var(--v2-snow)" />;
}

function Drawing({ p, compact = false }: { p: number; compact?: boolean }) {
  const ship = ease(seg(p, 0, 0.2));
  const place = ease(seg(p, 0.2, 0.38));
  const expand = seg(p, 0.4, 0.8);
  const floorT = ease(seg(expand, 0, 0.55));
  const wallT = ease(seg(expand, 0.45, 1));
  const operate = ease(seg(p, 0.82, 0.97));

  const slide = lerp(-300, 0, ship);
  const lift = lerp(-44, 0, place);
  const craneOpacity = p < 0.4 ? 1 - seg(p, 0.34, 0.4) : 0;

  // ---- End elevation (top view block) ----
  const ground = 250;
  const cx = 400;
  const left = cx - BOX_W / 2;
  const right = cx + BOX_W / 2;
  const top = ground - BOX_H;
  const theta = lerp(Math.PI / 2, Math.PI, floorT); // floor panel hinge rotation
  const floorLx = left + WING * Math.cos(theta);
  const floorLy = ground - WING * Math.sin(theta);
  const floorRx = right - WING * Math.cos(theta);
  const wallTop = ground - WALL_H * wallT;
  const extent = WING * floorT;
  const widthIn = Math.round(lerp(96, 243, floorT));
  const areaFt = Math.round(lerp(160, 420, (floorT + wallT) / 2));

  // ---- Plan view ----
  const pcy = 440;
  const pl = cx - P_LEN / 2;
  const pr = cx + P_LEN / 2;
  const pt = pcy - P_W / 2;
  const pb = pcy + P_W / 2;
  const wingDepth = P_WING * floorT;

  return (
    <svg
      viewBox={compact ? "205 40 450 520" : "40 40 720 520"}
      className="h-auto w-full"
      role="img"
      aria-labelledby="deploy-drawing-title"
    >
      <title id="deploy-drawing-title">
        Technical drawing of a MECC expandable container unfolding from 96 inches to 243 inches wide, growing from
        160 to 420 square feet of floor.
      </title>
      <defs>
        <pattern id="hatch" width="8" height="8" patternUnits="userSpaceOnUse" patternTransform="rotate(45)">
          <line x1="0" y1="0" x2="0" y2="8" stroke="rgb(241 133 34 / 0.35)" strokeWidth="1" />
        </pattern>
        <marker id="tick" viewBox="0 0 10 10" refX="5" refY="5" markerWidth="8" markerHeight="8" orient="auto">
          <path d="M5 0v10" stroke="var(--v2-signal)" strokeWidth="1.5" />
        </marker>
      </defs>

      {/* drawing frame labels */}
      <text x={compact ? 215 : 60} y="70" fill="var(--v2-muted)" fontSize="13" fontWeight="500">
        End elevation
      </text>
      <text x={compact ? 215 : 60} y="350" fill="var(--v2-muted)" fontSize="13" fontWeight="500">
        Plan view
      </text>

      {/* ground */}
      <line x1={compact ? 205 : 80} y1={ground} x2={compact ? 655 : 720} y2={ground} stroke="var(--v2-line-strong)" strokeWidth="1" />
      {Array.from({ length: 33 }).map((_, i) => (
        <line
          key={i}
          x1={84 + i * 20}
          y1={ground + 1}
          x2={76 + i * 20}
          y2={ground + 9}
          stroke="var(--v2-line)"
          strokeWidth="1"
        />
      ))}

      {/* crane line during ship / place */}
      <g opacity={craneOpacity} transform={`translate(${slide} 0)`}>
        <line x1={cx} y1={56} x2={cx} y2={top + lift} stroke="var(--v2-muted)" strokeDasharray="3 4" />
        <line x1={cx} y1={top + lift} x2={left + 6} y2={top + lift + 2} stroke="var(--v2-muted)" strokeWidth="0.8" />
        <line x1={cx} y1={top + lift} x2={right - 6} y2={top + lift + 2} stroke="var(--v2-muted)" strokeWidth="0.8" />
      </g>

      {/* deployed wing volume (fabric) */}
      <g opacity={wallT}>
        <polygon
          points={`${left},${top} ${left - WING},${wallTop} ${left - WING},${ground} ${left},${ground}`}
          fill="rgb(238 242 246 / 0.06)"
        />
        <polygon
          points={`${right},${top} ${right + WING},${wallTop} ${right + WING},${ground} ${right},${ground}`}
          fill="rgb(238 242 246 / 0.06)"
        />
      </g>

      <g transform={`translate(${slide} ${lift})`}>
        {/* floor panels rotating down */}
        <line x1={left} y1={ground} x2={floorLx} y2={floorLy} className="v2-draw-line" strokeWidth={2} />
        <line x1={right} y1={ground} x2={floorRx} y2={floorLy} className="v2-draw-line" strokeWidth={2} />
        {/* container body */}
        <rect x={left} y={top} width={BOX_W} height={BOX_H} fill="var(--v2-ink)" className="v2-draw-line" />
        <line x1={left + 14} y1={top + 14} x2={left + 14} y2={ground - 14} stroke="var(--v2-line-strong)" />
        <line x1={right - 14} y1={top + 14} x2={right - 14} y2={ground - 14} stroke="var(--v2-line-strong)" />
        <Corner x={left} y={top} />
        <Corner x={right} y={top} />
        <Corner x={left} y={ground} />
        <Corner x={right} y={ground} />
      </g>

      {/* outer walls and roof lines */}
      <g opacity={wallT > 0 ? 1 : 0}>
        <line x1={left - WING} y1={ground} x2={left - WING} y2={wallTop} className="v2-draw-line" />
        <line x1={right + WING} y1={ground} x2={right + WING} y2={wallTop} className="v2-draw-line" />
        <line x1={left} y1={top} x2={left - WING} y2={wallTop} className="v2-draw-line" opacity={wallT} />
        <line x1={right} y1={top} x2={right + WING} y2={wallTop} className="v2-draw-line" opacity={wallT} />
      </g>

      {/* width dimension */}
      <g opacity={ship}>
        <line
          x1={left - extent}
          y1={ground + 32}
          x2={right + extent}
          y2={ground + 32}
          className="v2-draw-dim"
          markerStart="url(#tick)"
          markerEnd="url(#tick)"
          transform={`translate(${slide} 0)`}
        />
        <rect x={cx - 38 + slide} y={ground + 22} width={76} height={20} fill="var(--v2-ink)" />
        <text
          x={cx + slide}
          y={ground + 37}
          textAnchor="middle"
          fill="var(--v2-signal)"
          fontSize="15"
          fontWeight="600"
          style={{ fontVariantNumeric: "tabular-nums" }}
        >
          {widthIn} in
        </text>
      </g>

      {/* height dimension */}
      <g opacity={place}>
        <line x1={right + WING + 28} y1={top} x2={right + WING + 28} y2={ground} className="v2-draw-dim" />
        <line x1={right + WING + 22} y1={top} x2={right + WING + 34} y2={top} className="v2-draw-dim" />
        <line x1={right + WING + 22} y1={ground} x2={right + WING + 34} y2={ground} className="v2-draw-dim" />
        <text x={right + WING + 40} y={(top + ground) / 2 + 5} fill="var(--v2-signal)" fontSize="14" fontWeight="600">
          8 ft
        </text>
      </g>

      {/* ---- plan view ---- */}
      <g transform={`translate(${slide} 0)`}>
        {/* wings */}
        <rect x={pl} y={pt - wingDepth} width={P_LEN} height={wingDepth} fill="url(#hatch)" />
        <rect x={pl} y={pb} width={P_LEN} height={wingDepth} fill="url(#hatch)" />
        <rect
          x={pl}
          y={pt - wingDepth}
          width={P_LEN}
          height={P_W + wingDepth * 2}
          fill="none"
          stroke="var(--v2-snow)"
          strokeWidth="1.25"
          opacity={floorT}
        />
        <rect x={pl} y={pt} width={P_LEN} height={P_W} fill="var(--v2-ink)" className="v2-draw-line" />
        <Corner x={pl} y={pt} />
        <Corner x={pr} y={pt} />
        <Corner x={pl} y={pb} />
        <Corner x={pr} y={pb} />

        {/* interior layout once operating */}
        <g opacity={operate}>
          {[0, 1, 2, 3, 4].map((i) => (
            <g key={i}>
              <rect x={pl + 14 + i * 33} y={pt - wingDepth + 8} width={22} height={10} fill="none" stroke="var(--v2-muted)" />
              <rect x={pl + 14 + i * 33} y={pb + wingDepth - 18} width={22} height={10} fill="none" stroke="var(--v2-muted)" />
            </g>
          ))}
          <rect x={cx - 46} y={pcy - 11} width={92} height={22} fill="none" stroke="var(--v2-muted)" />
          <text x={pr + 16} y={pcy + 4} fill="var(--v2-muted)" fontSize="12">
            Example layout
          </text>
        </g>

        {/* length dim */}
        <line
          x1={pl}
          y1={pb + wingDepth + 36}
          x2={pr}
          y2={pb + wingDepth + 36}
          className="v2-draw-dim"
          markerStart="url(#tick)"
          markerEnd="url(#tick)"
          opacity={ship}
        />
        <rect x={cx - 26} y={pb + wingDepth + 26} width={52} height={20} fill="var(--v2-ink)" opacity={ship} />
        <text
          x={cx}
          y={pb + wingDepth + 41}
          textAnchor="middle"
          fill="var(--v2-signal)"
          fontSize="14"
          fontWeight="600"
          opacity={ship}
        >
          20 ft
        </text>
      </g>

      {/* floor area readout */}
      <g opacity={ship}>
        <text x={compact ? 645 : 720} y={compact ? 74 : 362} textAnchor="end" fill="var(--v2-muted)" fontSize="13">
          Floor area
        </text>
        <text
          x={compact ? 645 : 720}
          y={compact ? 108 : 398}
          textAnchor="end"
          fill="var(--v2-snow)"
          fontSize="34"
          fontWeight="640"
          style={{ fontVariantNumeric: "tabular-nums", fontFamily: "var(--font-archivo-figures), var(--font-archivo), sans-serif" }}
        >
          {areaFt} ft²
        </text>
      </g>
    </svg>
  );
}

export function HomeDeploySequence() {
  const sectionRef = useRef<HTMLElement>(null);
  const [scrollP, setP] = useState(0);
  const reduced = useClientMediaQuery("(prefers-reduced-motion: reduce)");
  const compact = useClientMediaQuery("(max-width: 1023px)");
  // Reduced motion shows the finished drawing, no scroll scrub.
  const p = reduced ? 1 : scrollP;

  useEffect(() => {
    if (reduced) return;
    let raf = 0;
    const update = () => {
      raf = 0;
      const el = sectionRef.current;
      if (!el) return;
      const rect = el.getBoundingClientRect();
      const travel = rect.height - window.innerHeight;
      const next = travel > 0 ? clamp(-rect.top / travel) : 1;
      setP((prev) => (Math.abs(prev - next) > 0.001 ? next : prev));
    };
    const onScroll = () => {
      if (!raf) raf = requestAnimationFrame(update);
    };
    update();
    window.addEventListener("scroll", onScroll, { passive: true });
    window.addEventListener("resize", onScroll);
    return () => {
      window.removeEventListener("scroll", onScroll);
      window.removeEventListener("resize", onScroll);
      if (raf) cancelAnimationFrame(raf);
    };
  }, [reduced]);

  const active = p < 0.2 ? 0 : p < 0.4 ? 1 : p < 0.8 ? 2 : 3;

  return (
    <section
      ref={sectionRef}
      aria-labelledby="deploy-heading"
      className={`relative border-t border-line bg-ink ${reduced ? "" : "h-[300svh]"}`}
    >
      <div className={`${reduced ? "py-20" : "sticky top-0 flex h-[100svh] items-center"} overflow-hidden`}>
        <div className="v2-wrap grid w-full items-center gap-6 pt-16 lg:grid-cols-[minmax(0,0.8fr)_minmax(0,1.2fr)] lg:gap-16 lg:pt-20">
          <div>
            <h2 id="deploy-heading" className="v2-h2 max-w-[16ch] text-snow">
              How a MECC goes from 160 ft² to 420 ft²
            </h2>
            <p className="v2-body mt-4 hidden lg:block">
              Every MECC leaves the factory as a 20-ft shipping container and arrives as a building.
            </p>
            <ol className="mt-8 hidden space-y-1 lg:block">
              {STEPS.map((step, i) => {
                const on = reduced || i === active;
                return (
                  <li
                    key={step.title}
                    className={`grid grid-cols-[2.25rem_1fr] border-l-2 py-3 pl-4 transition-colors duration-300 ${
                      on ? "border-signal" : "border-line"
                    }`}
                  >
                    <span className={`v2-figure text-[1.05rem] ${on ? "text-signal" : "text-muted"}`}>{i + 1}</span>
                    <div>
                      <p className={`text-[1.1rem] font-semibold ${on ? "text-snow" : "text-muted"}`}>{step.title}</p>
                      <p
                        className={`overflow-hidden text-[0.95rem] leading-relaxed text-muted transition-[max-height,opacity] duration-500 ${
                          on ? "mt-1 max-h-32 opacity-100" : "max-h-0 opacity-0"
                        }`}
                      >
                        {step.body}
                      </p>
                    </div>
                  </li>
                );
              })}
            </ol>
            <Link href="/configurable-solutions/mecc" className="v2-link mt-6 hidden text-[0.95rem] lg:inline-block">
              MECC specifications
            </Link>
          </div>

          <div className="relative">
            <Drawing p={p} compact={compact} />
            {/* phones and tablets: active step under the drawing */}
            <div className="mt-2 min-h-[7.5rem] lg:hidden" aria-live="polite">
              <p className="text-[1.05rem] font-semibold text-snow">
                <span className="v2-figure mr-2 text-signal">{active + 1}</span>
                {STEPS[active].title}
              </p>
              <p className="mt-1 text-[0.95rem] leading-relaxed text-muted">{STEPS[active].body}</p>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
