# Indicators & Intelligence Catalog — PRD
**Crystal Ball / Command Center PWA**  
Status: Complete (aligned with locked Master Index)

---

## 1. Purpose
Maintain a clean, documented library of high-signal indicators (price-based and alternative). Provide simple views so the user can see current values, short history, and basic context. This layer supplies regime and stress information that can later sit beside any pair being researched.  

**Rule**: No invented composite “war scores”. Only observable, sourced signals with clear interpretation.

---

## 2. Indicator Categories & Starter Set (MVP)

### A. Spread / Breadth Indicators
- **Brent–WTI Spread** (BZ=F – CL=F) + rolling z-score  
  Interpretation: Widening often reflects geopolitical / supply-chain stress on global (Brent) vs US (WTI) crude.
- **RSP/SPY Ratio** + short-term z-score or percentile  
  Interpretation: Rising ratio = broader market participation; falling = mega-cap dominated.

### B. Volatility & Risk
- **VIX** level and daily/weekly change  
  Interpretation: Elevated VIX signals higher expected equity volatility / fear.

### C. Safe-haven / Macro
- **Gold** (GC=F) price and relative change  
- **DXY** (or clean dollar proxy) if reliable data is available

### D. Alternative / OSINT-style
- **Pentagon Pizza activity status**  
  Source: Public trackers (e.g. pizzint.watch or equivalent).  
  Interpretation: Elevated late-night activity near Pentagon is a noisy historical proxy for high operational tempo. Treat as weak confirmatory signal only.
- **Selected Polymarket markets**  
  High-relevance politics, geopolitics, and macro contracts.  
  Show: current probability, 24h change, volume.

### E. Lightweight News (optional / can defer)
- 3–5 curated RSS headlines with simple keyword flags.

---

## 3. Data Requirements
- Prefer free or very low-cost, reliable sources.
- Update cadence aligned with core system (EOD + 15–30 min where applicable). Pizza and Polymarket can update less frequently.
- Every indicator must document:
  - Exact source
  - Calculation (if any)
  - Update frequency
  - One-sentence interpretation

---

## 4. Core Capabilities (MVP)
- Current value + sparkline / short history for each indicator.
- Visual treatment: traffic-light or z-score coloring where meaningful (e.g. elevated Brent-WTI z-score, high VIX).
- Pin any indicator to the Command Overview.
- Expandable detail for each indicator (source, interpretation, recent values).
- Basic multi-signal “stress strip”: side-by-side current readings of key stress indicators.

---

## 5. Intelligence / Context Layer (Lightweight in MVP)
- No formal lead-lag, correlation engine, or automated regime classifier yet.
- Provide a simple “Context” panel that can be opened while viewing a pair or the overview. It shows the current state of major indicators so the user can apply judgment.
- The conceptual “funnel” (breadth → other signals → pair assessment) lives here as an optional mental model only — not an automated filter.

---

## 6. Mobile-First UI Notes
- Catalog presented as scrollable cards or compact list, grouped by category.
- Tap any card → expands to detail + sparkline.
- Clear pin control on each card.
- Multi-signal stress strip near the top or as a sticky summary.
- Desktop: denser grid or two-column layout; stress strip remains visible.

---

## 7. Acceptance Criteria
- All starter indicators load and display current value + short history.
- Pinning works and surfaces on Command Overview.
- Each indicator displays its source and interpretation.
- Mobile layout remains usable (no critical horizontal scroll).
- Graceful degradation when any single data source is temporarily unavailable.

---

## 8. Explicitly Out of Scope
- Custom user-defined indicators in MVP
- Automated regime classification or multi-factor scoring models
- Heavy news NLP / sentiment engines
- Historical backtesting of indicator predictive power
- Crypto-specific indicators

---

## 9. Handoff Contracts
- Exposes current values and pin state to Command Overview.
- Exposes a current stress/context snapshot that can be requested when inspecting any pair.
- Does not write to Watchlist.
- Does not generate pair candidates.
- Remains independently evolvable from the Pair Research engine.

---

## 10. Parked / Future Ideas
- VWAP relative position and retest logic (test idea only — not on roadmap)
- Formal co-movement analysis between indicators and active pairs
- Additional shipping, currency, or sector relative-strength signals
