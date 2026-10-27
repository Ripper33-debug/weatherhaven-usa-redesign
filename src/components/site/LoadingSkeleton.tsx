export function LoadingSkeleton({ className = "" }: { className?: string }) {
  return (
    <div
      className={`animate-pulse rounded bg-white/[0.06] ${className}`}
      aria-hidden
    />
  );
}

export function PageLoadingSkeleton() {
  return (
    <div className="mx-auto max-w-[1400px] space-y-6 px-4 py-20 sm:px-6 lg:px-12">
      <LoadingSkeleton className="h-4 w-32" />
      <LoadingSkeleton className="h-10 w-2/3 max-w-lg" />
      <LoadingSkeleton className="h-4 w-full max-w-xl" />
      <div className="mt-12 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
        {[0, 1, 2].map((i) => (
          <LoadingSkeleton key={i} className="min-h-[280px]" />
        ))}
      </div>
    </div>
  );
}
