"use client";

import { useEffect, useId, useRef, useState } from "react";
import { useClientMediaQuery } from "@/hooks/useClientMediaQuery";
import {
  feetInches,
  footprintFt2,
  formatFt2,
  ISO_20FT,
  PERSON_HEIGHT,
  type Dims,
  type SystemSize,
} from "@/lib/system-sizes";

type State = "packed" | "deployed";

const EASE = "cubic-bezier(0.65, 0, 0.25, 1)";

/** Footprint shape in plan view, centred on (cx, cy). */
function PlanShape({ size, dims, cx, cy, ...rest }: { size: SystemSize; dims: Dims; cx: number; cy: number } & React.SVGProps<SVGPathElement>) {
  if (size.profile === "peaked") {
    const r = dims.w / 2 / Math.cos(Math.PI / 8);
    const pts = Array.from({ length: 8 }, (_, i) => {
      const a = Math.PI / 8 + (i * Math.PI) / 4;
      return `${(cx + r * Math.cos(a)).toFixed(2)},${(cy + r * Math.sin(a)).toFixed(2)}`;
    }).join(" ");
    return <path d={`M${pts}Z`} {...rest} />;
  }
  const x = cx - dims.l / 2;
  const y = cy - dims.w / 2;
  const rad = size.profile === "rounded" ? Math.min(dims.l, dims.w) * 0.08 : 0;
  return (
    <path
      d={`M${x + rad},${y}h${dims.l - 2 * rad}q${rad},0 ${rad},${rad}v${dims.w - 2 * rad}q0,${rad} ${-rad},${rad}h${-(dims.l - 2 * rad)}q${-rad},0 ${-rad},${-rad}v${-(dims.w - 2 * rad)}q0,${-rad} ${rad},${-rad}z`}
      {...rest}
    />
  );
}

/** Side silhouette standing on the ground line at y = ground, centred on cx. */
function SidePath(size: SystemSize, dims: Dims, cx: number, ground: number, packed: boolean): string {
  const h = dims.h ?? 0;
  const x = cx - dims.l / 2;
  if (packed || size.profile === "box") return `M${x},${ground}v${-h}h${dims.l}v${h}z`;
  if (size.profile === "peaked") {
    const eaves = size.eaves ?? h * 0.75;
    return `M${x},${ground}v${-eaves}L${cx},${ground - h}L${x + dims.l},${ground - eaves}v${eaves}z`;
  }
  const r = Math.min(h * 0.55, dims.l * 0.3);
  return `M${x},${ground}v${-(h - r)}q0,${-r} ${r},${-r}h${dims.l - 2 * r}q${r},0 ${r},${r}v${h - r}z`;
}

/** A standing figure, 72 in tall, feet at (x, ground). */
function Person({ x, ground }: { x: number; ground: number }) {
  const s = PERSON_HEIGHT / 72;
  return (
    <g transform={`translate(${x} ${ground}) scale(${s})`} className="fill-snow/75">
      <circle cx="0" cy="-65" r="5.2" />
      <path d="M-7.5,-58 h15 q3,0 3.4,3 l2.6,22 q0.4,3 -2.4,3.3 l-2.6,0.3 l-1,27.4 h-5.3 l-0.7,-26 h-1 l-0.7,26 h-5.3 l-1,-27.4 l-2.6,-0.3 q-2.8,-0.3 -2.4,-3.3 l2.6,-22 q0.4,-3 3.4,-3z" />
    </g>
  );
}

/** Grid lines every `step` inches across the scene, skipping multiples of `skip`. */
function gridPath(w: number, h: number, step: number, skip?: number): string {
  let d = "";
  for (let x = step; x < w; x += step) if (!skip || x % skip) d += `M${x} 0V${h}`;
  for (let y = step; y < h; y += step) if (!skip || y % skip) d += `M0 ${y}H${w}`;
  return d;
}

const ratioLabel = (r: number) => `${r >= 10 ? Math.round(r) : r.toFixed(1)}×`;

function dimsLabel(d: Dims | undefined): string {
  if (!d) return "Not published";
  return [d.l, d.w, d.h].filter((v): v is number => typeof v === "number").map((v) => feetInches(v)).join(" × ");
}

/**
 * One system drawn to scale, packed and deployed, beside a 20-ft ISO container and a person.
 * Animates from packed to deployed the first time it scrolls into view.
 */
export function SizeCompare({ sizes, heading }: { sizes: SystemSize[]; heading?: string }) {
  const id = useId();
  const reduced = useClientMediaQuery("(prefers-reduced-motion: reduce)");
  const [variant, setVariant] = useState(0);
  const size = sizes[Math.min(variant, sizes.length - 1)];
  const canToggle = !!size.packed;
  const [state, setState] = useState<State>(canToggle ? "packed" : "deployed");
  const touched = useRef(false);
  const ref = useRef<HTMLDivElement>(null);

  // Unfold once on first view, unless the visitor has already used the toggle.
  useEffect(() => {
    const el = ref.current;
    if (!el || !canToggle) return;
    let timer = 0;
    const io = new IntersectionObserver(
      ([entry]) => {
        if (!entry.isIntersecting) return;
        io.disconnect();
        timer = window.setTimeout(() => {
          if (!touched.current) setState("deployed");
        }, 700);
      },
      { threshold: 0.5 },
    );
    io.observe(el);
    return () => {
      io.disconnect();
      window.clearTimeout(timer);
    };
  }, [canToggle, variant]);

  const choose = (s: State) => {
    touched.current = true;
    setState(s);
  };

  const D = size.deployed;
  const P = size.packed;

  // ---- plan view geometry (inches) ----
  const pad = 30;
  const boxL = Math.max(D.l, P?.l ?? 0);
  const boxW = Math.max(D.w, P?.w ?? 0, ISO_20FT.w);
  const cx = pad + boxL / 2;
  const cy = pad + boxW / 2;
  const isoX = pad + boxL + 60;
  const sceneW = isoX + ISO_20FT.l + pad;
  const sceneH = boxW + pad * 2;
  const sx = P ? P.l / D.l : 1;
  const sy = P ? P.w / D.w : 1;
  const morph = state === "packed" && P ? `translate(${cx}px, ${cy}px) scale(${sx}, ${sy}) translate(${-cx}px, ${-cy}px)` : "none";
  const transition = reduced ? "none" : `transform 1100ms ${EASE}, opacity 600ms ease`;

  // ---- side view geometry ----
  const hasSide = typeof D.h === "number" && (!P || typeof P.h === "number");
  const sideL = Math.max(D.l, P?.l ?? 0);
  const sideH = Math.max(D.h ?? 0, P?.h ?? 0, PERSON_HEIGHT);
  const sPad = 24;
  const ground = sPad + sideH;
  const sideCx = sPad + sideL / 2;
  const personX = sPad + sideL + 40;
  const sideW = personX + 20 + sPad;

  const area = size.areaPublished ?? footprintFt2(D, size.profile);
  const areaLabel = size.areaPublished ? `${formatFt2(area)} ft²` : `≈ ${formatFt2(area)} ft² outside`;

  return (
    <div ref={ref} className="grid gap-6 @4xl:grid-cols-[minmax(0,1.5fr)_minmax(0,1fr)] @4xl:grid-rows-[auto_1fr] @4xl:gap-x-12 @4xl:gap-y-0">
      <div className="flex flex-col @4xl:col-start-2 @4xl:row-start-1">
        {heading ? <h3 className="v2-h3 text-snow">{heading}</h3> : null}
        {sizes.length > 1 ? (
          <div role="group" aria-label="Variant" className="flex flex-wrap gap-2">
            {sizes.map((s, i) => (
              <button
                key={s.id}
                type="button"
                aria-pressed={i === variant}
                onClick={() => {
                  setVariant(i);
                  touched.current = false;
                  setState(s.packed ? "packed" : "deployed");
                }}
                className={`h-10 px-4 text-[0.9rem] font-medium transition-colors ${
                  i === variant ? "bg-snow text-ink" : "text-snow shadow-[inset_0_0_0_1px_rgb(148_170_196/0.32)] hover:bg-white/[0.05]"
                }`}
              >
                {s.name}
              </button>
            ))}
          </div>
        ) : null}
        {canToggle ? (
          <div role="group" aria-label="Show" className={`inline-flex self-start border border-line-strong p-1 ${sizes.length > 1 ? "mt-3" : ""}`}>
            {(["packed", "deployed"] as const).map((s) => (
              <button
                key={s}
                type="button"
                aria-pressed={state === s}
                onClick={() => choose(s)}
                className={`h-9 px-4 text-[0.9rem] font-medium capitalize transition-colors ${
                  state === s ? "bg-signal text-ink" : "text-snow/80 hover:text-snow"
                }`}
              >
                {s}
              </button>
            ))}
          </div>
        ) : null}
      </div>

      <div className="space-y-4 @4xl:col-start-1 @4xl:row-span-2 @4xl:row-start-1">
        <figure className="v2-plate overflow-hidden p-3 sm:p-5">
          <svg
            viewBox={`0 0 ${sceneW} ${sceneH}`}
            className="block h-auto w-full"
            role="img"
            aria-labelledby={`${id}-plan`}
          >
            <title id={`${id}-plan`}>
              {`Floor plan to scale: ${size.name} ${state === "packed" && P ? `packed, ${dimsLabel(P)}` : `deployed, ${dimsLabel(D)}`}, beside a 20-ft ISO container.`}
            </title>
            {/* Grid as plain lines (SVG patterns render unreliably in Safari): 1 ft, heavier every 5 ft */}
            <path d={gridPath(sceneW, sceneH, 12, 60)} fill="none" stroke="rgb(148 170 196 / 0.09)" strokeWidth="1" vectorEffect="non-scaling-stroke" />
            <path d={gridPath(sceneW, sceneH, 60)} fill="none" stroke="rgb(148 170 196 / 0.2)" strokeWidth="1" vectorEffect="non-scaling-stroke" />
            {/* Deployed outline stays visible as the target */}
            <PlanShape
              size={size}
              dims={D}
              cx={cx}
              cy={cy}
              fill="none"
              stroke="rgb(241 133 34 / 0.55)"
              strokeWidth="1.25"
              strokeDasharray="5 4"
              vectorEffect="non-scaling-stroke"
            />
            {/* The footprint itself, scaled between packed and deployed */}
            <g style={{ transform: morph, transition }}>
              <PlanShape
                size={size}
                dims={D}
                cx={cx}
                cy={cy}
                fill={state === "packed" && P ? "rgb(238 242 246 / 0.16)" : "rgb(241 133 34 / 0.22)"}
                stroke={state === "packed" && P ? "rgb(238 242 246 / 0.85)" : "#f18522"}
                strokeWidth="1.75"
                vectorEffect="non-scaling-stroke"
                style={{ transition: reduced ? "none" : "fill 600ms ease, stroke 600ms ease" }}
              />
            </g>
            {/* 20-ft ISO container for reference */}
            <rect
              x={isoX}
              y={cy - ISO_20FT.w / 2}
              width={ISO_20FT.l}
              height={ISO_20FT.w}
              fill="rgb(148 170 196 / 0.06)"
              stroke="rgb(148 170 196 / 0.6)"
              strokeWidth="1.25"
              vectorEffect="non-scaling-stroke"
            />
            {Array.from({ length: 9 }, (_, i) => (
              <line
                key={i}
                x1={isoX + 24 * (i + 1)}
                x2={isoX + 24 * (i + 1)}
                y1={cy - ISO_20FT.w / 2 + 6}
                y2={cy + ISO_20FT.w / 2 - 6}
                stroke="rgb(148 170 196 / 0.22)"
                strokeWidth="1"
                vectorEffect="non-scaling-stroke"
              />
            ))}
          </svg>
          <figcaption className="mt-3 flex flex-wrap gap-x-5 gap-y-1.5 px-1 text-[0.85rem] text-muted">
            <span className="inline-flex items-center gap-2">
              <span aria-hidden className="h-2.5 w-4 border border-signal bg-signal/25" />
              {size.name}, {state === "packed" && P ? "packed" : "deployed"}
            </span>
            {P ? (
              <span className="inline-flex items-center gap-2">
                <span aria-hidden className="h-2.5 w-4 border border-dashed border-signal/70" />
                Deployed outline
              </span>
            ) : null}
            <span className="inline-flex items-center gap-2">
              <span aria-hidden className="h-2.5 w-4 border border-[rgb(148_170_196/0.6)]" />
              20-ft ISO container
            </span>
            <span>Grid: 1 ft, heavier lines every 5 ft</span>
          </figcaption>
        </figure>

        {hasSide ? (
          <figure className="v2-plate overflow-hidden p-3 sm:p-5">
            <svg viewBox={`0 0 ${sideW} ${ground + 10}`} className="mx-auto block h-auto max-h-[220px] w-full" role="img" aria-labelledby={`${id}-side`}>
              <title id={`${id}-side`}>{`Side view to scale: ${size.name} ${state === "packed" && P ? "packed" : "deployed"} next to a 6-ft person.`}</title>
              <line x1="0" x2={sideW} y1={ground} y2={ground} stroke="rgb(148 170 196 / 0.45)" strokeWidth="1.25" vectorEffect="non-scaling-stroke" />
              {P ? (
                <path
                  d={SidePath(size, P, sideCx, ground, true)}
                  fill="rgb(238 242 246 / 0.16)"
                  stroke="rgb(238 242 246 / 0.85)"
                  strokeWidth="1.5"
                  vectorEffect="non-scaling-stroke"
                  style={{ opacity: state === "packed" ? 1 : 0, transition }}
                />
              ) : null}
              <path
                d={SidePath(size, D, sideCx, ground, false)}
                fill="rgb(241 133 34 / 0.14)"
                stroke="#f18522"
                strokeWidth="1.5"
                vectorEffect="non-scaling-stroke"
                style={{
                  opacity: state === "deployed" || !P ? 1 : 0.0,
                  transform:
                    state === "packed" && P
                      ? `translate(${sideCx}px, ${ground}px) scale(${P.l / D.l}, ${(P.h ?? 1) / (D.h ?? 1)}) translate(${-sideCx}px, ${-ground}px)`
                      : "none",
                  transition,
                }}
              />
              <Person x={personX} ground={ground} />
            </svg>
            <figcaption className="mt-3 px-1 text-[0.85rem] text-muted">Side view, with a 6-ft person for scale</figcaption>
          </figure>
        ) : null}
      </div>

      <div className="flex flex-col @4xl:col-start-2 @4xl:row-start-2">
        <dl className="border-t border-line @4xl:mt-6">
          <div className="grid grid-cols-[6.5rem_1fr] gap-3 border-b border-line py-3.5">
            <dt className="v2-tech pt-1 text-muted">Packed</dt>
            <dd className="v2-tnum text-[0.95rem] text-snow">{size.packedNote}</dd>
          </div>
          <div className="grid grid-cols-[6.5rem_1fr] gap-3 border-b border-line py-3.5">
            <dt className="v2-tech pt-1 text-muted">Deployed</dt>
            <dd className="v2-tnum text-[0.95rem] text-snow">{size.deployedNote}</dd>
          </div>
          <div className="grid grid-cols-[6.5rem_1fr] gap-3 border-b border-line py-3.5">
            <dt className="v2-tech pt-1 text-muted">{size.areaPublished ? "Floor" : "Footprint"}</dt>
            <dd className="v2-tnum text-[0.95rem] text-snow">
              {areaLabel}
              {P ? (
                <span className="block text-muted">
                  Footprint grows about {ratioLabel(footprintFt2(D, size.profile) / footprintFt2(P))}
                </span>
              ) : null}
            </dd>
          </div>
        </dl>
        <p className="mt-4 text-[0.85rem] leading-relaxed text-muted">
          Drawn to scale from published outside dimensions{size.areaPublished ? "" : "; footprint calculated from them"}.
        </p>
      </div>
    </div>
  );
}
