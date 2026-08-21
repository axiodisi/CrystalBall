import type { IndicatorSnapshot } from "@/lib/data/types";
import type { Regime, RegimeDriver, RegimeReading, SetupQuality } from "./types";

/**
 * Deterministic tape classifier.
 *
 * Core gauges only (pizza / Polymarket are too noisy to move the tape):
 *   VIX ≥ 25            +3   (same threshold as the VIX alert default)
 *   VIX elevated (≥20)  +2
 *   VIX watch (16–20)   +1
 *   Brent–WTI elevated or watch  +1
 *   RSP/SPY, gold, DXY elevated  +1 each (watch does not score)
 *
 *   0      → Calm
 *   1–2    → Mixed
 *   ≥ 3    → Stress
 *   no core data → Unknown
 *
 * Setup quality (stretched = |z| ≥ max(1.5, 0.75 × entryZ)):
 *   stretched + Calm   → Clean
 *   stretched + Mixed  → Mixed
 *   stretched + Stress → Poor
 *   stretched + Unknown → Mixed (incomplete tape; never claim Clean or Poor)
 *   not stretched      → No stretch
 */

const CORE_IDS = new Set(["vix", "brent-wti", "rsp-spy", "gold", "dxy"]);

export const REGIME_LABEL: Record<Regime, string> = {
  calm: "Calm",
  mixed: "Mixed",
  stress: "Stress",
  unknown: "Unknown",
};

/** One-line plain-language backdrop. Locked labels stay; the rest explains them. */
export const REGIME_PLAIN: Record<Regime, string> = {
  calm: "The backdrop is Calm — gauges look quiet, near typical.",
  mixed: "The backdrop is Mixed — some gauges are off, not a full storm.",
  stress:
    "The backdrop is Stress — several gauges are elevated, so markets look strained.",
  unknown: "The backdrop is Unknown — the main gauges did not load.",
};

export const QUALITY_LABEL: Record<SetupQuality, string> = {
  clean: "Clean",
  mixed: "Mixed",
  poor: "Poor",
  none: "No stretch",
};

export function pointsFor(item: IndicatorSnapshot): number {
  if (!CORE_IDS.has(item.id)) return 0;
  if (item.stress === "unknown" || item.stress === "calm") return 0;

  if (item.id === "vix") {
    if (item.value !== null && item.value >= 25) return 3;
    if (item.stress === "elevated") return 2;
    return 1;
  }

  if (item.id === "brent-wti") {
    return item.stress === "elevated" || item.stress === "watch" ? 1 : 0;
  }

  return item.stress === "elevated" ? 1 : 0;
}

export function classifyRegime(indicators: IndicatorSnapshot[]): RegimeReading {
  const core = indicators.filter((item) => CORE_IDS.has(item.id));
  const available = core.filter((item) => item.stress !== "unknown").length;

  const drivers: RegimeDriver[] = core
    .map((item) => ({
      id: item.id,
      label: item.shortLabel,
      stress: item.stress,
      points: pointsFor(item),
    }))
    .filter((item) => item.points > 0)
    .sort((a, b) => b.points - a.points);

  const points = drivers.reduce((sum, item) => sum + item.points, 0);

  if (available === 0) {
    return { regime: "unknown", points: 0, available, drivers };
  }

  let regime: Regime = "calm";
  if (points >= 3) regime = "stress";
  else if (points >= 1) regime = "mixed";

  return { regime, points, available, drivers };
}

export function isStretched(z: number | null, entryZ: number): boolean {
  if (z === null || !Number.isFinite(z)) return false;
  const threshold = Math.max(1.5, entryZ * 0.75);
  return Math.abs(z) >= threshold;
}

export function setupQuality(
  z: number | null,
  entryZ: number,
  regime: Regime,
): SetupQuality {
  if (!isStretched(z, entryZ)) return "none";
  if (regime === "calm") return "clean";
  if (regime === "stress") return "poor";
  return "mixed";
}
