"use client";

import { useSitePathname } from "@/hooks/useSitePathname";
import Link from "next/link";
import { useEffect, useState } from "react";
import { btnMarketingOutline, btnMarketingPrimary } from "@/lib/cta-buttons";
import { contactUrl } from "@/lib/contact-url";
import { isMarketingPage, isProductCatalogPath, isPublicSitePage } from "@/lib/marketing-pages";
import { NAV_CTA } from "@/lib/site-nav-links";

const FIELD = "input, textarea, select, [contenteditable='true']";

/**
 * Whether the public pages' bar should step aside: while reading down the page (it comes back on
 * the way up and near the top), while a form or the footer is on screen (so it never sits over a
 * form's buttons, and the footer has the same actions), and while someone is typing in a field.
 */
function useStepAside(pathname: string, enabled: boolean) {
  const [hidden, setHidden] = useState(false);
  useEffect(() => {
    if (!enabled) return;
    let lastY = window.scrollY;
    let goingDown = false;
    let typing = false;
    let frame = 0;
    const inView = new Set<Element>();
    const update = () => setHidden(inView.size > 0 || typing || (goingDown && window.scrollY > 160));
    const onScroll = () => {
      if (frame) return;
      frame = requestAnimationFrame(() => {
        frame = 0;
        const y = window.scrollY;
        if (Math.abs(y - lastY) > 8) {
          goingDown = y > lastY;
          lastY = y;
        }
        update();
      });
    };
    const io = new IntersectionObserver(
      (entries) => {
        for (const e of entries) {
          if (e.isIntersecting) inView.add(e.target);
          else inView.delete(e.target);
        }
        update();
      },
      { rootMargin: "0px 0px -4% 0px" },
    );
    const watch = () => {
      for (const el of document.querySelectorAll("main form, [data-global-footer], [data-hide-action-bar]")) io.observe(el);
    };
    watch();
    // Forms that arrive after the page (client-loaded sections) are picked up as they appear.
    let pending = 0;
    const mo = new MutationObserver(() => {
      if (pending) return;
      pending = window.setTimeout(() => {
        pending = 0;
        watch();
      }, 400);
    });
    mo.observe(document.querySelector("main") ?? document.body, { childList: true, subtree: true });
    const onFocusIn = (e: FocusEvent) => {
      typing = e.target instanceof Element && e.target.matches(FIELD);
      update();
    };
    const onFocusOut = () => {
      window.setTimeout(() => {
        typing = document.activeElement instanceof Element && document.activeElement.matches(FIELD);
        update();
      }, 0);
    };
    window.addEventListener("scroll", onScroll, { passive: true });
    document.addEventListener("focusin", onFocusIn);
    document.addEventListener("focusout", onFocusOut);
    return () => {
      window.removeEventListener("scroll", onScroll);
      document.removeEventListener("focusin", onFocusIn);
      document.removeEventListener("focusout", onFocusOut);
      io.disconnect();
      mo.disconnect();
      window.clearTimeout(pending);
      cancelAnimationFrame(frame);
      setHidden(false);
    };
  }, [pathname, enabled]);
  return hidden;
}

export function MarketingMobileActionBar() {
  const pathname = useSitePathname();
  const showsV2Bar =
    isMarketingPage(pathname) && !isProductCatalogPath(pathname) && pathname !== "/deployments/map" && isPublicSitePage(pathname);
  const hidden = useStepAside(pathname, showsV2Bar);
  if (!isMarketingPage(pathname) || isProductCatalogPath(pathname)) return null;
  // The full-screen deployment map has its own contact button, and the bar would cover its controls.
  if (pathname === "/deployments/map") return null;

  const productSlug = pathname.match(/^\/configurable-solutions\/([^/]+)$/)?.[1];
  const contactHref = productSlug
    ? contactUrl({ system: productSlug, inquiry: "Program Requirement" })
    : "/contact";

  // The SOF portal keeps its original bar; the redesigned public pages get the v2 one.
  if (!isPublicSitePage(pathname)) {
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

  return (
    <div
      className="v2-home-actionbar fixed bottom-0 left-0 right-0 z-[55] border-t border-line bg-ink/95 backdrop-blur-xl md:hidden"
      data-hidden={hidden}
      inert={hidden}
      // Renders outside the .wh-v2 wrapper, so it sets the site's face itself (Geist isn't preloaded).
      style={{ paddingBottom: "env(safe-area-inset-bottom, 0px)", fontFamily: "var(--font-archivo), Archivo, ui-sans-serif, system-ui, sans-serif" }}
      role="navigation"
      aria-label="Quick actions"
    >
      <div className="mx-auto grid max-w-lg grid-cols-2 gap-3 px-4 py-3">
        <Link href="/configurable-solutions" className="v2-btn v2-btn-ghost w-full !min-h-11 text-sm">
          Systems
        </Link>
        <Link href={productSlug ? contactHref : NAV_CTA.href} className="v2-btn w-full whitespace-nowrap !min-h-11 !px-3 text-sm">
          {productSlug ? "Ask about this system" : NAV_CTA.label}
        </Link>
      </div>
    </div>
  );
}
