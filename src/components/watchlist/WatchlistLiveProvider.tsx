"use client";

import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useRef,
  useState,
  type ReactNode,
} from "react";
import { evaluateLiveAlerts } from "@/lib/watchlist/evaluate";
import { useAlerts } from "@/lib/watchlist/alerts";
import { useWatchlist } from "@/lib/watchlist/store";
import type { LiveItem, LiveResponse } from "@/lib/watchlist/types";

type LiveContextValue = {
  live: LiveItem[];
  standing: LiveItem[];
  promotedLive: LiveItem[];
  loading: boolean;
  error: string | null;
  updatedAt: string | null;
  refresh: () => void;
};

const LiveContext = createContext<LiveContextValue | null>(null);

export function WatchlistLiveProvider({ children }: { children: ReactNode }) {
  const { items } = useWatchlist();
  const { settings } = useAlerts();
  const [payload, setPayload] = useState<LiveResponse | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [tick, setTick] = useState(0);
  const settingsRef = useRef(settings);
  const itemsRef = useRef(items);

  useEffect(() => {
    settingsRef.current = settings;
    itemsRef.current = items;
  }, [settings, items]);

  const pairKey = items
    .map(
      (item) =>
        `${item.id}:${item.beta}:${item.lookbackDays}:${item.entryZ}:${item.exitZ}`,
    )
    .join(",");

  useEffect(() => {
    let cancelled = false;
    const controller = new AbortController();

    fetch("/api/watchlist/live", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        pairs: itemsRef.current.map((item) => ({
          id: item.id,
          tickerA: item.tickerA,
          tickerB: item.tickerB,
          nameA: item.nameA,
          nameB: item.nameB,
          beta: item.beta,
          lookbackDays: item.lookbackDays,
        })),
      }),
      signal: controller.signal,
    })
      .then(async (response) => {
        if (!response.ok) throw new Error(`Live feed ${response.status}`);
        return (await response.json()) as LiveResponse;
      })
      .then((json) => {
        if (cancelled) return;
        setPayload(json);
        setError(null);
        setLoading(false);
        evaluateLiveAlerts(json, itemsRef.current, settingsRef.current);
      })
      .catch((err: unknown) => {
        if (cancelled) return;
        if (err instanceof DOMException && err.name === "AbortError") return;
        setError(err instanceof Error ? err.message : "Live feed failed");
        setLoading(false);
      });

    return () => {
      cancelled = true;
      controller.abort();
    };
  }, [pairKey, tick]);

  const refresh = useCallback(() => {
    setLoading(true);
    setTick((value) => value + 1);
  }, []);

  const value = useMemo<LiveContextValue>(() => {
    const all = payload?.items ?? [];
    return {
      live: all,
      standing: all.filter((item) => item.kind === "standing"),
      promotedLive: all.filter((item) => item.kind === "promoted"),
      loading: loading && !payload,
      error,
      updatedAt: payload?.updatedAt ?? null,
      refresh,
    };
  }, [payload, loading, error, refresh]);

  return <LiveContext.Provider value={value}>{children}</LiveContext.Provider>;
}

export function useLiveWatch() {
  const value = useContext(LiveContext);
  if (!value) {
    throw new Error("useLiveWatch must be used inside WatchlistLiveProvider");
  }
  return value;
}
