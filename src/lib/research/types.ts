export type UniverseMode = "liquid" | "sp500";

export type ScanParams = {
  universe: UniverseMode;
  sector: string;
  minPrice: number;
  minAdv: number;
  corrLookback: number;
  estLookback: number;
  corrMin: number;
  maxPerTicker: number;
};

export const DEFAULT_SCAN: ScanParams = {
  universe: "liquid",
  sector: "all",
  minPrice: 5,
  minAdv: 20_000_000,
  corrLookback: 90,
  estLookback: 252,
  corrMin: 0.8,
  maxPerTicker: 5,
};

export type Constituent = {
  symbol: string;
  name: string;
  sector: string;
};

export type PairSummary = {
  tickerA: string;
  tickerB: string;
  nameA: string;
  nameB: string;
  sectorA: string;
  sectorB: string;
  correlation: number;
  corrRecent: number;
  beta: number;
  alpha: number;
  adfStat: number;
  adfPValue: number;
  halfLife: number | null;
  spreadVol: number;
  betaStability: number;
  currentZ: number | null;
  minAdv: number;
  score: number;
  lookbackDays: number;
  corrLookbackDays: number;
};

export type PairPoint = {
  t: number;
  a: number;
  b: number;
  aNorm: number;
  bNorm: number;
  spread: number;
  z: number | null;
};

export type PairDetail = PairSummary & {
  series: PairPoint[];
  spreadMean: number;
  spreadStd: number;
};

export type ScanResponse = {
  updatedAt: string;
  params: ScanParams;
  fetched: number;
  eligible: number;
  pairsTested: number;
  corrPassed: number;
  cointPassed: number;
  results: PairSummary[];
  warnings: string[];
  durationMs: number;
};

export type PromotedPair = {
  id: string;
  tickerA: string;
  tickerB: string;
  nameA: string;
  nameB: string;
  beta: number;
  alpha: number;
  lookbackDays: number;
  corrLookbackDays: number;
  entryZ: number;
  exitZ: number;
  notes: string;
  adfPValue: number;
  halfLife: number;
  correlation: number;
  score: number;
  promotedAt: string;
};

export const DEFAULT_ENTRY_Z = 2;
export const DEFAULT_EXIT_Z = 0.5;
