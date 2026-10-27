"use client";

import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import { IconBell, IconExternalLink, IconSearch } from "@tabler/icons-react";
import { AdminSignOut } from "./AdminSignOut";

export function AdminTopBar({
  operatorEmail,
  pendingTotal,
  searchEnabled = false,
}: {
  operatorEmail?: string;
  pendingTotal: number;
  searchEnabled?: boolean;
}) {
  const displayName = operatorEmail?.split("@")[0] ?? "Operator";
  const router = useRouter();
  const searchParams = useSearchParams();
  const query = searchParams.get("q") ?? "";

  function onSearchChange(value: string) {
    const params = new URLSearchParams(searchParams.toString());
    if (value.trim()) {
      params.set("q", value);
      if (!params.get("tab")) params.set("tab", "pipeline");
    } else {
      params.delete("q");
    }
    router.replace(`/admin?${params.toString()}`, { scroll: false });
  }

  return (
    <header className="flex h-16 shrink-0 items-center justify-between gap-4 border-b border-white/[0.06] bg-[#09090b]/80 px-4 backdrop-blur-md sm:px-6">
      <div className="hidden min-w-0 flex-1 sm:block sm:max-w-md">
        <label className="relative block">
          <span className="sr-only">Search leads</span>
          <IconSearch
            className="pointer-events-none absolute top-1/2 left-3 h-4 w-4 -translate-y-1/2 text-zinc-500"
            stroke={1.75}
          />
          <input
            type="search"
            placeholder={searchEnabled ? "Search leads by name, email, org…" : "Search…"}
            value={query}
            onChange={(e) => onSearchChange(e.target.value)}
            disabled={!searchEnabled}
            className="w-full rounded-lg border border-white/[0.06] bg-white/[0.03] py-2 pr-3 pl-9 text-sm text-zinc-300 outline-none placeholder:text-zinc-600 focus:border-emerald-500/40 disabled:cursor-not-allowed disabled:opacity-60"
          />
        </label>
      </div>

      <div className="flex flex-1 items-center justify-end gap-2 sm:flex-none sm:gap-3">
        {pendingTotal > 0 ? (
          <Link
            href="/admin?tab=pipeline"
            className="hidden items-center gap-2 rounded-lg bg-emerald-500 px-3 py-2 text-xs font-semibold text-[#09090b] transition hover:bg-emerald-400 sm:inline-flex"
          >
            {pendingTotal} need attention
          </Link>
        ) : null}

        <Link
          href="/"
          className="inline-flex h-9 w-9 items-center justify-center rounded-lg border border-white/[0.06] text-zinc-400 transition hover:text-white"
          title="Marketing site"
        >
          <IconExternalLink className="h-4 w-4" stroke={1.75} />
        </Link>

        <button
          type="button"
          className="relative inline-flex h-9 w-9 items-center justify-center rounded-lg border border-white/[0.06] text-zinc-400"
          title="Notifications"
          disabled
        >
          <IconBell className="h-4 w-4" stroke={1.75} />
          {pendingTotal > 0 ? (
            <span className="absolute top-1.5 right-1.5 h-2 w-2 rounded-full bg-emerald-500" />
          ) : null}
        </button>

        <div className="hidden items-center gap-2 sm:flex">
          <div className="flex h-8 w-8 items-center justify-center rounded-full bg-emerald-500/20 text-xs font-semibold text-emerald-400 uppercase">
            {displayName.slice(0, 2)}
          </div>
        </div>

        <AdminSignOut compact />
      </div>
    </header>
  );
}
