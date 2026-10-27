import Link from "next/link";
import { WeatherhavenLogoLink } from "@/components/brand/WeatherhavenLogoLink";
import { btnMarketingOutline, btnMarketingPrimary } from "@/lib/cta-buttons";

export default function NotFound() {
  return (
    <div className="flex min-h-[70vh] flex-col items-center justify-center px-6 pb-24 pt-16 text-center text-white">
      <WeatherhavenLogoLink href="/" centered linkClassName="mb-10 block" height={32} />
      <p className="wh-marketing-eyebrow text-[#4d9fff]">404</p>
      <h1 className="wh-marketing-display mt-6 max-w-xl font-serif text-4xl leading-[1.08] sm:text-5xl">
        This page isn&apos;t available.
      </h1>
      <p className="wh-marketing-lead mx-auto mt-6 max-w-md">
        The link may be outdated or mistyped. Start from systems or contact a Weatherhaven Expert.
      </p>
      <div className="mt-12 flex flex-col gap-4 sm:flex-row sm:justify-center">
        <Link href="/configurable-solutions" className={btnMarketingPrimary}>
          Browse systems
        </Link>
        <Link href="/contact" className={btnMarketingOutline}>
          Contact
        </Link>
      </div>
      <Link href="/" className="mt-10 text-sm text-[#8a9099] transition hover:text-white">
        Back to home
      </Link>
    </div>
  );
}
