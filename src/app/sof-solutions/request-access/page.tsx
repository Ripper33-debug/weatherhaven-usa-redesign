import type { Metadata } from "next";
import { HeroMediaBackground } from "@/components/hero/HeroMediaBackground";
import { SOF_NOT_APPROVED_QUERY } from "@/lib/sof-membership";
import { NOINDEX_ROBOTS } from "@/lib/seo";
import { SofRequestAccessForm } from "../_components/SofRequestAccessForm";

export const metadata: Metadata = {
  title: "Request SOF Access",
  description: "Request access to the secure Special Forces section of Weatherhaven.",
  robots: NOINDEX_ROBOTS,
};

export default async function SofRequestAccessPage({
  searchParams,
}: {
  searchParams: Promise<Record<string, string | string[] | undefined>>;
}) {
  const params = await searchParams;
  const notApproved = params[SOF_NOT_APPROVED_QUERY] === "1";

  return (
    <main className="relative flex min-h-dvh items-center justify-center overflow-hidden bg-[#080a0c] px-6 py-24 sm:py-32">
      <HeroMediaBackground variant="sof" shieldOverlay showParticles={false} premium sequentialLoop />
      <div className="relative z-10 mx-auto w-full max-w-lg">
        <SofRequestAccessForm notApproved={notApproved} />
      </div>
    </main>
  );
}
