import { fetchHistories } from "@/lib/research/quotes";
import type { PromotedPair } from "@/lib/research/types";
import { computeBetaLive, computeSimpleLive } from "@/lib/watchlist/live";
import type { LiveItem, LiveResponse } from "@/lib/watchlist/types";

export const maxDuration = 60;

type LiveRequest = {
  pairs?: Array<
    Pick<
      PromotedPair,
      "id" | "tickerA" | "tickerB" | "nameA" | "nameB" | "beta" | "lookbackDays"
    >
  >;
  detailId?: string;
};

export async function POST(request: Request) {
  let body: LiveRequest = {};
  try {
    body = (await request.json()) as LiveRequest;
  } catch {
    body = {};
  }

  const pairs = Array.isArray(body.pairs) ? body.pairs : [];
  const symbols = new Set<string>(["BZ=F", "CL=F", "RSP", "SPY", "^VIX"]);
  for (const pair of pairs) {
    symbols.add(pair.tickerA);
    symbols.add(pair.tickerB);
  }

  const quotes = await fetchHistories([...symbols]);

  const items: LiveItem[] = pairs.map((pair) =>
    computeBetaLive(
      pair.id,
      pair.tickerA,
      pair.tickerB,
      pair.nameA,
      pair.nameB,
      pair.beta,
      pair.lookbackDays,
      quotes[pair.tickerA],
      quotes[pair.tickerB],
      body.detailId === pair.id,
    ),
  );

  items.unshift(
    computeSimpleLive(
      "standing:brent-wti",
      "BZ=F",
      "CL=F",
      "Brent",
      "WTI",
      60,
      quotes["BZ=F"],
      quotes["CL=F"],
      (brent, wti) => brent - wti,
    ),
    computeSimpleLive(
      "standing:rsp-spy",
      "RSP",
      "SPY",
      "RSP",
      "SPY",
      20,
      quotes.RSP,
      quotes.SPY,
      (rsp, spy) => rsp / spy,
    ),
  );

  const vix = quotes["^VIX"]?.last ?? null;
  const brent = items.find((item) => item.id === "standing:brent-wti");

  const payload: LiveResponse = {
    updatedAt: new Date().toISOString(),
    items,
    signals: {
      vix,
      brentZ: brent?.z ?? null,
    },
  };

  return Response.json(payload);
}
