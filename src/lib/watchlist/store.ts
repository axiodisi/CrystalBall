"use client";

import { useCallback, useSyncExternalStore } from "react";
import type { PairSummary, PromotedPair } from "@/lib/research/types";
import { DEFAULT_ENTRY_Z, DEFAULT_EXIT_Z } from "@/lib/research/types";

const STORAGE_KEY = "cb.watchlist";
const EVENT = "cb-watchlist";
const EMPTY: PromotedPair[] = [];

let cachedRaw: string | null | undefined;
let cached: PromotedPair[] = EMPTY;

function getServerSnapshot(): PromotedPair[] {
  return EMPTY;
}

function parseList(raw: string | null): PromotedPair[] {
  if (!raw) return EMPTY;
  try {
    const parsed = JSON.parse(raw) as unknown;
    if (!Array.isArray(parsed)) return [];
    return parsed.filter(isPromoted);
  } catch {
    return [];
  }
}

function isPromoted(value: unknown): value is PromotedPair {
  if (!value || typeof value !== "object") return false;
  const row = value as PromotedPair;
  return (
    typeof row.id === "string" &&
    typeof row.tickerA === "string" &&
    typeof row.tickerB === "string" &&
    typeof row.beta === "number"
  );
}

function readList(): PromotedPair[] {
  const raw = localStorage.getItem(STORAGE_KEY);
  if (raw === cachedRaw) return cached;
  cachedRaw = raw;
  cached = parseList(raw);
  return cached;
}

function writeList(next: PromotedPair[]) {
  const raw = JSON.stringify(next);
  localStorage.setItem(STORAGE_KEY, raw);
  cachedRaw = raw;
  cached = next;
  window.dispatchEvent(new Event(EVENT));
}

function subscribe(onStoreChange: () => void) {
  const handler = () => onStoreChange();
  window.addEventListener("storage", handler);
  window.addEventListener(EVENT, handler);
  return () => {
    window.removeEventListener("storage", handler);
    window.removeEventListener(EVENT, handler);
  };
}

function pairId(a: string, b: string) {
  return `${a}|${b}`;
}

export function toPromoted(
  pair: PairSummary,
  notes = "",
): PromotedPair {
  return {
    id: pairId(pair.tickerA, pair.tickerB),
    tickerA: pair.tickerA,
    tickerB: pair.tickerB,
    nameA: pair.nameA,
    nameB: pair.nameB,
    beta: pair.beta,
    alpha: pair.alpha,
    lookbackDays: pair.lookbackDays,
    corrLookbackDays: pair.corrLookbackDays,
    entryZ: DEFAULT_ENTRY_Z,
    exitZ: DEFAULT_EXIT_Z,
    notes,
    adfPValue: pair.adfPValue,
    halfLife: pair.halfLife ?? 0,
    correlation: pair.correlation,
    score: pair.score,
    promotedAt: new Date().toISOString(),
  };
}

export function useWatchlist() {
  const items = useSyncExternalStore(subscribe, readList, getServerSnapshot);

  const promote = useCallback((pair: PairSummary, notes = "") => {
    const nextItem = toPromoted(pair, notes);
    const current = readList();
    const next = [
      nextItem,
      ...current.filter((item) => item.id !== nextItem.id),
    ];
    writeList(next);
    return nextItem;
  }, []);

  const remove = useCallback((id: string) => {
    writeList(readList().filter((item) => item.id !== id));
  }, []);

  const update = useCallback((id: string, patch: Partial<PromotedPair>) => {
    writeList(
      readList().map((item) =>
        item.id === id ? { ...item, ...patch, id: item.id } : item,
      ),
    );
  }, []);

  return {
    items,
    promote,
    remove,
    update,
    has: (a: string, b: string) =>
      items.some((item) => item.id === pairId(a, b)),
  };
}
