export function EngagementBar({ score }: { score: number }) {
  return (
    <div className="flex min-w-[120px] items-center gap-3">
      <div className="h-2 flex-1 bg-[rgba(255,255,255,0.08)]">
        <div className="h-full bg-[#4d9fff]" style={{ width: `${score}%` }} />
      </div>
      <span className="shrink-0 text-sm tabular-nums text-white">{score}</span>
    </div>
  );
}
