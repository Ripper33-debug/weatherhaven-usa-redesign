import Link from "next/link";
import { contactUrl } from "@/lib/contact-url";
import { COMPANY_CREDIBILITY_LINE } from "@/lib/company-facts";
import { btnMarketingLink } from "@/lib/cta-buttons";

/** Homepage band — credibility + flagship path for executive walkthroughs. */
export function HomeExecutiveStrip() {
  return (
    <section
      className="w-full max-w-full overflow-hidden border-b border-white/[0.08] bg-[#0d0f12]"
      aria-label="Company credentials"
    >
      <div className="mx-auto flex max-w-[1400px] flex-col gap-5 px-5 py-6 sm:gap-6 sm:px-6 sm:py-8 lg:flex-row lg:items-center lg:justify-between lg:px-12 lg:py-10">
        <p className="hidden max-w-2xl text-sm leading-relaxed tracking-wide text-[#8a9099] sm:block">{COMPANY_CREDIBILITY_LINE}</p>
        <div className="flex flex-col gap-3 sm:ml-auto sm:flex-row sm:items-center sm:gap-6">
          <Link
            href="/configurable-solutions/ehmecc"
            className="text-sm font-medium text-white no-underline transition hover:text-[#4d9fff] sm:text-base"
          >
            Flagship: EHMECC command shelter
            <span className="ml-1 text-[#4d9fff]" aria-hidden>
              →
            </span>
          </Link>
          <Link href={contactUrl({ system: "ehmecc", inquiry: "Demo Request" })} className={`${btnMarketingLink} text-sm sm:text-base`}>
            Book a capability demo
            <span aria-hidden>→</span>
          </Link>
        </div>
      </div>
    </section>
  );
}
