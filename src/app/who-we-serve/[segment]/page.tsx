import type { Metadata } from "next";
import Image from "next/image";
import Link from "next/link";
import { notFound } from "next/navigation";
import { V2PageHeader } from "@/components/site/V2PageHeader";
import { PhotoBand } from "@/components/site/PhotoBand";
import { BUYER_SEGMENTS, briefingHref, buyerSegment, type BuyerRecord, type BuyerSystem } from "@/lib/buyer-segments";
import { blurProps } from "@/lib/image-blur";
import { pageMeta } from "@/lib/page-meta";
import { PRODUCT_CONTENT } from "@/lib/product-content";
import { PRODUCT_COVERS, productCover } from "@/lib/product-covers";
import { segmentBand } from "../segment-photos";

type Props = { params: Promise<{ segment: string }> };

export const dynamicParams = false;

export function generateStaticParams() {
  return BUYER_SEGMENTS.map((s) => ({ segment: s.slug }));
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { segment } = await params;
  const s = buyerSegment(segment);
  if (!s) return { title: "Not found" };
  return pageMeta({ title: s.title, description: s.lead, path: `/who-we-serve/${s.slug}` });
}

function SourceLink({ href, children }: { href: string; children: React.ReactNode }) {
  return (
    <a href={href} target="_blank" rel="noopener noreferrer" className="underline decoration-line-strong underline-offset-2 hover:text-snow">
      {children}
    </a>
  );
}

function Ids({ ids }: { ids?: readonly string[] }) {
  if (!ids?.length) return null;
  return (
    <p className="mt-4 flex flex-wrap gap-2">
      {ids.map((id) => (
        <span key={id} className="v2-code px-2 py-1 text-[0.875rem] text-snow shadow-[inset_0_0_0_1px_var(--color-line-strong)]">
          {id}
        </span>
      ))}
    </p>
  );
}

function RecordLinks({ r }: { r: BuyerRecord }) {
  if (!r.story && !r.source) return null;
  return (
    <div className="mt-4 space-y-1.5 text-[0.875rem] text-muted">
      {r.story ? (
        <p>
          <Link href={`/deployments#${r.story}`} className="v2-link">
            The full story
          </Link>
        </p>
      ) : null}
      {r.source ? (
        <p>
          Source: <SourceLink href={r.source.href}>{r.source.label}</SourceLink>
        </p>
      ) : null}
    </div>
  );
}

/** The strongest record gets room beside the heading; the rest sit in a hairline list below. */
function OnRecord({ record, sites, first }: { record: BuyerRecord[]; sites?: string; first: boolean }) {
  const [lead, ...rest] = record;
  return (
    <section aria-labelledby="record-heading" className={first ? "" : "border-t border-line pt-14"}>
      <div className="grid gap-8 lg:grid-cols-[minmax(0,0.8fr)_minmax(0,1.2fr)] lg:gap-16">
        <h2 id="record-heading" className="v2-h2 text-snow">
          On record
        </h2>
        <article className="max-w-[64ch]">
          <p className="v2-tech text-muted">{lead.where}</p>
          <h3 className="v2-h3 mt-2 text-snow">{lead.title}</h3>
          <p className="v2-body mt-3 text-snow/85">{lead.text}</p>
          <Ids ids={lead.ids} />
          <RecordLinks r={lead} />
        </article>
      </div>
      {rest.length ? (
        <ul className="v2-reveal-stagger mt-14 grid gap-x-10 border-t border-line md:grid-cols-2">
          {rest.map((r, i) => (
            <li
              key={r.title}
              className={`border-b border-line py-7 ${rest.length % 2 === 1 && i === rest.length - 1 ? "md:col-span-2" : ""}`}
            >
              <p className="v2-tech text-muted">{r.where}</p>
              <h3 className="mt-2 text-[1.1rem] font-semibold leading-snug text-snow [font-variation-settings:'wdth'_106]">{r.title}</h3>
              <p className="mt-2 max-w-[64ch] text-[0.95rem] leading-relaxed text-muted">{r.text}</p>
              <Ids ids={r.ids} />
              <RecordLinks r={r} />
            </li>
          ))}
        </ul>
      ) : null}
      {sites ? (
        <p className="mt-8 text-[0.95rem] text-muted">
          {sites}{" "}
          <Link href="/deployments/map" className="v2-link">
            Open the map
          </Link>
        </p>
      ) : null}
    </section>
  );
}

function Portal() {
  return (
    <section aria-labelledby="portal-heading" className="mb-14">
      <div className="v2-plate grid gap-6 px-6 py-8 sm:px-10 md:grid-cols-[minmax(0,1.2fr)_minmax(0,1fr)] md:items-end">
        <div>
          <h2 id="portal-heading" className="v2-h2 text-snow">
            The SOF portal
          </h2>
          <p className="v2-body mt-3 max-w-[52ch]">
            Restricted systems, planning tools and program-level detail are shared there with special operations
            programs, not on the public site.
          </p>
        </div>
        <div className="flex flex-col gap-3 text-[0.95rem] md:items-end">
          <Link href="/sof-solutions/request-access" className="v2-link">
            Request SOF portal access
          </Link>
          <Link href="/sof-solutions" className="v2-link">
            About the SOF portal
          </Link>
        </div>
      </div>
    </section>
  );
}

/** Columns that keep every row full; with five, the first system takes a double-width slot. */
const GRID: Record<number, string> = {
  1: "",
  2: "sm:grid-cols-2",
  3: "md:grid-cols-3",
  4: "sm:grid-cols-2 lg:grid-cols-4",
  5: "sm:grid-cols-2 lg:grid-cols-3",
  6: "sm:grid-cols-2 lg:grid-cols-3",
};

function Systems({ heading, systems, capability }: { heading: string; systems: BuyerSystem[]; capability?: { href: string; label: string } }) {
  const grid = GRID[systems.length] ?? "sm:grid-cols-2 lg:grid-cols-3";
  const wideFirst = systems.length === 5;
  return (
    <section aria-labelledby="systems-heading" className="v2-light py-20 sm:py-28">
      <div className="v2-wrap">
        <h2 id="systems-heading" className="v2-h2 v2-reveal max-w-[28ch] text-snow">
          {heading}
        </h2>
        <ul className={`v2-reveal-stagger mt-12 grid gap-x-8 gap-y-14 ${grid}`}>
          {systems.map((s, i) => {
            const product = PRODUCT_CONTENT[s.slug];
            if (!product) return null;
            const cover = productCover(s.slug);
            const shows = PRODUCT_COVERS[s.slug]?.shows;
            const wide = wideFirst && i === 0;
            return (
              <li key={s.slug} className={wide ? "sm:col-span-2" : undefined}>
                <Link href={`/configurable-solutions/${s.slug}`} className="v2-press group block no-underline">
                  <span className={`v2-media-zoom relative block aspect-[16/10] bg-hull-2 ${wide ? "lg:aspect-[33/10]" : ""}`}>
                    <Image
                      src={cover}
                      alt={shows ? `Photo of ${shows}` : `Weatherhaven ${product.name}`}
                      fill
                      sizes={wide ? "(min-width: 1024px) 64vw, 100vw" : "(min-width: 1024px) 30vw, (min-width: 640px) 50vw, 100vw"}
                      className="v2-photo object-cover"
                      {...blurProps(cover)}
                    />
                  </span>
                  {shows ? <span className="mt-2 block text-[0.8125rem] text-muted">Photo shows {shows}</span> : null}
                  <span className="mt-4 block text-[1.2rem] font-semibold text-snow transition-colors group-hover:text-signal [font-variation-settings:'wdth'_106]">
                    {product.name}
                  </span>
                  <span className="mt-0.5 block text-[0.9375rem] text-muted">{product.keySpec}</span>
                </Link>
                <p className="mt-3 max-w-[52ch] text-[0.95rem] leading-relaxed text-snow/85">{s.why}</p>
              </li>
            );
          })}
        </ul>
        {capability ? (
          <p className="mt-14 border-t border-line pt-6 text-[0.95rem] text-muted">
            Related capability:{" "}
            <Link href={capability.href} className="v2-link">
              {capability.label}
            </Link>
          </p>
        ) : null}
      </div>
    </section>
  );
}

export default async function BuyerSegmentPage({ params }: Props) {
  const { segment } = await params;
  const s = buyerSegment(segment);
  if (!s) notFound();
  const photo = segmentBand(s.slug);

  return (
    <>
      <V2PageHeader
        crumbs={[{ href: "/", label: "Home" }, { href: "/who-we-serve", label: "Who we serve" }, { label: s.label }]}
        title={s.title}
        lead={s.lead}
        wide
      />
      {photo ? <PhotoBand src={photo.src} alt={photo.alt} caption={photo.caption} position={photo.position} height="medium" /> : null}
      <div className="v2-wrap py-20 sm:py-24">
        {s.portal ? <Portal /> : null}
        {s.record.length ? <OnRecord record={s.record} sites={s.sites} first={!s.portal} /> : null}
      </div>
      <Systems heading={s.systemsHeading} systems={s.systems} capability={s.capability} />

      <section className="bg-hull py-20 sm:py-24">
        <div className="v2-wrap v2-reveal flex flex-col gap-8 lg:flex-row lg:items-end lg:justify-between">
          <div>
            <h2 className="v2-h2 max-w-[24ch] text-snow">A briefing for your program</h2>
            <p className="v2-body mt-4 max-w-[52ch]">
              Tell us the mission, where it is and how many people, and a Weatherhaven expert will walk your team
              through the systems that fit.
            </p>
          </div>
          <Link href={briefingHref(s)} className="v2-btn shrink-0">
            Request a briefing
          </Link>
        </div>
      </section>
    </>
  );
}
