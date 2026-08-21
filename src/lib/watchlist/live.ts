import { lastZScore } from "@/lib/data/stats";
import type { QuoteSeries } from "@/lib/data/types";
import { alignPair, logPrices, mean, sliceLast, stdev } from "@/lib/research/math";
import type { LiveItem, LivePoint } from "./types";

const MIN_OBS = 16;

export function computeBetaLive(
  id: string,
  tickerA: string,
  tickerB: string,
  nameA: string,
  nameB: string,
  beta: number,
  lookback: number,
  quoteA: QuoteSeries | undefined,
  quoteB: QuoteSeries | undefined,
  includeSeries: boolean,
): LiveItem {
  const base = {
    id,
    kind: "promoted" as const,
    tickerA,
    tickerB,
    nameA,
    nameB,
    beta,
    lookbackDays: lookback,
    sparkline: [] as number[],
    z: null,
    spread: null,
    mean: null,
    std: null,
    available: false,
  };

  if (!quoteA?.points.length || !quoteB?.points.length) {
    return { ...base, error: "Missing price history" };
  }

  const aligned = sliceLast(alignPair(quoteA.points, quoteB.points), lookback);
  if (aligned.length < MIN_OBS) {
    return { ...base, error: "Not enough overlapping history" };
  }

  const logsA = logPrices(aligned.map((row) => row.a));
  const logsB = logPrices(aligned.map((row) => row.b));
  const spreads = logsA.map((value, i) => value - beta * logsB[i]);
  const avg = mean(spreads);
  const sd = stdev(spreads);
  const last = spreads[spreads.length - 1];
  const z = sd === 0 ? 0 : (last - avg) / sd;
  const firstA = logsA[0];
  const firstB = logsB[0];

  const series: LivePoint[] | undefined = includeSeries
    ? aligned.map((row, i) => ({
        t: row.t,
        a: row.a,
        b: row.b,
        aNorm: Math.exp(logsA[i] - firstA),
        bNorm: Math.exp(logsB[i] - firstB),
        spread: spreads[i],
        z: sd === 0 ? 0 : (spreads[i] - avg) / sd,
      }))
    : undefined;

  return {
    ...base,
    z,
    spread: last,
    mean: avg,
    std: sd,
    sparkline: spreads.slice(-32),
    available: true,
    series,
  };
}

export function computeSimpleLive(
  id: string,
  tickerA: string,
  tickerB: string,
  nameA: string,
  nameB: string,
  lookback: number,
  quoteA: QuoteSeries | undefined,
  quoteB: QuoteSeries | undefined,
  combine: (a: number, b: number) => number,
): LiveItem {
  const base = {
    id,
    kind: "standing" as const,
    tickerA,
    tickerB,
    nameA,
    nameB,
    beta: null,
    lookbackDays: lookback,
    sparkline: [] as number[],
    z: null,
    spread: null,
    mean: null,
    std: null,
    available: false,
  };

  if (!quoteA?.points.length || !quoteB?.points.length) {
    return { ...base, error: "Missing price history" };
  }

  const aligned = sliceLast(alignPair(quoteA.points, quoteB.points), lookback);
  if (aligned.length < 8) {
    return { ...base, error: "Not enough overlapping history" };
  }

  const spreads = aligned.map((row) => combine(row.a, row.b));
  const z = lastZScore(spreads, lookback);

  return {
    ...base,
    z,
    spread: spreads[spreads.length - 1],
    mean: mean(spreads),
    std: stdev(spreads),
    sparkline: spreads.slice(-32),
    available: true,
  };
}
