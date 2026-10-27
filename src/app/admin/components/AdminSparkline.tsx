"use client";

type Props = {
  data: number[];
  color?: string;
  className?: string;
};

export function AdminSparkline({ data, color = "#10b981", className }: Props) {
  if (data.length < 2) {
    return <svg viewBox="0 0 80 32" className={className ?? "h-8 w-20"} aria-hidden />;
  }

  const w = 80;
  const h = 32;
  const pad = 2;
  const max = Math.max(...data, 1);
  const min = Math.min(...data, 0);
  const range = max - min || 1;

  const points = data.map((v, i) => {
    const x = pad + (i / (data.length - 1)) * (w - pad * 2);
    const y = pad + (1 - (v - min) / range) * (h - pad * 2);
    return `${x},${y}`;
  });

  const area = `${pad},${h - pad} ${points.join(" ")} ${w - pad},${h - pad}`;

  return (
    <svg viewBox={`0 0 ${w} ${h}`} className={className ?? "h-8 w-20"} aria-hidden>
      <polygon points={area} fill={`${color}22`} />
      <polyline
        points={points.join(" ")}
        fill="none"
        stroke={color}
        strokeWidth="1.5"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  );
}
