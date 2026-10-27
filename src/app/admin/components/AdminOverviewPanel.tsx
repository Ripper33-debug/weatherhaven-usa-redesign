"use client";

import {
  IconClick,
  IconKey,
  IconMail,
  IconTrendingUp,
} from "@tabler/icons-react";
import type { AdminAnalyticsPayload } from "@/lib/admin-analytics";
import {
  chartPointsToSparkline,
  countsByDay,
  seriesTrendPercent,
} from "@/lib/admin-dashboard-metrics";
import type { AccessRequestRow } from "@/lib/accessRequests";
import type { ContactLeadRow } from "@/lib/contactLeads";
import type { LeadQualitySummary } from "@/lib/lead-quality";
import { AdminOverviewCharts } from "./AdminOverviewCharts";
import { AdminRecentActivity } from "./AdminRecentActivity";
import { AdminStatCard } from "./AdminStatCard";
import { AdminSection } from "./admin-ui";

function FunnelBar({ stage, count, max }: { stage: string; count: number; max: number }) {
  const pct = max > 0 ? Math.round((count / max) * 100) : 0;
  return (
    <div>
      <div className="flex items-baseline justify-between gap-4 text-sm">
        <span className="text-zinc-500">{stage}</span>
        <span className="font-medium tabular-nums text-white">{count}</span>
      </div>
      <div className="mt-2 h-1.5 overflow-hidden rounded-full bg-white/[0.06]">
        <div
          className="h-full rounded-full bg-emerald-500 transition-all"
          style={{ width: `${Math.max(pct, count > 0 ? 4 : 0)}%`, opacity: 0.4 + (pct / 100) * 0.6 }}
        />
      </div>
    </div>
  );
}

export function AdminOverviewPanel({
  operatorEmail,
  leadQuality,
  analytics,
  accessRequests,
  contactLeads,
}: {
  operatorEmail?: string;
  leadQuality: LeadQualitySummary;
  analytics: AdminAnalyticsPayload;
  accessRequests: AccessRequestRow[];
  contactLeads: ContactLeadRow[];
}) {
  const displayName = operatorEmail?.split("@")[0] ?? "Operator";
  const approvalDenom = leadQuality.approvedAccess30d + leadQuality.deniedAccess30d;
  const approvalRate =
    approvalDenom > 0 ? `${Math.round((leadQuality.approvedAccess30d / approvalDenom) * 100)}%` : "—";

  const accessSpark = countsByDay(
    accessRequests.map((r) => r.submitted_at),
    14,
  );
  const inquirySpark = countsByDay(
    contactLeads.map((l) => l.submitted_at),
    14,
  );
  const intentSpark = chartPointsToSparkline(analytics.chartData.eventsByDay, 14);
  const viewsSpark = chartPointsToSparkline(analytics.chartData.pageViewsByDay, 14);

  const maxFunnel = Math.max(...leadQuality.funnel.map((f) => f.count), 1);

  return (
    <div className="px-4 py-6 sm:px-6 lg:px-8 lg:py-8">
      <div className="mb-8">
        <h1 className="text-2xl font-semibold tracking-tight text-white sm:text-3xl">Dashboard</h1>
        <p className="mt-1 text-sm text-zinc-500">
          Welcome back, <span className="capitalize text-zinc-300">{displayName}</span>. Here&apos;s
          what&apos;s happening with your program pipeline today.
        </p>
      </div>

      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-4">
        <AdminStatCard
          label="Pending access"
          value={leadQuality.pendingAccess}
          trend={seriesTrendPercent(accessSpark)}
          sparkline={accessSpark}
          icon={<IconKey className="h-5 w-5 text-emerald-400" stroke={1.75} />}
          iconBg="bg-emerald-500/15"
        />
        <AdminStatCard
          label="Open inquiries"
          value={leadQuality.openInquiries}
          trend={seriesTrendPercent(inquirySpark)}
          trendLabel={`${leadQuality.newInquiries} new`}
          sparkline={inquirySpark}
          icon={<IconMail className="h-5 w-5 text-blue-400" stroke={1.75} />}
          iconBg="bg-blue-500/15"
          accent="#3b82f6"
        />
        <AdminStatCard
          label="Lead intent (30d)"
          value={leadQuality.leadEvents30d}
          trend={seriesTrendPercent(intentSpark)}
          sparkline={intentSpark}
          icon={<IconTrendingUp className="h-5 w-5 text-violet-400" stroke={1.75} />}
          iconBg="bg-violet-500/15"
          accent="#a855f7"
        />
        <AdminStatCard
          label="Active today"
          value={analytics.summary.activeToday}
          trend={seriesTrendPercent(viewsSpark)}
          sparkline={viewsSpark}
          trendLabel={`${analytics.summary.totalUsers} accounts · ${approvalRate} approval`}
          icon={<IconClick className="h-5 w-5 text-amber-400" stroke={1.75} />}
          iconBg="bg-amber-500/15"
          accent="#f59e0b"
        />
      </div>

      <div className="mt-8">
        <AdminOverviewCharts chartData={analytics.chartData} leadQuality={leadQuality} />
      </div>

      <div className="mt-8 grid gap-6 lg:grid-cols-2">
        <AdminSection title="Lead funnel" description="Intent → inquiry → access decision">
          <div className="space-y-5 rounded-xl border border-white/[0.06] bg-[#111113] p-6">
            {leadQuality.funnel.map((step) => (
              <FunnelBar key={step.stage} stage={step.stage} count={step.count} max={maxFunnel} />
            ))}
          </div>
        </AdminSection>
        <AdminRecentActivity items={analytics.recentActivity} />
      </div>
    </div>
  );
}
