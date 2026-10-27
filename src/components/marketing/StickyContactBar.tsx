import Link from "next/link";
import { btnMarketingPrimary } from "@/lib/cta-buttons";

/** Persistent contact CTA while browsing the systems catalog or a product profile. */
export function StickyContactBar({ contactHref = "/contact" }: { contactHref?: string }) {
  return (
    <>
      <div aria-hidden className="h-[4.5rem] sm:h-[4.75rem]" />
      <aside
        className="fixed inset-x-0 bottom-0 z-40 border-t border-white/[0.08] bg-[#080a0c]/95 px-4 py-3 backdrop-blur-md"
        aria-label="Contact Weatherhaven"
      >
        <div className="mx-auto flex max-w-[1400px] items-center justify-between gap-4">
          <p className="hidden text-sm text-[#8a9099] sm:block">Questions about a system or camp package?</p>
          <Link
            href={contactHref}
            className={`${btnMarketingPrimary} w-full justify-center px-6 py-3 sm:ml-auto sm:w-auto`}
          >
            Contact our team
          </Link>
        </div>
      </aside>
    </>
  );
}
