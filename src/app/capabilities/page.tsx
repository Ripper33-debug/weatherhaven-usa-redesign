import type { Metadata } from "next";
import Image from "next/image";
import Link from "next/link";
import { V2PageHeader } from "@/components/site/V2PageHeader";
import { CAPABILITY_CATEGORIES } from "@/lib/capabilitiesExplorer";
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

export default function CapabilitiesPage() {
  return (
    <>
      <V2PageHeader
        crumbs={[{ href: "/", label: "Home" }, { label: "Capabilities" }]}
        title="Everything a deployed camp needs, from one supplier."
        lead="Shelter is the start. Weatherhaven also plans and supplies the climate control, power, flooring and layouts that turn shelters into a working command post, hospital or camp."
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
            {CAPABILITY_CATEGORIES.map((c) => (
              <section key={c.id} id={c.id} aria-labelledby={`${c.id}-h`} className="scroll-mt-28 border-t border-line pt-10">
                <h2 id={`${c.id}-h`} className="v2-h2 text-snow">
                  {label(c.label)}
                </h2>
                <p className="v2-lead mt-4 max-w-[60ch]">{c.headline}</p>
                <div className="mt-8 grid gap-10 md:grid-cols-[minmax(0,1.1fr)_minmax(0,0.9fr)]">
                  <div className="space-y-4">
                    {c.paragraphs.map((p) => (
                      <p key={p.slice(0, 32)} className="v2-body">
                        {p}
                      </p>
                    ))}
                  </div>
                  <ul className="border-t border-line">
                    {c.features.map((f) => (
                      <li key={f} className="flex gap-3 border-b border-line py-3 text-[0.95rem] text-snow">
                        <span aria-hidden className="mt-2 h-1.5 w-1.5 shrink-0 bg-signal" />
                        {f}
                      </li>
                    ))}
                  </ul>
                </div>
                <div className="mt-10">
                  <p className="text-[0.9rem] font-semibold text-snow">Systems for {label(c.label).toLowerCase()}</p>
                  <ul className="mt-4 grid gap-4 sm:grid-cols-3">
                    {c.relatedSlugs
                      .filter((slug) => PRODUCT_CONTENT[slug])
                      .map((slug) => (
                        <li key={slug}>
                          <Link href={`/configurable-solutions/${slug}`} className="group flex items-center gap-3 no-underline">
                            <span className="relative h-14 w-20 shrink-0 overflow-hidden bg-hull">
                              <Image src={productCover(slug)} alt="" fill sizes="80px" {...blurProps(productCover(slug))} className="object-cover" />
                            </span>
                            <span>
                              <span className="block font-semibold text-snow group-hover:text-signal">{PRODUCT_CONTENT[slug].name}</span>
                              <span className="block text-[0.8rem] leading-snug text-muted">{PRODUCT_CONTENT[slug].keySpec}</span>
                            </span>
                          </Link>
                        </li>
                      ))}
                  </ul>
                </div>
              </section>
            ))}
          </div>
        </div>
      </div>
      <section className="border-t border-line bg-hull py-20">
        <div className="v2-wrap flex flex-col gap-8 lg:flex-row lg:items-end lg:justify-between">
          <h2 className="v2-h2 max-w-[22ch] text-snow">Planning a full camp rather than a single shelter?</h2>
          <div className="flex flex-col gap-3 sm:flex-row">
            <Link href="/mission-solution-builder" className="v2-btn">
              Open mission builder
            </Link>
            <Link href="/contact?inquiry=Program%20Requirement" className="v2-btn v2-btn-ghost">
              Talk to an expert
            </Link>
          </div>
        </div>
      </section>
    </>
  );
}
