import type { IndicatorSnapshot, IndicatorsPayload } from "@/lib/data/types";
import { formatImpliedDailyMove } from "@/lib/indicators/vix";
import { classifyRegime } from "./regime";
import type { MarketSnapshot, Regime, RegimeReading } from "./types";

function byId(indicators: IndicatorSnapshot[], id: string) {
  return indicators.find((item) => item.id === id);
}

function vixClause(vix: IndicatorSnapshot | undefined): string {
  if (!vix || vix.stress === "unknown") return "VIX is unavailable";
  const implied =
    vix.value !== null && Number.isFinite(vix.value)
      ? `, ${formatImpliedDailyMove(vix.value)}`
      : "";
  if (vix.stress === "elevated") {
    return `expected stock swings are high (VIX level ${vix.displayValue}${implied})`;
  }
  if (vix.stress === "watch") {
    return `expected stock swings are picking up (VIX level ${vix.displayValue}${implied})`;
  }
  return `expected stock swings are low (VIX level ${vix.displayValue}${implied})`;
}

function otherFlags(indicators: IndicatorSnapshot[]): string[] {
  const flags: string[] = [];
  const brent = byId(indicators, "brent-wti");
  const rsp = byId(indicators, "rsp-spy");
  const gold = byId(indicators, "gold");
  const dxy = byId(indicators, "dxy");

  if (brent && brent.stress !== "unknown" && brent.stress !== "calm") {
    const wide = (brent.zScore ?? 0) >= 0;
    flags.push(
      brent.stress === "elevated"
        ? wide
          ? "Brent–WTI is unusually wide"
          : "Brent–WTI is unusually tight"
        : wide
          ? "Brent–WTI is somewhat wide"
          : "Brent–WTI is somewhat tight",
    );
  }
  if (rsp && rsp.stress === "elevated") {
    flags.push(
      (rsp.zScore ?? 0) >= 0
        ? "more stocks than usual are participating"
        : "a few giant stocks are leading",
    );
  }
  if (gold && gold.stress === "elevated") {
    flags.push(
      (gold.changePct ?? 0) >= 0
        ? "gold is being bought as a hedge"
        : "gold is being sold",
    );
  }
  if (dxy && dxy.stress === "elevated") {
    flags.push(
      (dxy.changePct ?? 0) >= 0
        ? "the dollar is stronger"
        : "the dollar is weaker",
    );
  }
  return flags;
}

function togetherLine(
  regime: Regime,
  indicators: IndicatorSnapshot[],
  reading: RegimeReading,
): string {
  const flags = otherFlags(indicators);

  if (regime === "unknown") {
    return "Taken together: we cannot read the backdrop until those gauges load.";
  }
  if (regime === "calm") {
    return "Taken together: expected swings, oil, how many stocks are participating, gold, and the dollar look quiet. Nothing here argues against unusual stock-pair gaps shrinking.";
  }
  if (regime === "stress") {
    const labels = reading.drivers.map((item) => item.label);
    const cluster =
      labels.length === 0
        ? "several gauges are elevated"
        : labels.length === 1
          ? `${labels[0]} is elevated`
          : labels.length === 2
            ? `${labels[0]} and ${labels[1]} are elevated`
            : `${labels.slice(0, -1).join(", ")}, and ${labels[labels.length - 1]} are elevated`;
    return `Taken together: ${cluster}. Unusual pair gaps are less trustworthy — they can keep growing.`;
  }
  if (flags.length === 0) {
    return "Taken together: some caution, not a full stress picture.";
  }
  return `Taken together: ${flags.join("; ")}. Some caution, not a full stress picture.`;
}

function implication(regime: Regime): string {
  if (regime === "calm") {
    return "While this holds, an unusual pair gap is a cleaner signal.";
  }
  if (regime === "stress") {
    return "Until this cools, an unusual pair gap is a poor signal. Gaps can keep running.";
  }
  if (regime === "unknown") {
    return "We cannot call an unusual pair gap a clean or poor signal until the gauges return.";
  }
  return "An unusual pair gap is a mixed signal — wait until it starts shrinking, rather than assuming it will.";
}

function risk(regime: Regime, available: number): string {
  const incomplete =
    available < 3
      ? " Some core gauges are missing, so this read is partial."
      : "";
  if (regime === "stress") {
    return `Do not assume unusual gaps will shrink while markets look stressed. Snapshot only — not a forecast.${incomplete}`;
  }
  if (regime === "mixed") {
    return `This read can flip to Stress if VIX or oil keeps rising. Snapshot only — not a forecast.${incomplete}`;
  }
  if (regime === "unknown") {
    return "Wait for gauges before using this as pair context.";
  }
  return `One elevated gauge can change this read. Snapshot only — not a forecast.${incomplete}`;
}

export function buildMarketSnapshot(payload: IndicatorsPayload): MarketSnapshot {
  const reading = classifyRegime(payload.indicators);
  const vix = byId(payload.indicators, "vix");
  const flags = otherFlags(payload.indicators);

  let lead: string;
  if (reading.regime === "unknown") {
    lead =
      "Unknown — the main gauges did not load, so there is no market-backdrop read.";
  } else if (reading.regime === "calm") {
    lead = `Calm — markets look quiet. ${vixClause(vix)}, and the other gauges are near typical.`;
  } else if (reading.regime === "stress") {
    const extra = flags.length ? `; ${flags.join("; ")}` : "";
    lead = `Stress — several gauges are elevated, so markets look strained. ${vixClause(vix)}${extra}.`;
  } else {
    const extra = flags.length ? ` ${flags.join("; ")}.` : "";
    lead = `Mixed — some gauges are off, but this is not a full stress picture. ${vixClause(vix)}.${extra}`;
  }

  return {
    regime: reading.regime,
    lines: [
      lead,
      togetherLine(reading.regime, payload.indicators, reading),
      implication(reading.regime),
      risk(reading.regime, reading.available),
    ],
  };
}

export function readingFromPayload(payload: IndicatorsPayload): RegimeReading {
  return classifyRegime(payload.indicators);
}
