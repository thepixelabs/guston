# ct-spec-v2 — Creative-Technologist spec, Phase 2 execution blueprint

This spec contains verbatim, copy-pasteable changes for 10 issues. Staff-engineer applies mechanically.

File references:
- `index.html` — single static file
- `assets/themes/pixelabs-themes.css`, `assets/themes/pixelabs-themes.js` (no edits needed)

All index.html line numbers refer to the current HEAD state researched in Phase 1.

---

## Issue 1 — Theme picker positioning (anchor to button)

### 1a. Markup — move picker INSIDE `.header-actions`

**Current** (`index.html` lines 1331–1346):

```html
      <div class="header-actions">
        <a href="https://pixelabs.net" target="_blank" rel="noopener noreferrer" class="pixelabs-link" aria-label="Pixelabs.net">
          <img src="assets/pixelabs-icon.png" width="28" height="28" alt="Pixelabs">
        </a>
        <button class="theme-picker-btn" aria-label="Choose theme pack" title="Theme pack">
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><circle cx="12" cy="12" r="9"/><path d="M12 3a9 9 0 0 0 0 18c1.5 0 2-1 2-2 0-1.5-1-2-1-3s1-2 2.5-2H19a2 2 0 0 0 2-2 9 9 0 0 0-9-9z"/><circle cx="7.5" cy="10.5" r="1" fill="currentColor"/><circle cx="12" cy="7.5" r="1" fill="currentColor"/><circle cx="16.5" cy="10.5" r="1" fill="currentColor"/></svg>
        </button>
        <button class="theme-btn" id="themeToggle" aria-label="Toggle colour theme" title="Toggle theme">
          <!-- icon swapped by JS -->
          <svg id="themeIcon" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><circle cx="12" cy="12" r="4"/><path d="M12 2v2M12 20v2M4.93 4.93l1.41 1.41M17.66 17.66l1.41 1.41M2 12h2M20 12h2M4.93 19.07l1.41-1.41M17.66 6.34l1.41-1.41"/></svg>
        </button>
      </div>
    </div>
  </header>

  <div id="themePicker" class="pxl-theme-picker" hidden aria-label="Theme picker"></div>
```

**Replace with** (also updates pixelabs markup from Issue 10 and theme-picker-btn icon):

```html
      <div class="header-actions">
        <a class="pixelabs-link" href="https://pixelabs.net" target="_blank" rel="noopener noreferrer" aria-label="Pixelabs.net">
          <img class="pixelabs-icon pixelabs-icon--default" src="pixelabs-brand/pixelabs-icon-mono.png" alt="Pixelabs" width="26" height="26">
          <img class="pixelabs-icon pixelabs-icon--hover" src="assets/pixelabs-icon.png" alt="" width="26" height="26" aria-hidden="true">
        </a>
        <button class="theme-picker-btn" aria-label="Choose theme pack" title="Theme pack" aria-haspopup="dialog" aria-expanded="false">
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true">
            <rect x="3"   y="8"   width="12" height="12" rx="2.2"/>
            <rect x="6.5" y="5"   width="12" height="12" rx="2.2" opacity="0.75"/>
            <rect x="10"  y="2"   width="12" height="12" rx="2.2" opacity="0.5"/>
          </svg>
        </button>
        <button class="theme-btn" id="themeToggle" aria-label="Toggle colour theme" title="Toggle theme">
          <svg id="themeIcon" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><circle cx="12" cy="12" r="4"/><path d="M12 2v2M12 20v2M4.93 4.93l1.41 1.41M17.66 17.66l1.41 1.41M2 12h2M20 12h2M4.93 19.07l1.41-1.41M17.66 6.34l1.41-1.41"/></svg>
        </button>
        <div id="themePicker" class="pxl-theme-picker" hidden aria-label="Theme picker" role="dialog"></div>
      </div>
    </div>
  </header>
```

Note: the `<div id="themePicker">` moves from being a sibling of `<main>` (line 1346) INTO `.header-actions` as the last child. Delete the old floating one at line 1346.

### 1b. CSS — anchor picker under the button, borderless buttons, notch arrow

**Replace** the entire `.header-actions` rule AND the `.theme-btn`, `.pixelabs-link`, `.theme-picker-btn`, and `.pxl-theme-picker` rules. Find these in `index.html` at approximately:
- line 140 `.header-actions`
- lines 141–148 `.theme-btn` + `.theme-btn:hover` + `.theme-btn svg`
- lines 149–158 `.pixelabs-link` cluster
- lines 1249–1289 `.theme-picker-btn`, `.pxl-theme-picker`, `.pixelabs-link img`

**Replace with this verbatim block** (can live in the existing `/* ===== THEME TOGGLE ===== */` area around line 139; the old duplicates at 1249+ must be deleted):

```css
    /* ===== HEADER ACTIONS (borderless icon cluster) ===== */
    .header-actions {
      display: flex; align-items: center; gap: 6px;
      flex-shrink: 0; position: relative;
    }
    .theme-btn,
    .theme-picker-btn {
      display: inline-flex; align-items: center; justify-content: center;
      width: 36px; height: 36px;
      background: transparent;
      border: 0;
      border-radius: 10px;
      color: var(--muted);
      transition: color .25s ease, transform .25s ease, filter .25s ease, background .25s ease;
      flex-shrink: 0;
    }
    .theme-btn:hover,
    .theme-picker-btn:hover {
      color: var(--accent);
      background: transparent;
      filter: drop-shadow(0 0 8px rgba(var(--accent-rgb), .55));
      transform: translateY(-1px);
    }
    .theme-btn:focus-visible,
    .theme-picker-btn:focus-visible,
    .pixelabs-link:focus-visible {
      outline: 2px solid var(--accent); outline-offset: 3px; border-radius: 10px;
    }
    .theme-btn svg,
    .theme-picker-btn svg { width: 20px; height: 20px; pointer-events: none; }

    /* Pixelabs link — borderless, dual-image swap */
    .pixelabs-link {
      position: relative;
      display: inline-flex; align-items: center; justify-content: center;
      width: 36px; height: 36px;
      padding: 0;
      background: transparent; border: 0;
      border-radius: 10px;
      transition: transform .25s ease;
    }
    .pixelabs-link:hover { transform: translateY(-1px); }
    .pixelabs-icon {
      display: block; width: 26px; height: 26px;
      transition: opacity .3s ease, transform .3s ease, filter .3s ease;
    }
    .pixelabs-icon--default { filter: brightness(0) invert(1) opacity(.72); }
    :root[data-theme="light"] .pixelabs-icon--default { filter: brightness(0) opacity(.6); }
    .pixelabs-icon--hover {
      position: absolute; inset: 50% auto auto 50%;
      transform: translate(-50%, -50%);
      opacity: 0;
    }
    .pixelabs-link:hover .pixelabs-icon--default { opacity: 0; }
    .pixelabs-link:hover .pixelabs-icon--hover {
      opacity: 1;
      transform: translate(-50%, -50%) scale(1.08);
      filter: drop-shadow(0 0 8px rgba(var(--accent-rgb), .6));
    }

    /* ===== THEME PICKER (anchored under its button) ===== */
    .pxl-theme-picker {
      position: absolute;
      top: calc(100% + 10px);
      right: 0;
      z-index: 150;
      width: 280px;
      max-width: calc(100vw - 24px);
      background: rgba(7,10,20,0.95);
      backdrop-filter: blur(16px) saturate(160%);
      -webkit-backdrop-filter: blur(16px) saturate(160%);
      border: 1px solid var(--border-bright);
      border-radius: var(--radius);
      padding: 14px;
      box-shadow: 0 18px 48px rgba(0,0,0,.5), 0 2px 8px rgba(0,0,0,.25);
      animation: pxl-picker-in .22s cubic-bezier(.2,.8,.2,1);
    }
    :root[data-theme="light"] .pxl-theme-picker {
      background: rgba(255,255,255,0.96);
      border-color: rgba(10,21,48,0.18);
      box-shadow: 0 18px 48px rgba(14,50,120,.22), 0 2px 8px rgba(14,50,120,.10);
    }
    .pxl-theme-picker[hidden] { display: none; }
    /* Notch arrow pointing up at the theme-picker-btn (2nd-from-right child) */
    .pxl-theme-picker::before,
    .pxl-theme-picker::after {
      content: ''; position: absolute;
      right: 52px; /* aligns under theme-picker-btn: theme-btn(36)+gap(6)+half(10) */
      width: 0; height: 0; pointer-events: none;
    }
    .pxl-theme-picker::before {
      top: -8px;
      border-left: 8px solid transparent;
      border-right: 8px solid transparent;
      border-bottom: 8px solid var(--border-bright);
    }
    .pxl-theme-picker::after {
      top: -7px;
      border-left: 7px solid transparent;
      border-right: 7px solid transparent;
      border-bottom: 7px solid rgba(7,10,20,0.95);
    }
    :root[data-theme="light"] .pxl-theme-picker::after {
      border-bottom-color: rgba(255,255,255,0.96);
    }
    @keyframes pxl-picker-in {
      from { opacity: 0; transform: translateY(-6px) scale(.98); }
      to   { opacity: 1; transform: translateY(0) scale(1); }
    }
    .pxl-theme-grid { display: grid; grid-template-columns: 1fr 1fr; gap: 10px; }
    .pxl-theme-card {
      display: flex; flex-direction: column; gap: 6px;
      padding: 10px; border-radius: var(--radius-sm);
      border: 1px solid var(--border); background: var(--panel);
      cursor: pointer; transition: all .2s ease; text-align: left;
    }
    .pxl-theme-card:hover { border-color: var(--accent); background: var(--panel-hover); }
    .pxl-theme-card[aria-pressed="true"] { border-color: var(--accent); box-shadow: 0 0 0 1px var(--accent) inset; }
    .pxl-theme-card__sample { height: 28px; border-radius: var(--radius-xs); }
    .pxl-theme-card__swatches { display: flex; gap: 3px; }
    .pxl-theme-card__swatch { flex: 1; height: 8px; border-radius: 2px; }
    .pxl-theme-card__name { font-size: .78rem; font-weight: 700; color: var(--text); }
    .pxl-theme-card__mood { font-size: .62rem; color: var(--muted); font-family: var(--mono); text-transform: uppercase; letter-spacing: .06em; }
    .pxl-theme-applybar { display: flex; justify-content: flex-end; margin-top: 10px; }
    .pxl-theme-applybar__btn {
      padding: 7px 14px; border-radius: var(--radius-sm);
      border: 1px solid var(--accent); background: rgba(var(--accent-rgb),0.12);
      color: var(--accent); font-weight: 600; font-size: .78rem; cursor: pointer;
    }
    .pxl-theme-applybar__btn:hover { background: rgba(var(--accent-rgb),0.2); }

    @media (max-width: 560px) {
      .pxl-theme-picker { width: calc(100vw - 24px); right: -8px; }
      .pxl-theme-picker::before, .pxl-theme-picker::after { right: 60px; }
    }
```

### 1c. JS — toggle aria-expanded on the button

Inside the picker init block in `index.html` lines 2443–2462, **replace** the click handler:

```js
        document.querySelector('.theme-picker-btn')?.addEventListener('click', e => {
          e.stopPropagation();
          if (picker.hasAttribute('hidden')) picker.removeAttribute('hidden');
          else picker.setAttribute('hidden', '');
        });
```

**with**:

```js
        const pickerBtn = document.querySelector('.theme-picker-btn');
        pickerBtn?.addEventListener('click', e => {
          e.stopPropagation();
          const open = picker.hasAttribute('hidden');
          if (open) { picker.removeAttribute('hidden'); pickerBtn.setAttribute('aria-expanded', 'true'); }
          else      { picker.setAttribute('hidden', '');  pickerBtn.setAttribute('aria-expanded', 'false'); }
        });
```

And update the outside-click + Escape handlers to also reset aria-expanded:

```js
        document.addEventListener('click', e => {
          if (!picker.hasAttribute('hidden') && !picker.contains(e.target) && !e.target.closest('.theme-picker-btn')) {
            picker.setAttribute('hidden', '');
            pickerBtn?.setAttribute('aria-expanded', 'false');
          }
        });
        document.addEventListener('keydown', e => {
          if (e.key === 'Escape' && !picker.hasAttribute('hidden')) {
            picker.setAttribute('hidden', '');
            pickerBtn?.setAttribute('aria-expanded', 'false');
          }
        });
```

---

## Issue 3 — Light mode premium rewrite

**Replace** the entire light-mode block at `index.html` lines 104–138 with:

```css
    /* ===== LIGHT MODE — premium navy glass ===== */
    :root[data-theme="light"] {
      color-scheme: light;
      --bg: #e8eef7;
      --bg2: #dde8f5;
      --panel: rgba(255,255,255,0.62);
      --panel-hover: rgba(255,255,255,0.82);
      --border: rgba(14,50,120,0.14);
      --border-bright: rgba(14,50,120,0.26);
      --text: #0a1530;
      --muted: rgba(10,21,48,0.62);
      --subtle: rgba(10,21,48,0.42);
      --accent: #0b6fa3;
      --accent2: #6d4ac7;
      --good: #0a8f5b;
      --warn: #b45309;
      --bad: #c41f40;
      --accent-rgb: 14,165,233;
      --accent-2-rgb: 124,58,237;
      --shadow: 0 12px 32px -12px rgba(14,50,120,0.22), 0 2px 8px rgba(14,50,120,0.08);
    }

    /* Body mesh — light navy with blue-violet hint top-right */
    :root[data-theme="light"] body { background: linear-gradient(135deg, #e8eef7 0%, #dde8f5 100%); }
    :root[data-theme="light"] body::before {
      background:
        radial-gradient(900px 600px at 92% 0%, rgba(124,58,237,0.12), transparent 55%),
        radial-gradient(1200px 700px at 20% 0%, rgba(14,165,233,0.18), transparent 55%),
        radial-gradient(1000px 700px at 85% 15%, rgba(124,58,237,0.10), transparent 55%),
        linear-gradient(180deg, #e8eef7 0%, #dde8f5 55%, #e8eef7 100%);
    }

    /* Header */
    :root[data-theme="light"] .site-header {
      background: rgba(232,238,247,0.85);
      backdrop-filter: saturate(160%) blur(16px);
      -webkit-backdrop-filter: saturate(160%) blur(16px);
    }
    :root[data-theme="light"] .site-header::after {
      background: linear-gradient(90deg,
        transparent 0%, rgba(14,165,233,0.45) 25%,
        rgba(124,58,237,0.42) 60%, rgba(10,143,91,0.28) 80%, transparent 100%);
    }
    :root[data-theme="light"] .brand-icon {
      filter: drop-shadow(0 4px 12px rgba(14,165,233,0.35));
    }

    /* Hero mesh — light friendly */
    :root[data-theme="light"] .hero::before {
      background:
        radial-gradient(1200px 700px at 20% 0%, rgba(14,165,233,0.22), transparent 55%),
        radial-gradient(1000px 700px at 85% 15%, rgba(124,58,237,0.14), transparent 55%),
        radial-gradient(500px 260px at 50% 90%, rgba(10,143,91,0.08), transparent 60%);
    }

    /* Frosted glass cards */
    :root[data-theme="light"] .hero-grid .card {
      background:
        linear-gradient(150deg,
          rgba(14,165,233,0.10),
          rgba(124,58,237,0.06) 60%,
          rgba(255,255,255,0.40) 100%);
      backdrop-filter: blur(8px) saturate(140%);
      -webkit-backdrop-filter: blur(8px) saturate(140%);
      border: 1px solid rgba(14,165,233,0.24);
      box-shadow:
        0 12px 32px -12px rgba(14,50,120,0.22),
        0 2px 8px rgba(14,50,120,0.08);
    }
    :root[data-theme="light"] .hero-grid .card::before {
      background: linear-gradient(90deg, #0b6fa3, transparent);
      box-shadow: 0 0 8px rgba(11,111,163,0.5);
      opacity: 1;
    }
    :root[data-theme="light"] .hero-grid .card::after {
      background:
        linear-gradient(180deg, #0b6fa3 0 2px, transparent 2px),
        linear-gradient(270deg, #0b6fa3 0 2px, transparent 2px);
      opacity: .75;
    }
    :root[data-theme="light"] .hero-grid .card:hover {
      transform: translateY(-3px);
      border-color: rgba(14,165,233,0.5);
      box-shadow:
        0 22px 52px -16px rgba(14,165,233,0.38),
        inset 0 0 0 1px rgba(14,165,233,0.2);
    }
    :root[data-theme="light"] .hero-grid .card .card-value {
      color: #0a1530;
      text-shadow: 0 0 14px rgba(14,165,233,0.12);
    }
    :root[data-theme="light"] .hero-grid .card .card-label {
      color: #3b4c6b;
      text-shadow: 0 1px 0 rgba(10,21,48,0.04);
      font-family: var(--mono);
      text-transform: uppercase;
    }
    :root[data-theme="light"] .hero-grid .card .card-detail { color: rgba(10,21,48,0.58); }

    /* Verdict hero */
    :root[data-theme="light"] .verdict-hero,
    :root[data-theme="light"] .kite-status {
      background:
        linear-gradient(135deg,
          rgba(14,165,233,0.12),
          rgba(124,58,237,0.08) 50%,
          rgba(10,143,91,0.08) 100%),
        rgba(255,255,255,0.55);
      border: 1px solid rgba(14,165,233,0.28);
      box-shadow: 0 18px 48px -16px rgba(14,50,120,0.22);
      backdrop-filter: blur(10px) saturate(140%);
      -webkit-backdrop-filter: blur(10px) saturate(140%);
    }
    :root[data-theme="light"] .verdict-hero .verdict-tag { background: rgba(255,255,255,0.55); color: var(--text); border-color: rgba(14,50,120,0.18); }

    /* Wind arrow / compass ring */
    :root[data-theme="light"] .wind-dir-arrow {
      background: radial-gradient(circle at 30% 30%, rgba(14,165,233,0.22), rgba(14,165,233,0.06) 70%);
      border-color: rgba(14,165,233,0.32);
      box-shadow: inset 0 0 12px rgba(14,165,233,0.14), 0 0 16px rgba(14,165,233,0.10);
    }
    :root[data-theme="light"] .wind-dir-arrow svg { color: #0b6fa3; filter: drop-shadow(0 0 4px rgba(14,165,233,0.55)); }

    /* Sdot Yam image cards — flip dark preview to light canvas */
    :root[data-theme="light"] .sdotyam-grid .wind-img-card,
    :root[data-theme="light"] .sdotyam-grid .wind-img-card a,
    :root[data-theme="light"] .sdotyam-grid .wind-img-card img { background: #f4f8fd; }
    :root[data-theme="light"] .sdotyam-grid .wind-img-card .vws-label {
      color: rgba(10,21,48,0.72);
      background: rgba(255,255,255,0.78);
      border-top-color: rgba(14,50,120,0.14);
    }
```

---

## Issue 5 — Kite callout color + layout (stacked in verdict-right)

### 5a. CSS — `.verdict-right` stack + callouts as vertical stack

**Replace** the entire `/* ===== VERDICT HERO LAYOUT ===== */` block at `index.html` lines 1194–1237 with:

```css
    /* ===== VERDICT HERO LAYOUT (compass + stacked callouts) ===== */
    .verdict-hero { align-items: stretch; }
    .verdict-right {
      display: flex; flex-direction: column; align-items: stretch;
      gap: 14px; padding-left: 18px; border-left: 1px solid var(--border);
      flex-shrink: 0; width: 200px;
    }
    .verdict-compass {
      width: 130px; height: 130px; margin: 0 auto; position: relative;
    }
    .verdict-compass svg { width: 100%; height: 100%; }
    .verdict-right .compass-readout { text-align: center; }
    .verdict-right .card-value { font-size: 1.05rem !important; font-family: var(--mono); }
    .verdict-right .card-detail { font-size: .72rem; color: var(--muted); }

    .verdict-callouts {
      display: flex; flex-direction: column; gap: 10px; margin-top: 0;
    }
    .verdict-right .verdict-callouts { width: 100%; }

    .suit-callout,
    .kite-callout,
    .waves-callout {
      display: inline-flex; align-items: center; gap: 10px;
      padding: 9px 12px; border-radius: 12px;
      flex-shrink: 0;
    }
    .suit-callout .suit-text,
    .kite-callout .suit-text,
    .waves-callout .suit-text { display: flex; flex-direction: column; line-height: 1.15; min-width: 0; }
    .suit-callout .suit-label,
    .kite-callout .suit-label,
    .waves-callout .suit-label {
      font-family: var(--mono); font-size: .60rem; font-weight: 700;
      text-transform: uppercase; letter-spacing: .12em; color: var(--muted);
    }
    .suit-callout .suit-value,
    .kite-callout .suit-value,
    .waves-callout .suit-value {
      font-size: .88rem; font-weight: 700; color: var(--text); margin-top: 1px;
      white-space: nowrap; overflow: hidden; text-overflow: ellipsis;
    }

    /* Suit — cyan */
    .suit-callout {
      background: linear-gradient(135deg, rgba(113,224,255,0.14), rgba(113,224,255,0.06));
      border: 1px solid rgba(113,224,255,0.34);
      box-shadow: 0 0 22px -10px rgba(113,224,255,0.4);
    }
    .suit-callout .suit-icon { color: var(--accent); filter: drop-shadow(0 0 6px rgba(113,224,255,0.55)); flex-shrink: 0; }

    /* Kite — vivid orange flame */
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

    /* Light-mode callout tweaks */
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

    /* Mobile: verdict-right drops below, callouts go horizontal */
    @media (max-width: 720px) {
      .verdict-hero { flex-wrap: wrap; }
      .verdict-right {
        width: 100%;
        border-left: 0;
        border-top: 1px solid var(--border);
        padding-left: 0; padding-top: 14px; margin-top: 10px;
      }
      .verdict-compass { width: 110px; height: 110px; }
      .verdict-right .verdict-callouts {
        flex-direction: row; flex-wrap: wrap; justify-content: center;
      }
      .verdict-right .verdict-callouts > * { flex: 1 1 140px; min-width: 0; }
    }
    @media (max-width: 480px) {
      .verdict-right .verdict-callouts { flex-direction: column; }
      .verdict-right .verdict-callouts > * { flex: 1 1 auto; }
    }
```

### 5b. Markup — move callouts from status-text into verdict-right

**Current structure** (lines 1366–1437) has this tree:

```
.kite-status.verdict-hero
├── .status-indicator
├── .status-text
│   ├── .verdict-headline
│   ├── .verdict-desc-row (contains #statusDesc)
│   └── .verdict-callouts (suit + kite + waves)  ← MOVE THIS
└── .verdict-right
    ├── .compass-rose.verdict-compass
    └── .compass-readout
```

**Target structure:**

```
.kite-status.verdict-hero
├── .status-indicator
├── .status-text
│   ├── .verdict-headline
│   └── .verdict-desc-row (contains #statusDesc)
└── .verdict-right
    ├── .compass-rose.verdict-compass
    ├── .compass-readout
    └── .verdict-callouts (suit + kite + waves)  ← NOW LIVES HERE
```

**Concrete edit:** cut the `<div class="verdict-callouts">...</div>` block (lines 1374–1404 — from the opening `<div class="verdict-callouts">` through its closing `</div>` right before `</div>` closing `.status-text`) and paste it immediately after `</div>` closing `.compass-readout` (line 1436), so it becomes the final child of `.verdict-right`.

Also, inside the moved block, **replace** the kite callout SVG (originally at line 1391):

```html
                <svg viewBox="0 0 24 24" width="22" height="22" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><circle cx="12" cy="12" r="9"/><path d="M12 3v18 M3 12h18"/></svg>
```

**with a proper kite silhouette:**

```html
                <svg viewBox="0 0 20 20" width="22" height="22" fill="none" stroke="currentColor" stroke-width="1.6" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true">
                  <path d="M10 1.5 L17.2 10 L10 18.5 L2.8 10 Z" fill="rgba(255,107,53,0.18)"/>
                  <path d="M10 1.5 L10 18.5" opacity="0.85"/>
                  <path d="M2.8 10 L17.2 10" opacity="0.55"/>
                  <path d="M10 18.5 Q7.5 19.8 6 19" stroke-width="1.3"/>
                  <path d="M10 18.5 Q12.5 19.8 14 19" stroke-width="1.3"/>
                </svg>
```

---

## Issue 8 — Updated-time badge in verdict hero top-right with live pulse

### 8a. Markup changes

**Remove** the `<span class="refresh-badge" id="lastUpdate">Loading...</span>` at line 1358 (inside `.section-title`).

**Add** a new absolute wrapper as the first child of `.kite-status.verdict-hero` (immediately after the opening `<div class="kite-status verdict-hero" ...>` at line 1362):

```html
          <div class="verdict-updated" aria-live="polite">
            <span class="live-pulse" aria-hidden="true"></span>
            <span id="lastUpdate">Loading...</span>
          </div>
```

### 8b. CSS — absolute positioning + pulse dot

Append to the verdict-hero section (near `.verdict-hero { padding: 24px 28px; }` at line 443):

```css
    .verdict-hero { position: relative; }
    .verdict-updated {
      position: absolute; top: 12px; right: 14px;
      display: inline-flex; align-items: center; gap: 7px;
      font-family: var(--mono); font-size: .66rem; font-weight: 600;
      color: var(--muted);
      letter-spacing: .05em;
      padding: 4px 10px 4px 8px;
      border-radius: 999px;
      background: rgba(255,255,255,0.04);
      border: 1px solid var(--border);
      backdrop-filter: blur(6px);
      -webkit-backdrop-filter: blur(6px);
      z-index: 2;
      pointer-events: none;
    }
    .verdict-updated .live-pulse {
      display: inline-block; width: 7px; height: 7px; border-radius: 50%;
      background: var(--good);
      box-shadow: 0 0 8px var(--good), 0 0 14px rgba(92,255,177,0.5);
      animation: pulse 1.6s ease-in-out infinite;
    }
    :root[data-theme="light"] .verdict-updated {
      background: rgba(255,255,255,0.72);
      border-color: rgba(14,50,120,0.16);
      color: rgba(10,21,48,0.62);
    }
    @media (max-width: 560px) {
      .verdict-updated { top: 8px; right: 10px; font-size: .60rem; padding: 3px 8px 3px 6px; }
    }
```

No JS change needed — `#lastUpdate` still exists with the same id (line 2275 updates it via `textContent`).

---

## Issue 9 — Responsive across all viewports + mobile accordion

### 9a. Responsive cascade CSS

Append to the end of the main `<style>` block (immediately before line 1290 `</style>`):

```css
    /* ===================================================================
       RESPONSIVE CASCADE — phone / large phone / tablet / laptop / desktop
       =================================================================== */

    /* --- >1280 desktop: default layout, no override --- */

    /* --- 1024 - 1280 small laptop --- */
    @media (max-width: 1280px) {
      :root { --max: 1120px; }
      .hero-grid { grid-template-columns: repeat(auto-fill, minmax(200px, 1fr)); gap: 14px; }
    }

    /* --- 720 - 1024 tablet --- */
    @media (max-width: 1024px) {
      :root { --header-h: 60px; }
      .nav { gap: 2px; }
      .nav-link { padding: 5px 10px; font-size: .80rem; }
      .hero-grid { grid-template-columns: repeat(3, 1fr); gap: 12px; }
      .verdict-hero { flex-wrap: wrap; }
      .beach-cam-grid { grid-template-columns: repeat(2, 1fr); }
      .sdotyam-grid { grid-template-columns: repeat(2, 1fr); }
      .sdotyam-main { grid-column: span 2; }
    }

    /* --- 480 - 720 large phone --- */
    @media (max-width: 720px) {
      .hero-grid { grid-template-columns: repeat(2, 1fr); gap: 10px; }
      .hero-grid .card { padding: 14px 16px 16px; }
      .hero-grid .card .card-value { font-size: 1.6rem; }
      .kite-status { padding: 18px 18px; gap: 12px; }
      .status-indicator { width: 40px; height: 40px; }
      .status-text strong { font-size: 1.05rem; }
      .section-title { font-size: 1.1rem; }
      section { padding: 32px 0; }
      .beach-cam-grid { grid-template-columns: repeat(2, 1fr); }
      .windy-embed iframe { height: 320px; }
    }

    /* --- <480 phone --- */
    @media (max-width: 480px) {
      :root { --header-h: 56px; }
      .brand-name { font-size: 1rem; letter-spacing: 1px; }
      .container { width: calc(100% - 24px); }
      .hero-grid { grid-template-columns: 1fr; }
      .hero-grid .card .card-value { font-size: 1.8rem; }
      .verdict-headline { gap: 8px; }
      .verdict-updated { position: static; margin-bottom: 8px; align-self: flex-start; }
      .kite-status { flex-direction: column; align-items: flex-start; }
      .status-indicator { align-self: flex-start; }
      .beach-cam-grid { grid-template-columns: 1fr; }
      .sdotyam-grid { grid-template-columns: 1fr; }
      .sdotyam-main { grid-column: span 1; }
      .cam-links-grid { grid-template-columns: 1fr; }
      .live-wind-grid { grid-template-columns: 1fr; }
      .wind-img-grid { grid-template-columns: repeat(2, 1fr); }
      .beach-filter { gap: 6px; }
      .beach-btn { padding: 6px 12px; font-size: .74rem; }
      .windy-embed iframe { height: 260px; }
      .all-spots-strip { display: flex; overflow-x: auto; scroll-snap-type: x mandatory; gap: 10px; padding-bottom: 6px; -webkit-overflow-scrolling: touch; }
      .all-spots-strip > .lw-card { flex: 0 0 78%; scroll-snap-align: start; }
    }

    /* ===================================================================
       MOBILE ACCORDION SHELL — <=560 only
       JS adds .section-collapse button + .section-body wrapper at runtime.
       =================================================================== */
    .section-collapse { display: none; }
    .section-body { display: contents; }

    @media (max-width: 560px) {
      .has-mobile-accordion .section-collapse {
        display: flex; width: 100%;
        align-items: center; justify-content: space-between;
        padding: 14px 16px; margin: 0 0 2px;
        background: linear-gradient(135deg, rgba(113,224,255,0.06), rgba(167,139,250,0.04));
        border: 1px solid var(--border); border-radius: var(--radius-sm);
        font-family: var(--mono); font-size: .82rem; font-weight: 700;
        color: var(--text); text-transform: uppercase; letter-spacing: .08em;
        cursor: pointer;
        transition: background .25s ease, border-color .25s ease;
      }
      .has-mobile-accordion .section-collapse:hover { border-color: var(--accent); }
      .has-mobile-accordion .section-collapse .chev {
        width: 18px; height: 18px; transition: transform .35s cubic-bezier(.2,.8,.2,1);
      }
      .has-mobile-accordion[data-collapsed="false"] .section-collapse .chev { transform: rotate(180deg); }
      .has-mobile-accordion .section-body {
        display: block;
        overflow: hidden;
        max-height: 0;
        opacity: 0;
        transform: scale(.995);
        transition: max-height .45s cubic-bezier(.2,.8,.2,1),
                    opacity .3s ease,
                    transform .3s ease;
      }
      .has-mobile-accordion[data-collapsed="false"] .section-body {
        max-height: var(--section-max, 4000px);
        opacity: 1;
        transform: scale(1);
      }
      /* Suppress original .section-title since collapse button replaces its affordance */
      .has-mobile-accordion > .container > .section-title,
      .has-mobile-accordion .section-title { display: none; }
      /* But keep Conditions section title visible — JS doesn't wrap #conditions */
    }
```

### 9b. JS — mobile accordion initialization

Append inside the existing `<script>` block at `index.html` near the init area (around line 2464, before `// ===== INIT =====`):

```js
    // ===== MOBILE ACCORDION =====
    (function initMobileAccordion() {
      const MQ = window.matchMedia('(max-width: 560px)');
      // Conditions stays expanded always; the others collapse by default.
      const sectionIds = ['wind', 'cameras', 'forecast', 'radar', 'map'];
      const chevSVG = '<svg class="chev" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path d="M6 9l6 6 6-6"/></svg>';

      function wrap() {
        sectionIds.forEach(id => {
          const sec = document.getElementById(id);
          if (!sec || sec.classList.contains('has-mobile-accordion')) return;
          const titleEl = sec.querySelector('.section-title');
          const labelText = titleEl ? titleEl.querySelector('.section-title-text')?.textContent?.trim() || id : id;

          // Build the collapse button
          const btn = document.createElement('button');
          btn.type = 'button';
          btn.className = 'section-collapse';
          btn.setAttribute('aria-expanded', 'false');
          btn.setAttribute('aria-controls', id + '-body');
          btn.innerHTML = '<span>' + labelText + '</span>' + chevSVG;

          // Wrap existing children (except the button we just made) in a body div
          const body = document.createElement('div');
          body.className = 'section-body';
          body.id = id + '-body';
          while (sec.firstChild) body.appendChild(sec.firstChild);
          sec.appendChild(btn);
          sec.appendChild(body);
          sec.classList.add('has-mobile-accordion');
          sec.setAttribute('data-collapsed', 'true');

          btn.addEventListener('click', () => {
            const isCollapsed = sec.getAttribute('data-collapsed') === 'true';
            // Accordion behaviour: close siblings first
            if (isCollapsed) {
              sectionIds.forEach(otherId => {
                if (otherId === id) return;
                const other = document.getElementById(otherId);
                if (other) other.setAttribute('data-collapsed', 'true');
                const otherBtn = other?.querySelector('.section-collapse');
                otherBtn?.setAttribute('aria-expanded', 'false');
              });
              // Measure and set max-height
              body.style.setProperty('--section-max', body.scrollHeight + 'px');
              sec.setAttribute('data-collapsed', 'false');
              btn.setAttribute('aria-expanded', 'true');
            } else {
              sec.setAttribute('data-collapsed', 'true');
              btn.setAttribute('aria-expanded', 'false');
            }
          });
        });
      }

      function unwrap() {
        sectionIds.forEach(id => {
          const sec = document.getElementById(id);
          if (!sec || !sec.classList.contains('has-mobile-accordion')) return;
          const body = sec.querySelector(':scope > .section-body');
          const btn = sec.querySelector(':scope > .section-collapse');
          if (body) { while (body.firstChild) sec.insertBefore(body.firstChild, body); body.remove(); }
          if (btn) btn.remove();
          sec.classList.remove('has-mobile-accordion');
          sec.removeAttribute('data-collapsed');
        });
      }

      function apply() { if (MQ.matches) wrap(); else unwrap(); }
      apply();
      MQ.addEventListener ? MQ.addEventListener('change', apply) : MQ.addListener(apply);
    })();
```

Note: the `#conditions` section is intentionally NOT wrapped — it stays expanded as the primary answer.

---

## Issue 10 — Header icons: borderless, new theme glyph, unified pixelabs tint

Covered in full by **Issue 1** (markup + CSS). Specifically:

- **Borderless buttons**: the rewritten `.theme-btn` / `.theme-picker-btn` / `.pixelabs-link` rules in Issue 1b set `border: 0` and `background: transparent`, with hover states using color + drop-shadow glow instead of border.
- **New theme picker glyph**: the layered-swatches SVG (3 overlapping rounded rects) is inlined verbatim in Issue 1a inside the `<button class="theme-picker-btn">`.
- **Pixelabs dual-image swap**: the `<a class="pixelabs-link">` markup in Issue 1a uses two `<img>` tags (`pixelabs-icon--default` monochrome at rest, `pixelabs-icon--hover` full color on hover), with the CSS in Issue 1b filtering the default to a white silhouette (or dark silhouette in light mode) matching the other icons, and revealing the original gradient on hover with a drop-shadow glow.

No additional edits needed for Issue 10 beyond what Issue 1 already prescribes.

---

## Apply-order checklist for staff-engineer

1. Issue 3 — replace light-mode block (lines 104–138).
2. Issue 1b — replace/remove old theme-btn, pixelabs-link, theme-picker-btn, pxl-theme-picker CSS rules (lines ~140–158 AND ~1249–1289). Insert new combined block.
3. Issue 1a — update `.header-actions` markup; move `#themePicker` div inside; update pixelabs markup; replace theme-picker-btn SVG.
4. Issue 1c — update JS handlers for picker toggle (aria-expanded).
5. Issue 5a — replace verdict-hero layout CSS block (lines 1194–1237).
6. Issue 5b — move `.verdict-callouts` markup from inside `.status-text` into `.verdict-right`; swap kite SVG.
7. Issue 8a — remove `#lastUpdate` from `.section-title`; add `.verdict-updated` wrapper as first child of `.kite-status.verdict-hero`.
8. Issue 8b — append verdict-updated CSS.
9. Issue 9a — append responsive cascade CSS before `</style>`.
10. Issue 9b — append mobile accordion JS before `// ===== INIT =====`.

After all edits: smoke test by opening the page at 360px, 480px, 720px, 1024px, 1440px, toggling dark/light, opening theme picker, clicking accordion sections on mobile.
