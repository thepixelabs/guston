# CT Spec v3 — Polish pass (post-v2)

Scope: 6 items (A–F). All snippets are verbatim copy-pasteable. Line numbers reference `index.html` at the time of spec authoring.

---

## Item A — Horizontal callouts nestled LEFT of the compass divider

### Goal
Inside `.verdict-right`, place the 3 callouts (suit/kite/waves) as a **vertical stack hugging the LEFT edge** of the right column (i.e. against the existing border-left divider), with the compass + readout on the right half of `.verdict-right`. This reads as: `status-text | [ callouts ][ divider ][ compass ]`.

Wait — re-reading the brief: the user wants the 3 callouts **horizontal**, to the LEFT of the compass, behind the divider. The divider between `.status-text` and `.verdict-right` stays where it is. The callouts sit *inside* `.verdict-right`, aligned to its left edge, as a **vertical stack of 3 pill-shaped rows** that form a horizontal band next to the compass.

Re-resolving the ambiguity: "horizontal" refers to the *arrangement relative to the compass* (side-by-side, not stacked above/below), not the internal flow of the callouts themselves. Each callout row is horizontal (icon + label/value). The 3 rows stack vertically, producing a compact column that slots left of the compass.

Net layout inside `.verdict-right`:

```
┌─ .verdict-right (flex row) ────────────────┐
│  [suit  ]      │                            │
│  [kite  ]      │     ⊙ compass              │
│  [waves ]      │     N 12°                  │
└────────────────────────────────────────────┘
    callouts col      compass col
```

### Markup — replace lines 1756–1831 in `index.html`

```html
          <div class="verdict-right">
            <div class="verdict-callouts">
              <div class="suit-callout" aria-label="Wetsuit recommendation">
                <svg class="suit-icon" viewBox="0 0 24 24" width="22" height="22" fill="none" stroke="currentColor" stroke-width="1.6" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true">
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
              <div class="kite-callout" aria-label="Kite size suggestion">
                <svg viewBox="0 0 20 20" width="20" height="20" fill="none" stroke="currentColor" stroke-width="1.6" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true">
                  <path d="M10 1.5 L17.2 10 L10 18.5 L2.8 10 Z" fill="rgba(255,107,53,0.18)"/>
                  <path d="M10 1.5 L10 18.5" opacity="0.85"/>
                  <path d="M2.8 10 L17.2 10" opacity="0.55"/>
                  <path d="M10 18.5 Q7.5 19.8 6 19" stroke-width="1.3"/>
                  <path d="M10 18.5 Q12.5 19.8 14 19" stroke-width="1.3"/>
                </svg>
                <div class="suit-text">
                  <span class="suit-label">Kite</span>
                  <span class="suit-value" id="vpKite">--</span>
                </div>
              </div>
              <div class="waves-callout" aria-label="Wave conditions">
                <svg viewBox="0 0 24 24" width="20" height="20" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path d="M3 12 Q8 6 12 12 T21 12"/></svg>
                <div class="suit-text">
                  <span class="suit-label">Waves</span>
                  <span class="suit-value" id="vpWaves">--</span>
                </div>
              </div>
            </div>
            <div class="verdict-compass-wrap">
              <div class="compass-rose verdict-compass" id="windArrow" aria-hidden="true" style="color: var(--accent);">
                <svg viewBox="0 0 120 120">
                  <style>
                    .ac-stop-a { stop-color: var(--accent); }
                    .ac-stop-b { stop-color: var(--accent2); }
                    .ac-stop-a18 { stop-color: rgba(var(--accent-rgb),.18); }
                    .ac-stop-a04 { stop-color: rgba(var(--accent-rgb),.04); }
                    .ac-stop-a00 { stop-color: rgba(var(--accent-rgb),0); }
                  </style>
                  <defs>
                    <radialGradient id="cgradV" cx="50%" cy="50%" r="50%">
                      <stop offset="0%" class="ac-stop-a18"/>
                      <stop offset="70%" class="ac-stop-a04"/>
                      <stop offset="100%" class="ac-stop-a00"/>
                    </radialGradient>
                    <linearGradient id="ngradV" x1="50%" y1="0%" x2="50%" y2="100%">
                      <stop offset="0%" class="ac-stop-a"/>
                      <stop offset="100%" class="ac-stop-b"/>
                    </linearGradient>
                  </defs>
                  <circle cx="60" cy="60" r="55" fill="url(#cgradV)"/>
                  <circle cx="60" cy="60" r="50" fill="none" stroke="rgba(255,255,255,.08)" stroke-width="1"/>
                  <circle class="gust-ring" cx="60" cy="60" r="48" fill="none" stroke="currentColor" stroke-width="1.5" opacity=".5"/>
                  <text x="60" y="14" text-anchor="middle" fill="currentColor" font-size="10" font-weight="700" style="font-family: var(--font-mono);">N</text>
                  <text x="108" y="64" text-anchor="middle" fill="rgba(255,255,255,.55)" font-size="9" style="font-family: var(--font-mono);">E</text>
                  <text x="60" y="114" text-anchor="middle" fill="rgba(255,255,255,.55)" font-size="9" style="font-family: var(--font-mono);">S</text>
                  <text x="12" y="64" text-anchor="middle" fill="rgba(255,255,255,.55)" font-size="9" style="font-family: var(--font-mono);">W</text>
                  <g class="compass-needle">
                    <path d="M60 18 L66 60 L60 54 L54 60 Z" fill="url(#ngradV)" style="filter: drop-shadow(0 0 6px rgba(var(--accent-rgb),.6));"/>
                    <circle cx="60" cy="60" r="3" fill="currentColor"/>
                  </g>
                </svg>
                <span class="compass-refresh-flash" aria-hidden="true"></span>
              </div>
              <div class="compass-readout">
                <div class="card-value" id="windDir" style="font-size:1.05rem;">--</div>
                <div class="card-detail" id="windDirDeg">--</div>
              </div>
            </div>
          </div>
```

Note the `<span class="compass-refresh-flash">` element added inside `.verdict-compass` — used by Item C.

### CSS — replace the block from lines 1409 to ~1510 with

```css
    /* ===== VERDICT HERO LAYOUT (callouts | compass) ===== */
    .verdict-hero { align-items: stretch; position: relative; }

    .verdict-right {
      display: flex; flex-direction: row; align-items: stretch;
      gap: 16px; padding-left: 18px;
      border-left: 1px solid var(--border);
      flex-shrink: 0;
    }

    /* Left sub-column: 3 stacked callout pills hugging the divider */
    .verdict-right .verdict-callouts {
      display: flex; flex-direction: column; gap: 8px;
      justify-content: center; align-items: stretch;
      min-width: 148px; max-width: 170px;
    }

    /* Right sub-column: compass + readout */
    .verdict-compass-wrap {
      display: flex; flex-direction: column; align-items: center;
      gap: 6px; flex-shrink: 0;
    }
    .verdict-compass {
      width: 130px; height: 130px; position: relative;
    }
    .verdict-compass svg { width: 100%; height: 100%; }
    .verdict-compass-wrap .compass-readout { text-align: center; }
    .verdict-compass-wrap .card-value { font-size: 1.05rem !important; font-family: var(--mono); }
    .verdict-compass-wrap .card-detail { font-size: .72rem; color: var(--muted); }

    /* Callout rows (shared) */
    .suit-callout,
    .kite-callout,
    .waves-callout {
      display: inline-flex; align-items: center; gap: 9px;
      padding: 7px 10px; border-radius: 11px;
      flex-shrink: 0;
    }
    .suit-callout .suit-text,
    .kite-callout .suit-text,
    .waves-callout .suit-text { display: flex; flex-direction: column; line-height: 1.12; min-width: 0; }
    .suit-callout .suit-label,
    .kite-callout .suit-label,
    .waves-callout .suit-label {
      font-family: var(--mono); font-size: .58rem; font-weight: 700;
      text-transform: uppercase; letter-spacing: .11em; color: var(--muted);
    }
    .suit-callout .suit-value,
    .kite-callout .suit-value,
    .waves-callout .suit-value {
      font-size: .84rem; font-weight: 700; color: var(--text); margin-top: 1px;
      white-space: nowrap; overflow: hidden; text-overflow: ellipsis;
    }

    /* Suit — cyan */
    .suit-callout {
      background: linear-gradient(135deg, rgba(113,224,255,0.14), rgba(113,224,255,0.06));
      border: 1px solid rgba(113,224,255,0.34);
      box-shadow: 0 0 22px -10px rgba(113,224,255,0.4);
    }
    .suit-callout .suit-icon { color: var(--accent); filter: drop-shadow(0 0 6px rgba(113,224,255,0.55)); flex-shrink: 0; }

    /* Kite — orange */
    .kite-callout {
      background: linear-gradient(135deg, rgba(255,107,53,0.16), rgba(255,107,53,0.06));
      border: 1px solid rgba(255,107,53,0.42);
      box-shadow: 0 0 22px -10px rgba(255,107,53,0.5);
    }
    .kite-callout svg { color: #ff6b35; filter: drop-shadow(0 0 6px rgba(255,107,53,0.6)); flex-shrink: 0; }

    /* Waves — violet */
    .waves-callout {
      background: linear-gradient(135deg, rgba(167,139,250,0.14), rgba(109,74,199,0.08));
      border: 1px solid rgba(167,139,250,0.38);
      box-shadow: 0 0 22px -10px rgba(167,139,250,0.4);
    }
    .waves-callout svg { color: #a78bfa; filter: drop-shadow(0 0 6px rgba(167,139,250,0.55)); flex-shrink: 0; }

    /* Light theme */
    :root[data-theme="light"] .suit-callout {
      background: linear-gradient(135deg, rgba(14,165,233,0.14), rgba(14,165,233,0.04));
      border-color: rgba(14,165,233,0.42);
    }
    :root[data-theme="light"] .suit-callout .suit-icon { color: #0b6fa3; filter: drop-shadow(0 0 6px rgba(14,165,233,0.5)); }
    :root[data-theme="light"] .kite-callout {
      background: linear-gradient(135deg, rgba(255,107,53,0.18), rgba(255,107,53,0.05));
      border-color: rgba(255,107,53,0.5);
    }
    :root[data-theme="light"] .waves-callout {
      background: linear-gradient(135deg, rgba(124,58,237,0.14), rgba(124,58,237,0.04));
      border-color: rgba(124,58,237,0.42);
    }
    :root[data-theme="light"] .waves-callout svg { color: #6d4ac7; filter: drop-shadow(0 0 6px rgba(124,58,237,0.5)); }

    /* ---- Tablet: <=1024px — callouts narrow, compass stays right ---- */
    @media (max-width: 1024px) {
      .verdict-right { gap: 12px; padding-left: 14px; }
      .verdict-right .verdict-callouts { min-width: 130px; max-width: 150px; }
      .verdict-compass { width: 110px; height: 110px; }
    }

    /* ---- Mobile <=720px — compass stays on RIGHT of status text,
            callouts drop BELOW full-width horizontal row ---- */
    @media (max-width: 720px) {
      .verdict-hero { flex-wrap: wrap; align-items: flex-start; }
      .verdict-right {
        flex-direction: row-reverse;
        border-left: 0;
        padding-left: 0;
        gap: 10px;
        align-self: flex-start;
      }
      .verdict-compass { width: 88px; height: 88px; }
      .verdict-compass-wrap .card-value { font-size: .9rem !important; }
      .verdict-compass-wrap .card-detail { font-size: .65rem; }

      /* Callouts unparent visually: break out below everything as a full row */
      .verdict-right .verdict-callouts {
        order: 99;
        flex-basis: 100%;
        max-width: none; min-width: 0;
        flex-direction: row; flex-wrap: wrap;
        margin-top: 12px; padding-top: 12px;
        border-top: 1px solid var(--border);
        justify-content: space-between;
      }
      .verdict-right .verdict-callouts > * { flex: 1 1 140px; min-width: 0; }
    }

    /* ---- Tiny phones: compass even smaller, readout degrees hidden ---- */
    @media (max-width: 480px) {
      .verdict-compass { width: 68px; height: 68px; }
      .verdict-compass-wrap .card-detail { display: none; }
      .verdict-right .verdict-callouts { flex-direction: column; }
      .verdict-right .verdict-callouts > * { flex: 1 1 auto; }
    }
```

Note: the mobile `<=720px` block is the implementation of **E2** (compass on right of status text on mobile). On mobile we reorder the flex so the callouts break to a full-width row below the hero while the compass stays inline-right.

---

## Item B — Last Updated badge → header (persistent)

### Delete from verdict hero (lines 1740–1743)

Remove:
```html
          <div class="verdict-updated" aria-live="polite">
            <span class="live-pulse" aria-hidden="true"></span>
            <span id="lastUpdate">Loading...</span>
          </div>
```

### Add to header — inside `.header-actions`, as the FIRST child (line 1705)

```html
      <div class="header-actions">
        <div class="header-lastupdate" aria-live="polite" title="Last data refresh">
          <span class="live-pulse" aria-hidden="true"></span>
          <span id="lastUpdate">Loading…</span>
        </div>
        <a class="pixelabs-link" href="https://pixelabs.net" target="_blank" rel="noopener noreferrer" aria-label="Pixelabs.net">
          <!-- see Item D for the new pixelabs markup -->
        </a>
        <!-- ...remainder of header-actions unchanged... -->
      </div>
```

### CSS — add (place near existing `.header-actions` block, around line 238)

```css
    .header-lastupdate {
      display: inline-flex; align-items: center; gap: 7px;
      font-family: var(--mono); font-size: .66rem; font-weight: 600;
      color: var(--muted);
      letter-spacing: .05em;
      padding: 5px 11px 5px 9px;
      border-radius: 999px;
      background: rgba(255,255,255,0.04);
      border: 1px solid var(--border);
      backdrop-filter: blur(6px);
      -webkit-backdrop-filter: blur(6px);
      white-space: nowrap;
      transition: color .25s ease, border-color .25s ease, background .25s ease;
      position: relative;
    }
    .header-lastupdate:hover { color: var(--text); border-color: rgba(var(--accent-rgb), .45); }
    .header-lastupdate .live-pulse {
      display: inline-block; width: 7px; height: 7px; border-radius: 50%;
      background: var(--good);
      box-shadow: 0 0 8px var(--good), 0 0 14px rgba(92,255,177,0.5);
      animation: pulse 1.6s ease-in-out infinite;
    }
    @media (prefers-reduced-motion: reduce) {
      .header-lastupdate .live-pulse { animation: none; }
    }
    :root[data-theme="light"] .header-lastupdate {
      background: rgba(255,255,255,0.72);
      border-color: rgba(14,50,120,0.16);
      color: rgba(10,21,48,0.62);
    }
    :root[data-theme="light"] .header-lastupdate:hover {
      color: var(--text); border-color: rgba(14,50,120,0.4);
    }

    /* Mobile: compress to dot + short time; hide "Updated " prefix via JS format */
    @media (max-width: 720px) {
      .header-lastupdate { font-size: .60rem; padding: 4px 8px 4px 7px; gap: 5px; }
      .header-lastupdate .live-pulse { width: 6px; height: 6px; }
    }
    @media (max-width: 480px) {
      /* Ultra-compact: dot only, time shown as tooltip */
      .header-lastupdate { padding: 5px 6px; }
      .header-lastupdate #lastUpdate { display: none; }
    }
```

### Delete from main CSS
Delete the entire `.verdict-updated { ... }` block (lines 1513–1548) — it is no longer used. Also delete the mobile override at line 1590: `.verdict-updated { position: static; ... }`.

### JS change
None. The existing JS at line 2675 writes `document.getElementById('lastUpdate').textContent = 'Updated HH:MM'` and still works because the ID moved, not the JS.

---

## Item C — Refresh micro-flash (no needle spin)

### Recommendation
**Option 2** — cyan glow pulse on the compass center, plus matching micro-flash on `.header-lastupdate`. Both fire for 300ms when data refreshes successfully with an unchanged wind angle (and also on angle-change refreshes — it's a confirmation signal, orthogonal to the needle animation).

### Markup
Already added in Item A: `<span class="compass-refresh-flash" aria-hidden="true"></span>` inside `.verdict-compass`.

### CSS — add near the verdict-compass block

```css
    /* Refresh confirmation flash — compass */
    .verdict-compass {
      /* ensure overlay sits inside the rose */
      isolation: isolate;
    }
    .compass-refresh-flash {
      position: absolute; inset: 0;
      border-radius: 50%;
      pointer-events: none;
      opacity: 0;
      background: radial-gradient(circle at 50% 50%,
                    rgba(var(--accent-rgb), 0.55) 0%,
                    rgba(var(--accent-rgb), 0.18) 28%,
                    rgba(var(--accent-rgb), 0) 62%);
      mix-blend-mode: screen;
    }
    .verdict-compass.is-refreshing .compass-refresh-flash {
      animation: compassRefreshFlash 320ms ease-out 1;
    }
    @keyframes compassRefreshFlash {
      0%   { opacity: 0; transform: scale(0.7); }
      35%  { opacity: 1; transform: scale(1.02); }
      100% { opacity: 0; transform: scale(1.12); }
    }

    /* Refresh confirmation flash — header lastupdate pill */
    .header-lastupdate.is-refreshing {
      animation: lastUpdateFlash 320ms ease-out 1;
    }
    @keyframes lastUpdateFlash {
      0%   { box-shadow: 0 0 0 0 rgba(var(--accent-rgb), 0);   border-color: var(--border); }
      40%  { box-shadow: 0 0 0 4px rgba(var(--accent-rgb), 0.28); border-color: rgba(var(--accent-rgb), 0.7); }
      100% { box-shadow: 0 0 0 0 rgba(var(--accent-rgb), 0);   border-color: var(--border); }
    }

    @media (prefers-reduced-motion: reduce) {
      .verdict-compass.is-refreshing .compass-refresh-flash,
      .header-lastupdate.is-refreshing { animation: none; }
    }
```

### JS trigger (to be wired in by the staff-engineer mechanical pass near the existing refresh handler)

```js
// Call this on every successful refresh, regardless of whether the angle changed.
function flashRefreshIndicators() {
  const compass = document.getElementById('windArrow');
  const pill = document.querySelector('.header-lastupdate');
  [compass, pill].forEach(el => {
    if (!el) return;
    el.classList.remove('is-refreshing');
    // force reflow so the animation can restart
    void el.offsetWidth;
    el.classList.add('is-refreshing');
  });
}
```

Call `flashRefreshIndicators()` in the success branch of the data fetch, *after* the "did angle change?" check decides whether to animate the needle.

---

## Item D — Pixelabs icon: single-image CSS filter approach

### Markup — replace lines 1706–1709

```html
        <a class="pixelabs-link" href="https://pixelabs.net" target="_blank" rel="noopener noreferrer" aria-label="Pixelabs.net">
          <img class="pixelabs-icon" src="assets/pixelabs-icon.png" alt="Pixelabs" width="26" height="26">
        </a>
```

### CSS — replace lines 279–292

```css
    .pixelabs-link {
      display: inline-flex; align-items: center; justify-content: center;
      width: 34px; height: 34px; border-radius: 10px;
      transition: background .25s ease, transform .25s ease;
    }
    .pixelabs-link:hover { background: rgba(255,255,255,0.06); transform: translateY(-1px); }
    :root[data-theme="light"] .pixelabs-link:hover { background: rgba(14,50,120,0.06); }

    .pixelabs-icon {
      width: 26px; height: 26px;
      display: block;
      /* Default: desaturate the gradient master into a soft silhouette */
      filter: grayscale(100%) brightness(1.4) contrast(0.95) opacity(0.72);
      transition: filter .3s ease, transform .3s ease;
    }
    .pixelabs-link:hover .pixelabs-icon {
      filter: grayscale(0%) brightness(1) contrast(1) opacity(1)
              drop-shadow(0 0 8px rgba(var(--accent-rgb), 0.35));
      transform: scale(1.06);
    }
    /* Light mode: darken the silhouette instead of brightening */
    :root[data-theme="light"] .pixelabs-icon {
      filter: grayscale(100%) brightness(0.35) contrast(1.1) opacity(0.72);
    }
    :root[data-theme="light"] .pixelabs-link:hover .pixelabs-icon {
      filter: grayscale(0%) brightness(1) contrast(1) opacity(1)
              drop-shadow(0 0 8px rgba(14,50,120,0.25));
    }
```

Drops all `.pixelabs-icon--default` and `.pixelabs-icon--hover` rules. Single `<img>`, clean state machine.

---

## Item E — Mobile tweaks

### E1. Surfboard hamburger (and X close)

Replace the chevron SVG at line 2874:

```js
      const menuSVG = '<svg class="chev menu-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.7" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true">'
        + '<path d="M3.2 9.2 Q12 7.4 20.8 9.2 Q12 10.8 3.2 9.2 Z"/>'
        + '<path d="M3.2 15.2 Q12 13.4 20.8 15.2 Q12 16.8 3.2 15.2 Z"/>'
        + '</svg>'
        + '<svg class="chev close-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.9" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true">'
        + '<path d="M5 5 L19 19"/><path d="M19 5 L5 19"/>'
        + '</svg>';
      // and replace the old chevSVG usages:
      btn.innerHTML = '<span>' + labelText + '</span>' + menuSVG;
```

(Rename the variable `chevSVG` to `menuSVG` — or keep the name and just change the contents. The existing code at line 2888 reads `chevSVG` once; update that reference too.)

### E1 CSS — replace the chev rules (lines 1628–1631 + 1650)

```css
      .has-mobile-accordion .section-collapse .chev {
        width: 22px; height: 22px;
        flex-shrink: 0;
        transition: opacity .28s ease, transform .35s ease;
        position: absolute; right: 14px; top: 50%;
        transform-origin: center;
      }
      .has-mobile-accordion .section-collapse { position: relative; padding-right: 46px; }
      .has-mobile-accordion .section-collapse .menu-icon {
        opacity: 1; transform: translateY(-50%) scale(1);
      }
      .has-mobile-accordion .section-collapse .close-icon {
        opacity: 0; transform: translateY(-50%) scale(.6) rotate(-45deg);
      }
      .has-mobile-accordion[data-collapsed="false"] .section-collapse .menu-icon {
        opacity: 0; transform: translateY(-50%) scale(.6) rotate(45deg);
      }
      .has-mobile-accordion[data-collapsed="false"] .section-collapse .close-icon {
        opacity: 1; transform: translateY(-50%) scale(1) rotate(0deg);
      }
      @media (prefers-reduced-motion: reduce) {
        .has-mobile-accordion .section-collapse .chev { transition: none; }
      }
```

The surfboard silhouettes are leaf-shaped with slight taper (two bezier curves closing a pointed oval) — reads as stacked parallel boards at 22px, and morphs cleanly to an X on open.

### E2. Mobile compass on right of status text
**Already specified in Item A** via the `@media (max-width: 720px)` block inside `.verdict-right`. The compass stays inline to the right of `.status-text` at 88px (68px on `<=480px`), and callouts break below as a full-width row.

### E3. Dark line at top (light mode, mobile)
**Defer to staff-engineer mechanical pass.** Most likely culprit: `.site-header::after { background: ...; }` at line 142 combined with the `:root[data-theme="light"]` variant at line 142 producing a 1px border that shows as a dark hairline on mobile because of an iOS webkit subpixel rounding issue. If the mechanical pass confirms, apply:

```css
    @media (max-width: 720px) {
      :root[data-theme="light"] .site-header::after { background: transparent; }
    }
```

Otherwise no-op.

---

## Item F — New section icons (inline SVG, stroke 1.5, 24×24)

### F1. Current Conditions → windsock
Replace the SVG at line 1733:

```html
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true">
            <line x1="5" y1="3" x2="5" y2="21"/>
            <circle cx="6.8" cy="6.2" r="1.4"/>
            <path d="M8.2 5.2 L20 7.2 L18.4 11.6 L7 9.4"/>
            <line x1="11.4" y1="6.2" x2="10.2" y2="10.1"/>
            <line x1="14.8" y1="6.8" x2="13.6" y2="10.7"/>
            <line x1="18.2" y1="7.4" x2="17" y2="11.3"/>
          </svg>
```

Pole on the left, ring at `(6.8, 6.2)`, cone tapering right and down to look wind-blown at ~30°, 3 segment division lines suggesting the banded fabric.

### F2. Wind Analysis → radar with wind
Replace the SVG at line 2017:

```html
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true">
            <circle cx="12" cy="13" r="6.2"/>
            <circle cx="12" cy="13" r="3"/>
            <line x1="12" y1="13" x2="16.4" y2="8.6"/>
            <circle cx="16.4" cy="8.6" r="0.6" fill="currentColor" stroke="none"/>
            <path d="M2.2 4.8 Q6 3.4 9.6 5.2" opacity="0.75"/>
            <path d="M14.4 3.4 Q18.4 2.6 21.8 4.8" opacity="0.55"/>
            <path d="M19.8 18.2 Q22 19.4 21.4 21.6" opacity="0.55"/>
          </svg>
```

Outer circle r=6.2, inner r=3, 45° sweep line to a dot (pinged target), plus 3 curved wind streaks arcing around the radar.

### F3. Pick a Beach → sun + palm + dune
Replace the SVG at line 1837:

```html
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true">
            <circle cx="5.4" cy="5.4" r="1.8"/>
            <line x1="5.4" y1="2.2" x2="5.4" y2="3.1"/>
            <line x1="5.4" y1="7.7" x2="5.4" y2="8.6"/>
            <line x1="2.2" y1="5.4" x2="3.1" y2="5.4"/>
            <line x1="7.7" y1="5.4" x2="8.6" y2="5.4"/>
            <path d="M16.4 17.8 Q16.8 12 17.4 6.6"/>
            <path d="M17.4 6.6 Q13 5.6 10.4 8.8"/>
            <path d="M17.4 6.6 Q21.8 6 22.6 9.8"/>
            <path d="M17.4 6.6 Q19.8 3.2 15.6 2.4"/>
            <path d="M17.4 6.6 Q14.6 3.8 12.2 5.4"/>
            <path d="M2 19.6 Q7 16.6 12 19.4 Q17 22.2 22 19.2"/>
          </svg>
```

Sun upper-left with 4 cardinal rays, palm trunk curving up-right with 4 fronds radiating from the crown, sandy horizon curve across the bottom.

---

## Apply order

1. **Item D** (pixelabs filter) — smallest, removes a visual bug users see immediately.
2. **Item B** (lastUpdate → header) — isolated markup + CSS move, unblocks Item C's header-flash target.
3. **Item C** (refresh flash CSS + JS hook) — depends on B being in place.
4. **Item A** (verdict-right horizontal restructure) — largest CSS+markup churn; also lands E2 via its mobile block.
5. **Item F** (3 new section SVGs) — independent, pure markup swap.
6. **Item E1** (surfboard hamburger morph) — JS + CSS together; independent of the rest.
7. **Item E3** — only if staff-engineer's mechanical pass confirms the light-mode hairline cause; otherwise skipped here.

After all items land, sanity-check:
- Desktop `>=1025px`: callouts left, compass right, divider between status and callouts. Header pill visible top-right.
- Tablet 720–1024px: same layout, tighter gaps.
- Mobile `<=720px`: compass inline-right of status at 88px, callouts full-width row below separated by a top border.
- `<=480px`: compass 68px, deg readout hidden, callouts stack vertically, header pill shows dot only.
- Refresh: compass flashes cyan, header pill flashes accent ring, needle only rotates when angle changes.
- Hover pixelabs icon: grayscale → full color + accent drop-shadow.
