"use client";

import Link from "next/link";
import { useState } from "react";
import { trackEvent } from "@/lib/analytics";
import { trackLead } from "@/lib/track-lead";
import { fetchWithCsrf } from "@/lib/csrf-client";
import { btnMarketingPrimary } from "@/lib/cta-buttons";
import { accessRequestEmailWarning } from "@/lib/form-submit-messages";
import { FormSubmitEmailWarning } from "@/components/site/FormSubmitFeedback";

const initial = {
  name: "",
  organization: "",
  email: "",
  role: "",
  program: "",
  message: "",
};

const inputClass =
  "mt-1.5 w-full border border-[rgba(255,255,255,0.12)] bg-[#0d0f12] px-3 py-2.5 text-sm text-white outline-none placeholder:text-[#8a9099] transition-colors focus:border-[rgba(255,255,255,0.35)]";

const submitBtnClass = `w-full sm:w-auto ${btnMarketingPrimary} disabled:cursor-not-allowed`;

export function RequestAccessForm() {
  const [form, setForm] = useState(initial);
  const [submitted, setSubmitted] = useState(false);
  const [submittedName, setSubmittedName] = useState("");
  const [submitWarning, setSubmitWarning] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  function update<K extends keyof typeof initial>(key: K, value: (typeof initial)[K]) {
    setForm((f) => ({ ...f, [key]: value }));
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setLoading(true);
    setError(null);
    try {
      const res = await fetchWithCsrf("/api/request-access", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(form),
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
        setError(data.error ?? "Submission failed. Please verify required fields.");
        return;
      }
      setSubmitWarning(accessRequestEmailWarning(data));
      void trackEvent("submit", "Request Access form submitted");
      trackLead("access_request", `Request access — ${form.organization}`, { program: form.program });
      setSubmittedName(form.name.trim());
      setSubmitted(true);
    } catch {
      setError("Network error. Confirm connectivity and retry.");
    } finally {
      setLoading(false);
    }
  }

  if (submitted) {
    const firstName = submittedName.split(/\s+/)[0] || "there";
    return (
      <div className="flex flex-col items-center justify-center px-6 py-16 text-center sm:px-8 sm:py-20">
        <p className="wh-marketing-eyebrow text-[#4d9fff]">Request received</p>
        <h2 className="wh-marketing-display mt-6 max-w-lg text-2xl text-white sm:text-3xl">
          Thank you for your interest, {firstName}.
        </h2>
        <p className="mt-6 max-w-lg text-base leading-relaxed text-[#8a9099]">
          A member of our SOF solutions team will review your submission and contact you within 48 hours.
          {!submitWarning ? " Check your email for a confirmation of your request." : ""}
        </p>
        {submitWarning ? <FormSubmitEmailWarning message={submitWarning} /> : null}
        <p className="mt-4 max-w-lg text-sm text-[#8a9099]">
          Technical exchanges are matched to clearance and program status prior to disclosure.
        </p>
        <Link
          href="/login"
          className="mt-10 inline-flex min-h-11 items-center justify-center border border-white bg-white px-8 py-3 text-[11px] font-semibold uppercase tracking-[0.18em] text-black no-underline transition hover:bg-[rgba(255,255,255,0.85)]"
        >
          Return to login
        </Link>
      </div>
    );
  }

  return (
    <div className="relative overflow-hidden bg-[#0d0f12]">
      <div className="px-6 py-5 sm:px-8 sm:py-6">
        <div className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
          <div>
            <p className="wh-marketing-label">Weatherhaven Resource Inc.</p>
            <h2 className="wh-marketing-display mt-2 text-xl text-white sm:text-2xl">
              Request access & lead capture
            </h2>
            <p className="mt-2 max-w-2xl text-sm leading-relaxed text-[#8a9099]">
              Official contact information only. Submissions are saved to the SOF lead register with pipeline status for
              program follow-up. Controlled disclosures and technical exchanges route here—not general marketing.
            </p>
          </div>
          <dl className="grid shrink-0 gap-1 border border-white/[0.08] bg-[#080a0c] px-4 py-3 font-mono text-[10px] uppercase tracking-wider text-[#8a9099] sm:text-left">
            <div className="flex justify-between gap-6 sm:flex-col sm:gap-1">
              <dt>Form</dt>
              <dd className="text-white">WH-PR-01</dd>
            </div>
            <div className="flex justify-between gap-6 sm:flex-col sm:gap-1">
              <dt>Revision</dt>
              <dd className="text-white">A</dd>
            </div>
            <div className="flex justify-between gap-6 sm:flex-col sm:gap-1">
              <dt>Medium</dt>
              <dd className="text-white">HTTPS</dd>
            </div>
          </dl>
        </div>
      </div>

      <form onSubmit={handleSubmit} className="space-y-6 px-6 py-8 sm:px-8 sm:py-10">
        {error && (
          <div
            className="border border-red-900/50 bg-red-950/30 px-4 py-3 text-sm text-red-200"
            role="alert"
          >
            {error}
          </div>
        )}
        <div className="grid gap-6 sm:grid-cols-2">
          <div>
            <label htmlFor="ra-name" className="text-xs font-medium uppercase tracking-wide text-[#8a9099]">
              Full name
            </label>
            <input
              id="ra-name"
              required
              className={inputClass}
              value={form.name}
              onChange={(e) => update("name", e.target.value)}
              autoComplete="name"
            />
          </div>
          <div>
            <label htmlFor="ra-org" className="text-xs font-medium uppercase tracking-wide text-[#8a9099]">
              Organization
            </label>
            <input
              id="ra-org"
              required
              className={inputClass}
              value={form.organization}
              onChange={(e) => update("organization", e.target.value)}
              autoComplete="organization"
            />
          </div>
        </div>
        <div className="grid gap-6 sm:grid-cols-2">
          <div>
            <label htmlFor="ra-email" className="text-xs font-medium uppercase tracking-wide text-[#8a9099]">
              Official email
            </label>
            <input
              id="ra-email"
              type="email"
              required
              className={inputClass}
              value={form.email}
              onChange={(e) => update("email", e.target.value)}
              autoComplete="email"
            />
          </div>
          <div>
            <label htmlFor="ra-role" className="text-xs font-medium uppercase tracking-wide text-[#8a9099]">
              Role / title
            </label>
            <input
              id="ra-role"
              required
              className={inputClass}
              value={form.role}
              onChange={(e) => update("role", e.target.value)}
            />
          </div>
        </div>
        <div>
          <label htmlFor="ra-program" className="text-xs font-medium uppercase tracking-wide text-[#8a9099]">
            Program or unit (optional)
          </label>
          <input
            id="ra-program"
            className={inputClass}
            value={form.program}
            onChange={(e) => update("program", e.target.value)}
          />
        </div>
        <div>
          <label htmlFor="ra-message" className="text-xs font-medium uppercase tracking-wide text-[#8a9099]">
            Requirements summary
          </label>
          <textarea
            id="ra-message"
            rows={4}
            className={`${inputClass} min-h-[108px] resize-y`}
            value={form.message}
            onChange={(e) => update("message", e.target.value)}
            title="Theater, timeline, footprint, and integration constraints (unclassified)."
          />
        </div>
        <div className="border border-white/[0.08] bg-[#080a0c] p-4">
          <p className="text-[11px] leading-relaxed text-[#8a9099]">
            By submitting, you confirm this request contains no classified material. Export-controlled discussions
            require program alignment; a representative may request additional vetting before technical data is shared.
          </p>
        </div>
        <button type="submit" disabled={loading} className={submitBtnClass}>
          {loading ? "Submitting…" : "Submit request"}
        </button>
      </form>
    </div>
  );
}
