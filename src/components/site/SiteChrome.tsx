"use client";

import { usePathname } from "next/navigation";
import { isAuthGatePage } from "@/lib/auth-routes";
import { isAdminPath } from "@/lib/route-context";
import { SkipToContent } from "@/components/navigation/SkipToContent";

export function SiteChrome({
  children,
  nav,
  footer,
}: {
  children: React.ReactNode;
  nav: React.ReactNode;
  footer: React.ReactNode;
}) {
  const pathname = usePathname();
  const bare = isAuthGatePage(pathname);
  const adminConsole = isAdminPath(pathname);
  const sofMicrosite = pathname === "/sof-solutions" || pathname.startsWith("/sof-solutions/");

  if (bare || adminConsole) {
    return (
      <>
        <SkipToContent />
        {children}
      </>
    );
  }

  return (
    <div className="min-w-0 max-w-full overflow-x-hidden">
      <SkipToContent />
      {!sofMicrosite && nav}
      <div className="min-w-0 max-w-full overflow-x-hidden">{children}</div>
      {!sofMicrosite && footer}
    </div>
  );
}
