import Link from "next/link";

export default function PairNotFound() {
  return (
    <div className="space-y-4">
      <p className="font-mono text-[10px] tracking-[0.28em] text-amber uppercase">
        Pair profile
      </p>
      <h1 className="text-2xl tracking-tight">Unknown pair</h1>
      <p className="max-w-md text-sm text-fog">
        That URL did not look like /pair/AAPL-MSFT. Open a pair from Research or
        Watchlist instead.
      </p>
      <Link
        href="/research"
        className="inline-flex min-h-11 items-center rounded-md border border-line px-4 text-sm text-fog"
      >
        Back to Research
      </Link>
    </div>
  );
}
