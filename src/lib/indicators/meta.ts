import type { IndicatorCategory } from "@/lib/data/types";

export type IndicatorMeta = {
  id: string;
  label: string;
  shortLabel: string;
  category: IndicatorCategory;
  source: string;
  calculation: string;
  frequency: string;
  interpretation: string;
  glance: string;
  defaultPinned: boolean;
};

export const INDICATOR_META: Record<string, IndicatorMeta> = {
  "brent-wti": {
    id: "brent-wti",
    label: "Brent–WTI spread",
    shortLabel: "Brent–WTI",
    category: "spread",
    source: "Yahoo Finance / Stooq fallback (BZ=F − CL=F)",
    calculation:
      "Daily close of Brent minus WTI. Z-score uses the last 60 aligned trading days.",
    frequency: "EOD + ~15 min refresh during market hours",
    interpretation:
      "Widening often reflects geopolitical / supply-chain stress on global (Brent) vs US (WTI) crude.",
    glance: "Wider = more global vs US crude stress",
    defaultPinned: true,
  },
  "rsp-spy": {
    id: "rsp-spy",
    label: "RSP / SPY ratio",
    shortLabel: "RSP/SPY",
    category: "spread",
    source: "Yahoo Finance / Stooq fallback (RSP, SPY)",
    calculation:
      "RSP close ÷ SPY close. Short-term z-score uses the last 20 trading days.",
    frequency: "EOD + ~15 min refresh during market hours",
    interpretation:
      "Rising ratio = broader market participation; falling = mega-cap dominated.",
    glance: "Up = broader market; down = mega-caps lead",
    defaultPinned: true,
  },
  vix: {
    id: "vix",
    label: "VIX",
    shortLabel: "VIX",
    category: "volatility",
    source: "Yahoo Finance / Stooq fallback (^VIX)",
    calculation:
      "VIX level (annualized implied vol, not an equity return). Implied daily S&P move ≈ VIX / 16. The 5-day figure is the change in the VIX index itself — not an S&P 5-day return.",
    frequency: "EOD + ~15 min refresh during market hours",
    interpretation:
      "Elevated VIX means options are pricing larger typical daily S&P swings (roughly VIX ÷ 16). A big 5-day VIX move is the vol index changing, not the stock market crashing by that percent.",
    glance: "Level + implied daily S&P move (VIX/16). 5d is VIX, not S&P",
    defaultPinned: true,
  },
  gold: {
    id: "gold",
    label: "Gold",
    shortLabel: "Gold",
    category: "macro",
    source: "Yahoo Finance / Stooq fallback (GC=F)",
    calculation: "Front-month gold futures close and recent percent change.",
    frequency: "EOD + ~15 min refresh during market hours",
    interpretation:
      "Gold is a safe-haven / inflation hedge; large moves often travel with risk-off or dollar stress.",
    glance: "Safe-haven / inflation hedge",
    defaultPinned: true,
  },
  dxy: {
    id: "dxy",
    label: "US Dollar Index",
    shortLabel: "DXY",
    category: "macro",
    source: "Yahoo Finance / Stooq fallback (DX-Y.NYB)",
    calculation: "DXY close and recent percent change.",
    frequency: "EOD + ~15 min refresh during market hours",
    interpretation:
      "A stronger dollar tightens global financial conditions; a weaker dollar often supports gold and commodities.",
    glance: "Stronger dollar = tighter global conditions",
    defaultPinned: false,
  },
};

export const DEFAULT_PINNED_IDS = Object.values(INDICATOR_META)
  .filter((item) => item.defaultPinned)
  .map((item) => item.id)
  .concat("pizza");

export const CATEGORY_LABEL: Record<IndicatorCategory, string> = {
  spread: "Spread / Breadth",
  volatility: "Volatility & Risk",
  macro: "Safe-haven / Macro",
  alternative: "Alternative / OSINT",
};

export const PIZZA_META = {
  id: "pizza" as const,
  label: "Pentagon Pizza",
  status: "Not scraped live",
  source: "pizzint.watch (public OSINT tracker)",
  href: "https://pizzint.watch",
  frequency: "External — check on demand",
  glance: "Weak / noisy OSINT — not a CrystalBall feed",
  interpretation:
    "Elevated late-night activity near the Pentagon is a noisy historical proxy for high operational tempo. Treat as a weak confirmatory signal only.",
};
