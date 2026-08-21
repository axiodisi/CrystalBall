import { formatZ } from "@/lib/format";
import type {
  IndicatorSnapshot,
  PizzaStatus,
  PolymarketCard,
} from "@/lib/data/types";

function tilt(item: Pick<IndicatorSnapshot, "zScore" | "changePct">): number {
  return item.zScore ?? item.changePct ?? 0;
}

/**
 * Plain-language "so what" for the current reading.
 * Compact = one sentence for tight cards; full = reading + pair implication.
 */
export function soWhat(
  item: IndicatorSnapshot,
  compact = false,
): string {
  const body = soWhatBody(item);
  if (compact) return body.now;
  if (!body.pair) return body.now;
  return `${body.now} ${body.pair}`;
}

function soWhatBody(item: IndicatorSnapshot): { now: string; pair: string } {
  const sign = tilt(item);

  switch (item.id) {
    case "brent-wti":
      if (item.stress === "unknown") {
        return {
          now: "No Brent–WTI reading right now.",
          pair: "This oil gauge is missing.",
        };
      }
      if (item.stress === "calm") {
        return {
          now: "The gap between global oil (Brent) and US oil (WTI) is near its usual size.",
          pair: "Not a warning for unusual stock-pair gaps.",
        };
      }
      if (sign >= 0) {
        return item.stress === "elevated"
          ? {
              now: "The Brent–WTI gap is unusually wide — global oil looks stressed versus US oil.",
              pair: "Treat unusual pair gaps as less trustworthy.",
            }
          : {
              now: "The Brent–WTI gap is somewhat wide.",
              pair: "Mild oil / geopolitics caution — watch, don’t overreact.",
            };
      }
      return item.stress === "elevated"
        ? {
            now: "The Brent–WTI gap is unusually tight, not the typical stress pattern.",
            pair: "Oil is messy either way; don’t treat this as a quiet market on its own.",
          }
        : {
            now: "The Brent–WTI gap is somewhat tight.",
            pair: "Not the usual stress read; background only.",
          };

    case "rsp-spy":
      if (item.stress === "unknown") {
        return {
          now: "No reading on how many stocks are participating.",
          pair: "This equal-weight vs giant-stock gauge is missing.",
        };
      }
      if (item.stress === "calm") {
        return {
          now: "Equal-weight vs giant stocks is near typical — how many stocks are participating is not a warning.",
          pair: "No extra caution for pairs from this gauge.",
        };
      }
      if (sign >= 0) {
        return {
          now: "More stocks are participating, not just the giants.",
          pair: "Healthier backdrop, still not a green light by itself.",
        };
      }
      return item.stress === "elevated"
        ? {
            now: "A few giant stocks are leading; the rest of the market is lagging.",
            pair: "When leadership is this narrow, unusual pair gaps are less trustworthy.",
          }
        : {
            now: "Giant stocks are leading a bit more than usual.",
            pair: "Mild caution, not a crash signal.",
          };

    case "vix":
      if (item.stress === "unknown") {
        return {
          now: "No VIX reading right now.",
          pair: "Expected-swing context is missing.",
        };
      }
      if (item.stress === "elevated") {
        return {
          now: `Expected stock swings are high (VIX ${item.displayValue}) — fear is up.`,
          pair: "Unusual pair gaps are less trustworthy while this lasts.",
        };
      }
      if (item.stress === "watch") {
        return {
          now: `Expected stock swings are picking up (VIX ${item.displayValue}).`,
          pair: "Unusual pair gaps can still shrink — wait until the gap starts coming back, not the first stretch.",
        };
      }
      return {
        now: `Expected stock swings are low (VIX ${item.displayValue}).`,
        pair: "Friendlier backdrop for unusual pair gaps shrinking.",
      };

    case "gold":
      if (item.stress === "unknown") {
        return { now: "No gold reading right now.", pair: "" };
      }
      if (item.stress === "calm") {
        return {
          now: "Gold is quiet — no extra hedge-buying from this gauge.",
          pair: "Not a stress flag.",
        };
      }
      if (sign >= 0) {
        return {
          now: "Gold is being bought, which often means investors want a hedge.",
          pair: "Weak confirmation of a defensive backdrop, not a pair trigger.",
        };
      }
      return {
        now: "Gold is being sold — the usual hedge is not in demand.",
        pair: "Not a stress flag by itself.",
      };

    case "dxy":
      if (item.stress === "unknown") {
        return { now: "No dollar reading right now.", pair: "" };
      }
      if (item.stress === "calm") {
        return {
          now: "The dollar is near typical.",
          pair: "Not tightening conditions from here.",
        };
      }
      if (sign >= 0) {
        return {
          now: "The dollar is stronger, which often makes global conditions tighter.",
          pair: "Mild caution for risk assets and pairs.",
        };
      }
      return {
        now: "The dollar is weaker — often easier global conditions.",
        pair: "Not a pair signal on its own.",
      };

    default:
      return { now: item.interpretation, pair: "" };
  }
}

export function pizzaSoWhat(pizza: PizzaStatus, compact = false): string {
  if (compact) {
    return "Not a live CrystalBall feed. Weak, noisy hint of activity at the Pentagon — never a reason to trade a pair.";
  }
  return `${pizza.interpretation} CrystalBall does not scrape this live — never use pizza activity as a reason to trade a pair.`;
}

export function standingSpreadSoWhat(label: string, z: number | null): string {
  if (z === null || !Number.isFinite(z)) {
    return `${label}: no live reading.`;
  }
  if (Math.abs(z) < 1) {
    return `${label} is near its recent average (${formatZ(z)}). Not unusual.`;
  }
  if (Math.abs(z) >= 2) {
    return `${label} is unusually far from its recent average (${formatZ(z)}). That’s a stretch — same backdrop as any pair.`;
  }
  return `${label} is somewhat off its recent average (${formatZ(z)}). Watch, not yet a full stretch.`;
}

export function polymarketSoWhat(market: PolymarketCard): string {
  if (market.probability === null) {
    return "Crowd odds are unavailable. Even when they are, they are a betting-market number — not CrystalBall’s view, and not a pair trigger.";
  }
  const pct = Math.round(market.probability * 100);
  return `Crowd puts this at ${pct}%. That is betting-market odds, not CrystalBall’s view — background only, never a pair trigger.`;
}
