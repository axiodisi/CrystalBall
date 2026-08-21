import type { Regime, SetupQuality } from "@/lib/guidance";
import { QUALITY_LABEL, REGIME_LABEL } from "@/lib/guidance";

const REGIME_CLASS: Record<Regime, string> = {
  calm: "text-sage border-sage/40 bg-sage/10",
  mixed: "text-amber border-amber/40 bg-amber/10",
  stress: "text-rose border-rose/40 bg-rose/10",
  unknown: "text-fog border-line bg-raised",
};

const QUALITY_CLASS: Record<SetupQuality, string> = {
  clean: "text-sage border-sage/40 bg-sage/10",
  mixed: "text-amber border-amber/40 bg-amber/10",
  poor: "text-rose border-rose/40 bg-rose/10",
  none: "text-fog border-line bg-raised",
};

export function RegimeBadge({ regime }: { regime: Regime }) {
  return (
    <span
      className={`rounded-full border px-2 py-0.5 font-mono text-[10px] uppercase tracking-wide ${REGIME_CLASS[regime]}`}
    >
      {REGIME_LABEL[regime]}
    </span>
  );
}

export function QualityBadge({ quality }: { quality: SetupQuality }) {
  return (
    <span
      className={`rounded-full border px-2 py-0.5 font-mono text-[10px] uppercase tracking-wide ${QUALITY_CLASS[quality]}`}
    >
      {QUALITY_LABEL[quality]}
    </span>
  );
}
