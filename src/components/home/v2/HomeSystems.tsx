import Image from "next/image";
import Link from "next/link";
import { ViewTransition } from "react";
import { SYSTEMS_BY_FAMILY } from "@/lib/site-nav";
import { blurProps } from "@/lib/image-blur";

type Shape = "lead" | "tall" | "wide" | "square";

/**
 * The homepage's systems, as one mosaic of field photographs: nine systems across the four
 * families, each tile only its name and family, each opening its product page. The photo wrapper
 * shares its view-transition name with the product page's main photo or 3D stage, so the tile
 * morphs into the page it opens (one name per system on this page; nothing else here uses it).
 *
 * Every photo is a Weatherhaven photo of the system named on it.
 *
 * Grid: three columns on wide screens, two below (phones included). Tile order and spans are set
 * so every row ends full at both widths; under 1024px the MTS and Polar Chief tiles move after
 * Endurance (order) so the tall Endurance tile has a neighbour column.
 */
const TILES: { slug: string; src: string; position: string; shape: Shape; order?: string }[] = [
  { slug: "ehmecc", src: "/products/ehmecc/gallery/08-EHMECC.jpg", position: "60% 62%", shape: "lead" },
  { slug: "trecc", src: "/products/trecc/gallery/07-TRECC-4.jpg", position: "48% 50%", shape: "tall" },
  { slug: "mecc", src: "/products/mecc/gallery/20-MIL-MECC-7.jpg", position: "50% 60%", shape: "square" },
  { slug: "ateps", src: "/products/ateps/gallery/01-ATEPS-2.jpg", position: "34% 50%", shape: "square" },
  { slug: "airbeam-lp", src: "/products/airbeam-lp/gallery/08-Airbeam-Low-Pressure-9.jpg", position: "50% 64%", shape: "wide" },
  { slug: "series-4", src: "/products/series-4/gallery/02-com-S4-PrimerCamp.PlacerDome150.jpg", position: "42% 62%", shape: "square" },
  { slug: "mts", src: "/products/mts/gallery/14-MIL-MTS2Exterior.jpg", position: "40% 56%", shape: "square", order: "max-lg:order-1" },
  { slug: "endurance", src: "/products/endurance.jpg", position: "60% 50%", shape: "tall" },
  { slug: "polar-chief", src: "/products/polar-chief/gallery/01-com-PolarChief149.jpg", position: "50% 62%", shape: "wide", order: "max-lg:order-2" },
];

const FAMILY_SINGULAR: Record<string, string> = {
  expandable: "Expandable container",
  softwall: "Soft-wall shelter",
  inflatable: "Inflatable shelter",
  polar: "Polar shelter",
};

const SPAN: Record<Shape, string> = {
  lead: "col-span-2 row-span-2 lg:col-span-3",
  tall: "row-span-2",
  wide: "col-span-2",
  square: "",
};

const SIZES: Record<Shape, string> = {
  lead: "100vw",
  tall: "(max-width: 1023px) 50vw, 33vw",
  wide: "(max-width: 1023px) 100vw, 66vw",
  square: "(max-width: 1023px) 50vw, 33vw",
};

const SYSTEMS = new Map(
  SYSTEMS_BY_FAMILY.flatMap((f) => f.systems.map((s) => [s.slug, { ...s, family: f.id }] as const)),
);
const TOTAL = SYSTEMS.size;

const NUMBER_WORDS = ["zero", "one", "two", "three", "four", "five", "six", "seven", "eight", "nine", "ten", "eleven", "twelve", "thirteen", "fourteen", "fifteen", "sixteen", "seventeen", "eighteen", "nineteen", "twenty"];
const inWords = (n: number) => NUMBER_WORDS[n] ?? String(n);

export function HomeSystems() {
  const tiles = TILES.filter((t) => SYSTEMS.has(t.slug));

  return (
    <section aria-labelledby="systems-heading" className="v2-defer border-t border-line bg-ink pb-16 pt-20 sm:pb-24 sm:pt-28">
      <div className="v2-wrap v2-reveal flex flex-col gap-5 sm:flex-row sm:items-end sm:justify-between sm:gap-10">
        <h2 id="systems-heading" className="v2-h1 max-w-[19ch] text-snow">
          {`${inWords(TOTAL).replace(/^./, (c) => c.toUpperCase())} systems, four families`}
        </h2>
        <Link href="/configurable-solutions" className="v2-link shrink-0 text-[1rem]">
          See all {TOTAL}
        </Link>
      </div>

      <ul className="v2-home-mosaic v2-reveal-stagger mt-10 grid grid-cols-2 gap-1.5 px-1.5 sm:mt-14 sm:gap-2 sm:px-2 lg:grid-cols-3">
        {tiles.map((t) => {
          const sys = SYSTEMS.get(t.slug)!;
          const lead = t.shape === "lead";
          return (
            <li key={t.slug} className={`${SPAN[t.shape]} ${t.order ?? ""}`}>
              <Link href={sys.href} className="v2-press group relative block h-full overflow-hidden bg-hull no-underline">
                <ViewTransition name={`system-photo-${t.slug}`} share="v2-morph" default="none">
                  <div className="v2-media-zoom absolute inset-0">
                    <Image
                      src={t.src}
                      alt=""
                      fill
                      sizes={SIZES[t.shape]}
                      className="v2-photo object-cover"
                      style={{ objectPosition: t.position }}
                      {...blurProps(t.src)}
                    />
                  </div>
                </ViewTransition>
                <span
                  aria-hidden
                  className="pointer-events-none absolute inset-x-0 bottom-0 h-[58%] bg-[linear-gradient(0deg,rgb(10_15_23/0.82)_0%,rgb(10_15_23/0.32)_48%,rgb(10_15_23/0)_100%)]"
                />
                <span className={`absolute bottom-0 left-0 right-0 flex flex-col ${lead ? "p-5 sm:p-8" : "p-3.5 sm:p-5"}`}>
                  <span
                    className={`font-semibold leading-none text-snow [font-variation-settings:'wdth'_112] ${
                      lead ? "text-[clamp(1.75rem,3.4vw,3rem)] tracking-[-0.02em]" : "text-[clamp(1.15rem,1.7vw,1.6rem)] tracking-[-0.01em]"
                    }`}
                  >
                    {sys.name}
                  </span>
                  <span className={`mt-1.5 text-snow/75 ${lead ? "text-[1rem]" : "text-[0.875rem] max-sm:sr-only"}`}>
                    {FAMILY_SINGULAR[sys.family] ?? ""}
                  </span>
                </span>
              </Link>
            </li>
          );
        })}
      </ul>

      <nav aria-label="Systems by family" className="v2-wrap mt-12 sm:mt-16">
        <ul className="grid grid-cols-2 border-t border-line lg:grid-cols-4">
          {SYSTEMS_BY_FAMILY.map((f) => (
            <li key={f.id} className="border-b border-line">
              <Link
                href={`/configurable-solutions?family=${f.id}`}
                className="group flex h-full flex-col gap-1 py-5 pr-4 no-underline sm:py-6"
              >
                <span className="text-[1.05rem] font-semibold text-snow transition-colors [font-variation-settings:'wdth'_106] group-hover:text-signal">
                  {f.name}
                </span>
                <span className="text-[0.875rem] text-muted">
                  {f.systems.length} {f.systems.length === 1 ? "system" : "systems"}
                </span>
              </Link>
            </li>
          ))}
        </ul>
      </nav>
    </section>
  );
}
