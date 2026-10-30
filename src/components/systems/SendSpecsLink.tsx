"use client";

type Props = {
  /** The mailto link, built on the server with `specMailto(product, fallbackOrigin)`. */
  href: string;
  /** Origin used in that link; the click swaps in the page's own origin. */
  fallbackOrigin: string;
  className?: string;
};

/**
 * Opens the visitor's mail app with the product's key specs and a link to the printable sheet,
 * ready to forward to a contracting office. The link in the email points at whichever site the
 * visitor is on, so preview deployments don't send people to the live site's missing page.
 * The message is built on the server, so the product and deployment data stay out of the page
 * JavaScript; only the origin is swapped here.
 */
export function SendSpecsLink({ href, fallbackOrigin, className = "v2-link" }: Props) {
  return (
    <a
      href={href}
      onClick={(e) => {
        const from = encodeURIComponent(fallbackOrigin.replace(/\/$/, ""));
        const to = encodeURIComponent(window.location.origin);
        if (from === to) return;
        e.preventDefault();
        window.location.href = href.split(from).join(to);
      }}
      className={className}
    >
      Email the specs to your contracting office
    </a>
  );
}
