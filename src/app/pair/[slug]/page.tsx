import { notFound } from "next/navigation";
import { PairProfile } from "@/components/research/PairProfile";
import { parsePairSlug } from "@/lib/research/profile";

export const dynamic = "force-dynamic";

export async function generateMetadata({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;
  const parsed = parsePairSlug(slug);
  if (!parsed) return { title: "Pair profile" };
  return { title: `${parsed.a} / ${parsed.b}` };
}

export default async function PairProfilePage({
  params,
  searchParams,
}: {
  params: Promise<{ slug: string }>;
  searchParams: Promise<{ lookback?: string }>;
}) {
  const { slug } = await params;
  const query = await searchParams;
  const parsed = parsePairSlug(slug);
  if (!parsed) notFound();

  const lookback = Number(query.lookback);
  return (
    <PairProfile
      tickerA={parsed.a}
      tickerB={parsed.b}
      lookback={Number.isFinite(lookback) && lookback > 0 ? lookback : 90}
    />
  );
}
