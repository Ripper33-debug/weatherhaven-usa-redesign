/**
 * Calls start() once, after the page has loaded, when `el` comes within `margin` of the screen.
 * While the visitor is still at the top of the page and `el` is off screen, it waits for the first
 * scroll, so heavy assets (three.js, 3D models) never compete with first paint or the hero film.
 * Returns a cleanup function.
 */
export function startWhenNear(el: Element, start: () => void, margin = "100% 0px"): () => void {
  let io: IntersectionObserver | null = null;
  let stopped = false;
  const arm = () => {
    window.removeEventListener("scroll", arm);
    if (stopped || io) return;
    io = new IntersectionObserver(
      ([entry]) => {
        if (!entry.isIntersecting || stopped) return;
        stopped = true;
        io?.disconnect();
        start();
      },
      { rootMargin: margin },
    );
    io.observe(el);
  };
  const afterLoad = () => {
    if (stopped) return;
    if (window.scrollY > 0 || el.getBoundingClientRect().top < window.innerHeight) arm();
    else window.addEventListener("scroll", arm, { passive: true });
  };
  if (document.readyState === "complete") afterLoad();
  else window.addEventListener("load", afterLoad, { once: true });
  return () => {
    stopped = true;
    io?.disconnect();
    window.removeEventListener("load", afterLoad);
    window.removeEventListener("scroll", arm);
  };
}
