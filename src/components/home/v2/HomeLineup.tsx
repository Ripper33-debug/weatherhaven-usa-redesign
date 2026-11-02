import Image from "next/image";
import Link from "next/link";
import type { CSSProperties } from "react";
import { SYSTEMS_BY_FAMILY } from "@/lib/site-nav";
import { LINEUP, LINEUP_PX_PER_M } from "@/components/home/v2/lineup";
import { LineupFocusPan } from "@/components/home/v2/LineupFocusPan";

/** Display scale (CSS px per image px) at each width; matches --s in polish-home.css. */
const SCALES = { phone: 0.42, tablet: 0.5, wide: 0.68 } as const;
/** The 5 m scale bar at the start of the line. */
const BAR_M = 5;

const SYSTEMS = new Map(SYSTEMS_BY_FAMILY.flatMap((f) => f.systems).map((s) => [s.slug, s]));

/**
 * Every system with a 3D model on the site, deployed and drawn at one scale, smallest to largest
 * (see lineup.ts). Where the browser can drive animations from scrolling, the section pins and the
 * line pans sideways as the page scrolls; otherwise (and with reduced motion) it's a row you swipe
 * or scroll sideways. The strip's width is worked out in CSS from the image widths, so the pinned
 * scroll distance matches it at every screen size without measuring anything.
 */
export function HomeLineup() {
  const items = LINEUP.filter((i) => SYSTEMS.has(i.slug));
  const tallest = Math.max(...items.map((i) => i.h));
  // Each item is as wide as its picture, or its label's minimum; plus the scale bar and the gaps.
  const widths = items.map((i) => `max(${i.w}px * var(--s), var(--v2-home-lineup-label))`).join(" + ");
  const style = {
    "--strip": `calc(${widths} + max(${BAR_M * LINEUP_PX_PER_M}px * var(--s), 4rem) + ${items.length} * var(--v2-home-lineup-gap) + 2 * var(--v2-gutter))`,
    "--tallest": tallest,
  } as CSSProperties;

  return (
    <section aria-labelledby="lineup-heading" className="v2-light v2-home-lineup border-t border-line bg-ink" style={style}>
      <div className="v2-home-lineup-pin flex flex-col">
        <div className="v2-wrap pt-20 sm:pt-28 lg:grid lg:grid-cols-[minmax(0,1fr)_minmax(0,0.8fr)] lg:items-end lg:gap-6">
          <h2 id="lineup-heading" className="v2-h1 max-w-[16ch] text-snow">
            Twelve systems, one scale
          </h2>
          <p className="v2-body mt-5 max-w-[46ch] lg:mt-0 lg:justify-self-end">
            The twelve with 3D models, each drawn deployed at one scale. Soft-wall shelters are shown at one example
            length; they extend further.
          </p>
        </div>

        <div className="v2-home-lineup-view mt-10 flex-1 sm:mt-14">
          <ol className="v2-home-lineup-strip" aria-label="Systems from smallest to largest">
            <li aria-hidden className="v2-home-lineup-item v2-home-lineup-bar" style={{ "--w": BAR_M * LINEUP_PX_PER_M } as CSSProperties}>
              <div className="v2-home-lineup-stage">
                <span className="v2-home-lineup-ruler" />
              </div>
              <p className="mt-4 text-[0.875rem] font-medium text-muted">{BAR_M} m (16 ft)</p>
            </li>
            {items.map((item) => {
              const sys = SYSTEMS.get(item.slug)!;
              return (
                <li key={item.slug} className="v2-home-lineup-item" style={{ "--w": item.w } as CSSProperties}>
                  <Link href={sys.href} className="group block no-underline">
                    <div className="v2-home-lineup-stage">
                      <Image
                        src={`/hero/lineup/${item.slug}-r4.webp`}
                        alt=""
                        width={item.w}
                        height={item.h}
                        sizes={`(max-width: 767px) ${Math.round(item.w * SCALES.phone)}px, (max-width: 1279px) ${Math.round(
                          item.w * SCALES.tablet,
                        )}px, ${Math.round(item.w * SCALES.wide)}px`}
                        className="v2-home-lineup-img"
                      />
                    </div>
                    <span className="mt-4 block text-[1rem] font-semibold text-snow transition-colors [font-variation-settings:'wdth'_106] group-hover:text-signal">
                      {sys.name}
                    </span>
                    <span className="mt-1 block text-[0.875rem] leading-snug text-muted">{sys.keySpec}</span>
                  </Link>
                </li>
              );
            })}
          </ol>
        </div>

        <div className="v2-wrap pb-10 pt-8 sm:pb-14">
          <div aria-hidden className="v2-home-lineup-track">
            <span className="v2-home-lineup-progress" />
          </div>
        </div>
      </div>
      <LineupFocusPan />
    </section>
  );
}
