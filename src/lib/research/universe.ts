import { withCache } from "@/lib/data/cache";
import type { Constituent, UniverseMode } from "./types";

export const SECTORS = [
  "Communication Services",
  "Consumer Discretionary",
  "Consumer Staples",
  "Energy",
  "Financials",
  "Health Care",
  "Industrials",
  "Information Technology",
  "Materials",
  "Real Estate",
  "Utilities",
] as const;

/** Practical liquid S&P 500 core — default first-run universe. */
export const LIQUID_CORE: Constituent[] = [
  { symbol: "AAPL", name: "Apple", sector: "Information Technology" },
  { symbol: "MSFT", name: "Microsoft", sector: "Information Technology" },
  { symbol: "NVDA", name: "NVIDIA", sector: "Information Technology" },
  { symbol: "AVGO", name: "Broadcom", sector: "Information Technology" },
  { symbol: "ORCL", name: "Oracle", sector: "Information Technology" },
  { symbol: "CRM", name: "Salesforce", sector: "Information Technology" },
  { symbol: "ADBE", name: "Adobe", sector: "Information Technology" },
  { symbol: "AMD", name: "AMD", sector: "Information Technology" },
  { symbol: "INTC", name: "Intel", sector: "Information Technology" },
  { symbol: "QCOM", name: "Qualcomm", sector: "Information Technology" },
  { symbol: "TXN", name: "Texas Instruments", sector: "Information Technology" },
  { symbol: "INTU", name: "Intuit", sector: "Information Technology" },
  { symbol: "NOW", name: "ServiceNow", sector: "Information Technology" },
  { symbol: "ACN", name: "Accenture", sector: "Information Technology" },
  { symbol: "IBM", name: "IBM", sector: "Information Technology" },
  { symbol: "AMZN", name: "Amazon", sector: "Consumer Discretionary" },
  { symbol: "TSLA", name: "Tesla", sector: "Consumer Discretionary" },
  { symbol: "HD", name: "Home Depot", sector: "Consumer Discretionary" },
  { symbol: "LOW", name: "Lowe's", sector: "Consumer Discretionary" },
  { symbol: "MCD", name: "McDonald's", sector: "Consumer Discretionary" },
  { symbol: "SBUX", name: "Starbucks", sector: "Consumer Discretionary" },
  { symbol: "NKE", name: "Nike", sector: "Consumer Discretionary" },
  { symbol: "TGT", name: "Target", sector: "Consumer Discretionary" },
  { symbol: "BKNG", name: "Booking", sector: "Consumer Discretionary" },
  { symbol: "TJX", name: "TJX", sector: "Consumer Discretionary" },
  { symbol: "META", name: "Meta", sector: "Communication Services" },
  { symbol: "GOOGL", name: "Alphabet A", sector: "Communication Services" },
  { symbol: "GOOG", name: "Alphabet C", sector: "Communication Services" },
  { symbol: "NFLX", name: "Netflix", sector: "Communication Services" },
  { symbol: "DIS", name: "Disney", sector: "Communication Services" },
  { symbol: "CMCSA", name: "Comcast", sector: "Communication Services" },
  { symbol: "T", name: "AT&T", sector: "Communication Services" },
  { symbol: "VZ", name: "Verizon", sector: "Communication Services" },
  { symbol: "CHTR", name: "Charter", sector: "Communication Services" },
  { symbol: "JPM", name: "JPMorgan", sector: "Financials" },
  { symbol: "BAC", name: "Bank of America", sector: "Financials" },
  { symbol: "WFC", name: "Wells Fargo", sector: "Financials" },
  { symbol: "C", name: "Citigroup", sector: "Financials" },
  { symbol: "GS", name: "Goldman Sachs", sector: "Financials" },
  { symbol: "MS", name: "Morgan Stanley", sector: "Financials" },
  { symbol: "BLK", name: "BlackRock", sector: "Financials" },
  { symbol: "SCHW", name: "Charles Schwab", sector: "Financials" },
  { symbol: "AXP", name: "American Express", sector: "Financials" },
  { symbol: "COF", name: "Capital One", sector: "Financials" },
  { symbol: "SPGI", name: "S&P Global", sector: "Financials" },
  { symbol: "MCO", name: "Moody's", sector: "Financials" },
  { symbol: "V", name: "Visa", sector: "Financials" },
  { symbol: "MA", name: "Mastercard", sector: "Financials" },
  { symbol: "BRK-B", name: "Berkshire B", sector: "Financials" },
  { symbol: "PGR", name: "Progressive", sector: "Financials" },
  { symbol: "CB", name: "Chubb", sector: "Financials" },
  { symbol: "MMC", name: "Marsh McLennan", sector: "Financials" },
  { symbol: "AON", name: "Aon", sector: "Financials" },
  { symbol: "JNJ", name: "Johnson & Johnson", sector: "Health Care" },
  { symbol: "UNH", name: "UnitedHealth", sector: "Health Care" },
  { symbol: "LLY", name: "Eli Lilly", sector: "Health Care" },
  { symbol: "ABBV", name: "AbbVie", sector: "Health Care" },
  { symbol: "MRK", name: "Merck", sector: "Health Care" },
  { symbol: "PFE", name: "Pfizer", sector: "Health Care" },
  { symbol: "TMO", name: "Thermo Fisher", sector: "Health Care" },
  { symbol: "ABT", name: "Abbott", sector: "Health Care" },
  { symbol: "DHR", name: "Danaher", sector: "Health Care" },
  { symbol: "AMGN", name: "Amgen", sector: "Health Care" },
  { symbol: "BMY", name: "Bristol Myers", sector: "Health Care" },
  { symbol: "ELV", name: "Elevance", sector: "Health Care" },
  { symbol: "CI", name: "Cigna", sector: "Health Care" },
  { symbol: "ISRG", name: "Intuitive Surgical", sector: "Health Care" },
  { symbol: "XOM", name: "Exxon Mobil", sector: "Energy" },
  { symbol: "CVX", name: "Chevron", sector: "Energy" },
  { symbol: "COP", name: "ConocoPhillips", sector: "Energy" },
  { symbol: "EOG", name: "EOG", sector: "Energy" },
  { symbol: "SLB", name: "Schlumberger", sector: "Energy" },
  { symbol: "PSX", name: "Phillips 66", sector: "Energy" },
  { symbol: "MPC", name: "Marathon Petroleum", sector: "Energy" },
  { symbol: "WMT", name: "Walmart", sector: "Consumer Staples" },
  { symbol: "PG", name: "Procter & Gamble", sector: "Consumer Staples" },
  { symbol: "KO", name: "Coca-Cola", sector: "Consumer Staples" },
  { symbol: "PEP", name: "PepsiCo", sector: "Consumer Staples" },
  { symbol: "COST", name: "Costco", sector: "Consumer Staples" },
  { symbol: "PM", name: "Philip Morris", sector: "Consumer Staples" },
  { symbol: "MO", name: "Altria", sector: "Consumer Staples" },
  { symbol: "CL", name: "Colgate", sector: "Consumer Staples" },
  { symbol: "MDLZ", name: "Mondelez", sector: "Consumer Staples" },
  { symbol: "KMB", name: "Kimberly-Clark", sector: "Consumer Staples" },
  { symbol: "CAT", name: "Caterpillar", sector: "Industrials" },
  { symbol: "DE", name: "Deere", sector: "Industrials" },
  { symbol: "HON", name: "Honeywell", sector: "Industrials" },
  { symbol: "UNP", name: "Union Pacific", sector: "Industrials" },
  { symbol: "UPS", name: "UPS", sector: "Industrials" },
  { symbol: "FDX", name: "FedEx", sector: "Industrials" },
  { symbol: "GE", name: "GE Aerospace", sector: "Industrials" },
  { symbol: "RTX", name: "RTX", sector: "Industrials" },
  { symbol: "BA", name: "Boeing", sector: "Industrials" },
  { symbol: "LMT", name: "Lockheed Martin", sector: "Industrials" },
  { symbol: "CSX", name: "CSX", sector: "Industrials" },
  { symbol: "NSC", name: "Norfolk Southern", sector: "Industrials" },
  { symbol: "LIN", name: "Linde", sector: "Materials" },
  { symbol: "APD", name: "Air Products", sector: "Materials" },
  { symbol: "SHW", name: "Sherwin-Williams", sector: "Materials" },
  { symbol: "FCX", name: "Freeport-McMoRan", sector: "Materials" },
  { symbol: "NEM", name: "Newmont", sector: "Materials" },
  { symbol: "NEE", name: "NextEra", sector: "Utilities" },
  { symbol: "SO", name: "Southern", sector: "Utilities" },
  { symbol: "DUK", name: "Duke", sector: "Utilities" },
  { symbol: "SRE", name: "Sempra", sector: "Utilities" },
  { symbol: "AEP", name: "American Electric", sector: "Utilities" },
  { symbol: "AMT", name: "American Tower", sector: "Real Estate" },
  { symbol: "PLD", name: "Prologis", sector: "Real Estate" },
  { symbol: "EQIX", name: "Equinix", sector: "Real Estate" },
  { symbol: "CCI", name: "Crown Castle", sector: "Real Estate" },
  { symbol: "SPY", name: "SPDR S&P 500", sector: "Information Technology" },
];

const SP500_CSV =
  "https://raw.githubusercontent.com/datasets/s-and-p-500-companies/master/data/constituents.csv";

function yahooSymbol(raw: string): string {
  return raw.replace(/\./g, "-").trim().toUpperCase();
}

function parseConstituents(csv: string): Constituent[] {
  const lines = csv.trim().split(/\r?\n/);
  const header = lines[0]?.split(",") ?? [];
  const symbolIdx = header.findIndex((col) => /symbol/i.test(col));
  const nameIdx = header.findIndex((col) => /security|name/i.test(col));
  const sectorIdx = header.findIndex((col) => /sector/i.test(col));
  if (symbolIdx < 0) return [];

  const out: Constituent[] = [];
  for (const line of lines.slice(1)) {
    const cols = line.split(",");
    const symbol = yahooSymbol(cols[symbolIdx] ?? "");
    if (!symbol) continue;
    out.push({
      symbol,
      name: cols[nameIdx]?.trim() || symbol,
      sector: cols[sectorIdx]?.trim() || "Unknown",
    });
  }
  return out;
}

async function fetchSp500(): Promise<Constituent[]> {
  try {
    const response = await fetch(SP500_CSV, {
      signal: AbortSignal.timeout(8000),
    });
    if (!response.ok) throw new Error(`SPX list ${response.status}`);
    const parsed = parseConstituents(await response.text());
    if (parsed.length < 400) throw new Error("SPX list too short");
    return parsed;
  } catch {
    return LIQUID_CORE;
  }
}

export async function loadUniverse(
  mode: UniverseMode,
  sector = "all",
): Promise<{ names: Constituent[]; fallback: boolean }> {
  const names =
    mode === "sp500"
      ? await withCache("universe:sp500", fetchSp500, {
          ttlMs: 24 * 60 * 60 * 1000,
        })
      : LIQUID_CORE;
  const filtered =
    sector === "all"
      ? names
      : names.filter((item) => item.sector === sector);
  return {
    names: filtered,
    fallback: mode === "sp500" && names === LIQUID_CORE,
  };
}
