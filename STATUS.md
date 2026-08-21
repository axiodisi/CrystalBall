---
name: CrystalBall
brand: Crystal Ball
status: active
last_active: 2026-08-17
phase: "Phase 3 of docs/00_Master_Index_Interface_Contract.md"
next_action: "Decide what's next after Phase 3 (Watchlist live z-scores + browser alerts) — broker/orders, multi-condition alerts, and persistent alert history are all explicitly out of scope per README."
tools: [Code]
cost: "Free"
one_liner: "Mobile-first Next.js PWA for statistical pair-trading discovery (cointegration/ADF), a market-stress indicator catalog, and a live watchlist with browser alerts."
---

# CrystalBall — Project Status

_Living handoff file — update the top whenever you stop work. Last updated: 2026-08-17._

## TL;DR — where this stands
A Next.js 16 / React 19 PWA implementing three of the four modules locked in `docs/00_Master_Index_Interface_Contract.md`: Pair Research (correlation → OLS β → Engle-Granger ADF cointegration → half-life → score → promote), Indicators catalog (Brent-WTI, RSP/SPY, VIX, gold, Pentagon Pizza tracker, selected Polymarket markets), and a live Watchlist that computes z-scores from stored β and fires browser notifications on entry/exit crosses. Git history is a single "Initial commit" (2026-08-17), so there's no session-by-session history to draw on beyond what the code and README show today. Data comes from Yahoo Finance with a Stooq fallback; indicators are cached 15 minutes server-side.

## ✅ Done
- Command Overview (`/`) — stress strip + top watched pairs by urgency + alert badge.
- Indicators (`/indicators`) — starter catalog with pin-to-Command.
- Research (`/research`) — full statistical pipeline (corr → OLS β → EG/ADF → half-life → score → promote to Watchlist).
- Watchlist (`/watchlist`) — live z-score, status, per-pair detail, mute, dismissable alerts.
- API routes: `GET /api/indicators`, `POST /api/research/scan`, `GET /api/research/pair`, `POST /api/watchlist/live`.
- PWA scaffolding (manifest, icons, service worker registration).

## ▶️ Next (in order)
1. Decide the next milestone now that Phase 3 (live watchlist + alerts) is done — no roadmap doc beyond the locked PRDs specifies Phase 4.
2. Explicitly out of scope for now per README: broker/order execution, Telegram/email/SMS alerts, multi-condition alerts, persistent (cross-session) alert history.
3. Consider real usage/validation of the statistical pipeline against live data before adding features (master doc's stated philosophy: "expands only after real use validates each piece").

## 🔑 Decisions (locked)
See `docs/00_Master_Index_Interface_Contract.md` section 6 for the full locked list, notably:
- Asset classes: US equities + ETFs + key futures only; crypto deferred.
- Update frequency: EOD + 15–30 min refresh during market hours (no true real-time tick data).
- Statistical thresholds: |corr| ≥ 0.80, cointegration p-value < 0.05, half-life ~5–60 trading days.
- Alert channels: browser notifications only for MVP.
- Starting universe: S&P 500 constituents.

## 💵 Cost to run
- Free — no paid APIs identified in `package.json` (Next.js/React only); data sourced from Yahoo Finance / Stooq (free endpoints).

## ⚙️ Setup & dependencies
- Node.js + npm. Dependencies: Next.js 16.3.1, React 19.2.8, Tailwind CSS 4, TypeScript 5 (see `package.json`).
- No `.env` or external account requirements found in the repo.

## 🔁 How to resume
```bash
cd C:\Projects\CrystalBall
npm install
npm run dev
# open http://localhost:3000
```

## 🔗 Related projects
- None identified from within this folder.

## 📓 Work log (newest first)
- 2026-08-18 · Code (DocScout) · Created STATUS.md and IDEAS-AND-ROADMAP.md; README.md and CLAUDE.md already existed and were left untouched. Git history only has one "Initial commit" so no prior session log could be reconstructed.
