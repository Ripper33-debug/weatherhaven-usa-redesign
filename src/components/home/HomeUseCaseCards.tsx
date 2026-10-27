"use client";

import Link from "next/link";
import { ProductImageSlot } from "@/components/products/ProductImageSlot";
import { useBodyScrollLock } from "@/hooks/useBodyScrollLock";
import { useCallback, useEffect, useState } from "react";
import { IconChevronLeft, IconChevronRight, IconX } from "@tabler/icons-react";
import { trackEvent } from "@/lib/analytics";
import { HOME_USE_CASES, type UseCaseCard } from "@/lib/homeUseCases";
import { useScrollReveal } from "@/hooks/useScrollReveal";

import { btnPrimary } from "@/lib/cta-buttons";
const btnGhost =
  "inline-flex min-h-11 items-center justify-center border border-white/25 bg-transparent px-6 py-2.5 text-[11px] font-semibold uppercase tracking-[0.18em] text-white transition hover:border-white/50 hover:bg-white/[0.04]";

export function HomeUseCaseCards() {
  const { ref, rootClass } = useScrollReveal({ variant: "slide-up-stagger", staggerMs: 80 });
  const [openIndex, setOpenIndex] = useState<number | null>(null);
  const [overlayVisible, setOverlayVisible] = useState(false);

  const card = openIndex !== null ? HOME_USE_CASES[openIndex] : null;

  const openCard = (index: number) => {
    const c = HOME_USE_CASES[index]!;
    void trackEvent("click", `Capability card opened — ${c.title}`);
    setOpenIndex(index);
    setOverlayVisible(true);
  };

  const closeOverlay = useCallback(() => {
    setOverlayVisible(false);
    window.setTimeout(() => setOpenIndex(null), 250);
  }, []);

  const cycle = useCallback(
    (dir: -1 | 1) => {
      if (openIndex === null) return;
      const next = (openIndex + dir + HOME_USE_CASES.length) % HOME_USE_CASES.length;
      const c = HOME_USE_CASES[next]!;
      void trackEvent("click", `Capability card opened — ${c.title}`);
      setOpenIndex(next);
    },
    [openIndex],
  );

  useBodyScrollLock(overlayVisible);

  useEffect(() => {
    if (openIndex === null) return;
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") closeOverlay();
      if (e.key === "ArrowLeft") cycle(-1);
      if (e.key === "ArrowRight") cycle(1);
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [openIndex, closeOverlay, cycle]);

  return (
    <>
      <section className="border-b border-white/[0.08] bg-[#080a0c]">
        <div className="mx-auto max-w-[1400px] px-4 py-16 sm:px-6 sm:py-20 lg:px-12">
          <p className="wh-label">Mission applications</p>
          <h2 className="font-display mt-6 max-w-4xl text-3xl font-semibold leading-[1.05] tracking-[-0.02em] text-white sm:text-4xl lg:text-5xl">
            Configured for your operational environment.
          </h2>
          <div ref={ref} className={`mt-14 grid grid-cols-1 gap-0.5 sm:grid-cols-2 lg:grid-cols-3 ${rootClass}`}>
            {HOME_USE_CASES.map((c, i) => {
              const imageSlug = c.learnMoreHref.split("/").filter(Boolean).pop() ?? "use-case";
              return (
              <button
                key={c.title}
                type="button"
                data-reveal-child
                onClick={() => openCard(i)}
                className="wh-card-tilt wh-card-modern group relative isolate min-h-[280px] overflow-hidden rounded border border-transparent text-left sm:min-h-[320px]"
              >
                <ProductImageSlot slug={imageSlug} brightness={0.55} />
                <div
                  className="absolute inset-0 z-[1]"
                  style={{
                    background: "linear-gradient(to top, rgba(8,10,12,0.9) 0%, rgba(8,10,12,0.2) 60%)",
                  }}
                />
                <div className="absolute inset-0 z-[2] flex flex-col justify-end p-6 lg:p-8">
                  <p className="mb-3 font-mono text-[10px] font-medium uppercase tracking-[0.18em] text-[#4d9fff]">
                    {c.tag}
                  </p>
                  <p className="mb-2 text-[13px] text-[#8a9099]">{c.desc}</p>
                  <p className="font-display text-[22px] font-medium tracking-[-0.02em] text-white">{c.title}</p>
                </div>
              </button>
            );
            })}
          </div>
        </div>
      </section>

      {card && openIndex !== null && (
        <UseCaseOverlay
          card={card}
          visible={overlayVisible}
          onClose={closeOverlay}
          onPrev={() => cycle(-1)}
          onNext={() => cycle(1)}
        />
      )}
    </>
  );
}

function UseCaseOverlay({
  card,
  visible,
  onClose,
  onPrev,
  onNext,
}: {
  card: UseCaseCard;
  visible: boolean;
  onClose: () => void;
  onPrev: () => void;
  onNext: () => void;
}) {
  return (
    <div
      className={`fixed inset-0 z-50 flex items-center justify-center bg-[#080a0c]/95 p-0 transition-[opacity,transform] duration-[250ms] ease-out sm:p-4 ${
        visible ? "scale-100 opacity-100" : "scale-[0.98] opacity-0"
      }`}
      role="dialog"
      aria-modal="true"
    >
      <button
        type="button"
        onClick={onClose}
        className="absolute right-4 top-4 z-10 p-2 text-[#8a9099] hover:text-white sm:right-6 sm:top-6"
        aria-label="Close"
      >
        <IconX size={24} stroke={1.5} />
      </button>

      <button
        type="button"
        onClick={onPrev}
        className="absolute left-2 top-1/2 z-10 hidden -translate-y-1/2 p-3 text-white/70 hover:text-white sm:left-4 sm:block"
        aria-label="Previous configuration"
      >
        <IconChevronLeft size={28} stroke={1.25} />
      </button>
      <button
        type="button"
        onClick={onNext}
        className="absolute right-2 top-1/2 z-10 hidden -translate-y-1/2 p-3 text-white/70 hover:text-white sm:right-4 sm:block"
        aria-label="Next configuration"
      >
        <IconChevronRight size={28} stroke={1.25} />
      </button>

      <div className="flex h-full w-full max-w-[1200px] flex-col overflow-y-auto border border-white/10 bg-[#080a0c] p-6 sm:p-10 lg:p-14">
        <p className="wh-label">{card.tag}</p>
        <h2 className="font-display mt-4 text-3xl font-semibold tracking-[-0.02em] text-white sm:text-4xl lg:text-5xl">
          {card.title}
        </h2>

        <div className="mt-10 grid gap-10 lg:grid-cols-2 lg:gap-16">
          <div className="space-y-4 text-sm leading-relaxed text-[#8a9099] sm:text-base">
            {card.paragraphs.map((p) => (
              <p key={p.slice(0, 40)}>{p}</p>
            ))}
          </div>
          <ul className="space-y-4">
            {card.specs.map((s) => (
              <li key={s.label} className="border-l border-[#4d9fff] pl-4">
                <p className="text-[11px] font-medium uppercase tracking-[0.12em] text-[#8a9099]">{s.label}</p>
                <p className="mt-1 text-sm text-white">{s.value}</p>
              </li>
            ))}
          </ul>
        </div>

        <div className="mt-12 flex flex-col gap-3 border-t border-white/[0.08] pt-10 sm:flex-row sm:gap-4">
          <Link
            href="/contact"
            className={btnPrimary}
            onClick={() => void trackEvent("click", `Request This Configuration — ${card.title}`)}
          >
            Discuss this configuration
          </Link>
          <Link
            href={card.specSheetHref}
            className={btnGhost}
            target={card.specSheetHref.startsWith("http") ? "_blank" : undefined}
            rel={card.specSheetHref.startsWith("http") ? "noopener noreferrer" : undefined}
          >
            {card.specSheetHref.startsWith("http") ? "Learn more" : "Download spec sheet"}
          </Link>
        </div>
      </div>
    </div>
  );
}
