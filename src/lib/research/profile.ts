import { LIQUID_CORE } from "./universe";

const TICKER = /^[A-Z]{1,6}(?:-[A-Z])?$/;

const BY_SYMBOL = new Map(LIQUID_CORE.map((item) => [item.symbol, item]));

/** Sorted-key one-liners for well-known liquid pairs. */
const WHY_PAIRED: Record<string, string> = {
  "GOOG|GOOGL":
    "Same company — Alphabet class A and class C. Dual-class listing, not two businesses.",
  "KO|PEP":
    "Same industry — global beverage companies with shared consumer demand and input costs.",
  "HD|LOW":
    "Same industry — U.S. home-improvement retailers with shared housing and DIY demand.",
  "JPM|BAC":
    "Same industry — large U.S. banks with shared rates and credit-cycle drivers.",
  "C|WFC":
    "Same industry — large U.S. banks with shared rates and credit-cycle drivers.",
  "BAC|WFC":
    "Same industry — large U.S. banks with shared rates and credit-cycle drivers.",
  "GS|MS":
    "Same industry — U.S. investment banks with shared trading, rates, and deal-flow drivers.",
  "MA|V":
    "Same industry — global card networks with shared consumer-spend and payments volume.",
  "CVX|XOM":
    "Same industry — integrated oil majors with shared crude prices and refining margins.",
  "COP|XOM":
    "Same industry — large energy producers with shared oil and gas prices.",
  "COP|EOG":
    "Same industry — U.S. exploration & production names with shared oil and gas prices.",
  "FDX|UPS":
    "Same industry — parcel carriers with shared shipping volumes and fuel costs.",
  "CSX|UNP":
    "Same industry — U.S. railroads with shared freight volumes and industrial demand.",
  "NSC|UNP":
    "Same industry — U.S. railroads with shared freight volumes and industrial demand.",
  "CSX|NSC":
    "Same industry — Eastern U.S. railroads with shared freight volumes.",
  "CAT|DE":
    "Same industry — heavy equipment with shared construction, farm, and capex cycles.",
  "CL|PG":
    "Same industry — household staples with shared consumer-packaged-goods drivers.",
  "MCD|SBUX":
    "Same industry — global restaurants with shared consumer-spend and traffic drivers.",
  "T|VZ":
    "Same industry — U.S. wireless carriers with shared wireless competition and capex.",
  "MRK|PFE":
    "Same industry — large-cap pharma with shared drug-pricing and pipeline risk.",
  "ABBV|LLY":
    "Same industry — large-cap pharma with shared drug-pricing and pipeline risk.",
  "JNJ|UNH":
    "Same sector — health care, but different businesses (drugs vs. managed care).",
  "BA|LMT":
    "Same industry — aerospace & defense with shared Pentagon and commercial-aero cycles.",
  "LMT|RTX":
    "Same industry — defense primes with shared Pentagon budget drivers.",
  "NEE|SO":
    "Same industry — regulated utilities with shared rates and power-demand drivers.",
  "AMT|CCI":
    "Same industry — cell-tower REITs with shared wireless-capex drivers.",
  "APD|LIN":
    "Same industry — industrial gases with shared industrial-demand drivers.",
  "TGT|WMT":
    "Same industry — U.S. mass retailers with shared consumer-spend drivers.",
  "COST|WMT":
    "Same industry — U.S. mass retailers with shared consumer-spend drivers.",
  "AMD|NVDA":
    "Same industry — semiconductors with shared AI/PC demand and foundry cycles.",
  "AMD|INTC":
    "Same industry — semiconductors with shared PC, server, and foundry cycles.",
  "INTC|NVDA":
    "Same industry — semiconductors, though product mixes differ (foundry/CPU vs. GPUs).",
  "AAPL|MSFT":
    "Shared mega-cap tech drivers (rates, risk appetite) more than a single product line.",
  "GOOGL|META":
    "Same industry — digital advertising with shared ad-spend and online-attention drivers.",
  "GOOG|META":
    "Same industry — digital advertising with shared ad-spend and online-attention drivers.",
  "DIS|NFLX":
    "Same industry — streaming / media with shared content spend and subscriber competition.",
  "GS|JPM":
    "Same industry — large U.S. financials with shared rates and capital-markets drivers.",
};

const SECTOR_DRIVER: Record<string, string> = {
  "Information Technology": "shared rates, software, and semiconductor demand",
  "Financials": "shared rates and credit-cycle drivers",
  Energy: "shared oil and gas prices",
  "Health Care": "shared drug-pricing and healthcare-spend drivers",
  "Consumer Discretionary": "shared consumer-spend and rates sensitivity",
  "Consumer Staples": "shared packaged-goods demand and input costs",
  Industrials: "shared industrial and freight cycles",
  "Communication Services": "shared ad-spend, media, and telecom drivers",
  Materials: "shared commodity and industrial-demand drivers",
  Utilities: "shared rates and regulated-power demand",
  "Real Estate": "shared rates and occupancy / cap-rate drivers",
};

export type PairIdentity = {
  ticker: string;
  name: string;
  sector: string;
  known: boolean;
};

export function lookupName(symbol: string): PairIdentity {
  const ticker = symbol.trim().toUpperCase();
  const hit = BY_SYMBOL.get(ticker);
  if (hit) {
    return {
      ticker: hit.symbol,
      name: hit.name,
      sector: hit.sector,
      known: true,
    };
  }
  return { ticker, name: ticker, sector: "", known: false };
}

export function pairKey(a: string, b: string): string {
  return [a.trim().toUpperCase(), b.trim().toUpperCase()].sort().join("|");
}

export function whyPaired(
  a: PairIdentity,
  b: PairIdentity,
): { text: string; labeled: boolean } {
  const known = WHY_PAIRED[pairKey(a.ticker, b.ticker)];
  if (known) return { text: known, labeled: true };

  if (a.sector && b.sector && a.sector === b.sector) {
    const driver = SECTOR_DRIVER[a.sector];
    return {
      text: driver
        ? `Same industry — both sit in ${a.sector} (${driver}).`
        : `Same industry — both sit in ${a.sector}.`,
      labeled: true,
    };
  }

  return {
    text: "Statistical pair — relationship not labeled yet.",
    labeled: false,
  };
}

export function pairSlug(tickerA: string, tickerB: string): string {
  return `${tickerA.trim().toUpperCase()}-${tickerB.trim().toUpperCase()}`;
}

export function pairProfileHref(
  tickerA: string,
  tickerB: string,
  lookback?: number,
): string {
  const base = `/pair/${pairSlug(tickerA, tickerB)}`;
  if (!lookback || !Number.isFinite(lookback)) return base;
  return `${base}?lookback=${Math.round(lookback)}`;
}

export function parsePairSlug(
  slug: string,
): { a: string; b: string } | null {
  const raw = decodeURIComponent(slug).trim().toUpperCase();
  if (!raw.includes("-")) return null;

  const splits: number[] = [];
  for (let i = 0; i < raw.length; i += 1) {
    if (raw[i] === "-") splits.push(i);
  }

  const candidates: Array<{ a: string; b: string; score: number }> = [];
  for (const idx of splits) {
    const a = raw.slice(0, idx);
    const b = raw.slice(idx + 1);
    if (!a || !b) continue;
    const okA = BY_SYMBOL.has(a) || TICKER.test(a);
    const okB = BY_SYMBOL.has(b) || TICKER.test(b);
    if (!okA || !okB) continue;
    const score =
      (BY_SYMBOL.has(a) ? 2 : 1) +
      (BY_SYMBOL.has(b) ? 2 : 1) +
      a.length / 100;
    candidates.push({ a, b, score });
  }
  if (candidates.length === 0) return null;
  candidates.sort((left, right) => right.score - left.score);
  return { a: candidates[0].a, b: candidates[0].b };
}

export function yahooQuoteUrl(ticker: string): string {
  return `https://finance.yahoo.com/quote/${encodeURIComponent(ticker)}`;
}

export function googleFinanceUrl(ticker: string): string {
  return `https://www.google.com/finance/quote/${encodeURIComponent(ticker)}`;
}

export function secSearchUrl(ticker: string): string {
  return `https://www.sec.gov/cgi-bin/browse-edgar?action=getcompany&CIK=${encodeURIComponent(ticker)}&owner=exclude&count=10`;
}
