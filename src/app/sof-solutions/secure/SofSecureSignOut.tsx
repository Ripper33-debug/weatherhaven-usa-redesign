"use client";

import { useRouter } from "next/navigation";
import { fetchWithCsrf } from "@/lib/csrf-client";
import { createClient } from "@/lib/supabase/client";
import { SOF_LOGIN_PATH } from "@/lib/sof-auth";

export function SofSecureSignOut() {
  const router = useRouter();

  async function handleSignOut() {
    try {
      await fetchWithCsrf("/api/auth/logout", { method: "POST" });
    } catch {
      const supabase = createClient();
      await supabase.auth.signOut();
    }
    router.push(SOF_LOGIN_PATH);
    router.refresh();
  }

  return (
    <button
      type="button"
      onClick={handleSignOut}
      className="text-sm text-[#8a9099] transition hover:text-white focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#4d9fff]"
    >
      Sign out
    </button>
  );
}
