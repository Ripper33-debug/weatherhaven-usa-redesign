"use client";

import type { LeadPipelineStatus } from "@/lib/lead-pipeline-status";
import { leadPipelineStatusLabel } from "@/lib/lead-pipeline-status";

const STATUS_STYLES: Record<LeadPipelineStatus, string> = {
  new: "border-emerald-500/40 bg-emerald-500/10 text-emerald-400",
  contacted: "border-blue-500/40 bg-blue-500/10 text-blue-300",
  qualified: "border-violet-500/40 bg-violet-500/10 text-violet-300",
  approved: "border-green-500/40 bg-green-500/10 text-green-300",
  closed: "border-zinc-500/40 bg-zinc-500/10 text-zinc-400",
  lost: "border-rose-500/40 bg-rose-500/10 text-rose-300",
};

export function LeadPipelineStatusBadge({ status }: { status: LeadPipelineStatus }) {
  return (
    <span
      className={`inline-block rounded-full border px-2.5 py-0.5 text-[11px] font-medium ${STATUS_STYLES[status]}`}
    >
      {leadPipelineStatusLabel(status)}
    </span>
  );
}
