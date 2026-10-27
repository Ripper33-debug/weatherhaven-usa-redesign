"use client";

import { useMemo, useState } from "react";
import type { AdminChartData, ChartDayPoint } from "@/lib/admin-analytics";
import type { LeadQualitySummary } from "@/lib/lead-quality";

type MetricKey = "intent" | "views" | "sessions";

const METRICS: { key: MetricKey; label: string; color: string; fill: string }[] = [
  { key: "intent", label: "Lead intent", color: "#10b981", fill: "rgba(16,185,129,0.15)" },
  { key: "views", label: "Page views", color: "#3b82f6", fill: "rgba(59,130,246,0.12)" },
  { key: "sessions", label: "Sessions", color: "#a855f7", fill: "rgba(168,85,247,0.12)" },
];

function AreaChart({ data, color, fill }: { data: ChartDayPoint[]; color: string; fill: string }) {
  const { linePath, areaPath } = useMemo(() => {
    if (data.length < 2) return { linePath: "", areaPath: "" };
    const w = 600;
    const h = 220;
    const pad = { t: 16, r: 12, b: 32, l: 40 };
    const chartW = w - pad.l - pad.r;
    const chartH = h - pad.t - pad.b;
    const max = Math.max(...data.map((d) => d.count), 1);

    const pts = data.map((d, i) => ({
      x: pad.l + (i / (data.length - 1)) * chartW,
      y: pad.t + chartH - (d.count / max) * chartH,
    }));

    const line = pts.map((p, i) => `${i === 0 ? "M" : "L"} ${p.x} ${p.y}`).join(" ");
    const area = `${line} L ${pts[pts.length - 1]!.x} ${pad.t + chartH} L ${pts[0]!.x} ${pad.t + chartH} Z`;

    return { linePath: line, areaPath: area };
  }, [data]);

  const labels = data.filter((_, i) => i % Math.ceil(data.length / 6) === 0 || i === data.length - 1);

  return (
    <div className="relative w-full">
      <svg viewBox="0 0 600 220" className="w-full" preserveAspectRatio="none" aria-hidden>
        {[0, 1, 2, 3, 4].map((i) => (
          <line
            key={i}
            x1={40}
            x2={588}
            y1={16 + ((220 - 48) / 4) * i}
            y2={16 + ((220 - 48) / 4) * i}
            stroke="rgba(255,255,255,0.04)"
            strokeWidth={1}
          />
        ))}
        {areaPath ? <path d={areaPath} fill={fill} /> : null}
        {linePath ? (
          <path d={linePath} fill="none" stroke={color} strokeWidth={2.5} strokeLinecap="round" />
        ) : null}
      </svg>
      <div className="mt-1 flex justify-between px-10 text-[10px] text-zinc-500">
        {labels.map((d) => (
          <span key={d.date}>{d.label}</span>
        ))}
      </div>
    </div>
  );
}

function DonutChart({
  segments,
}: {
  segments: { label: string; value: number; color: string }[];
}) {
  const total = segments.reduce((a, s) => a + s.value, 0) || 1;
  const r = 42;
  const c = 2 * Math.PI * r;

  const rings = segments.reduce<
    { label: string; value: number; color: string; dash: number; offset: number }[]
  >((acc, seg) => {
    const pct = seg.value / total;
    const dash = pct * c;
    const offset = acc.length > 0 ? acc[acc.length - 1]!.offset + acc[acc.length - 1]!.dash : 0;
    acc.push({ ...seg, dash, offset });
    return acc;
  }, []);

  return (
    <div className="flex flex-col items-center gap-6 sm:flex-row sm:items-center sm:justify-between">
      <div className="relative h-36 w-36 shrink-0">
        <svg viewBox="0 0 100 100" className="h-full w-full -rotate-90">
          <circle cx="50" cy="50" r={r} fill="none" stroke="rgba(255,255,255,0.06)" strokeWidth="12" />
          {rings.map((seg) => (
            <circle
              key={seg.label}
              cx="50"
              cy="50"
              r={r}
              fill="none"
              stroke={seg.color}
              strokeWidth="12"
              strokeDasharray={`${seg.dash} ${c - seg.dash}`}
              strokeDashoffset={-seg.offset}
              strokeLinecap="butt"
            />
          ))}
        </svg>
        <div className="absolute inset-0 flex flex-col items-center justify-center">
          <span className="text-xl font-semibold tabular-nums text-white">{total}</span>
          <span className="text-[10px] text-zinc-500">Total</span>
        </div>
      </div>
      <ul className="min-w-0 flex-1 space-y-2.5">
        {segments.map((seg) => (
          <li key={seg.label} className="flex items-center justify-between gap-3 text-sm">
            <span className="flex min-w-0 items-center gap-2 text-zinc-400">
              <span className="h-2.5 w-2.5 shrink-0 rounded-full" style={{ backgroundColor: seg.color }} />
              <span className="truncate">{seg.label}</span>
            </span>
            <span className="shrink-0 tabular-nums text-white">
              {Math.round((seg.value / total) * 100)}%
            </span>
          </li>
        ))}
      </ul>
    </div>
  );
}

export function AdminOverviewCharts({
  chartData,
  leadQuality,
}: {
  chartData: AdminChartData;
  leadQuality: LeadQualitySummary;
}) {
  const [metric, setMetric] = useState<MetricKey>("intent");

  const series = useMemo(() => {
    if (metric === "views") return chartData.pageViewsByDay;
    if (metric === "sessions") return chartData.sessionsByDay;
    return chartData.eventsByDay;
  }, [metric, chartData]);

  const activeMetric = METRICS.find((m) => m.key === metric)!;

  const donutSegments = useMemo(() => {
    const intents = leadQuality.topIntents.slice(0, 4);
    const colors = ["#10b981", "#3b82f6", "#a855f7", "#f59e0b"];
    if (intents.length === 0) {
      return [
        { label: "Access requests", value: leadQuality.pendingAccess, color: colors[0]! },
        { label: "Inquiries", value: leadQuality.openInquiries, color: colors[1]! },
        { label: "Lead events", value: leadQuality.leadEvents30d, color: colors[2]! },
        { label: "Approved (30d)", value: leadQuality.approvedAccess30d, color: colors[3]! },
      ].filter((s) => s.value > 0);
    }
    return intents.map((item, i) => ({
      label: item.label.split(":")[0]?.trim() ?? item.label,
      value: item.count,
      color: colors[i % colors.length]!,
    }));
  }, [leadQuality]);

  return (
    <div className="grid gap-6 lg:grid-cols-3">
      <div className="rounded-xl border border-white/[0.06] bg-[#111113] p-5 lg:col-span-2">
        <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <h3 className="text-sm font-medium text-white">Overview</h3>
            <p className="mt-0.5 text-xs text-zinc-500">Last 30 days performance</p>
          </div>
          <div className="flex flex-wrap gap-1 rounded-lg bg-white/[0.04] p-1">
            {METRICS.map((m) => (
              <button
                key={m.key}
                type="button"
                onClick={() => setMetric(m.key)}
                className={`rounded-md px-3 py-1.5 text-xs font-medium transition ${
                  metric === m.key
                    ? "bg-emerald-500 text-[#09090b]"
                    : "text-zinc-400 hover:text-white"
                }`}
              >
                {m.label}
              </button>
            ))}
          </div>
        </div>
        <div className="mt-6">
          {series.length > 0 ? (
            <AreaChart data={series} color={activeMetric.color} fill={activeMetric.fill} />
          ) : (
            <p className="py-16 text-center text-sm text-zinc-500">No chart data yet.</p>
          )}
        </div>
      </div>

      <div className="rounded-xl border border-white/[0.06] bg-[#111113] p-5">
        <h3 className="text-sm font-medium text-white">Lead signals</h3>
        <p className="mt-0.5 text-xs text-zinc-500">Intent breakdown (30d)</p>
        <div className="mt-6">
          {donutSegments.length > 0 ? (
            <DonutChart segments={donutSegments} />
          ) : (
            <p className="py-12 text-center text-sm text-zinc-500">No lead signals yet.</p>
          )}
        </div>
      </div>
    </div>
  );
}
