"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import { QualityBadge, RegimeBadge } from "@/components/guidance/GuidanceBadge";
import { useTape } from "@/components/guidance/useTape";
import { formatNumber, formatZ } from "@/lib/format";
import { QUALITY_LABEL, setupQuality } from "@/lib/guidance";
import { DEFAULT_ENTRY_Z } from "@/lib/research/types";
import type { PairDetail as PairDetailData } from "@/lib/research/types";
import {
  googleFinanceUrl,
  lookupName,
  secSearchUrl,
  whyPaired,
  yahooQuoteUrl,
} from "@/lib/research/profile";
import { useWatchlist } from "@/lib/watchlist/store";

type PairProfileProps = {
  tickerA: string;
  tickerB: string;
  lookback: number;
};

export function PairProfile({ tickerA, tickerB, lookback }: PairProfileProps) {
  const left = lookupName(tickerA);
  const right = lookupName(tickerB);
  const why = whyPaired(left, right);
  const watchlist = useWatchlist();
  const stored = watchlist.items.find(
    (item) => item.tickerA === tickerA && item.tickerB === tickerB,
  );
  const { reading, loading: tapeLoading } = useTape();
  const requestKey = `${tickerA}|${tickerB}|${lookback}`;
  const [loaded, setLoaded] = useState<{
    key: string;
    data: PairDetailData | null;
    error: string | null;
  }>({ key: "", data: null, error: null });

  useEffect(() => {
    let cancelled = false;
    const params = new URLSearchParams({
      a: tickerA,
      b: tickerB,
      lookback: String(lookback),
    });
    fetch(`/api/research/pair?${params}`)
      .then(async (response) => {
        const json = (await response.json()) as PairDetailData & {
          error?: string;
        };
        if (!response.ok) throw new Error(json.error ?? "Stats unavailable");
        if (!cancelled) setLoaded({ key: requestKey, data: json, error: null });
      })
      .catch((err: unknown) => {
        if (!cancelled) {
          setLoaded({
            key: requestKey,
            data: null,
            error: err instanceof Error ? err.message : "Stats unavailable",
          });
        }
      });
    return () => {
      cancelled = true;
    };
  }, [tickerA, tickerB, lookback, requestKey]);

  const loading = loaded.key !== requestKey;
  const stats = loaded.key === requestKey ? loaded.data : null;
  const error = loaded.key === requestKey ? loaded.error : null;
  const z = stats?.currentZ ?? null;
  const regime = reading?.regime ?? "unknown";
  const quality = setupQuality(z, stored?.entryZ ?? DEFAULT_ENTRY_Z, regime);

  const nameA = stats?.nameA || left.name;
  const nameB = stats?.nameB || right.name;
  const sectorA = stats?.sectorA || left.sector;
  const sectorB = stats?.sectorB || right.sector;

  return (
    <div className="space-y-6">
      <section>
        <p className="font-mono text-[10px] tracking-[0.28em] text-amber uppercase">
          Pair profile
        </p>
        <h1 className="mt-1 text-2xl tracking-tight">
          {tickerA} / {tickerB}
        </h1>
        <p className="mt-2 text-sm text-fog">
          {nameA} · {nameB}
        </p>
        <div className="mt-3 flex flex-wrap gap-2">
          {tapeLoading && !reading ? null : <RegimeBadge regime={regime} />}
          <QualityBadge quality={quality} />
        </div>
        <div className="tape-scan mt-4 h-px bg-line" />
      </section>

      <section className="grid gap-3 sm:grid-cols-2">
        <LegCard
          ticker={tickerA}
          name={nameA}
          sector={sectorA || (left.known ? "" : "Sector not in the liquid map")}
        />
        <LegCard
          ticker={tickerB}
          name={nameB}
          sector={sectorB || (right.known ? "" : "Sector not in the liquid map")}
        />
      </section>

      <section className="rounded-xl border border-line bg-panel p-4">
        <p className="font-mono text-[10px] tracking-wide text-fog uppercase">
          Why paired
        </p>
        <p className="mt-2 text-sm leading-snug text-paper/90">{why.text}</p>
        {!why.labeled ? (
          <p className="mt-2 text-xs text-fog">
            CrystalBall ranked this statistically. There is no curated
            fundamental story on file yet.
          </p>
        ) : null}
      </section>

      <section className="rounded-xl border border-line bg-panel p-4">
        <p className="font-mono text-[10px] tracking-wide text-fog uppercase">
          Stats
        </p>
        {loading ? (
          <div className="mt-3 h-24 animate-pulse rounded-md bg-raised" />
        ) : error && !stats ? (
          <p className="mt-3 text-sm text-fog">
            {error} Names and links below still work.
          </p>
        ) : (
          <dl className="mt-3 grid grid-cols-2 gap-3 text-sm sm:grid-cols-4">
            <Stat
              label="β"
              value={formatNumber(stats?.beta ?? stored?.beta ?? 0, 3)}
            />
            <Stat
              label="Half-life"
              value={
                (stats?.halfLife ?? stored?.halfLife) != null &&
                (stats?.halfLife ?? stored?.halfLife) !== 0
                  ? `${formatNumber((stats?.halfLife ?? stored?.halfLife) as number, 1)}d`
                  : "—"
              }
            />
            <Stat
              label="Current z"
              value={z === null ? "—" : formatZ(z)}
            />
            <Stat label="Setup" value={QUALITY_LABEL[quality]} />
          </dl>
        )}
        {stored ? (
          <p className="mt-3 text-xs text-fog">
            On Watchlist with stored β {formatNumber(stored.beta, 3)} · lookback{" "}
            {stored.lookbackDays}d.
          </p>
        ) : (
          <p className="mt-3 text-xs text-fog">
            Not on Watchlist. Promote from Research if the spread is worth
            watching.
          </p>
        )}
      </section>

      <section className="rounded-xl border border-line bg-panel p-4">
        <p className="font-mono text-[10px] tracking-wide text-fog uppercase">
          External
        </p>
        <p className="mt-1 text-xs text-fog">
          Quote pages and SEC search per leg — not a CrystalBall feed.
        </p>
        <div className="mt-3 grid gap-3 sm:grid-cols-2">
          <ExternalLinks ticker={tickerA} name={nameA} />
          <ExternalLinks ticker={tickerB} name={nameB} />
        </div>
      </section>

      <nav className="flex flex-wrap gap-3 pb-4 text-sm">
        <Link
          href="/research"
          className="inline-flex min-h-11 items-center rounded-md border border-line px-4 text-fog"
        >
          Research
        </Link>
        <Link
          href="/watchlist"
          className="inline-flex min-h-11 items-center rounded-md border border-line px-4 text-fog"
        >
          Watchlist
        </Link>
      </nav>
    </div>
  );
}

function LegCard({
  ticker,
  name,
  sector,
}: {
  ticker: string;
  name: string;
  sector: string;
}) {
  return (
    <article className="rounded-xl border border-line bg-panel p-4">
      <p className="font-mono text-sm text-amber">{ticker}</p>
      <p className="mt-1 text-base text-paper">{name}</p>
      <p className="mt-1 text-sm text-fog">{sector || "Industry not labeled"}</p>
    </article>
  );
}

function ExternalLinks({ ticker, name }: { ticker: string; name: string }) {
  return (
    <div>
      <p className="font-mono text-xs text-paper">
        {ticker} · {name}
      </p>
      <ul className="mt-1">
        <li>
          <a
            href={yahooQuoteUrl(ticker)}
            target="_blank"
            rel="noreferrer"
            className="inline-flex min-h-11 items-center font-mono text-xs text-cyan"
          >
            Yahoo Finance
          </a>
        </li>
        <li>
          <a
            href={googleFinanceUrl(ticker)}
            target="_blank"
            rel="noreferrer"
            className="inline-flex min-h-11 items-center font-mono text-xs text-cyan"
          >
            Google Finance
          </a>
        </li>
        <li>
          <a
            href={secSearchUrl(ticker)}
            target="_blank"
            rel="noreferrer"
            className="inline-flex min-h-11 items-center font-mono text-xs text-cyan"
          >
            SEC filings
          </a>
        </li>
      </ul>
    </div>
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
