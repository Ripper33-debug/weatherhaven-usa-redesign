"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { btnMarketingOutline, btnMarketingPrimary } from "@/lib/cta-buttons";
import { contactUrl } from "@/lib/contact-url";
import { isMarketingPage, isProductCatalogPath } from "@/lib/marketing-pages";

export function MarketingMobileActionBar() {
  const pathname = usePathname();
  if (!isMarketingPage(pathname) || isProductCatalogPath(pathname)) return null;

  const productSlug = pathname.match(/^\/configurable-solutions\/([^/]+)$/)?.[1];
  const contactHref = productSlug
    ? contactUrl({ system: productSlug, inquiry: "Program Requirement" })
    : "/contact";

  return (
    <div
      className="fixed bottom-0 left-0 right-0 z-[55] border-t border-white/[0.08] bg-[#080a0c]/95 backdrop-blur-xl md:hidden"
      style={{ paddingBottom: "env(safe-area-inset-bottom, 0px)" }}
      role="navigation"
      aria-label="Quick actions"
    >
      <div className="mx-auto grid max-w-lg grid-cols-2 gap-3 px-4 py-3">
        <Link href="/configurable-solutions" className={`${btnMarketingOutline} w-full justify-center py-3 text-center text-sm`}>
          Systems
        </Link>
        <Link href={contactHref} className={`${btnMarketingPrimary} w-full justify-center py-3 text-center text-sm`}>
          Contact
        </Link>
      </div>
    </div>
  );
}
