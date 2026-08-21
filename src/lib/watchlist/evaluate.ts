import type { PromotedPair } from "@/lib/research/types";
import { raiseAlert, readLastZ, writeLastZ } from "./alerts";
import type { AlertSettings, LiveItem, LiveResponse } from "./types";

export function evaluateLiveAlerts(
  live: LiveResponse,
  pairs: PromotedPair[],
  settings: AlertSettings,
) {
  const lastZ = { ...readLastZ() };
  const byId = new Map(pairs.map((item) => [item.id, item]));

  for (const item of live.items) {
    if (item.z === null || !item.available) continue;
    if (settings.mutedIds.includes(item.id)) {
      lastZ[item.id] = item.z;
      continue;
    }

    const prev = lastZ[item.id];
    const entry =
      item.kind === "promoted" ? (byId.get(item.id)?.entryZ ?? 2) : 2;
    const exit =
      item.kind === "promoted" ? (byId.get(item.id)?.exitZ ?? 0.5) : 0.5;
    const label = `${item.tickerA}/${item.tickerB}`;

    if (prev !== undefined) {
      if (Math.abs(prev) < entry && Math.abs(item.z) >= entry) {
        const side = item.z > 0 ? "short" : "long";
        raiseAlert({
          pairId: item.id,
          kind: "entry",
          title: `${label} entry`,
          body: `z ${item.z.toFixed(2)} crossed ±${entry.toFixed(1)} (${side} the spread).`,
        });
      }
      if (Math.abs(prev) > exit && Math.abs(item.z) <= exit) {
        raiseAlert({
          pairId: item.id,
          kind: "exit",
          title: `${label} exit`,
          body: `z ${item.z.toFixed(2)} is back inside ±${exit.toFixed(1)}.`,
        });
      }
    }

    lastZ[item.id] = item.z;
  }

  if (
    live.signals.vix !== null &&
    live.signals.vix >= settings.vixAbove &&
    !settings.mutedIds.includes("ind:vix")
  ) {
    const prev = lastZ["ind:vix"];
    if (prev !== undefined && prev < settings.vixAbove) {
      raiseAlert({
        pairId: "ind:vix",
        kind: "indicator",
        title: "VIX threshold",
        body: `VIX ${live.signals.vix.toFixed(1)} is above ${settings.vixAbove}.`,
      });
    }
    lastZ["ind:vix"] = live.signals.vix;
  } else if (live.signals.vix !== null) {
    lastZ["ind:vix"] = live.signals.vix;
  }

  if (
    live.signals.brentZ !== null &&
    Math.abs(live.signals.brentZ) >= settings.brentAbsZ &&
    !settings.mutedIds.includes("standing:brent-wti")
  ) {
    const prev = lastZ["ind:brent"];
    if (prev !== undefined && Math.abs(prev) < settings.brentAbsZ) {
      raiseAlert({
        pairId: "standing:brent-wti",
        kind: "indicator",
        title: "Brent–WTI threshold",
        body: `Spread z ${live.signals.brentZ.toFixed(2)} is beyond ±${settings.brentAbsZ}.`,
      });
    }
    lastZ["ind:brent"] = live.signals.brentZ;
  } else if (live.signals.brentZ !== null) {
    lastZ["ind:brent"] = live.signals.brentZ;
  }

  writeLastZ(lastZ);
}

export function sortLive(
  items: LiveItem[],
  pairs: PromotedPair[],
): LiveItem[] {
  const entryFor = (item: LiveItem) =>
    item.kind === "promoted"
      ? (pairs.find((row) => row.id === item.id)?.entryZ ?? 2)
      : 2;

  return [...items].sort((a, b) => {
    const ua = urgency(a, entryFor(a));
    const ub = urgency(b, entryFor(b));
    if (ub !== ua) return ub - ua;
    return Math.abs(b.z ?? 0) - Math.abs(a.z ?? 0);
  });
}

function urgency(item: LiveItem, entry: number): number {
  if (item.z === null) return 0;
  if (Math.abs(item.z) >= entry) return 3;
  if (Math.abs(item.z) >= Math.min(1, entry * 0.75)) return 2;
  return 1;
}
