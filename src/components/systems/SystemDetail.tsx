import Link from "next/link";
import type { Product } from "@/lib/products";
import { getProductContent, PRODUCT_FAMILIES } from "@/lib/product-content";
import { contactUrl } from "@/lib/contact-url";
import { SystemGallery } from "@/components/systems/SystemGallery";
import { SystemCard } from "@/components/systems/SystemCard";
import { COMPANY_CONTACT, companyPhoneHref } from "@/lib/company-facts";

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
  const otherLinks = product.downloads.filter((d) => d !== sheet);
  const contactHref = contactUrl({ system: product.slug, inquiry: "Program Requirement" });

  return (
    <article className="bg-ink">
      {/* Hero */}
      <section className="border-b border-line pb-16 pt-28 sm:pt-32">
        <div className="v2-wrap">
          <nav aria-label="Breadcrumb" className="mb-8">
            <ol className="flex flex-wrap items-center gap-x-2 gap-y-1 text-[0.875rem] text-muted">
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
            <SystemGallery images={images} name={`Weatherhaven ${product.name}`} />
            <div className="flex flex-col">
              <h1 className="v2-h1 text-snow">{product.name}</h1>
              <p className="mt-3 text-[1rem] font-medium text-signal">{product.subtitle}</p>
              <p className="v2-lead mt-6">{product.description}</p>

              {product.features.length > 0 ? (
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
                  Talk to an expert about {product.name}
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
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Specifications */}
      <section id="specifications" aria-labelledby="spec-heading" className="scroll-mt-24 border-b border-line py-20 sm:py-24">
        <div className="v2-wrap grid gap-10 lg:grid-cols-[minmax(0,0.75fr)_minmax(0,1.25fr)] lg:gap-16">
          <div>
            <h2 id="spec-heading" className="v2-h2 text-snow">
              Specifications
            </h2>
            <p className="v2-body mt-4">
              Published figures from Weatherhaven product literature. Exact values depend on configuration; a
              Weatherhaven expert will confirm them for your program.
            </p>
          </div>
          {product.specs.length > 0 ? (
            <div className="v2-plate v2-chamfer px-6 py-2 sm:px-8">
              <dl>
                {product.specs.map((s) => (
                  <div key={s.label} className="grid gap-1 border-b border-line py-4 last:border-b-0 sm:grid-cols-[minmax(0,0.9fr)_minmax(0,1.4fr)] sm:gap-6">
                    <dt className="text-[0.9rem] text-muted">{s.label}</dt>
                    <dd className="v2-tnum text-[1rem] font-medium text-snow">{s.value}</dd>
                  </div>
                ))}
              </dl>
            </div>
          ) : (
            <div className="v2-plate v2-chamfer px-6 py-8 sm:px-8">
              <p className="v2-h3 text-snow">Specifications are released per program.</p>
              <p className="mt-3 text-muted">
                Sizes, weights and ratings for {product.name} depend on the configuration. Ask a Weatherhaven expert
                for the current data sheet.
              </p>
              <Link href={contactHref} className="v2-btn mt-6">
                Request the data sheet
              </Link>
            </div>
          )}
        </div>
      </section>

      {/* Overview + configurations */}
      <section className="border-b border-line py-20 sm:py-24">
        <div className="v2-wrap grid gap-14 lg:grid-cols-2 lg:gap-16">
          <div>
            <h2 className="v2-h2 text-snow">Overview</h2>
            <div className="mt-6 space-y-5">
              {product.overview.map((p) => (
                <p key={p.slice(0, 40)} className="v2-body text-[1.05rem] text-snow/80">
                  {p}
                </p>
              ))}
            </div>
          </div>
          <div>
            <h2 className="v2-h2 text-snow">Configurations</h2>
            <ul className="mt-6 border-t border-line">
              {product.configurations.map((c) => (
                <li key={c.title} className="border-b border-line py-5">
                  <p className="text-[1.05rem] font-semibold text-snow">{c.title}</p>
                  <p className="mt-1.5 text-[0.95rem] leading-relaxed text-muted">{c.description}</p>
                </li>
              ))}
            </ul>
            {otherLinks.length > 0 ? (
              <div className="mt-10">
                <h3 className="text-[1rem] font-semibold text-snow">More from Weatherhaven</h3>
                <ul className="mt-3 space-y-2">
                  {otherLinks.map((d) => (
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
        </div>
      </section>

      {/* Related */}
      {related.length > 0 ? (
        <section aria-labelledby="related-heading" className="border-b border-line py-20 sm:py-24">
          <div className="v2-wrap">
            <h2 id="related-heading" className="v2-h2 text-snow">
              Often specified with {product.name}
            </h2>
            <div className="mt-10 grid gap-x-8 gap-y-14 sm:grid-cols-2 lg:grid-cols-3">
              {related.map((p) => (
                <SystemCard key={p.slug} product={p} />
              ))}
            </div>
          </div>
        </section>
      ) : null}

      {/* Contact */}
      <section className="bg-hull py-20 sm:py-24">
        <div className="v2-wrap grid gap-8 lg:grid-cols-[minmax(0,1fr)_auto] lg:items-end">
          <div>
            <h2 className="v2-h2 max-w-[20ch] text-snow">Scoping a program with {product.name}?</h2>
            <p className="v2-body mt-4">
              Tell us the mission, climate and headcount. You&apos;ll hear back from a Weatherhaven expert, usually
              within 48 hours. Or call the US office at{" "}
              <a href={companyPhoneHref(COMPANY_CONTACT.phone)} className="v2-link">
                {COMPANY_CONTACT.phone}
              </a>
              .
            </p>
          </div>
          <Link href={contactHref} className="v2-btn">
            Talk to an expert
          </Link>
        </div>
      </section>
    </article>
  );
}
