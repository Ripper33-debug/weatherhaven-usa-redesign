import type { ReactNode } from "react";

export function AdminPageHeader({
  title,
  subtitle,
  actions,
}: {
  title: string;
  subtitle?: string;
  actions?: ReactNode;
}) {
  return (
    <header className="border-b border-white/[0.08] pb-10">
      <div className="flex flex-col gap-6 lg:flex-row lg:items-end lg:justify-between">
        <div>
          <p className="text-[11px] font-medium tracking-[0.14em] text-[#4d9fff] uppercase">Internal</p>
          <h1 className="admin-display mt-3 text-3xl leading-tight text-white sm:text-4xl">{title}</h1>
          {subtitle ? <p className="mt-3 max-w-2xl text-sm leading-relaxed text-[#8a9099]">{subtitle}</p> : null}
        </div>
        {actions ? <div className="flex shrink-0 flex-wrap gap-3">{actions}</div> : null}
      </div>
    </header>
  );
}

export function AdminKpiCard({
  label,
  value,
  hint,
  accent,
}: {
  label: string;
  value: string | number;
  hint?: string;
  accent?: boolean;
}) {
  return (
    <div className="relative overflow-hidden rounded-xl border border-white/[0.06] bg-[#111113] p-5 sm:p-6">
      {accent ? (
        <div
          className="pointer-events-none absolute inset-x-0 top-0 h-[2px] bg-gradient-to-r from-emerald-500 via-emerald-500/50 to-transparent"
          aria-hidden
        />
      ) : null}
      <p className="text-xs font-medium text-zinc-500">{label}</p>
      <p className="mt-2 text-2xl font-semibold tabular-nums tracking-tight text-white sm:text-3xl">{value}</p>
      {hint ? <p className="mt-2 text-xs text-zinc-500">{hint}</p> : null}
    </div>
  );
}

export function AdminTabs({
  tabs,
  active,
  onChange,
}: {
  tabs: { id: string; label: string; count?: number }[];
  active: string;
  onChange: (id: string) => void;
}) {
  return (
    <div
      className="mt-10 flex gap-1 overflow-x-auto border-b border-white/[0.08] pb-px"
      role="tablist"
      aria-label="Admin sections"
    >
      {tabs.map((tab) => {
        const selected = active === tab.id;
        return (
          <button
            key={tab.id}
            type="button"
            role="tab"
            id={`admin-tab-${tab.id}`}
            aria-selected={selected}
            aria-controls={`admin-panel-${tab.id}`}
            onClick={() => onChange(tab.id)}
            className={`shrink-0 border-b-2 px-4 py-3 text-sm font-medium transition-colors ${
              selected
                ? "border-[#4d9fff] text-white"
                : "border-transparent text-[#8a9099] hover:text-white"
            }`}
          >
            {tab.label}
            {tab.count !== undefined && tab.count > 0 ? (
              <span
                className={`ml-2 inline-flex min-w-[1.25rem] items-center justify-center rounded-full px-1.5 py-0.5 text-[10px] font-semibold tabular-nums ${
                  selected ? "bg-[#4d9fff] text-[#080a0c]" : "bg-white/10 text-[#8a9099]"
                }`}
              >
                {tab.count}
              </span>
            ) : null}
          </button>
        );
      })}
    </div>
  );
}

export function AdminSection({
  id,
  title,
  description,
  children,
}: {
  id?: string;
  title: string;
  description?: string;
  children: ReactNode;
}) {
  return (
    <section id={id} className="pt-8" role="tabpanel" aria-labelledby={id ? `admin-tab-${id.replace("admin-panel-", "")}` : undefined}>
      <div className="mb-6">
        <h2 className="text-lg font-medium text-white">{title}</h2>
        {description ? <p className="mt-1 text-sm text-[#8a9099]">{description}</p> : null}
      </div>
      {children}
    </section>
  );
}

export function AdminBanner({ type, message }: { type: "success" | "error"; message: string }) {
  return (
    <div
      className={`mb-6 border px-4 py-3 text-sm ${
        type === "success"
          ? "border-[#4ade80]/30 bg-[#4ade80]/10 text-[#4ade80]"
          : "border-red-500/30 bg-red-950/30 text-red-200"
      }`}
      role="status"
    >
      {message}
    </div>
  );
}

export function AdminTableShell({ children }: { children: ReactNode }) {
  return (
    <div className="overflow-hidden rounded-xl border border-white/[0.06] bg-[#111113]">
      <div className="overflow-x-auto">{children}</div>
    </div>
  );
}

export function AdminEmpty({ message }: { message: string }) {
  return (
    <div className="flex flex-col items-center justify-center rounded-xl border border-white/[0.06] bg-[#111113] px-6 py-16 text-center">
      <p className="text-sm text-zinc-500">{message}</p>
    </div>
  );
}

export const adminBtnPrimary =
  "inline-flex items-center justify-center rounded-lg border-0 bg-emerald-500 px-4 py-2 text-xs font-semibold text-[#09090b] transition hover:bg-emerald-400 disabled:cursor-not-allowed disabled:opacity-50";

export const adminBtnGhost =
  "inline-flex items-center justify-center border border-white/20 bg-transparent px-3 py-2 text-xs font-medium text-white transition hover:border-white/40 disabled:opacity-50";

export const adminBtnSuccess =
  "inline-flex items-center justify-center border border-[#4ade80]/40 bg-[#4ade80]/10 px-3 py-2 text-xs font-medium text-[#4ade80] transition hover:bg-[#4ade80]/20 disabled:opacity-50";

export const adminBtnDanger =
  "inline-flex items-center justify-center border border-red-500/40 bg-red-950/20 px-3 py-2 text-xs font-medium text-red-300 transition hover:bg-red-950/40 disabled:opacity-50";

export const adminBtnMuted =
  "inline-flex items-center justify-center border border-white/15 bg-transparent px-3 py-2 text-xs font-medium text-[#8a9099] transition hover:text-white disabled:opacity-50";

export const adminInputClass =
  "w-full border border-white/[0.12] bg-[#080a0c] px-4 py-3 text-sm text-white outline-none placeholder:text-[#8a9099] focus:border-[#4d9fff]/50";
