import type { QuoteSeries, SeriesPoint } from "./types";

export const CORE_SYMBOLS = [
  "CL=F",
  "BZ=F",
  "SPY",
  "RSP",
  "^VIX",
  "GC=F",
  "DX-Y.NYB",
] as const;

export type CoreSymbol = (typeof CORE_SYMBOLS)[number];

const YAHOO_HOSTS = [
  "https://query1.finance.yahoo.com/v8/finance/chart",
  "https://query2.finance.yahoo.com/v8/finance/chart",
];

const STOOQ_SYMBOL: Record<string, string> = {
  "CL=F": "cl.f",
  "BZ=F": "brn.f",
  SPY: "spy.us",
  RSP: "rsp.us",
  "^VIX": "^vix",
  "GC=F": "gc.f",
  "DX-Y.NYB": "dx.f",
};

const DISPLAY_NAME: Record<string, string> = {
  "CL=F": "WTI Crude",
  "BZ=F": "Brent Crude",
  SPY: "SPDR S&P 500",
  RSP: "Invesco S&P 500 Equal Weight",
  "^VIX": "CBOE Volatility Index",
  "GC=F": "Gold",
  "DX-Y.NYB": "US Dollar Index",
};

const YAHOO_HEADERS = {
  "User-Agent":
    "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/122.0.0.0 Safari/537.36",
  Accept: "application/json",
};

type YahooChartResponse = {
  chart?: {
    result?: Array<{
      meta?: {
        symbol?: string;
        shortName?: string;
        currency?: string;
        regularMarketPrice?: number;
        previousClose?: number;
        chartPreviousClose?: number;
      };
      timestamp?: number[];
      indicators?: {
        quote?: Array<{
          close?: Array<number | null>;
          volume?: Array<number | null>;
        }>;
      };
    }>;
    error?: { description?: string } | null;
  };
};

export type FetchQuoteOptions = {
  range?: string;
};

function emptySeries(symbol: string, error: string): QuoteSeries {
  return {
    symbol,
    name: DISPLAY_NAME[symbol] ?? symbol,
    points: [],
    last: null,
    previous: null,
    source: "none",
    error,
  };
}

function averageDollarVolume(
  points: SeriesPoint[],
  volumes: Array<number | undefined>,
): number | undefined {
  const window = Math.min(21, points.length);
  if (window === 0) return undefined;
  let sum = 0;
  let count = 0;
  for (let i = points.length - window; i < points.length; i += 1) {
    const volume = volumes[i];
    if (volume === undefined || volume <= 0) continue;
    sum += points[i].v * volume;
    count += 1;
  }
  return count > 0 ? sum / count : undefined;
}

function toSeries(
  symbol: string,
  timestamps: number[],
  closes: Array<number | null>,
  volumes: Array<number | null> | undefined,
  meta: YahooChartResponse["chart"],
  source: QuoteSeries["source"],
): QuoteSeries {
  const result = meta?.result?.[0];
  const points: SeriesPoint[] = [];
  const keptVolumes: Array<number | undefined> = [];
  for (let i = 0; i < timestamps.length; i += 1) {
    const close = closes[i];
    if (close === null || close === undefined || Number.isNaN(close)) continue;
    points.push({ t: timestamps[i] * 1000, v: close });
    const volume = volumes?.[i];
    keptVolumes.push(
      volume === null || volume === undefined || Number.isNaN(volume)
        ? undefined
        : volume,
    );
  }

  const last = points.at(-1)?.v ?? result?.meta?.regularMarketPrice ?? null;
  const previous =
    points.length >= 2
      ? points[points.length - 2].v
      : (result?.meta?.previousClose ??
        result?.meta?.chartPreviousClose ??
        null);

  return {
    symbol,
    name: result?.meta?.shortName ?? DISPLAY_NAME[symbol] ?? symbol,
    currency: result?.meta?.currency,
    points,
    last,
    previous,
    avgDollarVolume: averageDollarVolume(points, keptVolumes),
    source,
  };
}

async function fetchYahoo(
  symbol: string,
  range: string,
): Promise<QuoteSeries> {
  const encoded = encodeURIComponent(symbol);
  let lastError = "Yahoo Finance unavailable";

  for (const host of YAHOO_HOSTS) {
    try {
      const url = `${host}/${encoded}?interval=1d&range=${encodeURIComponent(range)}&includePrePost=false`;
      const response = await fetch(url, {
        headers: YAHOO_HEADERS,
        signal: AbortSignal.timeout(8000),
      });
      if (!response.ok) {
        lastError = `Yahoo ${response.status}`;
        continue;
      }
      const json = (await response.json()) as YahooChartResponse;
      const result = json.chart?.result?.[0];
      const timestamps = result?.timestamp ?? [];
      const quote = result?.indicators?.quote?.[0];
      const closes = quote?.close ?? [];
      if (timestamps.length === 0 || closes.length === 0) {
        lastError = json.chart?.error?.description ?? "Empty Yahoo series";
        continue;
      }
      return toSeries(
        symbol,
        timestamps,
        closes,
        quote?.volume,
        json.chart,
        "yahoo",
      );
    } catch (error) {
      lastError = error instanceof Error ? error.message : "Yahoo fetch failed";
    }
  }

  throw new Error(lastError);
}

function stooqSymbolFor(symbol: string): string | null {
  if (STOOQ_SYMBOL[symbol]) return STOOQ_SYMBOL[symbol];
  if (symbol.includes("=") || symbol.startsWith("^")) return null;
  return `${symbol.replace("-", ".").toLowerCase()}.us`;
}

async function fetchStooq(symbol: string): Promise<QuoteSeries> {
  const stooqSymbol = stooqSymbolFor(symbol);
  if (!stooqSymbol) {
    throw new Error("No Stooq mapping");
  }

  const url = `https://stooq.com/q/d/l/?s=${encodeURIComponent(stooqSymbol)}&i=d`;
  const response = await fetch(url, {
    headers: { Accept: "text/csv" },
    signal: AbortSignal.timeout(8000),
  });
  if (!response.ok) {
    throw new Error(`Stooq ${response.status}`);
  }

  const text = await response.text();
  const lines = text.trim().split(/\r?\n/).slice(1);
  const points: SeriesPoint[] = [];
  const volumes: Array<number | undefined> = [];
  for (const line of lines) {
    const [date, , , , close, volume] = line.split(",");
    const value = Number(close);
    if (!date || Number.isNaN(value)) continue;
    points.push({ t: Date.parse(`${date}T00:00:00Z`), v: value });
    const vol = Number(volume);
    volumes.push(Number.isFinite(vol) && vol > 0 ? vol : undefined);
  }

  const recent = points.slice(-260);
  const recentVol = volumes.slice(-260);
  if (recent.length === 0) {
    throw new Error("Empty Stooq series");
  }

  return {
    symbol,
    name: DISPLAY_NAME[symbol] ?? symbol,
    points: recent,
    last: recent.at(-1)?.v ?? null,
    previous: recent.at(-2)?.v ?? null,
    avgDollarVolume: averageDollarVolume(recent, recentVol),
    source: "stooq",
  };
}

export async function fetchQuote(
  symbol: string,
  options?: FetchQuoteOptions,
): Promise<QuoteSeries> {
  const range = options?.range ?? "6mo";
  try {
    return await fetchYahoo(symbol, range);
  } catch (yahooError) {
    try {
      return await fetchStooq(symbol);
    } catch (stooqError) {
      const yahooMessage =
        yahooError instanceof Error ? yahooError.message : "Yahoo failed";
      const stooqMessage =
        stooqError instanceof Error ? stooqError.message : "Stooq failed";
      return emptySeries(symbol, `${yahooMessage}; ${stooqMessage}`);
    }
  }
}

export async function fetchQuotes(
  symbols: readonly string[] = CORE_SYMBOLS,
): Promise<Record<string, QuoteSeries>> {
  const series = await Promise.all(symbols.map((symbol) => fetchQuote(symbol)));
  return Object.fromEntries(series.map((item) => [item.symbol, item]));
}
