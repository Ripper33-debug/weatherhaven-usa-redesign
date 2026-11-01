import Link from "next/link";
import type { Product } from "@/lib/products";
import { PROCUREMENT } from "@/lib/procurement";
import { buyingRecordsFor, specMailto, specSheetPath } from "@/lib/product-buying";
import { getSiteUrl } from "@/lib/site-url";
import { SendSpecsLink } from "@/components/systems/SendSpecsLink";

/**
 * Buying information under the product's main buttons: what's on public contract record for this
 * system, the CAGE code, and the printable spec sheet a program office can forward.
 */
export function ProductBuying({ product, fullName }: { product: Product; fullName?: string }) {
  const records = buyingRecordsFor(product.slug);
  return (
    <section aria-labelledby="buy-heading" className="mt-12 border-t border-line pt-8">
      <h2 id="buy-heading" className="v2-h3 text-snow">
        How to buy
      </h2>
      {records.length > 0 ? (
        <ul className="mt-4 space-y-5">
          {records.map((r) => (
            <li key={r.buyer + r.ids.join()}>
              <p className="v2-tech text-muted">{r.buyer}</p>
              <p className="mt-1 text-[0.9375rem] leading-relaxed text-snow/90">{r.text}</p>
              {r.ids.length || r.source ? (
                <p className="mt-2 flex flex-wrap items-center gap-x-3 gap-y-2 text-[0.875rem] text-muted">
                  {r.ids.map((id) => (
                    <span key={id} className="v2-code px-2 py-0.5 text-[0.875rem] text-snow shadow-[inset_0_0_0_1px_var(--color-line-strong)]">
                      {id}
                    </span>
                  ))}
                  {r.source ? (
                    <a
                      href={r.source.href}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="underline decoration-line-strong underline-offset-2 hover:text-snow"
                    >
                      {r.source.label}
                    </a>
                  ) : null}
                </p>
              ) : null}
            </li>
          ))}
        </ul>
      ) : (
        <p className="mt-3 text-[0.9375rem] leading-relaxed text-snow/90">
          Order through {PROCUREMENT.legalName}, the US company, as a new requirement or under an existing
          agreement.
        </p>
      )}
      <p className="mt-5 text-[0.9375rem] text-muted">
        CAGE <span className="v2-code text-snow">{PROCUREMENT.cage}</span>.{" "}
        <Link href="/government" className="underline decoration-line-strong underline-offset-2 hover:text-snow">
          UEI, NAICS codes and contract vehicles
        </Link>
      </p>
      <p className="mt-5 flex flex-col gap-2 text-[0.9375rem] sm:flex-row sm:flex-wrap sm:gap-x-6">
        <Link href={specSheetPath(product.slug)} className="v2-link">
          Printable spec sheet
        </Link>
        <SendSpecsLink
          href={specMailto(
            {
              slug: product.slug,
              name: product.name,
              fullName,
              description: product.description,
              specs: product.specs.map((s) => ({ label: s.label, value: s.value })),
            },
            getSiteUrl(),
          )}
          fallbackOrigin={getSiteUrl()}
        />
      </p>
    </section>
  );
}
