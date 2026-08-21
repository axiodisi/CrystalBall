export type PairStatus =
  | "neutral"
  | "approaching"
  | "triggered-long"
  | "triggered-short";

export type LiveKind = "promoted" | "standing";

export type LivePoint = {
  t: number;
  a: number;
  b: number;
  aNorm: number;
  bNorm: number;
  spread: number;
  z: number;
};

export type LiveItem = {
  id: string;
  kind: LiveKind;
  tickerA: string;
  tickerB: string;
  nameA: string;
  nameB: string;
  beta: number | null;
  z: number | null;
  spread: number | null;
  mean: number | null;
  std: number | null;
  sparkline: number[];
  lookbackDays: number;
  available: boolean;
  error?: string;
  series?: LivePoint[];
};

export type LiveResponse = {
  updatedAt: string;
  items: LiveItem[];
  signals: {
    vix: number | null;
    brentZ: number | null;
  };
};

export type AlertKind = "entry" | "exit" | "indicator";

export type AlertEvent = {
  id: string;
  pairId: string;
  title: string;
  body: string;
  kind: AlertKind;
  createdAt: string;
  acked: boolean;
};

export type AlertSettings = {
  notifications: boolean;
  mutedIds: string[];
  vixAbove: number;
  brentAbsZ: number;
};

export const DEFAULT_ALERT_SETTINGS: AlertSettings = {
  notifications: true,
  mutedIds: [],
  vixAbove: 25,
  brentAbsZ: 2,
};

export function pairStatus(z: number | null, entryZ: number): PairStatus {
  if (z === null || !Number.isFinite(z)) return "neutral";
  if (z >= entryZ) return "triggered-short";
  if (z <= -entryZ) return "triggered-long";
  const approach = Math.min(1, entryZ * 0.75);
  if (Math.abs(z) >= approach) return "approaching";
  return "neutral";
}

export function statusUrgency(status: PairStatus): number {
  if (status.startsWith("triggered")) return 3;
  if (status === "approaching") return 2;
  return 1;
}

export function statusLabel(status: PairStatus): string {
  if (status === "triggered-long") return "Triggered long";
  if (status === "triggered-short") return "Triggered short";
  if (status === "approaching") return "Approaching";
  return "Neutral";
}
