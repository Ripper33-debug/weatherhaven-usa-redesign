"use client";

import { useEffect, useRef, useState, useSyncExternalStore } from "react";

function easeOutCubic(t: number) {
  return 1 - (1 - t) ** 3;
}

function subscribeReducedMotion(cb: () => void) {
  const mq = window.matchMedia("(prefers-reduced-motion: reduce)");
  mq.addEventListener("change", cb);
  return () => mq.removeEventListener("change", cb);
}

function getReducedMotionSnapshot() {
  return window.matchMedia("(prefers-reduced-motion: reduce)").matches;
}

function getReducedMotionServerSnapshot() {
  return false;
}

/**
 * When `rootRef` element crosses 30% visibility, animates integers from 0 → each target over `durationMs` (ease-out).
 * Fires once per mount; disconnects observer after trigger. Render suffixes (+) beside numbers — not part of tween.
 */
export function useCountUpFromZero(targets: readonly number[], durationMs = 2000) {
  const rootRef = useRef<HTMLDivElement>(null);
  const targetsKey = targets.join(",");

  const triggeredRef = useRef(false);
  const rafRef = useRef<number | null>(null);
  const cancelledRef = useRef(false);

  const [started, setStarted] = useState(false);
  const [values, setValues] = useState(() => targets.map(() => 0));

  const reduceMotion = useSyncExternalStore(
    subscribeReducedMotion,
    getReducedMotionSnapshot,
    getReducedMotionServerSnapshot,
  );

  const displayValues = reduceMotion ? [...targets] : values;

  useEffect(() => {
    const id = requestAnimationFrame(() => {
      setValues(targets.map(() => 0));
      triggeredRef.current = false;
      setStarted(false);
    });
    return () => cancelAnimationFrame(id);
  }, [targetsKey, targets]);

  useEffect(() => {
    if (reduceMotion) {
      const id = requestAnimationFrame(() => {
        setValues([...targets]);
        setStarted(true);
      });
      return () => cancelAnimationFrame(id);
    }

    const el = rootRef.current;
    if (!el) return;

    const fire = () => {
      if (triggeredRef.current) return;
      triggeredRef.current = true;
      setStarted(true);
    };

    const tryImmediate = () => {
      if (triggeredRef.current || !rootRef.current) return;
      const rect = rootRef.current.getBoundingClientRect();
      const vh = window.innerHeight || 0;
      const vw = window.innerWidth || 0;
      const visibleH = Math.min(rect.bottom, vh) - Math.max(rect.top, 0);
      const visibleW = Math.min(rect.right, vw) - Math.max(rect.left, 0);
      if (visibleH <= 0 || visibleW <= 0) return;
      const ratio = (visibleH * visibleW) / (rect.height * rect.width);
      if (ratio >= 0.3) fire();
    };

    const obs = new IntersectionObserver(
      (entries) => {
        const e = entries[0];
        if (!e || triggeredRef.current) return;
        if (e.intersectionRatio >= 0.3) {
          fire();
          obs.disconnect();
        }
      },
      { threshold: 0.3 },
    );

    const boot = () => {
      if (!rootRef.current || triggeredRef.current) return;
      obs.observe(rootRef.current);
      tryImmediate();
    };

    const t0 = window.setTimeout(boot, 0);
    const r1 = requestAnimationFrame(() => {
      requestAnimationFrame(tryImmediate);
    });

    return () => {
      window.clearTimeout(t0);
      cancelAnimationFrame(r1);
      obs.disconnect();
    };
  }, [reduceMotion, targetsKey, targets]);

  useEffect(() => {
    if (!started || reduceMotion) return;
    cancelledRef.current = false;
    const t0 = performance.now();
    const nums = targets;

    const tick = (now: number) => {
      if (cancelledRef.current) return;
      const t = Math.min(1, (now - t0) / durationMs);
      const e = easeOutCubic(t);
      setValues(nums.map((n) => Math.round(n * e)));
      if (t < 1) {
        rafRef.current = requestAnimationFrame(tick);
      } else {
        setValues([...nums]);
        rafRef.current = null;
      }
    };

    rafRef.current = requestAnimationFrame(tick);
    return () => {
      cancelledRef.current = true;
      if (rafRef.current != null) {
        cancelAnimationFrame(rafRef.current);
        rafRef.current = null;
      }
    };
  }, [started, reduceMotion, durationMs, targets]);

  return { rootRef, displayValues };
}
