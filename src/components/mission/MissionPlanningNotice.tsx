import Link from "next/link";

/** Shown on mission builder flows — planning output is not a formal quote. */
export function MissionPlanningNotice({ className = "" }: { className?: string }) {
  return (
    <div
      className={`mx-auto max-w-[1400px] border-l-2 border-[#f18522]/50 bg-[#101824] px-5 py-4 sm:px-6 ${className}`}
      role="note"
    >
      <p className="text-sm leading-relaxed text-[#c5c9ce]">
        <strong className="font-medium text-white">Planning tool</strong> — use this to scope a conversation with
        Weatherhaven. Results are indicative only and are{" "}
        <strong className="font-medium text-white">not a formal quote or contract offer</strong>. Need a program
        response?{" "}
        <Link href="/contact" className="text-[#f18522] hover:underline">
          Talk to our team
        </Link>
        .
      </p>
    </div>
  );
}
