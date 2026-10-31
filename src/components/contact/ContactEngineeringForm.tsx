"use client";

import Image from "next/image";
import Link from "next/link";
import { useEffect, useMemo, useState } from "react";
import { useSearchParams } from "next/navigation";
import { getBrowserClient, maybeSignedIn } from "@/lib/supabase/lazy-client";
import { trackEvent } from "@/lib/analytics";
import { trackLead } from "@/lib/track-lead";
import { fetchWithCsrf } from "@/lib/csrf-client";
import { filterConfirmationBullets } from "@/lib/form-submit-messages";
import { FormSubmitEmailWarning } from "@/components/site/FormSubmitFeedback";
import { PRODUCTS, type Product } from "@/lib/products";
import {
  clearContactPrefill,
  readContactPrefill,
  clearCampSnapshot,
  readCampSnapshot,
  type CampSnapshot,
  type ContactPrefillPayload,
} from "@/lib/contact-prefill";
import { findProductInCatalog } from "@/lib/published-catalog";
import { usePublishedCatalog } from "@/lib/use-published-catalog";

const INQUIRY_TYPES = [
  "Capability Briefing",
  "Program Requirement",
  "Technical Exchange",
  "Demo Request",
  "Factory Tour",
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

/** Loose phone check: digits with spaces, +, -, dots, brackets and an optional extension. */
const PHONE_RE = /^\+?[0-9\s().-]{7,25}(\s*(ext\.?|x)\s*[0-9]{1,6})?$/i;

/** Inquiry types that arrange a meeting: they ask who is coming, from where and when. */
const VISIT_TYPES: readonly string[] = ["Capability Briefing", "Demo Request", "Factory Tour"];

const VISIT_LABEL: Record<string, string> = {
  "Capability Briefing": "Briefing details",
  "Demo Request": "Demo details",
  "Factory Tour": "Tour details",
};

/** Default for a visitor who arrives without an inquiry type in the link. */
const DEFAULT_INQUIRY = "Capability Briefing";

const inputClass =
  "mt-1.5 w-full border border-line-strong bg-ink px-3 py-3 text-[0.95rem] text-snow outline-none placeholder:text-muted/70 focus:border-signal focus:shadow-[0_0_0_3px_rgb(241_133_34/0.18)]";

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
  /** The system the inquiry is about (catalog slug), or "" when the visitor hasn't picked one. */
  system: string;
  /** Briefing, demo and tour details: sent inside the message, not as separate fields. */
  agency: string;
  base: string;
  dates: string;
  visitors: string;
};

/** The server accepts up to 2,000 characters for the message (MESSAGE_MAX_LENGTH in the contact route). */
const MESSAGE_MAX = 2000;

const initial: FormState = {
  full_name: "",
  organization: "",
  role: "",
  region: "",
  inquiry_type: DEFAULT_INQUIRY,
  program: "",
  subject: "",
  message: "",
  contact_method: "Email",
  phone: "",
  email: "",
  system: "",
  agency: "",
  base: "",
  dates: "",
  visitors: "",
};

/** The visit details as a short block for the message, or "" when there are none. */
function visitDetails(form: FormState): string {
  if (!VISIT_TYPES.includes(form.inquiry_type)) return "";
  const lines = [
    form.agency.trim() && `Service or agency: ${form.agency.trim()}`,
    form.base.trim() && `Base or location: ${form.base.trim()}`,
    form.dates.trim() && `Preferred dates: ${form.dates.trim()}`,
    form.inquiry_type === "Factory Tour" && form.visitors.trim() && `Visitors: ${form.visitors.trim()}`,
  ].filter(Boolean);
  return lines.length ? `${VISIT_LABEL[form.inquiry_type]}\n${lines.join("\n")}` : "";
}

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
  subjectParam = "",
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
      system: product?.slug ?? "",
    };
  }

  // A link from a product page without an inquiry type is a question about that product.
  const inquiry =
    inquiryParam && INQUIRY_TYPES.includes(inquiryParam as (typeof INQUIRY_TYPES)[number])
      ? inquiryParam
      : product
        ? "Program Requirement"
        : DEFAULT_INQUIRY;
  // The system is its own field now; Program is left for the buyer's own program or unit.
  const subject = product ? `Discussion: ${product.name}` : subjectParam.slice(0, 160);
  const message = deploymentNotes
    ? `Deployment context from planner:\n${deploymentNotes}`
    : "";
  return {
    inquiry_type: inquiry,
    subject,
    message,
    system: product?.slug ?? "",
  };
}

/** The line that names the system at the top of the message. */
function systemLine(system: Product | undefined): string {
  return system ? `System: ${system.name}${system.code && system.code !== system.name ? ` (${system.code})` : ""}` : "";
}

function ContactEngineeringFormInner({
  urlDefaults,
  catalog,
  planPreview,
}: {
  urlDefaults: Partial<FormState>;
  /** The systems the visitor can pick from. */
  catalog: Product[];
  /** The camp from the mission builder, when the visitor came from there. */
  planPreview?: CampSnapshot | null;
}) {
  const [step, setStep] = useState<1 | 2>(1);
  const [form, setForm] = useState(() => ({ ...initial, ...urlDefaults }));
  const [submitted, setSubmitted] = useState(false);
  const [submittedName, setSubmittedName] = useState("");
  const [submitWarning, setSubmitWarning] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Signed-in visitors get their name and email filled in. Anonymous visitors skip the Supabase bundle.
  useEffect(() => {
    if (!maybeSignedIn()) return;
    let cancelled = false;
    void getBrowserClient()
      .then((supabase) => supabase.auth.getUser())
      .then(({ data: { user } }) => {
        if (cancelled || !user) return;
        const meta = user.user_metadata as { full_name?: string } | undefined;
        const fromMeta = meta?.full_name?.trim();
        const fromEmail = user.email?.split("@")[0]?.replace(/[._]/g, " ") ?? "";
        setForm((f) => ({
          ...f,
          email: user.email ?? f.email,
          full_name: f.full_name || fromMeta || fromEmail,
        }));
      })
      .catch(() => undefined);
    return () => {
      cancelled = true;
    };
  }, []);

  function patch<K extends keyof FormState>(key: K, value: FormState[K]) {
    setForm((f) => ({ ...f, [key]: value }));
  }

  const product = form.system ? findProductInCatalog(catalog, form.system) : undefined;

  /** Changing the system also changes a subject we filled in ("Discussion: <system>"), not one they typed. */
  function chooseSystem(slug: string) {
    setForm((f) => {
      const before = f.system ? findProductInCatalog(catalog, f.system) : undefined;
      const after = slug ? findProductInCatalog(catalog, slug) : undefined;
      const autoSubject = !f.subject.trim() || (before && f.subject === `Discussion: ${before.name}`);
      return { ...f, system: slug, subject: autoSubject ? (after ? `Discussion: ${after.name}` : "") : f.subject };
    });
  }

  const visit = VISIT_TYPES.includes(form.inquiry_type);
  // The visit details and the system line share the message with the visitor's note.
  const details = visitDetails(form);
  const sysLine = systemLine(product);
  const messageMax = Math.max(0, MESSAGE_MAX - (details ? details.length + 2 : 0) - (sysLine ? sysLine.length + 2 : 0));
  const phoneNeeded = form.contact_method === "Phone";

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

    if (phoneNeeded && !PHONE_RE.test(form.phone.trim())) {
      setError(form.phone.trim() ? "Enter a phone number with digits, spaces, + or -, and an extension if you need one." : "Add a phone number, or choose another contact method.");
      return;
    }
    const message = [sysLine, form.message.trim(), details].filter(Boolean).join("\n\n");
    if (message.length > MESSAGE_MAX) {
      setError(`Shorten the message: with the ${VISIT_LABEL[form.inquiry_type]?.toLowerCase() ?? "details"} it can be up to ${MESSAGE_MAX} characters.`);
      return;
    }
    // The visit fields travel inside the message; the API takes the original fields only.
    const payload = {
      organization: form.organization,
      email: form.email,
      region: form.region,
      inquiry_type: form.inquiry_type,
      program: form.program,
      contact_method: form.contact_method,
      phone: phoneNeeded ? form.phone.trim() : "",
      full_name: form.full_name.trim() || "Not provided",
      role: form.role.trim() || "Not provided",
      subject:
        form.subject.trim() ||
        (product ? `Discussion: ${product.name}` : `Inquiry: ${form.inquiry_type}`),
      message: message || "Submitted with the short contact form; details to follow.",
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
        <p className="text-[0.9rem] font-semibold text-signal">Message sent</p>
        <h2 className="v2-h2 mt-4 max-w-lg text-snow">
          We&apos;ll be in touch, {firstName}.
        </h2>
        {submitWarning ? (
          <FormSubmitEmailWarning message={submitWarning} />
        ) : null}
        <ul className="mt-8 max-w-md space-y-3 text-left text-sm text-muted">
          {filterConfirmationBullets(WHAT_HAPPENS_NEXT, Boolean(submitWarning)).map((line) => (
            <li key={line} className="flex gap-3">
              <span className="mt-1.5 h-1 w-1 shrink-0 rounded-full bg-signal" aria-hidden />
              {line}
            </li>
          ))}
        </ul>
        <Link href="/" className={"v2-btn mt-10"}>
          Back to home
        </Link>
      </div>
    );
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-6 border border-line bg-hull p-6 sm:p-8">
      {planPreview ? (
        <figure className="border border-line">
          {/* A data URL made in this browser from the 3D camp; nothing to optimize. */}
          <Image
            src={planPreview.image}
            alt="Illustration of your camp from the mission builder"
            width={960}
            height={600}
            unoptimized
            className="aspect-[16/10] h-auto w-full object-cover"
          />
          <figcaption className="px-4 py-3 text-sm text-muted">
            <span className="text-white">Your camp from the mission builder.</span> A link to the plan is included in your
            message, so the expert sees the same camp.{" "}
            <a href={planPreview.link} target="_blank" rel="noopener" className="text-signal hover:underline">
              Open it in 3D (new tab)
            </a>
          </figcaption>
        </figure>
      ) : null}

      <div className="flex items-center gap-3" aria-label={`Step ${step} of 2`}>
        <span
          className={`flex h-8 w-8 items-center justify-center text-xs font-medium ${step === 1 ? "bg-snow text-ink" : "border border-white/20 text-muted"}`}
        >
          1
        </span>
        <span className="h-px flex-1 bg-white/10" aria-hidden />
        <span
          className={`flex h-8 w-8 items-center justify-center text-xs font-medium ${step === 2 ? "bg-snow text-ink" : "border border-white/20 text-muted"}`}
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
          <p className="text-sm text-muted">Step 1: the essentials, about 30 seconds</p>
          <label className="block text-[0.875rem] font-medium text-muted">
            Organization
            <input
              required
              className={inputClass}
              value={form.organization}
              onChange={(e) => patch("organization", e.target.value)}
            />
          </label>
          <label className="block text-[0.875rem] font-medium text-muted">
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
          <label className="block text-[0.875rem] font-medium text-muted">
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
          <label className="block text-[0.875rem] font-medium text-muted">
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
          <div>
            <label className="block text-[0.875rem] font-medium text-muted">
              System <span className="font-normal">(optional)</span>
              <select className={inputClass} value={form.system} onChange={(e) => chooseSystem(e.target.value)}>
                <option value="">Not sure yet</option>
                {catalog.map((p) => (
                  <option key={p.slug} value={p.slug}>
                    {p.name}
                  </option>
                ))}
              </select>
            </label>
            {product ? (
              <p className="mt-1.5 text-xs text-muted">
                Your message will name the {product.name}.{" "}
                <Link href={`/configurable-solutions/${product.slug}`} className="text-signal hover:underline">
                  View the {product.name} page
                </Link>
              </p>
            ) : null}
          </div>
          <button type="button" onClick={goToStep2} className={"v2-btn w-full"}>
            Continue
          </button>
        </>
      ) : (
        <>
          <p className="text-sm text-muted">Step 2: optional details, or send now</p>
          <div className="grid gap-6 sm:grid-cols-2">
            <label className="block text-[0.875rem] font-medium text-muted">
              Full name
              <input className={inputClass} value={form.full_name} onChange={(e) => patch("full_name", e.target.value)} />
            </label>
            <label className="block text-[0.875rem] font-medium text-muted">
              {visit ? "Rank or title" : "Role or title"}
              <input className={inputClass} value={form.role} onChange={(e) => patch("role", e.target.value)} />
            </label>
          </div>
          {visit ? (
            <fieldset className="space-y-6 border-t border-line pt-6">
              <legend className="float-left mb-4 w-full text-[0.95rem] font-semibold text-snow">
                {VISIT_LABEL[form.inquiry_type]}
              </legend>
              <div className="clear-left grid gap-6 sm:grid-cols-2">
                <label className="block text-[0.875rem] font-medium text-muted">
                  Service or agency
                  <input
                    maxLength={80}
                    className={inputClass}
                    value={form.agency}
                    onChange={(e) => patch("agency", e.target.value)}
                    placeholder="US Army, FEMA, NATO…"
                  />
                </label>
                <label className="block text-[0.875rem] font-medium text-muted">
                  Unit or program
                  <input maxLength={120} className={inputClass} value={form.program} onChange={(e) => patch("program", e.target.value)} />
                </label>
                <label className="block text-[0.875rem] font-medium text-muted">
                  {form.inquiry_type === "Factory Tour" ? "Where you're coming from" : "Base or location"}
                  <input maxLength={80} className={inputClass} value={form.base} onChange={(e) => patch("base", e.target.value)} />
                </label>
                <label className="block text-[0.875rem] font-medium text-muted">
                  Preferred dates
                  <input
                    maxLength={80}
                    className={inputClass}
                    value={form.dates}
                    onChange={(e) => patch("dates", e.target.value)}
                    placeholder="A week, a month or a range"
                  />
                </label>
                {form.inquiry_type === "Factory Tour" ? (
                  <label className="block text-[0.875rem] font-medium text-muted">
                    Number of visitors
                    <input
                      inputMode="numeric"
                      maxLength={3}
                      className={inputClass}
                      value={form.visitors}
                      onChange={(e) => patch("visitors", e.target.value.replace(/[^0-9]/g, ""))}
                    />
                  </label>
                ) : null}
              </div>
            </fieldset>
          ) : (
            <label className="block text-[0.875rem] font-medium text-muted">
              Program or unit
              <input className={inputClass} value={form.program} onChange={(e) => patch("program", e.target.value)} />
            </label>
          )}
          <label className="block text-[0.875rem] font-medium text-muted">
            Subject
            <input className={inputClass} value={form.subject} onChange={(e) => patch("subject", e.target.value)} />
          </label>
          <label className="block text-[0.875rem] font-medium text-muted">
            Message
            <textarea
              rows={5}
              maxLength={messageMax}
              aria-describedby="message-count"
              className={`${inputClass} min-h-[120px] resize-y`}
              value={form.message}
              onChange={(e) => patch("message", e.target.value)}
              placeholder={
                visit
                  ? "What you'd like to see or discuss, and anything we should prepare"
                  : "Mission, timeline, environment, or questions for our engineers"
              }
            />
            <p
              id="message-count"
              className={`mt-1.5 text-right text-xs ${form.message.length > messageMax * 0.9 ? "text-signal" : "text-muted"}`}
            >
              {form.message.length.toLocaleString("en-US")} of {messageMax.toLocaleString("en-US")} characters
            </p>
          </label>
          <fieldset>
            <legend className="text-[0.875rem] font-medium text-muted">
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
          {phoneNeeded ? (
            <label className="block text-[0.875rem] font-medium text-muted">
              Phone number
              <input
                required
                type="tel"
                autoComplete="tel"
                inputMode="tel"
                maxLength={40}
                className={inputClass}
                value={form.phone}
                onChange={(e) => patch("phone", e.target.value)}
                aria-describedby="phone-hint"
              />
              <span id="phone-hint" className="mt-1.5 block text-xs font-normal">
                Include the country code if you&apos;re outside the US, and an extension if you have one.
              </span>
            </label>
          ) : null}
          {form.contact_method === "Secure Message" ? (
            <p className="text-sm text-muted">
              We&apos;ll reply to your email first to agree a secure channel your organization accepts. Say which one in
              your message if you already know.
            </p>
          ) : null}
          <div className="flex flex-col gap-3 sm:flex-row">
            <button type="button" onClick={() => setStep(1)} className={"v2-btn v2-btn-ghost w-full sm:w-auto"}>
              Back
            </button>
            <button type="submit" disabled={loading} className={"v2-btn w-full flex-1 disabled:opacity-60"}>
              {loading ? "Sending…" : visit ? "Send request" : "Submit inquiry"}
            </button>
          </div>
        </>
      )}


    </form>
  );
}

/**
 * Server-rendered stand-in shown until the URL is read (Suspense fallback): the same form with no
 * prefill, so the page is complete in the HTML and nothing below it moves when the real one mounts.
 */
export function ContactEngineeringFormFallback() {
  // inert: it can't be focused or typed into, since the real form replaces it once scripts run.
  return (
    <div inert>
      <ContactEngineeringFormInner urlDefaults={urlFormDefaults("", undefined, "", null)} catalog={PRODUCTS} />
    </div>
  );
}

export function ContactEngineeringForm() {
  const searchParams = useSearchParams();
  const catalog = usePublishedCatalog();
  const handoff = searchParams.get("handoff")?.trim() ?? "";
  const systemSlug = searchParams.get("system")?.trim() ?? "";
  const inquiryParam = searchParams.get("inquiry")?.trim() ?? "";
  const deploymentParam = searchParams.get("deployment")?.trim() ?? "";
  const subjectParam = searchParams.get("subject")?.trim() ?? "";
  const [sessionPrefill] = useState<ContactPrefillPayload | null>(() => {
    if (handoff !== "camp-plan") return null;
    const payload = readContactPrefill();
    clearContactPrefill();
    return payload;
  });
  // The picture belongs to this hand-off only if the prefilled message carries its plan link (an
  // SOF planner hand-off, or an old picture from an interrupted one, doesn't).
  const [planPreview] = useState<CampSnapshot | null>(() => {
    if (handoff !== "camp-plan") return null;
    const snap = readCampSnapshot();
    return snap && sessionPrefill?.message?.includes(snap.link) ? snap : null;
  });
  useEffect(() => {
    if (handoff === "camp-plan") clearCampSnapshot();
  }, [handoff]);
  const resolvedSlug = sessionPrefill?.system?.trim() || systemSlug;
  const product = useMemo(
    () => (resolvedSlug ? findProductInCatalog(catalog, resolvedSlug) : undefined),
    [catalog, resolvedSlug],
  );
  const urlDefaults = useMemo(
    () => urlFormDefaults(inquiryParam, product, deploymentParam, sessionPrefill, subjectParam),
    [inquiryParam, product, deploymentParam, sessionPrefill, subjectParam],
  );

  return (
    <ContactEngineeringFormInner
      key={`${handoff}:${resolvedSlug}:${inquiryParam}:${deploymentParam}:${subjectParam}`}
      urlDefaults={urlDefaults}
      catalog={catalog}
      planPreview={planPreview}
    />
  );
}
