"use client";

import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import { useEffect, useState } from "react";
import { parseRecoveryHash } from "@/lib/auth/recovery-session";
import { createClient } from "@/lib/supabase/client";
import { btnMarketingPrimary } from "@/lib/cta-buttons";

const inputClass =
  "mt-1.5 w-full border border-[rgba(255,255,255,0.12)] bg-[#0d0f12] px-3 py-2.5 text-sm text-white outline-none focus:border-[rgba(255,255,255,0.35)]";

export function ResetPasswordForm() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const invalidLink = searchParams.get("error") === "invalid_link";
  const [ready, setReady] = useState(invalidLink);
  const [sessionOk, setSessionOk] = useState(false);
  const [password, setPassword] = useState("");
  const [confirm, setConfirm] = useState("");
  const [error, setError] = useState<string | null>(
    invalidLink ? "This reset link is invalid or expired. Request a new one from /login." : null,
  );
  const [pending, setPending] = useState(false);
  const [done, setDone] = useState(false);

  useEffect(() => {
    if (invalidLink) return;

    const code = searchParams.get("code");
    if (code) {
      const params = new URLSearchParams({ code, redirectTo: "/auth/reset-password" });
      window.location.replace(`/auth/callback?${params.toString()}`);
      return;
    }

    const supabase = createClient();
    let cancelled = false;

    const { data: { subscription } } = supabase.auth.onAuthStateChange((event, nextSession) => {
      if (cancelled) return;
      if (event === "PASSWORD_RECOVERY" || (event === "SIGNED_IN" && nextSession)) {
        setSessionOk(true);
        setReady(true);
        setError(null);
      }
    });

    void (async () => {
      const hashTokens = parseRecoveryHash(window.location.hash);
      if (hashTokens) {
        const { error: sessionError } = await supabase.auth.setSession(hashTokens);
        if (cancelled) return;

        if (!sessionError) {
          window.history.replaceState(null, "", window.location.pathname);
          setSessionOk(true);
          setReady(true);
          return;
        }

        console.error("[reset-password] setSession", sessionError.message);
      }

      const { data: { session } } = await supabase.auth.getSession();
      if (cancelled) return;
      if (session) {
        setSessionOk(true);
        setReady(true);
        return;
      }

      await new Promise((r) => setTimeout(r, 600));
      if (cancelled) return;

      const { data: { session: retry } } = await supabase.auth.getSession();
      if (retry) {
        setSessionOk(true);
        setReady(true);
      } else if (!window.location.hash.includes("access_token")) {
        setError("This reset link is invalid or expired. Request a new one from /login.");
        setReady(true);
      } else {
        setError("Could not read reset link. Request a new link from /login and open it in this browser.");
        setReady(true);
      }
    })();

    return () => {
      cancelled = true;
      subscription.unsubscribe();
    };
  }, [invalidLink, searchParams]);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError(null);
    if (password.length < 8) {
      setError("Use at least 8 characters.");
      return;
    }
    if (password !== confirm) {
      setError("Passwords do not match.");
      return;
    }

    setPending(true);
    const supabase = createClient();
    const { error: updateError } = await supabase.auth.updateUser({ password });
    setPending(false);

    if (updateError) {
      setError(updateError.message);
      return;
    }

    let isAdmin = false;
    try {
      const res = await fetch("/api/auth/session-role", { cache: "no-store" });
      if (res.ok) {
        const data = (await res.json()) as { isAdmin?: boolean };
        isAdmin = Boolean(data.isAdmin);
      }
    } catch {
      /* use login fallback */
    }

    setDone(true);
    if (isAdmin) {
      router.replace("/admin");
    } else {
      router.replace("/login?reset=ok");
    }
    router.refresh();
  }

  if (!ready) {
    return <p className="text-sm text-[#8a9099]">Verifying reset link…</p>;
  }

  if (done) {
    return <p className="text-sm text-white">Password updated. Redirecting…</p>;
  }

  if (!sessionOk) {
    return (
      <div className="space-y-4 text-sm">
        <p className="text-red-300">{error ?? "Reset link not valid."}</p>
        <Link href="/login" className="text-[#4d9fff] hover:underline">
          Back to sign in
        </Link>
      </div>
    );
  }

  return (
    <form onSubmit={(e) => void handleSubmit(e)} className="space-y-4">
      <p className="text-sm text-[#8a9099]">
        Choose a new platform password for <strong className="text-white">/login</strong> (not your SOF code).
      </p>
      <label className="block text-xs uppercase tracking-wide text-[#8a9099]">
        New password
        <input
          type="password"
          autoComplete="new-password"
          className={inputClass}
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          required
          minLength={8}
        />
      </label>
      <label className="block text-xs uppercase tracking-wide text-[#8a9099]">
        Confirm password
        <input
          type="password"
          autoComplete="new-password"
          className={inputClass}
          value={confirm}
          onChange={(e) => setConfirm(e.target.value)}
          required
          minLength={8}
        />
      </label>
      {error ? <p className="text-sm text-red-300">{error}</p> : null}
      <button type="submit" disabled={pending} className={`${btnMarketingPrimary} w-full disabled:opacity-60`}>
        {pending ? "Saving…" : "Save new password"}
      </button>
    </form>
  );
}
