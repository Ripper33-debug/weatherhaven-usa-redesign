import Image from "next/image";
import Link from "next/link";
import { COMPANY_CONTACT, companyPhoneHref } from "@/lib/company-facts";
import { blurProps } from "@/lib/image-blur";
import { NAV_CTA } from "@/lib/site-nav";
import { HOMEPAGE_DEFAULTS, type HomepageCopy } from "@/sanity/content";

const PHOTO = "/products/ehmecc/gallery/14-NATO_EHMECCs.jpg";

/**
 * The closing ask, over a full-width field photo: a row of EHMECCs deployed for NATO. The photo
 * sits to the right on wide screens, with the copy over the darkened left side; on phones it
 * becomes a band above the copy.
 */
export function HomeCta({ copy = HOMEPAGE_DEFAULTS }: { copy?: HomepageCopy }) {
  return (
    <section aria-labelledby="cta-heading" className="v2-defer relative isolate overflow-hidden border-t border-line bg-ink">
      <div className="relative h-[42svh] min-h-[260px] lg:absolute lg:inset-0 lg:h-auto">
        <Image
          src={PHOTO}
          alt="A row of Weatherhaven EHMECC expandable shelters deployed for NATO under a stormy sky"
          fill
          sizes="100vw"
          className="v2-photo object-cover object-[70%_50%]"
          {...blurProps(PHOTO)}
        />
        {/* Darkens the left for the copy on wide screens, and the bottom edge into the page on phones. */}
        <div aria-hidden className="absolute inset-0 bg-[linear-gradient(180deg,rgb(10_15_23/0)_55%,#0a0f17_100%)] lg:bg-[linear-gradient(90deg,#0a0f17_0%,rgb(10_15_23/0.92)_34%,rgb(10_15_23/0.35)_62%,rgb(10_15_23/0.1)_100%)]" />
      </div>
      <div className="v2-wrap relative pb-20 pt-4 sm:pb-24 lg:py-32">
        <h2 id="cta-heading" className="v2-display max-w-[14ch] text-snow">
          {copy.ctaHeading}
        </h2>
        <p className="v2-lead mt-6 max-w-[44ch]">{copy.ctaText}</p>
        <div className="mt-10 flex flex-col gap-3 sm:flex-row sm:items-center">
          <Link href={NAV_CTA.href} className="v2-btn">
            {NAV_CTA.label}
          </Link>
          <Link href="/mission-solution-builder" className="v2-btn v2-btn-ghost bg-ink/60 backdrop-blur-sm">
            Build a mission profile
          </Link>
        </div>
        <div className="mt-12 grid gap-6 border-t border-line-strong pt-8 text-[0.95rem] sm:grid-cols-2 lg:max-w-[40rem]">
          <p className="text-snow/85">
            Prefer the phone? Call the US office at{" "}
            <a href={companyPhoneHref(COMPANY_CONTACT.phone)} className="v2-link">
              {COMPANY_CONTACT.phone}
            </a>
            .
          </p>
          <p className="text-snow/85">
            Special operations programs can{" "}
            <Link href="/sof-solutions/request-access" className="v2-link">
              request SOF portal access
            </Link>
            .
          </p>
        </div>
        <p className="mt-10 text-[0.8125rem] text-muted lg:absolute lg:bottom-6 lg:right-[var(--v2-gutter)] lg:mt-0">
          EHMECCs deployed for NATO. Weatherhaven photo.
        </p>
      </div>
    </section>
  );
}
