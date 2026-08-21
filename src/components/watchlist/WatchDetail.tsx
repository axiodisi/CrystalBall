"use client";

import { useEffect, useState } from "react";
import { PairBrief } from "@/components/guidance/PairBrief";
import { RecentComparison } from "@/components/guidance/RecentComparison";
import { MiniChart } from "@/components/research/MiniChart";
import { PairProfileLink } from "@/components/research/PairProfileLink";
import { formatNumber, formatZ } from "@/lib/format";
import type { PromotedPair } from "@/lib/research/types";
import type { LiveItem, LiveResponse } from "@/lib/watchlist/types";
import { StatusBadge } from "./StatusBadge";

type WatchDetailProps = {
  pair: PromotedPair;
  live: LiveItem | undefined;
  muted: boolean;
  onClose: () => void;
  onRemove: () => void;
  onMute: () => void;
  onChange: (patch: Partial<PromotedPair>) => void;
};

export function WatchDetail({
  pair,
  live,
  muted,
  onClose,
  onRemove,
  onMute,
  onChange,
}: WatchDetailProps) {
  const [detail, setDetail] = useState<LiveItem | null>(null);
  const requestKey = `${pair.id}:${pair.beta}:${pair.lookbackDays}`;
  const [loadedKey, setLoadedKey] = useState("");

  useEffect(() => {
    let cancelled = false;
    fetch("/api/watchlist/live", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        detailId: pair.id,
        pairs: [
          {
            id: pair.id,
            tickerA: pair.tickerA,
            tickerB: pair.tickerB,
            nameA: pair.nameA,
            nameB: pair.nameB,
            beta: pair.beta,
            lookbackDays: pair.lookbackDays,
          },
        ],
      }),
    })
      .then(async (response) => {
        const json = (await response.json()) as LiveResponse;
        const item = json.items.find((row) => row.id === pair.id) ?? null;
        if (!cancelled) {
          setDetail(item);
          setLoadedKey(requestKey);
        }
      })
      .catch(() => {
        if (!cancelled) {
          setDetail(null);
          setLoadedKey(requestKey);
        }
      });
    return () => {
      cancelled = true;
    };
  }, [pair.id, pair.tickerA, pair.tickerB, pair.nameA, pair.nameB, pair.beta, pair.lookbackDays, requestKey]);

  const item = detail ?? live;
  const loading = loadedKey !== requestKey;

  return (
    <section className="flex h-full min-h-0 flex-1 flex-col border-line bg-panel lg:border-l">
      <div className="flex shrink-0 items-start justify-between gap-3 border-b border-line p-4">
        <div>
          <p className="font-mono text-[10px] tracking-[0.2em] text-amber uppercase">
            Live
          </p>
          <h2 className="mt-1 text-lg">
            {pair.tickerA} / {pair.tickerB}
          </h2>
          <p className="text-sm text-fog">
            Stored β {formatNumber(pair.beta, 3)} · lookback {pair.lookbackDays}d
          </p>
          <PairProfileLink
            tickerA={pair.tickerA}
            tickerB={pair.tickerB}
            lookback={pair.lookbackDays}
          />
        </div>
        <button
          type="button"
          onClick={onClose}
          className="flex h-11 w-11 items-center justify-center rounded-md border border-line text-fog"
          aria-label="Close detail"
        >
          ×
        </button>
      </div>

      <div className="sheet-scroll min-h-0 flex-1 space-y-5 p-4">
        <div className="flex items-center justify-between">
          <p className="font-mono text-3xl">
            {item?.z === null || item?.z === undefined ? "—" : formatZ(item.z)}
          </p>
          <StatusBadge z={item?.z ?? null} entryZ={pair.entryZ} />
        </div>

        <RecentComparison
          series={item?.series}
          loading={loading && !item?.series}
        />

        <PairBrief
          tickerA={pair.tickerA}
          tickerB={pair.tickerB}
          z={item?.z ?? null}
          entryZ={pair.entryZ}
          exitZ={pair.exitZ}
          halfLife={pair.halfLife}
          adfPValue={pair.adfPValue}
        />

        <dl className="grid grid-cols-2 gap-3 text-sm">
          <Stat
            label="Half-life"
            value={pair.halfLife ? `${formatNumber(pair.halfLife, 1)}d` : "—"}
          />
          <Stat
            label="Spread"
            value={
              item?.spread === null || item?.spread === undefined
                ? "—"
                : formatNumber(item.spread, 4)
            }
          />
          <Stat label="Entry |z|" value={`±${pair.entryZ.toFixed(1)}`} />
          <Stat label="Exit |z|" value={`±${pair.exitZ.toFixed(1)}`} />
        </dl>

        <label className="block text-sm text-fog">
          Lookback (trading days)
          <input
            type="number"
            min={40}
            max={504}
            value={pair.lookbackDays}
            onChange={(event) =>
              onChange({ lookbackDays: Number(event.target.value) })
            }
            className="mt-1 w-full rounded-md border border-line bg-ink px-3 py-2 font-mono text-paper"
          />
        </label>
        <div className="grid grid-cols-2 gap-3">
          <label className="block text-sm text-fog">
            Entry |z|
            <input
              type="number"
              min={0.5}
              max={5}
              step={0.1}
              value={pair.entryZ}
              onChange={(event) =>
                onChange({ entryZ: Number(event.target.value) })
              }
              className="mt-1 w-full rounded-md border border-line bg-ink px-3 py-2 font-mono text-paper"
            />
          </label>
          <label className="block text-sm text-fog">
            Exit |z|
            <input
              type="number"
              min={0.1}
              max={2}
              step={0.1}
              value={pair.exitZ}
              onChange={(event) =>
                onChange({ exitZ: Number(event.target.value) })
              }
              className="mt-1 w-full rounded-md border border-line bg-ink px-3 py-2 font-mono text-paper"
            />
          </label>
        </div>

        {loading ? (
          <div className="h-36 animate-pulse rounded-md bg-raised" />
        ) : item?.series && item.series.length > 1 ? (
          <>
            <div>
              <p className="mb-2 text-xs tracking-wide text-fog uppercase">
                Normalized prices
              </p>
              <MiniChart
                lines={[
                  { values: item.series.map((row) => row.aNorm), color: "#E6A23C" },
                  { values: item.series.map((row) => row.bNorm), color: "#3EB8C4" },
                ]}
              />
            </div>
            <div>
              <p className="mb-2 text-xs tracking-wide text-fog uppercase">
                Spread ± 1σ / 2σ
              </p>
              <MiniChart
                lines={[
                  { values: item.series.map((row) => row.spread), color: "#E8EEF4" },
                ]}
                bands={{
                  mean: item.mean ?? 0,
                  std: item.std ?? 0,
                }}
              />
            </div>
          </>
        ) : (
          <p className="text-sm text-fog">
            {item?.error ?? "Charts unavailable for this pair."}
          </p>
        )}

        <label className="block text-sm text-fog">
          Notes
          <textarea
            value={pair.notes}
            onChange={(event) => onChange({ notes: event.target.value })}
            rows={2}
            className="mt-1 w-full rounded-md border border-line bg-ink px-3 py-2 text-paper"
          />
        </label>
      </div>

      <div className="shrink-0 space-y-2 border-t border-line p-4">
        <button
          type="button"
          onClick={onMute}
          className="flex min-h-11 w-full items-center justify-center rounded-md border border-line text-sm text-fog"
        >
          {muted ? "Unmute alerts" : "Mute this pair"}
        </button>
        <button
          type="button"
          onClick={onRemove}
          className="flex min-h-11 w-full items-center justify-center rounded-md border border-rose/40 text-sm text-rose"
        >
          Remove from Watchlist
        </button>
      </div>
    </section>
  );
}

function Stat({ label, value }: { label: string; value: string }) {
  return (
    <div className="rounded-lg border border-line bg-ink/40 p-3">
      <dt className="font-mono text-[10px] tracking-wide text-fog uppercase">
        {label}
      </dt>
      <dd className="mt-1 font-mono text-sm">{value}</dd>
    </div>
  );
}
