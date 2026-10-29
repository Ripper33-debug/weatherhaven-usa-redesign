import Image from "next/image";
import Link from "next/link";
import { blurProps } from "@/lib/image-blur";
import { sourceHost, type DeploymentStory } from "@/lib/field-stories";

function Figures({ story, large = false }: { story: DeploymentStory; large?: boolean }) {
  return (
    <dl className={`grid grid-cols-3 ${large ? "gap-6" : "gap-4 sm:gap-6"}`}>
      {story.figures.map((f) => (
        <div key={f.label} className="min-w-0 border-t border-line-strong pt-4">
          <dt className="sr-only">{f.label}</dt>
          <dd className={`v2-figure v2-tnum text-snow ${large ? "text-[clamp(1.6rem,3.6vw,3rem)]" : "text-[clamp(1.25rem,2.4vw,1.9rem)]"} leading-none`}>
            {f.value}
          </dd>
          <dd className="mt-2 text-[0.85rem] leading-snug text-muted">{f.label}</dd>
        </div>
      ))}
    </dl>
  );
}

function Sources({ story }: { story: DeploymentStory }) {
  return (
    <p className="text-[0.85rem] leading-relaxed text-muted">
      <span className="mr-1.5">Sources:</span>
      {story.sources.map((s, i) => (
        <span key={s.href}>
          <a
            href={s.href}
            target="_blank"
            rel="noopener noreferrer"
            title={s.label}
            aria-label={`${sourceHost(s.href)}: ${s.label} (opens in a new tab)`}
            className="text-muted underline decoration-line-strong underline-offset-2 hover:text-snow"
          >
            {sourceHost(s.href)}
          </a>
          {i < story.sources.length - 1 ? ", " : ""}
        </span>
      ))}
    </p>
  );
}

function Systems({ story }: { story: DeploymentStory }) {
  return (
    <ul className="flex flex-wrap gap-2" aria-label="Weatherhaven systems">
      {story.systems.map((s) => (
        <li key={s.name}>
          <Link
            href={`/configurable-solutions/${s.slug}`}
            className="inline-flex h-9 items-center px-3 text-[0.85rem] font-medium text-snow no-underline shadow-[inset_0_0_0_1px_rgb(148_170_196/0.32)] transition-colors hover:bg-white/[0.05] hover:text-signal"
          >
            {s.name}
          </Link>
        </li>
      ))}
    </ul>
  );
}

function Where({ story }: { story: DeploymentStory }) {
  return (
    <p className="v2-tech text-muted">
      <span className="text-snow">{story.place}</span>
      <span aria-hidden className="mx-2 text-line-strong">
        /
      </span>
      {story.when}
    </p>
  );
}

/** The opening story: full-width photograph, then the account and its figures. */
export function LeadStory({ story }: { story: DeploymentStory }) {
  const photo = story.photo;
  return (
    <article id={story.id} aria-labelledby={`${story.id}-title`} className="scroll-mt-24 border-b border-line">
      {photo ? (
        <figure className="relative">
          <div className="relative h-[62svh] min-h-[22rem] w-full overflow-hidden">
            <Image src={photo.src} alt={photo.alt} fill priority={false} sizes="100vw" className="object-cover" {...blurProps(photo.src)} />
            <div aria-hidden className="absolute inset-0 bg-gradient-to-t from-ink via-ink/30 to-transparent" />
          </div>
          <figcaption className="v2-wrap -mt-10 relative text-right text-[0.85rem] text-muted">{photo.caption}</figcaption>
        </figure>
      ) : null}
      <div className="v2-wrap grid gap-12 pb-20 pt-8 lg:grid-cols-[minmax(0,1.15fr)_minmax(0,1fr)] lg:gap-16 lg:pb-24">
        <div>
          <Where story={story} />
          <h2 id={`${story.id}-title`} className="v2-h1 mt-4 max-w-[18ch] text-snow">
            {story.title}
          </h2>
          <div className="mt-8 space-y-5">
            {story.body.map((p) => (
              <p key={p.slice(0, 32)} className="v2-body text-[1.05rem] text-snow/85">
                {p}
              </p>
            ))}
          </div>
          {story.quote ? (
            <figure className="mt-10 border-l-2 border-signal pl-5">
              <blockquote className="text-[1.25rem] leading-snug text-snow [font-variation-settings:'wdth'_106]">
                “{story.quote.text}”
              </blockquote>
              <figcaption className="mt-2 text-[0.85rem] text-muted">{story.quote.who}</figcaption>
            </figure>
          ) : null}
        </div>
        <div className="flex flex-col gap-10 lg:pt-14">
          <Figures story={story} large />
          <Systems story={story} />
          <Sources story={story} />
        </div>
      </div>
    </article>
  );
}

/** A story with its photograph, or with its figures as the picture when there is no photo. */
export function FieldStory({ story, flip }: { story: DeploymentStory; flip: boolean }) {
  const photo = story.photo;
  return (
    <article id={story.id} aria-labelledby={`${story.id}-title`} className="scroll-mt-24 border-b border-line py-20 sm:py-24">
      <div className="v2-wrap grid gap-10 lg:grid-cols-12 lg:items-center lg:gap-14">
        <div className={`lg:col-span-7 ${flip ? "lg:order-2" : ""}`}>
          {photo ? (
            <figure>
              <div className="relative aspect-[4/3] overflow-hidden lg:aspect-[16/11]">
                <Image src={photo.src} alt={photo.alt} fill sizes="(min-width: 1024px) 56vw, 100vw" className="object-cover" {...blurProps(photo.src)} />
              </div>
              <figcaption className="mt-3 text-[0.85rem] text-muted">{photo.caption}</figcaption>
            </figure>
          ) : (
            <div className="v2-plate v2-chamfer px-6 py-4 sm:px-10 sm:py-6">
              <dl className="divide-y divide-line">
                {story.figures.map((f) => (
                  <div key={f.label} className="flex flex-col gap-2 py-6 sm:flex-row sm:items-baseline sm:gap-8">
                    <dt className="sr-only">{f.label}</dt>
                    <dd className="v2-figure v2-tnum shrink-0 text-[clamp(2.4rem,5vw,4.25rem)] leading-none text-snow sm:min-w-[12rem]">
                      {f.value}
                    </dd>
                    <dd className="text-[0.95rem] leading-snug text-muted">{f.label}</dd>
                  </div>
                ))}
              </dl>
            </div>
          )}
        </div>
        <div className={`lg:col-span-5 ${flip ? "lg:order-1" : ""}`}>
          <Where story={story} />
          <h2 id={`${story.id}-title`} className="v2-h2 mt-4 text-snow">
            {story.title}
          </h2>
          <div className="mt-6 space-y-4">
            {story.body.map((p) => (
              <p key={p.slice(0, 32)} className="v2-body text-[1rem] text-snow/80">
                {p}
              </p>
            ))}
          </div>
          {photo ? (
            <div className="mt-8">
              <Figures story={story} />
            </div>
          ) : null}
          {story.attribution ? <p className="mt-6 text-[0.85rem] italic text-muted">{story.attribution}</p> : null}
          <div className="mt-8 space-y-4">
            <Systems story={story} />
            <Sources story={story} />
          </div>
        </div>
      </div>
    </article>
  );
}
