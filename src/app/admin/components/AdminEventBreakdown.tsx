import type { EventTypeCount } from "@/lib/admin-analytics";

export function AdminEventBreakdown({ items }: { items: EventTypeCount[] }) {
  const max = Math.max(...items.map((i) => i.count), 1);

  return (
    <div className="wh-marketing-panel p-6 sm:p-8">
      <p className="text-[11px] font-medium tracking-[0.12em] text-[#8a9099] uppercase">Events by type</p>
      <p className="mt-2 text-sm text-[#8a9099]">Tracked CTA clicks, section views, and custom actions</p>
      <ul className="mt-6 space-y-4">
        {items.length === 0 ? (
          <li className="text-sm text-[#8a9099]">No events recorded yet.</li>
        ) : (
          items.map((item) => (
            <li key={item.type}>
              <div className="flex items-baseline justify-between gap-4 text-sm">
                <span className="capitalize text-white">{item.type}</span>
                <span className="tabular-nums text-[#8a9099]">{item.count}</span>
              </div>
              <div className="mt-2 h-1.5 bg-[#080a0c]">
                <div
                  className="h-full bg-[#4d9fff]/70"
                  style={{ width: `${Math.max((item.count / max) * 100, item.count > 0 ? 4 : 0)}%` }}
                />
              </div>
            </li>
          ))
        )}
      </ul>
    </div>
  );
}
