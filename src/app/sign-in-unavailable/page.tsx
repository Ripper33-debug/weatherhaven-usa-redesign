import type { Metadata } from "next";
import Link from "next/link";
import { NAV_CTA } from "@/lib/site-nav-links";

export const metadata: Metadata = {
  title: "Sign-in unavailable",
  robots: { index: false, follow: false },
};

/**
 * Shown instead of the sign-in, SOF portal and admin pages when this copy of the site has no member
 * database configured (no Supabase keys, as on the redesign preview). src/middleware.ts rewrites to
 * it, so those pages never crash with a server error.
 */
export default function SignInUnavailablePage() {
  return (
    <div className="bg-ink text-snow">
      <div className="v2-wrap max-w-[760px] pb-28 pt-36 sm:pt-44">
        <h1 className="v2-h1 text-snow">Sign-in isn’t available on this copy of the site</h1>
        <p className="v2-lead mt-6">
          This preview isn’t connected to the member database, so the SOF portal and team sign-in are switched off. Everything else on the site
          works as normal.
        </p>
        <div className="mt-10 flex flex-col gap-3 sm:flex-row">
          <Link href="/sof-solutions" className="v2-btn">
            Back to SOF solutions
          </Link>
          <Link href={NAV_CTA.href} className="v2-btn v2-btn-ghost">
            {NAV_CTA.label}
          </Link>
        </div>
      </div>
    </div>
  );
}
