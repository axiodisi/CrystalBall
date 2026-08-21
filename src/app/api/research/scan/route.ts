import { withCache } from "@/lib/data/cache";
import { parseScanParams, runScan } from "@/lib/research/pipeline";
import {
  ScanTimeoutError,
  scanBudgetMs,
  type ScanParams,
} from "@/lib/research/types";

export const maxDuration = 120;

function isTimeout(err: unknown): err is ScanTimeoutError {
  return (
    err instanceof ScanTimeoutError ||
    (err instanceof Error && err.name === "ScanTimeoutError")
  );
}

function withDeadline<T>(promise: Promise<T>, ms: number, onTimeout: () => Error): Promise<T> {
  let timer: ReturnType<typeof setTimeout> | undefined;
  const timeout = new Promise<never>((_, reject) => {
    timer = setTimeout(() => reject(onTimeout()), ms);
  });
  return Promise.race([promise, timeout]).finally(() => {
    if (timer) clearTimeout(timer);
  });
}

export async function POST(request: Request) {
  let body: Partial<ScanParams> = {};
  try {
    body = (await request.json()) as Partial<ScanParams>;
  } catch {
    body = {};
  }

  const params = parseScanParams(body);
  const force = new URL(request.url).searchParams.get("fresh") === "1";
  const budgetMs = scanBudgetMs(params.universe);

  try {
    const payload = await withDeadline(
      withCache(`scan:${JSON.stringify(params)}`, () => runScan(params), {
        ttlMs: 15 * 60 * 1000,
        force,
      }),
      budgetMs,
      () =>
        new ScanTimeoutError(
          params.universe === "sp500"
            ? "Full S&P scan timed out. Try the liquid core (default) or a single sector."
            : "Scan timed out. The last good results are unchanged.",
        ),
    );
    return Response.json(payload);
  } catch (err) {
    const message = isTimeout(err)
      ? err.message
      : err instanceof Error
        ? err.message
        : "Scan failed.";
    return Response.json(
      {
        error: message,
        timedOut: isTimeout(err),
        universe: params.universe,
      },
      { status: isTimeout(err) ? 504 : 500 },
    );
  }
}
