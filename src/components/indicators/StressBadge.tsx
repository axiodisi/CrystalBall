import type { StressLevel } from "@/lib/data/types";
import { STRESS_LABEL } from "@/lib/indicators/copy";

const STRESS_CLASS: Record<StressLevel, string> = {
  calm: "text-sage border-sage/40 bg-sage/10",
  watch: "text-amber border-amber/40 bg-amber/10",
  elevated: "text-rose border-rose/40 bg-rose/10",
  unknown: "text-fog border-line bg-raised",
};

export function StressBadge({ stress }: { stress: StressLevel }) {
  return (
    <span
      className={`rounded-full border px-2 py-0.5 font-mono text-[10px] uppercase tracking-wide ${STRESS_CLASS[stress]}`}
    >
      {STRESS_LABEL[stress]}
    </span>
  );
}
