"use client";

import { specMailto } from "@/lib/product-buying";

type Props = {
  product: Parameters<typeof specMailto>[0];
  /** Origin used in the server-rendered link (the click uses the page's own origin). */
  fallbackOrigin: string;
  className?: string;
};

/**
 * Opens the visitor's mail app with the product's key specs and a link to the printable sheet,
 * ready to forward to a contracting office. The link in the email points at whichever site the
 * visitor is on, so preview deployments don't send people to the live site's missing page.
 */
export function SendSpecsLink({ product, fallbackOrigin, className = "v2-link" }: Props) {
  return (
    <a
      href={specMailto(product, fallbackOrigin)}
      onClick={(e) => {
        e.preventDefault();
        window.location.href = specMailto(product, window.location.origin);
      }}
      className={className}
    >
      Email the specs to your contracting office
    </a>
  );
}
