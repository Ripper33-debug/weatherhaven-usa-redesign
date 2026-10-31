"use client";

import { usePathname } from "next/navigation";

/**
 * usePathname, with "/index" mapped back to "/". When Vercel regenerates the cached homepage (ISR),
 * the render sees its path as "/index", so the page chrome came out as if it weren't the homepage
 * and the browser then rendered it differently (React hydration error #418 on every cached load).
 * Use this wherever the path decides what the site chrome renders.
 */
export function useSitePathname(): string {
  const pathname = usePathname() ?? "/";
  return pathname === "/index" ? "/" : pathname;
}
