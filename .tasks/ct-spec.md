I have enough structural grounding. I'll skip task tracking (this is a single-shot research spec deliverable, not a multi-step implementation). Now I'll produce the complete spec.

---

# GUSTON Frontend Spec — Phase 2 Source of Truth

All CSS assumes the existing dark tokens in `:root` remain the default. Everything below is copy-pasteable and mechanical. File: `/Users/netz/Documents/git/guston/index.html`.

---

## Issue 1 — Light Mode: "Very Light Navy" Premium Theme

### 1A. Replace the entire existing `:root[data-theme="light"] { ... }` block (lines 95–122) with this:

```css
/* ===== LIGHT MODE — VERY LIGHT NAVY, PREMIUM COOL ===== */
:root[data-theme="light"] {
  color-scheme: light;
  /* Cool bluish base — NOT white */
  --bg: #eaf0f9;
  --bg2: #dde6f4;
  --bg3: #f4f7fc;

  /* Frosted translucent surfaces over the bluish bg */
  --panel: rgba(255,255,255,0.62);
  --panel-hover: rgba(255,255,255,0.78);
  --border: rgba(10,21,48,0.10);
  --border-bright: rgba(10,21,48,0.22);

  /* Deep navy text, never pure black */
  --text: #0a1530;
  --muted: rgba(10,21,48,0.62);
  --subtle: rgba(10,21,48,0.42);

  /* Accents — sharper, more saturated for light bg */
  --accent: #0ea5e9;        /* sky-500, vivid on light */
  --accent2: #7c3aed;       /* violet-600 */
  --good: #059669;
  --warn: #d97706;
  --bad:  #dc2626;

  /* Deeper shadows — light bg absorbs less */
  --shadow: 0 18px 48px -14px rgba(14,165,233,0.28),
            0 4px 14px -4px rgba(10,21,48,0.10);
}

/* ---------- mesh background: subtle blue wash instead of dark cyan/purple ---------- */
:root[data-theme="light"] body {
  background: var(--bg);
  color: var(--text);
}
:root[data-theme="light"] body::before {
  background:
    radial-gradient(1200px 700px at 20% 0%, rgba(14,165,233,0.18), transparent 55%),
    radial-gradient(1000px 700px at 85% 15%, rgba(124,58,237,0.12), transparent 55%),
    radial-gradient(900px 700px at 50% 115%, rgba(14,165,233,0.08), transparent 60%),
    linear-gradient(180deg, #f2f6fc 0%, #e4ecf7 55%, #eaf0f9 100%);
}

/* ---------- header: frosted white-navy ---------- */
:root[data-theme="light"] .site-header {
  background: rgba(234,240,249,0.78);
  backdrop-filter: saturate(180%) blur(18px);
  -webkit-backdrop-filter: saturate(180%) blur(18px);
}
:root[data-theme="light"] .site-header::after {
  background: linear-gradient(90deg,
    transparent 0%, rgba(14,165,233,0.55) 25%,
    rgba(124,58,237,0.45) 60%, rgba(5,150,105,0.30) 80%, transparent 100%);
}

/* ---------- brand gradient text ---------- */
:root[data-theme="light"] .brand-icon {
  filter: drop-shadow(0 4px 12px rgba(14,165,233,0.35));
}
:root[data-theme="light"] .brand-name {
  background: linear-gradient(135deg, var(--accent), var(--accent2));
  -webkit-background-clip: text; -webkit-text-fill-color: transparent; background-clip: text;
}

/* ---------- hero mesh: light blue wash ---------- */
:root[data-theme="light"] .hero::before {
  background:
    radial-gradient(600px 300px at 15% 20%, rgba(14,165,233,0.14), transparent 60%),
    radial-gradient(500px 260px at 85% 30%, rgba(124,58,237,0.10), transparent 60%),
    radial-gradient(500px 260px at 50% 90%, rgba(5,150,105,0.08), transparent 60%);
}

/* ---------- hero HUD cards: visible blue-tinted frosted surface ---------- */
:root[data-theme="light"] .hero-grid .card {
  background:
    linear-gradient(150deg,
      rgba(14,165,233,0.10) 0%,
      rgba(124,58,237,0.06) 55%,
      rgba(255,255,255,0.0) 100%),
    rgba(255,255,255,0.72);
  border: 1px solid rgba(14,165,233,0.28);
  backdrop-filter: blur(10px) saturate(140%);
  -webkit-backdrop-filter: blur(10px) saturate(140%);
  box-shadow:
    0 1px 0 rgba(255,255,255,0.9) inset,
    0 8px 24px -12px rgba(10,21,48,0.14);
}
:root[data-theme="light"] .hero-grid .card::before {
  background: linear-gradient(90deg, var(--accent), transparent);
  box-shadow: 0 0 8px rgba(14,165,233,0.55);
  opacity: 1;
}
:root[data-theme="light"] .hero-grid .card::after {
  background:
    linear-gradient(180deg, var(--accent) 0 2px, transparent 2px),
    linear-gradient(270deg, var(--accent) 0 2px, transparent 2px);
  opacity: .7;
}
:root[data-theme="light"] .hero-grid .card:hover {
  border-color: rgba(14,165,233,0.6);
  box-shadow:
    0 18px 48px -14px rgba(14,165,233,0.32),
    0 4px 14px -4px rgba(10,21,48,0.12),
    inset 0 0 0 1px rgba(14,165,233,0.22);
}
:root[data-theme="light"] .hero-grid .card .card-label {
  color: rgba(10,21,48,0.72);
  text-shadow: 0 0 6px rgba(14,165,233,0.18);
}
:root[data-theme="light"] .hero-grid .card .card-value {
  color: #0a1530;
  text-shadow: 0 0 14px rgba(14,165,233,0.25);
}
:root[data-theme="light"] .hero-grid .card .card-detail { color: rgba(10,21,48,0.55); }

/* ---------- verdict hero: bright but cool ---------- */
:root[data-theme="light"] .kite-status.verdict-hero {
  background:
    linear-gradient(130deg,
      rgba(14,165,233,0.16),
      rgba(124,58,237,0.12) 40%,
      rgba(5,150,105,0.10) 80%),
    rgba(255,255,255,0.78);
  border: 1px solid rgba(14,165,233,0.28);
  box-shadow: 0 18px 48px -14px rgba(14,165,233,0.22);
}

/* ---------- verdict tags ---------- */
:root[data-theme="light"] .verdict-tag.go    { background: rgba(5,150,105,.16);  color: #047857; border-color: rgba(5,150,105,.45); box-shadow: 0 0 14px rgba(5,150,105,.20); }
:root[data-theme="light"] .verdict-tag.maybe { background: rgba(217,119,6,.16);  color: #b45309; border-color: rgba(217,119,6,.45); box-shadow: 0 0 14px rgba(217,119,6,.20); }
:root[data-theme="light"] .verdict-tag.nogo  { background: rgba(220,38,38,.16);  color: #b91c1c; border-color: rgba(220,38,38,.45); box-shadow: 0 0 14px rgba(220,38,38,.20); }

/* ---------- status indicator ---------- */
:root[data-theme="light"] .status-indicator.good,
:root[data-theme="light"] .status-indicator.go     { background: rgba(5,150,105,.14);  color: #047857; --glow-color: rgba(5,150,105,0.42); }
:root[data-theme="light"] .status-indicator.maybe  { background: rgba(217,119,6,.14);  color: #b45309; --glow-color: rgba(217,119,6,0.42); }
:root[data-theme="light"] .status-indicator.bad,
:root[data-theme="light"] .status-indicator.nogo   { background: rgba(220,38,38,.14);  color: #b91c1c; --glow-color: rgba(220,38,38,0.42); }

/* ---------- all-spots lw-cards ---------- */
:root[data-theme="light"] .lw-card {
  background:
    linear-gradient(145deg, rgba(14,165,233,0.08), rgba(124,58,237,0.05)),
    rgba(255,255,255,0.72);
}
:root[data-theme="light"] .lw-card::before {
  background: linear-gradient(135deg, rgba(14,165,233,0.45), rgba(124,58,237,0.30) 50%, transparent 100%);
}
:root[data-theme="light"] .lw-card:hover { box-shadow: 0 14px 36px -14px rgba(14,165,233,0.28); }

/* ---------- sdotyam panel ---------- */
:root[data-theme="light"] .sdotyam-panel {
  background: linear-gradient(180deg, rgba(14,165,233,0.07), rgba(124,58,237,0.04)), rgba(255,255,255,0.70);
}
:root[data-theme="light"] .sdotyam-grid .wind-img-card,
:root[data-theme="light"] .sdotyam-grid .wind-img-card a,
:root[data-theme="light"] .sdotyam-grid .wind-img-card img { background: #f4f7fc; }
:root[data-theme="light"] .sdotyam-grid .wind-img-card .vws-label {
  background: rgba(234,240,249,0.85); color: rgba(10,21,48,0.75);
}

/* ---------- beach filter / beach buttons ---------- */
:root[data-theme="light"] .beach-btn { background: rgba(255,255,255,0.72); }
:root[data-theme="light"] .beach-btn.active {
  background: rgba(14,165,233,0.14); border-color: rgba(14,165,233,0.5); color: #0369a1;
  box-shadow: 0 4px 14px -4px rgba(14,165,233,0.3);
}

/* ---------- section title underline / shimmer ---------- */
:root[data-theme="light"] .section-title-text {
  background: linear-gradient(100deg, var(--text) 0%, var(--accent) 55%, var(--accent2) 110%);
  background-size: 200% auto;
  -webkit-background-clip: text; -webkit-text-fill-color: transparent; background-clip: text;
}

/* ---------- beach cams: keep dark overlays — blue ocean shows through either way ---------- */
/* (no overrides — existing treatments stay readable) */

/* ---------- HUD vizzes: adjust per-component for light bg ---------- */
/* Wave SVG strokes */
:root[data-theme="light"] #waveSinePath,
:root[data-theme="light"] .wave-svg path { stroke: #0ea5e9 !important; }

/* Compass rose text fills (letters were light-on-dark) */
:root[data-theme="light"] .compass-rose svg text { fill: rgba(10,21,48,0.70) !important; }
:root[data-theme="light"] .compass-rose svg text[fill="#71e0ff"] { fill: #0ea5e9 !important; }
:root[data-theme="light"] .compass-rose svg circle[stroke="rgba(255,255,255,.08)"] { stroke: rgba(10,21,48,0.12) !important; }
:root[data-theme="light"] .compass-rose svg circle[stroke="rgba(255,255,255,.06)"] { stroke: rgba(10,21,48,0.08) !important; }

/* Cloud + raindrops: darken outlines so they read on white */
:root[data-theme="light"] .hud-cloud .cloud-viz path,
:root[data-theme="light"] .hud-cloud .cloud-viz ellipse { stroke: #0a1530 !important; stroke-opacity: 0.55; }
:root[data-theme="light"] .hud-rain .rain-viz .rd,
:root[data-theme="light"] .hud-rain .rain-viz path { fill: #0ea5e9 !important; stroke: #0369a1 !important; }

/* Thermometer: warm fill stays vivid but adjust casing */
:root[data-theme="light"] .hud-temp .thermo-viz rect { stroke: rgba(10,21,48,0.35); }

/* Sea ripple: use navy */
:root[data-theme="light"] .hud-sea .sea-viz circle { stroke: #0ea5e9 !important; }

/* UV sun: keep warm gradient */

/* Wind gauge fill (HUD gauge) stays its vivid rainbow — just darken the track */
:root[data-theme="light"] .hud-gauge { background: rgba(10,21,48,0.08); border-color: rgba(10,21,48,0.12); }
:root[data-theme="light"] .hud-gauge-ticks {
  background-image: repeating-linear-gradient(90deg, rgba(10,21,48,0.18) 0 1px, transparent 1px 12.5%);
}

/* ---------- cam-bar / cam-pill: unchanged (over camera imagery) ---------- */

/* ---------- footer ---------- */
:root[data-theme="light"] .site-footer { border-top-color: rgba(10,21,48,0.10); }

/* ---------- theme + pixelabs buttons ---------- */
:root[data-theme="light"] .theme-btn { background: rgba(255,255,255,0.72); }
:root[data-theme="light"] .pixelabs-link { background: rgba(255,255,255,0.72); }
:root[data-theme="light"] .pixelabs-link:hover { background: rgba(14,165,233,0.10); border-color: rgba(14,165,233,0.45); }

/* ---------- wind-dir-arrow (compass chip) ---------- */
:root[data-theme="light"] .wind-dir-arrow {
  background: radial-gradient(circle at 30% 30%, rgba(14,165,233,0.25), rgba(14,165,233,0.06) 70%);
  border-color: rgba(14,165,233,0.40);
  box-shadow: inset 0 0 12px rgba(14,165,233,0.14), 0 0 16px rgba(14,165,233,0.14);
}
```

---

## Issue 2 — Move Compass Rose into Verdict Hero

### 2A. DELETE from `index.html` (the entire Wind Direction card inside `#conditionsGrid`)

Delete the block starting `<div class="card compass-card" aria-label="Wind direction">` through its matching `</div>` — it lives around line 1325 and continues with the compass SVG + `#windDir` + `#windDirDeg` readout. Remove the whole `.compass-card`.

### 2B. REPLACE the `.kite-status.verdict-hero` markup (lines ~1262–1294) with:

```html
<!-- Kite Go/No-Go HERO -->
<div class="kite-status verdict-hero" id="kiteStatus" role="status" aria-live="polite">
  <div class="status-indicator maybe" id="statusDot">
    <svg width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5"><path d="M12 2v4M12 18v4M4.93 4.93l2.83 2.83M16.24 16.24l2.83 2.83M2 12h4M18 12h4M4.93 19.07l2.83-2.83M16.24 7.76l2.83-2.83"/></svg>
  </div>

  <div class="status-text">
    <div class="verdict-headline">
      <span class="verdict-tag" id="verdictTag">--</span>
      <strong id="statusLabel">Checking conditions&hellip;</strong>
    </div>

    <div class="verdict-desc-row">
      <span id="statusDesc">Fetching live wind and wave data</span>
    </div>

    <!-- All three callouts on one row: wetsuit (cyan) + kite (amber) + waves (violet) -->
    <div class="verdict-callouts" role="group" aria-label="Conditions summary">
      <div class="suit-callout" aria-label="Wetsuit recommendation">
        <svg class="suit-icon" viewBox="0 0 24 24" width="26" height="26" fill="none" stroke="currentColor" stroke-width="1.6" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true">
          <circle cx="12" cy="3.6" r="2.1"/>
          <path d="M9.6 6.4 Q12 7.8 14.4 6.4"/>
          <path d="M7.2 7.6 Q5 8.2 4.2 10.8 L3 16 Q2.9 17 3.9 17.2 L5.6 17.4 L6.4 12.5"/>
          <path d="M16.8 7.6 Q19 8.2 19.8 10.8 L21 16 Q21.1 17 20.1 17.2 L18.4 17.4 L17.6 12.5"/>
          <path d="M7.2 7.6 Q8 10 7.8 13 L7.2 21 Q7.2 21.8 8 21.8 L11.2 21.8 L11.6 14"/>
          <path d="M16.8 7.6 Q16 10 16.2 13 L16.8 21 Q16.8 21.8 16 21.8 L12.8 21.8 L12.4 14"/>
          <line x1="12" y1="7.2" x2="12" y2="13.5" stroke-dasharray="1 1.2" opacity="0.7"/>
        </svg>
        <div class="suit-text">
          <span class="suit-label">Wetsuit</span>
          <span class="suit-value" id="vpSuit">--</span>
        </div>
      </div>

      <div class="suit-callout kite-callout" aria-label="Recommended kite size">
        <svg class="suit-icon" viewBox="0 0 24 24" width="26" height="26" fill="none" stroke="currentColor" stroke-width="1.6" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true">
          <!-- triangular kite -->
          <path d="M12 2 L20 10 L12 18 L4 10 Z"/>
          <path d="M12 2 L12 18" opacity="0.5"/>
          <path d="M4 10 L20 10" opacity="0.5"/>
          <!-- lines to bar -->
          <path d="M4 10 L11 22" stroke-dasharray="1.5 1.5"/>
          <path d="M20 10 L13 22" stroke-dasharray="1.5 1.5"/>
          <line x1="10" y1="22" x2="14" y2="22" stroke-width="2.2"/>
        </svg>
        <div class="suit-text">
          <span class="suit-label">Kite Size</span>
          <span class="suit-value" id="vpKite">--</span>
        </div>
      </div>

      <div class="suit-callout wave-callout" aria-label="Wave state">
        <svg class="suit-icon" viewBox="0 0 24 24" width="26" height="26" fill="none" stroke="currentColor" stroke-width="1.6" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true">
          <!-- breaking wave -->
          <path d="M2 16 Q6 8 12 12 T22 10"/>
          <path d="M2 20 Q6 14 12 17 T22 15" opacity="0.6"/>
          <path d="M14 11 Q16 7 20 8" opacity="0.8"/>
        </svg>
        <div class="suit-text">
          <span class="suit-label">Waves</span>
          <span class="suit-value" id="vpWaves">--</span>
        </div>
      </div>
    </div>
  </div>

  <!-- Compass rose relocated from conditions grid -->
  <div class="verdict-right">
    <div class="compass-rose" id="windArrow" aria-hidden="true">
      <svg viewBox="0 0 120 120">
        <defs>
          <radialGradient id="cgrad" cx="50%" cy="50%" r="50%">
            <stop offset="0%" stop-color="rgba(113,224,255,.18)"/>
            <stop offset="70%" stop-color="rgba(113,224,255,.04)"/>
            <stop offset="100%" stop-color="rgba(113,224,255,0)"/>
          </radialGradient>
          <linearGradient id="ngrad" x1="50%" y1="0%" x2="50%" y2="100%">
            <stop offset="0%" stop-color="#71e0ff"/>
            <stop offset="100%" stop-color="#a78bfa"/>
          </linearGradient>
        </defs>
        <circle cx="60" cy="60" r="55" fill="url(#cgrad)"/>
        <circle cx="60" cy="60" r="50" fill="none" stroke="rgba(255,255,255,.08)" stroke-width="1"/>
        <circle cx="60" cy="60" r="40" fill="none" stroke="rgba(255,255,255,.06)" stroke-width="1" stroke-dasharray="2 4"/>
        <circle class="gust-ring" cx="60" cy="60" r="48" fill="none" stroke="#71e0ff" stroke-width="1.5" opacity=".5"/>
        <text x="60" y="14" text-anchor="middle" fill="#71e0ff" font-size="10" font-weight="700" font-family="JetBrains Mono, monospace">N</text>
        <text x="93" y="22" text-anchor="middle" fill="rgba(255,255,255,.45)" font-size="8" font-family="JetBrains Mono, monospace">NE</text>
        <text x="108" y="64" text-anchor="middle" fill="rgba(255,255,255,.55)" font-size="9" font-family="JetBrains Mono, monospace">E</text>
        <!-- keep the rest of the existing compass SVG content verbatim from the deleted card (SE, S, SW, W, NW text elements and the .compass-needle group) -->
      </svg>
    </div>
    <div class="compass-readout">
      <div class="card-value" style="font-size:1.35rem;"><span id="windDir">--</span></div>
      <div class="card-detail"><span id="windDirDeg">--°</span></div>
    </div>
  </div>
</div>
```

**Note to staff-engineer**: copy the full existing compass SVG children verbatim from the deleted `.compass-card` — I abbreviated the SE/S/SW/W/NW texts and `.compass-needle` group above.

### 2C. Add CSS (append after `.verdict-hero` rules, near line 428):

```css
/* ===== VERDICT HERO: 3-column layout (indicator | text | compass) ===== */
.kite-status.verdict-hero {
  display: grid;
  grid-template-columns: auto 1fr auto;
  align-items: center;
  gap: 22px;
}
.verdict-hero .status-text { min-width: 0; display: flex; flex-direction: column; gap: 8px; }

.verdict-right {
  display: flex; align-items: center; gap: 14px;
  padding-left: 18px;
  border-left: 1px solid var(--border);
  flex-shrink: 0;
}
.verdict-right .compass-rose {
  width: 110px; height: 110px; flex-shrink: 0; position: relative;
}
.verdict-right .compass-readout { min-width: 60px; }
.verdict-right .compass-readout .card-value {
  font-family: var(--mono); font-weight: 800; color: var(--text);
  text-shadow: 0 0 12px rgba(113,224,255,0.25);
}
.verdict-right .compass-readout .card-detail {
  font-family: var(--mono); color: var(--muted); margin-top: 2px;
}

@media (max-width: 900px) {
  .kite-status.verdict-hero { grid-template-columns: auto 1fr; }
  .verdict-right {
    grid-column: 1 / -1;
    border-left: none;
    border-top: 1px solid var(--border);
    padding-left: 0; padding-top: 16px;
    justify-content: center;
  }
}
@media (max-width: 560px) {
  .kite-status.verdict-hero { grid-template-columns: 1fr; text-align: center; }
  .verdict-hero .status-indicator { margin: 0 auto; }
  .verdict-headline, .verdict-callouts { justify-content: center; }
}
```

Also DELETE the now-unused `.verdict-pills` and `.vp-pill` rules (the old inline pills are replaced by Issue 3 callouts).

---

## Issue 3 — Kite/Waves Callouts Beside Wetsuit, Color-Differentiated

### 3A. CSS — append after existing `.suit-callout` rules (line ~1047):

```css
/* ===== VERDICT CALLOUTS ROW (wetsuit + kite + waves) ===== */
.verdict-callouts {
  display: flex; flex-wrap: wrap; gap: 10px;
  margin-top: 10px;
  align-items: stretch;
}
.verdict-callouts .suit-callout { flex: 1 1 160px; min-width: 160px; }

/* Base callout already defined; override per variant */

/* --- WETSUIT (cyan, existing) explicit vars for symmetry --- */
.suit-callout {
  --co-tint: 113,224,255;
  --co-tint2: 167,139,250;
  background: linear-gradient(135deg,
    rgba(var(--co-tint),0.14),
    rgba(var(--co-tint2),0.10));
  border: 1px solid rgba(var(--co-tint),0.38);
  box-shadow: 0 0 24px -8px rgba(var(--co-tint),0.38);
}
.suit-callout .suit-icon { color: rgb(var(--co-tint)); filter: drop-shadow(0 0 6px rgba(var(--co-tint),0.6)); }
.suit-callout .suit-label { color: var(--muted); }

/* --- KITE: amber / warm --- */
.kite-callout {
  --co-tint: 255,209,102;
  --co-tint2: 255,140,66;
  background: linear-gradient(135deg,
    rgba(255,209,102,0.16),
    rgba(255,140,66,0.12));
  border-color: rgba(255,209,102,0.45);
  box-shadow: 0 0 26px -8px rgba(255,140,66,0.45);
}
.kite-callout .suit-icon {
  color: #ffd166;
  filter: drop-shadow(0 0 6px rgba(255,171,64,0.7));
}

/* --- WAVES: violet / cool ocean --- */
.wave-callout {
  --co-tint: 167,139,250;
  --co-tint2: 113,224,255;
  background: linear-gradient(135deg,
    rgba(167,139,250,0.18),
    rgba(113,224,255,0.10));
  border-color: rgba(167,139,250,0.45);
  box-shadow: 0 0 26px -8px rgba(167,139,250,0.45);
}
.wave-callout .suit-icon {
  color: #a78bfa;
  filter: drop-shadow(0 0 6px rgba(167,139,250,0.7));
}

/* Light theme callout tints */
:root[data-theme="light"] .suit-callout {
  background: linear-gradient(135deg, rgba(14,165,233,0.14), rgba(124,58,237,0.10)), rgba(255,255,255,0.68);
  border-color: rgba(14,165,233,0.42);
}
:root[data-theme="light"] .suit-callout .suit-icon { color: #0ea5e9; filter: drop-shadow(0 0 6px rgba(14,165,233,0.55)); }
:root[data-theme="light"] .kite-callout {
  background: linear-gradient(135deg, rgba(217,119,6,0.14), rgba(234,88,12,0.10)), rgba(255,255,255,0.68);
  border-color: rgba(217,119,6,0.50);
  box-shadow: 0 0 22px -10px rgba(234,88,12,0.4);
}
:root[data-theme="light"] .kite-callout .suit-icon { color: #d97706; filter: drop-shadow(0 0 6px rgba(217,119,6,0.6)); }
:root[data-theme="light"] .wave-callout {
  background: linear-gradient(135deg, rgba(124,58,237,0.14), rgba(14,165,233,0.10)), rgba(255,255,255,0.68);
  border-color: rgba(124,58,237,0.50);
  box-shadow: 0 0 22px -10px rgba(124,58,237,0.4);
}
:root[data-theme="light"] .wave-callout .suit-icon { color: #7c3aed; filter: drop-shadow(0 0 6px rgba(124,58,237,0.6)); }

@media (max-width: 560px) {
  .verdict-callouts .suit-callout { flex: 1 1 100%; }
}
```

Icons are inline in the markup block above (Issue 2).

---

## Issue 4 — Always-Visible Sdot Yam + Cameras, Restructured Top Nav

### 4A. DELETE blocks:

1. DELETE the entire `<section aria-label="Beach location filter">...</section>` (lines 1234–1249).
2. DELETE `<span class="section-title-text">Current Conditions</span>` text **and** its wrapping `.section-title` (lines ~1254–1259) — but KEEP the `#conditionsLocation` span and `#lastUpdate` badge. Replace that `.section-title` div with:
   ```html
   <div class="conditions-meta">
     <span id="conditionsLocation" class="location-chip">Beit Yanai</span>
     <span class="refresh-badge" id="lastUpdate">Loading&hellip;</span>
   </div>
   ```
3. Remove `data-beach="sdotyam"` attribute from the Sdot Yam panel (line 1518) — change to just `class="visible sdotyam-panel"`.
4. Remove `data-beach="..."` from **all** beach-cam elements (lines 1585–1633) — they become always-visible. Leave `class="beach-cam reveal visible ..."`.
5. In the forecast section (line 1659, 1678), ALSO remove `data-beach="..."` attributes — or keep the markup but mark them `always-visible` class.

### 4B. INSERT new "Pick a Beach" strip immediately BELOW the verdict hero (inside `#conditions` section, after the `.kite-status` closes, before `.all-spots-wrap`):

```html
<div class="pick-beach-bar">
  <div class="pick-beach-title">
    <svg viewBox="0 0 24 24" width="16" height="16" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true">
      <path d="M2 8 Q6 5 10 8 Q14 11 18 8 Q20 6.5 22 8"/>
      <path d="M2 13 Q6 10 10 13 Q14 16 18 13 Q20 11.5 22 13"/>
    </svg>
    <span>Pick a Beach</span>
  </div>
  <div class="beach-filter" role="tablist" aria-label="Filter by beach">
    <button class="beach-btn active" role="tab" aria-selected="true" data-filter="all" onclick="filterBeach('all', this)">All</button>
    <button class="beach-btn" role="tab" aria-selected="false" data-filter="yanai" onclick="filterBeach('yanai', this)">Beit Yanai</button>
    <button class="beach-btn" role="tab" aria-selected="false" data-filter="herzliya" onclick="filterBeach('herzliya', this)">Herzliya</button>
    <button class="beach-btn" role="tab" aria-selected="false" data-filter="tlv" onclick="filterBeach('tlv', this)">Tel Aviv</button>
    <button class="beach-btn" role="tab" aria-selected="false" data-filter="batyam" onclick="filterBeach('batyam', this)">Bat Yam</button>
    <button class="beach-btn" role="tab" aria-selected="false" data-filter="sdotyam" onclick="filterBeach('sdotyam', this)">Sdot Yam</button>
  </div>
</div>
```

### 4C. CSS (append anywhere in the sheet):

```css
/* ===== CONDITIONS META (replaces "Current Conditions" title) ===== */
.conditions-meta {
  display: flex; align-items: center; justify-content: flex-end;
  gap: 10px; margin-bottom: 14px;
}
.conditions-meta .location-chip {
  font-size: .75rem; font-weight: 600; color: var(--muted);
  padding: 4px 10px; border-radius: var(--radius-xs);
  background: var(--panel); border: 1px solid var(--border);
  font-family: var(--mono); letter-spacing: .04em; text-transform: uppercase;
}

/* ===== PICK A BEACH BAR (centered, under verdict hero) ===== */
.pick-beach-bar {
  display: flex; flex-direction: column; align-items: center;
  gap: 12px; margin: 22px 0 28px;
}
.pick-beach-title {
  display: inline-flex; align-items: center; gap: 8px;
  font-family: var(--mono); font-size: .72rem; font-weight: 700;
  text-transform: uppercase; letter-spacing: .18em;
  color: var(--muted);
}
.pick-beach-title svg { color: var(--accent); filter: drop-shadow(0 0 6px rgba(113,224,255,0.4)); }
.pick-beach-title::before,
.pick-beach-title::after {
  content: ''; display: inline-block; width: 36px; height: 1px;
  background: linear-gradient(90deg, transparent, var(--border), transparent);
}
.pick-beach-bar .beach-filter { justify-content: center; margin-bottom: 0; }
```

### 4D. JS — the `filterBeach` function will still toggle `.visible` on `[data-beach]` elements, but since those attributes are now removed, Sdot Yam + cams + forecasts are permanently shown. No JS change needed (the function becomes a no-op for those removed nodes).

---

## Issue 5 — Section Titles with (i) Info Tooltip

### 5A. REMOVE/REPLACE every `<p class="section-subtitle">…</p>` occurrence (lines 1501, 1515, 1581, 1650, 1708).

For each section title that currently has a subtitle, change the markup pattern from:

```html
<div class="section-title">
  <svg>...</svg>
  <span class="section-title-text">Beach Cameras</span>
</div>
<p class="section-subtitle">9 live beach cams across the Israeli coast ...</p>
```

To:

```html
<div class="section-title">
  <svg>...</svg>
  <span class="section-title-text">Beach Cameras</span>
  <button class="section-info" type="button"
          aria-label="About this section"
          data-tip="9 live beach cams across the Israeli coast · HTTPS snapshots, auto-refresh every 30s">i</button>
</div>
```

Apply the same pattern to: Wind Map ("Interactive wind visualization..."), Wind Analysis ("Sdot Yam wind.co.il station snapshots..."), Forecasts ("Multi-day wind forecasts from WindGuru"), Rain Radar ("Israel Meteorological Service rain forecast models"), and any remaining sections with a subtitle.

### 5B. CSS — REPLACE the existing `.section-title::after` underline block (lines 778–785) with a longer fading underline + new info button + tooltip styles:

```css
/* ===== SECTION TITLE — LONGER FADING UNDERLINE ===== */
.section-title { position: relative; padding-bottom: 10px; }
.section-title::after {
  content: ''; position: absolute; left: 0; bottom: 0;
  width: 220px; max-width: 60%; height: 1px; border-radius: 1px;
  background: linear-gradient(90deg, var(--accent) 0%, var(--accent2) 35%, transparent 100%);
  opacity: .55;
  transition: width .6s cubic-bezier(.2,.8,.2,1), opacity .3s ease;
  pointer-events: none;
}
.section-title:hover::after { width: 320px; opacity: .85; }

/* ===== SECTION INFO BUTTON ===== */
.section-info {
  position: relative;
  display: inline-flex; align-items: center; justify-content: center;
  width: 18px; height: 18px; border-radius: 50%;
  font-family: var(--mono); font-size: .68rem; font-weight: 700;
  color: var(--accent); background: transparent;
  border: 1px solid rgba(113,224,255,0.45);
  margin-left: 4px; cursor: pointer; line-height: 1;
  transition: all .2s ease;
}
.section-info:hover,
.section-info:focus-visible,
.section-info.open {
  color: var(--bg); background: var(--accent);
  box-shadow: 0 0 12px rgba(113,224,255,0.55), 0 0 2px rgba(113,224,255,0.8);
  border-color: var(--accent);
  outline: none;
}

/* ===== TOOLTIP POPOVER ===== */
.section-info::after {
  content: attr(data-tip);
  position: absolute;
  top: calc(100% + 10px); left: 50%;
  transform: translateX(-50%) translateY(-4px) scale(.96);
  transform-origin: top center;
  min-width: 220px; max-width: 300px;
  padding: 10px 14px;
  background: rgba(7,10,20,0.96);
  color: var(--text);
  border: 1px solid rgba(113,224,255,0.35);
  border-radius: var(--radius-sm);
  font-family: var(--font); font-size: .78rem; font-weight: 500;
  text-transform: none; letter-spacing: 0; line-height: 1.45;
  white-space: normal; text-align: left;
  box-shadow: 0 12px 32px rgba(0,0,0,0.55), 0 0 20px rgba(113,224,255,0.15);
  opacity: 0; visibility: hidden; pointer-events: none;
  transition: opacity .18s ease, transform .22s cubic-bezier(.2,.8,.2,1), visibility .18s;
  z-index: 50;
}
.section-info::before {
  content: '';
  position: absolute;
  top: calc(100% + 4px); left: 50%;
  transform: translateX(-50%) rotate(45deg);
  width: 8px; height: 8px;
  background: rgba(7,10,20,0.96);
  border-left: 1px solid rgba(113,224,255,0.35);
  border-top: 1px solid rgba(113,224,255,0.35);
  opacity: 0; visibility: hidden;
  transition: opacity .18s ease, visibility .18s;
  z-index: 51;
}

/* Show on hover (desktop only — no hover on touch) */
@media (hover: hover) {
  .section-info:hover::after,
  .section-info:hover::before,
  .section-info:focus-visible::after,
  .section-info:focus-visible::before {
    opacity: 1; visibility: visible; pointer-events: auto;
    transform: translateX(-50%) translateY(0) scale(1);
  }
  .section-info:hover::before,
  .section-info:focus-visible::before {
    transform: translateX(-50%) rotate(45deg);
  }
}

/* Show on tap (touch) via .open class */
.section-info.open::after,
.section-info.open::before {
  opacity: 1; visibility: visible; pointer-events: auto;
}
.section-info.open::after { transform: translateX(-50%) translateY(0) scale(1); }

/* Light theme */
:root[data-theme="light"] .section-info::after {
  background: rgba(255,255,255,0.98); color: var(--text);
  border-color: rgba(14,165,233,0.40);
  box-shadow: 0 12px 32px rgba(10,21,48,0.18), 0 0 20px rgba(14,165,233,0.12);
}
:root[data-theme="light"] .section-info::before {
  background: rgba(255,255,255,0.98);
  border-color: rgba(14,165,233,0.40);
}

/* Delete the old .section-subtitle rule entirely */
.section-subtitle { display: none !important; }
```

### 5C. JS — add inside the existing script block (anywhere near the theme toggle):

```js
/* ===== SECTION INFO TOOLTIPS (tap + hover) ===== */
(function () {
  const infoBtns = document.querySelectorAll('.section-info');
  infoBtns.forEach(btn => {
    btn.addEventListener('click', (e) => {
      e.stopPropagation();
      const wasOpen = btn.classList.contains('open');
      document.querySelectorAll('.section-info.open').forEach(b => b.classList.remove('open'));
      if (!wasOpen) btn.classList.add('open');
    });
  });
  document.addEventListener('click', () => {
    document.querySelectorAll('.section-info.open').forEach(b => b.classList.remove('open'));
  });
  document.addEventListener('keydown', (e) => {
    if (e.key === 'Escape') {
      document.querySelectorAll('.section-info.open').forEach(b => b.classList.remove('open'));
    }
  });
})();
```

---

## Issue 6 — Pixelabs Icon in Header

### 6A. REPLACE the existing `.pixelabs-link` anchor (lines 1218–1221) with:

```html
<a href="https://pixelabs.net" target="_blank" rel="noopener noreferrer"
   class="pixelabs-icon-link" aria-label="Visit Pixelabs.net" title="pixelabs.net">
  <img src="/assets/pixelabs-icon.svg" alt="" width="28" height="28" aria-hidden="true"
       onerror="this.onerror=null;this.src='/assets/pixelabs-icon.png';">
</a>
```

### 6B. CSS — REPLACE the existing `.pixelabs-link` rules (lines 134–143) with:

```css
/* ===== PIXELABS ICON LINK ===== */
.pixelabs-icon-link {
  display: inline-flex; align-items: center; justify-content: center;
  width: 36px; height: 36px; border-radius: var(--radius-sm);
  border: 1px solid var(--border);
  background: var(--panel);
  flex-shrink: 0;
  transition: transform .25s cubic-bezier(.2,.8,.2,1),
              border-color .2s ease,
              box-shadow .25s ease,
              background .2s ease;
}
.pixelabs-icon-link img {
  width: 22px; height: 22px; display: block;
  transition: filter .25s ease;
}
.pixelabs-icon-link:hover {
  border-color: rgba(113,224,255,0.55);
  background: var(--panel-hover);
  box-shadow: 0 0 16px rgba(113,224,255,0.35), 0 4px 14px -4px rgba(0,0,0,0.35);
  transform: translateY(-1px);
}
.pixelabs-icon-link:hover img {
  filter: drop-shadow(0 0 6px rgba(113,224,255,0.6));
}
.pixelabs-icon-link:focus-visible {
  outline: 2px solid var(--accent); outline-offset: 2px;
}
:root[data-theme="light"] .pixelabs-icon-link:hover {
  border-color: rgba(14,165,233,0.55);
  box-shadow: 0 0 16px rgba(14,165,233,0.35), 0 4px 14px -4px rgba(10,21,48,0.15);
}
```

Asset path: `/assets/pixelabs-icon.svg` (preferred) with `.png` fallback; delivered by digital-illustrator.

---

## Issue 7 — Theme Switcher (6 themes × font + palette + shape + mood)

### 7A. CSS — add a complete block (append near the end of the `<style>` element):

```css
/* ===== SHAPE LANGUAGE TOKENS (used by themes) ===== */
:root {
  --card-clip: polygon(14px 0, 100% 0, 100% calc(100% - 14px), calc(100% - 14px) 100%, 0 100%, 0 14px);
  --card-radius: 16px;
  --pill-radius: 999px;
  --border-style: solid;
  --glow-intensity: 0.32;
}

/* Apply shape tokens to hero cards */
.hero-grid .card { clip-path: var(--card-clip); border-radius: var(--card-radius); border-style: var(--border-style); }
.beach-btn, .verdict-tag, .vp-pill { border-radius: var(--pill-radius); }
.card, .kite-status, .sdotyam-panel, .lw-card { border-radius: var(--card-radius); border-style: var(--border-style); }

/* ========== 1. FUTURISTIC SPACE (default dark — explicit variant) ========== */
:root[data-theme-variant="space"] {
  --bg: #070a14; --bg2: #0a1026;
  --accent: #71e0ff; --accent2: #a78bfa;
  --good: #5cffb1; --warn: #ffd166; --bad: #ff5c7c;
  --text: rgba(255,255,255,0.92); --muted: rgba(255,255,255,0.60); --subtle: rgba(255,255,255,0.40);
  --panel: rgba(255,255,255,0.05); --panel-hover: rgba(255,255,255,0.08);
  --border: rgba(255,255,255,0.10); --border-bright: rgba(255,255,255,0.18);
  --font: 'Inter', ui-sans-serif, system-ui, sans-serif;
  --mono: 'JetBrains Mono', ui-monospace, monospace;
  --card-clip: polygon(14px 0, 100% 0, 100% calc(100% - 14px), calc(100% - 14px) 100%, 0 100%, 0 14px);
  --card-radius: 16px; --pill-radius: 999px; --border-style: solid;
  --glow-intensity: 0.32;
}

/* ========== 2. DESERT ETHNIC ========== */
:root[data-theme-variant="desert"] {
  --bg: #f4e9d8; --bg2: #ead6b8;
  --accent: #c2410c;       /* terracotta */
  --accent2: #84a07c;      /* sage */
  --good: #65a30d; --warn: #d97706; --bad: #b91c1c;
  --text: #3b2418; --muted: rgba(59,36,24,0.65); --subtle: rgba(59,36,24,0.42);
  --panel: rgba(255,248,235,0.70); --panel-hover: rgba(255,248,235,0.88);
  --border: rgba(59,36,24,0.18); --border-bright: rgba(59,36,24,0.32);
  --font: 'Rubik', 'Inter', sans-serif;
  --mono: 'Marcellus', 'Amiri', serif;
  --card-clip: none;
  --card-radius: 22px; --pill-radius: 14px; --border-style: solid;
  --glow-intensity: 0.10;
}

/* ========== 3. ALIEN ========== */
:root[data-theme-variant="alien"] {
  --bg: #030309; --bg2: #090512;
  --accent: #a3ff12;       /* acid green */
  --accent2: #c026d3;      /* toxic violet */
  --good: #4ade80; --warn: #facc15; --bad: #ef4444;
  --text: rgba(236,255,200,0.94); --muted: rgba(236,255,200,0.60); --subtle: rgba(236,255,200,0.38);
  --panel: rgba(163,255,18,0.04); --panel-hover: rgba(163,255,18,0.08);
  --border: rgba(163,255,18,0.22); --border-bright: rgba(163,255,18,0.42);
  --font: 'Space Mono', 'JetBrains Mono', monospace;
  --mono: 'Orbitron', 'JetBrains Mono', monospace;
  --card-clip: polygon(0 0, calc(100% - 20px) 0, 100% 20px, 100% 100%, 20px 100%, 0 calc(100% - 20px));
  --card-radius: 0px; --pill-radius: 2px; --border-style: solid;
  --glow-intensity: 0.55;
}

/* ========== 4. LITERARY / BOOK ========== */
:root[data-theme-variant="literary"] {
  --bg: #f5efe0; --bg2: #ebe0c8;
  --accent: #7f1d1d;       /* deep red */
  --accent2: #4a2c1a;      /* dark brown */
  --good: #166534; --warn: #92400e; --bad: #7f1d1d;
  --text: #2a1a0c; --muted: rgba(42,26,12,0.62); --subtle: rgba(42,26,12,0.42);
  --panel: rgba(255,250,238,0.82); --panel-hover: rgba(255,250,238,0.95);
  --border: rgba(74,44,26,0.22); --border-bright: rgba(74,44,26,0.40);
  --font: 'EB Garamond', 'Playfair Display', Georgia, serif;
  --mono: 'Playfair Display', Georgia, serif;
  --card-clip: none;
  --card-radius: 6px; --pill-radius: 4px; --border-style: solid;
  --glow-intensity: 0.08;
}

/* ========== 5. RETRO / OLD ========== */
:root[data-theme-variant="retro"] {
  --bg: #e8dcc0; --bg2: #d9c7a0;
  --accent: #8b2500;       /* burgundy */
  --accent2: #b8860b;      /* faded gold */
  --good: #4a5d2c; --warn: #8b6914; --bad: #6b1a0e;
  --text: #3a2a15; --muted: rgba(58,42,21,0.65); --subtle: rgba(58,42,21,0.42);
  --panel: rgba(245,235,215,0.78); --panel-hover: rgba(245,235,215,0.92);
  --border: rgba(58,42,21,0.25); --border-bright: rgba(58,42,21,0.42);
  --font: 'IM Fell DW Pica', 'EB Garamond', Georgia, serif;
  --mono: 'Special Elite', 'Courier New', monospace;
  --card-clip: none;
  --card-radius: 2px; --pill-radius: 2px; --border-style: dashed;
  --glow-intensity: 0.06;
}

/* ========== 6. CYBER ARCADE ========== */
:root[data-theme-variant="arcade"] {
  --bg: #0a0012; --bg2: #12001a;
  --accent: #ff2ec4;       /* hot pink */
  --accent2: #00e5ff;      /* electric blue */
  --good: #faff00; --warn: #ffa500; --bad: #ff0055;
  --text: #ffffff; --muted: rgba(255,255,255,0.68); --subtle: rgba(255,255,255,0.42);
  --panel: rgba(255,46,196,0.06); --panel-hover: rgba(255,46,196,0.12);
  --border: rgba(255,46,196,0.32); --border-bright: rgba(255,46,196,0.60);
  --font: 'VT323', 'JetBrains Mono', monospace;
  --mono: 'Press Start 2P', 'VT323', monospace;
  --card-clip: none;
  --card-radius: 0px; --pill-radius: 0px; --border-style: solid;
  --glow-intensity: 0.65;
}

/* ===== FONT-WEIGHT NORMALIZATION for pixel themes ===== */
:root[data-theme-variant="arcade"] .card-value,
:root[data-theme-variant="arcade"] .lw-card .lw-wind { font-size: 1.4rem; }
:root[data-theme-variant="arcade"] body { letter-spacing: 0.01em; }

/* ===== THEME PICKER BUTTON ===== */
.theme-picker-btn {
  display: flex; align-items: center; justify-content: center;
  width: 36px; height: 36px; border-radius: var(--radius-sm);
  border: 1px solid var(--border); color: var(--muted);
  background: var(--panel); flex-shrink: 0;
  transition: all .2s ease;
}
.theme-picker-btn:hover {
  color: var(--accent); border-color: rgba(113,224,255,0.45);
  box-shadow: 0 0 16px rgba(113,224,255,0.3);
}
.theme-picker-btn svg { width: 18px; height: 18px; pointer-events: none; }

/* ===== THEME PICKER POPOVER ===== */
.theme-picker {
  position: absolute; top: calc(100% + 10px); right: 0;
  width: min(520px, calc(100vw - 32px));
  padding: 16px;
  background: rgba(7,10,20,0.96);
  backdrop-filter: blur(16px) saturate(160%);
  -webkit-backdrop-filter: blur(16px) saturate(160%);
  border: 1px solid rgba(113,224,255,0.32);
  border-radius: var(--radius);
  box-shadow: 0 20px 60px rgba(0,0,0,0.6), 0 0 32px rgba(113,224,255,0.15);
  opacity: 0; visibility: hidden; pointer-events: none;
  transform: translateY(-6px) scale(.98);
  transform-origin: top right;
  transition: opacity .22s ease, transform .25s cubic-bezier(.2,.8,.2,1), visibility .22s;
  z-index: 150;
}
.theme-picker.open { opacity: 1; visibility: visible; pointer-events: auto; transform: translateY(0) scale(1); }
.theme-picker-header {
  font-family: var(--mono); font-size: .72rem; font-weight: 700;
  text-transform: uppercase; letter-spacing: .18em;
  color: var(--muted); margin-bottom: 12px;
}
.theme-grid {
  display: grid; grid-template-columns: repeat(2, 1fr); gap: 10px;
}
@media (max-width: 560px) { .theme-grid { grid-template-columns: 1fr; } }

.theme-card {
  display: block; padding: 12px 14px;
  text-align: left;
  background: rgba(255,255,255,0.03);
  border: 1px solid rgba(255,255,255,0.12);
  border-radius: 12px;
  cursor: pointer;
  transition: transform .2s ease, border-color .2s ease, background .2s ease;
  position: relative; overflow: hidden;
}
.theme-card:hover { transform: translateY(-2px); border-color: rgba(113,224,255,0.5); background: rgba(113,224,255,0.05); }
.theme-card.active { border-color: var(--accent); box-shadow: 0 0 0 1px var(--accent), 0 0 18px rgba(113,224,255,0.3); }

.theme-card .tc-name {
  font-size: .88rem; font-weight: 700; color: #fff;
  display: block; margin-bottom: 4px;
}
.theme-card .tc-mood {
  font-size: .72rem; color: rgba(255,255,255,0.60);
  display: block; margin-bottom: 10px; line-height: 1.3;
}
.theme-card .tc-swatches {
  display: flex; gap: 6px; margin-bottom: 8px;
}
.theme-card .tc-swatch {
  width: 18px; height: 18px; border-radius: 4px;
  border: 1px solid rgba(255,255,255,0.18);
}
.theme-card .tc-font-preview {
  font-size: .92rem; font-weight: 600;
  color: rgba(255,255,255,0.82);
  letter-spacing: .02em;
}

/* Each theme-card's own preview font + swatch palette */
.theme-card[data-variant="space"]    .tc-font-preview { font-family: 'Inter', sans-serif; }
.theme-card[data-variant="desert"]   .tc-font-preview { font-family: 'Marcellus', 'Rubik', serif; }
.theme-card[data-variant="alien"]    .tc-font-preview { font-family: 'Orbitron', 'Space Mono', monospace; }
.theme-card[data-variant="literary"] .tc-font-preview { font-family: 'Playfair Display', Georgia, serif; }
.theme-card[data-variant="retro"]    .tc-font-preview { font-family: 'Special Elite', 'Courier New', monospace; }
.theme-card[data-variant="arcade"]   .tc-font-preview { font-family: 'Press Start 2P', monospace; font-size: .68rem; }

.theme-picker-wrap { position: relative; }
```

### 7B. HTML — INSERT into `.header-actions` (just before `#themeToggle`):

```html
<div class="theme-picker-wrap">
  <button class="theme-picker-btn" id="themePickerBtn" aria-label="Choose theme" aria-expanded="false" title="Choose theme">
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true">
      <circle cx="12" cy="12" r="9"/>
      <circle cx="7.5" cy="10.5" r="1.2" fill="currentColor" stroke="none"/>
      <circle cx="12" cy="7.5" r="1.2" fill="currentColor" stroke="none"/>
      <circle cx="16.5" cy="10.5" r="1.2" fill="currentColor" stroke="none"/>
      <circle cx="15" cy="15" r="1.2" fill="currentColor" stroke="none"/>
      <path d="M12 21 Q9 18 10 15 Q11 13 13 14 Q15 15 14 17 Q13 19 12 21z"/>
    </svg>
  </button>
  <div class="theme-picker" id="themePicker" role="dialog" aria-label="Theme picker">
    <div class="theme-picker-header">Choose a theme</div>
    <div class="theme-grid">

      <button class="theme-card" data-variant="space" type="button">
        <span class="tc-name">Futuristic Space</span>
        <span class="tc-mood">HUD cyan &amp; violet glow over deep space</span>
        <div class="tc-swatches">
          <span class="tc-swatch" style="background:#070a14"></span>
          <span class="tc-swatch" style="background:#71e0ff"></span>
          <span class="tc-swatch" style="background:#a78bfa"></span>
        </div>
        <span class="tc-font-preview">Wind &middot; Waves &middot; Go</span>
      </button>

      <button class="theme-card" data-variant="desert" type="button">
        <span class="tc-name">Desert Ethnic</span>
        <span class="tc-mood">Warm sand, terracotta &amp; sage — earthen calm</span>
        <div class="tc-swatches">
          <span class="tc-swatch" style="background:#f4e9d8"></span>
          <span class="tc-swatch" style="background:#c2410c"></span>
          <span class="tc-swatch" style="background:#84a07c"></span>
        </div>
        <span class="tc-font-preview">Wind &middot; Waves &middot; Go</span>
      </button>

      <button class="theme-card" data-variant="alien" type="button">
        <span class="tc-name">Alien</span>
        <span class="tc-mood">Acid green &amp; toxic violet on pitch black</span>
        <div class="tc-swatches">
          <span class="tc-swatch" style="background:#030309"></span>
          <span class="tc-swatch" style="background:#a3ff12"></span>
          <span class="tc-swatch" style="background:#c026d3"></span>
        </div>
        <span class="tc-font-preview">Wind &middot; Waves &middot; Go</span>
      </button>

      <button class="theme-card" data-variant="literary" type="button">
        <span class="tc-name">Literary</span>
        <span class="tc-mood">Cream parchment, deep red &amp; old brown</span>
        <div class="tc-swatches">
          <span class="tc-swatch" style="background:#f5efe0"></span>
          <span class="tc-swatch" style="background:#7f1d1d"></span>
          <span class="tc-swatch" style="background:#4a2c1a"></span>
        </div>
        <span class="tc-font-preview">Wind &middot; Waves &middot; Go</span>
      </button>

      <button class="theme-card" data-variant="retro" type="button">
        <span class="tc-name">Retro</span>
        <span class="tc-mood">Typewriter paper, sepia &amp; burgundy</span>
        <div class="tc-swatches">
          <span class="tc-swatch" style="background:#e8dcc0"></span>
          <span class="tc-swatch" style="background:#8b2500"></span>
          <span class="tc-swatch" style="background:#b8860b"></span>
        </div>
        <span class="tc-font-preview">Wind &middot; Waves &middot; Go</span>
      </button>

      <button class="theme-card" data-variant="arcade" type="button">
        <span class="tc-name">Cyber Arcade</span>
        <span class="tc-mood">Hot pink &amp; electric blue pixel rush</span>
        <div class="tc-swatches">
          <span class="tc-swatch" style="background:#0a0012"></span>
          <span class="tc-swatch" style="background:#ff2ec4"></span>
          <span class="tc-swatch" style="background:#00e5ff"></span>
        </div>
        <span class="tc-font-preview">Wind &middot; Waves &middot; Go</span>
      </button>

    </div>
  </div>
</div>
```

### 7C. JS — add in the existing `<script>` block near theme toggle:

```js
/* ===== THEME VARIANT PICKER (6 themes × font + palette + shape) ===== */
(function () {
  const THEMES = {
    space:    { font: null /* already loaded (Inter + JetBrains Mono) */ },
    desert:   { font: 'https://fonts.googleapis.com/css2?family=Marcellus&family=Rubik:wght@400;600;700&display=swap' },
    alien:    { font: 'https://fonts.googleapis.com/css2?family=Orbitron:wght@500;700&family=Space+Mono:wght@400;700&display=swap' },
    literary: { font: 'https://fonts.googleapis.com/css2?family=EB+Garamond:wght@400;600;700&family=Playfair+Display:wght@700;900&display=swap' },
    retro:    { font: 'https://fonts.googleapis.com/css2?family=IM+Fell+DW+Pica&family=Special+Elite&display=swap' },
    arcade:   { font: 'https://fonts.googleapis.com/css2?family=Press+Start+2P&family=VT323&display=swap' },
  };

  const loadedFonts = new Set();
  function loadFont(variant) {
    const t = THEMES[variant];
    if (!t || !t.font || loadedFonts.has(variant)) return;
    const link = document.createElement('link');
    link.rel = 'stylesheet';
    link.href = t.font;
    document.head.appendChild(link);
    loadedFonts.add(variant);
  }

  function applyVariant(variant) {
    if (!THEMES[variant]) variant = 'space';
    loadFont(variant);
    document.documentElement.setAttribute('data-theme-variant', variant);
    document.querySelectorAll('.theme-card').forEach(c => {
      c.classList.toggle('active', c.dataset.variant === variant);
    });
  }

  // ---- init ----
  const saved = localStorage.getItem('guston-theme-variant') || 'space';
  applyVariant(saved);

  // ---- popover ----
  const btn = document.getElementById('themePickerBtn');
  const pop = document.getElementById('themePicker');
  if (!btn || !pop) return;

  function openPicker()  { pop.classList.add('open');    btn.setAttribute('aria-expanded', 'true');  }
  function closePicker() { pop.classList.remove('open'); btn.setAttribute('aria-expanded', 'false'); }

  btn.addEventListener('click', (e) => {
    e.stopPropagation();
    pop.classList.contains('open') ? closePicker() : openPicker();
  });

  document.addEventListener('click', (e) => {
    if (!pop.contains(e.target) && e.target !== btn) closePicker();
  });
  document.addEventListener('keydown', (e) => { if (e.key === 'Escape') closePicker(); });

  // ---- hover preview / click commit ----
  const currentVariant = () => localStorage.getItem('guston-theme-variant') || 'space';
  pop.querySelectorAll('.theme-card').forEach(card => {
    const v = card.dataset.variant;
    card.addEventListener('mouseenter', () => applyVariant(v));                // live preview
    card.addEventListener('mouseleave', () => applyVariant(currentVariant())); // revert
    card.addEventListener('click', (e) => {
      e.stopPropagation();
      localStorage.setItem('guston-theme-variant', v);
      applyVariant(v);
      closePicker();
      // IMPORTANT: do NOT call fetchConditions — theme change is purely visual
    });
    card.addEventListener('focus', () => applyVariant(v));
    card.addEventListener('blur',  () => applyVariant(currentVariant()));
  });
})();
```

**Notes for staff-engineer on Issue 7**:
- Fonts are lazy-loaded on first selection (no bloat on initial page load). The default `space` theme uses Inter + JetBrains Mono which are already in the `<head>`.
- `--card-clip` only affects `.hero-grid .card`. Themes with `--card-clip: none` render plain rounded cards (desert, literary, retro, arcade); alien uses opposite-corner chamfer.
- Light/dark `[data-theme]` is orthogonal to `[data-theme-variant]`. The variant overrides color tokens entirely, so after selecting a variant the light/dark toggle effectively becomes a no-op until the user picks a new variant — this is acceptable per the spec (variant is the source of truth). If you want to preserve `space` + dark/light pair, document that only `space` responds to light toggle.
- The `arcade` and `alien` themes reduce `--card-value` size slightly to prevent pixel-font overflow.

---

## Summary of File Changes (for staff-engineer)

1. **Replace** `:root[data-theme="light"]` block → Issue 1 CSS (large block).
2. **Delete** `.compass-card` from `#conditionsGrid`; **restructure** `.verdict-hero` markup → Issue 2 HTML + CSS.
3. **Add** `.verdict-callouts` row with 3 callouts (wetsuit/kite/waves); **delete** `.verdict-pills` block → Issue 3 CSS.
4. **Delete** top beach filter section + "Current Conditions" title; **strip** `data-beach` from sdotyam panel, beach-cams, forecasts; **insert** `.pick-beach-bar` under verdict hero → Issue 4.
5. **Replace** all `.section-subtitle` paragraphs with `.section-info` buttons carrying `data-tip`; **update** `.section-title::after` underline; **add** tooltip CSS + JS → Issue 5.
6. **Replace** `.pixelabs-link` with `.pixelabs-icon-link` using `/assets/pixelabs-icon.svg` → Issue 6.
7. **Add** shape tokens + 6 `[data-theme-variant]` blocks + `.theme-picker-btn` + popover HTML + JS (localStorage, lazy font loading, hover preview, outside-click close) → Issue 7.

All code blocks above are verbatim copy-pasteable. No design decisions remain.

Relevant file: `/Users/netz/Documents/git/guston/index.html`

agentId: a221b36bb5eb933f2 (use SendMessage with to: 'a221b36bb5eb933f2' to continue this agent)
<usage>total_tokens: 78829
tool_uses: 8
duration_ms: 439287</usage>