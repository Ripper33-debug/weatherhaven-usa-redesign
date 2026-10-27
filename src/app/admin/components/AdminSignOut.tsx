"use client";

import { useRouter } from "next/navigation";
import { fetchWithCsrf } from "@/lib/csrf-client";
import { createClient } from "@/lib/supabase/client";
import { adminBtnGhost } from "./admin-ui";

export function AdminSignOut({ compact }: { compact?: boolean } = {}) {
  const router = useRouter();

  async function handleSignOut() {
    try {
      await fetchWithCsrf("/api/auth/logout", { method: "POST" });
    } catch {
      const supabase = createClient();
      await supabase.auth.signOut();
    }
    router.push("/login");
    router.refresh();
  }

  if (compact) {
    return (
      <button
        type="button"
        onClick={handleSignOut}
        className="rounded-lg border border-white/[0.06] px-3 py-2 text-xs font-medium text-zinc-400 transition hover:text-white"
      >
        Sign out
      </button>
    );
  }

  return (
    <button type="button" onClick={handleSignOut} className={adminBtnGhost}>
      Sign out
    </button>
  );
}
