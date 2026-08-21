import { dayKey } from "@/lib/data/stats";
import type { SeriesPoint } from "@/lib/data/types";

export function mean(values: number[]): number {
  return values.reduce((sum, value) => sum + value, 0) / values.length;
}

export function variance(values: number[], sample = true): number {
  if (values.length < 2) return 0;
  const avg = mean(values);
  const denom = sample ? values.length - 1 : values.length;
  return values.reduce((sum, value) => sum + (value - avg) ** 2, 0) / denom;
}

export function stdev(values: number[]): number {
  return Math.sqrt(variance(values));
}

export function logPrices(values: number[]): number[] {
  return values.map((value) => Math.log(value));
}

export function logReturns(values: number[]): number[] {
  const out: number[] = [];
  for (let i = 1; i < values.length; i += 1) {
    if (values[i - 1] <= 0 || values[i] <= 0) continue;
    out.push(Math.log(values[i] / values[i - 1]));
  }
  return out;
}

export function pearson(a: number[], b: number[]): number | null {
  const n = Math.min(a.length, b.length);
  if (n < 8) return null;
  const xa = a.slice(a.length - n);
  const xb = b.slice(b.length - n);
  const ma = mean(xa);
  const mb = mean(xb);
  let num = 0;
  let da = 0;
  let db = 0;
  for (let i = 0; i < n; i += 1) {
    const ea = xa[i] - ma;
    const eb = xb[i] - mb;
    num += ea * eb;
    da += ea * ea;
    db += eb * eb;
  }
  const denom = Math.sqrt(da * db);
  if (denom === 0) return null;
  return num / denom;
}

export type OlsFit = {
  alpha: number;
  beta: number;
  resid: number[];
};

export function olsLog(y: number[], x: number[]): OlsFit | null {
  if (y.length !== x.length || y.length < 8) return null;
  const n = y.length;
  const mx = mean(x);
  const my = mean(y);
  let sxx = 0;
  let sxy = 0;
  for (let i = 0; i < n; i += 1) {
    const dx = x[i] - mx;
    sxx += dx * dx;
    sxy += dx * (y[i] - my);
  }
  if (sxx === 0) return null;
  const beta = sxy / sxx;
  const alpha = my - beta * mx;
  const resid = y.map((value, i) => value - (alpha + beta * x[i]));
  return { alpha, beta, resid };
}

export type MultiOls = {
  beta: number[];
  se: number[];
  resid: number[];
};

export function olsMatrix(y: number[], X: number[][]): MultiOls | null {
  const n = y.length;
  if (n === 0 || X.length !== n) return null;
  const k = X[0]?.length ?? 0;
  if (k === 0 || n <= k + 1) return null;

  const xtx = Array.from({ length: k }, () => Array<number>(k).fill(0));
  const xty = Array<number>(k).fill(0);
  for (let i = 0; i < n; i += 1) {
    for (let r = 0; r < k; r += 1) {
      xty[r] += X[i][r] * y[i];
      for (let c = 0; c < k; c += 1) {
        xtx[r][c] += X[i][r] * X[i][c];
      }
    }
  }

  const inv = invert(xtx);
  if (!inv) return null;

  const beta = Array<number>(k).fill(0);
  for (let r = 0; r < k; r += 1) {
    for (let c = 0; c < k; c += 1) {
      beta[r] += inv[r][c] * xty[c];
    }
  }

  const resid = y.map((value, i) => {
    let fitted = 0;
    for (let j = 0; j < k; j += 1) fitted += beta[j] * X[i][j];
    return value - fitted;
  });
  const sigma2 = resid.reduce((sum, e) => sum + e * e, 0) / (n - k);
  const se = inv.map((row, i) => Math.sqrt(Math.max(row[i] * sigma2, 0)));
  return { beta, se, resid };
}

function invert(matrix: number[][]): number[][] | null {
  const n = matrix.length;
  const a = matrix.map((row, i) => [...row, ...identityRow(n, i)]);
  for (let col = 0; col < n; col += 1) {
    let pivot = col;
    for (let row = col + 1; row < n; row += 1) {
      if (Math.abs(a[row][col]) > Math.abs(a[pivot][col])) pivot = row;
    }
    if (Math.abs(a[pivot][col]) < 1e-12) return null;
    if (pivot !== col) {
      const tmp = a[col];
      a[col] = a[pivot];
      a[pivot] = tmp;
    }
    const diag = a[col][col];
    for (let j = 0; j < 2 * n; j += 1) a[col][j] /= diag;
    for (let row = 0; row < n; row += 1) {
      if (row === col) continue;
      const factor = a[row][col];
      for (let j = 0; j < 2 * n; j += 1) a[row][j] -= factor * a[col][j];
    }
  }
  return a.map((row) => row.slice(n));
}

function identityRow(n: number, i: number): number[] {
  return Array.from({ length: n }, (_, j) => (j === i ? 1 : 0));
}

export type AlignedPair = {
  t: number;
  a: number;
  b: number;
};

export function alignPair(
  left: SeriesPoint[],
  right: SeriesPoint[],
): AlignedPair[] {
  const rightByDay = new Map(right.map((point) => [dayKey(point.t), point.v]));
  const out: AlignedPair[] = [];
  for (const point of left) {
    const other = rightByDay.get(dayKey(point.t));
    if (other === undefined || point.v <= 0 || other <= 0) continue;
    out.push({ t: point.t, a: point.v, b: other });
  }
  return out;
}

export function sliceLast<T>(items: T[], count: number): T[] {
  return items.slice(Math.max(0, items.length - count));
}

export function halfLifeFromAr1(spread: number[]): number | null {
  if (spread.length < 10) return null;
  const y = spread.slice(1);
  const x = spread.slice(0, -1);
  const fit = olsLog(y, x);
  if (!fit) return null;
  const rho = fit.beta;
  if (!(rho > 0 && rho < 1)) return null;
  const hl = -Math.log(2) / Math.log(rho);
  if (!Number.isFinite(hl) || hl <= 0) return null;
  return hl;
}

export function normalCdf(x: number): number {
  const abs = Math.abs(x);
  const t = 1 / (1 + 0.2316419 * abs);
  const d = 0.3989423 * Math.exp((-x * x) / 2);
  const p =
    d *
    t *
    (0.3193815 +
      t * (-0.3565638 + t * (1.781478 + t * (-1.821256 + t * 1.330274))));
  return x > 0 ? 1 - p : p;
}
