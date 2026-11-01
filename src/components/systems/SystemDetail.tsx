import Link from "next/link";
import type { Product } from "@/lib/products";
import { getProductContent, PRODUCT_FAMILIES, showsFullName } from "@/lib/product-content";
import { contactUrl } from "@/lib/contact-url";
import { SystemGallery } from "@/components/systems/SystemGallery";
import { lastCardSpan, SystemCard } from "@/components/systems/SystemCard";
import { blurProps } from "@/lib/image-blur";
import { productCover } from "@/lib/product-covers";
import { TreccViewer } from "@/components/systems/TreccViewer";
import { SystemModelViewer } from "@/components/systems/SystemModelViewer";
import { arHref, systemModel } from "@/lib/system-models";
import { SizeCompare } from "@/components/systems/SizeCompare";
import { sizesForSlug } from "@/lib/system-sizes";
import { HomeDeploySequence } from "@/components/home/v2/HomeDeploySequence";
import { ProductBuying } from "@/components/systems/ProductBuying";
import { ProductProof } from "@/components/systems/ProductProof";
import { ProductSpecBar } from "@/components/systems/ProductSpecBar";

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
  // Systems with a 3D model open on it, and the photos follow: the TRECC on its CAD viewer, the
  // rest on the registry viewer (src/lib/system-models.ts).
  const isTrecc = product.slug === "trecc";
  const hasModel = !isTrecc && !!systemModel(product.slug);
  const leadWith3d = isTrecc || hasModel;
  const ar = arHref(product.slug);
  // Field shots first; the hero used to open on a TRECC parked outside a warehouse.
  const photos = images;
  const blurs = Object.fromEntries(photos.flatMap((src) => (blurProps(src).blurDataURL ? [[src, blurProps(src).blurDataURL as string]] : [])));
  // One element per page carries the card's shared-element name: the 3D stage when the page opens
  // on the model, otherwise the photo viewer.
  const morphName = `system-photo-${product.slug}`;
  const features = product.features.slice(0, 3);
  const keySpec = product.keySpec ?? content?.keySpec;
  // Short published figures for the spec bar (long ones would wrap); none that repeat the key line.
  const barFigures = product.specs
    .filter((s) => s.value.length <= 24 && s.label.length <= 18 && !keySpec?.includes(s.value))
    .slice(0, 2);
  const featureCols = features.length === 2 ? "sm:grid-cols-2" : "sm:grid-cols-3";
  // Two related systems share the row; one or three use the catalog's columns (the last card fills any gap).
  const relatedCols = related.length === 2 ? "sm:grid-cols-2" : "sm:grid-cols-2 lg:grid-cols-3";

  return (
    <article className="bg-ink">
      {/* Opening: name and the main actions, then the system itself (3D model or photos) at full width. */}
      <section id="product-hero" className="border-b border-line pb-16 pt-28 sm:pb-20 sm:pt-32">
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

          <div className="grid grid-cols-1 gap-6 lg:grid-cols-[minmax(0,1fr)_minmax(0,1fr)] lg:gap-14">
            <div className="v2-rise-hero">
              <h1 className="v2-h1 text-snow">{product.name}</h1>
              {showsFullName(product.name, product.subtitle) ? (
                <p className="mt-3 max-w-[30ch] text-[1.0625rem] font-medium text-signal">{product.subtitle}</p>
              ) : null}
            </div>
            <div className="v2-rise-hero v2-rise-2">
              <p className="v2-lead">{product.description}</p>
              <div className="mt-7 flex flex-col gap-3 sm:flex-row sm:flex-wrap">
                <Link href={contactHref} className="v2-btn">
                  Ask about {product.name}
                </Link>
                <Link href={contactUrl({ system: product.slug, inquiry: "Engineer Call" })} className="v2-btn v2-btn-ghost">
                  Talk to an engineer
                </Link>
              </div>
              {/* Secondary actions as one compact row of links, so the buttons stay two on phones. */}
              <nav aria-label={`More for the ${product.name}`} className="mt-6">
                <ul className="flex flex-wrap gap-x-6 gap-y-3 text-[0.9375rem]">
                  <li>
                    {sheet ? (
                      <a href={sheet.href} target="_blank" rel="noopener noreferrer" className="v2-link">
                        Info sheet{sheet.size && sheet.size !== "—" ? ` (PDF, ${sheet.size})` : " (PDF)"}
                      </a>
                    ) : (
                      <a href="#specifications" className="v2-link">
                        Specifications
                      </a>
                    )}
                  </li>
                  <li>
                    <Link href={contactUrl({ system: product.slug, inquiry: "CAD Drawings" })} className="v2-link">
                      Request CAD drawings
                    </Link>
                  </li>
                  {/* Real-scale AR page (model-viewer); a plain link, since /ar pages are standalone. */}
                  {ar ? (
                    <li>
                      <a href={ar} className="v2-link">
                        See it full size in AR
                      </a>
                    </li>
                  ) : null}
                </ul>
              </nav>
            </div>
          </div>

          <div className="mt-10 sm:mt-14">
            {isTrecc ? (
              <TreccViewer key={product.slug} lead transitionName={morphName} />
            ) : hasModel ? (
              <SystemModelViewer key={product.slug} slug={product.slug} name={product.name} lead transitionName={morphName} />
            ) : (
              <SystemGallery key={product.slug} images={photos} name={`Weatherhaven ${product.name}`} transitionName={morphName} blurs={blurs} lead />
            )}
          </div>

          {/* On the TRECC page the numbered callouts under the 3D model carry these facts. */}
          {!isTrecc && features.length > 0 ? (
            <ul className={`mt-8 grid gap-x-10 gap-y-5 ${featureCols}`}>
              {features.map((f) => (
                <li key={f.title} className="border-t border-line pt-4">
                  <p className="text-[1rem] font-semibold text-snow">{f.title}</p>
                  <p className="mt-1 text-[0.9375rem] leading-relaxed text-muted">{f.description}</p>
                </li>
              ))}
            </ul>
          ) : null}
        </div>
      </section>

      {/* Photos follow a 3D opening, edge to edge. */}
      {leadWith3d && photos.length > 0 ? (
        <section aria-labelledby="photos-heading" className="border-b border-line py-16 sm:py-20">
          <div className="v2-wrap">
            <h2 id="photos-heading" className="v2-h2 v2-reveal text-snow">
              Photos
            </h2>
          </div>
          <div className="mt-8 sm:mt-10">
            <SystemGallery key={product.slug} images={photos} name={`Weatherhaven ${product.name}`} blurs={blurs} bleed />
          </div>
        </section>
      ) : null}

      {/* The MECC's scroll drawing lives on its own page now that the homepage shows the TRECC in 3D. */}
      {product.slug === "mecc" ? <HomeDeploySequence /> : null}

      {sizes.length > 0 ? (
        <section aria-labelledby="size-heading" className="v2-light py-20 sm:py-24">
          <div className="v2-wrap">
            <div className="v2-reveal grid gap-4 lg:grid-cols-[minmax(0,1fr)_minmax(0,0.8fr)] lg:items-end">
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

      {/* Specifications and how to buy: the page's data band. */}
      <section
        id="specifications"
        aria-labelledby="spec-heading"
        className={`v2-defer v2-light scroll-mt-24 md:scroll-mt-40 ${sizes.length > 0 ? "pb-20 sm:pb-24" : "py-20 sm:py-24"}`}
      >
        <div
          className={`v2-wrap grid gap-12 lg:grid-cols-[minmax(0,0.8fr)_minmax(0,1.2fr)] lg:gap-16 ${sizes.length > 0 ? "border-t border-line pt-16 sm:pt-20" : ""}`}
        >
          <div>
            <h2 id="spec-heading" className="v2-h2 text-snow">
              Specifications
            </h2>
            {product.specs.length > 0 ? (
              <>
                <p className="mt-4 text-[0.9375rem] text-muted">Figures vary with configuration.</p>
                <Link href={`/configurable-solutions/compare?a=${product.slug}#two-systems`} className="v2-link mt-4 inline-block text-[0.9375rem]">
                  Compare with another system
                </Link>
              </>
            ) : null}
            <ProductBuying product={product} fullName={showsFullName(product.name, product.subtitle) ? product.subtitle : undefined} />
          </div>
          {product.specs.length > 0 ? (
            <div className="v2-plate self-start px-6 py-2 sm:px-8">
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
            <div className="v2-plate self-start px-6 py-8 sm:px-8">
              <p className="text-[1.0625rem] text-snow">
                Sizes, weights and ratings for {product.name} depend on the configuration.
              </p>
              <Link href={contactHref} className="v2-link mt-4 inline-block text-[0.9375rem]">
                Ask for the current data sheet
              </Link>
            </div>
          )}
        </div>
      </section>

      <ProductProof slug={product.slug} name={product.name} specs={product.specs} />

      {/* Background and configurations, only where there is something specific to say */}
      {hasAbout ? (
        <section className="v2-defer border-b border-line py-20 sm:py-24">
          <div className={`v2-wrap grid gap-14 lg:gap-16 ${overview.length > 0 && (configurations.length > 0 || documents.length > 0) ? "lg:grid-cols-2" : ""}`}>
            {overview.length > 0 ? (
              <div className="max-w-[44rem] lg:sticky lg:top-40 lg:self-start">
                <h2 className="v2-h2 text-snow">Overview</h2>
                <div className="mt-6 space-y-5">
                  {overview.map((p) => (
                    <p key={p.slice(0, 40)} className="v2-body text-[1.0625rem] text-snow/80">
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
                          <p className="text-[1.0625rem] font-semibold text-snow">{c.title}</p>
                          <p className="mt-1.5 text-[0.9375rem] leading-relaxed text-muted">{c.description}</p>
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
                          <a href={d.href} target="_blank" rel="noopener noreferrer" className="v2-link text-[0.9375rem]">
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
        <section aria-labelledby="related-heading" className="v2-defer border-b border-line py-20 sm:py-24">
          <div className="v2-wrap">
            <h2 id="related-heading" className="v2-h2 v2-reveal text-snow">
              Often specified with {product.name}
            </h2>
            <div className={`v2-reveal-stagger mt-10 grid gap-x-8 gap-y-14 ${relatedCols}`}>
              {related.map((p, i) => (
                <SystemCard
                  key={p.slug}
                  product={p}
                  blurDataURL={blurProps(productCover(p.slug, p.coverImageUrl)).blurDataURL}
                  span={i === related.length - 1 && related.length !== 2 ? lastCardSpan(related.length) : undefined}
                />
              ))}
            </div>
          </div>
        </section>
      ) : null}

      <ProductSpecBar
        name={product.name}
        keySpec={keySpec}
        figures={barFigures.map((f) => ({ label: f.label, value: f.value }))}
        action={{ href: contactHref, label: `Ask about ${product.name}` }}
        watchId="product-hero"
      />
    </article>
  );
}
