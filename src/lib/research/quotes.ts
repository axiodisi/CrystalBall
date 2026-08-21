import { withCache } from "@/lib/data/cache";
import type { QuoteSeries } from "@/lib/data/types";
import { fetchQuote } from "@/lib/data/yahoo";

const HISTORY_TTL_MS = 6 * 60 * 60 * 1000;

export async function mapPool<T, R>(
  items: readonly T[],
  limit: number,
  fn: (item: T) => Promise<R>,
): Promise<R[]> {
  const out: R[] = new Array(items.length);
  let next = 0;

  async function worker() {
    while (next < items.length) {
      const index = next;
      next += 1;
      out[index] = await fn(items[index]);
    }
  }

  const workers = Array.from({ length: Math.min(limit, items.length) }, () =>
    worker(),
  );
  await Promise.all(workers);
  return out;
}

export async function fetchHistory(symbol: string): Promise<QuoteSeries> {
  return withCache(
    `hist:2y:${symbol}`,
    () => fetchQuote(symbol, { range: "2y" }),
    { ttlMs: HISTORY_TTL_MS },
  );
}

export async function fetchHistories(
  symbols: readonly string[],
): Promise<Record<string, QuoteSeries>> {
  const series = await mapPool(symbols, 8, fetchHistory);
  return Object.fromEntries(series.map((item) => [item.symbol, item]));
}
