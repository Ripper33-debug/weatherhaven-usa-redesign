import type { Metadata } from "next";
import { getInviteByToken, validateInvite } from "@/lib/invites";
import { NOINDEX_ROBOTS } from "@/lib/seo";
import { WeatherhavenLogoLink } from "@/components/brand/WeatherhavenLogoLink";
import { AcceptInviteBackdrop } from "./AcceptInviteBackdrop";
import { AcceptInviteForm, AcceptInviteInvalid } from "./AcceptInviteForm";

type Props = {
  searchParams: Promise<{ token?: string }>;
};

export const metadata: Metadata = {
  title: "Accept invitation",
  robots: NOINDEX_ROBOTS,
};

export default async function AcceptInvitePage({ searchParams }: Props) {
  const params = await searchParams;
  const token = params.token?.trim() ?? "";
  const invite = token ? await getInviteByToken(token) : null;
  const validation = validateInvite(invite);

  return (
    <main className="relative flex min-h-dvh items-center justify-center overflow-hidden bg-[#080a0c] px-6 py-16">
      <AcceptInviteBackdrop />
      <div className="relative z-10 w-full max-w-[420px]">
        <WeatherhavenLogoLink href="/" centered linkClassName="mb-8 block" height={28} className="sm:h-8" />
        {!validation.valid || !invite ? (
          <AcceptInviteInvalid />
        ) : (
          <div className="border border-[rgba(255,255,255,0.08)] bg-[#080a0c]/90 p-6 backdrop-blur-sm sm:p-12">
            <p className="font-mono text-[11px] font-medium uppercase tracking-[0.2em] text-[#4d9fff]">
              ACCEPT INVITATION
            </p>
            <h1 className="font-display mt-6 text-2xl font-semibold text-white">
              Set your password to access the platform.
            </h1>
            <AcceptInviteForm token={token} email={invite.email} />
          </div>
        )}
      </div>
    </main>
  );
}
