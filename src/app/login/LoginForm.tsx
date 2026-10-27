"use client";

import { createClient } from "@/lib/supabase/client";
import { useEffect, useState } from "react";
import Link from "next/link";
import { useSearchParams } from "next/navigation";
import { HeroMediaBackground } from "@/components/hero/HeroMediaBackground";
import { WeatherhavenLogoLink } from "@/components/brand/WeatherhavenLogoLink";
import { LoginDemoRequest } from "@/app/login/LoginDemoRequest";
import { LoginForgotPassword } from "@/app/login/LoginForgotPassword";
import { btnMarketingOutline, btnMarketingPrimary } from "@/lib/cta-buttons";
import { fetchWithCsrf } from "@/lib/csrf-client";
import { resolvePostLoginPath, sanitizeRedirectTo } from "@/lib/auth/post-login";

type LoginView = "signin" | "demo" | "forgot";

async function fetchIsAdmin(): Promise<boolean> {
  try {
    const res = await fetch("/api/auth/session-role", { cache: "no-store" });
    if (!res.ok) return false;
    const data = (await res.json()) as { isAdmin?: boolean };
    return Boolean(data.isAdmin);
  } catch {
    return false;
  }
}

export function LoginForm() {
  const searchParams = useSearchParams();
  const resetOk = searchParams.get("reset") === "ok";
  const [view, setView] = useState<LoginView>("signin");
  const [password, setPassword] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [submitting, setSubmitting] = useState(false);
  const [failedAttempts, setFailedAttempts] = useState(0);
  const [cardVisible, setCardVisible] = useState(false);
  const [signedInAs, setSignedInAs] = useState<string | null>(null);
  const [signingOut, setSigningOut] = useState(false);

  useEffect(() => {
    requestAnimationFrame(() => setCardVisible(true));
  }, []);

  useEffect(() => {
    const supabase = createClient();
    void supabase.auth.getSession().then(async ({ data: { session } }) => {
      if (session?.user) {
        const isAdmin = await fetchIsAdmin();
        if (isAdmin) {
          const target = resolvePostLoginPath(sanitizeRedirectTo(window.location.search), { isAdmin });
          window.location.replace(target);
          return;
        }
        setSignedInAs(session.user.email ?? "another account");
      }
    });
  }, []);

  async function handleSignOut() {
    setSigningOut(true);
    setError(null);
    try {
      const supabase = createClient();
      await supabase.auth.signOut();
      setSignedInAs(null);
    } catch {
      setError("Could not sign out. Try again or clear site cookies.");
    } finally {
      setSigningOut(false);
    }
  }

  async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setError(null);

    if (!password) {
      setError("Please enter the team password.");
      return;
    }

    setSubmitting(true);

    try {
      const redirectTo = sanitizeRedirectTo(window.location.search);
      const res = await fetchWithCsrf("/api/auth/login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ password, redirectTo }),
      });
      const data = (await res.json()) as { ok?: boolean; redirectTo?: string; error?: string };

      if (!res.ok || !data.ok) {
        setFailedAttempts((n) => n + 1);
        setError(data.error ?? "Invalid password.");
        return;
      }

      window.location.href = data.redirectTo ?? "/";
    } catch (err) {
      const message = err instanceof Error ? err.message : "Something went wrong. Try again.";
      console.error("Login error:", err);
      setError(message);
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <main className="relative isolate flex min-h-dvh items-center justify-center overflow-hidden bg-[#080a0c] px-6 py-16">
      <HeroMediaBackground variant="home" shieldOverlay premium sequentialLoop />
      <div className="relative z-10 w-full max-w-[420px]">
        <WeatherhavenLogoLink href="/" centered linkClassName="mb-8 block" height={28} className="sm:h-8" />
        <div
          className={`border border-white/[0.08] bg-[#0d0f12]/95 p-6 backdrop-blur-md transition-all duration-500 ease-out sm:p-8 ${
            cardVisible ? "translate-y-0 opacity-100" : "translate-y-3 opacity-0"
          }`}
        >
          {view === "demo" ? (
            <LoginDemoRequest onBack={() => setView("signin")} />
          ) : view === "forgot" ? (
            <LoginForgotPassword onBack={() => setView("signin")} />
          ) : (
            <>
              <h1 className="wh-marketing-display text-center text-2xl text-white">Operator sign in</h1>
              <p className="mt-2 text-center text-sm text-[#8a9099]">
                Team password for admin dashboard access.
              </p>
              {resetOk ? (
                <p className="mt-4 rounded border border-emerald-500/30 bg-emerald-950/30 px-4 py-3 text-center text-sm text-emerald-200">
                  Password updated. Sign in with the new team password.
                </p>
              ) : null}
              {signedInAs ? (
                <div className="mt-4 rounded border border-amber-500/30 bg-amber-950/30 px-4 py-3 text-sm text-amber-100">
                  <p>
                    You are signed in as <strong className="font-medium text-white">{signedInAs}</strong>. Sign out to
                    use the operator account.
                  </p>
                  <button
                    type="button"
                    onClick={handleSignOut}
                    disabled={signingOut}
                    className="mt-3 cursor-pointer border-0 bg-transparent p-0 text-[#4d9fff] hover:underline disabled:opacity-60"
                  >
                    {signingOut ? "Signing out…" : "Sign out"}
                  </button>
                </div>
              ) : null}
              <form className="mt-8 space-y-4" noValidate onSubmit={handleSubmit}>
                <div>
                  <div className="mb-1.5 flex items-center justify-between gap-2">
                    <label htmlFor="login-password" className="wh-field-label mb-0">
                      Team password
                    </label>
                    <button
                      type="button"
                      onClick={() => {
                        setError(null);
                        setView("forgot");
                      }}
                      className="cursor-pointer border-0 bg-transparent p-0 text-xs text-[#4d9fff] hover:underline"
                    >
                      Forgot password?
                    </button>
                  </div>
                  <input
                    id="login-password"
                    name="password"
                    type="password"
                    autoComplete="current-password"
                    required
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    className="wh-input"
                    placeholder="Enter team password"
                  />
                </div>
                {error && (
                  <p className="wh-field-error">
                    <span aria-hidden>⚠ </span>
                    {error}
                  </p>
                )}
                {failedAttempts >= 3 && (
                  <p className="wh-field-error">
                    <span aria-hidden>⚠ </span>
                    Multiple failed attempts. Use{" "}
                    <button
                      type="button"
                      onClick={() => setView("forgot")}
                      className="cursor-pointer border-0 bg-transparent p-0 text-inherit underline"
                    >
                      Forgot password?
                    </button>{" "}
                    or contact your administrator. SOF members use{" "}
                    <Link href="/sof-solutions/login" className="underline">
                      member sign-in
                    </Link>
                    .
                  </p>
                )}
                <button
                  type="submit"
                  disabled={submitting}
                  className={`w-full justify-center ${btnMarketingPrimary} disabled:opacity-60`}
                >
                  {submitting ? "Signing in…" : "Sign in to admin"}
                </button>
              </form>
              <p className="mt-6 text-center text-sm leading-relaxed text-[#8a9099]">
                <button
                  type="button"
                  onClick={() => setView("demo")}
                  className="cursor-pointer border-0 bg-transparent p-0 text-[#4d9fff] hover:underline"
                >
                  Request a demo
                </button>
                <span className="text-white/20"> · </span>
                <Link href="/sof-solutions/request-access" className="text-[#4d9fff] hover:underline">
                  SOF program access
                </Link>
              </p>
              <p className="mt-4 text-center text-xs leading-relaxed text-[#8a9099]">
                One shared operator password for the team — no email required at sign-in.
                <br />
                SOF members:{" "}
                <Link href="/sof-solutions/login" className="text-[#4d9fff] hover:underline">
                  member sign-in
                </Link>
                .
              </p>
            </>
          )}
        </div>
        <p className="mt-6 text-center">
          <Link href="/" className={`${btnMarketingOutline} inline-flex text-xs`}>
            ← Back to site
          </Link>
        </p>
      </div>
    </main>
  );
}
