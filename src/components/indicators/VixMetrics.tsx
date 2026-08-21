import type { IndicatorSnapshot } from "@/lib/data/types";
import { formatPct } from "@/lib/format";
import { formatImpliedDailyMove } from "@/lib/indicators/vix";

type VixMetricsProps = {
  indicator: IndicatorSnapshot;
  compact?: boolean;
};

export function VixMetrics({ indicator, compact = false }: VixMetricsProps) {
  const implied =
    indicator.value !== null && Number.isFinite(indicator.value)
      ? formatImpliedDailyMove(indicator.value)
      : "—";
  const fiveDay =
    indicator.change5dPct === null || indicator.change5dPct === undefined
      ? "—"
      : formatPct(indicator.change5dPct);

  return (
    <dl className={compact ? "mt-2 space-y-1" : "mt-3 space-y-2"}>
      <Metric
        compact={compact}
        label="VIX level"
        value={indicator.displayValue}
      />
      <Metric
        compact={compact}
        label="Implied daily move"
        value={implied}
        hint="VIX ÷ 16"
      />
      <Metric
        compact={compact}
        label="VIX 5d change"
        value={fiveDay}
        hint="VIX index, not S&P"
      />
    </dl>
  );
}

function Metric({
  label,
  value,
  hint,
  compact,
}: {
  label: string;
  value: string;
  hint?: string;
  compact: boolean;
}) {
  return (
    <div className={compact ? "" : "rounded-lg border border-line bg-ink/40 px-3 py-2"}>
      <dt
        className={`font-mono tracking-wide text-fog uppercase ${
          compact ? "text-[9px]" : "text-[10px]"
        }`}
      >
        {label}
        {hint ? (
          <span className="normal-case tracking-normal text-fog/80"> · {hint}</span>
        ) : null}
      </dt>
      <dd
        className={`font-mono break-words text-paper ${
          compact ? "mt-0.5 text-[11px] leading-snug" : "mt-1 text-sm"
        }`}
      >
        {value}
      </dd>
    </div>
  );
}
