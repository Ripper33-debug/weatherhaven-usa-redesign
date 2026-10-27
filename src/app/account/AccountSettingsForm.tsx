"use client";

import { useEffect, useState } from "react";
import { createClient } from "@/lib/supabase/client";
import { trackEvent } from "@/lib/analytics";

export function AccountSettingsForm() {
  const [email, setEmail] = useState("");
  const [currentPassword, setCurrentPassword] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [inlineError, setInlineError] = useState<string | null>(null);
  const [banner, setBanner] = useState<{ type: "success" | "error"; text: string } | null>(null);
  const [pending, setPending] = useState(false);

  useEffect(() => {
    void trackEvent("view", "Account settings opened");
    const supabase = createClient();
    void supabase.auth.getUser().then(({ data: { user } }) => {
      setEmail(user?.email ?? "");
    });
  }, []);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setInlineError(null);
    setBanner(null);

    if (newPassword.length < 8) {
      setInlineError("New password must be at least 8 characters.");
      return;
    }
    if (newPassword !== confirmPassword) {
      setInlineError("New password and confirmation do not match.");
      return;
    }

    setPending(true);
    const supabase = createClient();

    const { error: signInError } = await supabase.auth.signInWithPassword({
      email,
      password: currentPassword,
    });

    if (signInError) {
      setBanner({ type: "error", text: "Failed to update password. Check your current password." });
      setPending(false);
      return;
    }

    const { error: updateError } = await supabase.auth.updateUser({ password: newPassword });
    if (updateError) {
      setBanner({ type: "error", text: "Failed to update password. Check your current password." });
      setPending(false);
      return;
    }

    setCurrentPassword("");
    setNewPassword("");
    setConfirmPassword("");
    setBanner({ type: "success", text: "Password updated successfully." });
    setPending(false);
  }

  return (
    <form className="mt-10 max-w-lg space-y-4" onSubmit={handleSubmit}>
      <div>
        <label className="mb-2 block text-[11px] uppercase tracking-[0.15em] text-[#8a9099]">Email</label>
        <input
          type="email"
          readOnly
          value={email}
          className="w-full border border-[rgba(255,255,255,0.12)] bg-[#0d0f12] px-4 py-3 text-sm text-[#8a9099] outline-none"
        />
      </div>
      <input
        type="password"
        required
        value={currentPassword}
        onChange={(e) => setCurrentPassword(e.target.value)}
        placeholder="Current password"
        className="w-full border border-[rgba(255,255,255,0.12)] bg-[#0d0f12] px-4 py-3 text-sm text-white outline-none placeholder:text-[#8a9099]"
      />
      <input
        type="password"
        required
        value={newPassword}
        onChange={(e) => setNewPassword(e.target.value)}
        placeholder="New password"
        className="w-full border border-[rgba(255,255,255,0.12)] bg-[#0d0f12] px-4 py-3 text-sm text-white outline-none placeholder:text-[#8a9099]"
      />
      <input
        type="password"
        required
        value={confirmPassword}
        onChange={(e) => setConfirmPassword(e.target.value)}
        placeholder="Confirm new password"
        className="w-full border border-[rgba(255,255,255,0.12)] bg-[#0d0f12] px-4 py-3 text-sm text-white outline-none placeholder:text-[#8a9099]"
      />
      {inlineError && <p className="text-sm text-red-500">{inlineError}</p>}
      {banner && (
        <p className={`text-sm ${banner.type === "success" ? "text-green-500" : "text-red-500"}`}>{banner.text}</p>
      )}
      <button
        type="submit"
        disabled={pending}
        className="w-full border-0 bg-white py-3 text-sm font-medium text-black disabled:opacity-60"
      >
        {pending ? "UPDATING..." : "UPDATE PASSWORD"}
      </button>
    </form>
  );
}
