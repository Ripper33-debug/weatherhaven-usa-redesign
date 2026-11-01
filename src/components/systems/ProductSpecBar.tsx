"use client";

import Link from "next/link";
import { useEffect, useState } from "react";

/**
 * A slim bar that keeps the system's name, headline figures and main action in reach once the
 * page's opening section has scrolled away: under the site header from tablet width up, and along
 * the bottom of the screen on phones (product pages have no other phone action bar). The phone bar
 * steps aside when the footer comes into view.
 */
export function ProductSpecBar({
  name,
  keySpec,
  figures,
  action,
  watchId,
}: {
  name: string;
  keySpec?: string;
  figures: { label: string; value: string }[];
  action: { href: string; label: string };
  /** id of the section whose end shows the bar. */
  watchId: string;
}) {
  const [past, setPast] = useState(false);
  const [footerIn, setFooterIn] = useState(false);

  useEffect(() => {
    const hero = document.getElementById(watchId);
    if (!hero) return;
    // Past = the section's bottom edge has gone above the site header (72px at most).
    const heroObserver = new IntersectionObserver(
      ([entry]) => setPast(!entry.isIntersecting && entry.boundingClientRect.bottom < 80),
      { rootMargin: "-72px 0px 0px 0px" },
    );
    heroObserver.observe(hero);
    const footer = document.querySelector("footer");
    const footerObserver = footer ? new IntersectionObserver(([entry]) => setFooterIn(entry.isIntersecting)) : null;
    if (footer) footerObserver?.observe(footer);
    return () => {
      heroObserver.disconnect();
      footerObserver?.disconnect();
    };
  }, [watchId]);

  const top = past;
  const bottom = past && !footerIn;

  return (
    <>
      <div
        className="v2-product-bar v2-product-bar-top fixed inset-x-0 top-16 z-40 hidden border-b border-line bg-ink/92 backdrop-blur-xl md:block lg:top-[72px]"
        data-shown={top}
        inert={!top}
        aria-hidden={!top}
      >
        <div className="v2-wrap flex h-16 items-center gap-6">
          <p className="shrink-0 text-[1.0625rem] font-semibold text-snow [font-variation-settings:'wdth'_110]">{name}</p>
          {keySpec ? <p className="hidden min-w-0 truncate text-[0.9375rem] text-muted lg:block">{keySpec}</p> : null}
          {figures.length > 0 ? (
            <dl className="hidden shrink-0 items-center gap-6 xl:flex">
              {figures.map((f) => (
                <div key={f.label} className="flex items-baseline gap-2 border-l border-line pl-6">
                  <dt className="text-[0.875rem] text-muted">{f.label}</dt>
                  <dd className="v2-tnum text-[0.9375rem] font-medium text-snow">{f.value}</dd>
                </div>
              ))}
            </dl>
          ) : null}
          <div className="ml-auto flex shrink-0 items-center gap-5">
            <a href="#specifications" className="v2-link text-[0.9375rem]">
              Specifications
            </a>
            <Link href={action.href} className="v2-btn !min-h-11 !px-5 !py-2 !text-[0.9375rem]">
              {action.label}
            </Link>
          </div>
        </div>
      </div>

      <div
        className="v2-product-bar v2-product-bar-bottom fixed inset-x-0 bottom-0 z-[55] border-t border-line bg-ink/95 backdrop-blur-xl md:hidden"
        style={{ paddingBottom: "env(safe-area-inset-bottom, 0px)" }}
        data-shown={bottom}
        inert={!bottom}
        aria-hidden={!bottom}
      >
        <div className="mx-auto grid max-w-lg grid-cols-[auto_1fr] gap-3 px-4 py-3">
          <a href="#specifications" className="v2-btn v2-btn-ghost !min-h-11 !px-4 text-sm">
            Specs
          </a>
          <Link href={action.href} className="v2-btn w-full whitespace-nowrap !min-h-11 !px-3 text-sm">
            {action.label}
          </Link>
        </div>
      </div>
    </>
  );
}
