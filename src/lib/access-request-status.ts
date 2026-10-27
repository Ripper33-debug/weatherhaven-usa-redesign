export const ACCESS_REQUEST_STATUSES = [
  "pending",
  "vetting",
  "contacted",
  "qualified",
  "follow_up",
  "approved",
  "denied",
] as const;

export type AccessRequestStatus = (typeof ACCESS_REQUEST_STATUSES)[number];

export function isAccessRequestStatus(value: string): value is AccessRequestStatus {
  return (ACCESS_REQUEST_STATUSES as readonly string[]).includes(value);
}
