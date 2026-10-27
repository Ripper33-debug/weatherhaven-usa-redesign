import type { Metadata } from "next";
import { Suspense } from "react";
import { LoginForm } from "./LoginForm";

export const metadata: Metadata = {
  title: "Operator sign in",
  robots: { index: false, follow: false },
};

export default function LoginPage() {
  return (
    <Suspense fallback={<p className="p-10 text-center text-sm text-zinc-500">Loading…</p>}>
      <LoginForm />
    </Suspense>
  );
}
