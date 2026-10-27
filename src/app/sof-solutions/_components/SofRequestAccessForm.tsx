"use client";

import Link from "next/link";
import { useState } from "react";
import { trackEvent } from "@/lib/analytics";
import { trackLead } from "@/lib/track-lead";
import { fetchWithCsrf } from "@/lib/csrf-client";
import { btnMarketingPrimary } from "@/lib/cta-buttons";
import { SOF_LOGIN_PATH } from "@/lib/sof-auth";

const inputClass =
  "mt-2 w-full border border-white/[0.12] bg-[#0d0f12] px-3 py-3 text-sm text-white outline-none placeholder:text-[#8a9099] focus:border-[#4d9fff]/40";

const NOT_APPROVED_HINT =
  "Submit a request below. Once an administrator approves your email, you will receive a four-digit code.";

export function SofRequestAccessForm({ notApproved = false }: { notApproved?: boolean }) {
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [submitted, setSubmitted] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(notApproved ? NOT_APPROVED_HINT : null);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setLoading(true);
    setError(null);
    try {
      const res = await fetchWithCsrf("/api/sof-request-access", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ name: name.trim(), email: email.trim() }),
      });
      const data = (await res.json()) as { ok?: boolean; error?: string; details?: string };
      if (!res.ok || !data.ok) {
        setError(data.error ?? "Submission failed.");
        if (process.env.NODE_ENV !== "production" && data.details) {
          console.error("SOF request access failed:", data.details);
        }
        return;
      }
      void trackEvent("submit", "SOF access request submitted");
      trackLead("sof_request", `SOF access — ${email.trim()}`, { name: name.trim() });
      setSubmitted(true);
    } catch {
      setError("Network error. Please try again.");
    } finally {
      setLoading(false);
    }
  }

  if (submitted) {
    const first = name.trim().split(/\s+/)[0] || "there";
    return (
      <div className="wh-marketing-panel px-6 py-12 text-center sm:px-10 sm:py-14">
        <p className="text-[11px] font-medium tracking-[0.14em] text-[#4d9fff] uppercase">Request received</p>
        <h2 className="font-serif mt-4 text-2xl text-white sm:text-3xl">Thank you, {first}.</h2>
        <p className="mx-auto mt-4 max-w-md text-sm leading-relaxed text-[#8a9099]">
          Our team will review your request. If approved, you will receive a <strong className="text-white">four-digit
          access code</strong> at {email.trim()} to sign in to the secure Special Forces section.
        </p>
        <Link href={SOF_LOGIN_PATH} className={`mt-8 inline-flex ${btnMarketingPrimary}`}>
          Already have a code? Sign in
        </Link>
      </div>
    );
  }

  return (
    <form onSubmit={handleSubmit} className="wh-marketing-panel px-6 py-8 sm:px-10 sm:py-10">
      <p className="text-[11px] font-medium tracking-[0.14em] text-[#4d9fff] uppercase">Secure section</p>
      <h2 className="font-serif mt-3 text-2xl text-white">Request SOF access</h2>
      <p className="mt-3 text-sm leading-relaxed text-[#8a9099]">
        Submit your name and official email. Administrators are notified immediately. Approved users receive a
        four-digit code for future sign-in.
      </p>

      {error ? (
        <p className="mt-6 border border-red-900/40 bg-red-950/30 px-4 py-3 text-sm text-red-200" role="alert">
          {error}
        </p>
      ) : null}

      <div className="mt-8 space-y-5">
        <label className="block">
          <span className="text-xs font-medium uppercase tracking-wide text-[#8a9099]">Full name</span>
          <input
            required
            className={inputClass}
            value={name}
            onChange={(e) => setName(e.target.value)}
            autoComplete="name"
          />
        </label>
        <label className="block">
          <span className="text-xs font-medium uppercase tracking-wide text-[#8a9099]">Official email</span>
          <input
            type="email"
            required
            className={inputClass}
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            autoComplete="email"
          />
        </label>
      </div>

      <button type="submit" disabled={loading} className={`mt-8 w-full sm:w-auto ${btnMarketingPrimary} disabled:opacity-60`}>
        {loading ? "Submitting…" : "Submit access request"}
      </button>

      <p className="mt-6 text-[11px] leading-relaxed text-[#8a9099]">
        Unclassified submissions only. Export-controlled discussions require program alignment.
      </p>
      <p className="mt-4 text-center text-xs text-[#8a9099]">
        <Link href="/login" className="text-[#4d9fff] hover:underline">
          Staff / admin sign-in
        </Link>
      </p>
    </form>
  );
}
