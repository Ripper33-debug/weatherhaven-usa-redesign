"use client";

import { useMemo } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import type { UnifiedLead } from "@/lib/lead-management";
import { filterUnifiedLeads } from "@/lib/lead-management";
import { AdminEmpty, AdminTableShell } from "./admin-ui";
import { LeadPipelineStatusBadge } from "./LeadPipelineStatusBadge";

function formatDate(iso: string | null) {
  if (!iso) return "—";
  try {
    return new Date(iso).toLocaleString();
  } catch {
    return iso;
  }
}

function isOverdue(iso: string | null) {
  if (!iso) return false;
  return new Date(iso).getTime() < Date.now();
}

export function LeadPipelineTable({ leads }: { leads: UnifiedLead[] }) {
  const router = useRouter();
  const searchParams = useSearchParams();
  const query = searchParams.get("q") ?? "";

  const filtered = useMemo(() => filterUnifiedLeads(leads, query), [leads, query]);

  function openLead(email: string) {
    const params = new URLSearchParams(searchParams.toString());
    params.set("tab", "pipeline");
    params.set("lead", email);
    router.replace(`/admin?${params.toString()}`, { scroll: false });
  }

  if (leads.length === 0) {
    return <AdminEmpty message="No leads yet. Inquiries and access requests will appear here automatically." />;
  }

  if (filtered.length === 0) {
    return <AdminEmpty message={`No leads match “${query}”.`} />;
  }

  return (
    <AdminTableShell>
      <table className="w-full min-w-[960px] border-collapse text-left text-sm">
        <thead>
          <tr className="border-b border-white/[0.08] bg-[#09090b]/80 text-[11px] tracking-wide text-zinc-500 uppercase">
            <th className="px-5 py-3.5 font-medium">Contact</th>
            <th className="px-5 py-3.5 font-medium">Organization</th>
            <th className="px-5 py-3.5 font-medium">Pipeline</th>
            <th className="px-5 py-3.5 font-medium">Activity</th>
            <th className="px-5 py-3.5 font-medium">Follow-up</th>
            <th className="px-5 py-3.5 font-medium">Signals</th>
            <th className="px-5 py-3.5 font-medium text-right">Open</th>
          </tr>
        </thead>
        <tbody>
          {filtered.map((lead) => (
            <tr
              key={lead.email}
              className="cursor-pointer border-b border-white/[0.06] transition-colors hover:bg-white/[0.02]"
              onClick={() => openLead(lead.email)}
            >
              <td className="px-5 py-4">
                <p className="font-medium text-white">{lead.fullName ?? "—"}</p>
                <p className="mt-0.5 text-xs text-zinc-500">{lead.email}</p>
              </td>
              <td className="px-5 py-4 text-zinc-400">{lead.organization ?? "—"}</td>
              <td className="px-5 py-4">
                <LeadPipelineStatusBadge status={lead.pipelineStatus} />
              </td>
              <td className="px-5 py-4 text-zinc-500">{formatDate(lead.lastActivityAt)}</td>
              <td className="px-5 py-4">
                {lead.nextFollowUpAt ? (
                  <span className={isOverdue(lead.nextFollowUpAt) ? "text-amber-400" : "text-zinc-400"}>
                    {formatDate(lead.nextFollowUpAt)}
                  </span>
                ) : (
                  <span className="text-zinc-600">—</span>
                )}
              </td>
              <td className="px-5 py-4">
                <div className="flex flex-wrap gap-1.5">
                  {lead.hasOpenInquiry ? (
                    <span className="rounded bg-blue-500/10 px-2 py-0.5 text-[10px] text-blue-300">
                      Inquiry
                    </span>
                  ) : null}
                  {lead.hasPendingAccess ? (
                    <span className="rounded bg-amber-500/10 px-2 py-0.5 text-[10px] text-amber-300">
                      Access pending
                    </span>
                  ) : null}
                  {lead.inquiryCount > 0 ? (
                    <span className="rounded bg-white/5 px-2 py-0.5 text-[10px] text-zinc-500">
                      {lead.inquiryCount} inq
                    </span>
                  ) : null}
                  {lead.accessCount > 0 ? (
                    <span className="rounded bg-white/5 px-2 py-0.5 text-[10px] text-zinc-500">
                      {lead.accessCount} access
                    </span>
                  ) : null}
                </div>
              </td>
              <td className="px-5 py-4 text-right">
                <span className="text-xs font-medium text-emerald-400">View →</span>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </AdminTableShell>
  );
}
