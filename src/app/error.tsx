"use client";

import Link from "next/link";
import { useEffect } from "react";
import { WeatherhavenLogoLink } from "@/components/brand/WeatherhavenLogoLink";
import { btnMarketingOutline, btnMarketingPrimary } from "@/lib/cta-buttons";
import { reportError } from "@/lib/sentry-client";

export default function Error({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  useEffect(() => {
    console.error(error);
    reportError(error);
  }, [error]);

  return (
    <div className="flex min-h-dvh flex-col items-center justify-center bg-[#080a0c] px-6 py-20 text-center text-white">
      <WeatherhavenLogoLink href="/" centered linkClassName="mb-10 block" height={32} />
      <p className="wh-marketing-eyebrow text-[#4d9fff]">Something went wrong</p>
      <h1 className="wh-marketing-display mt-6 max-w-lg font-serif text-3xl leading-[1.08] sm:text-4xl">
        We couldn&apos;t load this page
      </h1>
      <p className="wh-marketing-lead mx-auto mt-4 max-w-md">
        Try again, browse systems, or contact our team if the problem continues.
      </p>
      <div className="mt-12 flex flex-col gap-4 sm:flex-row sm:justify-center">
        <button type="button" onClick={() => reset()} className={btnMarketingPrimary}>
          Try again
        </button>
        <Link href="/configurable-solutions" className={btnMarketingOutline}>
          Systems
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
