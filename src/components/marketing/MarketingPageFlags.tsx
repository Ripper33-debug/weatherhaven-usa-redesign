"use client";

import { useEffect } from "react";
import { usePathname } from "next/navigation";
import { isMarketingPage } from "@/lib/marketing-pages";

/** Sets body data attribute so global CSS and effects can respect Shield mode. */
export function MarketingPageFlags() {
  const pathname = usePathname();
  const marketing = isMarketingPage(pathname);

  useEffect(() => {
    if (marketing) {
      document.body.dataset.marketingPage = "true";
    } else {
      delete document.body.dataset.marketingPage;
    }
    return () => {
      delete document.body.dataset.marketingPage;
    };
  }, [marketing]);

  return null;
}
