"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { PlatformSection } from "@/components/platform/platform-ui";
import { SofSecureSignOut } from "./SofSecureSignOut";

export const SOF_PROGRAM_RESOURCES = [
  {
    title: "Capabilities overview",
    description: "Field-proven deployable infrastructure across environments.",
    href: "/configurable-solutions",
  },
  {
    title: "Systems catalog",
    description: "HQSS, softwall, medical, and camp configurations.",
    href: "/configurable-solutions",
  },
  {
    title: "Mission Solution Builder",
    description: "Scope requirements and submit a configuration brief.",
    href: "/mission-solution-builder?form=full",
  },
  {
    title: "Engineering contact",
    description: "Program desk for technical exchange and support.",
    href: "/contact",
  },
] as const;

export function SofProgramResources() {
  return (
    <PlatformSection
      title="Program materials"
      description="Reference content for mission planning. Export-controlled materials are issued separately by your program lead."
    >
      <div className="grid gap-3 sm:grid-cols-2">
        {SOF_PROGRAM_RESOURCES.map((item) => (
          <Link
            key={item.href}
            href={item.href}
            className="wh-marketing-panel block p-5 transition hover:border-[#4d9fff]/30 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#4d9fff]"
          >
            <p className="text-sm font-medium text-white">{item.title}</p>
            <p className="mt-2 text-xs leading-relaxed text-[#8a9099]">{item.description}</p>
          </Link>
        ))}
      </div>
    </PlatformSection>
  );
}

export function SofSecureNav() {
  const pathname = usePathname();

  const links = [
    {
      href: "/sof-solutions/secure",
      label: "SOF systems",
      match: (p: string) =>
        p === "/sof-solutions/secure" || p.startsWith("/sof-solutions/secure/systems"),
    },
    {
      href: "/sof-solutions/secure/deployment-planner",
      label: "Deployment planner",
      match: (p: string) => p.startsWith("/sof-solutions/secure/deployment-planner"),
    },
  ] as const;

  return (
    <div className="flex flex-wrap items-center gap-4 sm:gap-6">
      <nav className="flex flex-wrap items-center gap-4 text-sm" aria-label="SOF secure area">
        {links.map((link) => {
          const current = link.match(pathname);
          return (
            <Link
              key={link.href}
              href={link.href}
              aria-current={current ? "page" : undefined}
              className={
                current
                  ? "font-medium text-white underline decoration-[#4d9fff] decoration-2 underline-offset-4"
                  : "text-[#8a9099] hover:text-white focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#4d9fff]"
              }
            >
              {link.label}
            </Link>
          );
        })}
      </nav>
      <SofSecureSignOut />
    </div>
  );
}
