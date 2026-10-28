"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { startTransition, useEffect, useMemo, useState } from "react";
import { PageHero } from "@/components/site/PageHero";
import { MissionPlanningNotice } from "@/components/mission/MissionPlanningNotice";
import { FormSubmitEmailWarning } from "@/components/site/FormSubmitFeedback";
import { CampLayoutDiagram } from "@/components/mission/CampLayoutDiagram";
import { trackEvent } from "@/lib/analytics";
import { trackLead } from "@/lib/track-lead";
import { fetchWithCsrf } from "@/lib/csrf-client";
import { accessRequestEmailWarning } from "@/lib/form-submit-messages";
import {
  buildCampPlanContactPrefill,
  buildCampPlanMessage,
  campPlanMinimumReady,
  CAMP_ZONE_LABELS,
  generateCampPlan,
  MISSION_BUILDER_STORAGE_KEY,
  type CampPlan,
} from "@/lib/campPlanner";
import { storeContactPrefill } from "@/lib/contact-prefill";
import {
  buildCampPlanTextExport,
  campPlanExportFilename,
  downloadTextFile,
} from "@/lib/campPlanExport";
import { downloadCampPlanPdf } from "@/lib/campPlanPdf";
import { buildProfileSummary, type MissionBuilderState } from "@/lib/missionBuilder";
import type { Product } from "@/lib/products";
import { btnMarketingLink } from "@/lib/cta-buttons";

const inputClass =
  "mt-1.5 w-full border border-[rgba(255,255,255,0.12)] bg-[#101824] px-3 py-2.5 text-sm text-white outline-none focus:border-[rgba(255,255,255,0.35)]";

function readMissionFromStorage(): MissionBuilderState | null {
  if (typeof window === "undefined") return null;
  try {
    const raw = sessionStorage.getItem(MISSION_BUILDER_STORAGE_KEY);
    if (!raw) return null;
    const parsed = JSON.parse(raw) as MissionBuilderState;
    return campPlanMinimumReady(parsed) ? parsed : null;
  } catch {
    return null;
  }
}

export function CampPlanResults({ products }: { products: Product[] }) {
  const router = useRouter();
  const [mounted, setMounted] = useState(false);
  const [state, setState] = useState<MissionBuilderState | null>(null);
  const [contactName, setContactName] = useState("");
  const [contactOrg, setContactOrg] = useState("");
  const [contactEmail, setContactEmail] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [submitted, setSubmitted] = useState(false);
  const [submitWarning, setSubmitWarning] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const parsed = readMissionFromStorage();
    if (!parsed) {
      router.replace("/mission-solution-builder?form=full");
      return;
    }
    startTransition(() => {
      setState(parsed);
      setContactName(parsed.contactName ?? "");
      setContactOrg(parsed.contactOrg ?? "");
      setContactEmail(parsed.contactEmail ?? "");
      setMounted(true);
    });
  }, [router]);

  const plan: CampPlan | null = useMemo(
    () => (state ? generateCampPlan(state, products) : null),
    [state, products],
  );

  const summary = useMemo(() => (state ? buildProfileSummary(state) : []), [state]);

  function openContactHandoff() {
    if (!state || !plan) return;
    storeContactPrefill(buildCampPlanContactPrefill(state, plan));
    void trackEvent("click", "Camp package — discuss with engineering");
    router.push("/contact?handoff=camp-plan");
  }

  function downloadPdfExport() {
    if (!state || !plan) return;
    downloadCampPlanPdf(state, plan);
    void trackEvent("click", "Camp package — download PDF");
  }

  function downloadTextExport() {
    if (!state || !plan) return;
    const text = buildCampPlanTextExport(state, plan);
    downloadTextFile(campPlanExportFilename(plan.packageId, "txt"), text);
    void trackEvent("click", "Camp package — download summary");
  }

  async function handleSubmit() {
    if (!state || !plan) return;
    if (!contactName.trim() || !contactOrg.trim() || !contactEmail.trim()) {
      setError("Enter contact name, organization, and email to submit.");
      return;
    }
    setSubmitting(true);
    setError(null);
    const message = buildCampPlanMessage(state, plan);
    try {
      const res = await fetchWithCsrf("/api/request-access", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          name: contactName,
          organization: contactOrg,
          email: contactEmail,
          role: "Camp package planner",
          program: `${plan.packageId} · ${state.primaryFunction}`,
          message,
        }),
      });
      const data = (await res.json()) as {
        ok?: boolean;
        error?: string;
        reference?: string;
        emailSent?: boolean;
        emailSkipped?: boolean;
        warning?: string;
      };
      if (!res.ok || !data.ok) {
        setError(data.error ?? "Submission failed.");
        return;
      }
      setSubmitWarning(accessRequestEmailWarning(data));
      void trackEvent("submit", "Camp package submitted");
      trackLead("camp_planner", `Camp package — ${contactOrg}`, {
        program: plan.packageId,
        reference: data.reference,
      });
      setSubmitted(true);
    } catch {
      setError("Network error. Try again.");
    } finally {
      setSubmitting(false);
    }
  }

  if (!mounted || !state || !plan) {
    return (
      <div className="flex min-h-[40vh] items-center justify-center px-4 py-20">
        <p className="text-sm text-[#93a1b5]">Building your camp package…</p>
      </div>
    );
  }

  if (submitted) {
    return (
      <div className="flex min-h-[50vh] flex-col items-center justify-center px-4 py-20 text-center">
        <p className="wh-label text-[#f18522]">Package submitted</p>
        <p className="v2-tnum mt-2 text-[0.95rem] text-white">{plan.packageId}</p>
        <p className="mt-6 max-w-lg text-base text-white">
          Your camp layout and parts list were sent to programs. A Weatherhaven expert will follow up within 48 hours.
        </p>
        {submitWarning ? <FormSubmitEmailWarning message={submitWarning} /> : null}
        <Link href="/configurable-solutions" className={`${btnMarketingLink} mt-8 inline-flex`}>
          Browse shelter systems
        </Link>
      </div>
    );
  }

  return (
    <>
      <PageHero
        label="Camp package"
        title={plan.title}
        description={plan.subtitle}
      />
      <div className="v2-wrap">
        <MissionPlanningNotice />
      </div>

      <section className="bg-[#0a0f17] py-12">
        <div className="v2-wrap">
          <div className="mb-6 flex flex-wrap items-center justify-between gap-4">
            <p className="v2-tnum text-[0.85rem] text-muted">Package ID {plan.packageId}</p>
            <div className="flex flex-wrap items-center gap-3">
              <button type="button" onClick={downloadPdfExport} className={btnMarketingLink}>
                Download PDF
              </button>
              <button type="button" onClick={downloadTextExport} className={btnMarketingLink}>
                Download summary (.txt)
              </button>
              <Link href="/mission-solution-builder?form=full" className={btnMarketingLink}>
                ← Edit mission inputs
              </Link>
            </div>
          </div>

          <div className="grid gap-10 lg:grid-cols-2">
            <div className="border border-[rgba(255,255,255,0.08)] bg-[#101824] p-6">
              <p className="wh-label text-[#f18522]">Indicative camp layout</p>
              <p className="mt-2 text-sm text-[#93a1b5]">
                Zones show logical placement, not a surveyed site plan.
              </p>
              <div className="mt-6 overflow-x-auto">
                <CampLayoutDiagram key={plan.packageId} zones={plan.zones} labelFont="var(--font-wh)" />
              </div>
            </div>

            <div className="border border-[rgba(255,255,255,0.08)] bg-[#101824] p-6">
              <p className="wh-label text-[#f18522]">Program pricing</p>
              <p className="mt-4 text-sm text-[#93a1b5]">{plan.rom.label}</p>
              <p className="mt-3 text-sm text-[#93a1b5]">{plan.rom.disclaimer}</p>
              {summary.length > 0 ? (
                <ul className="mt-8 space-y-2 border-t border-white/[0.08] pt-6 text-sm">
                  {summary.slice(0, 6).map((row) => (
                    <li key={row.label} className="flex justify-between gap-4">
                      <span className="text-[#93a1b5]">{row.label}</span>
                      <span className="text-white">{row.value}</span>
                    </li>
                  ))}
                </ul>
              ) : null}
            </div>
          </div>

          <div className="mt-10 border border-[rgba(255,255,255,0.08)] bg-[#101824]">
            <div className="border-b border-white/[0.08] px-6 py-4">
              <p className="wh-label text-[#f18522]">Parts list</p>
              <p className="mt-1 text-sm text-[#93a1b5]">
                Quantities are planning placeholders until engineering exchange.
              </p>
            </div>
            <div className="overflow-x-auto">
              <table className="w-full min-w-[640px] border-collapse text-left text-sm">
                <thead>
                  <tr className="border-b border-white/[0.08] text-[0.85rem] font-medium text-[#93a1b5]">
                    <th className="px-6 py-3 font-medium">Qty</th>
                    <th className="px-6 py-3 font-medium">Code</th>
                    <th className="px-6 py-3 font-medium">System</th>
                    <th className="px-6 py-3 font-medium">Zone</th>
                    <th className="px-6 py-3 font-medium">Notes</th>
                  </tr>
                </thead>
                <tbody>
                  {plan.lineItems.map((line) => (
                    <tr key={`${line.slug}-${line.zoneId}`} className="border-b border-white/[0.06]">
                      <td className="px-6 py-3 tabular-nums text-white">{line.qty}</td>
                      <td className="px-6 py-3 font-medium text-signal">{line.code}</td>
                      <td className="px-6 py-3 text-white">
                        <Link
                          href={`/configurable-solutions/${line.slug}`}
                          className="hover:text-[#f18522]"
                        >
                          {line.name}
                        </Link>
                      </td>
                      <td className="px-6 py-3 text-[#93a1b5]">{CAMP_ZONE_LABELS[line.zoneId]}</td>
                      <td className="px-6 py-3 text-[#93a1b5]">{line.notes ?? "—"}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>

          <div className="mx-auto mt-12 max-w-lg border border-[rgba(255,255,255,0.08)] bg-[#101824] p-6">
            <p className="wh-label text-[#f18522]">Send package to programs</p>
            <div className="mt-4 space-y-4">
              <label className="block text-[0.9rem] font-medium text-[#93a1b5]">
                Contact name
                <input className={inputClass} value={contactName} onChange={(e) => setContactName(e.target.value)} />
              </label>
              <label className="block text-[0.9rem] font-medium text-[#93a1b5]">
                Organization
                <input className={inputClass} value={contactOrg} onChange={(e) => setContactOrg(e.target.value)} />
              </label>
              <label className="block text-[0.9rem] font-medium text-[#93a1b5]">
                Official email
                <input
                  type="email"
                  className={inputClass}
                  value={contactEmail}
                  onChange={(e) => setContactEmail(e.target.value)}
                />
              </label>
            </div>
            {error ? <p className="mt-4 text-sm text-red-400">{error}</p> : null}
            <button
              type="button"
              disabled={submitting}
              onClick={() => void handleSubmit()}
              className="v2-btn mt-6 w-full justify-center disabled:cursor-not-allowed disabled:opacity-60"
            >
              {submitting ? "Submitting…" : "Submit camp package"}
            </button>
            <button
              type="button"
              onClick={openContactHandoff}
              className={`${btnMarketingLink} mt-4 w-full justify-center`}
            >
              Discuss with an engineer
            </button>
          </div>
        </div>
      </section>
    </>
  );
}
