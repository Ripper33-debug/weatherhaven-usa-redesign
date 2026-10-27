"use client";

import { AdminKpiCard, AdminSection } from "./admin-ui";
import type { LeadQualitySummary } from "@/lib/lead-quality";

function FunnelBar({ stage, count, max }: { stage: string; count: number; max: number }) {
  const pct = max > 0 ? Math.round((count / max) * 100) : 0;
  return (
    <div>
      <div className="flex items-baseline justify-between gap-4 text-sm">
        <span className="text-[#8a9099]">{stage}</span>
        <span className="tabular-nums font-medium text-white">{count}</span>
      </div>
      <div className="mt-2 h-1.5 overflow-hidden rounded-full bg-white/[0.06]" role="presentation">
        <div
          className="h-full rounded-full bg-gradient-to-r from-[#4d9fff] to-[#4d9fff]/40 transition-all"
          style={{ width: `${Math.max(pct, count > 0 ? 4 : 0)}%` }}
        />
      </div>
    </div>
  );
}

export function AdminLeadQualityPanel({ summary }: { summary: LeadQualitySummary }) {
  const maxFunnel = Math.max(...summary.funnel.map((f) => f.count), 1);
  const approvalDenom = summary.approvedAccess30d + summary.deniedAccess30d;
  const approvalRate =
    approvalDenom > 0 ? `${Math.round((summary.approvedAccess30d / approvalDenom) * 100)}%` : "—";

  return (
    <div className="mt-8">
      <div className="grid grid-cols-2 gap-4 lg:grid-cols-4">
        <AdminKpiCard
          label="Lead intent (30d)"
          value={summary.leadEvents30d}
          hint="CTAs, forms, high-intent actions"
          accent={summary.leadEvents30d > 0}
        />
        <AdminKpiCard
          label="Open inquiries"
          value={summary.openInquiries}
          hint={`${summary.newInquiries} new`}
          accent={summary.newInquiries > 0}
        />
        <AdminKpiCard
          label="Access pending"
          value={summary.pendingAccess}
          hint={`${summary.pendingSofAccess} SOF`}
          accent={summary.pendingAccess > 0}
        />
        <AdminKpiCard
          label="Approval rate (30d)"
          value={approvalRate}
          hint={`${summary.approvedAccess30d} approved · ${summary.deniedAccess30d} denied`}
        />
      </div>

      <div className="mt-8 grid gap-8 lg:grid-cols-2">
        <AdminSection title="Lead funnel" description="Intent → inquiry → access decision (last 30 days where noted).">
          <div className="wh-marketing-panel space-y-5 p-6">
            {summary.funnel.map((step) => (
              <FunnelBar key={step.stage} stage={step.stage} count={step.count} max={maxFunnel} />
            ))}
          </div>
        </AdminSection>

        <AdminSection title="Top intent signals" description="Most frequent lead events (30d).">
          {summary.topIntents.length === 0 ? (
            <p className="text-sm text-[#8a9099]">
              No lead events yet. Run the Supabase migration for <code className="text-white">lead_events</code>, then
              submit forms on the marketing site.
            </p>
          ) : (
            <ul className="wh-marketing-panel divide-y divide-white/[0.06]">
              {summary.topIntents.map((item) => (
                <li key={item.label} className="flex items-center justify-between gap-4 px-5 py-3.5 text-sm">
                  <span className="text-[#8a9099]">{item.label}</span>
                  <span className="tabular-nums font-medium text-white">{item.count}</span>
                </li>
              ))}
            </ul>
          )}
        </AdminSection>
      </div>
    </div>
  );
}
