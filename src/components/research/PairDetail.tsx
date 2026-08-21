"use client";

import { useEffect, useState } from "react";
import { PairBrief } from "@/components/guidance/PairBrief";
import { RecentComparison } from "@/components/guidance/RecentComparison";
import { MiniChart } from "@/components/research/MiniChart";
import { PairProfileLink } from "@/components/research/PairProfileLink";
import { formatNumber, formatSigned, formatZ } from "@/lib/format";
import type { PairDetail as PairDetailData, PairSummary } from "@/lib/research/types";
import { DEFAULT_ENTRY_Z, DEFAULT_EXIT_Z } from "@/lib/research/types";

type PairDetailProps = {
  pair: PairSummary;
  onClose: () => void;
  onPromote: (pair: PairSummary, notes: string) => void;
  promoted: boolean;
};

export function PairDetail({
  pair,
  onClose,
  onPromote,
  promoted,
}: PairDetailProps) {
  const [lookback, setLookback] = useState(pair.lookbackDays);
  const [notes, setNotes] = useState("");
  const requestKey = `${pair.tickerA}|${pair.tickerB}|${lookback}`;
  const [loaded, setLoaded] = useState<{
    key: string;
    data: PairDetailData | null;
    error: string | null;
  }>({ key: "", data: null, error: null });

  useEffect(() => {
    let cancelled = false;
    const params = new URLSearchParams({
      a: pair.tickerA,
      b: pair.tickerB,
      lookback: String(lookback),
    });
    fetch(`/api/research/pair?${params}`)
      .then(async (response) => {
        const json = (await response.json()) as PairDetailData & {
          error?: string;
        };
        if (!response.ok) throw new Error(json.error ?? "Detail failed");
        if (!cancelled) setLoaded({ key: requestKey, data: json, error: null });
      })
      .catch((err: unknown) => {
        if (!cancelled) {
          setLoaded({
            key: requestKey,
            data: null,
            error: err instanceof Error ? err.message : "Detail failed",
          });
        }
      });
    return () => {
      cancelled = true;
    };
  }, [pair.tickerA, pair.tickerB, lookback, requestKey]);

  const loading = loaded.key !== requestKey;
  const detail = loaded.key === requestKey ? loaded.data : null;
  const error = loaded.key === requestKey ? loaded.error : null;

  const stats = detail ?? pair;
  const passed =
    stats.adfPValue < 0.05 &&
    stats.halfLife !== null &&
    stats.halfLife >= 5 &&
    stats.halfLife <= 60;

  return (
    <section className="flex h-full min-h-0 flex-1 flex-col bg-panel lg:border-l lg:border-line">
      <div className="flex shrink-0 items-start justify-between gap-3 border-b border-line p-4">
        <div>
          <p className="font-mono text-[10px] tracking-[0.2em] text-amber uppercase">
            Detail
          </p>
          <h2 className="mt-1 text-lg">
            {stats.tickerA} / {stats.tickerB}
          </h2>
          <p className="text-sm text-fog">
            log({stats.tickerA}) = {formatSigned(stats.alpha, 3)} +{" "}
            {formatNumber(stats.beta, 3)} · log({stats.tickerB})
          </p>
          <PairProfileLink
            tickerA={stats.tickerA}
            tickerB={stats.tickerB}
            lookback={lookback}
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
        <label className="block text-sm text-fog">
          Lookback (trading days)
          <input
            type="number"
            min={40}
            max={180}
            value={lookback}
            onChange={(event) => setLookback(Number(event.target.value))}
            className="mt-1 w-full rounded-md border border-line bg-ink px-3 py-2 font-mono text-paper"
          />
        </label>

        <dl className="grid grid-cols-2 gap-3 text-sm">
          <Stat label="β" value={formatNumber(stats.beta, 3)} />
          <Stat label="corr" value={formatNumber(stats.correlation, 3)} />
          <Stat label="ADF p" value={stats.adfPValue.toExponential(2)} />
          <Stat
            label="Half-life"
            value={
              stats.halfLife === null ? "—" : `${formatNumber(stats.halfLife, 1)}d`
            }
          />
          <Stat
            label="Current z"
            value={stats.currentZ === null ? "—" : formatZ(stats.currentZ)}
          />
          <Stat label="Score" value={formatNumber(stats.score, 1)} />
        </dl>

        <RecentComparison
          series={detail?.series}
          loading={loading && !detail}
        />

        <PairBrief
          tickerA={stats.tickerA}
          tickerB={stats.tickerB}
          z={stats.currentZ}
          entryZ={DEFAULT_ENTRY_Z}
          exitZ={DEFAULT_EXIT_Z}
          halfLife={stats.halfLife}
          adfPValue={stats.adfPValue}
        />

        <p className="text-sm text-fog">
          {passed
            ? "Passes MVP gates: |corr| pre-filter already applied, ADF p < 0.05, half-life 5–60 days."
            : "This lookback fails an MVP gate (p ≥ 0.05 or half-life outside 5–60). Adjust the window or skip promote."}
        </p>

        {loading ? (
          <div className="h-36 animate-pulse rounded-md bg-raised" />
        ) : error ? (
          <p className="text-sm text-rose">{error}</p>
        ) : detail ? (
          <>
            <div>
              <p className="mb-2 text-xs tracking-wide text-fog uppercase">
                Normalized log prices
              </p>
              <MiniChart
                lines={[
                  {
                    values: detail.series.map((row) => row.aNorm),
                    color: "#E6A23C",
                  },
                  {
                    values: detail.series.map((row) => row.bNorm),
                    color: "#3EB8C4",
                  },
                ]}
              />
              <p className="mt-1 font-mono text-[10px] text-fog">
                <span className="text-amber">{stats.tickerA}</span> ·{" "}
                <span className="text-cyan">{stats.tickerB}</span>
              </p>
            </div>
            <div>
              <p className="mb-2 text-xs tracking-wide text-fog uppercase">
                Spread ± 1σ / 2σ
              </p>
              <MiniChart
                lines={[
                  {
                    values: detail.series.map((row) => row.spread),
                    color: "#E8EEF4",
                  },
                ]}
                bands={{ mean: detail.spreadMean, std: detail.spreadStd }}
              />
            </div>
          </>
        ) : null}

        <label className="block text-sm text-fog">
          Notes (passed to Watchlist)
          <textarea
            value={notes}
            onChange={(event) => setNotes(event.target.value)}
            rows={2}
            className="mt-1 w-full rounded-md border border-line bg-ink px-3 py-2 text-paper"
          />
        </label>
      </div>

      <div className="shrink-0 border-t border-line p-4">
        <button
          type="button"
          onClick={() => onPromote(stats, notes)}
          className="flex min-h-12 w-full items-center justify-center rounded-md bg-amber px-4 text-sm text-ink"
        >
          {promoted ? "Update on Watchlist" : "Add to Watchlist"}
        </button>
        <p className="mt-2 text-center font-mono text-[10px] text-fog">
          Saves β, windows, ±2.0 / ±0.5 z defaults. Live monitoring is Phase 3.
        </p>
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
