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
  outcomePrices?: string;
  oneDayPriceChange?: number;
  volume?: number | string;
  volume24hr?: number | string;
  slug?: string;
};

type GammaEvent = {
  id?: string;
  title?: string;
  slug?: string;
  volume24hr?: number | string;
  markets?: GammaMarket[];
};

function parsePrices(raw: string | undefined): number | null {
  if (!raw) return null;
  try {
    const parsed = JSON.parse(raw) as unknown;
    if (!Array.isArray(parsed) || parsed.length === 0) return null;
    const first = Number(parsed[0]);
    return Number.isFinite(first) ? first : null;
  } catch {
    return null;
  }
}

function toNumber(value: number | string | undefined): number | null {
  if (value === undefined) return null;
  const n = typeof value === "number" ? value : Number(value);
  return Number.isFinite(n) ? n : null;
}

function toCard(event: GammaEvent): PolymarketCard | null {
  const market = event.markets?.[0];
  const question = market?.question ?? event.title;
  if (!question) return null;
  const slug = market?.slug ?? event.slug;
  return {
    id: `poly-${event.id ?? slug ?? question.slice(0, 24)}`,
    question,
    probability: parsePrices(market?.outcomePrices),
    change24h: toNumber(market?.oneDayPriceChange),
    volume: toNumber(market?.volume24hr) ?? toNumber(market?.volume),
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

    const cards = events
      .map(toCard)
      .filter((card): card is PolymarketCard => card !== null);

    const preferred = cards.filter((card) => PREFERRED.test(card.question));
    const rest = cards.filter((card) => !PREFERRED.test(card.question));
    const ranked = [...preferred, ...rest].slice(0, 4);
    return ranked.length > 0 ? ranked : FALLBACK;
  } catch {
    return FALLBACK;
  }
}
