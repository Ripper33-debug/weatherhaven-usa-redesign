"use client";

import { useEffect, useRef, useState } from "react";
import type { AdminChartData, ChartDayPoint, TopPageBar } from "@/lib/admin-analytics";

type LineChartProps = {
  label: string;
  data: ChartDayPoint[];
  lineColor: string;
  fillColor: string;
};

function LineChart({ label, data, lineColor, fillColor }: LineChartProps) {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const wrapRef = useRef<HTMLDivElement>(null);
  const [tooltip, setTooltip] = useState<{ x: number; y: number; text: string } | null>(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    const wrap = wrapRef.current;
    if (!canvas || !wrap || data.length === 0) return;

    const dpr = window.devicePixelRatio || 1;
    const width = wrap.clientWidth;
    const height = 220;
    canvas.width = width * dpr;
    canvas.height = height * dpr;
    canvas.style.width = `${width}px`;
    canvas.style.height = `${height}px`;

    const ctx = canvas.getContext("2d");
    if (!ctx) return;
    ctx.scale(dpr, dpr);

    const pad = { top: 16, right: 12, bottom: 28, left: 36 };
    const chartW = width - pad.left - pad.right;
    const chartH = height - pad.top - pad.bottom;
    const max = Math.max(...data.map((d) => d.count), 1);

    ctx.fillStyle = "#0d0f12";
    ctx.fillRect(0, 0, width, height);

    ctx.strokeStyle = "rgba(255,255,255,0.04)";
    ctx.lineWidth = 1;
    for (let i = 0; i <= 4; i++) {
      const y = pad.top + (chartH / 4) * i;
      ctx.beginPath();
      ctx.moveTo(pad.left, y);
      ctx.lineTo(width - pad.right, y);
      ctx.stroke();
    }

    const points = data.map((d, i) => ({
      x: pad.left + (i / Math.max(data.length - 1, 1)) * chartW,
      y: pad.top + chartH - (d.count / max) * chartH,
      d,
    }));

    ctx.beginPath();
    ctx.moveTo(points[0]!.x, pad.top + chartH);
    for (const p of points) ctx.lineTo(p.x, p.y);
    ctx.lineTo(points[points.length - 1]!.x, pad.top + chartH);
    ctx.closePath();
    ctx.fillStyle = fillColor;
    ctx.fill();

    ctx.beginPath();
    ctx.moveTo(points[0]!.x, points[0]!.y);
    for (let i = 1; i < points.length; i++) ctx.lineTo(points[i]!.x, points[i]!.y);
    ctx.strokeStyle = lineColor;
    ctx.lineWidth = 2;
    ctx.stroke();

    for (const p of points) {
      ctx.beginPath();
      ctx.arc(p.x, p.y, 4, 0, Math.PI * 2);
      ctx.fillStyle = lineColor;
      ctx.fill();
    }

    ctx.fillStyle = "#8a9099";
    ctx.font = "11px Inter, sans-serif";
    ctx.textAlign = "center";
    const labelEvery = Math.ceil(data.length / 6);
    points.forEach((p, i) => {
      if (i % labelEvery === 0 || i === points.length - 1) {
        ctx.fillText(p.d.label, p.x, height - 8);
      }
    });

    const onMove = (e: MouseEvent) => {
      const rect = canvas.getBoundingClientRect();
      const mx = e.clientX - rect.left;
      let nearest = points[0]!;
      let minDist = Infinity;
      for (const p of points) {
        const dist = Math.abs(p.x - mx);
        if (dist < minDist) {
          minDist = dist;
          nearest = p;
        }
      }
      if (minDist < 24) {
        setTooltip({
          x: nearest.x,
          y: nearest.y - 12,
          text: `${nearest.d.label}: ${nearest.d.count}`,
        });
      } else {
        setTooltip(null);
      }
    };

    const onLeave = () => setTooltip(null);
    canvas.addEventListener("mousemove", onMove);
    canvas.addEventListener("mouseleave", onLeave);
    return () => {
      canvas.removeEventListener("mousemove", onMove);
      canvas.removeEventListener("mouseleave", onLeave);
    };
  }, [data, fillColor, lineColor]);

  return (
    <div className="wh-marketing-panel p-5 sm:p-6">
      <p className="text-[11px] font-medium tracking-[0.12em] text-[#8a9099] uppercase">{label}</p>
      <div ref={wrapRef} className="relative mt-4 w-full">
        <canvas ref={canvasRef} className="block w-full" />
        {tooltip && (
          <div
            className="pointer-events-none absolute z-10 border border-white/10 bg-[#080a0c] px-2 py-1 font-mono text-[10px] text-white"
            style={{ left: tooltip.x, top: tooltip.y, transform: "translate(-50%, -100%)" }}
          >
            {tooltip.text}
          </div>
        )}
      </div>
    </div>
  );
}

function TopPagesChart({ data }: { data: TopPageBar[] }) {
  const max = Math.max(...data.map((d) => d.count), 1);

  return (
    <div className="wh-marketing-panel p-5 sm:p-6">
      <p className="text-[11px] font-medium tracking-[0.12em] text-[#8a9099] uppercase">Top pages</p>
      <div className="mt-6 space-y-4">
        {data.length === 0 && <p className="text-sm text-[#8a9099]">No page view data yet.</p>}
        {data.map((row) => (
          <div key={row.page} className="grid grid-cols-[minmax(0,1fr)_auto] items-center gap-4">
            <div>
              <p className="truncate text-sm text-white">{row.label}</p>
              <p className="mt-1 text-xs text-[#8a9099]">
                {row.avgSeconds > 0 ? `Avg ${row.avgSeconds}s on page` : "No dwell time yet"}
              </p>
              <div className="mt-2 h-2 bg-[#080a0c]">
                <div
                  className="h-full bg-[#4d9fff]"
                  style={{ width: `${(row.count / max) * 100}%`, opacity: 0.35 + (row.count / max) * 0.65 }}
                />
              </div>
            </div>
            <p className="tabular-nums text-sm text-[#8a9099]">{row.count}</p>
          </div>
        ))}
      </div>
    </div>
  );
}

export function AdminCharts({ chartData }: { chartData: AdminChartData }) {
  return (
    <div className="mt-8 space-y-6">
      <div className="grid grid-cols-1 gap-6 lg:grid-cols-2">
        <LineChart
          label="Page views — last 30 days"
          data={chartData.pageViewsByDay}
          lineColor="#4d9fff"
          fillColor="rgba(77,159,255,0.08)"
        />
        <LineChart
          label="Active users — last 30 days"
          data={chartData.activeUsersByDay}
          lineColor="rgba(255,255,255,0.6)"
          fillColor="rgba(255,255,255,0.04)"
        />
        <LineChart
          label="Sessions — last 30 days"
          data={chartData.sessionsByDay}
          lineColor="#7dd3fc"
          fillColor="rgba(125,211,252,0.06)"
        />
        <LineChart
          label="Clicks — last 30 days"
          data={chartData.clicksByDay}
          lineColor="#fbbf24"
          fillColor="rgba(251,191,36,0.06)"
        />
      </div>
      <div className="grid grid-cols-1 gap-6 lg:grid-cols-2">
        <LineChart
          label="Tracked events — last 30 days"
          data={chartData.eventsByDay}
          lineColor="#a78bfa"
          fillColor="rgba(167,139,250,0.06)"
        />
        <TopPagesChart data={chartData.topPages} />
      </div>
    </div>
  );
}
