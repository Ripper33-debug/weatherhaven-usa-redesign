import type { Metadata } from "next";
import Image from "next/image";
import Link from "next/link";
import { notFound } from "next/navigation";
import { getPublishedProductBySlug, listPublishedProducts } from "@/app/api/_lib/catalog-products";
import { pageMeta } from "@/lib/page-meta";
import { showsFullName } from "@/lib/product-content";
import { PROCUREMENT } from "@/lib/procurement";
import { COMPANY_CONTACT } from "@/lib/company-facts";
import { sizesForSlug } from "@/lib/system-sizes";
import { PageUrl, PrintButton, TodayDate } from "@/components/systems/SpecSheetActions";

type Props = { params: Promise<{ slug: string }> };

export const revalidate = 60;

export async function generateStaticParams() {
  const products = await listPublishedProducts();
  return products.map((p) => ({ slug: p.slug }));
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { slug } = await params;
  const product = await getPublishedProductBySlug(slug);
  if (!product) return { title: "System not found" };
  return {
    ...pageMeta({
      title: `${product.name} spec sheet`,
      description: `Printable specification sheet for the Weatherhaven ${product.name}, with the US company's CAGE code and UEI.`,
      path: `/configurable-solutions/${product.slug}/spec-sheet`,
    }),
    robots: { index: false, follow: true },
  };
}

/** Print: only the sheet, on white, at letter size. The site's header and footer drop out. */
const PRINT_CSS = `
@media print {
  @page { size: letter; margin: 0.55in; }
  html, body { background: #fff !important; }
  [data-global-nav], [data-global-footer], [data-print-hide] { display: none !important; }
  body * { visibility: hidden; }
  #spec-sheet, #spec-sheet * { visibility: visible; }
  #spec-sheet { box-shadow: none !important; padding: 0 !important; max-width: none !important; }
}
`;

const SIZE_LABEL = /packed|stowed|deployed|footprint|dimension/i;

/**
 * A one-page spec sheet a program office can print, save as PDF or forward to contracting:
 * the published specifications, packed and deployed size, and the US company's identifiers.
 */
export default async function SpecSheetPage({ params }: Props) {
  const { slug } = await params;
  const product = await getPublishedProductBySlug(slug);
  if (!product) notFound();

  const fullName = showsFullName(product.name, product.subtitle) ? product.subtitle : undefined;
  // Packed and deployed size, unless the spec table already gives it.
  const sizes = product.specs.some((s) => SIZE_LABEL.test(s.label)) ? [] : sizesForSlug(product.slug);
  const address = COMPANY_CONTACT.headquartersAddress.replace(", United States", "");

  return (
    <div className="bg-ink pb-24 pt-28 sm:pt-32 print:bg-white print:p-0">
      <style>{PRINT_CSS}</style>
      <div className="v2-wrap">
        <div data-print-hide className="mx-auto mb-6 flex max-w-[8.5in] flex-wrap items-center justify-between gap-4">
          <Link href={`/configurable-solutions/${product.slug}`} className="v2-link text-[0.95rem]">
            Back to {product.name}
          </Link>
          <PrintButton />
        </div>

        <div
          id="spec-sheet"
          className="mx-auto max-w-[8.5in] bg-white px-7 py-9 text-[#14181f] shadow-[0_24px_60px_rgb(0_0_0/0.45)] sm:px-12 sm:py-12"
        >
          <header className="flex flex-wrap items-end justify-between gap-4 border-b-2 border-[#14181f] pb-5">
            <Image src="/weatherhaven-logo@2x.png" alt="Weatherhaven" width={200} height={19} style={{ width: 200, height: "auto" }} />
            <p className="text-[0.8125rem] text-[#4a5361]">Specification sheet</p>
          </header>

          <h1 className="mt-8 text-[2rem] font-semibold leading-tight [font-variation-settings:'wdth'_110]">{product.name}</h1>
          {fullName ? <p className="mt-1 text-[1rem] font-medium text-[#4a5361]">{fullName}</p> : null}
          <p className="mt-4 max-w-[62ch] text-[0.95rem] leading-relaxed">{product.description}</p>

          {product.specs.length > 0 ? (
            <section aria-labelledby="sheet-specs" className="mt-8">
              <h2 id="sheet-specs" className="text-[0.95rem] font-semibold">
                Specifications
              </h2>
              <table className="mt-3 w-full border-collapse text-[0.9rem]">
                <tbody>
                  {product.specs.map((s) => (
                    <tr key={s.label} className="border-t border-[#d5dae1] align-top">
                      <th scope="row" className="w-[38%] py-2 pr-4 text-left font-medium text-[#4a5361]">
                        {s.label}
                      </th>
                      <td className="py-2">{s.value}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </section>
          ) : (
            <p className="mt-8 text-[0.95rem]">Sizes, weights and ratings depend on the configuration; ask the US office for the current data.</p>
          )}

          {sizes.length > 0 ? (
            <section aria-labelledby="sheet-size" className="mt-8">
              <h2 id="sheet-size" className="text-[0.95rem] font-semibold">
                Packed and deployed size
              </h2>
              <table className="mt-3 w-full border-collapse text-[0.9rem]">
                <thead>
                  <tr className="text-left text-[#4a5361]">
                    {sizes.length > 1 ? <th className="py-2 pr-4 font-medium">Variant</th> : null}
                    <th className="py-2 pr-4 font-medium">Packed</th>
                    <th className="py-2 font-medium">Deployed</th>
                  </tr>
                </thead>
                <tbody>
                  {sizes.map((z) => (
                    <tr key={z.id} className="border-t border-[#d5dae1] align-top">
                      {sizes.length > 1 ? <td className="py-2 pr-4 font-medium">{z.name}</td> : null}
                      <td className="py-2 pr-4">{z.packedNote}</td>
                      <td className="py-2">{z.deployedNote.replace(/;\s*drawn at.*$/i, "")}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </section>
          ) : null}

          <section aria-labelledby="sheet-supplier" className="mt-8 grid gap-6 border-t-2 border-[#14181f] pt-5 sm:grid-cols-2">
            <div>
              <h2 id="sheet-supplier" className="text-[0.95rem] font-semibold">
                Supplier
              </h2>
              <p className="mt-2 text-[0.9rem] leading-relaxed">
                {PROCUREMENT.legalName}
                <br />
                {address}
                <br />
                {COMPANY_CONTACT.phone}
              </p>
            </div>
            <dl className="grid grid-cols-[4.5rem_1fr] gap-y-1 self-end text-[0.9rem]">
              <dt className="text-[#4a5361]">CAGE</dt>
              <dd className="v2-code">{PROCUREMENT.cage}</dd>
              <dt className="text-[#4a5361]">UEI</dt>
              <dd className="v2-code">{PROCUREMENT.uei}</dd>
              <dt className="text-[#4a5361]">NAICS</dt>
              <dd className="v2-code">{PROCUREMENT.naics.find((n) => "primary" in n && n.primary)?.code ?? PROCUREMENT.naics[0].code}</dd>
            </dl>
          </section>

          <footer className="mt-8 border-t border-[#d5dae1] pt-4 text-[0.78rem] leading-relaxed text-[#4a5361]">
            <p>
              Configuration varies by program, and the figures vary with it. Export-controlled technical data is
              released to authorized programs on request.
            </p>
            <p className="mt-1">
              Generated <TodayDate /> from <PageUrl path={`/configurable-solutions/${product.slug}`} />
            </p>
          </footer>
        </div>
      </div>
    </div>
  );
}
