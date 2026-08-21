"use client";

import { useState } from "react";
import type { IndicatorSnapshot } from "@/lib/data/types";
import { soWhat } from "@/lib/guidance";
import { readingHint } from "@/lib/indicators/copy";
import { IconPin } from "@/components/shell/icons";
import { Sparkline } from "./Sparkline";
import { StressBadge } from "./StressBadge";

type IndicatorCardProps = {
  indicator: IndicatorSnapshot;
  pinned?: boolean;
  onTogglePin?: () => void;
};

export function IndicatorCard({
  indicator,
  pinned,
  onTogglePin,
}: IndicatorCardProps) {
  const [open, setOpen] = useState(false);

  return (
    <article className="rounded-xl border border-line bg-panel">
      <div className="flex items-start gap-3 p-4">
        <div className="min-w-0 flex-1">
          <div className="flex flex-wrap items-center gap-2">
            <h3 className="text-sm text-paper">{indicator.label}</h3>
            <StressBadge stress={indicator.stress} />
          </div>
          <p className="mt-2 font-mono text-2xl tracking-tight text-paper">
            {indicator.displayValue}
          </p>
          <p className="mt-1 font-mono text-xs text-fog">
            {readingHint(indicator)}
            {indicator.changeLabel ? `  ·  ${indicator.changeLabel}` : ""}
          </p>
          <p className="mt-3 text-sm leading-snug text-paper/90">
            {soWhat(indicator)}
          </p>
        </div>
        <div className="flex flex-col items-end gap-2">
          {onTogglePin ? (
            <button
              type="button"
              onClick={onTogglePin}
              aria-pressed={pinned}
              aria-label={pinned ? "Unpin from Command" : "Pin to Command"}
              className={`flex h-11 w-11 items-center justify-center rounded-md border ${
                pinned
                  ? "border-amber/50 text-amber"
                  : "border-line text-fog hover:text-paper"
              }`}
            >
              <IconPin className="h-4 w-4" filled={pinned} />
            </button>
          ) : null}
          <Sparkline values={indicator.sparkline} tone={indicator.stress} />
        </div>
      </div>

      <div className="border-t border-line px-4 py-2">
        <button
          type="button"
          onClick={() => setOpen((value) => !value)}
          className="min-h-11 text-left font-mono text-xs tracking-wide text-cyan"
        >
          {open ? "Hide source & calculation" : "Source & calculation"}
        </button>
        {open ? (
          <div className="space-y-2 pb-3 text-sm text-fog">
            <p>
              <span className="text-paper">In general: </span>
              {indicator.interpretation}
            </p>
            <p>
              <span className="text-paper">Calc: </span>
              {indicator.calculation}
            </p>
            <p className="font-mono text-xs">
              Source · {indicator.source}
              <br />
              Cadence · {indicator.frequency}
            </p>
          </div>
        ) : null}
      </div>
    </article>
  );
}
