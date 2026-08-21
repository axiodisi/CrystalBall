export default function IndicatorsLoading() {
  return (
    <div className="space-y-4">
      <div className="h-8 w-56 animate-pulse rounded bg-raised" />
      {Array.from({ length: 4 }).map((_, index) => (
        <div key={index} className="h-32 animate-pulse rounded-xl bg-panel" />
      ))}
    </div>
  );
}
