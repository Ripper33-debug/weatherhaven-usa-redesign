"use client";

import { useEffect, useRef } from "react";

const BG = "#080a0c";
const LINE = "rgba(100, 150, 255, 0.08)";
const LINE_INDEX = "rgba(100, 150, 255, 0.15)";
const GRID = "rgba(100, 150, 255, 0.04)";

/** Closed contour with terrain-like irregularity (Fourier wobble + ellipse + rotation). */
function strokeOrganicContour(
  ctx: CanvasRenderingContext2D,
  cx: number,
  cy: number,
  baseR: number,
  t: number,
  seed: number,
  rxScale: number,
  ryScale: number,
  rotation: number,
) {
  const steps = 128;
  const a1 = 0.1 * baseR;
  const a2 = 0.065 * baseR;
  const a3 = 0.042 * baseR;
  const a4 = 0.028 * baseR;
  const a5 = 0.018 * baseR;

  const cosR = Math.cos(rotation);
  const sinR = Math.sin(rotation);

  ctx.beginPath();
  for (let i = 0; i <= steps; i++) {
    const theta = (i / steps) * Math.PI * 2;
    const wobble =
      a1 * Math.sin(theta * 2 + seed * 1.1 + t * 0.22) +
      a2 * Math.cos(theta * 3 - seed * 1.8 + t * 0.31) +
      a3 * Math.sin(theta * 5 + seed * 2.6 - t * 0.27) +
      a4 * Math.cos(theta * 7 - seed * 0.9 + t * 0.19) +
      a5 * Math.sin(theta * 11 + seed * 4.2 + t * 0.14) +
      a3 * 0.55 * Math.cos(theta * 13 - seed * 3.1 - t * 0.24);

    const r = Math.max(baseR * 0.35, baseR + wobble);
    const lx = r * rxScale * Math.cos(theta);
    const ly = r * ryScale * Math.sin(theta);
    const x = cx + lx * cosR - ly * sinR;
    const y = cy + lx * sinR + ly * cosR;

    if (i === 0) ctx.moveTo(x, y);
    else ctx.lineTo(x, y);
  }
  ctx.closePath();
  ctx.stroke();
}

type ElevationPeak = {
  /** Normalized position 0–1 */
  nx: number;
  ny: number;
  /** Relative size of this hill's contour stack */
  scale: number;
  /** Rings on desktop (scaled down on mobile) */
  rings: number;
  seed: number;
  /** Horizontal stretch */
  rx: number;
  ry: number;
  /** Radians — tilts the hill axis */
  rotation: number;
  /** Per-peak drift of nested centers (terrain asymmetry) */
  centerDrift: number;
};

const PEAKS: ElevationPeak[] = [
  { nx: 0.36, ny: 0.4, scale: 1, rings: 7, seed: 1.15, rx: 1.18, ry: 0.88, rotation: 0.22, centerDrift: 0.028 },
  { nx: 0.68, ny: 0.34, scale: 0.88, rings: 6, seed: 4.6, rx: 0.94, ry: 1.12, rotation: -0.35, centerDrift: 0.032 },
  { nx: 0.58, ny: 0.68, scale: 0.72, rings: 5, seed: 2.85, rx: 1.08, ry: 0.78, rotation: 0.48, centerDrift: 0.024 },
  { nx: 0.22, ny: 0.62, scale: 0.58, rings: 4, seed: 6.2, rx: 1.22, ry: 0.92, rotation: -0.12, centerDrift: 0.02 },
  { nx: 0.82, ny: 0.58, scale: 0.48, rings: 3, seed: 8.4, rx: 0.86, ry: 1.06, rotation: 0.62, centerDrift: 0.018 },
];

export function HeroTopoCanvas({ showParticles = true }: { showParticles?: boolean }) {
  const containerRef = useRef<HTMLDivElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    const container = containerRef.current;
    if (!canvas || !container) return;

    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    let raf = 0;
    let t0 = performance.now();
    let globalRingIndex = 0;
    let mouseX = -9999;
    let mouseY = -9999;
    let mouseInHero = false;

    type Particle = { x: number; y: number; vx: number; vy: number; life?: number };
    const particleCount = 52;
    const particles: Particle[] = Array.from({ length: particleCount }, () => ({
      x: Math.random(),
      y: Math.random(),
      vx: (Math.random() - 0.5) * 0.2,
      vy: (Math.random() - 0.5) * 0.2,
    }));
    const bursts: Particle[] = [];

    const getReducedMotion = () => window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    const getMobile = () => window.matchMedia("(max-width: 767px)").matches;

    const onDocMove = (e: MouseEvent) => {
      const rect = container.getBoundingClientRect();
      mouseInHero =
        e.clientX >= rect.left &&
        e.clientX <= rect.right &&
        e.clientY >= rect.top &&
        e.clientY <= rect.bottom;
      if (mouseInHero) {
        mouseX = e.clientX - rect.left;
        mouseY = e.clientY - rect.top;
      }
    };

    const onDocClick = (e: MouseEvent) => {
      const rect = container.getBoundingClientRect();
      if (
        e.clientX < rect.left ||
        e.clientX > rect.right ||
        e.clientY < rect.top ||
        e.clientY > rect.bottom
      ) {
        return;
      }
      const cx = e.clientX - rect.left;
      const cy = e.clientY - rect.top;
      for (let i = 0; i < 8; i++) {
        const angle = (Math.PI * 2 * i) / 8;
        bursts.push({
          x: cx,
          y: cy,
          vx: Math.cos(angle) * 0.8,
          vy: Math.sin(angle) * 0.8,
          life: 1,
        });
      }
    };

    document.addEventListener("mousemove", onDocMove, { passive: true });
    document.addEventListener("click", onDocClick);

    const resize = () => {
      const dpr = Math.min(window.devicePixelRatio || 1, 2);
      const w = Math.max(1, container.clientWidth);
      const h = Math.max(1, container.clientHeight);
      canvas.width = Math.floor(w * dpr);
      canvas.height = Math.floor(h * dpr);
      canvas.style.width = `${w}px`;
      canvas.style.height = `${h}px`;
      ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
    };

    const markers = [
      { x: 0.22, y: 0.35, phase: 0.4, freq: 0.00085 },
      { x: 0.78, y: 0.28, phase: 2.2, freq: 0.00115 },
      { x: 0.52, y: 0.72, phase: 4.5, freq: 0.00098 },
    ];

    const draw = (now: number) => {
      const w = container.clientWidth;
      const h = container.clientHeight;
      if (w < 1 || h < 1) return;

      const t = (now - t0) * 0.001;
      const reduced = getReducedMotion();
      const mobile = getMobile();
      const baseScale = Math.min(w, h);

      ctx.fillStyle = BG;
      ctx.fillRect(0, 0, w, h);

      globalRingIndex = 0;

      const peaksToDraw = mobile ? PEAKS.slice(0, 2) : PEAKS;
      for (const peak of peaksToDraw) {
        const ringCount = mobile ? 3 : peak.rings;
        const peakCx = peak.nx * w;
        const peakCy = peak.ny * h;
        const hillScale = baseScale * 0.42 * peak.scale;
        const rMin = hillScale * 0.12;
        const rMax = hillScale * 0.95;

        for (let k = 0; k < ringCount; k++) {
          const u = ringCount > 1 ? k / (ringCount - 1) : 0.5;
          const breathe = reduced ? 0 : 0.03 * Math.sin(t * 0.26 + peak.seed + k * 0.61);
          const baseR = rMin + (rMax - rMin) * (u + breathe);

          // Nested contours drift up-slope — centers shift per ring like real topo
          const driftAngle = peak.rotation + peak.seed * 0.3;
          const driftMag = peak.centerDrift * baseScale * (0.35 + u * 0.65);
          const jitter = reduced
            ? 0
            : 0.012 * baseScale * Math.sin(t * 0.18 + peak.seed + k * 1.07);
          const cx =
            peakCx +
            Math.cos(driftAngle) * driftMag * u +
            Math.sin(peak.seed + k * 0.9) * jitter;
          const cy =
            peakCy +
            Math.sin(driftAngle) * driftMag * u +
            Math.cos(peak.seed * 1.3 + k * 0.7) * jitter;

          const indexContour = globalRingIndex % 5 === 0;
          ctx.strokeStyle = indexContour ? LINE_INDEX : LINE;
          ctx.lineWidth = indexContour ? 1.25 : 1;

          const phase = reduced ? 0 : t * 0.12;
          const ringSeed = peak.seed + k * 1.47 + globalRingIndex * 0.31;

          // Slight per-ring ellipse/rotation variation
          const rxVar = peak.rx * (1 + 0.04 * Math.sin(ringSeed * 2.1));
          const ryVar = peak.ry * (1 + 0.04 * Math.cos(ringSeed * 1.7));
          const rotVar = peak.rotation + (reduced ? 0 : 0.06 * Math.sin(t * 0.2 + ringSeed));

          strokeOrganicContour(ctx, cx, cy, baseR, phase, ringSeed, rxVar, ryVar, rotVar);
          globalRingIndex++;
        }
      }

      if (!mobile) {
        ctx.strokeStyle = GRID;
        ctx.lineWidth = 1;
        const len = Math.hypot(w, h) * 0.75;
        for (let d = 0; d < 4; d++) {
          ctx.save();
          ctx.translate(w * (0.18 + d * 0.22), h * (0.12 + d * 0.18));
          ctx.rotate(-0.55 + d * 0.28);
          ctx.beginPath();
          ctx.moveTo(-len, 0);
          ctx.lineTo(len, 0);
          ctx.stroke();
          ctx.restore();
        }
      }

      for (const m of markers) {
        const ox = m.x * w;
        const oy = m.y * h;
        const pulse = reduced ? 0.2 : 0.1 + 0.2 * (0.5 + 0.5 * Math.sin(now * m.freq + m.phase));
        ctx.strokeStyle = `rgba(100, 150, 255, ${pulse})`;
        ctx.lineWidth = 1;
        const L = 7;
        ctx.beginPath();
        ctx.moveTo(ox - L, oy);
        ctx.lineTo(ox + L, oy);
        ctx.moveTo(ox, oy - L);
        ctx.lineTo(ox, oy + L);
        ctx.stroke();
      }

      if (!reduced && showParticles) {
        const wrap = (p: Particle) => {
          if (p.x < 0) p.x = w;
          if (p.x > w) p.x = 0;
          if (p.y < 0) p.y = h;
          if (p.y > h) p.y = 0;
        };

        for (const p of particles) {
          p.x = (p.x <= 1 ? p.x * w : p.x) + p.vx * (0.1 + Math.random() * 0.2);
          p.y = (p.y <= 1 ? p.y * h : p.y) + p.vy * (0.1 + Math.random() * 0.2);
          wrap(p);

          if (mouseInHero) {
            const dx = mouseX - p.x;
            const dy = mouseY - p.y;
            const dist = Math.hypot(dx, dy);
            if (dist < 120 && dist > 0) {
              p.x += (dx / dist) * 0.15;
              p.y += (dy / dist) * 0.15;
            }
          }
        }

        for (let i = bursts.length - 1; i >= 0; i--) {
          const b = bursts[i]!;
          b.x += b.vx;
          b.y += b.vy;
          b.life = (b.life ?? 1) - 0.016;
          if ((b.life ?? 0) <= 0) bursts.splice(i, 1);
        }

        for (let i = 0; i < particles.length; i++) {
          for (let j = i + 1; j < particles.length; j++) {
            const a = particles[i]!;
            const b = particles[j]!;
            const d = Math.hypot(a.x - b.x, a.y - b.y);
            if (d < 80) {
              ctx.strokeStyle = "rgba(100, 150, 255, 0.08)";
              ctx.lineWidth = 1;
              ctx.beginPath();
              ctx.moveTo(a.x, a.y);
              ctx.lineTo(b.x, b.y);
              ctx.stroke();
            }
          }
        }

        ctx.fillStyle = "rgba(100, 150, 255, 0.35)";
        for (const p of particles) {
          ctx.beginPath();
          ctx.arc(p.x, p.y, 1, 0, Math.PI * 2);
          ctx.fill();
        }
        for (const b of bursts) {
          ctx.globalAlpha = b.life ?? 1;
          ctx.beginPath();
          ctx.arc(b.x, b.y, 1.5, 0, Math.PI * 2);
          ctx.fill();
          ctx.globalAlpha = 1;
        }
      }
    };

    let visible = document.visibilityState === "visible";

    const loop = (now: number) => {
      if (!visible) return;
      draw(now);
      if (!getReducedMotion()) raf = requestAnimationFrame(loop);
    };

    const startLoop = () => {
      cancelAnimationFrame(raf);
      if (!getReducedMotion() && visible) {
        raf = requestAnimationFrame(loop);
      } else {
        draw(performance.now());
      }
    };

    const onVis = () => {
      visible = document.visibilityState === "visible";
      if (visible && !getReducedMotion()) startLoop();
      else cancelAnimationFrame(raf);
    };

    const onMq = () => {
      resize();
      draw(performance.now());
      if (!getReducedMotion() && visible) startLoop();
    };

    resize();
    const ro = new ResizeObserver(() => {
      resize();
      draw(performance.now());
    });
    ro.observe(container);

    const mqRm = window.matchMedia("(prefers-reduced-motion: reduce)");
    const mqM = window.matchMedia("(max-width: 767px)");
    mqRm.addEventListener("change", onMq);
    mqM.addEventListener("change", onMq);
    document.addEventListener("visibilitychange", onVis);

    const boot = () => {
      resize();
      t0 = performance.now();
      draw(performance.now());
      startLoop();
    };
    const initTimer = window.setTimeout(boot, 0);

    return () => {
      document.removeEventListener("mousemove", onDocMove);
      document.removeEventListener("click", onDocClick);
      window.clearTimeout(initTimer);
      cancelAnimationFrame(raf);
      ro.disconnect();
      mqRm.removeEventListener("change", onMq);
      mqM.removeEventListener("change", onMq);
      document.removeEventListener("visibilitychange", onVis);
    };
  }, [showParticles]);

  return (
    <div ref={containerRef} className="pointer-events-none absolute inset-0 z-0 overflow-hidden">
      <canvas
        ref={canvasRef}
        className="absolute left-0 top-0 z-0 block h-full w-full"
        style={{ pointerEvents: "none" }}
        aria-hidden
      />
      {/* HERO VIDEO: drop /public/hero-video.mp4 here to replace canvas with real footage */}
      <div
        className="absolute inset-0 z-0"
        style={{
          background: "radial-gradient(ellipse 90% 80% at 60% 50%, transparent 30%, #080a0c 100%)",
        }}
        aria-hidden
      />
    </div>
  );
}
