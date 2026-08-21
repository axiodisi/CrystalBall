"use client";

import { buildPairBrief } from "@/lib/guidance";
import { BriefCard } from "./BriefCard";
import { QualityBadge } from "./GuidanceBadge";
import { useTape } from "./useTape";

type PairBriefProps = {
  tickerA: string;
  tickerB: string;
  z: number | null;
  entryZ: number;
  exitZ: number;
  halfLife?: number | null;
  adfPValue?: number | null;
};

const LOADING_WHY =
  "Market backdrop is still loading — this line will fill in.";

export function PairBrief({
  tickerA,
  tickerB,
  z,
  entryZ,
  exitZ,
  halfLife,
  adfPValue,
}: PairBriefProps) {
  const { reading, loading } = useTape();
  const regime = reading?.regime ?? "unknown";
  const brief = buildPairBrief({
    tickerA,
    tickerB,
    z,
    entryZ,
    exitZ,
    halfLife,
    adfPValue,
    regime,
  });

  const items =
    loading && !reading
      ? brief.items.map((item) =>
          item.label === "Why it might matter?"
            ? { ...item, text: LOADING_WHY }
            : item,
        )
      : brief.items;

  return (
    <BriefCard
      kicker="Pair brief"
      badge={<QualityBadge quality={brief.quality} />}
      items={items}
    />
  );
}
