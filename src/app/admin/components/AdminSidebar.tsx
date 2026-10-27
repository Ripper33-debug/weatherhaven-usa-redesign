"use client";

import { WeatherhavenLogoLink } from "@/components/brand/WeatherhavenLogoLink";
import {
  IconAddressBook,
  IconCalendarEvent,
  IconChartBar,
  IconKey,
  IconLayoutDashboard,
  IconMail,
  IconMapPin,
  IconNews,
  IconPackage,
  IconUserPlus,
  IconUsers,
} from "@tabler/icons-react";

export type AdminNavTab =
  | "overview"
  | "pipeline"
  | "leads"
  | "access"
  | "invites"
  | "accounts"
  | "analytics"
  | "news"
  | "events"
  | "products"
  | "deployments";

type NavItem = {
  id: AdminNavTab;
  label: string;
  icon: typeof IconLayoutDashboard;
  count?: number;
};

type NavGroup = {
  title: string;
  items: NavItem[];
};

export function AdminSidebar({
  active,
  onChange,
  counts,
  operatorEmail,
}: {
  active: AdminNavTab;
  onChange: (tab: AdminNavTab) => void;
  counts: { pipeline: number; leads: number; access: number; invites: number };
  operatorEmail?: string;
}) {
  const groups: NavGroup[] = [
    {
      title: "Overview",
      items: [{ id: "overview", label: "Dashboard", icon: IconLayoutDashboard }],
    },
    {
      title: "Operations",
      items: [
        { id: "pipeline", label: "Lead pipeline", icon: IconAddressBook, count: counts.pipeline },
        { id: "leads", label: "Inquiries", icon: IconMail, count: counts.leads },
        { id: "access", label: "Access requests", icon: IconKey, count: counts.access },
        { id: "invites", label: "Invites", icon: IconUserPlus, count: counts.invites },
      ],
    },
    {
      title: "Content",
      items: [
        { id: "products", label: "Shelter systems", icon: IconPackage },
        { id: "news", label: "News releases", icon: IconNews },
        { id: "events", label: "Events & briefings", icon: IconCalendarEvent },
        { id: "deployments", label: "Map pin stories", icon: IconMapPin },
      ],
    },
    {
      title: "Management",
      items: [
        { id: "accounts", label: "Accounts", icon: IconUsers },
        { id: "analytics", label: "Analytics", icon: IconChartBar },
      ],
    },
  ];

  const displayName = operatorEmail?.split("@")[0] ?? "Operator";

  return (
    <aside className="admin-sidebar flex w-[240px] shrink-0 flex-col border-r border-white/[0.06] bg-[#0c0c0e]">
      <div className="flex h-16 items-center gap-2.5 border-b border-white/[0.06] px-5">
        <WeatherhavenLogoLink href="/admin" height={24} ariaLabel="Weatherhaven admin home" />
        <div className="min-w-0">
          <p className="text-[10px] font-medium tracking-wider text-zinc-500 uppercase">Admin</p>
        </div>
      </div>

      <nav className="flex-1 overflow-y-auto px-3 py-4" aria-label="Admin navigation">
        {groups.map((group) => (
          <div key={group.title} className="mb-6">
            <p className="mb-2 px-3 text-[10px] font-semibold tracking-wider text-zinc-600 uppercase">
              {group.title}
            </p>
            <ul className="space-y-0.5">
              {group.items.map((item) => {
                const selected = active === item.id;
                const Icon = item.icon;
                return (
                  <li key={item.id}>
                    <button
                      type="button"
                      onClick={() => onChange(item.id)}
                      className={`flex w-full items-center gap-3 rounded-lg px-3 py-2.5 text-sm font-medium transition ${
                        selected
                          ? "bg-emerald-500/15 text-emerald-400"
                          : "text-zinc-400 hover:bg-white/[0.04] hover:text-white"
                      }`}
                      aria-current={selected ? "page" : undefined}
                    >
                      <Icon className="h-[18px] w-[18px] shrink-0" stroke={1.75} />
                      <span className="flex-1 text-left">{item.label}</span>
                      {item.count !== undefined && item.count > 0 ? (
                        <span
                          className={`min-w-[1.25rem] rounded-full px-1.5 py-0.5 text-center text-[10px] font-semibold tabular-nums ${
                            selected ? "bg-emerald-500 text-[#09090b]" : "bg-white/10 text-zinc-400"
                          }`}
                        >
                          {item.count}
                        </span>
                      ) : null}
                    </button>
                  </li>
                );
              })}
            </ul>
          </div>
        ))}
      </nav>

      <div className="border-t border-white/[0.06] p-4">
        <div className="flex items-center gap-3 rounded-lg px-2 py-2">
          <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-emerald-500/20 text-sm font-semibold text-emerald-400 uppercase">
            {displayName.slice(0, 2)}
          </div>
          <div className="min-w-0 flex-1">
            <p className="truncate text-sm font-medium text-white capitalize">{displayName}</p>
            <p className="truncate text-xs text-zinc-500">Operator</p>
          </div>
        </div>
      </div>
    </aside>
  );
}

export function AdminMobileNav({
  active,
  onChange,
  counts,
}: {
  active: AdminNavTab;
  onChange: (tab: AdminNavTab) => void;
  counts: { pipeline: number; leads: number; access: number; invites: number };
}) {
  const tabs: { id: AdminNavTab; label: string; count?: number }[] = [
    { id: "overview", label: "Home" },
    { id: "pipeline", label: "Pipeline", count: counts.pipeline },
    { id: "leads", label: "Leads", count: counts.leads },
    { id: "access", label: "Access", count: counts.access },
    { id: "accounts", label: "Accounts" },
    { id: "analytics", label: "Stats" },
  ];

  return (
    <div className="flex gap-1 overflow-x-auto border-b border-white/[0.06] bg-[#0c0c0e] px-2 py-2 lg:hidden">
      {tabs.map((t) => (
        <button
          key={t.id}
          type="button"
          onClick={() => onChange(t.id)}
          className={`shrink-0 rounded-lg px-3 py-2 text-xs font-medium ${
            active === t.id ? "bg-emerald-500/15 text-emerald-400" : "text-zinc-500"
          }`}
        >
          {t.label}
          {t.count ? ` (${t.count})` : ""}
        </button>
      ))}
    </div>
  );
}
