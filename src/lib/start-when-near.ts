/**
 * Calls start() once, after the page has loaded, when `el` comes within `margin` of the screen.
 * While `el` is off screen it waits for the visitor to scroll, so heavy assets (three.js, 3D models)
 * never compete with first paint or the hero film. Returns a cleanup function.
 */
export function startWhenNear(el: Element, start: () => void, margin = "100% 0px"): () => void {
  let io: IntersectionObserver | null = null;
  let stopped = false;
  let timer = 0;
  const arm = () => {
    window.removeEventListener("scroll", onScroll);
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
  // Only scrolling down counts as the visitor heading down the page; this ignores the (smooth)
  // scroll back to the top that comes with a client-side navigation.
  let lastY = window.scrollY;
  const onScroll = () => {
    const y = window.scrollY;
    const down = y > lastY;
    lastY = y;
    if (down) arm();
  };
  const onScreen = () => {
    const r = el.getBoundingClientRect();
    return r.top < window.innerHeight && r.bottom > 0;
  };
  // Fresh page load: a non-zero scrollY is a restored position (reload, back), so start right away.
  const onLoad = () => {
    if (stopped) return;
    if (onScreen() || window.scrollY > 0) arm();
    else window.addEventListener("scroll", onScroll, { passive: true });
  };
  if (document.readyState === "complete") {
    // Client-side navigation: the previous page's scroll position lingers until the router scrolls
    // to the top (after the page transition), so wait for a real scroll, or check again shortly.
    window.addEventListener("scroll", onScroll, { passive: true });
    timer = window.setTimeout(() => {
      if (!stopped && onScreen()) arm();
    }, 1600);
  } else {
    window.addEventListener("load", onLoad, { once: true });
  }
  return () => {
    stopped = true;
    window.clearTimeout(timer);
    io?.disconnect();
    window.removeEventListener("load", onLoad);
    window.removeEventListener("scroll", onScroll);
  };
}
