"use client";

import Link from "next/link";
import { useMemo, useState } from "react";
import { Sparkline } from "@/components/indicators/Sparkline";
import { standingSpreadSoWhat } from "@/lib/guidance";
import { formatClock, formatNumber, formatZ } from "@/lib/format";
import { useAlerts } from "@/lib/watchlist/alerts";
import { sortLive } from "@/lib/watchlist/evaluate";
import { useWatchlist } from "@/lib/watchlist/store";
import type { LiveItem } from "@/lib/watchlist/types";
import { pairStatus } from "@/lib/watchlist/types";
import { DetailSheet } from "@/components/shell/DetailSheet";
import { AlertStrip } from "./AlertStrip";
import { StatusBadge } from "./StatusBadge";
import { WatchDetail } from "./WatchDetail";
import { useLiveWatch } from "./WatchlistLiveProvider";

export function WatchlistBoard() {
  const { items, remove, update } = useWatchlist();
  const { standing, promotedLive, loading, error, updatedAt, refresh } =
    useLiveWatch();
  const alerts = useAlerts();
  const [selectedId, setSelectedId] = useState<string | null>(null);

  const liveById = useMemo(() => {
    return new Map(promotedLive.map((item) => [item.id, item]));
  }, [promotedLive]);

  const ranked = useMemo(
    () => sortLive(promotedLive, items),
    [promotedLive, items],
  );

  const selected = items.find((item) => item.id === selectedId) ?? null;

  return (
    <div className="lg:grid lg:grid-cols-[minmax(0,1fr)_380px] lg:gap-0">
      <div className="space-y-6 lg:pr-6">
        <section>
          <p className="font-mono text-[10px] tracking-[0.28em] text-amber uppercase">
            Watchlist
          </p>
          <h1 className="mt-1 text-2xl tracking-tight">Live pairs</h1>
          <p className="mt-2 max-w-2xl text-sm text-fog">
            z = (spread − μ) / σ using the stored β. Entry default ±2.0, exit
            ±0.5. Browser notifications only.
          </p>
          <div className="mt-3 flex flex-wrap items-center gap-3">
            <button
              type="button"
              onClick={refresh}
              className="min-h-11 rounded-md border border-line px-3 text-sm text-fog"
            >
              Refresh
            </button>
            <label className="flex min-h-11 items-center gap-2 text-sm text-fog">
              <input
                type="checkbox"
                checked={alerts.settings.notifications}
                onChange={(event) =>
                  alerts.setNotifications(event.target.checked)
                }
              />
              Browser alerts
            </label>
            <button
              type="button"
              onClick={() => void alerts.requestPermission()}
              className="min-h-11 text-sm text-cyan"
            >
              Request permission
            </button>
            {updatedAt ? (
              <span className="font-mono text-[10px] text-fog">
                {formatClock(updatedAt)}
              </span>
            ) : null}
          </div>
          <div className="tape-scan mt-4 h-px bg-line" />
        </section>

        <AlertStrip />
        {error ? <p className="text-sm text-rose">{error}</p> : null}

        <section className="space-y-3">
          <h2 className="text-sm tracking-wide text-fog uppercase">
            Standing spreads
          </h2>
          <div className="grid gap-3 sm:grid-cols-2">
            {standing.map((item) => (
              <StandingCard key={item.id} item={item} />
            ))}
          </div>
        </section>

        {items.length === 0 ? (
          <div className="rounded-xl border border-dashed border-line bg-panel p-5">
            <p className="text-lg text-paper">No promoted pairs</p>
            <p className="mt-2 text-sm text-fog">
              Promote a pair from Research to monitor its z-score.
            </p>
            <Link
              href="/research"
              className="mt-4 inline-flex min-h-11 items-center rounded-md border border-amber/40 px-4 text-sm text-amber"
            >
              Open Research
            </Link>
          </div>
        ) : loading ? (
          <div className="h-32 animate-pulse rounded-xl bg-panel" />
        ) : (
          <ul className="space-y-2">
            {ranked.map((row) => {
              const pair = items.find((item) => item.id === row.id);
              if (!pair) return null;
              const active = selectedId === pair.id;
              return (
                <li key={pair.id}>
                  <button
                    type="button"
                    onClick={() => setSelectedId(pair.id)}
                    className={`w-full rounded-xl border p-4 text-left ${
                      active
                        ? "border-amber/50 bg-raised"
                        : "border-line bg-panel"
                    }`}
                  >
                    <div className="flex items-start justify-between gap-3">
                      <div>
                        <p className="font-mono text-sm">
                          {pair.tickerA} / {pair.tickerB}
                        </p>
                        <p className="mt-1 text-xs text-fog">
                          {pair.nameA} · {pair.nameB}
                        </p>
                      </div>
                      <div className="flex flex-col items-end gap-2">
                        <StatusBadge z={row.z} entryZ={pair.entryZ} />
                        <Sparkline
                          values={row.sparkline}
                          tone={sparkTone(row.z, pair.entryZ)}
                        />
                      </div>
                    </div>
                    <p className="mt-3 font-mono text-[11px] text-fog">
                      z {row.z === null ? "—" : formatZ(row.z)} · β{" "}
                      {formatNumber(pair.beta, 3)}
                      {alerts.isMuted(pair.id) ? " · muted" : ""}
                    </p>
                  </button>
                </li>
              );
            })}
          </ul>
        )}
      </div>

      {selected ? (
        <DetailSheet>
          <WatchDetail
            pair={selected}
            live={liveById.get(selected.id)}
            muted={alerts.isMuted(selected.id)}
            onClose={() => setSelectedId(null)}
            onRemove={() => {
              remove(selected.id);
              setSelectedId(null);
            }}
            onMute={() => alerts.toggleMute(selected.id)}
            onChange={(patch) => update(selected.id, patch)}
          />
        </DetailSheet>
      ) : (
        <div className="hidden rounded-xl border border-dashed border-line p-6 text-sm text-fog lg:block">
          Select a pair for charts and editable thresholds.
        </div>
      )}
    </div>
  );
}

function StandingCard({ item }: { item: LiveItem }) {
  return (
    <article className="rounded-xl border border-line bg-panel p-4">
      <div className="flex items-center justify-between gap-2">
        <p className="text-sm text-paper">
          {item.nameA}–{item.nameB}
        </p>
        <StatusBadge z={item.z} entryZ={2} />
      </div>
      <p className="mt-2 font-mono text-xl">
        {item.z === null ? "—" : formatZ(item.z)}
      </p>
      <p className="font-mono text-[11px] text-fog">
        Always on · not a promoted pair
      </p>
      <p className="mt-2 text-xs leading-snug text-paper/90">
        {standingSpreadSoWhat(`${item.nameA}–${item.nameB}`, item.z)}
      </p>
      <Sparkline
        values={item.sparkline}
        tone={sparkTone(item.z, 2)}
        className="mt-3 h-8 w-full"
      />
    </article>
  );
}

function sparkTone(z: number | null, entry: number) {
  const status = pairStatus(z, entry);
  if (status.startsWith("triggered")) return "elevated";
  if (status === "approaching") return "watch";
  if (z === null) return "unknown";
  return "calm";
}
