import { effectsEnabled } from "@/lib/effects/media";
import { scrambleText } from "@/lib/effects/scramble";
import { isMarketingPage } from "@/lib/marketing-pages";

const MAGNETIC_MAX = 8;
const MAGNETIC_RADIUS = 80;
const TILT_MAX = 8;

function clampMagnetic(delta: number, max: number) {
  return Math.max(-max, Math.min(max, delta * 0.25));
}

function bindMagnetic(el: HTMLElement) {
  if (el.dataset.magneticBound === "1") return;
  el.dataset.magneticBound = "1";

  const onMove = (e: MouseEvent) => {
    const rect = el.getBoundingClientRect();
    const centerX = rect.left + rect.width / 2;
    const centerY = rect.top + rect.height / 2;
    const dist = Math.hypot(e.clientX - centerX, e.clientY - centerY);
    if (dist > MAGNETIC_RADIUS) {
      el.style.transform = "translate(0px, 0px)";
      return;
    }
    const deltaX = clampMagnetic(e.clientX - centerX, MAGNETIC_MAX);
    const deltaY = clampMagnetic(e.clientY - centerY, MAGNETIC_MAX);
    el.style.transition = "transform 0.1s ease-out";
    el.style.transform = `translate(${deltaX}px, ${deltaY}px)`;
  };

  const onLeave = () => {
    el.style.transition = "transform 0.5s cubic-bezier(0.23, 1, 0.32, 1)";
    el.style.transform = "translate(0px, 0px)";
  };

  el.addEventListener("mousemove", onMove);
  el.addEventListener("mouseleave", onLeave);
}

function bindCardTilt(card: HTMLElement) {
  if (card.dataset.tiltBound === "1") return;
  card.dataset.tiltBound = "1";

  let shine = card.querySelector<HTMLElement>(".wh-card-shine");
  if (!shine) {
    shine = document.createElement("div");
    shine.className = "wh-card-shine pointer-events-none absolute inset-0 z-[2]";
    shine.setAttribute("aria-hidden", "true");
    if (getComputedStyle(card).position === "static") card.style.position = "relative";
    card.prepend(shine);
  }

  const onMove = (e: MouseEvent) => {
    const rect = card.getBoundingClientRect();
    const x = (e.clientX - rect.left) / rect.width - 0.5;
    const y = (e.clientY - rect.top) / rect.height - 0.5;
    card.style.transform = `perspective(1000px) rotateY(${x * (TILT_MAX * 2)}deg) rotateX(${-y * (TILT_MAX * 2)}deg) translateZ(8px)`;
    card.style.transition = "transform 0.08s ease-out";
    if (shine) {
      shine.style.background = `radial-gradient(circle at ${e.clientX - rect.left}px ${e.clientY - rect.top}px, rgba(77,159,255,0.08), transparent 60%)`;
    }
  };

  const onLeave = () => {
    card.style.transition = "transform 0.5s cubic-bezier(0.23, 1, 0.32, 1)";
    card.style.transform = "perspective(1000px) rotateY(0deg) rotateX(0deg) translateZ(0)";
    if (shine) shine.style.background = "transparent";
  };

  card.addEventListener("mousemove", onMove);
  card.addEventListener("mouseleave", onLeave);
}

export function initDomEnhancements(root: ParentNode = document) {
  if (!effectsEnabled()) return () => {};
  if (typeof window !== "undefined" && isMarketingPage(window.location.pathname)) return () => {};

  root.querySelectorAll<HTMLElement>(".btn-magnetic").forEach(bindMagnetic);
  root.querySelectorAll<HTMLElement>(".wh-card-tilt").forEach(bindCardTilt);

  const labelObserver = new IntersectionObserver(
    (entries) => {
      for (const entry of entries) {
        if (!entry.isIntersecting) continue;
        const el = entry.target as HTMLElement;
        const text = el.dataset.scrambleText ?? el.textContent?.trim() ?? "";
        if (text) scrambleText(el, text);
        labelObserver.unobserve(el);
      }
    },
    { threshold: 0.4 },
  );

  root.querySelectorAll<HTMLElement>(".wh-label, .sof-label").forEach((el) => {
    if (!el.dataset.scrambleText) {
      el.dataset.scrambleText = el.textContent?.trim() ?? "";
    }
    labelObserver.observe(el);
  });

  return () => {
    labelObserver.disconnect();
  };
}
