"use client";

import { useMemo } from "react";
import { OdometerValue, useOdometerFlash } from "@/components/effects/OdometerValue";
import { useCountUpFromZero } from "@/hooks/useCountUpFromZero";
import { parseStatValue } from "@/lib/parse-stat-value";

export type MarketingStat = {
  value: string;
  label: string;
  detail?: string;
};

type Props = {
  stats: readonly MarketingStat[];
  layout?: "hero" | "grid";
};

export function MarketingStatsCountUp({ stats, layout = "hero" }: Props) {
  const parsed = useMemo(() => stats.map((s) => parseStatValue(s.value)), [stats]);
  const targets = useMemo(() => parsed.map((p) => p.target), [parsed]);
  const { rootRef, displayValues } = useCountUpFromZero(targets, 2000);
  const done = displayValues.every((v, i) => v >= targets[i]);
  const flash = useOdometerFlash(done);

  if (layout === "grid") {
    return (
      <div ref={rootRef} className="mt-16 md:mt-20">
        <div className="grid grid-cols-1 gap-px bg-white/[0.1] md:grid-cols-2 lg:grid-cols-4">
          {stats.map((stat, i) => (
            <div key={stat.label} className="bg-[#080a0c] px-6 py-10 md:px-8 lg:px-10 lg:py-12">
              <p className="wh-marketing-display text-[56px] leading-none text-white sm:text-[64px]">
                <OdometerValue value={displayValues[i] ?? 0} suffix={parsed[i]?.suffix ?? ""} flash={flash} />
              </p>
              <p className="mt-3 text-base font-medium text-white">{stat.label}</p>
              {stat.detail && <p className="mt-2 text-[13px] leading-relaxed text-[#8a9099]">{stat.detail}</p>}
            </div>
          ))}
        </div>
      </div>
    );
  }

  return (
    <div
      ref={rootRef}
      className="mt-10 flex flex-wrap items-start justify-center gap-x-8 gap-y-10 sm:mt-14 sm:gap-x-20 lg:gap-x-28"
    >
      {stats.map((stat, i) => (
        <div key={stat.label} className="min-w-[7.5rem] px-1 py-2 text-center">
          <p className="wh-marketing-display text-[44px] leading-none text-white sm:text-[88px]">
            <OdometerValue value={displayValues[i] ?? 0} suffix={parsed[i]?.suffix ?? ""} flash={flash} />
          </p>
          <p className="mt-3 text-xs tracking-wide text-[#8a9099] sm:mt-4 sm:text-sm">{stat.label}</p>
        </div>
      ))}
    </div>
  );
}
