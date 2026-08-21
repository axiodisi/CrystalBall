import { withCache } from "@/lib/data/cache";
import { parseScanParams, runScan } from "@/lib/research/pipeline";
import type { ScanParams } from "@/lib/research/types";

export const maxDuration = 120;

export async function POST(request: Request) {
  let body: Partial<ScanParams> = {};
  try {
    body = (await request.json()) as Partial<ScanParams>;
  } catch {
    body = {};
  }
  const params = parseScanParams(body);
  const force = new URL(request.url).searchParams.get("fresh") === "1";
  const payload = await withCache(
    `scan:${JSON.stringify(params)}`,
    () => runScan(params),
    { ttlMs: 15 * 60 * 1000, force },
  );
  return Response.json(payload);
}
