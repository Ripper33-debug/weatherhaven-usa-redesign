"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useEffect, useState } from "react";
import { createClient } from "@/lib/supabase/client";

export function NavAccountLink({
  className = "",
  mobile = false,
  onNavigate,
}: {
  className?: string;
  mobile?: boolean;
  onNavigate?: () => void;
}) {
  const pathname = usePathname();
  const [visible, setVisible] = useState(false);

  useEffect(() => {
    const supabase = createClient();
    void supabase.auth.getSession().then(({ data: { session } }) => {
      setVisible(!!session?.user);
    });
    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange((_event, session) => {
      setVisible(!!session?.user);
    });
    return () => subscription.unsubscribe();
  }, []);

  if (!visible) return null;

  return (
    <Link
      href="/account"
      onClick={onNavigate}
      className={`text-[13px] text-[#8a9099] no-underline transition-opacity hover:text-white hover:opacity-100 ${
        pathname.startsWith("/account") ? "text-white" : ""
      } ${mobile ? "text-[16px] text-white" : ""} ${className}`}
    >
      Account
    </Link>
  );
}
