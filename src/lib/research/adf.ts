import { normalCdf, olsMatrix } from "./math";

/**
 * MacKinnon (1994) p-value for residual ADF with no constant.
 * Engle-Granger second step: intercept already sits in the first-stage OLS.
 * N=2 is the two-variable case.
 */
export function mackinnonP(tau: number, seriesCount = 2): number {
  const index = Math.min(Math.max(seriesCount, 1), 6) - 1;
  const tauMax = [Infinity, 1.51, 0.86, 0.88, 1.05, 1.24][index];
  const tauMin = [-19.04, -19.62, -21.21, -23.25, -21.63, -25.74][index];
  const tauStar = [-1.04, -1.53, -2.68, -3.09, -3.07, -3.77][index];
  if (tau > tauMax) return 1;
  if (tau < tauMin) return 0;

  const small = [
    [0.6344, 1.2378, 0.032496],
    [1.9129, 1.3857, 0.035322],
    [2.7648, 1.4502, 0.034186],
    [3.4336, 1.4835, 0.0319],
    [4.0999, 1.5533, 0.0359],
    [4.5388, 1.5344, 0.029807],
  ][index];
  const large = [
    [0.4797, 0.93557, -0.06999, 0.033066],
    [1.5578, 0.8558, -0.2083, -0.033549],
    [2.2268, 0.68093, -0.32362, -0.054448],
    [2.7654, 0.64502, -0.30811, -0.044946],
    [3.2684, 0.68051, -0.26778, -0.034972],
    [3.7268, 0.7167, -0.23648, -0.028288],
  ][index];

  const coef = tau <= tauStar ? small : large;
  let z = 0;
  let power = 1;
  for (const term of coef) {
    z += term * power;
    power *= tau;
  }
  return normalCdf(z);
}

export type AdfResult = {
  stat: number;
  pValue: number;
};

/**
 * ADF(1) with no constant on first-stage residuals (Engle-Granger step 2).
 * Δy_t = γ y_{t-1} + φ Δy_{t-1} + ε
 */
export function adfNoConstant(
  series: number[],
  seriesCount = 2,
): AdfResult | null {
  if (series.length < 16) return null;
  const y: number[] = [];
  const X: number[][] = [];
  for (let t = 2; t < series.length; t += 1) {
    y.push(series[t] - series[t - 1]);
    X.push([series[t - 1], series[t - 1] - series[t - 2]]);
  }
  const fit = olsMatrix(y, X);
  if (!fit || fit.se[0] === 0) return null;
  const stat = fit.beta[0] / fit.se[0];
  return { stat, pValue: mackinnonP(stat, seriesCount) };
}
