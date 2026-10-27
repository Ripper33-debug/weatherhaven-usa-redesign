"use client";

import { useEffect, useMemo, useState } from "react";
import type { CampZoneLayout } from "@/lib/campPlanner";

const COLS = 4;
const CELL = 72;
const GAP = 8;
const PAD = 16;
const REVEAL_MS = 420;

const ZONE_FILL: Record<string, string> = {
  entry: "rgba(77,159,255,0.12)",
  command: "rgba(77,159,255,0.22)",
  medical: "rgba(16,185,129,0.18)",
  maintenance: "rgba(245,158,11,0.18)",
  accommodation: "rgba(148,163,184,0.15)",
  sustainment: "rgba(168,85,247,0.15)",
  logistics: "rgba(77,159,255,0.1)",
  power: "rgba(255,255,255,0.06)",
};

function zoneSort(a: CampZoneLayout, b: CampZoneLayout): number {
  return a.row - b.row || a.col - b.col || a.label.localeCompare(b.label);
}

export function CampLayoutDiagram({
  zones,
  animate = true,
}: {
  zones: CampZoneLayout[];
  animate?: boolean;
}) {
  const ordered = useMemo(() => [...zones].sort(zoneSort), [zones]);
  const [revealIndex, setRevealIndex] = useState(0);

  useEffect(() => {
    if (!animate) return;

    let count = 0;
    const id = window.setInterval(() => {
      count += 1;
      setRevealIndex(count);
      if (count >= ordered.length) window.clearInterval(id);
    }, REVEAL_MS);

    return () => window.clearInterval(id);
  }, [animate, ordered]);

  const visibleCount = animate ? revealIndex : ordered.length;

  const maxRow = Math.max(0, ...zones.map((z) => z.row + z.rowSpan));
  const height = PAD * 2 + (maxRow + 1) * CELL + maxRow * GAP;
  const width = PAD * 2 + COLS * CELL + (COLS - 1) * GAP;

  return (
    <svg
      viewBox={`0 0 ${width} ${height}`}
      className="h-auto w-full max-w-full"
      role="img"
      aria-label="Indicative camp layout by zone"
    >
      <rect x={0} y={0} width={width} height={height} fill="#0d0f12" rx={4} />
      {ordered.map((zone, index) => {
        const visible = index < visibleCount;
        const x = PAD + zone.col * (CELL + GAP);
        const y = PAD + zone.row * (CELL + GAP);
        const w = zone.colSpan * CELL + (zone.colSpan - 1) * GAP;
        const h = zone.rowSpan * CELL + (zone.rowSpan - 1) * GAP;
        return (
          <g
            key={zone.id}
            style={{
              opacity: visible ? 1 : 0,
              transform: visible ? "scale(1)" : "scale(0.92)",
              transformOrigin: `${x + w / 2}px ${y + h / 2}px`,
              transition: "opacity 0.45s ease, transform 0.45s cubic-bezier(0.22, 1, 0.36, 1)",
            }}
          >
            <rect
              x={x}
              y={y}
              width={w}
              height={h}
              fill={ZONE_FILL[zone.id] ?? "rgba(255,255,255,0.08)"}
              stroke="rgba(77,159,255,0.35)"
              strokeWidth={1}
            />
            <text
              x={x + 8}
              y={y + 18}
              fill="#e2e8f0"
              fontSize={10}
              fontFamily="ui-monospace, monospace"
            >
              {zone.label}
            </text>
          </g>
        );
      })}
    </svg>
  );
}
