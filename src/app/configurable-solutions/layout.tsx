/**
 * The redesigned catalog and product pages don't use the legacy compare tray, so this layout no
 * longer wraps them in ProductCompareProvider / ProductCompareTools. Those pulled the whole static
 * catalog into the page JavaScript and fetched /api/catalog/products on every visit, for a bar that
 * never appeared. useProductCompare() falls back to a no-op without the provider, and the SOF
 * portal's views live under /sof-solutions, outside this layout.
 */
export default function ConfigurableSolutionsLayout({ children }: { children: React.ReactNode }) {
  return children;
}
