import type { Metadata } from "next";
import { notFound } from "next/navigation";

export const dynamic = "force-dynamic";

export const metadata: Metadata = {
  title: "Program intelligence (internal)",
  robots: { index: false, follow: false },
};

/**
 * Internal coordination surface only. Set WH_ENABLE_INTERNAL_INTEL=true to enable.
 * Competitor-specific notes and sensitive market intelligence must never be hosted on the public site.
 */
export default function ProgramIntelligencePage() {
  if (process.env.WH_ENABLE_INTERNAL_INTEL !== "true") {
    notFound();
  }

  return (
    <section className="border-b border-white/[0.06] bg-zinc-950">
      <div className="mx-auto max-w-3xl px-4 py-16 sm:px-6 lg:px-10">
        <h1 className="font-display text-2xl font-semibold tracking-tight text-zinc-50">Internal program coordination</h1>
        <p className="mt-4 text-sm leading-relaxed text-zinc-400">
          Ongoing competitor analysis and reporting referenced in the internship agreement are maintained in controlled,
          non-public systems (CRM, secure share, or program office tooling). This route exists only as a placeholder for
          authorized workflows—no competitor-specific data, pricing intelligence, or sensitive commentary is stored or
          displayed here.
        </p>
        <p className="mt-4 text-sm leading-relaxed text-zinc-500">
          Disable public discovery by default: the page returns 404 unless{" "}
          <span className="font-mono text-zinc-400">WH_ENABLE_INTERNAL_INTEL</span> is explicitly enabled in the deployment
          environment.
        </p>
      </div>
    </section>
  );
}
