"use client";

import { MarketingStatsCountUp, type MarketingStat } from "@/components/marketing/MarketingStatsCountUp";

export type SofCredStat = MarketingStat & { id: string };

export function SofCountUp({ stats }: { stats: readonly SofCredStat[] }) {
  return <MarketingStatsCountUp stats={stats} layout="grid" />;
}
