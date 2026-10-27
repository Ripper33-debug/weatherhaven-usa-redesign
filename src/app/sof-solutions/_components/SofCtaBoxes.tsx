"use client";

import Link from "next/link";
import { IconCalendar, IconFileDownload, IconMessage } from "@tabler/icons-react";
import { trackEvent } from "@/lib/analytics";

const boxes = [
  {
    label: "Request SOF access",
    desc: "Name and email — receive a four-digit code when approved.",
    href: "/sof-solutions/request-access",
    Icon: IconMessage,
  },
  {
    label: "Contact team",
    desc: "Schedule a controlled technical walkthrough.",
    href: "/contact",
    Icon: IconCalendar,
  },
  {
    label: "Download capabilities brief",
    desc: "Capability statements and program-safe summaries.",
    href: "/resources",
    Icon: IconFileDownload,
  },
];

export function SofCtaBoxes() {
  return (
    <div className="mx-auto mt-16 grid max-w-[1100px] grid-cols-1 gap-0.5 lg:grid-cols-3">
      {boxes.map((box) => (
        <Link
          key={box.label}
          href={box.href}
          onClick={() => void trackEvent("click", `SOF CTA — ${box.label}`)}
          className="group flex flex-col border-b border-white/[0.08] bg-transparent px-4 py-10 text-left no-underline transition-[transform,color] duration-200 hover:translate-x-1 lg:px-8 lg:py-12"
        >
          <box.Icon className="text-white" size={32} stroke={1.25} aria-hidden />
          <p className="mt-6 text-lg font-medium text-white">{box.label}</p>
          <p className="mt-2 text-[13px] leading-relaxed text-[#8a9099]">{box.desc}</p>
          <span className="mt-auto pt-8 text-right text-white transition-opacity group-hover:opacity-70">→</span>
        </Link>
      ))}
    </div>
  );
}
