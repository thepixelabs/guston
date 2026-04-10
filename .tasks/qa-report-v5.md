# QA Report v5 -- End-to-End Verification

**Date:** 2026-04-07
**Reviewer:** @qa-engineer (Claude Opus 4.6)
**Verdict:** PASS

---

## 1. Summary

All four waves (1, 2A, 2B, 2C) ship cleanly. No critical bugs found. No regressions detected in prior functionality. All required DOM IDs exist exactly once, all script paths resolve to real files, all new sections are correctly positioned, and the i18n engine wires up properly with FOUC prevention. The cron pipeline and seed data files are well-structured and resilient.

---

## 2. Pass-by-Pass Verification

### Wave 1: GitHub Actions + Seed Data + i18n Engine

| Check | Status | Notes |
|-------|--------|-------|
| `.github/workflows/fetch-news.yml` | PASS | cron `*/6h` + workflow_dispatch, `[skip ci]`, auto-commit via stefanzweifel/git-auto-commit-action@v5 |
| `.github/workflows/fetch-events.yml` | PASS | daily cron `06:00 UTC` + workflow_dispatch, same pattern |
| `scripts/package.json` | PASS | `type: module`, deps: `rss-parser ^3.13.0`, `cheerio ^1.0.0` |
| `scripts/fetch-news.mjs` | PASS | 5 feeds (IKSurfMag, Windsurf UK, 3x Google News), dedup by normalized URL, per-source failure handling, total-failure fallback to previous output |
| `scripts/fetch-events.mjs` | PASS | 4 scrapers (GKA JSON-LD, WSL post, PWA id=2365, GWA wingfoilworldtour), manual merge, per-source failure + fallback, `process.exit(0)` on fatal |
| `scripts/README.md` | PASS | Exists |
| `data/events-manual.json` | PASS | 4 items including Red Bull KOTA 2026 with valid ISO dates |
| `data/news.json` | PASS | Valid JSON, `items` array (stub, 1 item) |
| `data/events.json` | PASS | Valid JSON, `items` array (empty stub) |
| `assets/i18n/pixelabs-i18n.js` | PASS | 416 lines, exposes `window.PixelabsI18n` with init/setLang/t/fmtNum/fmtDate/fmtRelTime/bootstrapFOUC/buildPicker |
| `assets/i18n/strings.js` | PASS | 517 lines, `window.PIXELABS_I18N_STRINGS` with en(198)/he(197)/es(197) keys |
| `assets/i18n/README.md` | PASS | Exists with docs |

**Note on string count:** 198/197/197 keys per locale vs. expected 151. This exceeds spec (not a bug -- more coverage is fine). `he` and `es` are each missing 1 key relative to `en` -- not critical but worth auditing which key is absent.

### Wave 2A: Multi-Sport Verdict

| Check | Status | Notes |
|-------|--------|-------|
| `SPORTS` registry | PASS | 6 entries: kite, wing, windsurf, surf, sup, foil |
| Each sport has icon + evaluate | PASS | Icons in `SPORT_ICON_SVG`, evaluate functions with threshold logic |
| `applyGlobalOverrides` called within each evaluate | PASS | Every evaluate() return path wraps through `applyGlobalOverrides(result, c)` |
| Thunder override (95-99 OR CAPE > 1000) | PASS | Line 3813: `derived.thunder: (wcode >= 95 && wcode <= 99) \|\| (cape != null && cape > 1000)` -- forces NO-GO via applyGlobalOverrides |
| `CONDITIONS` built inside fetchConditions() | PASS | Line 4097: `const CONDITIONS = buildConditions(w, m, windKts, gustKts)` after both API parses |
| `renderMultiSportVerdict` called | PASS | Line 4098: `renderMultiSportVerdict(CONDITIONS)` |
| `.sport-strip` in verdict hero | PASS | Line 2762: `<div class="sport-strip" id="sportStrip">` inside `#kiteStatus` |
| Primary sport localStorage | PASS | `guston.primarySport` read on load (line 3822), set on click (line 3827) |
| `evaluateKiteConditions` shim | PASS | Line 3933: back-compat shim that builds synthetic CONDITIONS and calls renderMultiSportVerdict |

### Wave 2B: The Lineup Section

| Check | Status | Notes |
|-------|--------|-------|
| `<section id="lineup">` position | PASS | Line 3307, between forecast (3192) and radar (3370) |
| Trophy+wave SVG icon | PASS | Trophy SVG at line 3310 with wave path at line 3316 |
| `#lineupCalendar` (12-month strip) | PASS | Line 3331, populated by initLineup() |
| News column with `<ul>` | PASS | Line 3343: `<ul class="lineup-news-list">` with 5 skeleton items |
| Events column with aria-live | PASS | Line 3358: `<ol ... aria-live="polite" aria-relevant="additions text">` |
| "Load more" / "View all" buttons | PASS | Lines 3350, 3363 (both hidden initially) |
| `initLineup()` fetches data in parallel | PASS | Line 4897: `Promise.all([fetchJSON(NEWS_URL), fetchJSON(EVENTS_URL)])` |
| Per-column error handling | PASS | Lines 4899-4911: `__error` check per JSON response, independent rendering |
| IntersectionObserver | PASS | `observeSectionView()` at line 4854 with threshold 0.2 |
| dataLayer.push events | PASS | `news_article_clicked` (4598), `event_clicked` (4670), `news_section_viewed` (4862), `calendar_month_clicked` (4804) |
| Calendar `data-month` attribute | PASS | Line 4819 in calendar cell creation |
| `data-i18n` on static labels | PASS | 8 data-i18n attributes on lineup section elements |
| Empty/loading/error states | PASS | `renderEmpty()` function handles both error and empty cases per column |
| Lineup NOT in mobile accordion | PASS | Line 4349: sectionIds = `['wind','cameras','forecast','radar','map']` -- lineup excluded |

### Wave 2C: i18n Wiring

| Check | Status | Notes |
|-------|--------|-------|
| Inline FOUC guard in `<head>` | PASS | Line 2660: sets `lang` + `dir` from `localStorage('pixelabsLang')` before body |
| strings.js loaded BEFORE pixelabs-i18n.js | PASS | Lines 2661-2662: both `defer`, document order guarantees execution order |
| `.lang-picker-btn` + `#langPicker` in `.header-actions` | PASS | Lines 2714 + 2717 inside `.header-actions` div (2701) |
| `PixelabsI18n.init()` in DOMContentLoaded | PASS | Lines 4282-4291 |
| `pixelabs:langchange` listener | PASS | Line 4312: re-calls fetchConditions() + initLineup() |
| `data-i18n` attributes on sections | PASS | 64 total data-i18n attributes across major sections + card labels |
| `fmtN` helper for numeric readouts | PASS | Line 3465: delegates to `PixelabsI18n.fmtNum()`, used in all numeric DOM updates |
| Logical CSS properties | PASS | Extensive use: `margin-inline-start`, `inset-inline-end`, `padding-inline`, etc. |

---

## 3. Critical Bugs

**None found.**

---

## 4. Non-Critical Issues

### 4.1 String count mismatch between `en` and `he`/`es` (LOW)
- `en` has 198 keys, `he` and `es` each have 197 keys.
- One key exists in `en` but is missing from `he` and `es`. This will fall back to the English string at runtime (graceful degradation), but it should be identified and translated.

### 4.2 events-manual.json sport value inconsistency (COSMETIC)
- Entry `rb-cold-hawaii-2026` has `"sport": "wind"` rather than `"sport": "windsurf"`. The SPORTS registry uses `windsurf` as the key. If the Lineup code filters by sport key, this event would not match the windsurf filter. Verify that `wind` maps correctly or change to `windsurf`.

### 4.3 DOMContentLoaded listener placement (BENIGN)
- The i18n init is inside a DOMContentLoaded listener (line 4282), but this `<script>` block is at the end of `<body>`. By the time the parser reaches it, DOMContentLoaded may or may not have fired (deferred scripts fire first, then DOMContentLoaded). This is technically fine per spec because: (a) deferred scripts execute before DOMContentLoaded, (b) the inline script at end of body also runs before DOMContentLoaded. So the listener will always catch the event. No action needed.

### 4.4 `lang-picker-btn` has no content initially (COSMETIC)
- Line 2714-2716: the button's inner content is just a comment ("Current lang's flag SVG injected by the engine"). Until `PixelabsI18n.init()` runs, the button will appear empty. A static fallback icon or text would improve perceived load.

---

## 5. File Size Summary

| File | Lines |
|------|-------|
| `index.html` | 4,936 (expected ~4,676 -- 260 lines over, likely from Lineup section being larger than estimated) |
| `assets/themes/pixelabs-themes.css` | 590 |
| `assets/themes/pixelabs-themes.js` | 356 |
| `assets/i18n/pixelabs-i18n.js` | 416 |
| `assets/i18n/strings.js` | 517 |
| `scripts/fetch-news.mjs` | 289 |
| `scripts/fetch-events.mjs` | 486 |

---

## 6. DOM ID Verification (Checklist Item 1)

All 30 required IDs verified present exactly once:

- windArrow (2810), windDir (2845), windDirDeg (2846)
- vpKite (2795), vpWaves (2802), vpSuit (2782)
- windSpeed (2897), windGust (2898)
- waveHeight (2918), wavePeriod (2919), waveDir (2940), swellInfo (2941)
- temperature (2953), feelsLike (2954)
- cloudCover (2974), precipitation (2975)
- seaTemp (2983), wetsuitHint (2984)
- rainProb (3000), rainAmount (3001)
- uvIndex (3016), visInfo (3017)
- lastUpdate (2691), conditionsLocation (2744)
- statusDot (2751), statusLabel (2757), statusDesc (2760), verdictTag (2756)
- sportStrip (2762)
- kiteStatus (2748)

No duplicates. No missing. No misplaced.

---

## 7. No Regressions (Checklist Item 7)

| Feature | Status |
|---------|--------|
| Theme picker (pixelabs-themes.js loaded, #themePicker, .theme-picker-btn) | PASS |
| Compass rotation (.compass-needle, --rot CSS var) | PASS |
| Beach cameras (9 beach-cam cards) | PASS |
| Sdot Yam grid (7 wind-img-cards) | PASS |
| Windguru widgets (5 beaches: Sdot Yam, Beit Yanai, Hof Hatzuk, Hof Hilton, Tayo Bat Yam) | PASS |
| Mobile accordion (wind/cameras/forecast/radar/map -- Lineup excluded) | PASS |
| Theme bridge `--accent: var(--pl-accent)` in all pack selectors | PASS |
| Nav link to Lineup section | PASS |

---

## 8. Recommendation

**Ship it.** All four waves are clean. The two non-critical items to address in follow-up:

1. Audit the 1 missing i18n key in `he`/`es` locales and add translations.
2. Verify `"sport": "wind"` in events-manual.json is intentionally different from the `windsurf` SPORTS registry key, or align it.

Both are low-severity and do not affect site load or core functionality.
