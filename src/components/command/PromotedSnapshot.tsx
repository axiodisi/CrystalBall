"use client";

import Link from "next/link";
import { Sparkline } from "@/components/indicators/Sparkline";
import { formatZ } from "@/lib/format";
import { useWatchlist } from "@/lib/watchlist/store";
import { sortLive } from "@/lib/watchlist/evaluate";
import { pairStatus } from "@/lib/watchlist/types";
import { StatusBadge } from "@/components/watchlist/StatusBadge";
import { useLiveWatch } from "@/components/watchlist/WatchlistLiveProvider";

export function PromotedSnapshot() {
  const { items } = useWatchlist();
  const { promotedLive, loading } = useLiveWatch();

  if (items.length === 0) {
    return (
      <div className="rounded-xl border border-dashed border-line bg-panel/60 p-4">
        <p className="text-sm text-paper">No watched pairs</p>
        <p className="mt-1 text-sm text-fog">
          Promote from Research to see live z-scores here.
        </p>
      </div>
    );
  }

  if (loading && promotedLive.length === 0) {
    return <div className="h-28 animate-pulse rounded-xl bg-panel" />;
  }

  const ranked = sortLive(promotedLive, items).slice(0, 6);

  return (
    <div className="space-y-2">
      {ranked.map((item) => {
        const pair = items.find((row) => row.id === item.id);
        const entry = pair?.entryZ ?? 2;
        return (
          <Link
            key={item.id}
            href="/watchlist"
            className="block rounded-lg border border-line bg-panel px-3 py-3"
          >
            <div className="flex items-center justify-between gap-3">
              <p className="font-mono text-sm">
                {item.tickerA} / {item.tickerB}
              </p>
              <StatusBadge z={item.z} entryZ={entry} />
            </div>
            <div className="mt-2 flex items-end justify-between gap-3">
              <p className="font-mono text-lg">
                {item.z === null ? "—" : formatZ(item.z)}
              </p>
              <Sparkline
                values={item.sparkline}
                tone={
                  pairStatus(item.z, entry).startsWith("triggered")
                    ? "elevated"
                    : pairStatus(item.z, entry) === "approaching"
                      ? "watch"
                      : "calm"
                }
                className="h-7 w-24"
              />
            </div>
          </Link>
        );
      })}
    </div>
  );
}
