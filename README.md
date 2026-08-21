# CrystalBall

Mobile-first PWA for statistical pair discovery, multi-signal monitoring, and command-center style market intelligence.

## Phase 3 (current)

Watchlist computes live z-scores from stored β. Browser alerts fire on entry/exit crosses.

| Route | Status |
| --- | --- |
| `/` Command Overview | Stress strip + top watched pairs by urgency + alert badge |
| `/indicators` | Starter catalog + pin to Command |
| `/research` | Corr → OLS β → EG ADF → half-life → score → promote |
| `/watchlist` | Live z, status, detail, mute, dismissable alerts |

**Still out of scope**
- Broker / orders
- Telegram / email / SMS
- Multi-condition alerts
- Persistent alert history (session-only)

## Docs (source of truth)

| File | Description |
| --- | --- |
| `docs/00_Master_Index_Interface_Contract.md` | Locked decisions and module hand-offs |
| `docs/01_Pair_Research_Discovery_PRD.md` | Pair search engine |
| `docs/02_Indicators_Intelligence_Catalog_PRD.md` | Signal library |
| `docs/03_Watchlist_Alerts_Command_Overview_PRD.md` | Live monitoring, alerts, home |

## Run

```bash
npm install
npm run dev
```

Open [http://localhost:3000](http://localhost:3000).

## Data

Quotes: Yahoo Finance with Stooq fallback. Indicators cache 15 min (`GET /api/indicators`).  
Research: `POST /api/research/scan`, `GET /api/research/pair`.  
Watchlist live: `POST /api/watchlist/live` using stored β + rolling μ/σ.
