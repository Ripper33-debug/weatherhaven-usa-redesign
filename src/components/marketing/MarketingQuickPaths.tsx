import Link from "next/link";
import { marketingQuickPaths } from "@/lib/site";

/** One-click hubs from the homepage — keeps common goals within two clicks total. */
export function MarketingQuickPaths() {
  return (
    <section className="w-full max-w-full overflow-hidden border-b border-white/[0.08] bg-[#0d0f12]" aria-label="Quick paths">
      <div className="mx-auto grid w-full max-w-[1400px] grid-cols-1 sm:grid-cols-2">
        {marketingQuickPaths.map((item) => (
          <Link
            key={item.href}
            href={item.href}
            className="group border-b border-white/[0.08] px-5 py-6 transition-colors duration-300 hover:bg-white/[0.03] sm:border-b-0 sm:border-r sm:px-6 sm:py-8 sm:last:border-r-0 lg:px-10 lg:py-10"
          >
            <p className="text-base font-medium text-white transition-colors group-hover:text-[#4d9fff]">
              {item.label}
              <span className="ml-1 inline-block transition-transform duration-300 group-hover:translate-x-0.5" aria-hidden>
                →
              </span>
            </p>
            <p className="mt-2 text-sm text-[#8a9099]">{item.description}</p>
          </Link>
        ))}
      </div>
    </section>
  );
}
