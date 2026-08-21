import type { StressLevel } from "@/lib/data/types";

/** Trading days back for the "a few days ago" compare. */
export const RECENT_Z_LAG = 5;

/** |z| change smaller than this counts as "about the same". */
const SAME_THRESHOLD = 0.25;

export type RecentZContext = {
  currentZ: number | null;
  priorZ: number | null;
  sparkline: number[];
  line: string;
  tone: StressLevel;
};

function finiteZs(series: Array<{ z: number | null }>): number[] {
  return series
    .map((row) => row.z)
    .filter((z): z is number => z !== null && Number.isFinite(z));
}

function toneFor(z: number | null): StressLevel {
  if (z === null || !Number.isFinite(z)) return "unknown";
  const abs = Math.abs(z);
  if (abs >= 2) return "elevated";
  if (abs >= 1) return "watch";
  return "calm";
}

/**
 * Compare current |z| with ~5 trading days ago.
 * Wider = the gap is more unusual; narrower = closer to typical.
 */
export function recentZContext(
  series: Array<{ z: number | null }>,
  lag = RECENT_Z_LAG,
): RecentZContext {
  const zs = finiteZs(series);
  if (zs.length === 0) {
    return {
      currentZ: null,
      priorZ: null,
      sparkline: [],
      line: "Not enough recent history to compare.",
      tone: "unknown",
    };
  }

  const currentZ = zs[zs.length - 1];
  const priorIndex = zs.length - 1 - lag;
  const priorZ = priorIndex >= 0 ? zs[priorIndex] : null;
  const sparkline = zs.slice(-Math.max(lag + 1, 12));

  if (priorZ === null) {
    return {
      currentZ,
      priorZ: null,
      sparkline,
      line: "Not enough recent history to compare.",
      tone: toneFor(currentZ),
    };
  }

  const delta = Math.abs(currentZ) - Math.abs(priorZ);
  let line: string;
  if (Math.abs(delta) < SAME_THRESHOLD) {
    line = "About the same";
  } else if (delta > 0) {
    line = "Wider than a few days ago";
  } else {
    line = "Narrower than a few days ago";
  }

  return {
    currentZ,
    priorZ,
    sparkline,
    line,
    tone: toneFor(currentZ),
  };
}
