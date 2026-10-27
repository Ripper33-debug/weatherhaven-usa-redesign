import type { Metadata } from "next";
import { ShieldHero } from "@/components/marketing/ShieldHero";
import { COMPANY_STATS } from "@/lib/company-facts";
import { SofCountUp, type SofCredStat } from "./_components/SofCountUp";
import { SofUseCaseCards } from "./_components/SofUseCaseCards";
import { SofScrollSection } from "./_components/SofScrollSection";
import { SofCtaBoxes } from "./_components/SofCtaBoxes";
import { SofCapabilitiesGrid } from "./_components/SofCapabilitiesGrid";
import { SofProblemSection } from "./_components/SofProblemSection";
import { SofProcessSection } from "./_components/SofProcessSection";

export const metadata: Metadata = {
  title: "Special Operations Solutions — Weatherhaven USA",
  description:
    "Deployable shelter systems engineered for special operations — rapid setup, expeditionary mobility, and mission-tailored configurations.",
};

const credStats: SofCredStat[] = [
  {
    id: "y",
    value: "45+",
    label: "Years",
    detail: COMPANY_STATS[0]!.detail,
  },
  {
    id: "c",
    value: "95+",
    label: "Countries deployed",
    detail: COMPANY_STATS[1]!.detail,
  },
  {
    id: "cont",
    value: "7",
    label: "Continents",
    detail: COMPANY_STATS[2]!.detail,
  },
  {
    id: "min",
    value: "20",
    label: "Minutes to operational",
    detail: COMPANY_STATS[3]!.detail,
  },
];

export default function SofSolutionsPage() {
  return (
    <div className="bg-[#080a0c] text-white">
      <ShieldHero variant="sof" />

      <SofProblemSection />
      <SofCapabilitiesGrid />

      <SofScrollSection>
        <p className="wh-marketing-label">Mission applications</p>
        <h2 className="wh-marketing-display mt-6 max-w-4xl text-[32px] leading-[1.08] text-white lg:text-[44px]">
          Configured for your operational environment.
        </h2>
        <SofUseCaseCards />
      </SofScrollSection>

      <SofScrollSection>
        <p className="wh-marketing-label">Our track record</p>
        <h2 className="wh-marketing-display mt-6 max-w-4xl text-[32px] leading-[1.08] text-white lg:text-[44px]">
          Decades of expeditionary delivery.
        </h2>
        <SofCountUp stats={credStats} />
      </SofScrollSection>

      <SofProcessSection />

      <SofScrollSection className="!bg-[#0d0f12]">
        <div className="mx-auto max-w-[960px] text-center">
          <p className="wh-marketing-label">Engage the team</p>
          <h2 className="font-serif mt-6 text-[40px] font-medium tracking-[-0.02em] text-white lg:text-[48px]">
            Can we help?
          </h2>
          <p className="mt-4 text-base text-[#8a9099]">Technical exchanges matched to clearance and program status.</p>
          <SofCtaBoxes />
        </div>
      </SofScrollSection>
    </div>
  );
}
