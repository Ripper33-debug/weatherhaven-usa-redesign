import type { ReactNode } from "react";
import { HeroMediaBackground } from "@/components/hero/HeroMediaBackground";

type Props = {
  label: string;
  title: string;
  description?: string;
  children?: ReactNode;
  variant?: "home" | "sof";
};

/** Marketing page hero — calm Shield-style header below the fold on inner routes */
export function PageHero({ label, title, description, children, variant = "home" }: Props) {
  return (
    <section className="relative w-full max-w-full overflow-hidden bg-[#080a0c]">
      <HeroMediaBackground variant={variant} shieldOverlay premium showParticles={false} />
      <div className="relative z-10 mx-auto max-w-[1400px] px-6 pb-20 pt-28 sm:px-6 sm:pb-24 sm:pt-[128px] lg:px-12">
        <p className="wh-marketing-label">{label}</p>
        <h1 className="wh-marketing-display mt-6 max-w-3xl text-3xl leading-[1.05] text-white sm:text-4xl lg:text-[52px]">
          {title}
        </h1>
        {description && <p className="wh-marketing-lead mt-6 max-w-2xl">{description}</p>}
        {children}
      </div>
    </section>
  );
}
