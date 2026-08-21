import { formatNumber, formatZ } from "@/lib/format";
import { isStretched, QUALITY_LABEL, REGIME_PLAIN, setupQuality } from "./regime";
import type { PairBrief, PairBriefInput, SetupQuality } from "./types";

function happening(input: PairBriefInput): string {
  const { tickerA, tickerB, z, entryZ } = input;
  const pair = `${tickerA} / ${tickerB}`;

  if (z === null || !Number.isFinite(z)) {
    return `${pair}: no current gap reading, so we cannot tell if anything is unusual.`;
  }

  const zText = formatZ(z);
  const explain = "z is how far the gap is from its recent average";

  if (Math.abs(z) < 1) {
    return `${pair} are close to their usual relationship (${zText}). ${explain} — this is not unusual.`;
  }

  const distance =
    Math.abs(z) >= 2
      ? `unusually far from typical (${zText} — ${explain})`
      : `farther from typical than usual (${zText} — ${explain})`;
  if (z > 0) {
    const vs =
      Math.abs(z) >= entryZ
        ? `${tickerA} looks expensive versus ${tickerB}.`
        : `${tickerA} is getting expensive versus ${tickerB}.`;
    return `${pair}: the gap is ${distance}. ${vs}`;
  }

  const vs =
    Math.abs(z) >= entryZ
      ? `${tickerA} looks cheap versus ${tickerB}.`
      : `${tickerA} is getting cheap versus ${tickerB}.`;
  return `${pair}: the gap is ${distance}. ${vs}`;
}

function whyMatter(
  input: PairBriefInput,
  quality: SetupQuality,
  stretched: boolean,
): string {
  const backdrop = REGIME_PLAIN[input.regime];

  if (input.z === null || !Number.isFinite(input.z)) {
    return `${backdrop} Without a gap reading, there is nothing to act on.`;
  }
  if (!stretched) {
    return `${backdrop} The gap is not unusual right now, so there is no signal.`;
  }
  if (quality === "clean") {
    return `${backdrop} Unusual gaps are a cleaner signal when markets look quiet.`;
  }
  if (quality === "poor") {
    return `${backdrop} Unusual gaps can keep growing instead of shrinking.`;
  }
  if (input.regime === "unknown") {
    return `${backdrop} The gap is unusual, but we cannot call that a clean or poor signal yet.`;
  }
  return `${backdrop} The gap is unusual, but the signal is weaker until things settle.`;
}

function simpleIdea(
  input: PairBriefInput,
  quality: SetupQuality,
  stretched: boolean,
): string {
  const { z, entryZ } = input;
  if (z === null || !Number.isFinite(z) || !stretched || quality === "poor") {
    return "Stand aside.";
  }
  if (Math.abs(z) < entryZ) {
    return "Stand aside.";
  }
  return "Bet the gap shrinks.";
}

function whenBetter(
  input: PairBriefInput,
  quality: SetupQuality,
  stretched: boolean,
): string {
  const { z, entryZ } = input;
  if (z === null || !stretched) {
    return `This idea is not in play until the gap gets more unusual (toward ±${entryZ.toFixed(1)}).`;
  }
  if (quality === "poor") {
    return "The idea looks better only after stress cools and the gap starts shrinking toward typical.";
  }
  if (Math.abs(z) < entryZ) {
    return `The idea looks better if the gap reaches ±${entryZ.toFixed(1)} and then starts shrinking — don’t jump in early.`;
  }
  if (quality === "mixed") {
    return "The idea looks better if the gap stops growing and starts shrinking — not on the first unusual reading.";
  }
  return "The idea looks better if the gap stops growing and starts shrinking toward typical.";
}

function whenWrong(input: PairBriefInput, stretched: boolean): string {
  const { z, exitZ, halfLife } = input;
  const hl =
    halfLife && halfLife > 0
      ? ` Gaps like this have often taken about ${formatNumber(halfLife, 0)} trading days to come back.`
      : "";
  const done = `The idea is done when the gap is back near typical (inside ±${exitZ.toFixed(1)}).`;

  if (z === null || !stretched) {
    return `Nothing to be wrong about yet. ${done}${hl}`;
  }
  return `The idea looks wrong if the gap keeps growing instead of shrinking — the usual relationship may have broken. ${done}${hl}`;
}

function riskLine(input: PairBriefInput, quality: SetupQuality): string {
  const support =
    "Decision support only — not a trade, size, or guarantee the gap comes back.";
  const failedGate =
    input.adfPValue !== null &&
    input.adfPValue !== undefined &&
    input.adfPValue >= 0.05;

  if (quality === "poor" && failedGate) {
    return `Stressed markets often break these relationships, and this lookback also fails the “they tend to move together” test. ${support}`;
  }
  if (quality === "poor") {
    return `Stressed markets often break these relationships. ${support}`;
  }
  if (failedGate) {
    return `This lookback fails the “they tend to move together” test, so a shrink is not well supported. ${support}`;
  }
  return support;
}

export function buildPairBrief(input: PairBriefInput): PairBrief {
  const stretched = isStretched(input.z, input.entryZ);
  const quality = setupQuality(input.z, input.entryZ, input.regime);

  return {
    quality,
    qualityLabel: QUALITY_LABEL[quality],
    regime: input.regime,
    stretched,
    items: [
      { label: "What's happening?", text: happening(input) },
      { label: "Why it might matter?", text: whyMatter(input, quality, stretched) },
      { label: "Simple idea", text: simpleIdea(input, quality, stretched) },
      {
        label: "When the idea looks better",
        text: whenBetter(input, quality, stretched),
      },
      { label: "When the idea looks wrong", text: whenWrong(input, stretched) },
      { label: "Risk", text: riskLine(input, quality) },
    ],
  };
}
