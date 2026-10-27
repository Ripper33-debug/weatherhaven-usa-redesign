import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import { SOF_LOGIN_PATH } from "@/lib/sof-auth";
import { SOF_NOT_APPROVED_QUERY, syncSofMembershipMetadata, userCanAccessSofSecure } from "@/lib/sof-membership";
import { WeatherhavenLogoLink } from "@/components/brand/WeatherhavenLogoLink";
import { SofSecureNav } from "./SofSecureChrome";

export default async function SofSecureLayout({ children }: { children: React.ReactNode }) {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    redirect(SOF_LOGIN_PATH);
  }

  await syncSofMembershipMetadata(user);

  const allowed = await userCanAccessSofSecure(user);
  if (!allowed) {
    redirect(`${SOF_LOGIN_PATH}?${SOF_NOT_APPROVED_QUERY}=1`);
  }

  return (
    <div className="sof-secure-root min-h-dvh bg-[#080a0c] text-white">
      <header className="border-b border-white/[0.08] bg-[#0d0f12]/95">
        <div className="mx-auto flex max-w-[1280px] flex-wrap items-center justify-between gap-3 px-4 py-3 sm:px-6 lg:px-10">
          <div className="flex min-w-0 flex-col gap-2 sm:flex-row sm:items-center sm:gap-4">
            <WeatherhavenLogoLink
              href="/sof-solutions/secure"
              height={24}
              suffix="· SOF"
              ariaLabel="Weatherhaven secure SOF home"
            />
            <div>
              <p className="text-[10px] font-medium tracking-[0.14em] text-[#4d9fff] uppercase">Secure · Special Operations</p>
              <p className="text-sm text-white">Restricted systems catalog</p>
            </div>
          </div>
          <SofSecureNav />
        </div>
      </header>
      {children}
    </div>
  );
}
