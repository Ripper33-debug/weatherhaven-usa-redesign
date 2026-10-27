"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import { WeatherhavenLogoLink } from "@/components/brand/WeatherhavenLogoLink";
import { btnMarketingOutline, btnMarketingPrimary } from "@/lib/cta-buttons";
import { fetchWithCsrf } from "@/lib/csrf-client";
import {
  isValidSofPinInput,
  SOF_REQUEST_ACCESS_PATH,
  SOF_SECURE_HOME,
} from "@/lib/sof-auth";
import { readSofLoginPrefs, writeSofLoginPrefs } from "@/lib/sof-login-prefs";

function getRedirectTo(search: string): string {
  const redirectTo = new URLSearchParams(search).get("redirectTo") || SOF_SECURE_HOME;
  if (!redirectTo.startsWith("/") || redirectTo.startsWith("//")) {
    return SOF_SECURE_HOME;
  }
  if (!redirectTo.startsWith("/sof-solutions/secure")) {
    return SOF_SECURE_HOME;
  }
  return redirectTo;
}

const NOT_APPROVED_MESSAGE =
  "Your account is signed in but SOF access is not approved yet. Request access below or wait for administrator approval.";

export function SofLoginForm({ notApproved = false }: { notApproved?: boolean }) {
  const [email, setEmail] = useState("");
  const [pin, setPin] = useState("");
  const [rememberEmail, setRememberEmail] = useState(true);
  const [rememberCode, setRememberCode] = useState(false);
  const [showForgotHelp, setShowForgotHelp] = useState(false);
  const [error, setError] = useState<string | null>(notApproved ? NOT_APPROVED_MESSAGE : null);
  const [submitting, setSubmitting] = useState(false);
  const [cardVisible, setCardVisible] = useState(false);

  useEffect(() => {
    requestAnimationFrame(() => setCardVisible(true));
    const saved = readSofLoginPrefs();
    if (!saved) return;
    // Restore device preferences after mount (localStorage is unavailable during SSR).
    /* eslint-disable react-hooks/set-state-in-effect -- one-time hydration from localStorage */
    if (saved.rememberEmail && saved.email) {
      setEmail(saved.email);
      setRememberEmail(true);
    }
    if (saved.rememberCode && saved.pin) {
      setPin(saved.pin);
      setRememberCode(true);
    }
    /* eslint-enable react-hooks/set-state-in-effect */
  }, []);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError(null);

    const trimmedEmail = email.trim();
    if (!trimmedEmail || !isValidSofPinInput(pin)) {
      setError("Enter your email and four-digit access code.");
      return;
    }

    setSubmitting(true);
    try {
      const res = await fetchWithCsrf("/api/sof-auth/sign-in", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email: trimmedEmail, pin }),
      });
      const data = (await res.json()) as { ok?: boolean; error?: string };

      if (!res.ok || !data.ok) {
        setError(
          data.error ??
            (res.status === 429
              ? "Too many sign-in attempts. Try again later."
              : "Invalid email or access code. Request access if you have not been approved yet."),
        );
        return;
      }

      writeSofLoginPrefs({
        email: trimmedEmail,
        pin,
        rememberEmail,
        rememberCode,
      });

      window.location.replace(getRedirectTo(window.location.search));
    } catch {
      setError("Sign-in failed. Please try again.");
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <>
      <WeatherhavenLogoLink
        href="/sof-solutions"
        centered
        linkClassName="mb-8 block"
        height={28}
        suffix="· SOF"
        ariaLabel="Weatherhaven SOF solutions home"
      />
      <div
        className={`wh-marketing-panel mx-auto w-full max-w-[420px] p-6 transition-all duration-500 sm:p-10 ${
          cardVisible ? "translate-y-0 opacity-100" : "translate-y-4 opacity-0"
        }`}
      >
      <p className="text-[11px] font-medium tracking-[0.14em] text-[#4d9fff] uppercase">Special Operations</p>
      <h1 className="font-serif mt-3 text-2xl text-white">Member sign-in</h1>
      <p className="mt-2 text-sm text-[#8a9099]">
        Use the four-digit code from your approval email with your registered address.
      </p>

      <form onSubmit={handleSubmit} className="mt-8 space-y-5">
        {error ? (
          <p className="border border-red-900/40 bg-red-950/30 px-4 py-3 text-sm text-red-200" role="alert">
            {error}
          </p>
        ) : null}

        <label className="block">
          <span className="text-xs font-medium uppercase tracking-wide text-[#8a9099]">Email</span>
          <input
            type="email"
            required
            autoComplete="username"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            className="mt-2 w-full border border-white/[0.12] bg-[#080a0c] px-3 py-3 text-sm text-white outline-none focus:border-[#4d9fff]/40"
          />
        </label>

        <label className="block">
          <span className="text-xs font-medium uppercase tracking-wide text-[#8a9099]">Four-digit access code</span>
          <input
            inputMode="numeric"
            pattern="\d{4}"
            maxLength={4}
            required
            autoComplete={rememberCode ? "current-password" : "one-time-code"}
            value={pin}
            onChange={(e) => setPin(e.target.value.replace(/\D/g, "").slice(0, 4))}
            className="mt-2 w-full border border-white/[0.12] bg-[#080a0c] px-3 py-3 font-mono text-lg tracking-[0.35em] text-white outline-none focus:border-[#4d9fff]/40"
            placeholder="••••"
          />
        </label>

        <div className="space-y-3 rounded border border-white/[0.08] bg-[#080a0c]/80 px-4 py-3">
          <label className="flex cursor-pointer items-start gap-3 text-sm text-[#8a9099]">
            <input
              type="checkbox"
              checked={rememberEmail}
              onChange={(e) => setRememberEmail(e.target.checked)}
              className="mt-0.5 accent-[#4d9fff]"
            />
            <span>Remember my email on this device</span>
          </label>
          <label className="flex cursor-pointer items-start gap-3 text-sm text-[#8a9099]">
            <input
              type="checkbox"
              checked={rememberCode}
              onChange={(e) => setRememberCode(e.target.checked)}
              className="mt-0.5 accent-[#4d9fff]"
            />
            <span>
              Remember my access code on this device
              <span className="mt-1 block text-xs text-[#6b7280]">Do not use on shared or public computers.</span>
            </span>
          </label>
        </div>

        <button type="submit" disabled={submitting} className={`w-full ${btnMarketingPrimary} disabled:opacity-60`}>
          {submitting ? "Signing in…" : "Enter secure section"}
        </button>

        <p className="text-center text-sm">
          <button
            type="button"
            onClick={() => setShowForgotHelp((v) => !v)}
            className="cursor-pointer border-0 bg-transparent p-0 text-[#4d9fff] hover:underline"
          >
            Forgot your access code?
          </button>
        </p>

        {showForgotHelp ? (
          <div className="border border-white/[0.08] bg-[#0d0f12] px-4 py-3 text-sm leading-relaxed text-[#8a9099]">
            <p className="text-white">Need a new code?</p>
            <p className="mt-2">
              Your administrator can issue a new four-digit code from the admin dashboard (Reset SOF code). If you
              have not been approved yet,{" "}
              <Link href={SOF_REQUEST_ACCESS_PATH} className="text-[#4d9fff] hover:underline">
                submit an access request
              </Link>
              .
            </p>
            <p className="mt-2 text-xs">
              For security we cannot display your code here. Check your approval email or contact your program lead.
            </p>
          </div>
        ) : null}
      </form>

      <div className="mt-8 flex flex-col gap-3 border-t border-white/[0.08] pt-6 text-center text-sm">
        <Link href={SOF_REQUEST_ACCESS_PATH} className={btnMarketingOutline}>
          Request access
        </Link>
        <Link href="/" className="text-[#8a9099] transition hover:text-white">
          ← Back to Weatherhaven
        </Link>
        <Link href="/login" className="text-xs text-[#8a9099] transition hover:text-[#4d9fff]">
          Staff / admin sign-in
        </Link>
      </div>
    </div>
    </>
  );
}
