import type { IndicatorSnapshot, StressLevel } from "@/lib/data/types";
import { INDICATOR_META } from "./meta";

export const STRESS_LABEL: Record<StressLevel, string> = {
  calm: "Calm",
  watch: "Watch",
  elevated: "Elevated",
  unknown: "No data",
};

export function glanceFor(id: string): string {
  return INDICATOR_META[id]?.glance ?? "";
}

export function readingHint(
  item: Pick<IndicatorSnapshot, "id" | "stress" | "zScore" | "changePct">,
): string {
  const tilt = item.zScore ?? item.changePct ?? 0;

  switch (item.id) {
    case "brent-wti":
      if (item.stress === "unknown") return "No spread reading";
      if (item.stress === "calm") return "Near typical";
      if (tilt >= 0) {
        return item.stress === "elevated" ? "Unusually wide" : "Somewhat wide";
      }
      return item.stress === "elevated" ? "Unusually narrow" : "Somewhat narrow";
    case "rsp-spy":
      if (item.stress === "unknown") return "No breadth reading";
      if (item.stress === "calm") return "Breadth near typical";
      return tilt >= 0 ? "Broader participation" : "Mega-cap dominated";
    case "vix":
      if (item.stress === "unknown") return "No VIX reading";
      if (item.stress === "elevated") return "High expected vol / fear";
      if (item.stress === "watch") return "Vol picking up";
      return "Low expected vol";
    case "gold":
      if (item.stress === "unknown") return "No gold reading";
      if (item.stress === "calm") return "Quiet safe-haven tape";
      return tilt >= 0 ? "Safe-haven bid" : "Safe-haven selling";
    case "dxy":
      if (item.stress === "unknown") return "No dollar reading";
      if (item.stress === "calm") return "Dollar near typical";
      return tilt >= 0 ? "Dollar firmer" : "Dollar softer";
    default:
      return STRESS_LABEL[item.stress];
  }
}
