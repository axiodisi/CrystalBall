# Watchlist + Alerts + Command Overview — PRD
**Crystal Ball / Command Center PWA**  
Status: Complete (aligned with locked Master Index, Pair Research PRD, and Indicators Catalog PRD)

---

## 1. Purpose
This module is the operational heart of the tool after research is done.

- **Watchlist & Live**: Holds the pairs and key spreads the user has chosen to monitor. Calculates live (or near-live) z-scores, shows charts, and manages alert state.
- **Alerts**: Centralized notification system that fires when configured thresholds are breached.
- **Command Overview**: The default home screen. A dense, mobile-first dashboard that surfaces the highest-signal current information from Watchlist and Indicators so the user can orient in seconds.

---

## 2. Watchlist & Live

### 2.1 What lives here
- Pairs promoted from Pair Research (with their saved β, lookback windows, and default z-thresholds).
- Key standing spreads that are always available (Brent–WTI, RSP/SPY) even if not “promoted”.
- Any manually added pair the user wants to track (Phase 1.5).

### 2.2 Core calculations (per watched item)
- Current spread using the stored β (log prices preferred).
- Rolling mean and standard deviation of the spread (same lookback used at promotion, or user-overridable).
- Current z-score = (spread – μ) / σ.
- Distance from entry/exit thresholds.
- Simple status: Neutral / Approaching / Triggered (long or short side).

### 2.3 Detail view for a watched pair
- Normalized price chart of both legs.
- Spread chart with mean ± 1σ / 2σ bands and current z-score.
- Current metrics (β, half-life if available, z-score, thresholds).
- Editable thresholds and lookback (recalculates on change).
- Remove from Watchlist action.
- Optional notes field.

### 2.4 Mobile-first behavior
- Watchlist as a vertical list of compact cards showing: pair name, current z-score, status color, sparkline.
- Tap card → full detail sheet.
- Desktop: denser table + side detail panel.

---

## 3. Alerts

### 3.1 MVP scope
- Browser notifications only.
- Triggered when a watched pair’s z-score crosses the user-defined entry threshold (default ±2.0) or returns inside the exit threshold (default ±0.5).
- Also support simple threshold alerts on key Indicators (e.g., Brent–WTI z-score > X, VIX > Y).

### 3.2 Alert lifecycle
1. Condition met → create alert event.
2. Show in-app banner / badge on Command Overview and Watchlist.
3. Fire browser notification (if permission granted).
4. User can dismiss or acknowledge.
5. Alert history kept for the current session (persistent history is Phase 1.5).

### 3.3 Configuration
- Per-pair or global default thresholds.
- Ability to mute individual pairs temporarily.
- Master notification toggle in Settings.

### 3.4 Out of scope for MVP
- Telegram, email, SMS, or webhook delivery.
- Complex multi-condition alerts (“z-score AND VIX rising”).
- Sound or custom notification payloads beyond basic text.

---

## 4. Command Overview (Home Screen)

### 4.1 Purpose
Fast situational awareness. The user opens the app and immediately sees what matters right now.

### 4.2 Layout principles (mobile-first)
- Single scrolling column on phone.
- Top section: Stress / Regime strip (pinned Indicators).
- Middle section: Active Watchlist summary (highest |z-score| or recently triggered items first).
- Bottom or secondary: Quick links into Pair Research and full Indicators catalog.
- Desktop: same information in a denser multi-column or card-grid layout (progressive enhancement). No different information architecture.

### 4.3 Content blocks
**A. Stress / Regime Strip**
- Current readings for the key pinned Indicators:
  - Brent–WTI z-score
  - RSP/SPY
  - VIX
  - Gold (optional)
  - Pizza status
  - 1–2 top Polymarket contracts
- Visual treatment: color or simple directional indicators.

**B. Active Watchlist Snapshot**
- Top 3–6 watched pairs sorted by |z-score| or alert status.
- Each shows: pair name, current z, status, mini sparkline.
- Tap → jumps to full Watchlist detail.

**C. Alerts Badge / Recent Alerts**
- Count of active/unacknowledged alerts.
- Latest 1–2 alert messages.

**D. Navigation affordances**
- Clear entry points to Pair Research and full Indicators without a traditional website menu.
- Persistent bottom tab bar (mobile) or collapsible side nav (desktop) for the main sections.

### 4.4 Data freshness
- Displays the most recent successful refresh from the shared data layer.
- Shows a subtle “last updated” timestamp.
- Graceful handling when any source is temporarily unavailable.

---

## 5. Shared Technical Notes

### 5.1 Data layer expectations
- Watchlist calculations run on the same price series used by Pair Research.
- Indicators values are read-only from the Indicators module.
- All modules share a common refresh cadence (EOD + 15–30 min during market hours).

### 5.2 State
- Watchlist membership and per-pair parameters persist (local storage or simple backend later).
- Alert acknowledgements can be session-only for MVP.
- Pinned Indicators state persists.

### 5.3 Mobile-first + PWA
- Installable.
- Works offline for last-known data (with clear “stale” indicators).
- Touch-friendly targets and bottom-sheet patterns for detail views.

---

## 6. Acceptance Criteria

**Watchlist**
- User can promote a pair from Pair Research and see it appear with correct β and z-score.
- Z-score updates on refresh.
- Detail view shows charts and editable thresholds.
- Pair can be removed.

**Alerts**
- Browser notification permission can be requested.
- Crossing a z-threshold creates a visible alert and (if permitted) a browser notification.
- Alerts can be dismissed.

**Command Overview**
- Loads as the default route.
- Shows current Stress strip values.
- Shows top watched pairs by urgency.
- Navigation to other sections works on both mobile and desktop viewports.
- No critical horizontal scrolling on mobile.

---

## 7. Explicitly Out of Scope
- Position sizing, order generation, or broker connectivity.
- Multi-leg portfolio risk or net exposure views.
- Advanced alert routing (Telegram, etc.).
- Historical alert analytics.
- Custom dashboard builder / drag-and-drop widgets.

---

## 8. Handoff Contracts (recap)

```
Pair Research ──(promote)──► Watchlist
Indicators ──(pin / current values)──► Command Overview
Watchlist ──(z-scores + alert state)──► Command Overview
Alerts ◄── thresholds from Watchlist & selected Indicators
```

Command Overview is a pure consumer. It never owns source-of-truth data.

---

## 9. Relationship to Other Documents
- Follows rules in **Master_Index_Interface_Contract.md**
- Receives pairs from **Pair_Research_Discovery_PRD.md**
- Displays signals defined in **Indicators_Intelligence_Catalog_PRD.md**
