import { formatNumber, formatPct, formatZ } from "@/lib/format";
import { INDICATOR_META, PIZZA_META } from "@/lib/indicators/meta";
import { impliedDailyMovePct } from "@/lib/indicators/vix";
import { withCache } from "./cache";
import { fetchPolymarketCards } from "./polymarket";
import {
  alignedSeries,
  lastZScore,
  moveStress,
  pctChange,
  sparklineValues,
  vixStress,
  zToStress,
} from "./stats";
import type {
  IndicatorSnapshot,
  IndicatorsPayload,
  PizzaStatus,
  QuoteSeries,
} from "./types";
import { fetchQuotes } from "./yahoo";

function unavailable(
  meta: (typeof INDICATOR_META)[string],
  reason: string,
): IndicatorSnapshot {
  return {
    id: meta.id,
    label: meta.label,
    shortLabel: meta.shortLabel,
    category: meta.category,
    value: null,
    displayValue: "—",
    changeLabel: reason,
    changePct: null,
    change5dPct: null,
    impliedDailyPct: meta.id === "vix" ? null : undefined,
    zScore: null,
    sparkline: [],
    stress: "unknown",
    source: meta.source,
    interpretation: meta.interpretation,
    frequency: meta.frequency,
    calculation: meta.calculation,
    available: false,
  };
}

function buildSpread(
  id: "brent-wti" | "rsp-spy",
  left: QuoteSeries | undefined,
  right: QuoteSeries | undefined,
  combine: (a: number, b: number) => number,
  window: number,
  digits: number,
): IndicatorSnapshot {
  const meta = INDICATOR_META[id];
  if (!left?.last || !right?.last || left.points.length < 8 || right.points.length < 8) {
    return unavailable(meta, "Waiting on both legs");
  }

  const series = alignedSeries(left.points, right.points, combine);
  if (series.length < 8) {
    return unavailable(meta, "Not enough aligned history");
  }

  const values = series.map((point) => point.v);
  const last = values[values.length - 1];
  const prev = values[values.length - 2];
  const z = lastZScore(values, window);

  return {
    id: meta.id,
    label: meta.label,
    shortLabel: meta.shortLabel,
    category: meta.category,
    value: last,
    displayValue: formatNumber(last, digits),
    changeLabel: [
      z !== null ? formatZ(z) : null,
      formatPct(pctChange(last, prev)),
    ]
      .filter(Boolean)
      .join("  ·  "),
    changePct: pctChange(last, prev),
    zScore: z,
    sparkline: sparklineValues(series),
    stress: zToStress(z),
    source: `${meta.source} via ${left.source}/${right.source}`,
    interpretation: meta.interpretation,
    frequency: meta.frequency,
    calculation: meta.calculation,
    available: true,
  };
}

function buildLevel(
  id: "vix" | "gold" | "dxy",
  quote: QuoteSeries | undefined,
  digits: number,
): IndicatorSnapshot {
  const meta = INDICATOR_META[id];
  if (!quote?.last || quote.points.length === 0) {
    return unavailable(meta, quote?.error ?? "Source unavailable");
  }

  const last = quote.last;
  const prev = quote.previous ?? quote.points.at(-2)?.v ?? last;
  const weekAgo = quote.points.at(-6)?.v;
  const dayPct = pctChange(last, prev);
  const weekPct = weekAgo ? pctChange(last, weekAgo) : null;
  const vixFiveDay =
    weekPct !== null
      ? `VIX 5d ${formatPct(weekPct)} (VIX index, not S&P)`
      : "VIX 5d unavailable";
  const changeBits = [formatPct(dayPct)];
  if (weekPct !== null) changeBits.push(`5d ${formatPct(weekPct)}`);

  return {
    id: meta.id,
    label: meta.label,
    shortLabel: meta.shortLabel,
    category: meta.category,
    value: last,
    displayValue: formatNumber(last, digits),
    changeLabel: id === "vix" ? vixFiveDay : changeBits.join("  ·  "),
    changePct: dayPct,
    change5dPct: weekPct,
    impliedDailyPct: id === "vix" ? impliedDailyMovePct(last) : undefined,
    zScore: id === "vix" ? lastZScore(quote.points.map((p) => p.v), 20) : null,
    sparkline: sparklineValues(quote.points),
    stress:
      id === "vix" ? vixStress(last) : moveStress(Math.abs(weekPct ?? dayPct)),
    source: `${meta.source} via ${quote.source}`,
    interpretation: meta.interpretation,
    frequency: meta.frequency,
    calculation: meta.calculation,
    available: true,
  };
}

function pizzaStatus(): PizzaStatus {
  return { ...PIZZA_META };
}

async function loadIndicators(): Promise<IndicatorsPayload> {
  const [quotes, polymarket] = await Promise.all([
    fetchQuotes(),
    fetchPolymarketCards(),
  ]);

  const indicators: IndicatorSnapshot[] = [
    buildSpread(
      "brent-wti",
      quotes["BZ=F"],
      quotes["CL=F"],
      (brent, wti) => brent - wti,
      60,
      2,
    ),
    buildSpread(
      "rsp-spy",
      quotes.RSP,
      quotes.SPY,
      (rsp, spy) => rsp / spy,
      20,
      4,
    ),
    buildLevel("vix", quotes["^VIX"], 2),
    buildLevel("gold", quotes["GC=F"], 2),
    buildLevel("dxy", quotes["DX-Y.NYB"], 2),
  ];

  return {
    updatedAt: new Date().toISOString(),
    quotes,
    indicators,
    pizza: pizzaStatus(),
    polymarket,
  };
}

export async function getIndicatorsPayload(options?: {
  force?: boolean;
}): Promise<IndicatorsPayload> {
  return withCache("indicators", loadIndicators, {
    ttlMs: 15 * 60 * 1000,
    force: options?.force,
  });
}
