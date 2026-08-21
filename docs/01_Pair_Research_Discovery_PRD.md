# Pair Research / Discovery Tool — PRD
**Crystal Ball / Command Center PWA**  
Status: Complete (aligned with locked Master Index)

---

## 1. Purpose
Systematically find, statistically validate, and rank candidate pairs so the user does not have to guess. The tool does the heavy statistical work; the user applies judgment on the shortlist.

---

## 2. Primary User Flow
1. Select or confirm universe (default: S&P 500).
2. Apply optional filters (sector, min price, min average dollar volume).
3. Run correlation pre-filter.
4. Run full cointegration + diagnostics on surviving pairs.
5. View ranked results table.
6. Open any pair for detailed diagnostics and charts.
7. Promote selected pairs to the Watchlist with chosen parameters.

---

## 3. Universe & Filters (MVP)
- **Default universe**: Current S&P 500 constituents.
- **Required filters**:
  - Minimum average daily dollar volume (configurable, suggested default ≥ $20M).
  - Minimum price (optional, e.g. > $5).
- **Optional**: Sector / industry group filter.
- Ability to upload or paste a custom ticker list (Phase 1.5).

---

## 4. Statistical Pipeline (Exact)

### Step A – Correlation Pre-filter
- Compute rolling Pearson correlation on log returns.
- Default lookback: 60–90 trading days.
- Keep pairs where |correlation| ≥ 0.80.
- Limit to top-N candidates per ticker if needed to control compute.

### Step B – Hedge Ratio & Spread
- Use log prices.
- OLS regression:  
  `log(P_A) = α + β · log(P_B) + ε`
- Spread = `log(P_A) – β · log(P_B)`

### Step C – Cointegration Test
- Engle-Granger two-step procedure.
- ADF test on the residual spread.
- Require p-value < 0.05.

### Step D – Mean-Reversion Diagnostics
- Half-life of mean reversion from AR(1) coefficient on the spread:  
  `Half-life ≈ –ln(2) / ln(1 + φ)`
- Accept pairs with half-life roughly 5–60 trading days.
- Record spread volatility and recent stability of β.

### Step E – Ranking / Score
Simple composite score (weights tunable later):
- Cointegration strength (lower p-value better)
- Half-life in preferred range
- Liquidity of both legs
- Recent correlation stability

Output a ranked table with all key metrics visible and sortable.

---

## 5. Detail View (per pair)
- Price chart of both legs (normalized).
- Spread chart with mean ± 1σ / 2σ bands.
- Z-score series.
- Current β, half-life, ADF p-value, correlation.
- Parameter controls (lookback windows) that can re-run diagnostics.
- Prominent “Add to Watchlist” action that passes the pair + current parameters.

---

## 6. Output to Watchlist
When a pair is promoted, pass:
- Ticker A, Ticker B
- β
- Lookback windows used
- Entry/exit z-score defaults (suggested: ±2.0 entry, ±0.5 exit)
- Any user notes

---

## 7. Mobile-First UI Notes
- Filters in a collapsible top sheet or bottom sheet.
- Ranked results as a clean, scannable card list or compact table.
- Detail view as full-screen or large bottom sheet with swipeable charts.
- Primary action (“Add to Watchlist”) always reachable with thumb.
- Desktop: side-by-side results table + persistent detail panel (progressive enhancement).

---

## 8. Acceptance Criteria (MVP)
- Can load S&P 500 universe and run the full pipeline without crashing.
- Correlation filter and cointegration tests produce correct, reproducible numbers.
- Ranked list is sortable by score, half-life, or p-value.
- User can open detail view and promote at least one pair to Watchlist.
- Works on mobile viewport without critical horizontal scroll.
- Calculations finish in reasonable time (target < 60–90 seconds for full S&P 500 on server side).

---

## 9. Explicitly Out of Scope
- Kalman or rolling β
- Johansen multi-asset tests
- Full backtester / performance attribution
- Automatic position sizing or execution
- Crypto or international equities
- Real-time tick data

---

## 10. Handoff
- Only outputs clean, fully parameterized pairs to the Watchlist module.
- Does not generate alerts itself.
- Does not depend on the Indicators module to function.
