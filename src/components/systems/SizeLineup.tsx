import Link from "next/link";
import { footprintFt2, formatFt2, ISO_20FT, SYSTEM_SIZES, type Dims, type SystemSize } from "@/lib/system-sizes";

const PAD = 8;

function Shape({ size, dims: d, cx, cy, ...rest }: { size: SystemSize; dims: Dims; cx: number; cy: number } & React.SVGProps<SVGPathElement>) {
  if (size.profile === "peaked") {
    const r = d.w / 2 / Math.cos(Math.PI / 8);
    const pts = Array.from({ length: 8 }, (_, i) => {
      const a = Math.PI / 8 + (i * Math.PI) / 4;
      return `${(cx + r * Math.cos(a)).toFixed(1)},${(cy + r * Math.sin(a)).toFixed(1)}`;
    }).join(" ");
    return <path d={`M${pts}Z`} {...rest} />;
  }
  return <path d={`M${cx - d.l / 2},${cy - d.w / 2}h${d.l}v${d.w}h${-d.l}z`} {...rest} />;
}

function Tile({ size }: { size: SystemSize }) {
  const D = size.deployed;
  const P = size.packed;
  const W = Math.max(D.l, P?.l ?? 0) + PAD * 2;
  const H = Math.max(D.w, P?.w ?? 0) + PAD * 2;
  const cx = W / 2;
  const cy = H / 2;
  const area = size.areaPublished ?? footprintFt2(D, size.profile);
  return (
    <li className="flex flex-col" style={{ width: `calc(max(${W} * var(--ppi), 7.5rem))` }}>
      <div className="flex min-h-[calc(110*var(--ppi))] items-end">
        <svg viewBox={`0 0 ${W} ${H}`} aria-hidden className="block h-auto" style={{ width: `calc(${W} * var(--ppi))` }}>
          <Shape size={size} dims={D} cx={cx} cy={cy} fill="rgb(241 133 34 / 0.2)" stroke="#f18522" className="v2-product-d-shape" strokeWidth="1.5" vectorEffect="non-scaling-stroke" />
          {P ? (
            <Shape
              size={{ ...size, profile: "box" }}
              dims={P}
              cx={cx}
              cy={cy}
              fill="rgb(10 15 23 / 0.55)"
              stroke="rgb(238 242 246 / 0.85)"
              className="v2-product-d-packed-cover"
              strokeWidth="1.25"
              strokeDasharray="4 3"
              vectorEffect="non-scaling-stroke"
            />
          ) : null}
        </svg>
      </div>
      <Link href={`/configurable-solutions/${size.slug}`} className="mt-3 text-[0.9375rem] font-semibold text-snow no-underline hover:text-signal">
        {size.name}
      </Link>
      <p className="v2-tnum text-[0.875rem] text-muted">
        {size.areaPublished ? `${formatFt2(area)} ft² floor` : `≈ ${formatFt2(area)} ft² footprint`}
      </p>
      <p className="v2-tnum text-[0.875rem] text-muted">{size.packedShort}</p>
    </li>
  );
}

/** Every system with published dimensions, drawn at one scale beside a 20-ft ISO container. */
export function SizeLineup() {
  const sizes = SYSTEM_SIZES.filter((s) => s.id !== "trecc-m").sort(
    (a, b) => footprintFt2(a.deployed, a.profile) - footprintFt2(b.deployed, b.profile),
  );
  const isoW = ISO_20FT.l + PAD * 2;
  const isoH = ISO_20FT.w + PAD * 2;
  return (
    <div className="v2-product-drawing [--ppi:0.36px] sm:[--ppi:0.46px] lg:[--ppi:0.56px]">
      <ul className="flex flex-wrap items-end gap-x-8 gap-y-10">
        <li className="flex flex-col" style={{ width: `calc(max(${isoW} * var(--ppi), 7.5rem))` }}>
          <div className="flex min-h-[calc(110*var(--ppi))] items-end">
            <svg viewBox={`0 0 ${isoW} ${isoH}`} aria-hidden className="block h-auto" style={{ width: `calc(${isoW} * var(--ppi))` }}>
              <rect x={PAD} y={PAD} width={ISO_20FT.l} height={ISO_20FT.w} fill="rgb(148 170 196 / 0.06)" stroke="rgb(148 170 196 / 0.6)" className="v2-product-d-ref" strokeWidth="1.25" vectorEffect="non-scaling-stroke" />
            </svg>
          </div>
          <p className="mt-3 text-[0.9375rem] font-semibold text-snow">20-ft ISO container</p>
          <p className="v2-tnum text-[0.875rem] text-muted">20 × 8 ft, for reference</p>
        </li>
        {sizes.map((s) => (
          <Tile key={s.id} size={s} />
        ))}
      </ul>
      <div className="mt-8 flex flex-wrap gap-x-6 gap-y-2 text-[0.875rem] text-muted">
        <span className="inline-flex items-center gap-2">
          <span aria-hidden className="h-3 w-5 border border-signal bg-signal/20" />
          Deployed footprint
        </span>
        <span className="inline-flex items-center gap-2">
          <span aria-hidden className="h-3 w-5 border border-dashed border-snow/80" />
          Packed footprint
        </span>
        <span>All drawn at the same scale from published outside dimensions.</span>
      </div>
    </div>
  );
}
