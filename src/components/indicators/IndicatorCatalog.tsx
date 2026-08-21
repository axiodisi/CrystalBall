"use client";

import { PizzaCard } from "@/components/indicators/PizzaCard";
import { PolymarketCard } from "@/components/indicators/PolymarketCard";
import type { IndicatorsPayload } from "@/lib/data/types";
import { formatClock } from "@/lib/format";
import { CATEGORY_LABEL } from "@/lib/indicators/meta";
import { usePins } from "@/lib/pins";
import { IndicatorCard } from "./IndicatorCard";

const ORDER = ["spread", "volatility", "macro", "alternative"] as const;

type IndicatorCatalogProps = {
  data: IndicatorsPayload;
};

export function IndicatorCatalog({ data }: IndicatorCatalogProps) {
  const { isPinned, toggle } = usePins();

  return (
    <div className="space-y-8">
      <section>
        <p className="font-mono text-[10px] tracking-[0.28em] text-amber uppercase">
          Indicators
        </p>
        <h1 className="mt-1 text-2xl tracking-tight">Intelligence catalog</h1>
        <p className="mt-2 max-w-2xl text-sm text-fog">
          Observable signals only — no invented composite war scores. Each card
          states what the reading means. Pin anything you want on Command.
        </p>
        <p className="mt-2 font-mono text-xs text-fog">
          Last refresh {formatClock(data.updatedAt)}
        </p>
        <div className="tape-scan mt-4 h-px bg-line" />
      </section>

      {ORDER.map((category) => {
        const items = data.indicators.filter((item) => item.category === category);
        if (items.length === 0 && category !== "alternative") return null;

        return (
          <section key={category} className="space-y-3">
            <h2 className="text-sm tracking-wide text-fog uppercase">
              {CATEGORY_LABEL[category]}
            </h2>
            <div className="grid gap-3 lg:grid-cols-2">
              {items.map((item) => (
                <IndicatorCard
                  key={item.id}
                  indicator={item}
                  pinned={isPinned(item.id)}
                  onTogglePin={() => toggle(item.id)}
                />
              ))}
              {category === "alternative" ? (
                <>
                  <PizzaCard
                    pizza={data.pizza}
                    pinned={isPinned("pizza")}
                    onTogglePin={() => toggle("pizza")}
                  />
                  {data.polymarket.map((market) => (
                    <PolymarketCard
                      key={market.id}
                      market={market}
                      pinned={isPinned(market.id)}
                      onTogglePin={() => toggle(market.id)}
                    />
                  ))}
                </>
              ) : null}
            </div>
          </section>
        );
      })}
    </div>
  );
}
