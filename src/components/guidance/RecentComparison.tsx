import { Sparkline } from "@/components/indicators/Sparkline";
import { formatZ } from "@/lib/format";
import { recentZContext } from "@/lib/guidance";

type RecentComparisonProps = {
  series?: Array<{ z: number | null }>;
  loading?: boolean;
};

export function RecentComparison({ series, loading }: RecentComparisonProps) {
  if (loading) {
    return <div className="h-24 animate-pulse rounded-xl bg-raised" />;
  }

  const ctx = recentZContext(series ?? []);

  return (
    <article className="rounded-xl border border-line bg-panel p-4">
      <div className="flex items-start justify-between gap-3">
        <p className="font-mono text-[10px] tracking-[0.28em] text-amber uppercase">
          Recent comparison
        </p>
        <Sparkline
          values={ctx.sparkline}
          tone={ctx.tone}
          className="h-8 w-24"
        />
      </div>
      <dl className="mt-3 grid grid-cols-2 gap-3 text-sm">
        <div>
          <dt className="font-mono text-[10px] tracking-wide text-fog uppercase">
            Current z
          </dt>
          <dd className="mt-1 font-mono">
            {ctx.currentZ === null ? "—" : formatZ(ctx.currentZ)}
          </dd>
        </div>
        <div>
          <dt className="font-mono text-[10px] tracking-wide text-fog uppercase">
            About 5 days ago
          </dt>
          <dd className="mt-1 font-mono">
            {ctx.priorZ === null ? "—" : formatZ(ctx.priorZ)}
          </dd>
        </div>
      </dl>
      <p className="mt-3 text-sm leading-snug text-paper/90">{ctx.line}</p>
    </article>
  );
}
