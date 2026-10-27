"use client";

import Link from "next/link";
import { useState } from "react";
import { createClient } from "@/lib/supabase/client";
import { acceptInviteAccount } from "@/app/admin/actions";

export function AcceptInviteForm({ token, email }: { token: string; email: string }) {
  const [password, setPassword] = useState("");
  const [confirm, setConfirm] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [pending, setPending] = useState(false);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError(null);

    if (password.length < 8) {
      setError("Password must be at least 8 characters.");
      return;
    }
    if (password !== confirm) {
      setError("Passwords do not match.");
      return;
    }

    setPending(true);
    const result = await acceptInviteAccount(token, password);
    if (!result.ok) {
      setError(result.error);
      setPending(false);
      return;
    }

    const supabase = createClient();
    const { error: signError } = await supabase.auth.signInWithPassword({ email, password });
    if (signError) {
      setError(signError.message);
      setPending(false);
      return;
    }

    window.location.href = "/";
  }

  return (
    <form className="mt-8 space-y-4" onSubmit={handleSubmit}>
      <input
        type="email"
        readOnly
        value={email}
        className="w-full border border-[rgba(255,255,255,0.12)] bg-[#0d0f12] px-4 py-3 text-sm text-[#8a9099] outline-none"
      />
      <input
        type="password"
        required
        value={password}
        onChange={(e) => setPassword(e.target.value)}
        placeholder="Password"
        className="w-full border border-[rgba(255,255,255,0.12)] bg-[#0d0f12] px-4 py-3 text-sm text-white outline-none placeholder:text-[#8a9099]"
      />
      <input
        type="password"
        required
        value={confirm}
        onChange={(e) => setConfirm(e.target.value)}
        placeholder="Confirm password"
        className="w-full border border-[rgba(255,255,255,0.12)] bg-[#0d0f12] px-4 py-3 text-sm text-white outline-none placeholder:text-[#8a9099]"
      />
      {error && <p className="text-sm text-red-500">{error}</p>}
      <button
        type="submit"
        disabled={pending}
        className="w-full border-0 bg-white py-3 text-sm font-medium text-black disabled:opacity-60"
      >
        {pending ? "CREATING ACCOUNT..." : "CREATE ACCOUNT"}
      </button>
    </form>
  );
}

export function AcceptInviteInvalid() {
  return (
    <div className="relative z-10 w-full max-w-[420px] border border-[rgba(255,255,255,0.08)] bg-[#080a0c]/90 p-6 backdrop-blur-sm sm:p-12">
      <p className="text-sm text-red-500">This invitation is invalid or has expired.</p>
      <Link href="/request-access" className="mt-8 inline-block text-[#4d9fff] no-underline hover:opacity-80">
        Request Access →
      </Link>
    </div>
  );
}
