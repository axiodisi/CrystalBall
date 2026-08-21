export type SeriesPoint = {
  t: number;
  v: number;
};

export type QuoteSeries = {
  symbol: string;
  name: string;
  currency?: string;
  points: SeriesPoint[];
  last: number | null;
  previous: number | null;
  avgDollarVolume?: number;
  source: "yahoo" | "stooq" | "none";
  error?: string;
};

export type StressLevel = "calm" | "watch" | "elevated" | "unknown";

export type IndicatorCategory =
  | "spread"
  | "volatility"
  | "macro"
  | "alternative";

export type IndicatorSnapshot = {
  id: string;
  label: string;
  shortLabel: string;
  category: IndicatorCategory;
  value: number | null;
  displayValue: string;
  changeLabel: string;
  changePct: number | null;
  zScore: number | null;
  sparkline: number[];
  stress: StressLevel;
  source: string;
  interpretation: string;
  frequency: string;
  calculation: string;
  href?: string;
  available: boolean;
};

export type PizzaStatus = {
  id: "pizza";
  label: string;
  status: string;
  source: string;
  href: string;
  glance: string;
  interpretation: string;
  frequency: string;
};

export type PolymarketCard = {
  id: string;
  question: string;
  probability: number | null;
  change24h: number | null;
  volume: number | null;
  url: string;
  available: boolean;
};

export type IndicatorsPayload = {
  updatedAt: string;
  quotes: Record<string, QuoteSeries>;
  indicators: IndicatorSnapshot[];
  pizza: PizzaStatus;
  polymarket: PolymarketCard[];
};
