import Link from "next/link";
import type { Product } from "@/lib/products";
import { getProductContent, PRODUCT_FAMILIES, showsFullName } from "@/lib/product-content";
import { contactUrl } from "@/lib/contact-url";
import { SystemGallery } from "@/components/systems/SystemGallery";
import { SystemCard } from "@/components/systems/SystemCard";
import { blurProps } from "@/lib/image-blur";
import { productCover } from "@/lib/product-covers";
import { TreccViewer } from "@/components/systems/TreccViewer";
import { SizeCompare } from "@/components/systems/SizeCompare";
import { sizesForSlug } from "@/lib/system-sizes";
import { HomeDeploySequence } from "@/components/home/v2/HomeDeploySequence";
import { ProductBuying } from "@/components/systems/ProductBuying";
import { ProductProof } from "@/components/systems/ProductProof";

/** The generic placeholder older CMS rows carry; it says nothing about the product. */
const PLACEHOLDER_CONFIGURATION = "Configured to your requirement";

export function SystemDetail({
  product,
  images,
  related,
}: {
  product: Product;
  images: string[];
  related: Product[];
}) {
  const content = getProductContent(product.slug);
  const family = PRODUCT_FAMILIES.find((f) => f.id === content?.family);
  const sheet = product.downloads.find((d) => d.type === "PDF");
  // Only real documents; the generic links to weatherhaven.com that every product carries are left out.
  const documents = product.downloads.filter((d) => d !== sheet && d.type !== "Web");
  const configurations = product.configurations.filter((c) => c.title !== PLACEHOLDER_CONFIGURATION);
  const overview = product.overview.filter((p) => p.trim() && p !== product.description);
  const hasAbout = overview.length > 0 || configurations.length > 0 || documents.length > 0;
  const contactHref = contactUrl({ system: product.slug, inquiry: "Program Requirement" });
  const sizes = sizesForSlug(product.slug);
  // The TRECC is the one system with a real 3D model, so its page opens on it; the photos follow.
  const leadWith3d = product.slug === "trecc";
  // Field shots first; the hero used to open on a TRECC parked outside a warehouse.
  const photos = leadWith3d ? [...images].sort((a, b) => Number(/Woods|T_deployed|Multiple/i.test(b)) - Number(/Woods|T_deployed|Multiple/i.test(a))) : images;
  const gallery = (
    <SystemGallery
      images={photos}
      name={`Weatherhaven ${product.name}`}
      transitionName={`system-photo-${product.slug}`}
      blurs={Object.fromEntries(photos.flatMap((src) => (blurProps(src).blurDataURL ? [[src, blurProps(src).blurDataURL as string]] : [])))}
    />
  );

  return (
    <article className="bg-ink">
      {/* Hero */}
      <section className="border-b border-line pb-16 pt-28 sm:pt-32">
        <div className="v2-wrap">
          <nav aria-label="Breadcrumb" className="mb-8">
            <ol className="v2-tech flex flex-wrap items-center gap-x-2 gap-y-1 text-muted">
              <li>
                <Link href="/configurable-solutions" className="text-muted no-underline hover:text-snow">
                  Systems
                </Link>
              </li>
              {family ? (
                <li className="flex items-center gap-2">
                  <span aria-hidden className="text-line-strong">/</span>
                  <Link href={`/configurable-solutions?family=${family.id}`} className="text-muted no-underline hover:text-snow">
                    {family.name}
                  </Link>
                </li>
              ) : null}
              <li className="flex items-center gap-2">
                <span aria-hidden className="text-line-strong">/</span>
                <span aria-current="page" className="text-snow">
                  {product.name}
                </span>
              </li>
            </ol>
          </nav>

          <div className="grid grid-cols-1 gap-10 lg:grid-cols-[minmax(0,1.3fr)_minmax(0,1fr)] lg:gap-14">
            {leadWith3d ? (
              <TreccViewer lead />
            ) : (
              gallery
            )}
            <div className="flex flex-col">
              <h1 className="v2-h1 text-snow">{product.name}</h1>
              {showsFullName(product.name, product.subtitle) ? (
                <p className="mt-3 text-[1rem] font-medium text-signal">{product.subtitle}</p>
              ) : null}
              <p className="v2-lead mt-6">{product.description}</p>

              {/* On the TRECC page the callouts under the 3D model carry these facts. */}
              {!leadWith3d && product.features.length > 0 ? (
                <ul className="mt-8 border-t border-line">
                  {product.features.slice(0, 3).map((f) => (
                    <li key={f.title} className="grid gap-1 border-b border-line py-4 sm:grid-cols-[11rem_1fr] sm:gap-4">
                      <p className="font-semibold text-snow">{f.title}</p>
                      <p className="text-[0.95rem] leading-relaxed text-muted">{f.description}</p>
                    </li>
                  ))}
                </ul>
              ) : null}

              <div className="mt-8 flex flex-col gap-3 sm:flex-row sm:flex-wrap">
                <Link href={contactHref} className="v2-btn">
                  Ask about {product.name}
                </Link>
                {sheet ? (
                  <a href={sheet.href} target="_blank" rel="noopener noreferrer" className="v2-btn v2-btn-ghost">
                    Download info sheet{sheet.size && sheet.size !== "—" ? ` (PDF, ${sheet.size})` : " (PDF)"}
                  </a>
                ) : (
                  <a href="#specifications" className="v2-btn v2-btn-ghost">
                    See specifications
                  </a>
                )}
                {/* Real-scale AR page (model-viewer); a plain link, since /ar is a standalone page. */}
                {leadWith3d ? (
                  <a href="/ar" className="v2-btn v2-btn-ghost">
                    See it at full size in AR
                  </a>
                ) : null}
              </div>

              <ProductBuying product={product} fullName={showsFullName(product.name, product.subtitle) ? product.subtitle : undefined} />
            </div>
          </div>
        </div>
      </section>

      {leadWith3d ? (
        <section aria-labelledby="photos-heading" className="border-b border-line py-16 sm:py-20">
          <div className="v2-wrap">
            <h2 id="photos-heading" className="v2-h2 text-snow">
              Photos
            </h2>
            <div className="mt-8 max-w-[56rem]">{gallery}</div>
          </div>
        </section>
      ) : null}

      {/* The MECC's scroll drawing lives on its own page now that the homepage shows the TRECC in 3D. */}
      {product.slug === "mecc" ? <HomeDeploySequence /> : null}

      {sizes.length > 0 ? (
        <section aria-labelledby="size-heading" className="border-b border-line py-16 sm:py-20">
          <div className="v2-wrap">
            <div className="grid gap-4 lg:grid-cols-[minmax(0,1fr)_minmax(0,0.8fr)] lg:items-end">
              <h2 id="size-heading" className="v2-h2 text-snow">
                Packed and deployed size
              </h2>
              <p className="v2-body lg:justify-self-end">
                Next to a 20-ft ISO container
                {sizes.some((s) => typeof s.deployed.h === "number") ? " and a 6-ft person" : ""}.
              </p>
            </div>
            <div className="@container mt-10">
              <SizeCompare sizes={sizes} />
            </div>
          </div>
        </section>
      ) : null}

      {/* Specifications */}
      <section id="specifications" aria-labelledby="spec-heading" className="scroll-mt-24 border-b border-line py-20 sm:py-24">
        <div className="v2-wrap grid gap-10 lg:grid-cols-[minmax(0,0.75fr)_minmax(0,1.25fr)] lg:gap-16">
          <div>
            <h2 id="spec-heading" className="v2-h2 text-snow">
              Specifications
            </h2>
            {product.specs.length > 0 ? <p className="mt-4 text-[0.95rem] text-muted">Figures vary with configuration.</p> : null}
          </div>
          {product.specs.length > 0 ? (
            <div className="v2-plate px-6 py-2 sm:px-8">
              <dl>
                {product.specs.map((s) => (
                  <div key={s.label} className="grid gap-1 border-b border-line py-4 last:border-b-0 sm:grid-cols-[minmax(0,0.9fr)_minmax(0,1.4fr)] sm:gap-6">
                    <dt className="v2-tech pt-1 text-muted">{s.label}</dt>
                    <dd className="v2-tnum text-[1rem] font-medium text-snow">{s.value}</dd>
                  </div>
                ))}
              </dl>
            </div>
          ) : (
            <div className="v2-plate px-6 py-8 sm:px-8">
              <p className="text-[1.05rem] text-snow">
                Sizes, weights and ratings for {product.name} depend on the configuration.
              </p>
              <Link href={contactHref} className="v2-link mt-4 inline-block text-[0.95rem]">
                Ask for the current data sheet
              </Link>
            </div>
          )}
        </div>
      </section>

      <ProductProof slug={product.slug} name={product.name} specs={product.specs} />

      {/* Background and configurations, only where there is something specific to say */}
      {hasAbout ? (
        <section className="border-b border-line py-20 sm:py-24">
          <div className={`v2-wrap grid gap-14 lg:gap-16 ${overview.length > 0 && (configurations.length > 0 || documents.length > 0) ? "lg:grid-cols-2" : ""}`}>
            {overview.length > 0 ? (
              <div className="max-w-[44rem]">
                <h2 className="v2-h2 text-snow">Overview</h2>
                <div className="mt-6 space-y-5">
                  {overview.map((p) => (
                    <p key={p.slice(0, 40)} className="v2-body text-[1.05rem] text-snow/80">
                      {p}
                    </p>
                  ))}
                </div>
              </div>
            ) : null}
            {configurations.length > 0 || documents.length > 0 ? (
              <div className="max-w-[44rem]">
                {configurations.length > 0 ? (
                  <>
                    <h2 className="v2-h2 text-snow">Configurations</h2>
                    <ul className="mt-6 border-t border-line">
                      {configurations.map((c) => (
                        <li key={c.title} className="border-b border-line py-5">
                          <p className="text-[1.05rem] font-semibold text-snow">{c.title}</p>
                          <p className="mt-1.5 text-[0.95rem] leading-relaxed text-muted">{c.description}</p>
                        </li>
                      ))}
                    </ul>
                  </>
                ) : null}
                {documents.length > 0 ? (
                  <div className={configurations.length > 0 ? "mt-10" : ""}>
                    <h3 className="text-[1rem] font-semibold text-snow">Documents</h3>
                    <ul className="mt-3 space-y-2">
                      {documents.map((d) => (
                        <li key={d.href}>
                          <a href={d.href} target="_blank" rel="noopener noreferrer" className="v2-link text-[0.95rem]">
                            {d.name}
                          </a>
                        </li>
                      ))}
                    </ul>
                  </div>
                ) : null}
              </div>
            ) : null}
          </div>
        </section>
      ) : null}

      {/* Related */}
      {related.length > 0 ? (
        <section aria-labelledby="related-heading" className="border-b border-line py-20 sm:py-24">
          <div className="v2-wrap">
            <h2 id="related-heading" className="v2-h2 text-snow">
              Often specified with {product.name}
            </h2>
            <div className="mt-10 grid gap-x-8 gap-y-14 sm:grid-cols-2 lg:grid-cols-3">
              {related.map((p) => (
                <SystemCard key={p.slug} product={p} blurDataURL={blurProps(productCover(p.slug, p.coverImageUrl)).blurDataURL} />
              ))}
            </div>
          </div>
        </section>
      ) : null}

    </article>
  );
}
