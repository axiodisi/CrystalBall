"use client";

import { useMemo, useState, type ReactNode } from "react";
import { PairDetail } from "@/components/research/PairDetail";
import { formatCompact, formatNumber, formatZ } from "@/lib/format";
import type {
  PairSummary,
  ScanParams,
  ScanResponse,
} from "@/lib/research/types";
import { DEFAULT_SCAN } from "@/lib/research/types";
import { SECTORS } from "@/lib/research/universe";
import { useWatchlist } from "@/lib/watchlist/store";

type SortKey = "score" | "halfLife" | "adfPValue" | "correlation";

export function ResearchWorkbench() {
  const [params, setParams] = useState<ScanParams>(DEFAULT_SCAN);
  const [openFilters, setOpenFilters] = useState(true);
  const [scan, setScan] = useState<ScanResponse | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [sort, setSort] = useState<SortKey>("score");
  const [selected, setSelected] = useState<PairSummary | null>(null);
  const [banner, setBanner] = useState<string | null>(null);
  const watchlist = useWatchlist();

  const rows = useMemo(() => {
    const list = [...(scan?.results ?? [])];
    list.sort((a, b) => {
      if (sort === "score") return b.score - a.score;
      if (sort === "halfLife") return (a.halfLife ?? 999) - (b.halfLife ?? 999);
      if (sort === "adfPValue") return a.adfPValue - b.adfPValue;
      return Math.abs(b.correlation) - Math.abs(a.correlation);
    });
    return list;
  }, [scan, sort]);

  async function run(fresh = false) {
    setLoading(true);
    setError(null);
    setBanner(null);
    try {
      const response = await fetch(
        `/api/research/scan${fresh ? "?fresh=1" : ""}`,
        {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(params),
        },
      );
      if (!response.ok) throw new Error(`Scan failed (${response.status})`);
      const json = (await response.json()) as ScanResponse;
      setScan(json);
      setSelected(json.results[0] ?? null);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Scan failed");
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="lg:grid lg:grid-cols-[minmax(0,1fr)_380px] lg:gap-0">
      <div className="space-y-6 lg:pr-6">
        <section>
          <p className="font-mono text-[10px] tracking-[0.28em] text-amber uppercase">
            Research
          </p>
          <h1 className="mt-1 text-2xl tracking-tight">Pair discovery</h1>
          <p className="mt-2 max-w-2xl text-sm text-fog">
            Correlation pre-filter, then OLS β, Engle-Granger ADF, and half-life.
            Promote a clean pair to Watchlist — this module does not raise alerts.
          </p>
          <div className="tape-scan mt-4 h-px bg-line" />
        </section>

        <section className="rounded-xl border border-line bg-panel">
          <button
            type="button"
            onClick={() => setOpenFilters((value) => !value)}
            className="flex min-h-12 w-full items-center justify-between px-4 text-sm"
          >
            Filters
            <span className="font-mono text-[10px] text-fog">
              {openFilters ? "Hide" : "Show"}
            </span>
          </button>
          {openFilters ? (
            <div className="grid gap-3 border-t border-line p-4 sm:grid-cols-2">
              <Field label="Universe">
                <select
                  value={params.universe}
                  onChange={(event) =>
                    setParams((prev) => ({
                      ...prev,
                      universe: event.target.value as ScanParams["universe"],
                    }))
                  }
                  className="w-full rounded-md border border-line bg-ink px-3 py-2 text-sm text-paper"
                >
                  <option value="liquid">Liquid core (~110 names)</option>
                  <option value="sp500">Full S&P 500 (slower)</option>
                </select>
              </Field>
              <Field label="Sector">
                <select
                  value={params.sector}
                  onChange={(event) =>
                    setParams((prev) => ({ ...prev, sector: event.target.value }))
                  }
                  className="w-full rounded-md border border-line bg-ink px-3 py-2 text-sm text-paper"
                >
                  <option value="all">All sectors</option>
                  {SECTORS.map((sector) => (
                    <option key={sector} value={sector}>
                      {sector}
                    </option>
                  ))}
                </select>
              </Field>
              <Field label="Min price">
                <input
                  type="number"
                  min={0}
                  value={params.minPrice}
                  onChange={(event) =>
                    setParams((prev) => ({
                      ...prev,
                      minPrice: Number(event.target.value),
                    }))
                  }
                  className="w-full rounded-md border border-line bg-ink px-3 py-2 text-sm text-paper"
                />
              </Field>
              <Field label="Min ADV ($)">
                <input
                  type="number"
                  min={0}
                  step={1_000_000}
                  value={params.minAdv}
                  onChange={(event) =>
                    setParams((prev) => ({
                      ...prev,
                      minAdv: Number(event.target.value),
                    }))
                  }
                  className="w-full rounded-md border border-line bg-ink px-3 py-2 text-sm text-paper"
                />
              </Field>
              <Field label="Corr lookback (days)">
                <input
                  type="number"
                  min={40}
                  max={180}
                  value={params.corrLookback}
                  onChange={(event) =>
                    setParams((prev) => ({
                      ...prev,
                      corrLookback: Number(event.target.value),
                    }))
                  }
                  className="w-full rounded-md border border-line bg-ink px-3 py-2 text-sm text-paper"
                />
              </Field>
              <Field label="Estimation window (days)">
                <input
                  type="number"
                  min={60}
                  max={504}
                  value={params.estLookback}
                  onChange={(event) =>
                    setParams((prev) => ({
                      ...prev,
                      estLookback: Number(event.target.value),
                    }))
                  }
                  className="w-full rounded-md border border-line bg-ink px-3 py-2 text-sm text-paper"
                />
              </Field>
              <Field label="|corr| min">
                <input
                  type="number"
                  min={0.5}
                  max={0.99}
                  step={0.01}
                  value={params.corrMin}
                  onChange={(event) =>
                    setParams((prev) => ({
                      ...prev,
                      corrMin: Number(event.target.value),
                    }))
                  }
                  className="w-full rounded-md border border-line bg-ink px-3 py-2 text-sm text-paper"
                />
              </Field>
              <div className="sm:col-span-2">
                <button
                  type="button"
                  onClick={() => run(true)}
                  disabled={loading}
                  className="flex min-h-12 w-full items-center justify-center rounded-md bg-amber px-4 text-sm text-ink disabled:opacity-60"
                >
                  {loading ? "Running pipeline…" : "Run scan"}
                </button>
                <p className="mt-2 text-xs text-fog">
                  Default is a liquid S&P subset so the first run stays usable.
                  Full S&P 500 can take up to about a minute.
                </p>
              </div>
            </div>
          ) : null}
        </section>

        {error ? <p className="text-sm text-rose">{error}</p> : null}
        {banner ? <p className="text-sm text-sage">{banner}</p> : null}

        {scan ? (
          <section className="space-y-3">
            <div className="flex flex-wrap items-end justify-between gap-3">
              <p className="text-sm text-fog">
                {scan.eligible} names · {scan.corrPassed} |corr|≥
                {scan.params.corrMin.toFixed(2)} · {scan.cointPassed} passed
                EG/half-life · {(scan.durationMs / 1000).toFixed(1)}s
              </p>
              <label className="text-xs text-fog">
                Sort{" "}
                <select
                  value={sort}
                  onChange={(event) => setSort(event.target.value as SortKey)}
                  className="ml-1 rounded-md border border-line bg-panel px-2 py-1 text-paper"
                >
                  <option value="score">Score</option>
                  <option value="halfLife">Half-life</option>
                  <option value="adfPValue">ADF p-value</option>
                  <option value="correlation">|corr|</option>
                </select>
              </label>
            </div>
            {scan.warnings.map((warning) => (
              <p key={warning} className="text-xs text-amber">
                {warning}
              </p>
            ))}

            {rows.length === 0 ? (
              <p className="rounded-xl border border-dashed border-line p-4 text-sm text-fog">
                No pairs cleared the gates. Loosen |corr|, ADV, or sector and
                scan again.
              </p>
            ) : (
              <ul className="space-y-2">
                {rows.map((row) => {
                  const active =
                    selected?.tickerA === row.tickerA &&
                    selected?.tickerB === row.tickerB;
                  return (
                    <li key={`${row.tickerA}-${row.tickerB}`}>
                      <button
                        type="button"
                        onClick={() => setSelected(row)}
                        className={`w-full rounded-xl border p-4 text-left ${
                          active
                            ? "border-amber/50 bg-raised"
                            : "border-line bg-panel"
                        }`}
                      >
                        <div className="flex items-start justify-between gap-3">
                          <div>
                            <p className="font-mono text-sm">
                              {row.tickerA} / {row.tickerB}
                            </p>
                            <p className="mt-1 text-xs text-fog">
                              {row.nameA} · {row.nameB}
                            </p>
                          </div>
                          <p className="font-mono text-sm text-amber">
                            {formatNumber(row.score, 1)}
                          </p>
                        </div>
                        <p className="mt-3 font-mono text-[11px] text-fog">
                          corr {formatNumber(row.correlation, 3)} · β{" "}
                          {formatNumber(row.beta, 3)} · p{" "}
                          {row.adfPValue.toExponential(1)} · hl{" "}
                          {row.halfLife === null
                            ? "—"
                            : `${formatNumber(row.halfLife, 1)}d`}
                          {row.currentZ !== null
                            ? ` · z ${formatZ(row.currentZ)}`
                            : ""}
                          {row.minAdv > 0
                            ? ` · ADV ${formatCompact(row.minAdv)}`
                            : ""}
                        </p>
                      </button>
                    </li>
                  );
                })}
              </ul>
            )}
          </section>
        ) : (
          <p className="rounded-xl border border-dashed border-line p-4 text-sm text-fog">
            Run a scan to rank cointegrated names. Pipeline: |corr| ≥ 0.80 → OLS
            on log prices → Engle-Granger ADF p &lt; 0.05 → half-life 5–60 days.
          </p>
        )}
      </div>

      {selected ? (
        <div className="fixed inset-0 z-30 bg-ink/80 lg:static lg:z-auto lg:bg-transparent">
          <div className="absolute inset-x-0 bottom-0 max-h-[92dvh] overflow-hidden rounded-t-2xl border-t border-line lg:static lg:max-h-none lg:rounded-none lg:border-0">
            <PairDetail
              key={`${selected.tickerA}-${selected.tickerB}`}
              pair={selected}
              promoted={watchlist.has(selected.tickerA, selected.tickerB)}
              onClose={() => setSelected(null)}
              onPromote={(item, notes) => {
                watchlist.promote(item, notes);
                setBanner(
                  `${item.tickerA}/${item.tickerB} saved to Watchlist with β ${formatNumber(item.beta, 3)}.`,
                );
              }}
            />
          </div>
        </div>
      ) : (
        <div className="hidden rounded-xl border border-dashed border-line p-6 text-sm text-fog lg:block">
          Select a pair to inspect β, ADF, half-life, and charts.
        </div>
      )}
    </div>
  );
}

function Field({
  label,
  children,
}: {
  label: string;
  children: ReactNode;
}) {
  return (
    <label className="block text-xs text-fog">
      {label}
      <div className="mt-1">{children}</div>
    </label>
  );
}
