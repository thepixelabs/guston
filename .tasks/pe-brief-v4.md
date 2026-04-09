# PE Brief v4 — Multi-sport Verdicts + i18n

**Author:** Product/Growth Engineer
**Target implementer:** staff-engineer (single pass for F1; separate pass for F2)
**File under change:** `/Users/netz/Documents/git/guston/index.html` (monolith; no build step)
**Research inputs read:**
- `index.html` lines 1841-1908 (`.verdict-hero` DOM)
- `index.html` lines 2587-2647 (`evaluateKiteConditions`)
- `index.html` lines 2661-2820 (`fetchConditions`)

---

## Current-state findings (ground truth)

### `fetchConditions()` (lines 2661-2820)
- Fires Open-Meteo forecast + marine in parallel.
- Forecast fields already fetched: `temperature_2m, apparent_temperature, wind_speed_10m, wind_direction_10m, wind_gusts_10m, cloud_cover, precipitation, precipitation_probability, weather_code, uv_index, visibility, is_day, cape`.
- Marine fields: `wave_height, wave_period, wave_direction, swell_wave_height, swell_wave_period, swell_wave_direction, sea_surface_temperature`.
- **Good news:** everything the multi-sport system needs (wind dir, wave dir, wave period, gusts, weather code, CAPE, SST) is already on the wire. No new API calls required.
- Thunderstorm override (lines 2805-2814) short-circuits the kite evaluator. The multi-sport refactor must preserve this global safety override — lightning = NO-GO for every water sport.

### `evaluateKiteConditions(windKnots, gustKnots, waveHeight)` (lines 2587-2647)
- Takes 3 scalars; produces `{status, label, desc, cls, kiteSize}` as DOM side-effects.
- Thresholds: `>=12 && <=30` GO, `>=8 && <12` MAYBE, `>30` NO-GO, `<8` NO-GO.
- Writes to: `#statusDot`, `#statusLabel`, `#statusDesc`, `#verdictTag`, `#vpKite`, `#vpWaves`. (`#vpSuit` is written by `fetchConditions`, not the evaluator.)
- Uses smiley SVGs injected into `#statusDot` based on status.

### `.verdict-hero` DOM structure (lines 1841-1908)
```
.kite-status.verdict-hero #kiteStatus
├── .status-indicator.maybe #statusDot (left — icon)
├── .status-text
│   ├── .verdict-headline
│   │   ├── .verdict-tag #verdictTag  (GO/MAYBE/NO-GO pill)
│   │   └── strong #statusLabel        ("Conditions are rideable")
│   └── .verdict-desc-row span#statusDesc
└── .verdict-right
    ├── .verdict-callouts
    │   ├── .suit-callout  → #vpSuit
    │   ├── .kite-callout  → #vpKite
    │   └── .waves-callout → #vpWaves
    └── .verdict-compass-wrap #windArrow (compass rose SVG)
```

---

# Feature 1 — Multi-sport Go/No-Go verdict

## Success criteria (define BEFORE building)
1. User can see at-a-glance the verdict for every supported sport without any click.
2. User can pick a "primary sport"; it persists across reloads (`localStorage.guston.primarySport`).
3. The big hero pill always reflects the primary sport's verdict (so the old single-verdict UX is preserved for defaults = kite).
4. Thunderstorm override applies to ALL sports (shared kill-switch).
5. Zero new API calls; no measurable TTFB regression.
6. Instrumentation: one event `sport_verdict_rendered` per fetch per sport, fields `{sport, verdict, windKts, waveH, isPrimary}`. (If no analytics wired, emit `console.debug` with the same payload under a `window.__GUSTON_DEBUG` flag — hook comes free later.)

## 1.1 Sports covered (final list)

| id | Name | Notes |
|---|---|---|
| `kite` | Kitesurfing | existing baseline |
| `wing` | Wing foiling | user listed |
| `windsurf` | Windsurfing | user listed |
| `surf` | Surfing | user listed |
| `sup` | SUP (paddle) | user listed |
| `foil` | Surf foiling | **added** — tolerates tiny waves where surf fails; natural pair to wing/kite foil crowd |

Skipped: longboarding (subset of `surf`, not worth separate logic), swim/snorkel (not a "sport" the user asked for).

## 1.2 Per-sport threshold table (justified)

Wind in **knots** (kt), waves in **metres**, period in **seconds**. "Offshore" = wind direction within ±60° of opposite of wave direction (good for surf). Mediterranean Israel context: waves are short-period wind chop most days.

| Sport | Wind GO | Wind MAYBE | Wave GO | Wave NO-GO | Direction rule | Extra |
|---|---|---|---|---|---|---|
| kite | 12–30 | 8–11.9 light / 30–35 heavy | any <2.5 | >2.5m or breaking | gust factor `gust/wind > 1.5` → downgrade | already shipped; preserve |
| wing | 12–25 | 10–11.9 or 25–30 | 0–2m | >2m | offshore ideal; gusts tolerated more than kite | reduce upper bound (wings depower worse than kites >25) |
| windsurf | 14–32 | 10–13.9 light / 32–38 heavy | 0–1.5m | >2m | onshore/side-shore OK | needs more wind than kite for planing; gust-tolerant |
| surf | 0–15 | 15–20 | ≥0.5m & period ≥6s | <0.3m or wind >22 | **offshore wind required for GO**; onshore → MAYBE; strong onshore → NO-GO | light wind + period = clean faces |
| sup | 0–10 | 10–14 | <0.4m | >0.6m or wind >16 | any (sheltered flat ideal) | gusts >18 → NO-GO |
| foil | 8–22 | 5–7.9 or 22–28 | 0.3–2m ideal | >2.5m | offshore/side preferred | works in wind-wave or swell |

Justifications (1-liners):
- **Kite**: unchanged, battle-tested.
- **Wing**: wings stall upwind; 25kt is practical max for recreational riders, 30 for experts only.
- **Windsurf**: sail area >> kite projected area, so boards need ~2kt more to plane; upper bound higher because booms don't backstall like kites.
- **Surf**: Mediterranean is fetch-limited; 0.5m @ 6s is the "it's breaking" threshold locally. Offshore is the classic clean-face rule.
- **SUP**: anything >16kt is a paddling slog; >0.6m wave breaks balance for cruisers.
- **Foil**: needs less wave height than surf (foil lifts early) and less wind than kite (efficient). Fills the "nothing else works" shoulder hours.

### Thunderstorm/weather rules (shared)
- `weather_code` 95–99 OR `cape > 1000` → all sports = NO-GO with reason "Lightning risk".
- `precipitation >= 4 mm/h` → downgrade every sport one step (GO→MAYBE, MAYBE→NO-GO).
- `visibility < 1000m` → all sports MAYBE minimum, surf/foil → NO-GO (reef hazard).

## 1.3 Data model — the `CONDITIONS` object

Build once in `fetchConditions` after both API responses parse, pass into every evaluator:

```js
const CONDITIONS = {
  wind: { kts: windKts, gustKts, dirDeg: windDeg, gustFactor: gustKts / Math.max(windKts, 1) },
  wave: { heightM: waveH, periodS: waveP, dirDeg: waveD },
  swell: { heightM: swellH, periodS: swellP, dirDeg: swellD },
  weather: { code: wcode, cape, precipMmH: w.precipitation ?? 0, visibilityM: w.visibility, isDay: w.is_day },
  sea: { tempC: sst },
  derived: {
    thunder: (wcode >= 95 && wcode <= 99) || (cape != null && cape > 1000),
    // offshore = wind blowing FROM land TO sea = wind direction roughly opposite wave direction
    offshoreDelta: angleDelta((windDeg + 180) % 360, waveD), // 0 = perfectly offshore
  }
};
```

Helper:
```js
function angleDelta(a, b) { const d = Math.abs(a - b) % 360; return d > 180 ? 360 - d : d; }
```

## 1.4 Sport registry + evaluators (complete JS)

```js
// ---- shared helpers ----
const VERDICT = { GO: 'go', MAYBE: 'maybe', NOGO: 'nogo' };

function downgrade(v) {
  return v === VERDICT.GO ? VERDICT.MAYBE : v === VERDICT.MAYBE ? VERDICT.NOGO : VERDICT.NOGO;
}

function applyGlobalOverrides(result, c) {
  if (c.derived.thunder) return { verdict: VERDICT.NOGO, reason: 'Lightning risk — stay out of the water.', recommendation: 'Wait for the front to pass.' };
  let v = result.verdict;
  if ((c.weather.precipMmH ?? 0) >= 4) v = downgrade(v);
  if ((c.weather.visibilityM ?? 9999) < 1000) v = downgrade(v);
  return { ...result, verdict: v };
}

// ---- registry ----
const SPORTS = {
  kite: {
    id: 'kite', name: 'Kitesurf', icon: 'kite',
    evaluate(c) {
      const w = c.wind.kts, g = c.wind.gustKts;
      let verdict, reason, recommendation;
      if (w >= 12 && w <= 30) {
        verdict = VERDICT.GO;
        const size = w < 16 ? '12-14m' : w < 22 ? '9-12m' : w < 28 ? '7-9m' : '5-7m';
        reason = `${w} kt sustained, gusts ${g} kt.`;
        recommendation = `Kite: ${size}.`;
      } else if (w >= 8 && w < 12) {
        verdict = VERDICT.MAYBE; reason = `${w} kt is light.`; recommendation = 'Foil or 14m+.';
      } else if (w > 30) {
        verdict = VERDICT.NOGO; reason = `${w} kt with ${g} kt gusts — dangerous.`; recommendation = 'Stay on the beach.';
      } else {
        verdict = VERDICT.NOGO; reason = `${w} kt is too light.`; recommendation = 'Check the forecast.';
      }
      if (verdict === VERDICT.GO && c.wind.gustFactor > 1.5) { verdict = VERDICT.MAYBE; reason += ' Very gusty.'; }
      return applyGlobalOverrides({ verdict, reason, recommendation }, c);
    }
  },

  wing: {
    id: 'wing', name: 'Wing Foil', icon: 'wing',
    evaluate(c) {
      const w = c.wind.kts;
      let verdict, reason, recommendation;
      if (w >= 12 && w <= 25) { verdict = VERDICT.GO; reason = `${w} kt — wing territory.`; recommendation = w < 16 ? '5-6m wing' : w < 20 ? '4-5m wing' : '3-4m wing'; }
      else if ((w >= 10 && w < 12) || (w > 25 && w <= 30)) { verdict = VERDICT.MAYBE; reason = `${w} kt marginal.`; recommendation = w < 12 ? 'Big wing + foil' : 'Small wing, experts only'; }
      else { verdict = VERDICT.NOGO; reason = w < 10 ? `${w} kt too light.` : `${w} kt too strong.`; recommendation = '—'; }
      return applyGlobalOverrides({ verdict, reason, recommendation }, c);
    }
  },

  windsurf: {
    id: 'windsurf', name: 'Windsurf', icon: 'windsurf',
    evaluate(c) {
      const w = c.wind.kts;
      let verdict, reason, recommendation;
      if (w >= 14 && w <= 32) { verdict = VERDICT.GO; reason = `${w} kt — planing.`; recommendation = w < 18 ? '6.5-7.5m sail' : w < 24 ? '5.5-6.5m' : w < 28 ? '4.5-5.5m' : '4.0m'; }
      else if ((w >= 10 && w < 14) || (w > 32 && w <= 38)) { verdict = VERDICT.MAYBE; reason = `${w} kt.`; recommendation = w < 14 ? 'Big sail / light wind board' : 'Experts only'; }
      else { verdict = VERDICT.NOGO; reason = w < 10 ? 'Not enough wind.' : 'Dangerously strong.'; recommendation = '—'; }
      return applyGlobalOverrides({ verdict, reason, recommendation }, c);
    }
  },

  surf: {
    id: 'surf', name: 'Surf', icon: 'surf',
    evaluate(c) {
      const w = c.wind.kts, h = c.wave.heightM ?? 0, p = c.wave.periodS ?? 0, off = c.derived.offshoreDelta;
      let verdict, reason, recommendation;
      if (h < 0.3) return applyGlobalOverrides({ verdict: VERDICT.NOGO, reason: `Only ${h}m — flat.`, recommendation: 'Try SUP or foil.' }, c);
      if (w > 22) return applyGlobalOverrides({ verdict: VERDICT.NOGO, reason: `${w} kt — blown out.`, recommendation: 'Check a sheltered spot.' }, c);
      const windy = w > 15;
      const onshore = off > 90;
      if (h >= 0.5 && p >= 6 && !windy && !onshore) { verdict = VERDICT.GO; reason = `${h}m @ ${p}s, ${off.toFixed(0)}° off-shore delta.`; recommendation = h < 1 ? 'Longboard / fish' : 'Shortboard'; }
      else if (h >= 0.4 && p >= 5) { verdict = VERDICT.MAYBE; reason = onshore ? 'Onshore wind — messy.' : 'Short period / light wind.'; recommendation = 'Fish or mid-length.'; }
      else { verdict = VERDICT.NOGO; reason = 'Not enough swell.'; recommendation = '—'; }
      return applyGlobalOverrides({ verdict, reason, recommendation }, c);
    }
  },

  sup: {
    id: 'sup', name: 'SUP', icon: 'sup',
    evaluate(c) {
      const w = c.wind.kts, g = c.wind.gustKts, h = c.wave.heightM ?? 0;
      let verdict, reason, recommendation;
      if (w <= 10 && h < 0.4) { verdict = VERDICT.GO; reason = `${w} kt, ${h}m — glassy.`; recommendation = 'All-round board.'; }
      else if (w <= 14 && h < 0.6) { verdict = VERDICT.MAYBE; reason = `${w} kt, ${h}m — workable upwind.`; recommendation = 'Touring board.'; }
      else { verdict = VERDICT.NOGO; reason = w > 14 ? `${w} kt too strong.` : `${h}m chop.`; recommendation = '—'; }
      if (g > 18) { verdict = VERDICT.NOGO; reason += ` Gusts ${g} kt.`; }
      return applyGlobalOverrides({ verdict, reason, recommendation }, c);
    }
  },

  foil: {
    id: 'foil', name: 'Surf Foil', icon: 'foil',
    evaluate(c) {
      const w = c.wind.kts, h = c.wave.heightM ?? 0, p = c.wave.periodS ?? 0;
      let verdict, reason, recommendation;
      if (h > 2.5) return applyGlobalOverrides({ verdict: VERDICT.NOGO, reason: `${h}m too big for foil.`, recommendation: 'Surf instead.' }, c);
      if (h >= 0.3 && h <= 2 && w <= 22) { verdict = VERDICT.GO; reason = `${h}m${p ? ` @ ${p}s` : ''} — foilable.`; recommendation = w > 14 ? 'Wing-assist' : 'Tow or pump'; }
      else if (h >= 0.2 || w >= 8) { verdict = VERDICT.MAYBE; reason = 'Marginal lift.'; recommendation = 'Big-surface foil.'; }
      else { verdict = VERDICT.NOGO; reason = 'Nothing to lift on.'; recommendation = '—'; }
      return applyGlobalOverrides({ verdict, reason, recommendation }, c);
    }
  }
};

// Back-compat shim — keeps any external callers alive.
function evaluateKiteConditions(windKts, gustKts, waveH) {
  return evaluateSport('kite', {
    wind: { kts: windKts, gustKts, dirDeg: 0, gustFactor: gustKts / Math.max(windKts, 1) },
    wave: { heightM: waveH, periodS: 0, dirDeg: 0 },
    swell: {}, weather: {}, sea: {},
    derived: { thunder: false, offshoreDelta: 0 }
  });
}

function evaluateSport(id, conditions) { return SPORTS[id].evaluate(conditions); }
function evaluateAllSports(conditions) {
  return Object.values(SPORTS).map(s => ({ id: s.id, name: s.name, icon: s.icon, ...s.evaluate(conditions) }));
}
```

## 1.5 UI layout — recommendation: **Option D** (primary pill + strip)

Rationale: preserves the existing one-big-pill UX (no regression for users who only kite), introduces zero learning curve, and gives glanceable multi-sport awareness in a single row below. Carousel (B) hides info behind swipe; grid (C) demotes the primary sport; strip (A) fights the compass rose for attention.

### Proposed markup

```html
<div class="kite-status verdict-hero" id="kiteStatus" role="status" aria-live="polite">
  <!-- PRIMARY verdict (existing slots, preserved) -->
  <div class="status-indicator maybe" id="statusDot"><!-- smiley --></div>
  <div class="status-text">
    <div class="verdict-headline">
      <span class="verdict-tag" id="verdictTag">--</span>
      <strong id="statusLabel">Checking conditions…</strong>
      <!-- NEW: primary sport badge (click to change) -->
      <button type="button" class="primary-sport-btn" id="primarySportBtn" aria-label="Change primary sport">
        <svg class="psb-icon"><!-- current sport icon --></svg>
        <span id="primarySportName">Kitesurf</span>
        <svg class="psb-caret" viewBox="0 0 12 12"><path d="M3 5l3 3 3-3"/></svg>
      </button>
    </div>
    <div class="verdict-desc-row"><span id="statusDesc">Fetching live wind and wave data</span></div>

    <!-- NEW: multi-sport strip -->
    <div class="sport-strip" id="sportStrip" role="tablist" aria-label="Verdicts by sport">
      <!-- JS renders 6 buttons here -->
    </div>
  </div>
  <div class="verdict-right">
    <!-- unchanged: callouts + compass rose -->
  </div>
</div>
```

### Sport-strip item template (JS-generated)

```html
<button class="sport-chip go" data-sport="kite" role="tab" aria-selected="true" aria-label="Kitesurf: GO">
  <svg class="sport-chip-icon"><!-- 20x20 icon --></svg>
  <span class="sport-chip-name">Kite</span>
  <span class="sport-chip-verdict">GO</span>
</button>
```

### CSS sketch

```css
.sport-strip { display: flex; gap: 8px; margin-top: 10px; flex-wrap: wrap; }
.sport-chip {
  display: inline-flex; align-items: center; gap: 6px;
  padding: 6px 10px; border-radius: 999px;
  background: var(--panel); border: 1px solid var(--border);
  font-size: 0.78rem; font-weight: 600; cursor: pointer;
  transition: transform .15s ease, background .15s ease;
}
.sport-chip:hover { transform: translateY(-1px); }
.sport-chip.go      { border-color: rgba(92,255,177,.5); background: rgba(92,255,177,.08); }
.sport-chip.maybe   { border-color: rgba(255,209,102,.5); background: rgba(255,209,102,.08); }
.sport-chip.nogo    { border-color: rgba(255,92,124,.5); background: rgba(255,92,124,.08); }
.sport-chip[aria-selected="true"] { outline: 2px solid var(--accent); outline-offset: 2px; }
.sport-chip-verdict { font-size: 0.68rem; opacity: 0.85; }
.primary-sport-btn { display:inline-flex; gap:4px; align-items:center; background:none; border:1px dashed var(--border); border-radius: 8px; padding: 2px 8px; font-size: 0.72rem; margin-left: 8px; cursor:pointer; }
```

### Rendering logic

```js
function renderMultiSportVerdict(conditions) {
  const primaryId = localStorage.getItem('guston.primarySport') || 'kite';
  const results = evaluateAllSports(conditions);
  const primary = results.find(r => r.id === primaryId) || results[0];

  // Paint hero (replaces the old evaluateKiteConditions() call)
  applyPrimaryVerdict(primary);

  // Paint strip
  const strip = document.getElementById('sportStrip');
  strip.innerHTML = results.map(r => `
    <button class="sport-chip ${r.verdict}" data-sport="${r.id}" role="tab"
            aria-selected="${r.id === primaryId}" aria-label="${r.name}: ${r.verdict.toUpperCase()}">
      ${SPORT_ICON_SVG[r.icon]}
      <span class="sport-chip-name">${r.name}</span>
      <span class="sport-chip-verdict">${r.verdict.toUpperCase()}</span>
    </button>
  `).join('');
  strip.querySelectorAll('.sport-chip').forEach(btn => {
    btn.addEventListener('click', () => {
      localStorage.setItem('guston.primarySport', btn.dataset.sport);
      renderMultiSportVerdict(conditions);
    });
  });

  // Debug/analytics
  results.forEach(r => window.__GUSTON_DEBUG && console.debug('sport_verdict_rendered', { sport: r.id, verdict: r.verdict, isPrimary: r.id === primaryId }));
}
```

`applyPrimaryVerdict(primary)` is the refactored body of the old `evaluateKiteConditions`: writes `#statusDot`, `#statusLabel`, `#statusDesc`, `#verdictTag`, `#primarySportName`, and the per-sport recommendation into `#vpKite` (now repurposed as "Gear" slot — see §1.8).

## 1.6 Sport icon concepts (text brief for CT to draw)

All 24×24, stroke-based, 1.8 stroke-width, matches existing section icons. No fills.

| id | Concept |
|---|---|
| `kite` | Diamond kite (two intersecting lines in a rhombus outline) + two curved control lines hanging from bottom apex to a small rider silhouette. |
| `wing` | Handheld wing outline (crescent with central strut) + a small foil board beneath (ellipse + vertical mast line). |
| `windsurf` | Triangle sail with vertical mast, curved boom line, short horizontal board at base. |
| `surf` | Pointed surfboard (elongated leaf shape) angled 30°, with a simple wave curl underneath. |
| `sup` | Long flat board viewed from 3/4, a standing figure (circle head + line body) holding a single paddle. |
| `foil` | Surfboard top + vertical mast + horizontal front wing + smaller rear wing (T-shape under board). |

## 1.7 Per-sport conditions grid labels — recommendation: **static grid + relevance badges**

Adapting the conditions grid to the primary sport is clever but confuses users who glance twice. Instead keep the grid stable, add tiny sport-relevance indicators to each card: a row of 2-3 micro-icons ("who cares about this metric") below the metric label, with the **primary sport's icon highlighted** if that metric matters to it.

Example: "Wind Direction" card shows mini-icons [surf, wing] dimmed, and if primary=surf, the surf icon glows. Low implementation cost (~30 lines CSS, a `data-matters-to="surf,wing"` attribute on each card).

## 1.8 DOM ID disposition

| Existing ID | Fate |
|---|---|
| `statusDot` | **keep** — now reflects primary sport's verdict icon. |
| `statusLabel` | **keep** — primary sport label. |
| `statusDesc` | **keep** — primary sport reason + recommendation. |
| `verdictTag` | **keep** — primary sport GO/MAYBE/NOGO pill. |
| `vpKite` | **repurpose** → generic "Gear" slot (`primary.recommendation`). Rename the CSS class but leave the ID for DOM stability; update the label `<span class="suit-label">` text to `Gear`. |
| `vpWaves` | **keep** — unchanged. |
| `vpSuit` | **keep** — unchanged. |
| **NEW** `sportStrip` | new strip container. |
| **NEW** `primarySportBtn` / `primarySportName` | new primary-sport picker. |

## 1.9 Primary-sport picker UX

- `.primary-sport-btn` inline next to `#statusLabel`.
- Click = simple cycle **and** long-press / right-click = open a mini popover listing all 6 sports (progressive enhancement; skip popover in v1 if time-pressed — cycling is enough).
- **v1 recommendation:** click = cycle through sports in a fixed order (kite → wing → windsurf → surf → sup → foil). Persist via `localStorage.guston.primarySport`. Emit `primary_sport_changed` debug event.
- Default = `kite` (this is Guston, a kite dashboard).
- Alternative: **chips in the strip are already clickable** (see `renderMultiSportVerdict`). We get selection for free — the dedicated button is actually redundant. **Ship v1 WITHOUT the `.primary-sport-btn`**, rely on strip clicks. Add the button only if UX feedback says the strip is unclear.

> **Decision:** Drop `.primary-sport-btn` from v1. Use strip-click-to-promote. Simpler, fewer new elements, one interaction path.

## 1.10 Data requirements check

All data needed is already fetched. No new Open-Meteo params required.

## 1.11 Apply order for the staff engineer

1. Add `angleDelta`, `VERDICT`, `downgrade`, `applyGlobalOverrides` helpers near the top of the script block (above `evaluateKiteConditions`).
2. Add `SPORTS` registry + `evaluateSport` + `evaluateAllSports`.
3. Replace the body of `evaluateKiteConditions` with the back-compat shim (keeps any callers alive; but since `fetchConditions` will be updated, this shim becomes dormant — keep it anyway for safety).
4. Add `SPORT_ICON_SVG` object mapping sport id → 20×20 inline SVG strings (6 entries).
5. Add `.sport-strip` + `.sport-chip` CSS in the existing `<style>` block.
6. Inject `<div class="sport-strip" id="sportStrip">` into `.verdict-hero` markup (after `.verdict-desc-row`).
7. In `fetchConditions`, after building the `CONDITIONS` object (new step, replacing the scalar extraction), call `renderMultiSportVerdict(CONDITIONS)` instead of `evaluateKiteConditions(...)`. Keep the thunderstorm branch calling the same function (`applyGlobalOverrides` handles the override inside each evaluator — no special branch needed).
8. Rename the `Kite` label to `Gear` in `.kite-callout` (keep `#vpKite` id).
9. Manual QA: cycle through all 6 sports via strip clicks, verify each transitions the hero pill, verify thunderstorm conditions (set `weather_code=95` in devtools) produce NO-GO for every sport, verify `localStorage` persists across reloads.
10. Commit. Budget: 1 focused day.

---

# Feature 2 — i18n (EN / HE / ES) with language switcher

## Success criteria
1. User can switch language from header without reload.
2. Preference persists (`localStorage.pixelabsLang`).
3. No FOUC — language applied in head before first paint.
4. HE triggers RTL layout that doesn't visually break any section (zero horizontal-scroll bugs, zero clipped text, compass rose N/E/S/W letters remain in English).
5. Missing keys silently fall back to EN.
6. Portable: drop-in `pixelabs-i18n.js` that other Pixelabs sites can reuse.

## 2.1 Architecture — **data-attribute driven** (option c)

Chosen because: no build, no async JSON fetch race, easy to grep for `data-i18n=` and audit coverage, matches how `pixelabs-themes.js` already works.

### File structure

```
assets/
├── pixelabs-themes.js        (existing)
├── pixelabs-i18n.js          (new — portable)
└── i18n/
    ├── en.js                 (inline, assigns to window.PXL_I18N.en)
    ├── he.js
    └── es.js
```

Each locale file is a plain `<script>` (no JSON fetch) that writes into `window.PXL_I18N[lang] = { ... }`. This avoids CORS/file:// issues and keeps the no-build promise.

Alternatively (simpler for Guston's monolith): inline a single `PXL_I18N` object at the top of `<head>`:

```js
window.PXL_I18N = {
  en: { 'conditions.title': 'Current Conditions', /* ... */ },
  he: { 'conditions.title': 'תנאים נוכחיים', /* ... */ },
  es: { 'conditions.title': 'Condiciones actuales', /* ... */ }
};
```

**Recommendation:** inline for Guston v1; extract to `pixelabs-i18n.js` only if/when a second site adopts it.

## 2.2 String count estimate

Rough audit (from grepping section titles, labels, buttons, ARIA):

| Category | Approx count |
|---|---|
| Section titles | 10 |
| Verdict labels + descriptions (per sport, assuming F1 shipped) | 6 sports × ~6 reasons = 36 |
| Metric card labels (wind speed, direction, gust, waves, period, swell, temp, feels-like, sea temp, cloud, rain, rain prob, UV, vis, wetsuit, kite size) | ~22 |
| Button labels (beach filters, collapse, refresh) | ~8 |
| ARIA labels | ~15 |
| Tooltip text | ~10 |
| Footer + header microcopy | ~8 |
| **Total** | **~110 strings** |

~110 × 3 languages = ~330 lines in the strings file. Manageable. Beach names stay in English (proper nouns); optional: add Hebrew transliterations as `<span lang="he">` overrides for HE mode only.

## 2.3 Strings schema (sample)

Namespaced dotted keys:

```js
{
  'header.title': 'Guston',
  'header.subtitle': 'Live kite conditions for the Israeli coast',
  'nav.conditions': 'Current Conditions',
  'nav.forecast': 'Forecast',
  'nav.beaches': 'Beaches',
  'verdict.go': 'GO',
  'verdict.maybe': 'MAYBE',
  'verdict.nogo': 'NO-GO',
  'verdict.checking': 'Checking conditions…',
  'verdict.fetchFail': 'Unable to fetch live data',
  'card.windSpeed.label': 'Wind Speed',
  'card.windDir.label': 'Wind Direction',
  'card.waveHeight.label': 'Wave Height',
  'card.wavePeriod.label': 'Wave Period',
  'card.seaTemp.label': 'Sea Temperature',
  'card.uv.label': 'UV Index',
  'unit.kts': 'kts',
  'unit.m': 'm',
  'unit.s': 's',
  'sport.kite': 'Kitesurf',
  'sport.wing': 'Wing Foil',
  'sport.windsurf': 'Windsurf',
  'sport.surf': 'Surf',
  'sport.sup': 'SUP',
  'sport.foil': 'Surf Foil',
  'btn.refresh': 'Refresh',
  'aria.langPicker': 'Select language',
  // ...
}
```

## 2.4 HTML markup pattern

```html
<span class="section-title-text" data-i18n="nav.conditions">Current Conditions</span>
<span data-i18n="card.windSpeed.label">Wind Speed</span>
<button data-i18n="btn.refresh" aria-label data-i18n-aria="aria.refresh">Refresh</button>
```

Two attribute forms:
- `data-i18n="key"` — replace `textContent`.
- `data-i18n-attr-<attrname>="key"` — replace an attribute (e.g. `data-i18n-attr-aria-label="aria.refresh"`).

## 2.5 `pixelabs-i18n.js` (the engine)

```js
(function () {
  const LS_KEY = 'pixelabsLang';
  const DEFAULT = 'en';
  const SUPPORTED = ['en', 'he', 'es'];
  const RTL = new Set(['he', 'ar', 'fa']);

  function current() {
    const saved = localStorage.getItem(LS_KEY);
    return SUPPORTED.includes(saved) ? saved : DEFAULT;
  }

  function t(key, lang) {
    const dict = (window.PXL_I18N || {})[lang || current()] || {};
    if (dict[key] != null) return dict[key];
    const en = (window.PXL_I18N || {}).en || {};
    return en[key] != null ? en[key] : key;
  }

  function applyTo(root, lang) {
    lang = lang || current();
    // textContent
    root.querySelectorAll('[data-i18n]').forEach(el => {
      el.textContent = t(el.getAttribute('data-i18n'), lang);
    });
    // attribute form: data-i18n-attr-<attr>
    root.querySelectorAll('*').forEach(el => {
      for (const a of el.attributes) {
        const m = a.name.match(/^data-i18n-attr-(.+)$/);
        if (m) el.setAttribute(m[1], t(a.value, lang));
      }
    });
    // doc-level flips
    document.documentElement.lang = lang;
    document.documentElement.dir = RTL.has(lang) ? 'rtl' : 'ltr';
  }

  function setLang(lang) {
    if (!SUPPORTED.includes(lang)) return;
    localStorage.setItem(LS_KEY, lang);
    applyTo(document, lang);
    window.dispatchEvent(new CustomEvent('pxl:langchange', { detail: { lang } }));
  }

  window.PXL_I18N_API = { t, setLang, current, applyTo };
  document.addEventListener('DOMContentLoaded', () => applyTo(document));
})();
```

## 2.6 FOUC guard (inline head script, mirrors theme pattern)

```html
<script>
  (function () {
    try {
      var l = localStorage.getItem('pixelabsLang') || 'en';
      document.documentElement.lang = l;
      document.documentElement.dir = (l === 'he') ? 'rtl' : 'ltr';
    } catch (e) {}
  })();
</script>
```

Place BEFORE any CSS. This sets `dir` before the first paint; the full text swap happens after DOMContentLoaded (imperceptible on fast machines; if any FOUC visible, move the `applyTo` call into a `DOMContentLoaded` fallback inside the inline script).

## 2.7 Language picker markup

```html
<div class="lang-picker" id="langPicker">
  <button type="button" class="lang-picker-btn" id="langPickerBtn" aria-haspopup="menu" aria-expanded="false" aria-label="Select language">
    <span class="lang-flag" id="langFlagCurrent"><!-- current flag SVG --></span>
    <svg class="lang-caret" viewBox="0 0 12 12" width="10" height="10"><path d="M3 5l3 3 3-3" stroke="currentColor" fill="none" stroke-width="1.6"/></svg>
  </button>
  <div class="lang-picker-menu" role="menu" hidden>
    <button role="menuitem" data-lang="en"><span class="lang-flag">[EN flag]</span> English</button>
    <button role="menuitem" data-lang="he"><span class="lang-flag">[HE flag]</span> עברית</button>
    <button role="menuitem" data-lang="es"><span class="lang-flag">[ES flag]</span> Español</button>
  </div>
</div>
```

CSS: mini-dropdown to the left of `.theme-picker-btn` inside `.header-actions`. Flag circle 20×20. Menu absolutely positioned, width ~140px.

Click handler:
```js
document.querySelectorAll('.lang-picker-menu [data-lang]').forEach(btn => {
  btn.addEventListener('click', () => {
    PXL_I18N_API.setLang(btn.dataset.lang);
    document.getElementById('langFlagCurrent').innerHTML = FLAGS[btn.dataset.lang];
    document.querySelector('.lang-picker-menu').hidden = true;
  });
});
```

## 2.8 Inline flag SVGs (~20 lines each, minimalist, circular crop via `<clipPath>`)

```js
const FLAGS = {
  en: `<svg viewBox="0 0 24 24" width="20" height="20" aria-hidden="true">
    <defs><clipPath id="f-en"><circle cx="12" cy="12" r="11"/></clipPath></defs>
    <g clip-path="url(#f-en)">
      <rect width="24" height="24" fill="#bf0a30"/>
      <rect y="2" width="24" height="2" fill="#fff"/>
      <rect y="6" width="24" height="2" fill="#fff"/>
      <rect y="10" width="24" height="2" fill="#fff"/>
      <rect y="14" width="24" height="2" fill="#fff"/>
      <rect y="18" width="24" height="2" fill="#fff"/>
      <rect y="22" width="24" height="2" fill="#fff"/>
      <rect width="11" height="12" fill="#002868"/>
    </g>
    <circle cx="12" cy="12" r="11" fill="none" stroke="rgba(0,0,0,.2)"/>
  </svg>`,

  he: `<svg viewBox="0 0 24 24" width="20" height="20" aria-hidden="true">
    <defs><clipPath id="f-he"><circle cx="12" cy="12" r="11"/></clipPath></defs>
    <g clip-path="url(#f-he)">
      <rect width="24" height="24" fill="#fff"/>
      <rect y="4" width="24" height="2" fill="#0038b8"/>
      <rect y="18" width="24" height="2" fill="#0038b8"/>
      <path d="M12 9 L14.6 13.5 L9.4 13.5 Z" fill="none" stroke="#0038b8" stroke-width="1"/>
      <path d="M12 15 L14.6 10.5 L9.4 10.5 Z" fill="none" stroke="#0038b8" stroke-width="1"/>
    </g>
    <circle cx="12" cy="12" r="11" fill="none" stroke="rgba(0,0,0,.2)"/>
  </svg>`,

  es: `<svg viewBox="0 0 24 24" width="20" height="20" aria-hidden="true">
    <defs><clipPath id="f-es"><circle cx="12" cy="12" r="11"/></clipPath></defs>
    <g clip-path="url(#f-es)">
      <rect width="24" height="24" fill="#aa151b"/>
      <rect y="6" width="24" height="12" fill="#f1bf00"/>
    </g>
    <circle cx="12" cy="12" r="11" fill="none" stroke="rgba(0,0,0,.2)"/>
  </svg>`
};
```

## 2.9 RTL strategy — minimal override list

Approach: flip `<html dir="rtl">` and let CSS logical properties do 80% of the work. Then hunt physical properties and fix them.

Audit targets (grep `margin-left|margin-right|padding-left|padding-right|left:|right:|text-align: left|text-align: right` in `index.html` CSS):

| Likely offender | Fix |
|---|---|
| `.header-actions { ... margin-left: auto }` | → `margin-inline-start: auto` |
| `.verdict-tag` left/right padding | switch to `padding-inline` |
| Anything with `left: Npx` or `right: Npx` in absolute positioning | add `[dir="rtl"] .X { left: auto; right: Npx }` overrides |
| Flex rows that must keep visual order (sport strip, numeric callouts) | add `[dir="rtl"] .sport-strip { flex-direction: row-reverse }` if they flip undesirably — usually auto-flipping is correct |
| Compass rose N/E/S/W letters (SVG `<text>`) | **DO NOT FLIP** — cardinal directions are language-agnostic. Wrap the SVG in `[dir="rtl"] .compass-rose svg { direction: ltr }` |
| `.card-unit` (e.g. `18 kts`) | numbers in Hebrew stay LTR naturally; wrap in `<bdi>` if they bleed |
| Charts / sparklines with fixed-direction scales | add `[dir="rtl"] .chart { direction: ltr }` |
| Timestamp "Updated 14:32" | wrap time in `<bdi>` |

**Deliverable for the staff engineer:** a single `[dir="rtl"] { ... }` CSS block at the bottom of `<style>` with ~15-25 targeted overrides, created iteratively by QA-ing each section visually in HE mode.

## 2.10 Spanish — flag for user

> ES adds real complexity: a third translation to maintain, number-formatting edge cases (decimal comma), and a target audience that may not exist. Recommend: **ship EN+HE first**, add ES only if there's a confirmed audience. The architecture supports it trivially — just add `es.js` / `window.PXL_I18N.es` later.

## 2.11 Numeric formatting

Wrap number-unit renders through a helper:
```js
function fmtNum(n, lang = PXL_I18N_API.current()) {
  if (n == null || Number.isNaN(n)) return '--';
  return new Intl.NumberFormat(lang === 'he' ? 'he-IL' : lang === 'es' ? 'es-ES' : 'en-US',
    { maximumFractionDigits: 1 }).format(n);
}
```
Use it at the `fetchConditions()` render points (`windKts`, `waveH`, `sst`, etc). Minimal blast radius: ~15 call sites.

## 2.12 Portability strategy

- Keep `pixelabs-i18n.js` zero-dependency.
- Strings object is consumer-owned (`window.PXL_I18N`), engine-agnostic.
- `data-i18n` attribute convention is generic.
- FOUC-guard inline snippet is the same 6-line block any site can paste.
- Publish as `assets/pixelabs-i18n.js` alongside the theme pack. Guston is the reference consumer.

## 2.13 Apply order for the staff engineer (F2)

1. Inline `window.PXL_I18N = { en: {...}, he: {...}, es: {...} }` in `<head>`.
2. Add the FOUC-guard inline script right after it.
3. Add `pixelabs-i18n.js` (engine) either inline or external.
4. Add `FLAGS` object + language picker markup into `.header-actions` (before or after theme button).
5. Sweep `index.html` DOM: add `data-i18n="..."` attributes to every visible string. (This is the bulk of the work — ~110 sites.)
6. Add `[dir="rtl"]` override CSS block.
7. QA in HE: visually scan every section, fix RTL bugs iteratively.
8. Add `fmtNum()` and apply at ~15 render sites in `fetchConditions()`.
9. (Optional) Extract to `assets/pixelabs-i18n.js` + `assets/pixelabs-flags.js` for portability.
10. Commit. Budget: 2-3 days (most of it is the string sweep + RTL QA).

---

# Shipping priority (recommendation to the user)

1. **F1 Multi-sport verdict FIRST.** Single staff-engineer pass, ~1 day, high user value, low risk. All data is already on the wire, all DOM IDs can be preserved.
2. **F2 i18n as a SEPARATE follow-up session.** RTL is visual — it needs eyeballs and iterative QA that one-shot coding cannot guarantee. Also: the ES requirement is soft — flag it to the user and ask if EN+HE is enough for v1.

**Do not bundle F1+F2 in one pass.** They touch overlapping DOM (verdict hero gets new chips; i18n needs `data-i18n` on those same chips). If bundled, the staff engineer will either miss i18n keys on the new chips or the test matrix explodes. Ship F1, let it settle, then sweep the whole page for i18n including F1's new nodes in one shot.
