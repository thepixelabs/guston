# Architecture Plan v5 — Wave 2 Execution (index.html passes)

**Author:** system-architect
**Audience:** staff-engineer (Wave 2 sequential passes)
**Constraint:** single static `index.html` on GitHub Pages. No build step.
**Parallel Wave 1 agents (non-colliding):** devops (GH Actions + scripts + seed data), creative-technologist (Lineup/calendar visual spec), staff-engineer (i18n engine under `assets/i18n/` + `strings/*.js`).

---

## 1. Wave 2 Dependency Order — DECIDED

**Order: Pass A = Lineup -> Pass B = Multi-sport verdict -> Pass C = i18n wiring.**

Rationale (data-flow + coupling):

- **Lineup first (additive, least coupled).** New `<section id="lineup">` inserted between Forecast and Radar. Touches zero existing IDs, zero existing JS, zero existing CSS selectors. It can land independently and be smoke-tested in isolation. Doing it first means the HTML tree is final before i18n starts scanning text nodes, so i18n picks up Lineup strings in the same sweep rather than leaving it monolingual.
- **Multi-sport verdict second.** It mutates `.verdict-hero` (the single most load-bearing block in the file) and adds the `SPORTS` registry + `CONDITIONS` object. Doing this AFTER Lineup avoids a merge-in-head situation; doing it BEFORE i18n is mandatory because multi-sport introduces ~20 new strings (sport names, verdict reasons, recommendations, kite-size labels) that i18n must catalog in one pass. If i18n ran first it would immediately be stale.
- **i18n LAST.** i18n touches EVERY text node via `data-i18n` attributes and adds RTL flip + `Intl.NumberFormat`. It must see the final DOM. Running it last means exactly one sweep across the final tree, no rework.

Hard rule: never interleave. Each pass = one commit, one verification cycle.

---

## 2. Risk Flags

### 2.1 The Lineup
- **Cron scraper breakage:** isolated to devops; frontend MUST degrade to empty state, not throw. Contract: `fetch('data/news.json')` -> on 404/parse-error, render mono label `NEWS TEMPORARILY UNAVAILABLE` in left column and `Season calendar coming soon.` in right. Section stays mounted.
- **JSON-LD selector drift (GKA/WSL/PWA/GWA):** devops problem, but frontend must tolerate missing fields — treat every card field as nullable, always have a fallback (sport-tinted gradient for image, `--` for country flag).
- **Image hotlinking bandwidth:** v1 accept per news-brief; v2 downloads thumbs to `data/thumbs/<sha>.jpg`. Frontend uses `<img loading="lazy" decoding="async" onerror=\"this.replaceWith(faviconFallback())\">`.
- **Empty-state UX:** never render a skeleton indefinitely. 2s fetch timeout via `AbortController`; on timeout show empty state, not a spinner.
- **CLS risk:** reserve `min-height: 720px` on desktop for the section so loading the JSON doesn't jank the forecast above.

### 2.2 Multi-sport verdict
- **Existing `#vpKite` / `#vpWaves` / `#vpSuit` IDs** are currently written by `evaluateKiteConditions` and `fetchConditions`. If the refactor removes them without replacement the entire hero breaks silently (text just stays "--"). Mitigation: **keep the three IDs alive** as the primary-sport summary slots (they become "sport-specific callout 1/2/3" whose meaning is set by the active sport's `callouts` array). For kite this keeps semantics identical; for surf the slots become Wave / Period / Wind; for sup they become Wind / Wave / — . This preserves `fetchConditions()`'s existing writes during the transition and means the hero never renders blank.
- **Thunder override regression:** the current code short-circuits at lines 2805-2814. The new `applyGlobalOverrides` MUST be called inside `fetchConditions` before per-sport dispatch — verification checklist item.
- **`#kiteStatus` / `#statusDot` ARIA:** `role="status" aria-live="polite"` must survive. Sport-switch must NOT re-announce on every click (debounce the aria-live region or temporarily set to `off` during sport switch).
- **`localStorage` schema:** namespace as `guston.primarySport` (single key, one of the 6 IDs). Unknown value -> fall back to `kite`.

### 2.3 i18n
- **RTL layout collapse** is the single biggest risk. Index.html is ~2900 lines of flex/grid with many hardcoded **physical properties**: `margin-left`, `padding-right`, `border-left`, `left: 0`, `transform: translateX(...)`. None of these flip automatically under `dir="rtl"`. Mitigation: i18n agent's final CSS pass must convert all physical props in layout-critical rules to **logical properties** (`margin-inline-start`, `padding-inline-end`, `inset-inline-start`, `border-inline-start`). Baseline browser support (2024+) is universal on GH-Pages target audience. Any transform-based slide animations need `[dir=rtl] .foo { transform: scaleX(-1) translateX(...) }` overrides.
- **Compass SVG cardinal letters (N/E/S/W)** are ASCII inside the SVG — they stay English in HE/ES. Decision: **leave them English**, they are universal navigation glyphs. Document this as intentional in a code comment; do NOT translate. (Hebrew compasses widely use Latin NESW.)
- **Number formatting:** Spanish uses `,` decimal and `.` thousands. Every numeric readout (`wind 12.4 kt`, `wave 0.8 m`, `SST 21.3°C`) must route through `Intl.NumberFormat(locale, {maximumFractionDigits:1})`. i18n engine exposes `fmt.num(x, digits)`; all passes must use it.
- **Relative time:** news card "2h ago" must use `Intl.RelativeTimeFormat(locale)`. HE pluralization has dual/many forms — `Intl` handles it natively, do not hand-roll.
- **String collisions:** two different UI slots may want different translations for the same English source (e.g. "Wind" as axis label vs body text). Key by **semantic path** (`verdict.callout.wind`), never by English text.

### 2.4 Calendar (condensed)
- Readability concern: a naive grid of all events in a year will overflow on mobile. Solution in section 5 below.

### 2.5 Sdot Yam station descriptions
- User has confirmed originals are not recoverable. **Stop asking.** Action for the multi-sport pass (which is near the sensor block): write neutral English placeholders — `"Main beach sensor"`, `"North mast"`, `"South buoy"`. Add one HTML comment per description: `<!-- placeholder; rename in follow-up -->`. Do not block the epic on this.

---

## 3. Data Model Bridging — `CONDITIONS` integration point

`fetchConditions()` (lines 2661-2820) currently destructures `data.current` and `marine.current` into local scalars and calls `evaluateKiteConditions(windKts, gustKts, waveH)`.

**Exact integration point:** AFTER both responses parse (currently around line 2800, just before the thunderstorm short-circuit) and BEFORE any DOM write, build the `CONDITIONS` object from the already-extracted locals plus `w.precipitation`, `w.visibility`, `w.is_day`, `w.cape`, `w.weather_code`, marine `wave_direction`, `swell_*`. This is a pure function: no new fetches, no await.

Then:

```js
const CONDITIONS = buildConditions(w, m);           // new helper, ~15 lines
const primary   = localStorage.getItem('guston.primarySport') || 'kite';
const verdicts  = {};
for (const id of Object.keys(SPORTS)) {
  verdicts[id] = SPORTS[id].evaluate(CONDITIONS);   // global overrides applied inside
}
renderSportStrip(verdicts, primary);                // new: the 6-icon strip
renderHero(SPORTS[primary], verdicts[primary], CONDITIONS); // replaces old eval call
```

`renderHero` is the new single writer of `#statusDot / #statusLabel / #statusDesc / #verdictTag / #vpKite / #vpWaves / #vpSuit` — the latter three repurposed to "callout 1/2/3" driven by `SPORTS[primary].callouts(CONDITIONS)`. `evaluateKiteConditions` is deleted (its logic lives in `SPORTS.kite.evaluate`). The thunderstorm short-circuit is removed from `fetchConditions` because `applyGlobalOverrides` inside each sport's evaluator handles it uniformly.

**No measurable perf cost:** 6 evaluators x ~30 lines of arithmetic each run once per fetch. Order of magnitude: microseconds.

---

## 4. Initial Data File Stubs (schema contract owned here, files seeded by devops)

Frontend MUST render immediately before first cron run. devops commits these seeds alongside the workflow.

**`data/news.json` — 2 placeholder items:**

```json
{
  "generated_at": "2026-04-07T00:00:00Z",
  "sources": [{"id": "seed", "name": "Guston", "ok": true, "item_count": 2}],
  "items": [
    {
      "id": "seed-1",
      "source": "seed", "source_name": "Guston",
      "title": "The Lineup is coming online",
      "snippet": "News from IKSurfMag, Windsurf Magazine and Google News will start appearing here after the first scheduled refresh.",
      "url": "https://github.com/", "date": "2026-04-07T00:00:00Z",
      "image": null, "tags": ["kite","wind","wing","surf"]
    },
    {
      "id": "seed-2",
      "source": "seed", "source_name": "Guston",
      "title": "Check back after the first cron run",
      "snippet": "Live feeds refresh every 6 hours. Events refresh daily.",
      "url": "https://github.com/", "date": "2026-04-07T00:00:00Z",
      "image": null, "tags": ["kite"]
    }
  ]
}
```

**`data/events.json` — 3 seeded events:**

```json
{
  "generated_at": "2026-04-07T00:00:00Z",
  "sources": [{"id": "manual", "ok": true, "event_count": 3}],
  "items": [
    {"id":"kota-2026","name":"Red Bull King of the Air","tour":"RedBull","discipline":"big-air","sport":"kite","start_date":"2026-02-01","end_date":"2026-02-14","location":"Cape Town","country":"ZA","url":"https://www.redbull.com/int-en/event-series/red-bull-king-of-the-air","status":"past","tbc":false},
    {"id":"gka-capeverde-2026","name":"GKA Kite World Tour — Cape Verde","tour":"GKA","discipline":"kite-surf","sport":"kite","start_date":"2026-02-16","end_date":"2026-02-21","location":"Sal","country":"CV","url":"https://www.gkakiteworldtour.com/events/","status":"past","tbc":false},
    {"id":"wsl-bells-2026","name":"Rip Curl Pro Bells Beach","tour":"WSL","discipline":"ct","sport":"surf","start_date":"2026-04-01","end_date":"2026-04-11","location":"Bells Beach","country":"AU","url":"https://www.worldsurfleague.com/","status":"live","tbc":false}
  ]
}
```

**Schema contract the frontend assumes (IMMUTABLE once Pass A ships):**
- Top-level: `generated_at` (ISO), `sources` (array, at least empty), `items` (array, possibly empty).
- Every `items[]` field is nullable except `id`, `title`/`name`, `url`.
- `status` computed server-side AND re-computed client-side from `start_date`/`end_date` vs `Date.now()` (defensive).
- `tags` always an array, never a string.

devops MUST NOT change these shapes without a migration. If schema v2 is ever needed, introduce `data/news.v2.json` and dual-read.

---

## 5. Calendar Condensed View — widget spec

**Shape:** a **12-cell horizontal month strip** labeled Jan..Dec, placed ABOVE the vertical events list in the Events column.

**Desktop:**
- `display: grid; grid-template-columns: repeat(12, 1fr); gap: 4px;`
- Each cell: label `JAN` (mono, --subtle), count badge `3` (if >0), and up to 4 colored dots — one per sport present in that month (kite=cyan, wind=blue, wing=teal, surf=indigo, sup=slate, foil=violet).
- Current month: `background: var(--panel-hover)`, 1px `--accent` border.
- Months with a **live** event: the cell pulses (`@keyframes pulse`) and shows a small `var(--good)` dot top-right.
- Hover: tooltip lists event names for that month.
- Click: filters the events list below to that month only; click again to clear. Active cell highlighted. Filter state NOT persisted (session only).

**Mobile (<640px):** same grid but `overflow-x: auto; grid-template-columns: repeat(12, 56px);` with scroll-snap. Current month auto-scrolled into view on mount.

**Why this works:** compresses any number of events into a fixed 12-slot footprint. Readability scales: dots, not names. Click-to-filter makes the dense season calendar actually useful on mobile without tabs.

**Degradation:** if `data/events.json` is empty, render the strip anyway with zero counts — visual placeholder that communicates "season calendar coming soon" better than a blank box.

---

## 6. i18n String Seeding — rough count and plan

Estimate from index.html plus Lineup + multi-sport additions:

| Bucket | Count |
|---|---|
| Section titles + subtitles | 10 |
| Card labels (Wind / Wave / Gust / SST / UV / Visibility / Temp / Precip ...) | 14 |
| Verdict labels (GO / MAYBE / NO-GO / Lightning risk / Blown out / Flat / ...) | 14 |
| Verdict reason/recommendation fragments (reused templates) | 12 |
| Sport names | 6 |
| Sport callout captions | 8 |
| Tooltip / help text | 10 |
| Button + UI labels (Show more, Refresh, Switch sport, Language, ...) | 10 |
| Month names (short + long) | 24 |
| Day-of-week (short + long) | 14 |
| Tour / source names (GKA, WSL, PWA, GWA, Red Bull, IKSURFMAG, Windsurf Mag, Google News) | 8 |
| Empty / error states | 8 |
| Sdot Yam station placeholders | 4 |
| Misc (LIVE, in N days, ago, etc.) | 8 |

**Total: ~140 strings for v1.** (Product brief said ~80; real count is higher once you include reason templates and date labels. Flag for i18n engine agent.)

Rules:
- **English is the source of truth.** HE and ES ship in the same commit. No half-localized builds.
- **Keys are semantic paths** (`verdict.callout.wind`, `lineup.empty.news`), never English text.
- **Date / number formatting** must NOT be baked into strings. Templates use ICU-ish placeholders: `"{kts} kt, gusts {gusts}"`. The renderer calls `fmt.num(kts)` per locale.
- **HE RTL QA required** on the visual pass — visual check of verdict hero, sport strip, Lineup grid, calendar strip, compass wrapper.
- **ES numerics** — verify comma decimal everywhere a number renders.
- Month + day names should come from `Intl.DateTimeFormat` rather than the strings table — less drift, free locale coverage. Only the UI noun "Month" / "Week" is in the strings table.

---

## 7. Verification Checklist (QA agent, end of epic)

Functional:
1. `fetchConditions()` still fires forecast + marine in parallel; console shows no errors.
2. All pre-existing IDs still in the DOM: `#statusDot #statusLabel #statusDesc #verdictTag #vpKite #vpWaves #vpSuit #windArrow #kiteStatus` plus every sensor readout id already written by `fetchConditions`.
3. Sport strip renders 6 tiles; clicking any tile swaps the hero headline, callouts, and icon; choice persists across reload via `guston.primarySport`.
4. Thunder override: force `weather_code=95` in a local test -> every sport shows NO-GO with "Lightning risk" reason.
5. The Lineup section renders between Forecast and Radar; fetches `data/news.json` and `data/events.json`; on HTTP 404 or parse error each column shows its empty state independently.
6. Calendar strip: 12 cells render, current month highlighted, live events pulse, click filters events list, second click clears.
7. `data/events.json` contains KOTA 2026 via the manual list and it renders in the Lineup events column (status correctly computed).
8. Language picker cycles EN -> HE -> ES -> EN; page text changes; HE sets `document.dir='rtl'`; ES numeric readouts use comma decimal.
9. Theme packs (existing feature) still switch correctly after all new CSS — no theme regression.
10. Verdict hero layout identical to pre-refactor for primary=kite in LTR EN (visual diff).

Non-functional:
11. No unhandled promise rejections in the console over a 60s session.
12. Lighthouse CLS < 0.05 on desktop and mobile (the Lineup reserved min-height must hold).
13. Total new JS payload inline in index.html under ~20 KB minified-equivalent (sport registry + Lineup renderer + calendar). i18n engine is external, not counted.
14. First paint of verdict hero not delayed by the Lineup fetch (Lineup fetch is deferred via `requestIdleCallback` or a microtask after hero render).

---

## 8. Scope Trimming (runway contingencies)

If a Wave 2 pass runs out of runway, cut in this exact order. Each cut is independent and leaves the epic shippable.

1. **ES language** — ship EN + HE only. i18n engine is still wired; `strings/es.js` deferred. (Saves ~140 strings of translation review.)
2. **Calendar click-to-filter** — ship the static 12-month strip with counts + dots, drop the interactive filter. Strip remains informational only. (Saves ~40 lines of event-filter state wiring.)
3. **SUP and foil sports** — ship the 4 core sports (kite, wing, windsurf, surf). The registry is list-driven so dropping two entries is a one-line change; the hero still works. (Saves ~60 lines of evaluator logic + 2 icons.)
4. **Sdot Yam descriptions** — leave as `TODO` comments in the HTML with the current "--" text. Non-blocking.
5. **Image thumbnail re-hosting** (was already v2) — hotlink in v1 is accepted per news-brief; do not spend runway on it.

Do NOT cut: Lineup itself, multi-sport core (even at 4 sports), i18n engine wiring (even at 2 languages), thunder override, empty states. Those are load-bearing for the epic's promise.

---

## 9. Summary for the staff-engineer

- Three sequential passes on index.html: **Lineup -> Multi-sport -> i18n**.
- Keep `#vpKite/#vpWaves/#vpSuit` alive as repurposed callout slots.
- Build `CONDITIONS` once inside `fetchConditions` right after both API responses parse, then loop the `SPORTS` registry.
- Lineup fetches `data/news.json` + `data/events.json` with an `AbortController` timeout and independent per-column empty states; renders the 12-month calendar strip above the events list.
- i18n runs last on the finalized DOM; convert physical CSS properties to logical properties in layout-critical rules; leave compass NESW in English; route every number through `Intl.NumberFormat`.
- Ship EN+HE+ES together; cut ES first if runway is tight.
- QA checklist is the gate. No merges past a failing item on the list.
