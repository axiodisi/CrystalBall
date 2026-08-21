import type { PizzaStatus } from "@/lib/data/types";
import { pizzaSoWhat } from "@/lib/guidance";
import { IconPin } from "@/components/shell/icons";

type PizzaCardProps = {
  pizza: PizzaStatus;
  pinned?: boolean;
  onTogglePin?: () => void;
};

export function PizzaCard({ pizza, pinned, onTogglePin }: PizzaCardProps) {
  return (
    <article className="rounded-xl border border-line bg-panel p-4">
      <div className="flex items-start justify-between gap-3">
        <div>
          <div className="flex flex-wrap items-center gap-2">
            <p className="text-sm text-paper">{pizza.label}</p>
            <span className="rounded-full border border-amber/40 bg-amber/10 px-2 py-0.5 font-mono text-[10px] uppercase tracking-wide text-amber">
              Weak / noisy
            </span>
          </div>
          <p className="mt-2 font-mono text-lg text-fog">{pizza.status}</p>
        </div>
        {onTogglePin ? (
          <button
            type="button"
            onClick={onTogglePin}
            aria-pressed={pinned}
            aria-label={pinned ? "Unpin from Command" : "Pin to Command"}
            className={`flex h-11 w-11 items-center justify-center rounded-md border ${
              pinned ? "border-amber/50 text-amber" : "border-line text-fog"
            }`}
          >
            <IconPin className="h-4 w-4" filled={pinned} />
          </button>
        ) : null}
      </div>
      <p className="mt-3 text-sm leading-snug text-paper/90">{pizzaSoWhat(pizza)}</p>
      <p className="mt-2 text-sm text-fog">
        Open the public tracker if you want the current reading.
      </p>
      <a
        href={pizza.href}
        target="_blank"
        rel="noreferrer"
        className="mt-4 inline-flex min-h-11 items-center font-mono text-xs tracking-wide text-cyan uppercase"
      >
        Open pizzint.watch →
      </a>
      <p className="mt-2 font-mono text-[10px] text-fog/80">
        External source · {pizza.source}
      </p>
    </article>
  );
}
