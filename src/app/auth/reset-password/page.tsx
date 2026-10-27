import type { Metadata } from "next";
import Link from "next/link";
import { Suspense } from "react";
import { WeatherhavenLogoLink } from "@/components/brand/WeatherhavenLogoLink";
import { ResetPasswordForm } from "@/components/auth/ResetPasswordForm";

export const metadata: Metadata = {
  title: "Set new password",
  robots: { index: false, follow: false },
};

export default function ResetPasswordPage() {
  return (
    <div className="flex min-h-[70vh] flex-col items-center justify-center px-4 py-16">
      <WeatherhavenLogoLink href="/" centered linkClassName="mb-8 block" height={28} />
      <div className="w-full max-w-md border border-[rgba(255,255,255,0.08)] bg-[#0d0f12] p-8">
        <p className="wh-label text-[#4d9fff]">Password reset</p>
        <h1 className="mt-2 text-xl font-semibold text-white">Set a new password</h1>
        <div className="mt-6">
          <Suspense fallback={<p className="text-sm text-[#8a9099]">Verifying reset link…</p>}>
            <ResetPasswordForm />
          </Suspense>
        </div>
        <p className="mt-6 text-center text-sm text-[#8a9099]">
          <Link href="/login" className="text-[#4d9fff] hover:underline">
            Back to sign in
          </Link>
        </p>
      </div>
    </div>
  );
}
