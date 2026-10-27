"use client";

import { useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { IconArrowLeft } from "@tabler/icons-react";
import {
  adminAddLeadNote,
  adminApproveAccessRequest,
  adminDenyAccessRequest,
  adminUpdateContactLeadStatus,
  adminUpdateLeadPipeline,
} from "../actions";
import type { AccessRequestRow } from "@/lib/accessRequests";
import type { ContactLeadRow } from "@/lib/contactLeads";
import {
  buildLeadTimeline,
  type LeadTimelineEntry,
  type UnifiedLead,
} from "@/lib/lead-management";
import {
  LEAD_PIPELINE_STATUSES,
  leadPipelineStatusLabel,
  type LeadPipelineStatus,
} from "@/lib/lead-pipeline-status";
import type { LeadNoteRow } from "@/lib/leadProfiles";
import type { AdminEventRow } from "@/lib/admin-event-labels";
import { isSofAccessRequest } from "@/lib/sof-auth";
import {
  AdminBanner,
  AdminSection,
  adminBtnDanger,
  adminBtnGhost,
  adminBtnPrimary,
  adminBtnSuccess,
  adminInputClass,
} from "./admin-ui";
import { LeadPipelineStatusBadge } from "./LeadPipelineStatusBadge";

function formatWhen(iso: string) {
  try {
    return new Date(iso).toLocaleString();
  } catch {
    return iso;
  }
}

function TimelineIcon({ kind }: { kind: LeadTimelineEntry["kind"] }) {
  const colors: Record<LeadTimelineEntry["kind"], string> = {
    inquiry: "bg-blue-500",
    access_request: "bg-amber-500",
    note: "bg-emerald-500",
    admin_action: "bg-violet-500",
    profile_update: "bg-zinc-500",
  };
  return <span className={`mt-1.5 h-2 w-2 shrink-0 rounded-full ${colors[kind]}`} />;
}

export function LeadDetailView({
  lead,
  contactLeads,
  accessRequests,
  notes,
  adminEvents,
}: {
  lead: UnifiedLead;
  contactLeads: ContactLeadRow[];
  accessRequests: AccessRequestRow[];
  notes: LeadNoteRow[];
  adminEvents: AdminEventRow[];
}) {
  const router = useRouter();
  const searchParams = useSearchParams();
  const [pipelineStatus, setPipelineStatus] = useState<LeadPipelineStatus>(lead.pipelineStatus);
  const [followUp, setFollowUp] = useState(
    lead.nextFollowUpAt ? lead.nextFollowUpAt.slice(0, 16) : "",
  );
  const [noteBody, setNoteBody] = useState("");
  const [actionPending, setActionPending] = useState(false);
  const [banner, setBanner] = useState<{ type: "success" | "error"; text: string } | null>(null);

  const timeline = buildLeadTimeline({
    email: lead.email,
    contactLeads,
    accessRequests,
    notes,
    adminEvents,
  });

  const leadInquiries = contactLeads.filter(
    (r) => r.email?.trim().toLowerCase() === lead.email,
  );
  const leadAccess = accessRequests.filter(
    (r) => r.email?.trim().toLowerCase() === lead.email,
  );

  function closeDetail() {
    const params = new URLSearchParams(searchParams.toString());
    params.delete("lead");
    router.replace(`/admin?${params.toString()}`, { scroll: false });
  }

  async function savePipeline() {
    setActionPending(true);
    setBanner(null);
    const res = await adminUpdateLeadPipeline(
      lead.email,
      pipelineStatus,
      followUp ? new Date(followUp).toISOString() : null,
    );
    setActionPending(false);
    if (res.ok) {
      setBanner({ type: "success", text: "Pipeline updated." });
      router.refresh();
    } else {
      setBanner({ type: "error", text: res.error });
    }
  }

  async function submitNote() {
    if (!noteBody.trim()) return;
    setActionPending(true);
    setBanner(null);
    const res = await adminAddLeadNote(lead.email, noteBody);
    setActionPending(false);
    if (res.ok) {
      setNoteBody("");
      setBanner({ type: "success", text: "Note added." });
      router.refresh();
    } else {
      setBanner({ type: "error", text: res.error });
    }
  }

  async function approveRequest(row: AccessRequestRow) {
    if (!row.email) return;
    setActionPending(true);
    const res = await adminApproveAccessRequest(row.id, row.email, row.program);
    setActionPending(false);
    setBanner(
      res.ok
        ? { type: "success", text: "Access approved." }
        : { type: "error", text: res.error },
    );
    if (res.ok) router.refresh();
  }

  async function denyRequest(id: string) {
    setActionPending(true);
    const res = await adminDenyAccessRequest(id);
    setActionPending(false);
    setBanner(
      res.ok
        ? { type: "success", text: "Access denied." }
        : { type: "error", text: res.error },
    );
    if (res.ok) router.refresh();
  }

  async function setInquiryStatus(id: string, status: string) {
    setActionPending(true);
    const res = await adminUpdateContactLeadStatus(id, status);
    setActionPending(false);
    setBanner(
      res.ok ? { type: "success", text: "Inquiry updated." } : { type: "error", text: res.error },
    );
    if (res.ok) router.refresh();
  }

  return (
    <div className="px-4 py-6 sm:px-6 lg:px-8 lg:py-8">
      <button
        type="button"
        onClick={closeDetail}
        className="mb-6 inline-flex items-center gap-2 text-sm text-zinc-500 transition hover:text-white"
      >
        <IconArrowLeft className="h-4 w-4" stroke={1.75} />
        Back to pipeline
      </button>

      {banner ? <AdminBanner type={banner.type} message={banner.text} /> : null}

      <div className="flex flex-col gap-4 lg:flex-row lg:items-start lg:justify-between">
        <div>
          <div className="flex flex-wrap items-center gap-3">
            <h1 className="text-2xl font-semibold text-white">{lead.fullName ?? lead.email}</h1>
            <LeadPipelineStatusBadge status={pipelineStatus} />
          </div>
          <p className="mt-1 text-sm text-zinc-500">{lead.email}</p>
          {lead.organization ? (
            <p className="mt-1 text-sm text-zinc-400">{lead.organization}</p>
          ) : null}
        </div>
        <a href={`mailto:${lead.email}`} className={adminBtnPrimary}>
          Email lead
        </a>
      </div>

      <div className="mt-8 grid gap-6 lg:grid-cols-3">
        <div className="space-y-6 lg:col-span-1">
          <div className="rounded-xl border border-white/[0.06] bg-[#111113] p-5">
            <h2 className="text-sm font-medium text-white">Pipeline</h2>
            <div className="mt-4 space-y-4">
              <label className="block">
                <span className="text-xs text-zinc-500">Status</span>
                <select
                  value={pipelineStatus}
                  onChange={(e) => setPipelineStatus(e.target.value as LeadPipelineStatus)}
                  className={`${adminInputClass} mt-1.5`}
                >
                  {LEAD_PIPELINE_STATUSES.map((s) => (
                    <option key={s} value={s}>
                      {leadPipelineStatusLabel(s)}
                    </option>
                  ))}
                </select>
              </label>
              <label className="block">
                <span className="text-xs text-zinc-500">Next follow-up</span>
                <input
                  type="datetime-local"
                  value={followUp}
                  onChange={(e) => setFollowUp(e.target.value)}
                  className={`${adminInputClass} mt-1.5`}
                />
              </label>
              <button
                type="button"
                disabled={actionPending}
                onClick={() => void savePipeline()}
                className={adminBtnPrimary}
              >
                Save pipeline
              </button>
            </div>
          </div>

          <div className="rounded-xl border border-white/[0.06] bg-[#111113] p-5">
            <h2 className="text-sm font-medium text-white">Add note</h2>
            <textarea
              value={noteBody}
              onChange={(e) => setNoteBody(e.target.value)}
              rows={4}
              placeholder="Call summary, next steps, context for the team…"
              className={`${adminInputClass} mt-3 resize-y`}
            />
            <button
              type="button"
              disabled={actionPending || !noteBody.trim()}
              onClick={() => void submitNote()}
              className={`${adminBtnPrimary} mt-3`}
            >
              Save note
            </button>
          </div>
        </div>

        <div className="lg:col-span-2">
          <AdminSection title="Timeline" description="Inquiries, access requests, notes, and operator actions.">
            <div className="rounded-xl border border-white/[0.06] bg-[#111113] p-5">
              {timeline.length === 0 ? (
                <p className="text-sm text-zinc-500">No activity recorded yet.</p>
              ) : (
                <ul className="space-y-5">
                  {timeline.map((entry) => (
                    <li key={entry.id} className="flex gap-3">
                      <TimelineIcon kind={entry.kind} />
                      <div className="min-w-0 flex-1">
                        <div className="flex flex-wrap items-baseline justify-between gap-2">
                          <p className="text-sm font-medium text-white">{entry.title}</p>
                          <time className="shrink-0 text-xs text-zinc-500">
                            {formatWhen(entry.occurredAt)}
                          </time>
                        </div>
                        {entry.meta ? (
                          <p className="mt-0.5 text-xs text-zinc-500">{entry.meta}</p>
                        ) : null}
                        {entry.detail ? (
                          <p className="mt-2 whitespace-pre-wrap text-sm text-zinc-400">{entry.detail}</p>
                        ) : null}
                      </div>
                    </li>
                  ))}
                </ul>
              )}
            </div>
          </AdminSection>

          {leadAccess.length > 0 ? (
            <AdminSection title="Access requests" description="Approve or deny from this lead profile.">
              <div className="space-y-3">
                {leadAccess.map((row) => {
                  const isPending = (row.status ?? "pending").toLowerCase() === "pending";
                  return (
                    <div
                      key={row.id}
                      className="rounded-xl border border-white/[0.06] bg-[#111113] p-4"
                    >
                      <div className="flex flex-wrap items-center justify-between gap-2">
                        <div>
                          <p className="text-sm font-medium text-white">
                            {row.reference ?? row.program ?? "Access request"}
                          </p>
                          <p className="text-xs text-zinc-500">{row.status ?? "pending"}</p>
                        </div>
                        {isPending ? (
                          <div className="flex gap-2">
                            <button
                              type="button"
                              disabled={actionPending}
                              onClick={() => void approveRequest(row)}
                              className={adminBtnSuccess}
                            >
                              Approve
                            </button>
                            <button
                              type="button"
                              disabled={actionPending}
                              onClick={() => void denyRequest(row.id)}
                              className={adminBtnDanger}
                            >
                              Deny
                            </button>
                          </div>
                        ) : null}
                      </div>
                      {isSofAccessRequest(row.program) ? (
                        <p className="mt-2 text-xs text-emerald-400">SOF program</p>
                      ) : null}
                    </div>
                  );
                })}
              </div>
            </AdminSection>
          ) : null}

          {leadInquiries.length > 0 ? (
            <AdminSection title="Inquiries">
              <div className="space-y-3">
                {leadInquiries.map((row) => (
                  <div
                    key={row.id}
                    className="rounded-xl border border-white/[0.06] bg-[#111113] p-4"
                  >
                    <p className="text-sm font-medium text-white">{row.subject ?? "Inquiry"}</p>
                    <p className="mt-1 text-xs text-zinc-500">{row.status ?? "new"}</p>
                    {row.message ? (
                      <p className="mt-2 text-sm text-zinc-400">{row.message}</p>
                    ) : null}
                    {(row.status ?? "new").toLowerCase() !== "closed" ? (
                      <div className="mt-3 flex gap-2">
                        <button
                          type="button"
                          disabled={actionPending}
                          onClick={() => void setInquiryStatus(row.id, "in progress")}
                          className={adminBtnGhost}
                        >
                          In progress
                        </button>
                        <button
                          type="button"
                          disabled={actionPending}
                          onClick={() => void setInquiryStatus(row.id, "closed")}
                          className={adminBtnGhost}
                        >
                          Close
                        </button>
                      </div>
                    ) : null}
                  </div>
                ))}
              </div>
            </AdminSection>
          ) : null}
        </div>
      </div>
    </div>
  );
}
