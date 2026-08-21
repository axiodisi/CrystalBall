import type { PolymarketCard } from "./types";

const GAMMA_URL =
  "https://gamma-api.polymarket.com/events?closed=false&limit=16&order=volume24hr&ascending=false";

const PREFERRED =
  /trump|war|tariff|china|fed|rate|oil|iran|israel|election|recession|nato|ukraine|trade/i;

const FALLBACK: PolymarketCard[] = [
  {
    id: "poly-mock-fed",
    question: "Fed cuts rates before year-end?",
    probability: 0.62,
    change24h: -0.03,
    volume: 1_200_000,
    url: "https://polymarket.com",
    available: false,
  },
  {
    id: "poly-mock-trade",
    question: "US–China trade deal this year?",
    probability: 0.28,
    change24h: 0.02,
    volume: 840_000,
    url: "https://polymarket.com",
    available: false,
  },
];

type GammaMarket = {
  question?: string;
  groupItemTitle?: string;
  outcomes?: string | string[];
  outcomePrices?: string | string[] | number[];
  oneDayPriceChange?: number;
  volume?: number | string;
  volume24hr?: number | string;
  slug?: string;
  closed?: boolean | string;
  active?: boolean | string;
  archived?: boolean | string;
  ended?: boolean | string;
  endDate?: string;
};

type GammaEvent = {
  id?: string;
  title?: string;
  slug?: string;
  closed?: boolean | string;
  active?: boolean | string;
  ended?: boolean | string;
  endDate?: string;
  volume24hr?: number | string;
  markets?: GammaMarket[];
};

function isTrue(value: unknown): boolean {
  return value === true || value === "true";
}

function isFalse(value: unknown): boolean {
  return value === false || value === "false";
}

function toNumber(value: number | string | undefined): number | null {
  if (value === undefined) return null;
  const n = typeof value === "number" ? value : Number(value);
  return Number.isFinite(n) ? n : null;
}

function asList(raw: unknown): unknown[] {
  if (Array.isArray(raw)) return raw;
  if (typeof raw === "string") {
    try {
      const parsed = JSON.parse(raw) as unknown;
      return Array.isArray(parsed) ? parsed : [];
    } catch {
      return [];
    }
  }
  return [];
}

function parsePrices(raw: unknown): number[] {
  return asList(raw)
    .map((value) => Number(value))
    .filter((value) => Number.isFinite(value));
}

function cleanText(value: string | undefined): string {
  return value?.replace(/\s+/g, " ").trim() ?? "";
}

function yearsIn(text: string): number[] {
  return [...text.matchAll(/\b(20\d{2})\b/g)].map((match) => Number(match[1]));
}

/** True when the only years in the label are already in the past. Does not invent dates. */
function hasPastYearLabel(text: string, now: Date): boolean {
  const years = yearsIn(text);
  if (years.length === 0) return false;
  return years.every((year) => year < now.getUTCFullYear());
}

function isPast(iso: string | undefined, now: number): boolean {
  if (!iso) return false;
  const t = Date.parse(iso);
  return Number.isFinite(t) && t < now;
}

function isExpiredMarket(market: GammaMarket, now: Date): boolean {
  if (isTrue(market.closed) || isTrue(market.archived) || isTrue(market.ended)) {
    return true;
  }
  if (isFalse(market.active)) return true;
  if (isPast(market.endDate, now.getTime())) return true;
  const label = [market.question, market.groupItemTitle, market.slug]
    .filter(Boolean)
    .join(" ");
  return hasPastYearLabel(label, now);
}

function isExpiredEvent(event: GammaEvent): boolean {
  if (isTrue(event.closed) || isTrue(event.ended)) return true;
  if (isFalse(event.active)) return true;
  return false;
}

function joinTitle(eventTitle: string, group: string): string {
  const placeholder = eventTitle.replace(/\s*\.\.\.\s*\??\s*$/, "").trim();
  if (placeholder !== eventTitle.trim() && /by$/i.test(placeholder)) {
    return `${placeholder} ${group}`;
  }
  return `${eventTitle} — ${group}`;
}

function isDateishLabel(text: string): boolean {
  return /\b(jan(?:uary)?|feb(?:ruary)?|mar(?:ch)?|apr(?:il)?|may|jun(?:e)?|jul(?:y)?|aug(?:ust)?|sep(?:t(?:ember)?)?|oct(?:ober)?|nov(?:ember)?|dec(?:ember)?)\b/i.test(
    text,
  );
}

function pickLiveMarket(
  event: GammaEvent,
  markets: GammaMarket[],
  now: Date,
): GammaMarket | null {
  const live = markets.filter((market) => !isExpiredMarket(market, now));
  if (live.length === 0) return null;

  const dateish = live.filter((market) =>
    isDateishLabel(cleanText(market.groupItemTitle) || cleanText(market.question)),
  );
  const pool = dateish.length > 0 ? dateish : live;

  const ranked = [...pool].sort((a, b) => {
    const aMain = event.slug && a.slug === event.slug ? 1 : 0;
    const bMain = event.slug && b.slug === event.slug ? 1 : 0;
    if (aMain !== bMain) return bMain - aMain;

    if (dateish.length > 0) {
      const aEnd = a.endDate ? Date.parse(a.endDate) : Number.POSITIVE_INFINITY;
      const bEnd = b.endDate ? Date.parse(b.endDate) : Number.POSITIVE_INFINITY;
      if (aEnd !== bEnd) return aEnd - bEnd;
    }

    const aYes = parsePrices(a.outcomePrices)[0] ?? 0;
    const bYes = parsePrices(b.outcomePrices)[0] ?? 0;
    if (aYes !== bYes) return bYes - aYes;

    const aVol = toNumber(a.volume24hr) ?? toNumber(a.volume) ?? 0;
    const bVol = toNumber(b.volume24hr) ?? toNumber(b.volume) ?? 0;
    return bVol - aVol;
  });

  return ranked[0] ?? null;
}

function cardQuestion(
  event: GammaEvent,
  market: GammaMarket,
  liveCount: number,
  now: Date,
): string | null {
  const eventTitle = cleanText(event.title);
  const question = cleanText(market.question);
  const group = cleanText(market.groupItemTitle);

  if (eventTitle && hasPastYearLabel(eventTitle, now)) {
    // Event title still says e.g. 2025; use the live market's own question instead.
    return question || group || null;
  }

  if (liveCount > 1 && eventTitle) {
    if (group && group.toLowerCase() !== eventTitle.toLowerCase()) {
      return joinTitle(eventTitle, group);
    }
    return eventTitle;
  }

  return question || eventTitle || group || null;
}

function toCard(event: GammaEvent, now: Date): PolymarketCard | null {
  if (isExpiredEvent(event)) return null;

  const markets = event.markets ?? [];
  const live = markets.filter((market) => !isExpiredMarket(market, now));
  const market = pickLiveMarket(event, markets, now);
  if (!market) return null;

  const question = cardQuestion(event, market, live.length, now);
  if (!question) return null;

  const prices = parsePrices(market.outcomePrices);
  if (prices.length === 0) return null;

  const slug = event.slug || market.slug;
  return {
    id: `poly-${event.id ?? slug ?? question.slice(0, 24)}`,
    question,
    probability: prices[0],
    change24h: toNumber(market.oneDayPriceChange),
    volume: toNumber(market.volume24hr) ?? toNumber(market.volume),
    url: slug
      ? `https://polymarket.com/event/${slug}`
      : "https://polymarket.com",
    available: true,
  };
}

export async function fetchPolymarketCards(): Promise<PolymarketCard[]> {
  try {
    const response = await fetch(GAMMA_URL, {
      headers: { Accept: "application/json" },
      signal: AbortSignal.timeout(8000),
    });
    if (!response.ok) {
      return FALLBACK;
    }
    const events = (await response.json()) as GammaEvent[];
    if (!Array.isArray(events) || events.length === 0) {
      return FALLBACK;
    }

    const now = new Date();
    const cards = events
      .map((event) => toCard(event, now))
      .filter((card): card is PolymarketCard => card !== null);

    const preferred = cards.filter((card) => PREFERRED.test(card.question));
    const rest = cards.filter((card) => !PREFERRED.test(card.question));
    const ranked = [...preferred, ...rest].slice(0, 4);
    return ranked.length > 0 ? ranked : FALLBACK;
  } catch {
    return FALLBACK;
  }
}
