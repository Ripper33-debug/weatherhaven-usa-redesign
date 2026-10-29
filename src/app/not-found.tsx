import Link from "next/link";

export default function NotFound() {
  return (
    <div className="wh-v2 flex min-h-[80vh] items-center bg-ink pb-24 pt-32">
      <div className="v2-wrap">
        <p className="v2-figure text-[1.1rem] text-signal">404</p>
        <h1 className="v2-h1 mt-4 max-w-[16ch] text-snow">This page isn&apos;t here</h1>
        <p className="v2-lead mt-5">
          The link may be out of date or mistyped. Every system is listed on the systems page, and a Weatherhaven
          expert can point you to anything else.
        </p>
        <div className="mt-10 flex flex-col gap-3 sm:flex-row">
          <Link href="/configurable-solutions" className="v2-btn">
            Browse systems
          </Link>
          <Link href="/contact" className="v2-btn v2-btn-ghost">
            Talk to an expert
          </Link>
          <Link href="/" className="v2-btn v2-btn-ghost">
            Go to the homepage
          </Link>
        </div>
      </div>
    </div>
  );
}
