import type { Metadata } from "next";
import Image from "next/image";
import Link from "next/link";
import { V2PageHeader } from "@/components/site/V2PageHeader";
import { getFlagshipStories } from "@/lib/stories";
import { blurProps } from "@/lib/image-blur";
import { pageMeta } from "@/lib/page-meta";

export const metadata: Metadata = pageMeta({
  title: "Program stories",
  description:
    "Three Weatherhaven programs in depth: TRECC with the US Army, Canada's 1,435 headquarters shelters, and the Series 4 drill shelter for million-year-old ice in Antarctica.",
  path: "/stories",
  image: "/products/series-4/gallery/12-S4-Truss-Little-Dome-EPICA-1.jpeg",
});

export default async function StoriesPage() {
  const stories = await getFlagshipStories();
  return (
    <>
      <V2PageHeader
        crumbs={[{ href: "/deployments", label: "Deployments" }, { label: "Stories" }]}
        title="Three programs in depth"
        lead="How the US Army, the Canadian Armed Forces and an Antarctic research team use Weatherhaven shelters: what they needed, what was built and what happened next. Public sources are linked, and claims from Weatherhaven's own material are marked."
        wide
      />
      <div className="bg-ink">
        <ol className="v2-wrap divide-y divide-line">
          {stories.map((s) => (
            <li key={s.slug} className="py-14 sm:py-20">
              <article aria-labelledby={`story-${s.slug}`} className="group relative grid gap-8 lg:grid-cols-12 lg:items-center lg:gap-12">
                <div className="relative aspect-[16/10] overflow-hidden bg-hull lg:col-span-7">
                  <Image
                    src={s.hero.src}
                    alt={s.hero.alt}
                    fill
                    sizes="(min-width: 1024px) 58vw, 100vw"
                    className="object-cover transition-transform duration-700 motion-safe:group-hover:scale-[1.02]"
                    {...blurProps(s.hero.src)}
                  />
                  {s.hero.model ? (
                    <p className="absolute bottom-2 left-2 bg-ink/75 px-2 py-1 text-[0.75rem] text-snow/85 backdrop-blur-sm">3D model</p>
                  ) : null}
                </div>
                <div className="lg:col-span-5">
                  <p className="v2-tech text-muted">
                    <span className="text-snow">{s.place}</span>
                    {s.when ? `, ${s.when}` : null}
                  </p>
                  <h2 id={`story-${s.slug}`} className="v2-h2 mt-4 max-w-[22ch] text-snow">
                    <Link href={`/stories/${s.slug}`} className="no-underline after:absolute after:inset-0 group-hover:text-signal">
                      {s.title}
                    </Link>
                  </h2>
                  <p className="v2-body mt-4 max-w-[52ch] text-snow/80">{s.dek}</p>
                  <dl className="mt-7 grid grid-cols-2 gap-6">
                    {s.numbers.slice(0, 2).map((n) => (
                      <div key={n.label} className="min-w-0 border-t border-line-strong pt-3">
                        <dt className="sr-only">{n.label}</dt>
                        <dd className="v2-figure v2-tnum text-[1.7rem] leading-none text-snow">{n.value}</dd>
                        <dd className="mt-2 text-[0.85rem] leading-snug text-muted">{n.label}</dd>
                      </div>
                    ))}
                  </dl>
                  <p className="mt-7 text-[0.95rem] text-signal">Read the story</p>
                </div>
              </article>
            </li>
          ))}
        </ol>
      </div>
    </>
  );
}
