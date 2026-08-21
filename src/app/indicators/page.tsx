import { IndicatorCatalog } from "@/components/indicators/IndicatorCatalog";
import { getIndicatorsPayload } from "@/lib/data/indicators";

export const dynamic = "force-dynamic";

export const metadata = {
  title: "Indicators",
};

export default async function IndicatorsPage() {
  const data = await getIndicatorsPayload();
  return <IndicatorCatalog data={data} />;
}
