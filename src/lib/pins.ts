"use client";

import { useCallback, useSyncExternalStore } from "react";
import { DEFAULT_PINNED_IDS } from "@/lib/indicators/meta";

const STORAGE_KEY = "cb.pinned";
const EVENT = "cb-pins";

let cachedRaw: string | null | undefined;
let cachedPins: string[] = DEFAULT_PINNED_IDS;

function parsePins(raw: string | null): string[] {
  if (!raw) return DEFAULT_PINNED_IDS;
  try {
    const parsed = JSON.parse(raw) as unknown;
    if (Array.isArray(parsed) && parsed.every((id) => typeof id === "string")) {
      return parsed;
    }
  } catch {
    // keep defaults
  }
  return DEFAULT_PINNED_IDS;
}

function readPins(): string[] {
  const raw = localStorage.getItem(STORAGE_KEY);
  if (raw === cachedRaw) return cachedPins;
  cachedRaw = raw;
  cachedPins = parsePins(raw);
  return cachedPins;
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

function getServerSnapshot() {
  return DEFAULT_PINNED_IDS;
}

export function usePins() {
  const pins = useSyncExternalStore(subscribe, readPins, getServerSnapshot);

  const toggle = useCallback((id: string) => {
    const current = readPins();
    const next = current.includes(id)
      ? current.filter((item) => item !== id)
      : [...current, id];
    localStorage.setItem(STORAGE_KEY, JSON.stringify(next));
    cachedRaw = JSON.stringify(next);
    cachedPins = next;
    window.dispatchEvent(new Event(EVENT));
  }, []);

  return {
    pins,
    toggle,
    isPinned: (id: string) => pins.includes(id),
  };
}
