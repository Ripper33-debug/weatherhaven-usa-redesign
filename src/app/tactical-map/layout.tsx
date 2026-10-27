import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Tactical Map",
  description: "Interactive deployment planning map for Weatherhaven operations.",
};

export default function TacticalMapLayout({ children }: { children: React.ReactNode }) {
  return children;
}
