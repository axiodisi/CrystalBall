import type { StressLevel } from "@/lib/data/types";

/** Locked labels — do not rename. */
export type Regime = "calm" | "mixed" | "stress" | "unknown";

/** Locked labels — do not rename. Unstretched pairs are "none", not Clean. */
export type SetupQuality = "clean" | "mixed" | "poor" | "none";

export type RegimeDriver = {
  id: string;
  label: string;
  stress: StressLevel;
  points: number;
};

export type RegimeReading = {
  regime: Regime;
  points: number;
  available: number;
  drivers: RegimeDriver[];
};

export type MarketSnapshot = {
  regime: Regime;
  lines: string[];
};

export type PairBriefInput = {
  tickerA: string;
  tickerB: string;
  z: number | null;
  entryZ: number;
  exitZ: number;
  halfLife?: number | null;
  adfPValue?: number | null;
  regime: Regime;
};

export type PairBriefItem = {
  label: string;
  text: string;
};

export type PairBrief = {
  quality: SetupQuality;
  qualityLabel: string;
  regime: Regime;
  stretched: boolean;
  items: PairBriefItem[];
};
