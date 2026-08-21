/**
 * VIX is an annualized implied-vol index, not an equity return.
 * Rule of thumb: VIX / 16 ≈ expected 1-session S&P move
 * (16 ≈ sqrt of ~256 trading days).
 */
export const VIX_DAILY_DIVISOR = 16;

export function impliedDailyMovePct(vixLevel: number): number {
  return vixLevel / VIX_DAILY_DIVISOR;
}

export function formatImpliedDailyMove(vixLevel: number): string {
  const pct = impliedDailyMovePct(vixLevel);
  const shown = pct.toLocaleString("en-US", {
    minimumFractionDigits: 1,
    maximumFractionDigits: 1,
  });
  return `about ${shown}% normal daily S&P move`;
}

export function vixImpliedClause(vixLevel: number | null | undefined): string {
  if (vixLevel === null || vixLevel === undefined || !Number.isFinite(vixLevel)) {
    return "";
  }
  return formatImpliedDailyMove(vixLevel);
}
