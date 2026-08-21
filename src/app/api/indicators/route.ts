import { getIndicatorsPayload } from "@/lib/data/indicators";

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const force = searchParams.get("fresh") === "1";
  const payload = await getIndicatorsPayload({ force });
  return Response.json(payload);
}
