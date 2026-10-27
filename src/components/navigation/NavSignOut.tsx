"use client";

import { createClient } from "@/lib/supabase/client";
import { useRouter } from "next/navigation";

export function NavSignOut({
  className = "",
  onNavigate,
}: {
  className?: string;
  onNavigate?: () => void;
}) {
  const router = useRouter();

  async function handleSignOut() {
    const supabase = createClient();
    await supabase.auth.signOut();
    onNavigate?.();
    router.push("/login");
    router.refresh();
  }

  return (
    <button
      type="button"
      onClick={handleSignOut}
      className={`cursor-pointer border-0 bg-transparent p-0 text-[14px] text-[#8a9099] no-underline transition-colors hover:text-white ${className}`}
    >
      Sign Out
    </button>
  );
}
