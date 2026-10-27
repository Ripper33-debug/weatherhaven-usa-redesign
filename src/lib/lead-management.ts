import type { AccessRequestRow } from "@/lib/accessRequests";
import type { ContactLeadRow } from "@/lib/contactLeads";
import type { AdminEventRow } from "@/lib/admin-event-labels";
import {
  inferPipelineStatus,
  type LeadPipelineStatus,
} from "@/lib/lead-pipeline-status";
import type { LeadNoteRow, LeadProfileRow } from "@/app/api/_lib/lead-profiles";

export type UnifiedLead = {
  email: string;
  fullName: string | null;
  organization: string | null;
  pipelineStatus: LeadPipelineStatus;
  nextFollowUpAt: string | null;
  profileId: string | null;
  inquiryCount: number;
  accessCount: number;
  lastActivityAt: string | null;
  hasPendingAccess: boolean;
  hasOpenInquiry: boolean;
};

export type LeadTimelineEntry = {
  id: string;
  kind:
    | "inquiry"
    | "access_request"
    | "note"
    | "admin_action"
    | "profile_update";
  title: string;
  detail?: string;
  occurredAt: string;
  meta?: string;
};

export function normalizeLeadEmail(email: string | null | undefined): string | null {
  const normalized = email?.trim().toLowerCase();
  return normalized || null;
}

export function buildUnifiedLeads(input: {
  contactLeads: ContactLeadRow[];
  accessRequests: AccessRequestRow[];
  profiles: LeadProfileRow[];
}): UnifiedLead[] {
  const byEmail = new Map<
    string,
    {
      fullName: string | null;
      organization: string | null;
      inquiries: ContactLeadRow[];
      access: AccessRequestRow[];
      profile: LeadProfileRow | null;
    }
  >();

  for (const lead of input.contactLeads) {
    const email = normalizeLeadEmail(lead.email);
    if (!email) continue;
    const bucket = byEmail.get(email) ?? {
      fullName: null,
      organization: null,
      inquiries: [],
      access: [],
      profile: null,
    };
    bucket.inquiries.push(lead);
    bucket.fullName = bucket.fullName || lead.full_name;
    bucket.organization = bucket.organization || lead.organization;
    byEmail.set(email, bucket);
  }

  for (const req of input.accessRequests) {
    const email = normalizeLeadEmail(req.email);
    if (!email) continue;
    const bucket = byEmail.get(email) ?? {
      fullName: null,
      organization: null,
      inquiries: [],
      access: [],
      profile: null,
    };
    bucket.access.push(req);
    bucket.fullName = bucket.fullName || req.full_name;
    bucket.organization = bucket.organization || req.organization;
    byEmail.set(email, bucket);
  }

  for (const profile of input.profiles) {
    const email = normalizeLeadEmail(profile.email);
    if (!email) continue;
    const bucket = byEmail.get(email) ?? {
      fullName: null,
      organization: null,
      inquiries: [],
      access: [],
      profile: null,
    };
    bucket.profile = profile;
    bucket.fullName = bucket.fullName || profile.full_name;
    bucket.organization = bucket.organization || profile.organization;
    byEmail.set(email, bucket);
  }

  const unified: UnifiedLead[] = [];

  for (const [email, bucket] of byEmail) {
    const accessStatuses = bucket.access.map((r) => r.status ?? "pending");
    const inquiryStatuses = bucket.inquiries.map((r) => r.status ?? "new");
    const inferred = inferPipelineStatus({ accessStatuses, inquiryStatuses });
    const profileStatus = bucket.profile?.pipeline_status as LeadPipelineStatus | undefined;

    const activityDates = [
      ...bucket.inquiries.map((r) => r.submitted_at),
      ...bucket.access.map((r) => r.submitted_at),
      bucket.profile?.updated_at,
    ].filter(Boolean) as string[];

    const lastActivityAt =
      activityDates.length > 0
        ? activityDates.sort((a, b) => new Date(b).getTime() - new Date(a).getTime())[0]!
        : null;

    unified.push({
      email,
      fullName: bucket.fullName,
      organization: bucket.organization,
      pipelineStatus: profileStatus ?? inferred,
      nextFollowUpAt: bucket.profile?.next_follow_up_at ?? null,
      profileId: bucket.profile?.id ?? null,
      inquiryCount: bucket.inquiries.length,
      accessCount: bucket.access.length,
      lastActivityAt,
      hasPendingAccess: accessStatuses.some((s) => s.toLowerCase() === "pending"),
      hasOpenInquiry: inquiryStatuses.some((s) => {
        const lower = s.toLowerCase();
        return lower === "new" || lower === "" || lower === "in progress" || lower === "in_progress";
      }),
    });
  }

  return unified.sort((a, b) => {
    const aTime = a.lastActivityAt ? new Date(a.lastActivityAt).getTime() : 0;
    const bTime = b.lastActivityAt ? new Date(b.lastActivityAt).getTime() : 0;
    return bTime - aTime;
  });
}

export function buildLeadTimeline(input: {
  email: string;
  contactLeads: ContactLeadRow[];
  accessRequests: AccessRequestRow[];
  notes: LeadNoteRow[];
  adminEvents: AdminEventRow[];
}): LeadTimelineEntry[] {
  const email = normalizeLeadEmail(input.email);
  if (!email) return [];

  const entries: LeadTimelineEntry[] = [];

  for (const lead of input.contactLeads) {
    if (normalizeLeadEmail(lead.email) !== email) continue;
    entries.push({
      id: `inquiry-${lead.id}`,
      kind: "inquiry",
      title: `Engineering inquiry — ${lead.subject ?? lead.inquiry_type ?? "Contact"}`,
      detail: lead.message ?? undefined,
      occurredAt: lead.submitted_at ?? new Date().toISOString(),
      meta: `${lead.status ?? "new"} · ${lead.organization ?? ""}`,
    });
  }

  for (const req of input.accessRequests) {
    if (normalizeLeadEmail(req.email) !== email) continue;
    entries.push({
      id: `access-${req.id}`,
      kind: "access_request",
      title: `Access request${req.reference ? ` (${req.reference})` : ""}`,
      detail: req.requirements ?? undefined,
      occurredAt: req.submitted_at ?? new Date().toISOString(),
      meta: `${(req.status ?? "pending").charAt(0).toUpperCase() + (req.status ?? "pending").slice(1)} · ${req.program ?? "Program"}`,
    });
  }

  for (const note of input.notes) {
    if (normalizeLeadEmail(note.lead_email) !== email) continue;
    entries.push({
      id: `note-${note.id}`,
      kind: "note",
      title: "Operator note",
      detail: note.body,
      occurredAt: note.created_at ?? new Date().toISOString(),
      meta: note.actor_email,
    });
  }

  for (const event of input.adminEvents) {
    if (normalizeLeadEmail(event.target_email) !== email) continue;
    entries.push({
      id: `admin-${event.id}`,
      kind: "admin_action",
      title: event.action.replace(/\./g, " · "),
      occurredAt: event.created_at ?? new Date().toISOString(),
      meta: event.actor_email,
    });
  }

  return entries.sort(
    (a, b) => new Date(b.occurredAt).getTime() - new Date(a.occurredAt).getTime(),
  );
}

export function filterUnifiedLeads(leads: UnifiedLead[], query: string): UnifiedLead[] {
  const q = query.trim().toLowerCase();
  if (!q) return leads;
  return leads.filter(
    (lead) =>
      lead.email.includes(q) ||
      (lead.fullName?.toLowerCase().includes(q) ?? false) ||
      (lead.organization?.toLowerCase().includes(q) ?? false),
  );
}

export function syncLeadProfileInputs(input: {
  contactLeads: ContactLeadRow[];
  accessRequests: AccessRequestRow[];
}): { email: string; full_name: string | null; organization: string | null; pipeline_status: LeadPipelineStatus }[] {
  const unified = buildUnifiedLeads({
    contactLeads: input.contactLeads,
    accessRequests: input.accessRequests,
    profiles: [],
  });

  return unified.map((lead) => ({
    email: lead.email,
    full_name: lead.fullName,
    organization: lead.organization,
    pipeline_status: lead.pipelineStatus,
  }));
}
