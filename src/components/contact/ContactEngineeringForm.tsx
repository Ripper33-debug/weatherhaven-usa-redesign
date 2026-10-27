"use client";

import Link from "next/link";
import { useEffect, useMemo, useState } from "react";
import { useSearchParams } from "next/navigation";
import { createClient } from "@/lib/supabase/client";
import { trackEvent } from "@/lib/analytics";
import { trackLead } from "@/lib/track-lead";
import { fetchWithCsrf } from "@/lib/csrf-client";
import { btnMarketingOutline, btnMarketingPrimary } from "@/lib/cta-buttons";
import { filterConfirmationBullets } from "@/lib/form-submit-messages";
import { FormSubmitEmailWarning } from "@/components/site/FormSubmitFeedback";
import type { Product } from "@/lib/products";
import {
  clearContactPrefill,
  readContactPrefill,
  type ContactPrefillPayload,
} from "@/lib/contact-prefill";
import { findProductInCatalog } from "@/lib/published-catalog";
import { usePublishedCatalog } from "@/lib/use-published-catalog";

const INQUIRY_TYPES = [
  "Program Requirement",
  "Technical Exchange",
  "Demo Request",
  "Program Availability",
  "Existing Program Support",
  "Other",
] as const;

export const CONTACT_REGIONS = [
  "North America",
  "South America",
  "Europe / UK",
  "Middle East / Africa",
  "Asia Pacific",
  "Other",
] as const;

const CONTACT_METHODS = ["Email", "Phone", "Secure Message"] as const;

const inputClass =
  "mt-1.5 w-full border border-[rgba(255,255,255,0.12)] bg-[#0d0f12] px-3 py-2.5 text-sm text-white outline-none placeholder:text-[#8a9099] focus:border-[rgba(255,255,255,0.35)]";

type FormState = {
  full_name: string;
  organization: string;
  role: string;
  region: string;
  inquiry_type: string;
  program: string;
  subject: string;
  message: string;
  contact_method: string;
  phone: string;
  email: string;
};

const initial: FormState = {
  full_name: "",
  organization: "",
  role: "",
  region: "",
  inquiry_type: "Program Requirement",
  program: "",
  subject: "",
  message: "",
  contact_method: "Email",
  phone: "",
  email: "",
};

const WHAT_HAPPENS_NEXT = [
  "A Weatherhaven expert reviews your inquiry within one business day.",
  "You receive a confirmation email at the address you provide.",
  "A member of our team responds within 48 hours with next steps matched to your program.",
] as const;

function urlFormDefaults(
  inquiryParam: string,
  product: Product | undefined,
  deploymentNotes: string,
  prefill: ContactPrefillPayload | null,
): Partial<FormState> {
  if (prefill) {
    const inquiry =
      prefill.inquiry_type &&
      INQUIRY_TYPES.includes(prefill.inquiry_type as (typeof INQUIRY_TYPES)[number])
        ? prefill.inquiry_type
        : "Program Requirement";
    return {
      inquiry_type: inquiry,
      program: prefill.program ?? "",
      subject: prefill.subject ?? "",
      message: prefill.message ?? "",
    };
  }

  const inquiry =
    inquiryParam && INQUIRY_TYPES.includes(inquiryParam as (typeof INQUIRY_TYPES)[number])
      ? inquiryParam
      : "Program Requirement";
  const program = product ? `${product.name} (${product.code})` : "";
  const subject = product ? `Discussion: ${product.name}` : "";
  const message = deploymentNotes
    ? `Deployment context from planner:\n${deploymentNotes}`
    : "";
  return {
    inquiry_type: inquiry,
    program,
    subject,
    message,
  };
}

function ContactEngineeringFormInner({
  urlDefaults,
  product,
}: {
  urlDefaults: Partial<FormState>;
  product?: Product;
}) {
  const [step, setStep] = useState<1 | 2>(1);
  const [form, setForm] = useState(() => ({ ...initial, ...urlDefaults }));
  const [submitted, setSubmitted] = useState(false);
  const [submittedName, setSubmittedName] = useState("");
  const [submitWarning, setSubmitWarning] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const supabase = createClient();
    void supabase.auth.getUser().then(({ data: { user } }) => {
      if (!user) return;
      const meta = user.user_metadata as { full_name?: string } | undefined;
      const fromMeta = meta?.full_name?.trim();
      const fromEmail = user.email?.split("@")[0]?.replace(/[._]/g, " ") ?? "";
      setForm((f) => ({
        ...f,
        email: user.email ?? f.email,
        full_name: f.full_name || fromMeta || fromEmail,
      }));
    });
  }, []);

  function patch<K extends keyof FormState>(key: K, value: FormState[K]) {
    setForm((f) => ({ ...f, [key]: value }));
  }

  function validateStep1() {
    if (!form.organization.trim() || !form.email.trim() || !form.inquiry_type.trim() || !form.region.trim()) {
      setError("Organization, email, region, and inquiry type are required.");
      return false;
    }
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(form.email.trim())) {
      setError("Enter a valid email address.");
      return false;
    }
    setError(null);
    return true;
  }

  function goToStep2() {
    if (!validateStep1()) return;
    setStep(2);
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!validateStep1()) {
      setStep(1);
      return;
    }

    const payload = {
      ...form,
      full_name: form.full_name.trim() || "Not provided",
      role: form.role.trim() || "Not provided",
      subject:
        form.subject.trim() ||
        (product ? `Discussion: ${product.name}` : `Inquiry: ${form.inquiry_type}`),
      message: form.message.trim() || "Submitted via short contact form — details to follow.",
    };

    setLoading(true);
    setError(null);
    try {
      const res = await fetchWithCsrf("/api/contact-leads", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });
      const data = (await res.json()) as { success?: boolean; error?: string; warning?: string };
      if (!res.ok || !data.success) {
        setError(data.error ?? "Submission failed. Please try again.");
        return;
      }
      void trackEvent("submit", `Engineering inquiry — ${form.inquiry_type}`);
      trackLead(
        form.inquiry_type === "Demo Request" ? "demo_request" : "inquiry_submit",
        `${form.inquiry_type} — ${form.organization}`,
        { program: form.program },
      );
      setSubmittedName(payload.full_name);
      setSubmitWarning(data.warning ?? null);
      setSubmitted(true);
    } catch {
      setError("Network error. Confirm connectivity and retry.");
    } finally {
      setLoading(false);
    }
  }

  if (submitted) {
    const firstName = submittedName !== "Not provided" ? submittedName.split(/\s+/)[0] : "there";
    return (
      <div className="flex flex-col items-center justify-center px-6 py-16 text-center sm:px-8 sm:py-20">
        <p className="wh-marketing-eyebrow text-[#4d9fff]">Message sent</p>
        <h2 className="wh-marketing-display mt-6 max-w-lg text-2xl text-white sm:text-3xl">
          We&apos;ll be in touch, {firstName}.
        </h2>
        {submitWarning ? (
          <FormSubmitEmailWarning message={submitWarning} />
        ) : null}
        <ul className="mt-8 max-w-md space-y-3 text-left text-sm text-[#8a9099]">
          {filterConfirmationBullets(WHAT_HAPPENS_NEXT, Boolean(submitWarning)).map((line) => (
            <li key={line} className="flex gap-3">
              <span className="mt-1.5 h-1 w-1 shrink-0 rounded-full bg-[#4d9fff]" aria-hidden />
              {line}
            </li>
          ))}
        </ul>
        <Link href="/" className={`mt-10 inline-flex no-underline ${btnMarketingPrimary}`}>
          Back to home
        </Link>
      </div>
    );
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-6 border border-white/[0.08] bg-[#0d0f12] p-6 sm:p-8">
      {product && (
        <div className="border border-[#4d9fff]/25 bg-[#4d9fff]/[0.06] px-4 py-3 text-sm text-[#8a9099]">
          <span className="text-white">Inquiry about {product.name}</span> — we&apos;ve prefilled context from
          the system page.{" "}
          <Link href={`/configurable-solutions/${product.slug}`} className="text-[#4d9fff] hover:underline">
            View system
          </Link>
        </div>
      )}

      <div className="flex items-center gap-3" aria-label={`Step ${step} of 2`}>
        <span
          className={`flex h-8 w-8 items-center justify-center text-xs font-medium ${step === 1 ? "bg-white text-[#080a0c]" : "border border-white/20 text-[#8a9099]"}`}
        >
          1
        </span>
        <span className="h-px flex-1 bg-white/10" aria-hidden />
        <span
          className={`flex h-8 w-8 items-center justify-center text-xs font-medium ${step === 2 ? "bg-white text-[#080a0c]" : "border border-white/20 text-[#8a9099]"}`}
        >
          2
        </span>
      </div>

      {error && (
        <div className="border border-red-900/50 bg-red-950/30 px-4 py-3 text-sm text-red-200" role="alert">
          {error}
        </div>
      )}

      {step === 1 ? (
        <>
          <p className="text-sm text-[#8a9099]">Step 1 — essentials (about 30 seconds)</p>
          <label className="block text-xs font-medium uppercase tracking-wide text-[#8a9099]">
            Organization
            <input
              required
              className={inputClass}
              value={form.organization}
              onChange={(e) => patch("organization", e.target.value)}
            />
          </label>
          <label className="block text-xs font-medium uppercase tracking-wide text-[#8a9099]">
            Work email
            <input
              required
              type="email"
              autoComplete="email"
              className={inputClass}
              value={form.email}
              onChange={(e) => patch("email", e.target.value)}
            />
          </label>
          <label className="block text-xs font-medium uppercase tracking-wide text-[#8a9099]">
            Your region
            <select
              required
              className={inputClass}
              value={form.region}
              onChange={(e) => patch("region", e.target.value)}
            >
              <option value="">Select…</option>
              {CONTACT_REGIONS.map((region) => (
                <option key={region} value={region}>
                  {region}
                </option>
              ))}
            </select>
          </label>
          <label className="block text-xs font-medium uppercase tracking-wide text-[#8a9099]">
            Inquiry type
            <select
              required
              className={inputClass}
              value={form.inquiry_type}
              onChange={(e) => patch("inquiry_type", e.target.value)}
            >
              {INQUIRY_TYPES.map((t) => (
                <option key={t} value={t}>
                  {t}
                </option>
              ))}
            </select>
          </label>
          <button type="button" onClick={goToStep2} className={`w-full ${btnMarketingPrimary}`}>
            Continue
          </button>
        </>
      ) : (
        <>
          <p className="text-sm text-[#8a9099]">Step 2 — optional details (or send now)</p>
          <div className="grid gap-6 sm:grid-cols-2">
            <label className="block text-xs font-medium uppercase tracking-wide text-[#8a9099]">
              Full name
              <input className={inputClass} value={form.full_name} onChange={(e) => patch("full_name", e.target.value)} />
            </label>
            <label className="block text-xs font-medium uppercase tracking-wide text-[#8a9099]">
              Role / title
              <input className={inputClass} value={form.role} onChange={(e) => patch("role", e.target.value)} />
            </label>
          </div>
          <label className="block text-xs font-medium uppercase tracking-wide text-[#8a9099]">
            Program or unit
            <input className={inputClass} value={form.program} onChange={(e) => patch("program", e.target.value)} />
          </label>
          <label className="block text-xs font-medium uppercase tracking-wide text-[#8a9099]">
            Subject
            <input className={inputClass} value={form.subject} onChange={(e) => patch("subject", e.target.value)} />
          </label>
          <label className="block text-xs font-medium uppercase tracking-wide text-[#8a9099]">
            Message
            <textarea
              rows={5}
              className={`${inputClass} min-h-[120px] resize-y`}
              value={form.message}
              onChange={(e) => patch("message", e.target.value)}
              placeholder="Mission, timeline, environment, or questions for our engineers…"
            />
          </label>
          <fieldset>
            <legend className="text-xs font-medium uppercase tracking-wide text-[#8a9099]">
              Preferred contact method
            </legend>
            <div className="mt-3 flex flex-wrap gap-6">
              {CONTACT_METHODS.map((method) => (
                <label key={method} className="flex items-center gap-2 text-sm text-white">
                  <input
                    type="radio"
                    name="contact_method"
                    value={method}
                    checked={form.contact_method === method}
                    onChange={() => patch("contact_method", method)}
                    className="h-4 w-4"
                  />
                  {method}
                </label>
              ))}
            </div>
          </fieldset>
          {form.contact_method === "Phone" && (
            <label className="block text-xs font-medium uppercase tracking-wide text-[#8a9099]">
              Phone number
              <input
                type="tel"
                className={inputClass}
                value={form.phone}
                onChange={(e) => patch("phone", e.target.value)}
              />
            </label>
          )}
          <div className="flex flex-col gap-3 sm:flex-row">
            <button type="button" onClick={() => setStep(1)} className={`${btnMarketingOutline} w-full sm:w-auto`}>
              Back
            </button>
            <button type="submit" disabled={loading} className={`${btnMarketingPrimary} w-full flex-1 disabled:opacity-60`}>
              {loading ? "Sending…" : "Submit inquiry"}
            </button>
          </div>
        </>
      )}

      <ul className="border-t border-white/[0.06] pt-6 text-xs leading-relaxed text-[#8a9099]">
        {WHAT_HAPPENS_NEXT.map((line) => (
          <li key={line} className="mt-2 first:mt-0">
            {line}
          </li>
        ))}
      </ul>
    </form>
  );
}

export function ContactEngineeringForm() {
  const searchParams = useSearchParams();
  const catalog = usePublishedCatalog();
  const handoff = searchParams.get("handoff")?.trim() ?? "";
  const systemSlug = searchParams.get("system")?.trim() ?? "";
  const inquiryParam = searchParams.get("inquiry")?.trim() ?? "";
  const deploymentParam = searchParams.get("deployment")?.trim() ?? "";
  const [sessionPrefill] = useState<ContactPrefillPayload | null>(() => {
    if (handoff !== "camp-plan") return null;
    const payload = readContactPrefill();
    clearContactPrefill();
    return payload;
  });
  const resolvedSlug = sessionPrefill?.system?.trim() || systemSlug;
  const product = useMemo(
    () => (resolvedSlug ? findProductInCatalog(catalog, resolvedSlug) : undefined),
    [catalog, resolvedSlug],
  );
  const urlDefaults = useMemo(
    () => urlFormDefaults(inquiryParam, product, deploymentParam, sessionPrefill),
    [inquiryParam, product, deploymentParam, sessionPrefill],
  );

  return (
    <ContactEngineeringFormInner
      key={`${handoff}:${resolvedSlug}:${inquiryParam}:${deploymentParam}`}
      urlDefaults={urlDefaults}
      product={product}
    />
  );
}
