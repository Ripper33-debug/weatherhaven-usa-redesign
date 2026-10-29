import Image from "next/image";
import Link from "next/link";
import { blurProps } from "@/lib/image-blur";
import { sourceHost, type DeploymentStory } from "@/lib/field-stories";

function Where({ story }: { story: DeploymentStory }) {
  return (
    <p className="v2-tech text-muted">
      <span className="text-snow">{story.place}</span>
      {story.when ? `, ${story.when}` : null}
    </p>
  );
}

function Facts({ story, large = false }: { story: DeploymentStory; large?: boolean }) {
  if (!story.facts?.length) return null;
  return (
    <dl className="grid grid-cols-2 gap-6">
      {story.facts.map((f) => (
        <div key={f.label} className="min-w-0 border-t border-line-strong pt-4">
          <dt className="sr-only">{f.label}</dt>
          <dd
            className={`v2-figure v2-tnum leading-none text-snow ${
              large ? "text-[clamp(2rem,4vw,3.25rem)]" : "text-[clamp(1.5rem,2.6vw,2.1rem)]"
            }`}
          >
            {f.value}
          </dd>
          <dd className="mt-2 text-[0.875rem] leading-snug text-muted">{f.label}</dd>
        </div>
      ))}
    </dl>
  );
}

/** Systems and sources as one quiet footnote block. */
function Footnote({ story }: { story: DeploymentStory }) {
  return (
    <div className="space-y-1.5 text-[0.875rem] leading-relaxed text-muted">
      <p>
        <span className="mr-1.5">{story.systems.length > 1 ? "Systems:" : "System:"}</span>
        {story.systems.map((s, i) => (
          <span key={s.slug}>
            <Link href={`/configurable-solutions/${s.slug}`} className="v2-link">
              {s.name}
            </Link>
            {i < story.systems.length - 1 ? ", " : ""}
          </span>
        ))}
      </p>
      {story.sources.length ? (
        <div>
          <p>{story.sources.length > 1 ? "Sources" : "Source"}</p>
          <ul className="mt-1 space-y-1">
            {story.sources.map((s) => (
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
  );
}

function Quote({ story }: { story: DeploymentStory }) {
  if (!story.quote) return null;
  return (
    <figure className="border-l-2 border-signal pl-5">
      <blockquote className="text-[1.2rem] leading-snug text-snow [font-variation-settings:'wdth'_106]">
        “{story.quote.text}”
      </blockquote>
      <figcaption className="mt-2 text-[0.875rem] text-muted">{story.quote.who}</figcaption>
    </figure>
  );
}

/** The opening story, set in type: a large headline, the account, and its two contract figures. */
export function LeadStory({ story }: { story: DeploymentStory }) {
  return (
    <article id={story.id} aria-labelledby={`${story.id}-title`} className="scroll-mt-24 border-b border-line">
      <div className="v2-wrap grid gap-12 py-20 lg:grid-cols-[minmax(0,1.25fr)_minmax(0,0.75fr)] lg:gap-20 lg:py-28">
        <div>
          <Where story={story} />
          <h2 id={`${story.id}-title`} className="v2-h1 mt-4 max-w-[20ch] text-snow">
            {story.title}
          </h2>
          <div className="mt-8 max-w-[64ch] space-y-5">
            {story.body.map((p) => (
              <p key={p.slice(0, 32)} className="v2-body text-[1.05rem] text-snow/85">
                {p}
              </p>
            ))}
          </div>
        </div>
        <div className="flex flex-col gap-10 lg:pt-16">
          <Facts story={story} large />
          <Footnote story={story} />
        </div>
      </div>
    </article>
  );
}

/**
 * A story told around its photograph. "wide" runs the photo across the page with the account
 * below it in two columns; "left" and "right" set the photo beside the account.
 */
export function FeatureStory({ story, layout }: { story: DeploymentStory; layout: "wide" | "left" | "right" }) {
  const photo = story.photo;
  if (layout === "wide" && photo) {
    return (
      <article id={story.id} aria-labelledby={`${story.id}-title`} className="scroll-mt-24 border-b border-line">
        <figure>
          <div className="relative h-[56svh] min-h-[20rem] w-full overflow-hidden">
            <Image src={photo.src} alt={photo.alt} fill sizes="100vw" className="object-cover" {...blurProps(photo.src)} />
          </div>
          <figcaption className="v2-wrap mt-3 text-[0.875rem] text-muted">{photo.caption}</figcaption>
        </figure>
        <div className="v2-wrap grid gap-10 pb-20 pt-10 lg:grid-cols-[minmax(0,1.1fr)_minmax(0,0.9fr)] lg:gap-16 lg:pb-24">
          <div>
            <Where story={story} />
            <h2 id={`${story.id}-title`} className="v2-h2 mt-4 max-w-[22ch] text-snow">
              {story.title}
            </h2>
            <div className="mt-6 space-y-4">
              {story.body.map((p) => (
                <p key={p.slice(0, 32)} className="v2-body text-snow/85">
                  {p}
                </p>
              ))}
            </div>
          </div>
          <div className="flex flex-col gap-8 lg:pt-10">
            <Quote story={story} />
            <Facts story={story} />
            <Footnote story={story} />
          </div>
        </div>
      </article>
    );
  }
  const photoRight = layout === "right";
  return (
    <article id={story.id} aria-labelledby={`${story.id}-title`} className="scroll-mt-24 border-b border-line py-20 sm:py-24">
      <div className="v2-wrap grid gap-10 lg:grid-cols-12 lg:items-start lg:gap-14">
        {photo ? (
          <figure className={`lg:col-span-7 ${photoRight ? "lg:order-2" : ""}`}>
            <div className="relative aspect-[4/3] overflow-hidden lg:aspect-[16/11]">
              <Image src={photo.src} alt={photo.alt} fill sizes="(min-width: 1024px) 56vw, 100vw" className="object-cover" {...blurProps(photo.src)} />
            </div>
            <figcaption className="mt-3 text-[0.875rem] text-muted">{photo.caption}</figcaption>
          </figure>
        ) : null}
        <div className={photo ? `lg:col-span-5 ${photoRight ? "lg:order-1" : ""}` : "lg:col-span-8"}>
          <Where story={story} />
          <h2 id={`${story.id}-title`} className="v2-h2 mt-4 text-snow">
            {story.title}
          </h2>
          <div className="mt-6 space-y-4">
            {story.body.map((p) => (
              <p key={p.slice(0, 32)} className="v2-body text-[1rem] text-snow/85">
                {p}
              </p>
            ))}
          </div>
          {story.facts?.length ? (
            <div className="mt-8">
              <Facts story={story} />
            </div>
          ) : null}
          <div className="mt-8">
            <Footnote story={story} />
          </div>
        </div>
      </div>
    </article>
  );
}

/** A short account: no photograph, no figures, the number in the text. */
export function BriefStory({ story }: { story: DeploymentStory }) {
  return (
    <article id={story.id} aria-labelledby={`${story.id}-title`} className="scroll-mt-24 border-t border-line pt-6">
      <Where story={story} />
      <h3 id={`${story.id}-title`} className="v2-h3 mt-3 max-w-[30ch] text-snow">
        {story.title}
      </h3>
      <div className="mt-4 space-y-3">
        {story.body.map((p) => (
          <p key={p.slice(0, 32)} className="text-[0.975rem] leading-relaxed text-snow/80">
            {p}
          </p>
        ))}
      </div>
      <div className="mt-5">
        <Footnote story={story} />
      </div>
    </article>
  );
}
