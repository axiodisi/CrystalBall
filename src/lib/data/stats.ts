import type { SeriesPoint, StressLevel } from "./types";

export function mean(values: number[]): number {
  return values.reduce((sum, value) => sum + value, 0) / values.length;
}

export function sampleStd(values: number[]): number {
  if (values.length < 2) return 0;
  const avg = mean(values);
  const variance =
    values.reduce((sum, value) => sum + (value - avg) ** 2, 0) /
    (values.length - 1);
  return Math.sqrt(variance);
}

export function lastZScore(values: number[], window = 60): number | null {
  if (values.length < 8) return null;
  const slice = values.slice(-Math.min(window, values.length));
  const sd = sampleStd(slice);
  if (sd === 0) return 0;
  return (slice[slice.length - 1] - mean(slice)) / sd;
}

export function pctChange(current: number, previous: number): number {
  if (previous === 0) return 0;
  return ((current - previous) / previous) * 100;
}

export function dayKey(timestamp: number): string {
  return new Date(timestamp).toISOString().slice(0, 10);
}

export function alignedSeries(
  left: SeriesPoint[],
  right: SeriesPoint[],
  combine: (a: number, b: number) => number,
): SeriesPoint[] {
  const rightByDay = new Map(right.map((point) => [dayKey(point.t), point.v]));
  const out: SeriesPoint[] = [];
  for (const point of left) {
    const other = rightByDay.get(dayKey(point.t));
    if (other === undefined) continue;
    out.push({ t: point.t, v: combine(point.v, other) });
  }
  return out;
}

export function sparklineValues(points: SeriesPoint[], max = 32): number[] {
  if (points.length === 0) return [];
  const slice = points.slice(-max);
  return slice.map((point) => point.v);
}

export function zToStress(z: number | null): StressLevel {
  if (z === null) return "unknown";
  const abs = Math.abs(z);
  if (abs >= 2) return "elevated";
  if (abs >= 1) return "watch";
  return "calm";
}

export function vixStress(level: number): StressLevel {
  if (level >= 20) return "elevated";
  if (level >= 16) return "watch";
  return "calm";
}

export function moveStress(absPct: number): StressLevel {
  if (absPct >= 3) return "elevated";
  if (absPct >= 1.5) return "watch";
  return "calm";
}
