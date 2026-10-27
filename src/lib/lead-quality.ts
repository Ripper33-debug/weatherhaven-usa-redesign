import type { AccessRequestRow } from "@/lib/accessRequests";
import type { ContactLeadRow } from "@/lib/contactLeads";
import { fetchLeadEventStats } from "@/app/api/_lib/admin-data";

export type LeadQualitySummary = {
  newInquiries: number;
  openInquiries: number;
  pendingAccess: number;
  pendingSofAccess: number;
  approvedAccess30d: number;
  deniedAccess30d: number;
  leadEvents30d: number;
  topIntents: { label: string; count: number }[];
  funnel: { stage: string; count: number }[];
};

function isSofProgram(program: string | null | undefined): boolean {
  const p = (program ?? "").trim().toLowerCase();
  return p.includes("special") || p.startsWith("sof") || p === "special-forces";
}

function daysAgoIso(days: number): string {
  const d = new Date();
  d.setDate(d.getDate() - days);
  return d.toISOString();
}

export async function fetchLeadQualitySummary(
  contactLeads: ContactLeadRow[],
  accessRequests: AccessRequestRow[],
): Promise<LeadQualitySummary> {
  const since30 = daysAgoIso(30);

  const newInquiries = contactLeads.filter((l) => {
    const s = (l.status ?? "new").toLowerCase();
    return s === "new" || s === "";
  }).length;

  const openInquiries = contactLeads.filter((l) => {
    const s = (l.status ?? "new").toLowerCase();
    return s !== "closed" && s !== "resolved";
  }).length;

  const pendingAccess = accessRequests.filter(
    (r) => (r.status ?? "pending").toLowerCase() === "pending",
  ).length;

  const pendingSofAccess = accessRequests.filter(
    (r) => (r.status ?? "pending").toLowerCase() === "pending" && isSofProgram(r.program),
  ).length;

  const recentRequests = accessRequests.filter((r) => r.submitted_at && r.submitted_at >= since30);
  const approvedAccess30d = recentRequests.filter(
    (r) => (r.status ?? "").toLowerCase() === "approved",
  ).length;
  const deniedAccess30d = recentRequests.filter((r) => (r.status ?? "").toLowerCase() === "denied").length;

  let leadEvents30d = 0;
  let topIntents: { label: string; count: number }[] = [];

  try {
    const { events, error } = await fetchLeadEventStats(since30);

    if (!error && events) {
      leadEvents30d = events.length;
      const counts = new Map<string, number>();
      for (const row of events) {
        const key = `${row.event_type}: ${row.event_label}`;
        counts.set(key, (counts.get(key) ?? 0) + 1);
      }
      topIntents = [...counts.entries()]
        .map(([label, count]) => ({ label, count }))
        .sort((a, b) => b.count - a.count)
        .slice(0, 8);
    }
  } catch {
    /* table may not exist until migration runs */
  }

  const missionBuilder = contactLeads.filter((l) =>
    (l.inquiry_type ?? "").toLowerCase().includes("demo"),
  ).length;

  const funnel = [
    { stage: "Site intent (30d)", count: leadEvents30d },
    { stage: "Engineering inquiries (open)", count: openInquiries },
    { stage: "Access pending", count: pendingAccess },
    { stage: "SOF pending", count: pendingSofAccess },
    { stage: "Approved (30d)", count: approvedAccess30d },
  ];

  if (missionBuilder > 0 && !topIntents.some((t) => t.label.includes("mission"))) {
    topIntents.push({ label: "inquiry_submit: Demo requests (leads)", count: missionBuilder });
  }

  return {
    newInquiries,
    openInquiries,
    pendingAccess,
    pendingSofAccess,
    approvedAccess30d,
    deniedAccess30d,
    leadEvents30d,
    topIntents,
    funnel,
  };
}
