import { CommandOverview } from "@/components/command/CommandOverview";
import { getIndicatorsPayload } from "@/lib/data/indicators";

export const dynamic = "force-dynamic";

export const metadata = {
  title: "Command",
};

export default async function HomePage() {
  const data = await getIndicatorsPayload();
  return <CommandOverview data={data} />;
}
