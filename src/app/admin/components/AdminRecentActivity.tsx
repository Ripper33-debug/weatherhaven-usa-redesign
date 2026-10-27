"use client";

import type { RecentActivityItem, UserAccountType } from "@/lib/admin-analytics";
import { getPageLabel } from "@/lib/page-labels";

function formatWhen(iso: string) {
  try {
    return new Date(iso).toLocaleString();
  } catch {
    return iso;
  }
}

function accountBadge(type: UserAccountType) {
  if (type === "operator") return { label: "Operator", className: "text-[#4d9fff] border-[#4d9fff]/30" };
  if (type === "sof") return { label: "SOF", className: "text-amber-200/90 border-amber-200/20" };
  return { label: "Platform", className: "text-[#8a9099] border-white/10" };
}

function kindLabel(kind: RecentActivityItem["kind"]) {
  switch (kind) {
    case "page_view":
      return "View";
    case "event":
      return "Event";
    case "click":
      return "Click";
    case "session_start":
      return "Session";
  }
}

export function AdminRecentActivity({ items }: { items: RecentActivityItem[] }) {
  return (
    <div className="rounded-xl border border-white/[0.06] bg-[#111113] p-6 sm:p-8">
      <p className="text-xs font-medium text-zinc-500">Recent activity</p>
      <p className="mt-2 text-sm text-zinc-500">Last 14 days — page views, clicks, events, and session starts</p>
      <ul className="mt-6 max-h-[420px] space-y-0 overflow-y-auto">
        {items.length === 0 ? (
          <li className="py-3 text-sm text-[#8a9099]">No signed-in activity recorded yet.</li>
        ) : (
          items.map((item) => {
            const badge = accountBadge(item.accountType);
            return (
              <li
                key={item.id}
                className="flex flex-col gap-2 border-b border-white/[0.04] py-3 last:border-0 sm:grid sm:grid-cols-[auto_minmax(0,1fr)_auto] sm:items-center sm:gap-4"
              >
                <div className="flex flex-wrap items-center gap-2">
                  <span className="rounded border border-white/10 px-2 py-0.5 text-[10px] uppercase tracking-wide text-[#8a9099]">
                    {kindLabel(item.kind)}
                  </span>
                  <span className={`rounded border px-2 py-0.5 text-[10px] uppercase tracking-wide ${badge.className}`}>
                    {badge.label}
                  </span>
                </div>
                <div className="min-w-0">
                  <p className="truncate text-sm text-white">{item.label}</p>
                  <p className="mt-1 truncate text-xs text-[#8a9099]">
                    {item.email}
                    {item.page ? ` · ${getPageLabel(item.page)}` : ""}
                  </p>
                </div>
                <time className="shrink-0 text-xs text-[#8a9099] sm:text-right">{formatWhen(item.occurredAt)}</time>
              </li>
            );
          })
        )}
      </ul>
    </div>
  );
}
