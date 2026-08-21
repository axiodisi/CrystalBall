import { buildMarketSnapshot } from "@/lib/guidance";
import type { IndicatorsPayload } from "@/lib/data/types";
import { BriefCard } from "./BriefCard";
import { RegimeBadge } from "./GuidanceBadge";

export function MarketSnapshot({ data }: { data: IndicatorsPayload }) {
  const snapshot = buildMarketSnapshot(data);

  return (
    <BriefCard
      kicker="Market snapshot"
      badge={<RegimeBadge regime={snapshot.regime} />}
      lines={snapshot.lines}
    />
  );
}
