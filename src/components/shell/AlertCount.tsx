"use client";

import { useAlerts } from "@/lib/watchlist/alerts";

export function AlertCount({ compact = false }: { compact?: boolean }) {
  const { open } = useAlerts();
  if (open.length === 0) return null;
  if (compact) {
    return (
      <span className="absolute -right-2 -top-1 min-w-4 rounded-full bg-rose px-1 text-center font-mono text-[9px] text-paper">
        {open.length}
      </span>
    );
  }
  return (
    <span className="rounded-full bg-rose/20 px-1.5 font-mono text-[10px] text-rose">
      {open.length}
    </span>
  );
}
