import { lastZScore } from "@/lib/data/stats";
import type { QuoteSeries } from "@/lib/data/types";
import { adfNoConstant } from "./adf";
import {
  alignPair,
  halfLifeFromAr1,
  logPrices,
  logReturns,
  olsLog,
  pearson,
  sliceLast,
  stdev,
} from "./math";
import { fetchHistories } from "./quotes";
import type {
  Constituent,
  PairDetail,
  PairPoint,
  PairSummary,
  ScanParams,
  ScanResponse,
} from "./types";
import { loadUniverse } from "./universe";

const HALF_LIFE_MIN = 5;
const HALF_LIFE_MAX = 60;
const ADF_P_MAX = 0.05;
const MIN_OBS = 50;

type Eligible = Constituent & {
  quote: QuoteSeries;
};

function scorePair(pair: PairSummary): number {
  const coint = Math.min(1, Math.max(0, 1 - pair.adfPValue / ADF_P_MAX));
  const mid = 18;
  const hlDays = pair.halfLife ?? 0;
  const hl =
    hlDays <= mid
      ? (hlDays - HALF_LIFE_MIN) / (mid - HALF_LIFE_MIN)
      : (HALF_LIFE_MAX - hlDays) / (HALF_LIFE_MAX - mid);
  const hlScore = pair.halfLife === null ? 0 : Math.min(1, Math.max(0, hl));
  const liq = Math.min(
    1,
    Math.max(0, Math.log10(pair.minAdv / 20_000_000) / Math.log10(40)),
  );
  const stab = Math.min(
    1,
    Math.max(0, 1 - Math.abs(pair.correlation - pair.corrRecent)),
  );
  return 100 * (0.35 * coint + 0.25 * hlScore + 0.2 * liq + 0.2 * stab);
}

function diagnose(
  a: Eligible,
  b: Eligible,
  lookback: number,
  requirePass = true,
): PairSummary | null {
  const aligned = sliceLast(alignPair(a.quote.points, b.quote.points), lookback);
  if (aligned.length < MIN_OBS) return null;

  const pricesA = aligned.map((row) => row.a);
  const pricesB = aligned.map((row) => row.b);
  const logsA = logPrices(pricesA);
  const logsB = logPrices(pricesB);
  const returnsA = logReturns(pricesA);
  const returnsB = logReturns(pricesB);
  const correlation = pearson(returnsA, returnsB);
  if (correlation === null) return null;

  const recentN = Math.min(30, returnsA.length);
  const corrRecent =
    pearson(returnsA.slice(-recentN), returnsB.slice(-recentN)) ?? correlation;

  const fit = olsLog(logsA, logsB);
  if (!fit) return null;

  const adf = adfNoConstant(fit.resid, 2);
  if (!adf) return null;

  const halfLife = halfLifeFromAr1(fit.resid);
  if (requirePass) {
    if (halfLife === null) return null;
    if (halfLife < HALF_LIFE_MIN || halfLife > HALF_LIFE_MAX) return null;
    if (adf.pValue >= ADF_P_MAX) return null;
  }

  const mid = Math.floor(aligned.length / 2);
  const first = olsLog(logsA.slice(0, mid), logsB.slice(0, mid));
  const second = olsLog(logsA.slice(mid), logsB.slice(mid));
  const betaStability =
    first && second
      ? 1 -
        Math.min(
          1,
          Math.abs(first.beta - second.beta) / (Math.abs(fit.beta) + 1e-6),
        )
      : 0;

  const summary: PairSummary = {
    tickerA: a.symbol,
    tickerB: b.symbol,
    nameA: a.quote.name || a.name,
    nameB: b.quote.name || b.name,
    sectorA: a.sector,
    sectorB: b.sector,
    correlation,
    corrRecent,
    beta: fit.beta,
    alpha: fit.alpha,
    adfStat: adf.stat,
    adfPValue: adf.pValue,
    halfLife,
    spreadVol: stdev(fit.resid),
    betaStability,
    currentZ: lastZScore(fit.resid, Math.min(60, fit.resid.length)),
    minAdv: Math.min(a.quote.avgDollarVolume ?? 0, b.quote.avgDollarVolume ?? 0),
    score: 0,
    lookbackDays: aligned.length,
    corrLookbackDays: returnsA.length,
  };
  summary.score = scorePair(summary);
  return summary;
}

function bestDirection(
  left: Eligible,
  right: Eligible,
  lookback: number,
): PairSummary | null {
  const ab = diagnose(left, right, lookback);
  const ba = diagnose(right, left, lookback);
  if (ab && ba) return ab.adfPValue <= ba.adfPValue ? ab : ba;
  return ab ?? ba;
}

export async function runScan(params: ScanParams): Promise<ScanResponse> {
  const started = Date.now();
  const warnings: string[] = [];
  const { names, fallback } = await loadUniverse(params.universe, params.sector);
  if (fallback) {
    warnings.push(
      "Full S&P 500 list unavailable — fell back to the liquid core.",
    );
  }

  const quotes = await fetchHistories(names.map((item) => item.symbol));
  const eligible: Eligible[] = [];
  for (const name of names) {
    const quote = quotes[name.symbol];
    if (!quote || quote.points.length < MIN_OBS || quote.last === null) continue;
    if (quote.last < params.minPrice) continue;
    if ((quote.avgDollarVolume ?? 0) < params.minAdv) continue;
    eligible.push({ ...name, quote });
  }

  const corrHits: Array<{
    a: Eligible;
    b: Eligible;
    corr: number;
  }> = [];

  for (let i = 0; i < eligible.length; i += 1) {
    for (let j = i + 1; j < eligible.length; j += 1) {
      const aligned = sliceLast(
        alignPair(eligible[i].quote.points, eligible[j].quote.points),
        params.corrLookback + 1,
      );
      if (aligned.length < MIN_OBS) continue;
      const corr = pearson(
        logReturns(aligned.map((row) => row.a)),
        logReturns(aligned.map((row) => row.b)),
      );
      if (corr === null || Math.abs(corr) < params.corrMin) continue;
      corrHits.push({ a: eligible[i], b: eligible[j], corr });
    }
  }

  const perTicker = new Map<string, number>();
  corrHits.sort((x, y) => Math.abs(y.corr) - Math.abs(x.corr));
  const screened: typeof corrHits = [];
  for (const hit of corrHits) {
    const usedA = perTicker.get(hit.a.symbol) ?? 0;
    const usedB = perTicker.get(hit.b.symbol) ?? 0;
    if (usedA >= params.maxPerTicker || usedB >= params.maxPerTicker) continue;
    screened.push(hit);
    perTicker.set(hit.a.symbol, usedA + 1);
    perTicker.set(hit.b.symbol, usedB + 1);
  }

  const results: PairSummary[] = [];
  for (const hit of screened) {
    const pair = bestDirection(hit.a, hit.b, params.estLookback);
    if (pair) {
      pair.correlation = hit.corr;
      pair.score = scorePair(pair);
      results.push(pair);
    }
  }
  results.sort((a, b) => b.score - a.score);

  return {
    updatedAt: new Date().toISOString(),
    params,
    fetched: Object.keys(quotes).length,
    eligible: eligible.length,
    pairsTested: (eligible.length * (eligible.length - 1)) / 2,
    corrPassed: corrHits.length,
    cointPassed: results.length,
    results,
    warnings,
    durationMs: Date.now() - started,
  };
}

export async function describePair(
  tickerA: string,
  tickerB: string,
  lookback: number,
): Promise<PairDetail | null> {
  const quotes = await fetchHistories([tickerA, tickerB]);
  const quoteA = quotes[tickerA];
  const quoteB = quotes[tickerB];
  if (!quoteA || !quoteB) return null;

  const left: Eligible = {
    symbol: tickerA,
    name: quoteA.name,
    sector: "",
    quote: quoteA,
  };
  const right: Eligible = {
    symbol: tickerB,
    name: quoteB.name,
    sector: "",
    quote: quoteB,
  };
  const summary = diagnose(left, right, lookback, false);
  if (!summary) return null;

  const aligned = sliceLast(alignPair(quoteA.points, quoteB.points), lookback);
  const logsA = logPrices(aligned.map((row) => row.a));
  const logsB = logPrices(aligned.map((row) => row.b));
  const firstA = logsA[0];
  const firstB = logsB[0];
  const spread = logsA.map((value, i) => value - summary.beta * logsB[i]);
  const spreadMean =
    spread.reduce((sum, value) => sum + value, 0) / spread.length;
  const spreadStd = stdev(spread);

  const series: PairPoint[] = aligned.map((row, i) => ({
    t: row.t,
    a: row.a,
    b: row.b,
    aNorm: Math.exp(logsA[i] - firstA),
    bNorm: Math.exp(logsB[i] - firstB),
    spread: spread[i],
    z: spreadStd === 0 ? 0 : (spread[i] - spreadMean) / spreadStd,
  }));

  return {
    ...summary,
    series,
    spreadMean,
    spreadStd,
  };
}

export function parseScanParams(input: Partial<ScanParams> | null): ScanParams {
  return {
    universe: input?.universe === "sp500" ? "sp500" : "liquid",
    sector: input?.sector && input.sector !== "" ? input.sector : "all",
    minPrice: Number.isFinite(input?.minPrice) ? Number(input?.minPrice) : 5,
    minAdv: Number.isFinite(input?.minAdv) ? Number(input?.minAdv) : 20_000_000,
    corrLookback: Number.isFinite(input?.corrLookback)
      ? Math.min(180, Math.max(40, Number(input?.corrLookback)))
      : 90,
    estLookback: Number.isFinite(input?.estLookback)
      ? Math.min(504, Math.max(60, Number(input?.estLookback)))
      : 252,
    corrMin: Number.isFinite(input?.corrMin)
      ? Math.min(0.99, Math.max(0.5, Number(input?.corrMin)))
      : 0.8,
    maxPerTicker: Number.isFinite(input?.maxPerTicker)
      ? Math.min(12, Math.max(1, Number(input?.maxPerTicker)))
      : 5,
  };
}
