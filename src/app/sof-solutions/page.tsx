import type { Metadata } from "next";
import Image from "next/image";
import Link from "next/link";
import { V2PageHeader } from "@/components/site/V2PageHeader";
import { PhotoBand } from "@/components/site/PhotoBand";
import { segmentBand } from "@/app/who-we-serve/segment-photos";
import { briefingHref, buyerSegment } from "@/lib/buyer-segments";
import { COMPANY_CONTACT, companyPhoneHref } from "@/lib/company-facts";
import { blurProps } from "@/lib/image-blur";
import { pageMeta } from "@/lib/page-meta";
import { PRODUCT_CONTENT } from "@/lib/product-content";
import { PRODUCT_COVERS, productCover } from "@/lib/product-covers";
import { SOF_LOGIN_PATH, SOF_REQUEST_ACCESS_PATH } from "@/lib/sof-auth";

/**
 * The public SOF page, in the main site's design (global nav and footer; see SiteChrome and
 * SofSolutionsChrome). It says which systems suit special operations and how the members' portal
 * works; the portal itself (sign-in, request access, /sof-solutions/secure) keeps its own chrome.
 * The systems and briefing subject come from the special-operations buyer segment, so the two pages
 * can't drift apart.
 */
const LEAD =
  "Small, air-mobile Weatherhaven systems for special operations, and a members’ portal where program detail, planning tools and restricted data are shared with approved programs.";

export const metadata: Metadata = pageMeta({
  title: "Special operations and the SOF portal",
  description: LEAD,
  path: "/sof-solutions",
});

const PORTAL_HOLDS = [
  { title: "Program detail", text: "System information for special operations programs that goes beyond the public specifications." },
  { title: "Planning tools", text: "The deployment planner, for laying out a site with the systems you’re considering." },
  { title: "Restricted data", text: "Material that Weatherhaven shares only with approved programs, not on the public site." },
];

const ACCESS_STEPS = [
  { title: "Request access", text: "Send your name and official email through the request form." },
  { title: "Weatherhaven reviews it", text: "Each request is checked by the Weatherhaven team before access is given." },
  { title: "Sign in", text: "Approved members sign in with their email and the access code they’re sent." },
];

export default function SofSolutionsPage() {
  const segment = buyerSegment("special-operations");
  const systems = segment?.systems ?? [];
  const photo = segmentBand("special-operations");

  return (
    <>
      <V2PageHeader
        crumbs={[{ href: "/", label: "Home" }, { href: "/who-we-serve", label: "Who we serve" }, { label: "Special operations" }]}
        title="Shelters for special operations"
        lead={LEAD}
        wide
      >
        <div className="flex flex-col gap-3 sm:flex-row">
          <Link href={SOF_REQUEST_ACCESS_PATH} className="v2-btn">
            Request portal access
          </Link>
          <Link href={SOF_LOGIN_PATH} className="v2-btn v2-btn-ghost">
            Member sign-in
          </Link>
        </div>
      </V2PageHeader>

      {photo ? <PhotoBand src={photo.src} alt={photo.alt} caption={photo.caption} position={photo.position} height="medium" /> : null}

      <div className="v2-wrap py-20 sm:py-24">
        {systems.length ? (
          <section aria-labelledby="sof-systems-heading">
            <h2 id="sof-systems-heading" className="v2-h2 v2-reveal text-snow">
              {segment?.systemsHeading ?? "Systems sized for small teams and airlift"}
            </h2>
            <ul className={`v2-reveal-stagger mt-12 grid gap-x-8 gap-y-14 ${systems.length % 4 === 0 ? "sm:grid-cols-2 lg:grid-cols-4" : systems.length % 3 === 0 ? "md:grid-cols-3" : "sm:grid-cols-2"}`}>
              {systems.map((s) => {
                const product = PRODUCT_CONTENT[s.slug];
                if (!product) return null;
                const cover = productCover(s.slug);
                const shows = PRODUCT_COVERS[s.slug]?.shows;
                return (
                  <li key={s.slug}>
                    <Link href={`/configurable-solutions/${s.slug}`} className="v2-press group block no-underline">
                      <span className="v2-media-zoom relative block aspect-[16/10] bg-hull">
                        <Image
                          src={cover}
                          alt={shows ? `Photo of ${shows}` : `Weatherhaven ${product.name}`}
                          fill
                          sizes="(min-width: 1024px) 22vw, (min-width: 640px) 45vw, 100vw"
                          className="v2-photo object-cover"
                          {...blurProps(cover)}
                        />
                      </span>
                      {shows ? <span className="mt-2 block text-[0.8125rem] text-muted">Photo shows {shows}</span> : null}
                      <span className="mt-4 block text-[1.1rem] font-semibold text-snow transition-colors group-hover:text-signal [font-variation-settings:'wdth'_106]">
                        {product.name}
                      </span>
                      <span className="mt-0.5 block text-[0.9375rem] text-muted">{product.keySpec}</span>
                    </Link>
                    <p className="mt-3 text-[0.95rem] leading-relaxed text-snow/85">{s.why}</p>
                  </li>
                );
              })}
            </ul>
          </section>
        ) : null}

      </div>

      <section aria-labelledby="sof-portal-heading" className="v2-light py-20 sm:py-28">
        <div className="v2-wrap">
          <div className="grid gap-12 lg:grid-cols-[minmax(0,1fr)_minmax(0,1fr)] lg:gap-16">
            <div className="v2-reveal">
              <h2 id="sof-portal-heading" className="v2-h2 text-snow">
                The SOF portal
              </h2>
              <p className="v2-body mt-4 max-w-[52ch]">
                A separate, sign-in-only part of the site for special operations programs.
              </p>
              <dl className="mt-8 border-t border-line">
                {PORTAL_HOLDS.map((h) => (
                  <div key={h.title} className="grid gap-1 border-b border-line py-4 sm:grid-cols-[10rem_1fr] sm:gap-4">
                    <dt className="font-semibold text-snow">{h.title}</dt>
                    <dd className="text-[0.95rem] leading-relaxed text-muted">{h.text}</dd>
                  </div>
                ))}
              </dl>
            </div>
            <div className="v2-reveal">
              <h3 className="v2-h3 text-snow">How access works</h3>
              <ol className="mt-6 border-t border-line">
                {ACCESS_STEPS.map((step, i) => (
                  <li key={step.title} className="grid grid-cols-[2rem_1fr] gap-2 border-b border-line py-4">
                    <span className="v2-tnum font-semibold text-signal">{i + 1}</span>
                    <span>
                      <span className="block font-semibold text-snow">{step.title}</span>
                      <span className="mt-1 block text-[0.95rem] leading-relaxed text-muted">{step.text}</span>
                    </span>
                  </li>
                ))}
              </ol>
              <div className="mt-8 flex flex-col gap-3 sm:flex-row">
                <Link href={SOF_REQUEST_ACCESS_PATH} className="v2-btn">
                  Request portal access
                </Link>
                <Link href={SOF_LOGIN_PATH} className="v2-btn v2-btn-ghost">
                  Member sign-in
                </Link>
              </div>
            </div>
          </div>
        </div>
      </section>

      <section aria-labelledby="sof-support-heading" className="py-20 sm:py-24">
        <div className="v2-wrap v2-reveal grid gap-4 lg:grid-cols-[minmax(0,1fr)_minmax(0,1fr)] lg:items-baseline lg:gap-16">
          <h2 id="sof-support-heading" className="v2-h2 text-snow">
            After the operation
          </h2>
          <p className="v2-lead max-w-[52ch]">
            Weatherhaven can install systems, take them down at the end of an operation, refurbish them and store them
            until the next one.
          </p>
        </div>
      </section>

      <section className="bg-hull py-20 sm:py-24">
        <div className="v2-wrap v2-reveal flex flex-col gap-8 lg:flex-row lg:items-end lg:justify-between">
          <div>
            <h2 className="v2-h2 max-w-[24ch] text-snow">A briefing for your program</h2>
            <p className="v2-body mt-4 max-w-[52ch]">
              Tell us the mission, where it is and how many people, and a Weatherhaven expert will walk your team
              through the systems that fit. Or call the US office at{" "}
              <a href={companyPhoneHref(COMPANY_CONTACT.phone)} className="v2-link">
                {COMPANY_CONTACT.phone}
              </a>
              .
            </p>
          </div>
          {segment ? (
            <Link href={briefingHref(segment)} className="v2-btn shrink-0">
              Request a briefing
            </Link>
          ) : null}
        </div>
      </section>
    </>
  );
}
