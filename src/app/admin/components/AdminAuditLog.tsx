"use client";

import type { AdminEventRow } from "@/lib/admin-event-labels";
import { adminEventLabel } from "@/lib/admin-event-labels";
import { AdminEmpty, AdminTableShell } from "./admin-ui";

function formatWhen(iso: string | null) {
  if (!iso) return "—";
  try {
    return new Date(iso).toLocaleString();
  } catch {
    return iso;
  }
}

export function AdminAuditLog({ events }: { events: AdminEventRow[] }) {
  if (events.length === 0) {
    return <AdminEmpty message="No admin actions logged yet. Run the admin_events migration in Supabase if this persists." />;
  }

  return (
    <AdminTableShell>
      <table className="w-full min-w-[720px] border-collapse text-left text-sm">
        <thead>
          <tr className="border-b border-white/[0.08] bg-[#080a0c]/80 text-[11px] tracking-wide text-[#8a9099] uppercase">
            <th className="px-5 py-3.5 font-medium">When</th>
            <th className="px-5 py-3.5 font-medium">Action</th>
            <th className="px-5 py-3.5 font-medium">Operator</th>
            <th className="px-5 py-3.5 font-medium">Target</th>
          </tr>
        </thead>
        <tbody>
          {events.map((row) => (
            <tr key={row.id} className="border-b border-white/[0.06] transition-colors hover:bg-white/[0.02]">
              <td className="px-5 py-3.5 whitespace-nowrap text-[#8a9099]">{formatWhen(row.created_at)}</td>
              <td className="px-5 py-3.5 font-medium text-white">{adminEventLabel(row.action)}</td>
              <td className="px-5 py-3.5 text-[#8a9099]">{row.actor_email}</td>
              <td className="px-5 py-3.5 text-[#8a9099]">
                {row.target_email ?? row.target_id ?? "—"}
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </AdminTableShell>
  );
}
