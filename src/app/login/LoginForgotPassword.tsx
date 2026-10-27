"use client";

import { useState } from "react";
import { fetchWithCsrf } from "@/lib/csrf-client";
import { btnMarketingOutline, btnMarketingPrimary } from "@/lib/cta-buttons";
import { FORGOT_PASSWORD_FOOTER, FORGOT_PASSWORD_SENT_NOTE } from "@/lib/email-systems";

export function LoginForgotPassword({ onBack }: { onBack: () => void }) {
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [sent, setSent] = useState(false);
  const [message, setMessage] = useState<string | null>(null);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError(null);

    setSubmitting(true);
    try {
      const res = await fetchWithCsrf("/api/auth/forgot-password", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({}),
      });
      const data = (await res.json()) as { ok?: boolean; message?: string; error?: string };

      if (!res.ok) {
        setError(data.error ?? "Could not send reset email. Try again later.");
        return;
      }

      setMessage(data.message ?? "Check your email for a reset link.");
      setSent(true);
    } catch {
      setError("Network error. Try again.");
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <>
      <h1 className="wh-marketing-display text-center text-2xl text-white">Reset team password</h1>
      <p className="mt-2 text-center text-sm text-[#8a9099]">
        Sends a reset link to the configured operator inbox.
      </p>

      {sent ? (
        <div className="mt-8 space-y-4">
          <p className="text-center text-sm leading-relaxed text-[#c5c9ce]">{message ?? FORGOT_PASSWORD_SENT_NOTE}</p>
          <p className="text-center text-xs leading-relaxed text-[#8a9099]">{FORGOT_PASSWORD_FOOTER}</p>
          <button type="button" onClick={onBack} className={`w-full justify-center ${btnMarketingPrimary}`}>
            Back to sign in
          </button>
        </div>
      ) : (
        <form className="mt-8 space-y-4" noValidate onSubmit={(e) => void handleSubmit(e)}>
          {error ? (
            <p className="wh-field-error">
              <span aria-hidden>⚠ </span>
              {error}
            </p>
          ) : null}
          <button
            type="submit"
            disabled={submitting}
            className={`w-full justify-center ${btnMarketingPrimary} disabled:opacity-60`}
          >
            {submitting ? "Sending…" : "Send reset link"}
          </button>
          <button type="button" onClick={onBack} className={`w-full justify-center ${btnMarketingOutline}`}>
            Back to sign in
          </button>
          <p className="text-center text-xs leading-relaxed text-[#8a9099]">{FORGOT_PASSWORD_FOOTER}</p>
        </form>
      )}
    </>
  );
}
