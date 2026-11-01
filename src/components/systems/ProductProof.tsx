import Image from "next/image";
import Link from "next/link";
import { blurProps } from "@/lib/image-blur";
import { proofFor } from "@/lib/product-proof";
import { flagshipStoryFor } from "@/lib/stories";

/**
 * Programs and deployments that used this system, from the field stories: photo (when the story
 * has its own), place and years, the story's opening line and its hard numbers, and a link to the
 * full account. Products with no story on record don't get the section.
 */
export function ProductProof({ slug, name, specs }: { slug: string; name: string; specs: { value: string }[] }) {
  const { stories, notes } = proofFor(slug, name, specs);
  if (stories.length === 0 && notes.length === 0) return null;
  return (
    <section aria-labelledby="proof-heading" className="v2-defer border-b border-line py-20 sm:py-24">
      <div className="v2-wrap">
        <h2 id="proof-heading" className="v2-h2 text-snow">
          Programs and deployments
        </h2>
        <ul className="mt-10 space-y-6">
          {stories.map(({ story, summary, facts }) => {
            const photo = story.photo;
            const flagship = flagshipStoryFor(story.id);
            return (
              <li key={story.id}>
                <article
                  aria-labelledby={`proof-${story.id}`}
                  className={`grid overflow-hidden border border-line bg-hull ${photo ? "md:grid-cols-[minmax(0,0.9fr)_minmax(0,1.1fr)]" : ""}`}
                >
                  {photo ? (
                    <div className="relative aspect-[16/10] md:aspect-auto md:min-h-[18rem]">
                      <Image
                        src={photo.src}
                        alt={photo.alt}
                        fill
                        sizes="(min-width: 768px) 40vw, 100vw"
                        className="object-cover"
                        {...blurProps(photo.src)}
                      />
                    </div>
                  ) : null}
                  <div className="flex flex-col p-6 sm:p-8">
                    <p className="v2-tech text-muted">
                      <span className="text-snow">{story.place}</span>
                      {story.when ? `, ${story.when}` : ""}
                    </p>
                    <h3 id={`proof-${story.id}`} className="v2-h3 mt-3 max-w-[32ch] text-snow">
                      {story.title}
                    </h3>
                    <p className="mt-3 max-w-[60ch] text-[0.95rem] leading-relaxed text-muted">{summary}</p>
                    {flagship ? (
                      <Link href={`/stories/${flagship.slug}`} className="v2-link mt-5 self-start text-[0.95rem]">
                        Read the story
                      </Link>
                    ) : (
                      <Link href={`/deployments#${story.id}`} className="v2-link mt-5 self-start text-[0.95rem]">
                        Read the full account
                      </Link>
                    )}
                    {facts.length > 0 ? (
                      <dl className="mt-6 grid grid-cols-2 gap-4 border-t border-line pt-5 sm:grid-cols-3">
                        {facts.map((f) => (
                          <div key={f.label} className="min-w-0">
                            <dt className="sr-only">{f.label}</dt>
                            <dd className="v2-figure v2-tnum text-[1.6rem] leading-none text-snow">{f.value}</dd>
                            <dd className="mt-2 text-[0.875rem] leading-snug text-muted">{f.label}</dd>
                          </div>
                        ))}
                      </dl>
                    ) : null}
                  </div>
                </article>
              </li>
            );
          })}
        </ul>
        {notes.length > 0 ? (
          <ul className="mt-8 border-t border-line">
            {notes.map((n) => (
              <li key={n.place} className="grid gap-1 border-b border-line py-4 sm:grid-cols-[14rem_1fr] sm:gap-6">
                <p className="font-semibold text-snow">{n.place}</p>
                <p className="text-[0.95rem] leading-relaxed text-muted">
                  {n.text}{" "}
                  <Link href="/deployments#more-from-the-field" className="underline decoration-line-strong underline-offset-2 hover:text-snow">
                    More from the field
                  </Link>
                </p>
              </li>
            ))}
          </ul>
        ) : null}
      </div>
    </section>
  );
}
