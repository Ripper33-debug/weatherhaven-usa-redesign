import type { Metadata } from "next";
import { HeroMediaBackground } from "@/components/hero/HeroMediaBackground";
import { SOF_NOT_APPROVED_QUERY } from "@/lib/sof-membership";
import { SofLoginForm } from "../_components/SofLoginForm";

export const metadata: Metadata = {
  title: "SOF Member Sign-In",
  description: "Sign in to the secure Special Forces section with your approved access code.",
  robots: { index: false, follow: false },
};

export default async function SofLoginPage({
  searchParams,
}: {
  searchParams: Promise<Record<string, string | string[] | undefined>>;
}) {
  const params = await searchParams;
  const notApproved = params[SOF_NOT_APPROVED_QUERY] === "1";

  return (
    <main className="relative flex min-h-dvh items-center justify-center overflow-hidden bg-[#080a0c] px-6 py-24">
      <HeroMediaBackground variant="sof" shieldOverlay showParticles={false} premium sequentialLoop />
      <div className="relative z-10 w-full">
        <SofLoginForm notApproved={notApproved} />
      </div>
    </main>
  );
}
