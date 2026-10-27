import Link from "next/link";
import { btnMarketingOutline, btnMarketingPrimary } from "@/lib/cta-buttons";

export type CTAProps = {
  title: string;
  description?: string;
  primary: { href: string; label: string };
  secondary?: { href: string; label: string };
};

export function CTA({ title, description, primary, secondary }: CTAProps) {
  return (
    <section className="border-t border-white/[0.08] bg-[#080a0c]">
      <div className="mx-auto max-w-[1400px] px-6 py-20 sm:px-6 sm:py-28 lg:px-12">
        <div className="max-w-3xl">
          <h2 className="wh-marketing-display text-3xl leading-[1.05] text-white sm:text-4xl lg:text-[44px]">{title}</h2>
          {description && <p className="wh-marketing-lead mt-6">{description}</p>}
          <div className="mt-10 flex flex-col gap-4 sm:flex-row sm:items-center sm:gap-6">
            <Link href={primary.href} className={btnMarketingPrimary}>
              {primary.label}
            </Link>
            {secondary && (
              <Link href={secondary.href} className={btnMarketingOutline}>
                {secondary.label}
              </Link>
            )}
          </div>
        </div>
      </div>
    </section>
  );
}
