"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useEffect, useState } from "react";
import { scheduleIdleTask } from "@/lib/schedule-idle";

type NavAdminMode = "loading" | "hidden" | "guest" | "admin";

/**
 * Operator / admin sign-in link.
 * - header: only when already signed in as admin (keeps public nav clean)
 * - footer: "Operator sign-in" for guests; "Admin" when signed in
 */
export function NavAdminLink({
  className = "",
  onNavigate,
  mobile = false,
  placement = "header",
}: {
  className?: string;
  onNavigate?: () => void;
  mobile?: boolean;
  placement?: "header" | "footer";
}) {
  const pathname = usePathname();
  const [mode, setMode] = useState<NavAdminMode>("loading");

  useEffect(() => {
    let cancelled = false;

    const sync = async () => {
      // No Supabase project configured (the demo deployment): there is no sign-in to ask about,
      // and the role check would only fail with a 500 on every page.
      if (!process.env.NEXT_PUBLIC_SUPABASE_URL) {
        setMode("hidden");
        return;
      }
      try {
        const res = await fetch("/api/auth/session-role", { cache: "no-store" });
        if (!res.ok) throw new Error("session-role failed");
        const data = (await res.json()) as { adminLoginEnabled?: boolean; isAdmin?: boolean };
        if (cancelled) return;
        if (!data.adminLoginEnabled) {
          setMode("hidden");
        } else {
          setMode(data.isAdmin ? "admin" : "guest");
        }
      } catch {
        if (!cancelled) setMode("hidden");
      }
    };

    scheduleIdleTask(() => {
      void sync();
    });

    return () => {
      cancelled = true;
    };
  }, []);

  // No Supabase project (the demo deployment): there is no sign-in page to link to.
  if (!process.env.NEXT_PUBLIC_SUPABASE_URL) return null;
  const footerAlwaysVisible = placement === "footer";
  if (!footerAlwaysVisible && (mode === "loading" || mode === "hidden")) return null;
  if (placement === "header" && mode === "guest") return null;

  const activeAdmin = pathname.startsWith("/admin");
  const activeLogin = pathname === "/login";

  const isAdmin = mode === "admin";
  const label = isAdmin ? "Admin" : placement === "footer" ? "Operator sign-in" : "Admin sign-in";
  const href = isAdmin ? "/admin" : "/login";
  const active = isAdmin ? activeAdmin : activeLogin;

  if (mobile) {
    return (
      <Link
        href={href}
        onClick={onNavigate}
        className={`border-b border-[rgba(255,255,255,0.08)] py-4 text-[24px] leading-snug text-white no-underline transition-opacity hover:opacity-70 ${
          active ? "opacity-100" : ""
        } ${className}`}
      >
        {label}
      </Link>
    );
  }

  if (placement === "footer") {
    return (
      <Link
        href={href}
        onClick={onNavigate}
        className={`text-xs text-[#8a9099] transition hover:text-white ${active ? "text-white" : ""} ${className}`}
      >
        {label}
      </Link>
    );
  }

  return (
    <Link
      href={href}
      onClick={onNavigate}
      className={`text-[14px] text-[#8a9099] no-underline transition-colors hover:text-white ${
        active ? "text-white" : ""
      } ${className}`}
    >
      {label}
    </Link>
  );
}
