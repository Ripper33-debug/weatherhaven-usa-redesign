import type { ReactNode } from "react";
import Link from "next/link";

export function PlatformPageHeader({
  eyebrow = "Platform",
  title,
  subtitle,
  meta,
  actions,
}: {
  eyebrow?: string;
  title: string;
  subtitle?: string;
  meta?: ReactNode;
  actions?: ReactNode;
}) {
  return (
    <header className="border-b border-white/[0.08] pb-8 sm:pb-10">
      <div className="flex flex-col gap-6 lg:flex-row lg:items-end lg:justify-between">
        <div className="min-w-0">
          <p className="text-[11px] font-medium tracking-[0.14em] text-[#4d9fff] uppercase">{eyebrow}</p>
          <h1 className="platform-display mt-3 text-3xl leading-tight text-white sm:text-4xl lg:text-[2.75rem]">
            {title}
          </h1>
          {subtitle ? (
            <p className="mt-3 max-w-2xl text-sm leading-relaxed text-[#8a9099]">{subtitle}</p>
          ) : null}
          {meta ? <div className="mt-4 flex flex-wrap items-center gap-4 text-sm text-[#8a9099]">{meta}</div> : null}
        </div>
        {actions ? <div className="flex shrink-0 flex-wrap gap-3">{actions}</div> : null}
      </div>
    </header>
  );
}

export function PlatformKpiCard({
  label,
  value,
  hint,
  accent,
}: {
  label: string;
  value: ReactNode;
  hint?: string;
  accent?: boolean;
}) {
  return (
    <div className="wh-marketing-panel relative overflow-hidden p-6 sm:p-7">
      {accent ? (
        <div
          className="pointer-events-none absolute inset-x-0 top-0 h-[2px] bg-gradient-to-r from-[#4d9fff] via-[#4d9fff]/50 to-transparent"
          aria-hidden
        />
      ) : null}
      <p className="text-[11px] font-medium tracking-[0.12em] text-[#8a9099] uppercase">{label}</p>
      <p className="platform-display mt-3 text-3xl tabular-nums text-white sm:text-4xl">{value}</p>
      {hint ? <p className="mt-2 text-xs text-[#8a9099]">{hint}</p> : null}
    </div>
  );
}

export function PlatformSection({
  title,
  description,
  children,
}: {
  title: string;
  description?: string;
  children: ReactNode;
}) {
  return (
    <section>
      <div className="mb-6">
        <h2 className="text-lg font-medium tracking-tight text-white">{title}</h2>
        {description ? <p className="mt-2 max-w-2xl text-sm text-[#8a9099]">{description}</p> : null}
      </div>
      {children}
    </section>
  );
}

export function PlatformWelcomePanel({ onDismiss }: { onDismiss: () => void }) {
  const steps = [
    { n: "1", title: "Browse systems", href: "/configurable-solutions", detail: "HQSS, softwall, and field packages" },
    { n: "2", title: "Build your mission", href: "/mission-solution-builder", detail: "Configure requirements in minutes" },
    { n: "3", title: "Plan deployment", href: "/sof-solutions/secure/deployment-planner", detail: "Place markers and measure distances" },
  ];

  return (
    <div className="wh-marketing-panel relative overflow-hidden border-[#4d9fff]/25 p-6 sm:p-8">
      <div
        className="pointer-events-none absolute inset-x-0 top-0 h-[2px] bg-gradient-to-r from-[#4d9fff] via-[#4ade80]/60 to-transparent"
        aria-hidden
      />
      <div className="flex flex-col gap-6 sm:flex-row sm:items-start sm:justify-between">
        <div>
          <p className="text-[11px] font-medium tracking-[0.14em] text-[#4ade80] uppercase">Account active</p>
          <p className="platform-display mt-2 text-xl text-white sm:text-2xl">Your platform workspace is ready.</p>
          <p className="mt-2 max-w-xl text-sm text-[#8a9099]">
            Start with systems and mission configuration, then use the deployment planner to sketch operating locations.
          </p>
        </div>
        <button
          type="button"
          onClick={onDismiss}
          className="shrink-0 text-xs font-medium text-[#8a9099] transition hover:text-white"
        >
          Dismiss
        </button>
      </div>
      <ol className="mt-8 grid gap-3 sm:grid-cols-3">
        {steps.map((step) => (
          <li key={step.href}>
            <Link
              href={step.href}
              className="group flex h-full flex-col border border-white/[0.08] bg-[#080a0c]/60 p-4 transition hover:border-[#4d9fff]/35"
            >
              <span className="text-[11px] font-medium tracking-[0.12em] text-[#4d9fff]">Step {step.n}</span>
              <span className="mt-2 text-sm font-medium text-white group-hover:text-[#4d9fff]">{step.title}</span>
              <span className="mt-1 text-xs leading-relaxed text-[#8a9099]">{step.detail}</span>
            </Link>
          </li>
        ))}
      </ol>
    </div>
  );
}

export function PlatformQuickLinkCard({
  href,
  name,
  detail,
  icon,
}: {
  href: string;
  name: string;
  detail: string;
  icon?: ReactNode;
}) {
  return (
    <Link
      href={href}
      className="wh-marketing-panel group flex items-center justify-between gap-4 p-5 transition hover:border-[#4d9fff]/25 sm:p-6"
    >
      <div className="min-w-0">
        <p className="text-sm font-medium text-white">{name}</p>
        <p className="mt-1 text-[13px] text-[#8a9099]">{detail}</p>
      </div>
      <span className="flex shrink-0 items-center gap-2 text-[#4d9fff] transition group-hover:translate-x-0.5">
        {icon}
        <span aria-hidden>→</span>
      </span>
    </Link>
  );
}

export const platformBtnPrimary =
  "inline-flex items-center justify-center bg-white px-7 py-3 text-sm font-medium tracking-wide text-[#080a0c] transition hover:bg-white/95 hover:shadow-[0_12px_40px_rgba(255,255,255,0.12)]";

export const platformBtnOutline =
  "inline-flex items-center justify-center border border-white/25 bg-transparent px-7 py-3 text-sm font-medium tracking-wide text-white transition hover:border-white/50 hover:bg-white/[0.04]";
