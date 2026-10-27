import Link from "next/link";
import { WeatherhavenLogoLink } from "@/components/brand/WeatherhavenLogoLink";

export default function RequestAccessLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="min-h-dvh bg-[#080a0c]">
      <header className="flex items-center justify-between gap-4 border-b border-white/[0.08] px-6 py-5 sm:px-8">
        <WeatherhavenLogoLink href="/" height={28} className="sm:h-8" />
        <Link href="/login" className="text-sm text-[#8a9099] no-underline transition hover:text-white">
          Sign in
        </Link>
      </header>
      {children}
    </div>
  );
}
