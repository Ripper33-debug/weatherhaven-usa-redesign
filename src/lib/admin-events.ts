import "server-only";

export type { AdminEventInsert, AdminEventRow } from "@/lib/admin-event-labels";
export { insertAdminEvent, listAdminEvents } from "@/app/api/_lib/admin-events";
