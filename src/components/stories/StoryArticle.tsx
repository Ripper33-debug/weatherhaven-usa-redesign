import Image from "next/image";
import Link from "next/link";
import { blurProps } from "@/lib/image-blur";
import { getProductContent } from "@/lib/product-content";
import { arHref } from "@/lib/system-models";
import { contactUrl } from "@/lib/contact-url";
import { sourceHost } from "@/lib/field-stories";
import { SystemModelViewer } from "@/components/systems/SystemModelViewer";
import { PhotoBand } from "@/components/site/PhotoBand";
import type { FlagshipStory } from "@/lib/stories";

/**
 * A flagship story, read against its timeline: on wide screens the dates stay pinned beside the
 * account as it scrolls; on phones the account comes first and the dates follow. Around that: the
 * title and the photograph (or the 3D model, where there's no field photograph), the hard numbers,
 * a photo set, the quote when there is one, sources, and the systems involved.
 */
/** Columns that keep a short set of figures or photos on full rows. */
function fullRowCols(n: number): string {
  if (n <= 1) return "";
  if (n === 2) return "sm:grid-cols-2";
  if (n === 3) return "sm:grid-cols-3";
  if (n === 4) return "grid-cols-2 lg:grid-cols-4";
  return n % 3 === 0 ? "sm:grid-cols-2 lg:grid-cols-3" : "sm:grid-cols-2";
}

export function StoryArticle({ story, next }: { story: FlagshipStory; next?: FlagshipStory }) {
  const systems = story.systems.map((slug) => ({ slug, name: getProductContent(slug)?.name ?? slug, ar: arHref(slug) }));
  const publicSources = story.sources.filter((s) => !s.own);
  const ownSources = story.sources.filter((s) => s.own);
  const [widePhoto, ...restPhotos] = story.photos;
  const briefing = contactUrl({ system: story.systems[0], inquiry: "Capability Briefing" });

  return (
    <article aria-labelledby="story-title" className="bg-ink">
      {/* Title */}
      <header className="pb-12 pt-32 sm:pb-14 sm:pt-36">
        <div className="v2-wrap">
          <nav aria-label="Breadcrumb" className="mb-8">
            <ol className="v2-tech flex flex-wrap items-center gap-x-2 gap-y-1 text-muted">
              <li>
                <Link href="/deployments" className="text-muted no-underline hover:text-snow">
                  Deployments
                </Link>
              </li>
              <li className="flex items-center gap-2">
                <span aria-hidden className="text-line-strong">
                  /
                </span>
                <Link href="/stories" className="text-muted no-underline hover:text-snow">
                  Stories
                </Link>
              </li>
            </ol>
          </nav>
          <p className="v2-tech text-muted">
            <span className="text-snow">{story.place}</span>
            {story.when ? `, ${story.when}` : null}
          </p>
          <h1 id="story-title" className="v2-display mt-5 max-w-[21ch] text-snow [text-wrap:balance]">
            {story.title}
          </h1>
          <p className="v2-lead mt-7 max-w-[62ch]">{story.dek}</p>
        </div>
      </header>

      {/* The photograph, or the 3D model where there's no field photograph */}
      {story.hero.model ? (
        <div className="v2-wrap">
          <SystemModelViewer slug={story.hero.model} name={systems.find((s) => s.slug === story.hero.model)?.name ?? story.hero.model} lead />
          <p className="mt-2 max-w-[80ch] text-[0.875rem] leading-relaxed text-muted">{story.hero.caption}</p>
        </div>
      ) : (
        <figure>
          <div className="relative h-[58svh] min-h-[20rem] w-full overflow-hidden sm:h-[76svh] sm:max-h-[56rem]">
            <Image
              src={story.hero.src}
              alt={story.hero.alt}
              fill
              priority
              // Next 16's `priority` only preloads; the hero is the page's largest paint.
              fetchPriority="high"
              loading="eager"
              sizes="100vw"
              className="v2-photo object-cover"
              {...blurProps(story.hero.src)}
            />
          </div>
          <figcaption className="v2-wrap mt-3 text-[0.875rem] text-muted">{story.hero.caption}</figcaption>
        </figure>
      )}

      {/* The numbers: a light data band between the photograph and the account */}
      <section aria-label="Key figures" className="v2-light mt-12 py-14 sm:mt-16 sm:py-20">
        <dl className={`v2-wrap v2-reveal-stagger grid gap-x-8 gap-y-10 ${fullRowCols(story.numbers.length)}`}>
          {story.numbers.map((n) => (
            <div key={n.label} className="min-w-0 border-t-2 border-snow pt-4">
              <dt className="sr-only">{n.label}</dt>
              <dd className="v2-figure v2-tnum text-[clamp(1.9rem,4vw,3.25rem)] leading-none text-snow [text-wrap:balance]">{n.value}</dd>
              <dd className="mt-3 max-w-[28ch] text-[0.9375rem] leading-snug text-muted">{n.label}</dd>
            </div>
          ))}
        </dl>
      </section>

      {/* The account beside its timeline */}
      <div className="v2-wrap grid gap-14 py-16 sm:py-20 lg:grid-cols-12 lg:gap-12 lg:py-24">
        <aside aria-labelledby="timeline-heading" className="order-2 lg:order-1 lg:col-span-4">
          <div className="lg:sticky lg:top-28">
            <h2 id="timeline-heading" className="v2-h3 text-snow">
              Timeline
            </h2>
            <ol className="mt-6 border-l border-line-strong">
              {story.timeline.map((t, i) => (
                <li key={`${t.date}-${i}`} className="relative pb-6 pl-6 last:pb-0">
                  <span
                    aria-hidden
                    className={`absolute -left-[5px] top-[0.4rem] h-2.5 w-2.5 ${i === story.timeline.length - 1 ? "bg-signal" : "bg-snow"}`}
                  />
                  <p className="v2-tnum text-[0.95rem] font-semibold text-snow">{t.date}</p>
                  <p className="mt-1 max-w-[40ch] text-[0.95rem] leading-relaxed text-muted">{t.text}</p>
                </li>
              ))}
            </ol>
          </div>
        </aside>

        <div className="order-1 space-y-14 lg:order-2 lg:col-span-7 lg:col-start-6">
          {story.sections.map((s) => (
            <section key={s.heading}>
              <h2 className="v2-h2 max-w-[26ch] text-snow">{s.heading}</h2>
              <div className="mt-5 space-y-4">
                {s.paragraphs.map((p) => (
                  <p key={p.slice(0, 40)} className="v2-body max-w-[64ch] text-[1.0625rem] leading-[1.7] text-snow/85">
                    {p}
                  </p>
                ))}
              </div>
            </section>
          ))}
        </div>
      </div>

      {/* Photo set: the first photograph runs edge to edge, the rest follow on full rows */}
      {widePhoto ? (
        <section aria-label="Photographs" className="pb-16 sm:pb-24">
          <PhotoBand src={widePhoto.src} alt={widePhoto.alt} caption={widePhoto.caption} />
          {restPhotos.length > 0 ? (
            <div className={`v2-wrap v2-reveal-stagger mt-10 grid gap-8 sm:mt-14 ${fullRowCols(restPhotos.length)}`}>
              {restPhotos.map((p) => (
                <figure key={p.src}>
                  <div className="relative aspect-[3/2] overflow-hidden bg-hull">
                    <Image
                      src={p.src}
                      alt={p.alt}
                      fill
                      sizes={restPhotos.length >= 3 ? "(min-width: 1024px) 33vw, (min-width: 640px) 50vw, 100vw" : "(min-width: 640px) 50vw, 100vw"}
                      className="v2-photo object-cover"
                      {...blurProps(p.src)}
                    />
                  </div>
                  <figcaption className="mt-3 text-[0.875rem] text-muted">{p.caption}</figcaption>
                </figure>
              ))}
            </div>
          ) : null}
        </section>
      ) : null}

      {/* Quote */}
      {story.quote?.text ? (
        <section aria-label="Quote" className="border-t border-line py-20 sm:py-28">
          <figure className="v2-wrap v2-reveal">
            <blockquote className="max-w-[30ch] border-l-2 border-signal pl-6 text-[clamp(1.5rem,3.2vw,2.4rem)] leading-[1.2] text-snow [font-variation-settings:'wdth'_106] sm:pl-8">
              “{story.quote.text}”
            </blockquote>
            <figcaption className="mt-5 pl-6 text-[0.95rem] text-muted sm:pl-8">
              <span className="text-snow">{story.quote.name}</span>
              {story.quote.role ? `, ${story.quote.role}` : null}
            </figcaption>
          </figure>
        </section>
      ) : null}

      {/* Systems, sources and the next step */}
      <section aria-labelledby="systems-heading" className="border-t border-line bg-hull py-16 sm:py-20">
        <div className="v2-wrap grid gap-12 lg:grid-cols-12 lg:gap-12">
          <div className="lg:col-span-5">
            <h2 id="systems-heading" className="v2-h2 text-snow">
              {systems.length > 1 ? "The systems" : `The ${systems[0]?.name ?? "system"}`}
            </h2>
            <ul className="mt-6 border-t border-line">
              {systems.map((s) => (
                <li key={s.slug} className="flex flex-wrap items-baseline justify-between gap-x-6 gap-y-2 border-b border-line py-4">
                  <Link href={`/configurable-solutions/${s.slug}`} className="text-[1.1rem] font-semibold text-snow no-underline hover:text-signal">
                    {s.name}
                  </Link>
                  <span className="flex flex-wrap gap-x-5 gap-y-1 text-[0.95rem]">
                    <Link href={`/configurable-solutions/${s.slug}#specifications`} className="v2-link">
                      Specifications
                    </Link>
                    {s.ar ? (
                      <a href={s.ar} className="v2-link">
                        See it full size in AR
                      </a>
                    ) : null}
                  </span>
                </li>
              ))}
            </ul>
            <div className="mt-8 flex flex-col gap-3 sm:flex-row">
              <Link href={briefing} className="v2-btn">
                Request a briefing
              </Link>
              <Link href="/stories" className="v2-btn v2-btn-ghost">
                All stories
              </Link>
            </div>
          </div>

          <div className="space-y-6 text-[0.9375rem] leading-relaxed text-muted lg:col-span-6 lg:col-start-7">
            {story.note ? <p className="text-snow/80">{story.note}</p> : null}
            {publicSources.length > 0 ? (
              <div>
                <h3 className="font-semibold text-snow">{publicSources.length > 1 ? "Sources" : "Source"}</h3>
                <ul className="mt-2 space-y-1.5">
                  {publicSources.map((s) => (
                    <li key={s.href}>
                      <a
                        href={s.href}
                        target="_blank"
                        rel="noopener noreferrer"
                        aria-label={`${s.label}, ${sourceHost(s.href)} (opens in a new tab)`}
                        className="text-muted underline decoration-line-strong underline-offset-2 hover:text-snow"
                      >
                        {s.label}
                      </a>
                    </li>
                  ))}
                </ul>
              </div>
            ) : null}
            {ownSources.length > 0 ? (
              <div>
                <h3 className="font-semibold text-snow">From Weatherhaven&rsquo;s own material</h3>
                <ul className="mt-2 space-y-1.5">
                  {ownSources.map((s) => (
                    <li key={s.href}>
                      <a
                        href={s.href}
                        target="_blank"
                        rel="noopener noreferrer"
                        aria-label={`${s.label}, ${sourceHost(s.href)} (opens in a new tab)`}
                        className="text-muted underline decoration-line-strong underline-offset-2 hover:text-snow"
                      >
                        {s.label}
                      </a>
                    </li>
                  ))}
                </ul>
              </div>
            ) : null}
          </div>
        </div>
      </section>

      {next ? (
        <nav aria-label="Next story">
          <Link href={`/stories/${next.slug}`} className="group relative isolate block no-underline">
            <div className="v2-parallax relative h-[52svh] min-h-[340px] overflow-hidden bg-hull">
              <Image src={next.hero.src} alt="" fill sizes="100vw" className="v2-photo object-cover" {...blurProps(next.hero.src)} />
            </div>
            <div aria-hidden className="pointer-events-none absolute inset-0 bg-gradient-to-t from-ink via-ink/55 to-ink/10" />
            <div className="v2-wrap absolute inset-x-0 bottom-0 pb-12 sm:pb-16">
              <span className="block text-[0.95rem] text-snow/80">
                Next story<span className="text-snow/50">: </span>
                {next.place}
              </span>
              <span className="v2-h1 mt-3 block max-w-[22ch] text-snow transition-colors group-hover:text-signal-soft">{next.title}</span>
            </div>
          </Link>
        </nav>
      ) : null}
    </article>
  );
}
