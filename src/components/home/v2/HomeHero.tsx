import Link from "next/link";
import { HeroFieldReadoutLive } from "@/components/home/v2/HeroFieldReadoutLive";
import { HOMEPAGE_DEFAULTS, type HomepageCopy } from "@/sanity/content";
import { HeroFilm } from "@/components/home/v2/HeroFilm";

/**
 * Full-bleed film hero (see HeroFilm: an illustrative film made from Weatherhaven's product
 * photography, labelled as such along the bottom). The headline sits over the darkened lower left;
 * a one-line weather note from two deployment sites runs along the bottom once the forecast
 * service has answered (loaded after the page, see HeroFieldReadoutLive).
 */
export function HomeHero({ copy = HOMEPAGE_DEFAULTS }: { copy?: HomepageCopy }) {
  return (
    <section className="relative isolate flex flex-col overflow-hidden bg-ink md:min-h-[100svh] md:justify-end">
      {/* Phones: the film is a band above the copy. Wider screens: full bleed behind it. */}
      <div className="relative h-[54svh] min-h-[300px] md:absolute md:inset-0 md:-z-20 md:h-auto">
        <HeroFilm />
        <div
          aria-hidden
          className="pointer-events-none absolute inset-0 bg-[linear-gradient(180deg,rgb(10_15_23/0.6)_0%,rgb(10_15_23/0)_24%,rgb(10_15_23/0)_62%,#0a0f17_100%)] md:hidden"
        />
      </div>
      <div
        aria-hidden
        className="pointer-events-none absolute inset-0 -z-10 hidden md:block"
        style={{
          background:
            "linear-gradient(180deg, rgb(10 15 23 / 0.55) 0%, rgb(10 15 23 / 0) 22%), linear-gradient(90deg, rgb(10 15 23 / 0.9) 0%, rgb(10 15 23 / 0.72) 30%, rgb(10 15 23 / 0.25) 55%, rgb(10 15 23 / 0) 70%), linear-gradient(0deg, rgb(10 15 23 / 0.96) 0%, rgb(10 15 23 / 0.35) 40%, rgb(10 15 23 / 0) 62%)",
        }}
      />

      <div className="v2-wrap relative -mt-6 pb-8 sm:pb-12 md:mt-0 md:pt-32 lg:pb-14">
        <h1 className="v2-display v2-rise-hero max-w-[20ch] text-snow">{copy.heroHeadline}</h1>
        <p className="v2-lead v2-rise v2-rise-2 mt-6 max-w-[56ch] sm:mt-8">{copy.heroLead}</p>
        {/* Phones have the same actions in the fixed bar along the bottom of the screen. */}
        <div className="v2-rise v2-rise-3 mt-9 hidden flex-col gap-3 sm:flex-row sm:items-center md:flex">
          <Link href="/configurable-solutions" className="v2-btn">
            See the systems
          </Link>
          <Link href="/government" className="v2-btn v2-btn-ghost">
            Contracting details
          </Link>
        </div>
      </div>

      <div className="v2-wrap pb-[calc(5.5rem+env(safe-area-inset-bottom,0px))] md:pb-6">
        <div className="flex flex-col gap-2 border-t border-line-strong pt-4 text-[0.875rem] leading-snug text-muted sm:flex-row sm:items-baseline sm:justify-between sm:gap-8">
          <HeroFieldReadoutLive />
          <p className="shrink-0">{copy.filmCaption}</p>
        </div>
      </div>
    </section>
  );
}
