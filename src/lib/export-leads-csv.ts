import type { UnifiedLead } from "@/lib/lead-management";

function csvCell(value: string | number | null | undefined): string {
  const s = value == null ? "" : String(value);
  if (/[",\n\r]/.test(s)) return `"${s.replace(/"/g, '""')}"`;
  return s;
}

export function unifiedLeadsToCsv(leads: UnifiedLead[]): string {
  const header = [
    "email",
    "full_name",
    "organization",
    "pipeline_status",
    "next_follow_up",
    "inquiry_count",
    "access_count",
    "last_activity",
    "pending_access",
    "open_inquiry",
  ];
  const rows = leads.map((l) =>
    [
      l.email,
      l.fullName,
      l.organization,
      l.pipelineStatus,
      l.nextFollowUpAt,
      l.inquiryCount,
      l.accessCount,
      l.lastActivityAt,
      l.hasPendingAccess ? "yes" : "no",
      l.hasOpenInquiry ? "yes" : "no",
    ]
      .map(csvCell)
      .join(","),
  );
  return [header.join(","), ...rows].join("\n");
}
