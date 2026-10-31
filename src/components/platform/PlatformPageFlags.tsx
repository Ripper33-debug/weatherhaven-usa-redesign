"use client";

import { useSitePathname } from "@/hooks/useSitePathname";
import { useEffect } from "react";

const PLATFORM_PREFIXES = ["/sof-solutions/secure", "/account"] as const;

function isPlatformPage(pathname: string): boolean {
  return PLATFORM_PREFIXES.some((p) => pathname === p || pathname.startsWith(`${p}/`));
}

export function PlatformPageFlags() {
  const pathname = useSitePathname();
  const platform = isPlatformPage(pathname);

  useEffect(() => {
    if (platform) {
      document.body.dataset.platformPage = "true";
    } else {
      delete document.body.dataset.platformPage;
    }
    return () => {
      delete document.body.dataset.platformPage;
    };
  }, [platform]);

  return null;
}
