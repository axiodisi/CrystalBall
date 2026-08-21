# Master Index + Interface Contract
**Crystal Ball / Command Center PWA**  
Locked: 13 Aug 2026 (with defaults)

---

## 1. Product Vision
A mobile-first PWA that helps the user systematically discover statistically valid pairs, monitor selected spreads with alerts, and view a clean set of high-signal market and alternative indicators (including geopolitical and trade-stress proxies). The tool prioritizes research quality and usable intelligence over flashy features. It starts focused and expands only after real use validates each piece.

---

## 2. Confirmed Sections & Purpose

| Section | Primary Purpose | Owns |
|---------|-----------------|------|
| **Command Overview** | Fast situational awareness. Highest-signal gauges + active alerts. Default home screen. | Display only (pulls from other sections) |
| **Pair Research** | Systematic discovery, statistical validation, and ranking of candidate pairs. | Universe filters, correlation, cointegration, β, half-life, scoring, detail diagnostics |
| **Watchlist & Live** | Monitor promoted pairs and key spreads. Z-scores, charts, thresholds, alerts. | Selected pairs, live/rolling calculations, alert state |
| **Indicators & Intelligence** | Catalog of price and alternative signals + simple context/regime views. | Brent-WTI, RSP/SPY, VIX, gold/DXY, pizza activity, Polymarket, war/trade-war proxies |
| **Settings / Alerts** | Thresholds, notification preferences, data source toggles. | User configuration |

These stay separate modules with clear hand-offs. Nothing is merged into one giant page.

---

## 3. Mobile-First + Progressive Enhancement Rules
- Design and build for phone first (touch targets, single-column flow, performance on mid-range devices).
- Desktop receives the identical core experience with progressive enhancement (side-by-side panels, denser tables, persistent navigation).
- PWA installable on both.
- No separate desktop codebase.

---

## 4. MVP Asset-Class & Data Boundaries (Locked)

**In scope**
- US equities and ETFs
- Key futures that support core examples (CL=F, BZ=F, etc.)

**Later (Phase 2)**
- Crypto pairs
- International equities
- Options or complex derivatives

**Data freshness**
- End-of-day + 15–30 minute refresh during market hours
- True real-time tick data not required for MVP

---

## 5. Interface Contracts

```
Pair Research
  └─ (user promotes pair + parameters) → Watchlist & Live

Indicators & Intelligence
  └─ (pin or expose current values) → Command Overview
  └─ (context/regime flags) → available when inspecting any pair

Watchlist & Live
  └─ (current z-scores, alert status) → Command Overview

Command Overview
  └─ read-only consumer of the above
```

- Pair Research never directly writes alerts; it only hands clean pairs + parameters to Watchlist.
- Indicators remain independent so they can evolve without breaking the statistical engine.
- Command Overview is a pure presentation layer.

---

## 6. Locked Decisions (Defaults Accepted)

1. **Asset classes**: US equities + ETFs + key futures. Crypto deferred.
2. **Update frequency**: EOD + 15–30 min refresh during market hours.
3. **Statistical thresholds**:
   - |corr| ≥ 0.80
   - Cointegration p-value < 0.05
   - Half-life roughly 5–60 trading days
   - Minimum average dollar volume filter
4. **Regime / funnel context**: Not required in MVP (later optional context panel).
5. **War & trade-war signals (v1)**:
   - Brent–WTI spread + z-score
   - RSP/SPY ratio
   - VIX
   - Gold
   - Pentagon Pizza activity status
   - Selected high-relevance Polymarket markets
6. **Alert channels**: Browser notifications only for MVP.
7. **Starting universe**: S&P 500 constituents. Custom lists later.

---

## 7. Document Sequence

1. Master Index + Interface Contract ← **This document (locked)**
2. Pair Research / Discovery Tool PRD ← Complete
3. Indicators & Intelligence Catalog PRD ← Complete
4. Watchlist + Alerts + Command Overview PRD ← Next
5. Implementation / scaffolding

---

## 8. Parked Ideas (Not on Roadmap)
- VWAP-based intraday timing / institutional front-running ruleset (test idea only)
