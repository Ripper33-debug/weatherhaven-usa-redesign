"use client";

import { ViewTransition } from "react";
import { usePathname } from "next/navigation";
import { isAuthGatePage } from "@/lib/auth-routes";
import { isAdminPath } from "@/lib/route-context";
import { SkipToContent } from "@/components/navigation/SkipToContent";
import { isPublicSitePage } from "@/lib/marketing-pages";

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
  const publicSite = isPublicSitePage(pathname);

  if (bare || adminConsole) {
    return (
      <>
        <SkipToContent />
        {children}
      </>
    );
  }

  return (
    <div className={`min-w-0 max-w-full overflow-x-clip ${publicSite ? "wh-v2" : ""}`}>
      <SkipToContent />
      {!sofMicrosite && nav}
      {publicSite ? (
        // Public pages cross-fade between routes; the SOF portal and admin keep their own transitions.
        <ViewTransition default="v2-page">
          <div className="min-w-0 max-w-full overflow-x-clip">{children}</div>
        </ViewTransition>
      ) : (
        <div className="min-w-0 max-w-full overflow-x-clip">{children}</div>
      )}
      {!sofMicrosite && footer}
    </div>
  );
}
