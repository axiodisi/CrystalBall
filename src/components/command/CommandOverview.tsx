"use client";

import Link from "next/link";
import { MarketSnapshot } from "@/components/guidance/MarketSnapshot";
import { AlertStrip } from "@/components/watchlist/AlertStrip";
import { PromotedSnapshot } from "@/components/command/PromotedSnapshot";
import { PolymarketCard } from "@/components/indicators/PolymarketCard";
import { Sparkline } from "@/components/indicators/Sparkline";
import { StressBadge } from "@/components/indicators/StressBadge";
import type { IndicatorsPayload } from "@/lib/data/types";
import { formatClock } from "@/lib/format";
import { readingHint } from "@/lib/indicators/copy";
import { pizzaSoWhat, soWhat } from "@/lib/guidance";
import { DEFAULT_PINNED_IDS } from "@/lib/indicators/meta";
import { usePins } from "@/lib/pins";

type CommandOverviewProps = {
  data: IndicatorsPayload;
};

export function CommandOverview({ data }: CommandOverviewProps) {
  const { pins, isPinned } = usePins();
  const pinnedIds = pins.length > 0 ? pins : DEFAULT_PINNED_IDS;

  const pinnedIndicators = data.indicators.filter((item) =>
    pinnedIds.includes(item.id),
  );
  const pizzaPinned = pinnedIds.includes("pizza");
  const pinnedMarkets = data.polymarket.filter((item) => pinnedIds.includes(item.id));
  const markets =
    pinnedMarkets.length > 0 ? pinnedMarkets.slice(0, 2) : data.polymarket.slice(0, 2);

  const standing = data.indicators.filter(
    (item) => item.id === "brent-wti" || item.id === "rsp-spy",
  );

  return (
    <div className="space-y-8">
      <section>
        <div className="hidden items-end justify-between lg:flex">
          <div>
            <p className="font-mono text-[10px] tracking-[0.28em] text-amber uppercase">
              Command
            </p>
            <h1 className="mt-1 text-2xl tracking-tight">Situation</h1>
          </div>
          <p className="font-mono text-xs text-fog">
            Last refresh {formatClock(data.updatedAt)}
          </p>
        </div>
        <p className="font-mono text-xs text-fog lg:hidden">
          Last refresh {formatClock(data.updatedAt)}
        </p>
        <div className="tape-scan mt-3 h-px bg-line lg:mt-4" />
      </section>

      <MarketSnapshot data={data} />

      <section className="space-y-3">
        <div className="flex items-baseline justify-between">
          <h2 className="text-sm tracking-wide text-fog uppercase">Stress / Regime</h2>
          <Link href="/indicators" className="font-mono text-xs text-cyan">
            Full catalog
          </Link>
        </div>
        <p className="text-sm text-fog">
          Key gauges with a plain-English read. Color is distance from typical, not a
          composite score.
        </p>
        <div className="no-scrollbar -mx-4 flex gap-3 overflow-x-auto px-4 pb-1 lg:mx-0 lg:grid lg:grid-cols-4 lg:overflow-visible lg:px-0">
          {pinnedIndicators.map((item) => (
            <article
              key={item.id}
              className="min-w-[13.5rem] flex-1 rounded-xl border border-line bg-panel p-3 lg:min-w-0"
            >
              <div className="flex items-center justify-between gap-2">
                <p className="text-xs text-fog">{item.shortLabel}</p>
                <StressBadge stress={item.stress} />
              </div>
              <p className="mt-2 font-mono text-xl text-paper">{item.displayValue}</p>
              <p className="mt-1 font-mono text-[11px] text-fog">
                {readingHint(item)}
                {item.changeLabel ? `  ·  ${item.changeLabel}` : ""}
              </p>
              <p className="mt-2 text-xs leading-snug text-fog">
                {soWhat(item, true)}
              </p>
              <Sparkline
                values={item.sparkline}
                tone={item.stress}
                className="mt-3 h-7 w-full"
              />
            </article>
          ))}
          {pizzaPinned ? (
            <article className="min-w-[13.5rem] flex-1 rounded-xl border border-line bg-panel p-3 lg:min-w-0">
              <div className="flex items-center justify-between gap-2">
                <p className="text-xs text-fog">Pentagon Pizza</p>
                <span className="rounded-full border border-amber/40 bg-amber/10 px-2 py-0.5 font-mono text-[10px] uppercase tracking-wide text-amber">
                  Weak / noisy
                </span>
              </div>
              <p className="mt-2 font-mono text-lg text-fog">{data.pizza.status}</p>
              <p className="mt-2 text-xs leading-snug text-fog">
                {pizzaSoWhat(data.pizza, true)}
              </p>
              <a
                href={data.pizza.href}
                target="_blank"
                rel="noreferrer"
                className="mt-3 inline-flex min-h-10 items-center font-mono text-[11px] text-cyan"
              >
                Open live tracker →
              </a>
            </article>
          ) : null}
        </div>
      </section>

      {markets.length > 0 ? (
        <section className="space-y-3">
          <h2 className="text-sm tracking-wide text-fog uppercase">
            Polymarket tape
          </h2>
          <p className="text-sm text-fog">
            Crowd odds from Polymarket. Not CrystalBall’s view.
          </p>
          <div className="grid gap-3 md:grid-cols-2">
            {markets.map((market) => (
              <PolymarketCard
                key={market.id}
                market={market}
                pinned={isPinned(market.id)}
              />
            ))}
          </div>
        </section>
      ) : null}

      <section className="space-y-3">
        <div className="flex items-baseline justify-between">
          <h2 className="text-sm tracking-wide text-fog uppercase">
            Watchlist snapshot
          </h2>
          <Link href="/watchlist" className="font-mono text-xs text-cyan">
            Open watchlist
          </Link>
        </div>
        <AlertStrip />
        <PromotedSnapshot />
        <div className="rounded-xl border border-line bg-panel/60 p-4">
          <p className="text-xs tracking-wide text-fog uppercase">
            Standing spreads
          </p>
          <div className="mt-3 grid gap-3 sm:grid-cols-2">
            {standing.map((item) => (
              <div
                key={item.id}
                className="rounded-lg border border-line bg-ink/40 p-3"
              >
                <p className="text-xs text-fog">{item.label}</p>
                <p className="mt-1 font-mono text-lg">{item.displayValue}</p>
                <p className="font-mono text-[11px] text-fog">
                  {readingHint(item)}
                  {item.changeLabel ? `  ·  ${item.changeLabel}` : ""}
                </p>
                <p className="mt-2 text-xs leading-snug text-fog">
                  {soWhat(item, true)}
                </p>
              </div>
            ))}
          </div>
        </div>
      </section>

      <section className="grid gap-3 sm:grid-cols-2">
        <Link
          href="/research"
          className="rounded-xl border border-line bg-raised p-4 transition-colors hover:border-amber/40"
        >
          <p className="font-mono text-[10px] tracking-[0.2em] text-amber uppercase">
            Next
          </p>
          <p className="mt-2 text-lg">Pair Research</p>
          <p className="mt-1 text-sm text-fog">
            Run the statistical pipeline and promote pairs.
          </p>
        </Link>
        <Link
          href="/indicators"
          className="rounded-xl border border-line bg-raised p-4 transition-colors hover:border-cyan/40"
        >
          <p className="font-mono text-[10px] tracking-[0.2em] text-cyan uppercase">
            Catalog
          </p>
          <p className="mt-2 text-lg">Indicators</p>
          <p className="mt-1 text-sm text-fog">
            Pin signals, expand sources, read the tape.
          </p>
        </Link>
      </section>
    </div>
  );
}
