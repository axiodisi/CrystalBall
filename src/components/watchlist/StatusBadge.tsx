import {
  pairStatus,
  statusLabel,
  type PairStatus,
} from "@/lib/watchlist/types";

const CLASS: Record<PairStatus, string> = {
  neutral: "text-sage border-sage/40 bg-sage/10",
  approaching: "text-amber border-amber/40 bg-amber/10",
  "triggered-long": "text-rose border-rose/40 bg-rose/10",
  "triggered-short": "text-rose border-rose/40 bg-rose/10",
};

export function StatusBadge({
  z,
  entryZ,
}: {
  z: number | null;
  entryZ: number;
}) {
  const status = pairStatus(z, entryZ);
  return (
    <span
      className={`rounded-full border px-2 py-0.5 font-mono text-[10px] uppercase tracking-wide ${CLASS[status]}`}
    >
      {statusLabel(status)}
    </span>
  );
}
