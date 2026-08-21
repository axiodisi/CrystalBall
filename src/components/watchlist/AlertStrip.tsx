"use client";

import { formatClock } from "@/lib/format";
import { useAlerts } from "@/lib/watchlist/alerts";

export function AlertStrip() {
  const { open, dismiss, dismissAll } = useAlerts();
  if (open.length === 0) return null;
  const latest = open.slice(0, 2);

  return (
    <section className="rounded-xl border border-amber/40 bg-amber/10 p-4">
      <div className="flex items-center justify-between gap-3">
        <p className="font-mono text-[10px] tracking-[0.2em] text-amber uppercase">
          {open.length} active alert{open.length === 1 ? "" : "s"}
        </p>
        <button
          type="button"
          onClick={dismissAll}
          className="min-h-10 text-xs text-fog"
        >
          Dismiss all
        </button>
      </div>
      <ul className="mt-3 space-y-2">
        {latest.map((item) => (
          <li key={item.id} className="flex items-start justify-between gap-3">
            <div>
              <p className="text-sm text-paper">{item.title}</p>
              <p className="text-xs text-fog">{item.body}</p>
              <p className="mt-1 font-mono text-[10px] text-fog">
                {formatClock(item.createdAt)}
              </p>
            </div>
            <button
              type="button"
              onClick={() => dismiss(item.id)}
              className="min-h-10 shrink-0 text-xs text-cyan"
            >
              Dismiss
            </button>
          </li>
        ))}
      </ul>
    </section>
  );
}
