# CrystalBall — Ideas & Roadmap

_Companion to STATUS.md (where am I) and the locked PRDs in `docs/`.
Last updated: 2026-08-18._

## Vision (one sentence)
A mobile-first PWA that helps the user systematically discover statistically valid pairs, monitor selected spreads with alerts, and view a clean set of high-signal market and alternative indicators — research quality and usable intelligence over flashy features (`docs/00_Master_Index_Interface_Contract.md`).

## Roadmap — Now / Next / Later

### NOW (this week)
- No explicit "Now" list exists beyond the shipped Phase 3 (README). Treat validating the live Watchlist/alerts against real data as the implicit current focus.

### NEXT (after Now)
- Whatever comes after Phase 3 is undecided — the locked docs stop at "Implementation / scaffolding" (doc sequence item 5) with no Phase 4 spec found.

### LATER (someday) — explicitly deferred per locked Master Index (section 4 & README "Still out of scope")
- Crypto pairs, international equities, options/complex derivatives.
- Broker / order execution.
- Telegram / email / SMS alert channels (browser-only for MVP).
- Multi-condition alerts.
- Persistent (cross-session) alert history — currently session-only.
- Custom ticker list upload/paste for Research universe (called "Phase 1.5" in the Pair Research PRD).
- Manually-added (non-promoted) pairs in Watchlist (also "Phase 1.5").
- Lightweight curated news/RSS with keyword flags (Indicators PRD, marked optional/can defer).

## Ideas parking lot (capture, don't build)
- VWAP-based intraday timing / institutional front-running ruleset — explicitly parked, test-idea only, not on roadmap (`docs/00_Master_Index_Interface_Contract.md` §8).

## How this file stays current
At the end of a work session say: **"update STATUS and ROADMAP."** Surfaced ideas land in the
parking lot; committed work moves into Now/Next/Later.
