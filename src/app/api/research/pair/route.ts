import { describePair } from "@/lib/research/pipeline";

export const maxDuration = 30;

export async function GET(request: Request) {
  const url = new URL(request.url);
  const tickerA = url.searchParams.get("a")?.toUpperCase();
  const tickerB = url.searchParams.get("b")?.toUpperCase();
  const lookback = Number(url.searchParams.get("lookback") ?? 90);
  if (!tickerA || !tickerB) {
    return Response.json({ error: "Missing tickers" }, { status: 400 });
  }
  const detail = await describePair(
    tickerA,
    tickerB,
    Number.isFinite(lookback) ? lookback : 90,
  );
  if (!detail) {
    return Response.json(
      { error: "Not enough overlapping history to diagnose this pair." },
      { status: 404 },
    );
  }
  return Response.json(detail);
}
