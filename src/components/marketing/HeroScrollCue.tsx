export function HeroScrollCue() {
  return (
    <div
      className="pointer-events-none absolute bottom-8 left-1/2 z-10 hidden -translate-x-1/2 flex-col items-center gap-3 sm:flex"
      aria-hidden
    >
      <span className="wh-marketing-eyebrow text-[10px] text-white/40">Scroll</span>
      <span className="relative block h-12 w-px overflow-hidden bg-white/15">
        <span className="wh-hero-scroll-line absolute left-0 top-0 w-full bg-white/70" />
      </span>
    </div>
  );
}
