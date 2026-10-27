export const LEAD_PIPELINE_STATUSES = [
  "new",
  "contacted",
  "qualified",
  "approved",
  "closed",
  "lost",
] as const;

export type LeadPipelineStatus = (typeof LEAD_PIPELINE_STATUSES)[number];

export function isLeadPipelineStatus(value: string): value is LeadPipelineStatus {
  return (LEAD_PIPELINE_STATUSES as readonly string[]).includes(value);
}

export function leadPipelineStatusLabel(status: LeadPipelineStatus): string {
  switch (status) {
    case "new":
      return "New";
    case "contacted":
      return "Contacted";
    case "qualified":
      return "Qualified";
    case "approved":
      return "Approved";
    case "closed":
      return "Closed";
    case "lost":
      return "Lost";
  }
}

/** Suggest pipeline status from related lead rows. */
export function inferPipelineStatus(input: {
  accessStatuses: string[];
  inquiryStatuses: string[];
}): LeadPipelineStatus {
  const access = input.accessStatuses.map((s) => s.toLowerCase());
  const inquiries = input.inquiryStatuses.map((s) => s.toLowerCase());

  if (access.includes("approved")) return "approved";
  if (access.includes("denied")) return "lost";
  if (access.includes("pending")) return "qualified";
  if (inquiries.some((s) => s === "in progress" || s === "in_progress")) return "contacted";
  if (inquiries.some((s) => s === "new" || s === "")) return "new";
  if (inquiries.every((s) => s === "closed")) return "closed";
  return "new";
}
