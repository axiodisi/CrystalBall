"use client";

import { useEffect, useState } from "react";
import type { IndicatorsPayload } from "@/lib/data/types";
import { classifyRegime, type RegimeReading } from "@/lib/guidance";

let inflight: Promise<IndicatorsPayload> | null = null;
let memo: { data: IndicatorsPayload; at: number } | null = null;
const TTL_MS = 60_000;

function loadTape(): Promise<IndicatorsPayload> {
  if (memo && Date.now() - memo.at < TTL_MS) {
    return Promise.resolve(memo.data);
  }
  if (!inflight) {
    inflight = fetch("/api/indicators")
      .then(async (response) => {
        if (!response.ok) throw new Error(`Indicators ${response.status}`);
        return (await response.json()) as IndicatorsPayload;
      })
      .then((data) => {
        memo = { data, at: Date.now() };
        inflight = null;
        return data;
      })
      .catch((error: unknown) => {
        inflight = null;
        throw error;
      });
  }
  return inflight;
}

export function useTape(): {
  reading: RegimeReading | null;
  loading: boolean;
} {
  const [reading, setReading] = useState<RegimeReading | null>(() =>
    memo ? classifyRegime(memo.data.indicators) : null,
  );
  const [loading, setLoading] = useState(!memo);

  useEffect(() => {
    let cancelled = false;
    loadTape()
      .then((data) => {
        if (cancelled) return;
        setReading(classifyRegime(data.indicators));
        setLoading(false);
      })
      .catch(() => {
        if (cancelled) return;
        setReading({
          regime: "unknown",
          points: 0,
          available: 0,
          drivers: [],
        });
        setLoading(false);
      });
    return () => {
      cancelled = true;
    };
  }, []);

  return { reading, loading };
}
