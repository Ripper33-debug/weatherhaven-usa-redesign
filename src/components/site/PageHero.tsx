import type { ReactNode } from "react";

type Props = {
  label: string;
  title: string;
  description?: string;
  children?: ReactNode;
  /** Kept for compatibility with older callers; the v2 header has no background film. */
  variant?: "home" | "sof";
};

/** Interior page header (v2 design): no stock footage, clear title and lead. */
export function PageHero({ label, title, description, children }: Props) {
  return (
    <header className="border-b border-line bg-ink pb-14 pt-32 sm:pb-16 sm:pt-36">
      <div className="v2-wrap">
        <p className="text-[0.9rem] font-medium text-signal">{label}</p>
        <h1 className="v2-h1 mt-4 max-w-[20ch] text-snow">{title}</h1>
        {description ? <p className="v2-lead mt-5">{description}</p> : null}
        {children}
      </div>
    </header>
  );
}
