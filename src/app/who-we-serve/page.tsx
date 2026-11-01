import type { Metadata } from "next";
import Image from "next/image";
import Link from "next/link";
import { V2PageHeader } from "@/components/site/V2PageHeader";
import { BUYER_SEGMENTS, buyerHref } from "@/lib/buyer-segments";
import { blurProps } from "@/lib/image-blur";
import { pageMeta } from "@/lib/page-meta";
import { SEGMENT_PHOTOS } from "./segment-photos";

export const metadata: Metadata = pageMeta({
  title: "Who we serve",
  description:
    "Weatherhaven shelters for the US Army, Air Force and Air National Guard, special operations, NATO and UN missions, the Canadian Armed Forces, emergency medical response, polar research and remote workforce camps.",
  path: "/who-we-serve",
});

/** One statement, then the buyers, each with a photograph of a system it uses and its own page. */
export default function WhoWeServePage() {
  return (
    <>
      <V2PageHeader
        crumbs={[{ href: "/", label: "Home" }, { label: "Who we serve" }]}
        title="Who we serve"
        lead="Armed forces, emergency and medical agencies, polar research programs and remote workforce camps. Each page lists what that kind of buyer uses and what is on record."
      />
      <div className="v2-wrap pb-24 pt-14 sm:pb-28 sm:pt-16">
        <ul className="grid gap-x-8 gap-y-8 sm:grid-cols-2 sm:gap-y-14 lg:grid-cols-4">
          {BUYER_SEGMENTS.map((s, i) => {
            const photo = SEGMENT_PHOTOS[s.slug];
            return (
              <li key={s.slug} className={i >= 4 ? "v2-reveal" : undefined}>
                {/* Phones: a thumbnail beside the text, so the list stays scannable. Wider: photo cards. */}
                <Link
                  href={buyerHref(s.slug)}
                  className="v2-press group grid grid-cols-[7.5rem_minmax(0,1fr)] items-start gap-x-4 no-underline sm:flex sm:h-full sm:flex-col"
                >
                  {photo ? (
                    <span className="v2-media-zoom relative block aspect-[4/3] w-full bg-hull">
                      <Image
                        src={photo.src}
                        alt={photo.alt}
                        fill
                        priority={i < 4}
                        sizes="(min-width: 1024px) 24vw, (min-width: 640px) 50vw, 120px"
                        className="v2-photo object-cover"
                        style={{ objectPosition: photo.position }}
                        {...blurProps(photo.src)}
                      />
                    </span>
                  ) : null}
                  <span className="flex min-w-0 flex-col sm:flex-1">
                    <span className="block text-[1.15rem] font-semibold leading-snug text-snow transition-colors group-hover:text-signal [font-variation-settings:'wdth'_106] sm:mt-5 sm:border-t sm:border-line-strong sm:pt-4 sm:text-[1.25rem]">
                      {s.label}
                    </span>
                    <span className="mt-1.5 block text-[0.95rem] leading-relaxed text-muted sm:mt-2">{s.note}</span>
                    {photo ? (
                      <span className="mt-auto hidden pt-3 text-[0.8125rem] text-muted/80 sm:block">Photo: {photo.caption}</span>
                    ) : null}
                  </span>
                </Link>
              </li>
            );
          })}
        </ul>
      </div>
    </>
  );
}

