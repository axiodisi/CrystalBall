"use client";

import { useCallback, useSyncExternalStore } from "react";
import type { AlertEvent, AlertSettings } from "./types";
import { DEFAULT_ALERT_SETTINGS } from "./types";

const ALERTS_KEY = "cb.alerts.session";
const SETTINGS_KEY = "cb.alertSettings";
const LAST_Z_KEY = "cb.live.lastZ";
const EVENT = "cb-alerts";
const EMPTY_ALERTS: AlertEvent[] = [];

let cachedAlertsRaw: string | null | undefined;
let cachedAlerts: AlertEvent[] = EMPTY_ALERTS;
let cachedSettingsRaw: string | null | undefined;
let cachedSettings: AlertSettings = DEFAULT_ALERT_SETTINGS;
let cachedZRaw: string | null | undefined;
let cachedZ: Record<string, number> = {};

function getServerAlertsSnapshot(): AlertEvent[] {
  return EMPTY_ALERTS;
}

function getServerSettingsSnapshot(): AlertSettings {
  return DEFAULT_ALERT_SETTINGS;
}

function parseAlerts(raw: string | null): AlertEvent[] {
  if (!raw) return EMPTY_ALERTS;
  try {
    const parsed = JSON.parse(raw) as unknown;
    if (!Array.isArray(parsed)) return EMPTY_ALERTS;
    return parsed.filter(isAlert);
  } catch {
    return EMPTY_ALERTS;
  }
}

function isAlert(value: unknown): value is AlertEvent {
  if (!value || typeof value !== "object") return false;
  const row = value as AlertEvent;
  return typeof row.id === "string" && typeof row.title === "string";
}

function parseSettings(raw: string | null): AlertSettings {
  if (!raw) return DEFAULT_ALERT_SETTINGS;
  try {
    const parsed = JSON.parse(raw) as Partial<AlertSettings>;
    return {
      notifications:
        typeof parsed.notifications === "boolean"
          ? parsed.notifications
          : DEFAULT_ALERT_SETTINGS.notifications,
      mutedIds: Array.isArray(parsed.mutedIds)
        ? parsed.mutedIds.filter((id) => typeof id === "string")
        : [],
      vixAbove:
        typeof parsed.vixAbove === "number"
          ? parsed.vixAbove
          : DEFAULT_ALERT_SETTINGS.vixAbove,
      brentAbsZ:
        typeof parsed.brentAbsZ === "number"
          ? parsed.brentAbsZ
          : DEFAULT_ALERT_SETTINGS.brentAbsZ,
    };
  } catch {
    return DEFAULT_ALERT_SETTINGS;
  }
}

function parseZ(raw: string | null): Record<string, number> {
  if (!raw) return {};
  try {
    const parsed = JSON.parse(raw) as Record<string, number>;
    return parsed && typeof parsed === "object" ? parsed : {};
  } catch {
    return {};
  }
}

function readAlerts(): AlertEvent[] {
  if (typeof window === "undefined") return [];
  const raw = sessionStorage.getItem(ALERTS_KEY);
  if (raw === cachedAlertsRaw) return cachedAlerts;
  cachedAlertsRaw = raw;
  cachedAlerts = parseAlerts(raw);
  return cachedAlerts;
}

function writeAlerts(next: AlertEvent[]) {
  const raw = JSON.stringify(next.slice(0, 40));
  sessionStorage.setItem(ALERTS_KEY, raw);
  cachedAlertsRaw = raw;
  cachedAlerts = next.slice(0, 40);
  window.dispatchEvent(new Event(EVENT));
}

function readSettings(): AlertSettings {
  if (typeof window === "undefined") return DEFAULT_ALERT_SETTINGS;
  const raw = localStorage.getItem(SETTINGS_KEY);
  if (raw === cachedSettingsRaw) return cachedSettings;
  cachedSettingsRaw = raw;
  cachedSettings = parseSettings(raw);
  return cachedSettings;
}

function writeSettings(next: AlertSettings) {
  const raw = JSON.stringify(next);
  localStorage.setItem(SETTINGS_KEY, raw);
  cachedSettingsRaw = raw;
  cachedSettings = next;
  window.dispatchEvent(new Event(EVENT));
}

export function readLastZ(): Record<string, number> {
  if (typeof window === "undefined") return {};
  const raw = sessionStorage.getItem(LAST_Z_KEY);
  if (raw === cachedZRaw) return cachedZ;
  cachedZRaw = raw;
  cachedZ = parseZ(raw);
  return cachedZ;
}

export function writeLastZ(next: Record<string, number>) {
  const raw = JSON.stringify(next);
  sessionStorage.setItem(LAST_Z_KEY, raw);
  cachedZRaw = raw;
  cachedZ = next;
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

function notifyBrowser(title: string, body: string) {
  if (typeof window === "undefined") return;
  if (!readSettings().notifications) return;
  if (!("Notification" in window)) return;
  if (Notification.permission !== "granted") return;
  try {
    new Notification(title, { body, icon: "/icon-192.png" });
  } catch {
    // ignore blocked or insecure contexts
  }
}

export function raiseAlert(
  event: Omit<AlertEvent, "id" | "createdAt" | "acked">,
) {
  const settings = readSettings();
  if (settings.mutedIds.includes(event.pairId)) return;
  const current = readAlerts();
  const duplicate = current.some(
    (item) =>
      !item.acked &&
      item.pairId === event.pairId &&
      item.kind === event.kind &&
      Date.now() - Date.parse(item.createdAt) < 5 * 60 * 1000,
  );
  if (duplicate) return;
  const next: AlertEvent = {
    ...event,
    id: `${event.pairId}-${event.kind}-${Date.now()}`,
    createdAt: new Date().toISOString(),
    acked: false,
  };
  writeAlerts([next, ...current]);
  notifyBrowser(event.title, event.body);
}

export function useAlerts() {
  const alerts = useSyncExternalStore(
    subscribe,
    readAlerts,
    getServerAlertsSnapshot,
  );
  const settings = useSyncExternalStore(
    subscribe,
    readSettings,
    getServerSettingsSnapshot,
  );

  const dismiss = useCallback((id: string) => {
    writeAlerts(
      readAlerts().map((item) =>
        item.id === id ? { ...item, acked: true } : item,
      ),
    );
  }, []);

  const dismissAll = useCallback(() => {
    writeAlerts(readAlerts().map((item) => ({ ...item, acked: true })));
  }, []);

  const setNotifications = useCallback((notifications: boolean) => {
    writeSettings({ ...readSettings(), notifications });
  }, []);

  const toggleMute = useCallback((pairId: string) => {
    const current = readSettings();
    const mutedIds = current.mutedIds.includes(pairId)
      ? current.mutedIds.filter((id) => id !== pairId)
      : [...current.mutedIds, pairId];
    writeSettings({ ...current, mutedIds });
  }, []);

  const requestPermission = useCallback(async () => {
    if (!("Notification" in window)) return "denied";
    const result = await Notification.requestPermission();
    if (result === "granted") {
      writeSettings({ ...readSettings(), notifications: true });
    }
    return result;
  }, []);

  const open = alerts.filter((item) => !item.acked);

  return {
    alerts,
    open,
    settings,
    dismiss,
    dismissAll,
    setNotifications,
    toggleMute,
    requestPermission,
    isMuted: (id: string) => settings.mutedIds.includes(id),
  };
}
