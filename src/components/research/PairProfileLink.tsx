"use client";

import Link from "next/link";
import { pairProfileHref } from "@/lib/research/profile";

type PairProfileLinkProps = {
  tickerA: string;
  tickerB: string;
  lookback?: number;
};

export function PairProfileLink({
  tickerA,
  tickerB,
  lookback,
}: PairProfileLinkProps) {
  return (
    <Link
      href={pairProfileHref(tickerA, tickerB, lookback)}
      className="inline-flex min-h-11 items-center font-mono text-xs text-cyan"
    >
      About this pair
    </Link>
  );
}
