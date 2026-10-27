"use client";

import type { ReactNode } from "react";
import { AdminSparkline } from "./AdminSparkline";

type Props = {
  label: string;
  value: string | number;
  trend?: number | null;
  trendLabel?: string;
  sparkline?: number[];
  icon?: ReactNode;
  iconBg?: string;
  accent?: string;
};

export function AdminStatCard({
  label,
  value,
  trend,
  trendLabel = "vs prior period",
  sparkline = [],
  icon,
  iconBg = "bg-emerald-500/15",
  accent = "#10b981",
}: Props) {
  const trendUp = trend !== null && trend !== undefined && trend >= 0;
  const trendText =
    trend === null || trend === undefined ? null : `${trendUp ? "+" : ""}${trend}%`;

  return (
    <div className="admin-stat-card rounded-xl border border-white/[0.06] bg-[#111113] p-5">
      <div className="flex items-start justify-between gap-3">
        <div className="min-w-0 flex-1">
          <p className="text-xs font-medium text-zinc-500">{label}</p>
          <p className="mt-2 text-2xl font-semibold tabular-nums tracking-tight text-white sm:text-3xl">
            {value}
          </p>
          {trendText ? (
            <p className="mt-2 flex flex-wrap items-center gap-1.5 text-xs">
              <span className={trendUp ? "font-medium text-emerald-400" : "font-medium text-rose-400"}>
                {trendText}
              </span>
              <span className="text-zinc-500">{trendLabel}</span>
            </p>
          ) : null}
        </div>
        <div className="flex shrink-0 flex-col items-end gap-3">
          {icon ? (
            <div className={`flex h-10 w-10 items-center justify-center rounded-lg ${iconBg}`}>{icon}</div>
          ) : null}
          {sparkline.length > 1 ? (
            <AdminSparkline data={sparkline} color={accent} className="h-8 w-[72px]" />
          ) : null}
        </div>
      </div>
    </div>
  );
}
