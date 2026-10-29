import type { Metadata } from "next";
import Image from "next/image";
import Link from "next/link";
import { HomeTimeline } from "@/components/home/v2/HomeTimeline";
import { V2PageHeader } from "@/components/site/V2PageHeader";
import { CAPABILITY_CATEGORIES, type CapabilityCategory, type CapabilityCategoryId } from "@/lib/capabilitiesExplorer";
import { pageMeta } from "@/lib/page-meta";
import { PRODUCT_CONTENT } from "@/lib/product-content";
import { productCover } from "@/lib/product-covers";
import { blurProps } from "@/lib/image-blur";

export const metadata: Metadata = pageMeta({
  title: "Capabilities",
  description:
    "Shelter systems, environmental control, power, flooring, command and control, medical, aviation support and camp integration from one supplier.",
  path: "/capabilities",
  image: "/products/mecc/gallery/16-MECCs_x5_deployed_01.jpg",
});

const label = (s: string) => {
  const t = s.replace("&", "and").toLowerCase();
  return t.charAt(0).toUpperCase() + t.slice(1);
};

type Photo = { src: string; alt: string; caption: string };

/**
 * What each area shows on this page: hand-picked systems, a photograph of the actual kit where
 * Weatherhaven has one, and the deployment story that proves it.
 */
const DETAIL: Record<CapabilityCategoryId, { related: string[]; photo?: Photo; story?: { href: string; label: string } }> = {
  shelter: { related: ["series-4", "mecc", "airbeam-lp"] },
  ecu: {
    related: ["rdmss", "polar-chief", "airbeam-lp"],
    photo: {
      src: "/products/mecc/gallery/19-MIL-20-MECC-ExteriorElectricalPanels.jpg",
      alt: "A deployed MECC with its end-wall doors open on two environmental control units and electrical panels",
      caption: "A MECC with its environmental control units and electrical panels in the end wall.",
    },
  },
  power: {
    related: ["non-expandable-iso-containers", "mecc"],
    photo: {
      src: "/products/expandable-command/gallery/01-02_20'-ISO-life-support-contai.jpg",
      alt: "Inside a 20-ft ISO container fitted with electrical cabinets, pumps and water-treatment tanks",
      caption: "Inside a 20-ft ISO life-support container.",
    },
  },
  flooring: {
    related: ["rdmss", "mts", "series-4"],
    photo: {
      src: "/products/mecc/gallery/12-MECC_Internal_Overview_empty_CP.jpg",
      alt: "The empty interior of a MECC command post, with floor boxes set into the floor and lights along the ceiling",
      caption: "A MECC command post before fit-out, with floor boxes for power and data.",
    },
  },
  c2: {
    related: ["rdmss", "ehmecc", "trecc"],
    photo: {
      src: "/products/trecc/gallery/12-TRECC-T_interior_white_light_03.jpg",
      alt: "The white interior of an expanded TRECC-T with black desks and folding chairs",
      caption: "A TRECC-T set up with workstations.",
    },
    story: { href: "/deployments#hqss", label: "The Headquarters Shelter System" },
  },
  medical: {
    related: ["airbeam-lp", "mts", "bmecc"],
    story: { href: "/deployments#covid-mobile-health-units", label: "100-bed field hospitals for COVID-19" },
  },
  aviation: {
    related: ["mex-26", "series-4"],
    photo: {
      src: "/products/airbeam-lp/gallery/08-Airbeam-Low-Pressure-9.jpg",
      alt: "Green Airmax LP inflatable shelters set up inside a hangar beside a Royal Canadian Air Force Hercules",
      caption: "Airmax LP shelters in a hangar beside an RCAF Hercules.",
    },
  },
  camp: {
    related: ["series-4", "mecc", "hercon"],
    photo: {
      src: "/products/series-4/gallery/02-com-S4-PrimerCamp.PlacerDome150.jpg",
      alt: "Rows of red and white Series 4 shelters in a mountain valley camp",
      caption: "Series 4 shelters in a mining camp for Placer Dome.",
    },
    story: { href: "/deployments#more-from-the-field", label: "A 912-person camp in Peru, and other notes from the field" },
  },
};

/** Rows of the page. Layouts follow the material each area has, not a fixed alternation. */
const ROWS: { ids: CapabilityCategoryId[]; layout: "text" | "split" | "pair" | "wide" }[] = [
  { ids: ["shelter"], layout: "text" },
  { ids: ["ecu"], layout: "split" },
  { ids: ["power", "flooring"], layout: "pair" },
  { ids: ["c2"], layout: "split" },
  { ids: ["medical"], layout: "text" },
  { ids: ["aviation"], layout: "wide" },
  { ids: ["camp"], layout: "split" },
];

const BY_ID = Object.fromEntries(CAPABILITY_CATEGORIES.map((c) => [c.id, c])) as Record<CapabilityCategoryId, CapabilityCategory>;

function Related({ slugs, compact = false }: { slugs: string[]; compact?: boolean }) {
  const list = slugs.filter((slug) => PRODUCT_CONTENT[slug]);
  if (compact) {
    return (
      <p className="text-[0.9rem] text-muted">
        <span className="mr-1.5">Related systems:</span>
        {list.map((slug, i) => (
          <span key={slug}>
            <Link href={`/configurable-solutions/${slug}`} className="v2-link">
              {PRODUCT_CONTENT[slug].name}
            </Link>
            {i < list.length - 1 ? ", " : ""}
          </span>
        ))}
      </p>
    );
  }
  return (
    <div>
      <p className="text-[0.9rem] font-semibold text-snow">Related systems</p>
      <ul className="mt-4 grid gap-4 sm:grid-cols-3">
        {list.map((slug) => (
          <li key={slug}>
            <Link href={`/configurable-solutions/${slug}`} className="group flex items-center gap-3 no-underline">
              <span className="relative h-14 w-20 shrink-0 overflow-hidden bg-hull">
                <Image src={productCover(slug)} alt="" fill sizes="80px" {...blurProps(productCover(slug))} className="object-cover" />
              </span>
              <span>
                <span className="block font-semibold text-snow group-hover:text-signal">{PRODUCT_CONTENT[slug].name}</span>
                <span className="block text-[0.875rem] leading-snug text-muted">{PRODUCT_CONTENT[slug].keySpec}</span>
              </span>
            </Link>
          </li>
        ))}
      </ul>
    </div>
  );
}

function Figure({ photo, aspect, sizes }: { photo: Photo; aspect: string; sizes: string }) {
  return (
    <figure>
      <div className={`relative overflow-hidden bg-hull ${aspect}`}>
        <Image src={photo.src} alt={photo.alt} fill sizes={sizes} className="object-cover" {...blurProps(photo.src)} />
      </div>
      <figcaption className="mt-3 text-[0.875rem] text-muted">{photo.caption}</figcaption>
    </figure>
  );
}

function Copy({ c, heading = "h2" }: { c: CapabilityCategory; heading?: "h2" | "h3" }) {
  const d = DETAIL[c.id];
  const H = heading;
  return (
    <>
      <H id={`${c.id}-h`} className={`${heading === "h2" ? "v2-h2" : "v2-h3"} text-snow`}>
        {label(c.label)}
      </H>
      <p className="mt-4 max-w-[52ch] text-[1.15rem] leading-snug text-snow/90">{c.headline}</p>
      {c.paragraphs.map((p) => (
        <p key={p.slice(0, 32)} className="v2-body mt-4 max-w-[60ch]">
          {p}
        </p>
      ))}
      {d.story ? (
        <p className="mt-4 text-[0.95rem]">
          <Link href={d.story.href} className="v2-link">
            {d.story.label}
          </Link>
        </p>
      ) : null}
    </>
  );
}

function Area({ c, layout }: { c: CapabilityCategory; layout: "text" | "split" | "wide" }) {
  const d = DETAIL[c.id];
  return (
    <section id={c.id} aria-labelledby={`${c.id}-h`} className="scroll-mt-28 border-t border-line pt-10">
      {layout === "split" && d.photo ? (
        <div className="grid gap-8 md:grid-cols-2 md:gap-10">
          <div>
            <Copy c={c} />
          </div>
          <Figure photo={d.photo} aspect="aspect-[4/3]" sizes="(min-width: 1024px) 34vw, (min-width: 768px) 50vw, 100vw" />
        </div>
      ) : (
        <Copy c={c} />
      )}
      {layout === "wide" && d.photo ? (
        <div className="mt-8">
          <Figure photo={d.photo} aspect="aspect-[16/9] md:aspect-[21/9]" sizes="(min-width: 1024px) 66vw, 100vw" />
        </div>
      ) : null}
      <div className="mt-8">
        <Related slugs={d.related} />
      </div>
    </section>
  );
}

function Pair({ items }: { items: CapabilityCategory[] }) {
  return (
    <div className="grid gap-12 border-t border-line pt-10 md:grid-cols-2 md:gap-10">
      {items.map((c) => {
        const d = DETAIL[c.id];
        return (
          <section key={c.id} id={c.id} aria-labelledby={`${c.id}-h`} className="scroll-mt-28">
            {d.photo ? (
              <div className="mb-6">
                <Figure photo={d.photo} aspect="aspect-[3/2]" sizes="(min-width: 1024px) 34vw, (min-width: 768px) 50vw, 100vw" />
              </div>
            ) : null}
            <Copy c={c} heading="h2" />
            <div className="mt-5">
              <Related slugs={d.related} compact />
            </div>
          </section>
        );
      })}
    </div>
  );
}

export default function CapabilitiesPage() {
  return (
    <>
      <V2PageHeader
        crumbs={[{ href: "/", label: "Home" }, { label: "Capabilities" }]}
        title="What Weatherhaven supplies with the shelters"
        lead="Climate control, power, flooring and camp layout are planned with the shelters, so a command post, hospital or camp works as soon as it is set up."
        wide
      />
      <div className="bg-ink py-16 sm:py-20">
        <div className="v2-wrap grid gap-12 lg:grid-cols-[15rem_minmax(0,1fr)] lg:gap-16">
          <nav aria-label="Capabilities" className="hidden lg:block">
            <ol className="sticky top-28 space-y-1 border-l border-line">
              {CAPABILITY_CATEGORIES.map((c) => (
                <li key={c.id}>
                  <a href={`#${c.id}`} className="-ml-px block border-l-2 border-transparent py-1.5 pl-4 text-[0.95rem] text-muted no-underline hover:border-signal hover:text-snow">
                    {label(c.label)}
                  </a>
                </li>
              ))}
            </ol>
          </nav>
          <div className="space-y-20">
            {ROWS.map((row) =>
              row.layout === "pair" ? (
                <Pair key={row.ids.join("-")} items={row.ids.map((id) => BY_ID[id])} />
              ) : (
                <Area key={row.ids[0]} c={BY_ID[row.ids[0]]} layout={row.layout} />
              ),
            )}
          </div>
        </div>
      </div>
      <HomeTimeline />
      <section className="border-t border-line bg-hull py-20">
        <div className="v2-wrap flex flex-col gap-8 lg:flex-row lg:items-end lg:justify-between">
          <h2 className="v2-h2 max-w-[22ch] text-snow">Planning a camp rather than a single shelter?</h2>
          <div className="flex flex-col gap-3 sm:flex-row">
            <Link href="/mission-solution-builder" className="v2-btn">
              Open the mission builder
            </Link>
            <Link href="/contact?inquiry=Program%20Requirement" className="v2-btn v2-btn-ghost">
              Describe a program requirement
            </Link>
          </div>
        </div>
      </section>
    </>
  );
}
