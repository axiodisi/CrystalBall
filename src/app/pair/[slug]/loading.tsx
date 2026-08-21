export default function PairProfileLoading() {
  return (
    <div className="space-y-4">
      <div className="h-8 w-48 animate-pulse rounded bg-raised" />
      <div className="grid gap-3 sm:grid-cols-2">
        <div className="h-24 animate-pulse rounded-xl bg-panel" />
        <div className="h-24 animate-pulse rounded-xl bg-panel" />
      </div>
      <div className="h-28 animate-pulse rounded-xl bg-panel" />
      <div className="h-28 animate-pulse rounded-xl bg-panel" />
    </div>
  );
}
