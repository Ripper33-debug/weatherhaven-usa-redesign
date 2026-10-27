"use client";

import Link from "next/link";
import { ProductImageSlot } from "@/components/products/ProductImageSlot";
import { useBodyScrollLock } from "@/hooks/useBodyScrollLock";
import { useCallback, useEffect, useState } from "react";
import { IconChevronLeft, IconChevronRight, IconX } from "@tabler/icons-react";
import { trackEvent } from "@/lib/analytics";
import { HOME_USE_CASES, type UseCaseCard } from "@/lib/homeUseCases";
import { useScrollReveal } from "@/hooks/useScrollReveal";

const btnPrimary =
  "inline-flex min-h-11 items-center justify-center border border-white bg-white px-6 py-2.5 text-[11px] font-semibold uppercase tracking-[0.18em] text-black transition hover:bg-[rgba(255,255,255,0.85)]";
const btnGhost =
  "inline-flex min-h-11 items-center justify-center border border-white/25 bg-transparent px-6 py-2.5 text-[11px] font-semibold uppercase tracking-[0.18em] text-white transition hover:border-white/50 hover:bg-white/[0.04]";

export function SofUseCaseCards() {
  const { ref, rootClass } = useScrollReveal({ variant: "slide-up-stagger", staggerMs: 80, threshold: 0.15 });
  const [openIndex, setOpenIndex] = useState<number | null>(null);
  const [overlayVisible, setOverlayVisible] = useState(false);

  const card = openIndex !== null ? HOME_USE_CASES[openIndex] : null;

  const openCard = (index: number) => {
    const c = HOME_USE_CASES[index]!;
    void trackEvent("click", `SOF capability card — ${c.title}`);
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
      void trackEvent("click", `SOF capability card — ${c.title}`);
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
      <div ref={ref} className={`mt-16 grid grid-cols-1 gap-0.5 sm:grid-cols-2 lg:grid-cols-3 ${rootClass}`}>
        {HOME_USE_CASES.map((c, i) => {
          const imageSlug = c.learnMoreHref.split("/").filter(Boolean).pop() ?? "use-case";
          return (
          <button
            key={c.title}
            type="button"
            data-reveal-child
            onClick={() => openCard(i)}
            className="group relative isolate min-h-[280px] overflow-hidden text-left sm:min-h-[320px]"
          >
            <ProductImageSlot slug={imageSlug} brightness={0.55} />
            <div
              className="absolute inset-0 z-[1]"
              style={{
                background: "linear-gradient(to top, rgba(8,10,12,0.9) 0%, rgba(8,10,12,0.2) 60%)",
              }}
            />
            <div className="absolute inset-0 z-[2] flex flex-col justify-end p-6 lg:p-8">
              <p className="sof-label-tight mb-3 text-[#4d9fff]">{c.tag}</p>
              <p className="mb-2 text-[13px] text-[#8a9099]">{c.desc}</p>
              <p className="font-display text-[22px] font-medium tracking-[-0.02em] text-white">{c.title}</p>
            </div>
          </button>
        );
        })}
      </div>

      {card && openIndex !== null && (
        <SofUseCaseOverlay
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

function SofUseCaseOverlay({
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
      className={`fixed inset-0 z-[80] flex flex-col bg-[#080a0c] transition-opacity duration-300 ${
        visible ? "opacity-100" : "pointer-events-none opacity-0"
      }`}
      role="dialog"
      aria-modal="true"
    >
      <div className="flex items-center justify-between border-b border-white/[0.08] px-4 py-4 sm:px-8">
        <p className="font-mono text-[11px] font-medium uppercase tracking-[0.15em] text-[#4d9fff]">{card.tag}</p>
        <button type="button" onClick={onClose} className="text-white" aria-label="Close">
          <IconX size={24} />
        </button>
      </div>
      <div className="flex flex-1 flex-col overflow-y-auto px-4 py-8 sm:px-12 lg:flex-row lg:gap-16">
        <div className="lg:w-1/2">
          <h2 className="font-display text-3xl font-semibold tracking-tight text-white sm:text-4xl">{card.title}</h2>
          {card.paragraphs.map((p) => (
            <p key={p.slice(0, 24)} className="mt-4 text-base leading-relaxed text-[#8a9099]">
              {p}
            </p>
          ))}
        </div>
        <div className="mt-10 lg:mt-0 lg:w-1/2">
          <p className="wh-label text-[#8a9099]">Specifications</p>
          <ul className="mt-4 space-y-0">
            {card.specs.map((s) => (
              <li
                key={s.label}
                className="border-l-2 border-[#4d9fff] py-3 pl-4"
                style={{ borderLeftWidth: 2 }}
              >
                <p className="text-[11px] uppercase tracking-wider text-[#8a9099]">{s.label}</p>
                <p className="mt-1 text-sm text-white">{s.value}</p>
              </li>
            ))}
          </ul>
          <div className="mt-10 flex flex-col gap-3 sm:flex-row">
            <Link href={card.learnMoreHref} className={btnPrimary}>
              Learn more
            </Link>
            <Link
              href={card.specSheetHref}
              className={btnGhost}
              target={card.specSheetHref.startsWith("http") ? "_blank" : undefined}
              rel={card.specSheetHref.startsWith("http") ? "noopener noreferrer" : undefined}
            >
              {card.specSheetHref.startsWith("http") ? "Learn more" : "Spec sheet"}
            </Link>
          </div>
        </div>
      </div>
      <div className="flex justify-between border-t border-white/[0.08] px-4 py-4 sm:px-8">
        <button type="button" onClick={onPrev} className="flex items-center gap-2 text-sm text-[#8a9099] hover:text-white">
          <IconChevronLeft size={18} /> Previous
        </button>
        <button type="button" onClick={onNext} className="flex items-center gap-2 text-sm text-[#8a9099] hover:text-white">
          Next <IconChevronRight size={18} />
        </button>
      </div>
    </div>
  );
}
