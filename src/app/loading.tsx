export default function Loading() {
  return (
    <div className="space-y-6">
      <div className="h-6 w-40 animate-pulse rounded bg-raised" />
      <div className="flex gap-3 overflow-hidden">
        {Array.from({ length: 4 }).map((_, index) => (
          <div
            key={index}
            className="h-28 min-w-[11rem] flex-1 animate-pulse rounded-xl bg-panel"
          />
        ))}
      </div>
      <div className="h-40 animate-pulse rounded-xl bg-panel" />
    </div>
  );
}
