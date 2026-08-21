import type { PolymarketCard as PolymarketCardData } from "@/lib/data/types";
import { formatCompact, formatPct } from "@/lib/format";
import { polymarketSoWhat } from "@/lib/guidance";
import { IconPin } from "@/components/shell/icons";

type PolymarketCardProps = {
  market: PolymarketCardData;
  pinned?: boolean;
  onTogglePin?: () => void;
};

export function PolymarketCard({
  market,
  pinned,
  onTogglePin,
}: PolymarketCardProps) {
  const probability =
    market.probability === null
      ? "—"
      : `${Math.round(market.probability * 100)}%`;

  return (
    <article className="rounded-xl border border-line bg-panel p-4">
      <div className="flex items-start justify-between gap-3">
        <p className="text-sm leading-snug text-paper">{market.question}</p>
        {onTogglePin ? (
          <button
            type="button"
            onClick={onTogglePin}
            aria-pressed={pinned}
            aria-label={pinned ? "Unpin from Command" : "Pin to Command"}
            className={`flex h-11 w-11 shrink-0 items-center justify-center rounded-md border ${
              pinned ? "border-amber/50 text-amber" : "border-line text-fog"
            }`}
          >
            <IconPin className="h-4 w-4" filled={pinned} />
          </button>
        ) : null}
      </div>
      <p className="mt-3 font-mono text-3xl tracking-tight text-paper">
        {probability}
      </p>
      <p className="mt-1 text-sm text-fog">Polymarket crowd probability</p>
      <p className="mt-1 font-mono text-xs text-fog">
        {market.change24h !== null
          ? `${formatPct(market.change24h * 100)} 24h`
          : "No 24h change"}
        {market.volume !== null ? `  ·  vol ${formatCompact(market.volume)}` : ""}
        {!market.available ? "  ·  sample only" : ""}
      </p>
      <p className="mt-3 text-sm leading-snug text-paper/90">
        {polymarketSoWhat(market)}
      </p>
      <a
        href={market.url}
        target="_blank"
        rel="noreferrer"
        className="mt-3 inline-flex min-h-11 items-center font-mono text-xs tracking-wide text-cyan uppercase"
      >
        View on Polymarket →
      </a>
    </article>
  );
}
