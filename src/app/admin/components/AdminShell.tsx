"use client";

import { AdminMobileNav, AdminSidebar, type AdminNavTab } from "./AdminSidebar";
import { AdminTopBar } from "./AdminTopBar";

export function AdminShell({
  children,
  activeTab,
  onTabChange,
  counts,
  operatorEmail,
  pendingTotal,
  searchEnabled,
}: {
  children: React.ReactNode;
  activeTab: AdminNavTab;
  onTabChange: (tab: AdminNavTab) => void;
  counts: { pipeline: number; leads: number; access: number; invites: number };
  operatorEmail?: string;
  pendingTotal: number;
  searchEnabled?: boolean;
}) {
  return (
    <div className="admin-shell flex min-h-dvh bg-[#09090b] text-white">
      <div className="hidden lg:flex">
        <AdminSidebar
          active={activeTab}
          onChange={onTabChange}
          counts={counts}
          operatorEmail={operatorEmail}
        />
      </div>

      <div className="flex min-w-0 flex-1 flex-col">
        <AdminTopBar
          operatorEmail={operatorEmail}
          pendingTotal={pendingTotal}
          searchEnabled={searchEnabled}
        />
        <AdminMobileNav active={activeTab} onChange={onTabChange} counts={counts} />
        <main className="min-w-0 flex-1 overflow-x-hidden overflow-y-auto">{children}</main>
      </div>
    </div>
  );
}
