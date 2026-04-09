# CT Spec v4 — Verified fixes for regressions from v3

All line numbers reference the **current** state of files on disk as of this research pass. Grep before applying each Edit; if the old_string no longer matches, re-find via Grep.

Files touched:
- `/Users/netz/Documents/git/guston/index.html`
- `/Users/netz/Documents/git/guston/assets/themes/pixelabs-themes.css`
- `/Users/netz/Documents/git/guston/assets/themes/pixelabs-themes.js`

Apply order: **8 → 5 → 3 → 1 → 7 → 6 → 9 → 11**. Items 4 and 10 land inside Item 7.

---

## Item 8 — Dark line above the top bar

### Root cause
`html` element has no background. Above the fixed header (which uses a translucent `color-mix(in srgb, var(--bg) 80%, transparent)` bg) you can see through to `html`, which on iOS Safari and mobile Chrome paints the default page bg (black or system color). On overscroll / rubber-band, and on the notch area, this shows as a thin dark band above the header.

There is no `border-top` on `site-header`. There is no `body::before` drawing a dark line at the top. The `.site-header::after` 1px gradient sits at the *bottom* of the header — unrelated.

### Fix (index.html)
Add a solid background to `html` so there is nothing dark to bleed through. Find the existing `html { scroll-behavior: ... }` rule (around line 418) and extend it.

Replace:
```css
    html { scroll-behavior: smooth; scroll-padding-top: calc(var(--header-h) + 24px); }
```
With:
```css
    html {
      scroll-behavior: smooth;
      scroll-padding-top: calc(var(--header-h) + 24px);
      background: var(--bg);
    }
```

Additionally, make the header fully opaque at its *top* edge so even translucency regressions cannot reveal a line. Find the existing `.site-header { ... }` rule (around line 458) and replace its `background` declaration.

Replace:
```css
      background: color-mix(in srgb, var(--bg) 80%, transparent);
```
With:
```css
      background: var(--bg);
      background: color-mix(in srgb, var(--bg) 92%, transparent);
```
(Two declarations: the first is a fallback for browsers without `color-mix`; the second raises opacity from 80% to 92% so the blur still reads as glass but no darker layer can show through.)

---

## Item 5 — Pixelabs icon shows as white/grey square

### Root cause
`/assets/pixelabs-icon.png` has a non-transparent background. The CSS filter chain `grayscale(100%) brightness(1.4) contrast(0.95) opacity(0.72)` bleaches the white square, producing a visible tile. Inverting on light mode (`brightness(0.35)`) makes a dark square. The PNG is the wrong asset for silhouette styling.

### Fix — inline SVG, drop the PNG reference

Find the current markup (around line 1802–1804):
```html
        <a class="pixelabs-link" href="https://pixelabs.net" target="_blank" rel="noopener noreferrer" aria-label="Pixelabs.net">
          <img class="pixelabs-icon" src="assets/pixelabs-icon.png" alt="Pixelabs" width="26" height="26">
        </a>
```

Replace with:
```html
        <a class="pixelabs-link" href="https://pixelabs.net" target="_blank" rel="noopener noreferrer" aria-label="Pixelabs.net" title="Made by Pixelabs">
          <svg class="pixelabs-icon" viewBox="0 0 32 32" fill="none" aria-hidden="true" focusable="false">
            <!-- rounded square badge frame -->
            <rect x="3" y="3" width="26" height="26" rx="6" ry="6"
                  fill="none" stroke="currentColor" stroke-width="1.8"/>
            <!-- bold P: vertical stem + rounded bowl -->
            <path d="M11 9 L11 24"
                  stroke="currentColor" stroke-width="2.6" stroke-linecap="round"/>
            <path d="M11 9 L17 9 Q22 9 22 13.5 Q22 18 17 18 L11 18"
                  stroke="currentColor" stroke-width="2.6" stroke-linecap="round" stroke-linejoin="round" fill="none"/>
            <!-- pixel dot at bottom-right: the Pixelabs signature square pixel -->
            <rect x="20" y="20" width="4" height="4" rx="0.5" fill="currentColor"/>
          </svg>
        </a>
```

### Replace the `.pixelabs-icon` CSS block (around lines 319–336)

Find:
```css
    .pixelabs-icon {
      width: 26px; height: 26px;
      display: block;
      filter: grayscale(100%) brightness(1.4) contrast(0.95) opacity(0.72);
      transition: filter .3s ease, transform .3s ease;
    }
    .pixelabs-link:hover .pixelabs-icon {
      filter: grayscale(0%) brightness(1) contrast(1) opacity(1)
              drop-shadow(0 0 8px rgba(var(--accent-rgb), 0.35));
      transform: scale(1.06);
    }
    :root[data-theme="light"] .pixelabs-icon {
      filter: grayscale(100%) brightness(0.35) contrast(1.1) opacity(0.72);
    }
    :root[data-theme="light"] .pixelabs-link:hover .pixelabs-icon {
      filter: grayscale(0%) brightness(1) contrast(1) opacity(1)
              drop-shadow(0 0 8px rgba(14,50,120,0.25));
    }
```

Replace with:
```css
    .pixelabs-icon {
      width: 22px; height: 22px;
      display: block;
      color: var(--muted);
      transition: color .25s ease, transform .25s ease, filter .25s ease;
    }
    .pixelabs-link:hover .pixelabs-icon {
      color: var(--accent);
      filter: drop-shadow(0 0 6px rgba(var(--accent-rgb), 0.55));
      transform: scale(1.06);
    }
    :root[data-theme="light"] .pixelabs-icon { color: var(--muted); }
    :root[data-theme="light"] .pixelabs-link:hover .pixelabs-icon {
      color: var(--accent);
      filter: drop-shadow(0 0 6px rgba(14,50,120,0.35));
    }
```

The PNG file can remain on disk; nothing references it anymore.

---

## Item 3 — Last updated in header (verify)

### Current state
Already in the header. Lines 1797–1801:
```html
      <div class="header-actions">
        <div class="header-lastupdate" aria-live="polite" title="Last data refresh">
          <span class="live-pulse" aria-hidden="true"></span>
          <span id="lastUpdate">Loading…</span>
        </div>
```
And `.header-lastupdate` CSS lives at lines 243–283.

### The actual regression
The v3 spec *did* land structurally, but v3 only added it as the first child of `.header-actions`. User says "it's still in the same place across all themes, not in the navbar". That likely means: on certain theme packs the `.header-lastupdate` pill visually disappears into the panel color, or on mobile (≤480px) the text is hidden and only the pulse dot remains — giving the impression that the timestamp is "not there" in the header.

Also, there may be a **second** stale `#lastUpdate` somewhere that older code still writes to, causing the duplicate/ghost rendering. Grep confirms only one `#lastUpdate` in markup (the header one) and one write in the JS (line 2818). So there is no duplicate — the element is correct.

### Fix — make the header pill unmistakably visible on every pack, and ensure the ≤480px collapse doesn't make it look missing

Find the existing `.header-lastupdate` block at lines 243–257:
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
```

Replace with:
```css
    .header-lastupdate {
      display: inline-flex; align-items: center; gap: 7px;
      font-family: var(--mono); font-size: .66rem; font-weight: 600;
      color: var(--text);
      letter-spacing: .05em;
      padding: 5px 11px 5px 9px;
      border-radius: 999px;
      background: color-mix(in srgb, var(--accent) 10%, transparent);
      border: 1px solid color-mix(in srgb, var(--accent) 38%, transparent);
      backdrop-filter: blur(6px);
      -webkit-backdrop-filter: blur(6px);
      white-space: nowrap;
      transition: color .25s ease, border-color .25s ease, background .25s ease, transform .25s ease;
      position: relative;
      cursor: default;
    }
    .header-lastupdate:hover { transform: translateY(-1px); }
```

Also replace the ≤480px block at lines 280–283:
```css
    @media (max-width: 480px) {
      .header-lastupdate { padding: 5px 6px; }
      .header-lastupdate #lastUpdate { display: none; }
    }
```
With:
```css
    @media (max-width: 480px) {
      .header-lastupdate {
        padding: 5px 8px;
        /* Keep short HH:MM visible; full "Updated HH:MM" is too wide */
      }
      .header-lastupdate #lastUpdate { font-size: .58rem; }
    }
```

And update the JS write (line 2818) to use a shorter mobile-friendly string:

Find:
```js
          document.getElementById('lastUpdate').textContent = `Updated ${now.toLocaleTimeString('en-IL', { hour: '2-digit', minute: '2-digit' })}`;
```
Replace with:
```js
          document.getElementById('lastUpdate').textContent = now.toLocaleTimeString('en-IL', { hour: '2-digit', minute: '2-digit' });
```
(Drops the "Updated " prefix so the pill stays compact. The pulsing green dot already communicates liveness; the `title="Last data refresh"` attribute provides the label for screen readers and tooltips.)

---

## Item 1 — Theme picker bugs

Three sub-bugs, three fixes.

### 1a. Preview/setTheme clobbers user's current mode

**Root cause:** `applyPackToDOM` (pixelabs-themes.js lines 96–104) does:
```js
if (pack.modes && pack.modes.length === 1) {
  html.setAttribute('data-theme', pack.modes[0]);
}
```
For `desert-ethnic` (`modes: ['light']`), this forces `data-theme="light"` every preview. For `cyber-arcade` (`modes: ['dark']`), forces dark. That is acceptable for single-mode packs. **But** `revertPreview` calls `applyPackToDOM(committedPack, pack)` — if the committed pack is `hud` (multi-mode), that function does NOT restore the original `data-theme`, so whatever the preview left behind sticks.

**Fix:** capture and restore `data-theme` across previews. Replace these three functions in `pixelabs-themes.js`:

Replace `applyPackToDOM` (lines 96–104):
```js
  function applyPackToDOM(packId, pack) {
    var html = document.documentElement;
    html.setAttribute('data-theme-pack', packId);
    if (pack.modes && pack.modes.length === 1) {
      html.setAttribute('data-theme', pack.modes[0]);
    }
    var mode = html.getAttribute('data-theme') || (pack.modes && pack.modes[0]) || 'dark';
    return mode;
  }
```
With:
```js
  // Snapshot of the user's mode BEFORE any preview started.
  // Populated by previewTheme on first preview, cleared by setTheme/revertPreview.
  var previewOriginalMode = null;

  function applyPackToDOM(packId, pack, opts) {
    opts = opts || {};
    var html = document.documentElement;
    html.setAttribute('data-theme-pack', packId);

    if (pack.modes && pack.modes.length === 1) {
      // Single-mode pack — must use its only mode.
      html.setAttribute('data-theme', pack.modes[0]);
    } else if (opts.restoreMode) {
      // Multi-mode pack during revertPreview — restore user's pre-preview mode.
      if (previewOriginalMode) {
        html.setAttribute('data-theme', previewOriginalMode);
      }
    }
    // else: multi-mode, normal set — leave current data-theme alone.

    var mode = html.getAttribute('data-theme') || (pack.modes && pack.modes[0]) || 'dark';
    return mode;
  }
```

Replace `setTheme` (lines 106–123):
```js
  function setTheme(packId, options) {
    options = options || {};
    var pack = PIXELABS_THEMES[packId];
    if (!pack) { console.warn('[PixelabsThemes] Unknown pack:', packId); return Promise.resolve(); }
    return ensureFontsLoaded(pack).then(function () {
      var mode = applyPackToDOM(packId, pack);
      currentPack = packId;
      if (options.persist !== false) {
        try { localStorage.setItem(STORAGE_KEY, packId); } catch (e) {}
        committedPack = packId;
        track('theme_pack_selected', { pack_id: packId, from: options.from || 'api' });
      }
      try {
        root.dispatchEvent(new CustomEvent(EVENT_NAME, { detail: { packId: packId, mode: mode } }));
      } catch (e) {}
      syncPickerPressedState();
    });
  }
```
With:
```js
  function setTheme(packId, options) {
    options = options || {};
    var pack = PIXELABS_THEMES[packId];
    if (!pack) { console.warn('[PixelabsThemes] Unknown pack:', packId); return Promise.resolve(); }
    return ensureFontsLoaded(pack).then(function () {
      var mode = applyPackToDOM(packId, pack);
      currentPack = packId;
      // Commit means: forget any preview snapshot.
      previewOriginalMode = null;
      if (options.persist !== false) {
        try { localStorage.setItem(STORAGE_KEY, packId); } catch (e) {}
        committedPack = packId;
        try {
          localStorage.setItem('theme', document.documentElement.getAttribute('data-theme') || 'dark');
        } catch (e) {}
        track('theme_pack_selected', { pack_id: packId, from: options.from || 'api' });
      }
      try {
        root.dispatchEvent(new CustomEvent(EVENT_NAME, { detail: { packId: packId, mode: mode } }));
      } catch (e) {}
      syncPickerPressedState();
    });
  }
```

Replace `previewTheme` (lines 125–134):
```js
  function previewTheme(packId) {
    var pack = PIXELABS_THEMES[packId];
    if (!pack) return Promise.resolve();
    track('theme_pack_previewed', { pack_id: packId });
    return ensureFontsLoaded(pack).then(function () {
      applyPackToDOM(packId, pack);
      currentPack = packId;
      syncPickerPressedState();
    });
  }
```
With:
```js
  function previewTheme(packId) {
    var pack = PIXELABS_THEMES[packId];
    if (!pack) return Promise.resolve();
    // On the FIRST preview in a session, remember the user's committed mode.
    if (previewOriginalMode === null) {
      previewOriginalMode = document.documentElement.getAttribute('data-theme') || 'dark';
    }
    track('theme_pack_previewed', { pack_id: packId });
    return ensureFontsLoaded(pack).then(function () {
      applyPackToDOM(packId, pack);
      currentPack = packId;
      syncPickerPressedState();
    });
  }
```

Replace `revertPreview` (lines 136–147):
```js
  function revertPreview() {
    if (committedPack && currentPack !== committedPack) {
      var pack = PIXELABS_THEMES[committedPack];
      if (pack) {
        applyPackToDOM(committedPack, pack);
        currentPack = committedPack;
        syncPickerPressedState();
      }
    }
    pickerState.pendingPreview = null;
    hideApplyBar();
  }
```
With:
```js
  function revertPreview() {
    if (committedPack && currentPack !== committedPack) {
      var pack = PIXELABS_THEMES[committedPack];
      if (pack) {
        applyPackToDOM(committedPack, pack, { restoreMode: true });
        currentPack = committedPack;
        syncPickerPressedState();
      }
    } else if (previewOriginalMode) {
      // Same pack but mode may have drifted — restore it explicitly.
      document.documentElement.setAttribute('data-theme', previewOriginalMode);
    }
    previewOriginalMode = null;
    pickerState.pendingPreview = null;
    hideApplyBar();
  }
```

### 1b. Remove the Apply button — single-tap commits

**Root cause:** `buildPicker` (lines 174–294) adds a mobile Apply bar and uses two-tap mobile flow. User wants one-tap-commit everywhere.

Replace the click handler inside the `Object.keys(PIXELABS_THEMES).forEach` loop (lines 232–245):
```js
      // Click — desktop commits, mobile previews then commits on second tap
      btn.addEventListener('click', function () {
        if (isMobileViewport()) {
          if (pickerState.pendingPreview === packId) {
            setTheme(packId, { from: 'picker' }).then(closePicker);
          } else {
            pickerState.pendingPreview = packId;
            previewTheme(packId);
            showApplyBar();
          }
        } else {
          setTheme(packId, { from: 'picker' }).then(closePicker);
        }
      });
```
With:
```js
      // Click — single tap always commits + closes picker.
      btn.addEventListener('click', function () {
        setTheme(packId, { from: 'picker' }).then(function () { closePicker(false); });
      });
```

And remove the Apply bar construction block (lines 269–283):
```js
    // Mobile sticky apply bar
    var applyBar = document.createElement('div');
    applyBar.className = 'pxl-theme-applybar';
    applyBar.hidden = true;
    var applyBtn = document.createElement('button');
    applyBtn.type = 'button';
    applyBtn.className = 'pxl-theme-applybar__btn';
    applyBtn.textContent = 'Apply theme';
    applyBtn.addEventListener('click', function () {
      if (pickerState.pendingPreview) {
        setTheme(pickerState.pendingPreview, { from: 'picker-mobile' }).then(closePicker);
      }
    });
    applyBar.appendChild(applyBtn);
    containerEl.appendChild(applyBar);
```
Replace with nothing (delete the whole block).

`hideApplyBar`/`showApplyBar` become no-ops but can stay — harmless. Optionally delete them.

Also remove the CSS for `.pxl-theme-applybar` in index.html inline `<style>` (lines 403–409):
```css
    .pxl-theme-applybar { display: flex; justify-content: flex-end; margin-top: 10px; }
    .pxl-theme-applybar__btn {
      padding: 7px 14px; border-radius: var(--radius-sm);
      border: 1px solid var(--accent); background: rgba(var(--accent-rgb),0.12);
      color: var(--accent); font-weight: 600; font-size: .78rem; cursor: pointer;
    }
    .pxl-theme-applybar__btn:hover { background: rgba(var(--accent-rgb),0.2); }
```
Delete these 7 lines.

### 1c. Desert-light background is navy blue, not sand

**Root cause:** The inline `<style>` in `index.html` (lines 105–235) contains a **massive** `:root[data-theme="light"] { ... }` block that hardcodes navy blue values for `--bg`, `--bg2`, `--accent`, `--accent2`, `--text`, etc., AND sets hardcoded `rgba(14,165,233,…)` / `#e8eef7` / `#dde8f5` gradients on `body::before`, `.site-header`, `.hero::before`, `.hero-grid .card`, `.verdict-hero`, and `.sdotyam-grid .wind-img-card`.

Because this inline block is unscoped (`:root[data-theme="light"]`), it **applies to every pack that happens to be in light mode** — including `desert-ethnic` and `hud-light` and `cyber-arcade-light`. The pack CSS bridges `--bg: var(--pl-bg)` correctly, but:

1. The inline `:root[data-theme="light"]` rule has the same `(0,1,0)` specificity as `:root[data-theme-pack="desert-ethnic"]`. In theory the later source wins — and since the linked theme stylesheet loads after the inline `<style>`, the pack should win for `--bg`, `--accent`, etc.
2. **But** the inline block ALSO sets hardcoded gradient backgrounds on `body::before`, `.hero::before`, `.hero-grid .card`, `.verdict-hero`, `.sdotyam-grid .wind-img-card` with literal hex colors `#e8eef7`, `#dde8f5`, `rgba(14,165,233,…)`, `rgba(124,58,237,…)`. These are NOT variables — they cannot be overridden by setting `--bg`. They paint navy regardless of the pack tokens. That is what you see: the body mesh, the hero mesh, the card frost, the verdict backdrop, and the sdot fills are all hardcoded navy and win because no pack rule targets them.

**Fix:** Scope the entire inline light block to `hud` only so it never paints over desert or cyber-arcade.

Find the comment + block starting around line 104–235:
```css
    /* ===== LIGHT MODE — premium navy glass ===== */
    :root[data-theme="light"] {
```
and every subsequent `:root[data-theme="light"] ...` selector down to (but NOT including) the `/* ===== HEADER ACTIONS ===== */` comment at line 237.

**Replace every bare `:root[data-theme="light"]` with `:root[data-theme-pack="hud"][data-theme="light"]`** in that entire block (lines 104–235 inclusive).

Specifically, these selectors must all be prefixed with `[data-theme-pack="hud"]`:
- Line 105: `:root[data-theme="light"] {`
- Line 127: `:root[data-theme="light"] body { ... }`
- Line 128: `:root[data-theme="light"] body::before { ... }`
- Line 137: `:root[data-theme="light"] .site-header { ... }`
- Line 142: `:root[data-theme="light"] .site-header::after { ... }`
- Line 147: `:root[data-theme="light"] .brand-icon { ... }`
- Line 152: `:root[data-theme="light"] .hero::before { ... }`
- Line 160: `:root[data-theme="light"] .hero-grid .card { ... }`
- Line 173: `:root[data-theme="light"] .hero-grid .card::before { ... }`
- Line 178: `:root[data-theme="light"] .hero-grid .card::after { ... }`
- Line 184: `:root[data-theme="light"] .hero-grid .card:hover { ... }`
- Line 191: `:root[data-theme="light"] .hero-grid .card .card-value { ... }`
- Line 195: `:root[data-theme="light"] .hero-grid .card .card-label { ... }`
- Line 201: `:root[data-theme="light"] .hero-grid .card .card-detail { ... }`
- Lines 204–216: `:root[data-theme="light"] .verdict-hero, :root[data-theme="light"] .kite-status { ... }` and `.verdict-tag`
- Line 220: `:root[data-theme="light"] .wind-dir-arrow { ... }`
- Line 225: `:root[data-theme="light"] .wind-dir-arrow svg { ... }`
- Lines 229–235: `:root[data-theme="light"] .sdotyam-grid .wind-img-card` etc.

**Mechanical rewrite rule:** use Edit with `replace_all: false` one occurrence at a time, or use a two-step Edit per selector:
- `old_string: :root[data-theme="light"]`
- `new_string: :root[data-theme-pack="hud"][data-theme="light"]`

Since there are many identical occurrences, do it per-line using enough surrounding context to make each `old_string` unique. Example for line 105:
- `old_string`:
  ```
      /* ===== LIGHT MODE — premium navy glass ===== */
      :root[data-theme="light"] {
        color-scheme: light;
  ```
- `new_string`:
  ```
      /* ===== LIGHT MODE — premium navy glass (HUD pack only) ===== */
      :root[data-theme-pack="hud"][data-theme="light"] {
        color-scheme: light;
  ```

Repeat the substitution for every selector in the block (lines 127–235). Also update the two `.header-lastupdate` light selectors at lines 268 and 273 similarly so they don't clobber desert-ethnic header styles — but those only touch border/background and look fine on sand, so this is optional.

Do NOT touch the `.header-lastupdate` light tweaks at lines 268–275 nor the `.pixelabs-link` light tweak at line 317 nor the `.pxl-theme-picker` light tweaks at lines 355–358 — those use variable colors and are fine.

### Also verify the pack stylesheet desert-ethnic palette is warm sand

Confirmed: `pixelabs-themes.css` lines 417–492. Desert-ethnic base sets:
- `--pl-bg: #f3e9d2` (sand)
- `--pl-bg-alt: #ead9b6`
- `--pl-text: #3d2817`
- `--pl-accent: #c77d4e` (terracotta)
- `--pl-accent-2: #7a9a7a` (sage)
- Full legacy bridge to `--bg`, `--accent`, etc.

**No change needed** to the pack CSS. The pack was correct all along — it was the inline `:root[data-theme="light"]` block that was hijacking it.

Optionally, you can also delete lines 168 (`:root[data-theme-pack="hud"][data-theme="light"],`) and 169 (`:root[data-theme="light"] {`) in `pixelabs-themes.css` and replace with a single clean `:root[data-theme-pack="hud"][data-theme="light"] {` to avoid the same cross-pack bleed at the pack-CSS level. Find lines 167–169:
```css
/* ---- hud LIGHT (CT spec: "very light navy") ---------------------------- */
:root[data-theme-pack="hud"][data-theme="light"],
:root[data-theme="light"] {
```
Replace with:
```css
/* ---- hud LIGHT (CT spec: "very light navy") ---------------------------- */
:root[data-theme-pack="hud"][data-theme="light"] {
```

---

## Item 7 — Verdict hero clean rewrite (callouts horizontal, compass right, slow pulse)

This item absorbs **Items 4** (horizontal callouts) and **Item 10** (compass readout placement + slower animation).

### Delete the current layout block

Find the block at lines 1454–1617 (`/* ===== VERDICT HERO LAYOUT (callouts | compass) ===== */` down to the close brace before `@keyframes pulse`).

Delete the entire block (lines 1454–1617) and replace with:

```css
    /* ===== VERDICT HERO LAYOUT — left text | middle callouts | divider | right compass ===== */
    .verdict-hero {
      display: flex;
      align-items: stretch;
      gap: 18px;
      position: relative;
      padding: 22px 26px;
    }

    .verdict-left {
      flex: 1 1 auto;
      min-width: 0;
      display: flex;
      flex-direction: column;
      justify-content: center;
      gap: 6px;
    }

    .verdict-middle {
      flex: 0 0 auto;
      align-self: center;
      display: flex;
      flex-direction: row;
      gap: 10px;
      flex-wrap: nowrap;
    }
    .verdict-middle > * {
      flex: 0 0 auto;
      max-width: 140px;
      min-width: 108px;
    }

    .verdict-divider {
      flex: 0 0 1px;
      align-self: stretch;
      background: linear-gradient(180deg,
        transparent 0%,
        rgba(255,255,255,0.14) 20%,
        rgba(255,255,255,0.14) 80%,
        transparent 100%);
    }
    :root[data-theme-pack="hud"][data-theme="light"] .verdict-divider {
      background: linear-gradient(180deg,
        transparent 0%,
        rgba(14,50,120,0.18) 20%,
        rgba(14,50,120,0.18) 80%,
        transparent 100%);
    }

    .verdict-right {
      flex: 0 0 auto;
      display: flex;
      flex-direction: column;
      align-items: flex-end;
      justify-content: center;
      gap: 6px;
    }

    .verdict-compass {
      width: 120px; height: 120px;
      position: relative;
      isolation: isolate;
    }
    .verdict-compass svg { width: 100%; height: 100%; display: block; }

    .compass-readout {
      font-family: var(--font-mono);
      color: var(--muted);
      text-align: right;
      line-height: 1.15;
    }
    .compass-readout .card-value {
      font-size: .84rem !important;
      font-weight: 700;
      color: var(--text);
      font-family: var(--font-mono);
      letter-spacing: .06em;
    }
    .compass-readout .card-detail {
      font-size: .66rem;
      color: var(--muted);
      margin-top: 1px;
    }

    /* Callout sizing — compact for horizontal row */
    .suit-callout,
    .kite-callout,
    .waves-callout {
      display: inline-flex; align-items: center; gap: 8px;
      padding: 7px 10px; border-radius: 11px;
      flex-shrink: 0;
    }
    .suit-callout .suit-text,
    .kite-callout .suit-text,
    .waves-callout .suit-text {
      display: flex; flex-direction: column; line-height: 1.15; min-width: 0;
    }
    .suit-callout .suit-label,
    .kite-callout .suit-label,
    .waves-callout .suit-label {
      font-family: var(--mono); font-size: .56rem; font-weight: 700;
      text-transform: uppercase; letter-spacing: .11em; color: var(--muted);
    }
    .suit-callout .suit-value,
    .kite-callout .suit-value,
    .waves-callout .suit-value {
      font-size: .80rem; font-weight: 700; color: var(--text); margin-top: 1px;
      white-space: nowrap; overflow: hidden; text-overflow: ellipsis;
    }

    .suit-callout {
      background: linear-gradient(135deg, rgba(113,224,255,0.14), rgba(113,224,255,0.06));
      border: 1px solid rgba(113,224,255,0.34);
      box-shadow: 0 0 22px -10px rgba(113,224,255,0.4);
    }
    .suit-callout .suit-icon { color: var(--accent); filter: drop-shadow(0 0 6px rgba(113,224,255,0.55)); flex-shrink: 0; }
    .kite-callout {
      background: linear-gradient(135deg, rgba(255,107,53,0.16), rgba(255,107,53,0.06));
      border: 1px solid rgba(255,107,53,0.42);
      box-shadow: 0 0 22px -10px rgba(255,107,53,0.5);
    }
    .kite-callout svg { color: #ff6b35; filter: drop-shadow(0 0 6px rgba(255,107,53,0.6)); flex-shrink: 0; }
    .waves-callout {
      background: linear-gradient(135deg, rgba(167,139,250,0.14), rgba(109,74,199,0.08));
      border: 1px solid rgba(167,139,250,0.38);
      box-shadow: 0 0 22px -10px rgba(167,139,250,0.4);
    }
    .waves-callout svg { color: #a78bfa; filter: drop-shadow(0 0 6px rgba(167,139,250,0.55)); flex-shrink: 0; }

    :root[data-theme-pack="hud"][data-theme="light"] .suit-callout {
      background: linear-gradient(135deg, rgba(14,165,233,0.14), rgba(14,165,233,0.04));
      border-color: rgba(14,165,233,0.42);
    }
    :root[data-theme-pack="hud"][data-theme="light"] .suit-callout .suit-icon { color: #0b6fa3; filter: drop-shadow(0 0 6px rgba(14,165,233,0.5)); }
    :root[data-theme-pack="hud"][data-theme="light"] .kite-callout {
      background: linear-gradient(135deg, rgba(255,107,53,0.18), rgba(255,107,53,0.05));
      border-color: rgba(255,107,53,0.5);
    }
    :root[data-theme-pack="hud"][data-theme="light"] .waves-callout {
      background: linear-gradient(135deg, rgba(124,58,237,0.14), rgba(124,58,237,0.04));
      border-color: rgba(124,58,237,0.42);
    }
    :root[data-theme-pack="hud"][data-theme="light"] .waves-callout svg { color: #6d4ac7; filter: drop-shadow(0 0 6px rgba(124,58,237,0.5)); }

    /* Refresh confirmation flash — compass */
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

    /* Mobile */
    @media (max-width: 960px) {
      .verdict-compass { width: 100px; height: 100px; }
      .verdict-middle > * { max-width: 130px; min-width: 100px; }
    }

    @media (max-width: 720px) {
      .verdict-hero {
        flex-direction: column;
        align-items: stretch;
        gap: 14px;
        padding: 18px 18px;
      }
      .verdict-divider { display: none; }
      .verdict-middle {
        align-self: stretch;
        justify-content: space-between;
        flex-wrap: wrap;
        gap: 8px;
      }
      .verdict-middle > * {
        flex: 1 1 calc(33.333% - 8px);
        max-width: none; min-width: 0;
      }
      .verdict-right {
        align-items: center;
        flex-direction: row;
        justify-content: center;
        gap: 14px;
      }
      .compass-readout { text-align: left; }
      .verdict-compass { width: 96px; height: 96px; }
    }

    @media (max-width: 480px) {
      .verdict-compass { width: 84px; height: 84px; }
      .verdict-middle { gap: 6px; }
      .verdict-middle > * { flex: 1 1 calc(50% - 6px); }
    }
```

### Rewrite the markup (lines 1841–1933)

Find the block:
```html
        <div class="kite-status verdict-hero" id="kiteStatus" role="status" aria-live="polite">
          <div class="status-indicator maybe" id="statusDot">
            ...
          </div>
          <div class="status-text" style="flex:1;min-width:0;display:flex;flex-direction:column;">
            ...
          </div>
          <div class="verdict-right">
            <div class="verdict-callouts">
              ... 3 callouts ...
            </div>
            <div class="verdict-compass-wrap">
              ... compass svg + readout ...
            </div>
          </div>
        </div>
```

Replace with this structure (keeping all inner SVG paths and IDs intact — copy from current lines 1841–1933 for the svg bodies):

```html
        <div class="kite-status verdict-hero" id="kiteStatus" role="status" aria-live="polite">
          <div class="verdict-left">
            <div style="display:flex;align-items:center;gap:14px;">
              <div class="status-indicator maybe" id="statusDot">
                <svg width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5"><path d="M12 2v4M12 18v4M4.93 4.93l2.83 2.83M16.24 16.24l2.83 2.83M2 12h4M18 12h4M4.93 19.07l2.83-2.83M16.24 7.76l2.83-2.83"/></svg>
              </div>
              <div class="status-text" style="flex:1;min-width:0;display:flex;flex-direction:column;">
                <div class="verdict-headline">
                  <span class="verdict-tag" id="verdictTag">--</span>
                  <strong id="statusLabel">Checking conditions&hellip;</strong>
                </div>
                <div class="verdict-desc-row">
                  <span id="statusDesc">Fetching live wind and wave data</span>
                </div>
              </div>
            </div>
          </div>

          <div class="verdict-middle">
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

          <div class="verdict-divider" aria-hidden="true"></div>

          <div class="verdict-right">
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
                <circle class="gust-ring" cx="60" cy="60" r="48" fill="none" stroke="currentColor" stroke-width="1.5" opacity=".55"/>
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
              <div class="card-value" id="windDir">--</div>
              <div class="card-detail" id="windDirDeg">--</div>
            </div>
          </div>
        </div>
```

Note: the `status-indicator` + `status-text` are now wrapped inside `.verdict-left` in a small inline flex row; the old `.kite-status { display: flex; align-items: center; gap: 16px; }` rule still applies to the outer `.verdict-hero.kite-status`, which now positions `.verdict-left | .verdict-middle | .verdict-divider | .verdict-right` as 4 flex children.

### Item 10 — Slow the gust pulse

Find lines 1165–1166:
```css
    .gust-ring { transform-origin: 60px 60px; animation: gust-pulse 2.4s ease-in-out infinite; }
    @keyframes gust-pulse { 0%,100% { transform: scale(1); opacity: .5; } 50% { transform: scale(1.06); opacity: .9; } }
```
Replace with:
```css
    .gust-ring { transform-origin: 60px 60px; animation: gust-pulse 5s ease-in-out infinite; }
    @keyframes gust-pulse {
      0%, 100% { transform: scale(1);    opacity: .55; }
      50%      { transform: scale(1.02); opacity: .68; }
    }
```

Also find line 1326:
```css
      animation: gust-ping 0.9s cubic-bezier(.2,.8,.2,1) 1, gust-pulse 2.4s ease-in-out infinite 0.9s;
```
Replace with:
```css
      animation: gust-ping 0.9s cubic-bezier(.2,.8,.2,1) 1, gust-pulse 5s ease-in-out infinite 0.9s;
```

Also the needle/arrow float at lines 731–737 (`animation: arrow-float 4s ease-in-out infinite`) is a separate subtle bob — leave alone, it's fine.

---

## Item 6 — Surfboard menu icon + alignment

### Root cause of "still hamburger"
The current chevSVG (index.html lines 3018–3024):
```js
      const chevSVG = '<svg class="chev menu-icon" ...>'
        + '<path d="M3.2 9.2 Q12 7.4 20.8 9.2 Q12 10.8 3.2 9.2 Z"/>'
        + '<path d="M3.2 15.2 Q12 13.4 20.8 15.2 Q12 16.8 3.2 15.2 Z"/>'
        + '</svg>'
        + '<svg class="chev close-icon" ...><path d="M5 5 L19 19"/><path d="M19 5 L5 19"/></svg>';
```
Those two lenticular paths ARE surfboard-shaped but at 22px with the tapered Q-curves they read as **two horizontal lines**, i.e. a hamburger. The v3 pass shipped the code but the shape is unreadable at icon size.

### Root cause of "still centered"
The CSS (lines 1686–1708) uses `justify-content: space-between` with the icon `position: absolute; right: 14px`, meaning the text label expands to fill and the label visually centers within the remaining width. But the USER's complaint is that they want the **whole button** aligned right of the section title row, not full-width. The current implementation makes the button span the full container width.

Looking at the design intent: the surfboard icon is the "collapse/expand" affordance for mobile accordions (≤560px). The user wants it to appear as a **small 44×44 button tucked to the right edge** of the section header, not a full-width bar.

### Fix — more recognizable surfboard icon

Replace lines 3018–3024:
```js
      const chevSVG = '<svg class="chev menu-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.7" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true">'
        + '<path d="M3.2 9.2 Q12 7.4 20.8 9.2 Q12 10.8 3.2 9.2 Z"/>'
        + '<path d="M3.2 15.2 Q12 13.4 20.8 15.2 Q12 16.8 3.2 15.2 Z"/>'
        + '</svg>'
        + '<svg class="chev close-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.9" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true">'
        + '<path d="M5 5 L19 19"/><path d="M19 5 L5 19"/>'
        + '</svg>';
```
With:
```js
      // Two stacked surfboards — pointed nose, rounded tail, center stringer + fin
      const chevSVG = '<svg class="chev menu-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.6" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true">'
        // Top board: rotated ~15deg via explicit path (nose upper-left, tail lower-right)
        + '<path d="M4.5 6.2 L15 4.2 Q20 4 20.4 6.4 Q20.2 8.4 15.2 8.6 L5.2 8.2 Q3.8 8 4.5 6.2 Z" fill="none"/>'
        // Top board stringer (center line)
        + '<path d="M6.5 6.6 L18.5 5.8" stroke-width="0.9" opacity="0.6"/>'
        // Top board fin (small triangle on underside near tail)
        + '<path d="M17.2 8.4 L18.2 10 L18.8 8.5" stroke-width="1.1"/>'
        // Bottom board: mirrored, nose lower-right
        + '<path d="M19.5 17.8 L9 19.8 Q4 20 3.6 17.6 Q3.8 15.6 8.8 15.4 L18.8 15.8 Q20.2 16 19.5 17.8 Z" fill="none"/>'
        // Bottom board stringer
        + '<path d="M17.5 17.4 L5.5 18.2" stroke-width="0.9" opacity="0.6"/>'
        // Bottom board fin
        + '<path d="M6.8 15.6 L5.8 14 L5.2 15.5" stroke-width="1.1"/>'
        + '</svg>'
        + '<svg class="chev close-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.9" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true">'
        + '<path d="M5 5 L19 19"/><path d="M19 5 L5 19"/>'
        + '</svg>';
```

This gives clearly curved, tapered shapes with explicit fin triangles and center stringer lines — unmistakably surfboards even at 20px.

### Fix — alignment (button pushed to right, compact)

Replace the mobile accordion CSS block at lines 1686–1708:
```css
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
      .has-mobile-accordion .section-collapse:focus-visible {
        outline: 2px solid var(--accent); outline-offset: 2px;
      }
      .has-mobile-accordion .section-collapse { position: relative; padding-right: 46px; }
      .has-mobile-accordion .section-collapse .chev {
        width: 22px; height: 22px;
        flex-shrink: 0;
        transition: opacity .28s ease, transform .35s ease;
        position: absolute; right: 14px; top: 50%;
        transform-origin: center;
      }
```
With:
```css
      .has-mobile-accordion .section-collapse {
        display: flex; width: 100%;
        align-items: center;
        justify-content: space-between;
        gap: 12px;
        padding: 12px 10px 12px 16px;
        margin: 0 0 6px;
        background: linear-gradient(135deg, rgba(113,224,255,0.06), rgba(167,139,250,0.04));
        border: 1px solid var(--border); border-radius: var(--radius-sm);
        font-family: var(--mono); font-size: .82rem; font-weight: 700;
        color: var(--text); text-transform: uppercase; letter-spacing: .08em;
        cursor: pointer;
        transition: background .25s ease, border-color .25s ease;
        position: relative;
      }
      .has-mobile-accordion .section-collapse > span:first-child {
        flex: 1 1 auto;
        text-align: left;
      }
      .has-mobile-accordion .section-collapse:hover { border-color: var(--accent); }
      .has-mobile-accordion .section-collapse:focus-visible {
        outline: 2px solid var(--accent); outline-offset: 2px;
      }
      .has-mobile-accordion .section-collapse .chev {
        width: 24px; height: 24px;
        flex: 0 0 44px;
        min-width: 44px; min-height: 44px;
        padding: 10px;
        margin-left: auto;
        transition: opacity .28s ease, transform .35s ease;
        transform-origin: center;
        display: inline-block;
        box-sizing: border-box;
      }
```

And replace the menu/close swap rules at lines 1709–1720:
```css
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
```
With (no more `translateY(-50%)` since chev is now inline, not absolute):
```css
      .has-mobile-accordion .section-collapse .menu-icon {
        opacity: 1; transform: scale(1);
        position: absolute; right: 10px; top: 50%; margin-top: -22px;
      }
      .has-mobile-accordion .section-collapse .close-icon {
        opacity: 0; transform: scale(.6) rotate(-45deg);
        position: absolute; right: 10px; top: 50%; margin-top: -22px;
      }
      .has-mobile-accordion[data-collapsed="false"] .section-collapse .menu-icon {
        opacity: 0; transform: scale(.6) rotate(45deg);
      }
      .has-mobile-accordion[data-collapsed="false"] .section-collapse .close-icon {
        opacity: 1; transform: scale(1) rotate(0deg);
      }
```

(The surfboard icon overlays live at right:10px absolute inside the relatively-positioned button. The 44×44 touch target is preserved by the outer `.chev` placeholder's min-width; the visual SVG is the inner 24×24.)

---

## Item 9 — Windsock + wind-analysis icons

### Windsock — fatter, rectangular, 3 segments, last drooping

The current windsock lives at the `.section-title svg` for the Wind section. Find the current wind-section SVG (grep for `wind` section-title icon). Looking at lines 1828–1835 that's the "Current Conditions" flag icon. The actual Wind section icon is further down. **Regardless**, use this verbatim SVG as the new windsock and drop it wherever the old windsock markup lives:

```html
<svg viewBox="0 0 24 24" width="24" height="24" fill="none" stroke="currentColor" stroke-width="1.6" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true">
  <!-- pole -->
  <line x1="4" y1="3" x2="4" y2="21"/>
  <!-- top ring attaching sock to pole -->
  <ellipse cx="5.4" cy="6" rx="1.4" ry="0.9" opacity="0.7"/>
  <!-- Segment 1 — fat, full (puffed by wind) -->
  <path d="M6.8 5 L15 5 Q16.2 5 16.2 5.6 L16.2 8.4 Q16.2 9 15 9 L6.8 9 Z" fill="currentColor" fill-opacity="0.18"/>
  <line x1="6.8" y1="5" x2="16.2" y2="5"/>
  <line x1="6.8" y1="9" x2="16.2" y2="9"/>
  <line x1="15.2" y1="5" x2="15.2" y2="9" opacity="0.5"/>
  <!-- Segment 2 — fat, full -->
  <path d="M6.8 9.4 L14.4 9.4 Q15.4 9.4 15.4 10 L15.4 12.6 Q15.4 13.2 14.4 13.2 L6.8 13.2 Z" fill="currentColor" fill-opacity="0.14"/>
  <line x1="6.8" y1="9.4" x2="15.4" y2="9.4"/>
  <line x1="6.8" y1="13.2" x2="15.4" y2="13.2"/>
  <line x1="14.4" y1="9.4" x2="14.4" y2="13.2" opacity="0.5"/>
  <!-- Segment 3 — thinner, shorter, drooping downward -->
  <path d="M6.8 13.6 L12.6 13.8 Q13.4 14.4 13.2 15.6 Q12.8 17 12 17.4 L6.8 16.4 Z" fill="currentColor" fill-opacity="0.10"/>
  <line x1="6.8" y1="13.6" x2="13.2" y2="15.6" opacity="0.85"/>
  <line x1="6.8" y1="16.4" x2="12" y2="17.4" opacity="0.85"/>
</svg>
```

### Wind Analysis icon — anemometer (3 cups on spindle)

Replace the existing Wind Analysis section's radar/radial icon with:

```html
<svg viewBox="0 0 24 24" width="24" height="24" fill="none" stroke="currentColor" stroke-width="1.6" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true">
  <!-- central pole -->
  <line x1="12" y1="13" x2="12" y2="22"/>
  <!-- hub -->
  <circle cx="12" cy="12" r="1.2" fill="currentColor"/>
  <!-- three spokes at 90deg (top), 210deg (lower-left), 330deg (lower-right) -->
  <line x1="12" y1="12" x2="12" y2="4"/>
  <line x1="12" y1="12" x2="5" y2="16"/>
  <line x1="12" y1="12" x2="19" y2="16"/>
  <!-- cup 1 (top): C-shape opening right -->
  <path d="M10.2 4 Q9.6 2.2 12 2 Q14.4 2.2 13.8 4 Q13.2 5.2 12 5 Q10.8 5.2 10.2 4 Z"/>
  <!-- cup 2 (lower-left): C-shape opening up -->
  <path d="M3.4 14.6 Q1.8 15.4 2 17.6 Q3 18.6 4.8 17.8 Q5.8 17 5.4 15.8 Q5 14.6 3.4 14.6 Z"/>
  <!-- cup 3 (lower-right): C-shape opening up -->
  <path d="M20.6 14.6 Q22.2 15.4 22 17.6 Q21 18.6 19.2 17.8 Q18.2 17 18.6 15.8 Q19 14.6 20.6 14.6 Z"/>
  <!-- motion arc (subtle spin hint) -->
  <path d="M6 7 Q8 5.4 11 5" opacity="0.4" stroke-dasharray="1 1.4"/>
</svg>
```

Grep for the current Wind Analysis section title SVG in `index.html` and replace its inner paths with the above. The outer `<svg>` wrapper attributes can stay; swap the `<path>`/`<circle>`/`<line>` children.

---

## Item 11 — Conditions grid density

Find the responsive cascade blocks that set `.hero-grid`. Current declarations are spread across lines 572–577, 1628–1631, 1637, 1645–1647, 1661–1662.

### At lines 572–577 (base), replace:
```css
    .hero-grid {
      display: grid;
      grid-template-columns: repeat(auto-fill, minmax(210px, 1fr));
      gap: 16px;
      grid-auto-flow: row dense;
    }
```
With:
```css
    .hero-grid {
      display: grid;
      grid-template-columns: repeat(auto-fill, minmax(180px, 1fr));
      gap: 12px;
      grid-auto-flow: row dense;
      align-items: stretch;
    }
```

### At lines 578–596 (.hero-grid .card), replace the `padding: 18px 20px 20px;` line with:
```css
      padding: 14px 16px 16px;
```

### At lines 626–647, replace the label/value/detail sizes:
```css
    .hero-grid .card .card-label {
      font-size: .78rem;
      font-weight: 700;
      font-family: var(--mono);
      text-transform: uppercase;
      letter-spacing: .18em;
      color: rgba(255,255,255,0.82);
      margin-bottom: 14px;
      text-shadow: 0 0 8px rgba(var(--accent-rgb),0.25);
    }
    .hero-grid .card .card-value {
      font-size: 2.1rem; font-weight: 800; font-family: var(--mono);
      line-height: 1.1; color: #ffffff;
      text-shadow: 0 0 16px rgba(var(--accent-rgb),0.25);
    }
    .hero-grid .card .card-unit {
      font-size: .82rem; font-weight: 500; color: var(--muted); margin-left: 4px;
    }
    .hero-grid .card .card-detail {
      font-size: .76rem; color: var(--subtle); margin-top: 6px;
      font-family: var(--mono); letter-spacing: .03em;
    }
```
With:
```css
    .hero-grid .card .card-label {
      font-size: .68rem;
      font-weight: 700;
      font-family: var(--mono);
      text-transform: uppercase;
      letter-spacing: .16em;
      color: rgba(255,255,255,0.82);
      margin-bottom: 10px;
      text-shadow: 0 0 8px rgba(var(--accent-rgb),0.25);
    }
    .hero-grid .card .card-value {
      font-size: 1.7rem; font-weight: 800; font-family: var(--mono);
      line-height: 1.1; color: #ffffff;
      text-shadow: 0 0 16px rgba(var(--accent-rgb),0.25);
    }
    .hero-grid .card .card-unit {
      font-size: .74rem; font-weight: 500; color: var(--muted); margin-left: 3px;
    }
    .hero-grid .card .card-detail {
      font-size: .72rem; color: var(--subtle); margin-top: 4px;
      font-family: var(--mono); letter-spacing: .03em;
    }
```

### At line 1630 (`@media (max-width: 1280px)`), replace:
```css
      .hero-grid { grid-template-columns: repeat(auto-fill, minmax(200px, 1fr)); gap: 14px; }
```
With:
```css
      .hero-grid { grid-template-columns: repeat(auto-fill, minmax(170px, 1fr)); gap: 10px; }
```

### At line 1637 (`@media (max-width: 1024px)`), replace:
```css
      .hero-grid { grid-template-columns: repeat(3, 1fr); gap: 12px; }
```
With:
```css
      .hero-grid { grid-template-columns: repeat(4, 1fr); gap: 10px; }
```

### At lines 1645–1647 (`@media (max-width: 720px)`), replace:
```css
      .hero-grid { grid-template-columns: repeat(2, 1fr); gap: 10px; }
      .hero-grid .card { padding: 14px 16px 16px; }
      .hero-grid .card .card-value { font-size: 1.6rem; }
```
With:
```css
      .hero-grid { grid-template-columns: repeat(2, 1fr); gap: 8px; }
      .hero-grid .card { padding: 12px 14px 14px; }
      .hero-grid .card .card-value { font-size: 1.4rem; }
      .hero-grid .card .card-label { font-size: .60rem; margin-bottom: 8px; letter-spacing: .14em; }
      .hero-grid .card .card-detail { font-size: .66rem; }
```

### At lines 1661–1662 (`@media (max-width: 480px)`), replace:
```css
      .hero-grid { grid-template-columns: 1fr; }
      .hero-grid .card .card-value { font-size: 1.8rem; }
```
With:
```css
      .hero-grid { grid-template-columns: repeat(2, 1fr); gap: 8px; }
      .hero-grid .card .card-value { font-size: 1.35rem; }
      .hero-grid .card { padding: 10px 12px 12px; }
```

### Shrink the per-card vizzes

Grep `index.html` for each of: `thermometer`, `cloud-viz`, `sea-viz`, `rain-viz`, `uv-viz`, and the wave card SVG. Reduce each to these sizes — add these overrides at the end of the hero-grid CSS section (around line 647, before `.kite-status`):

```css
    .hero-grid .card svg.thermometer-viz,
    .hero-grid .card .thermometer-viz { width: 22px; height: auto; }
    .hero-grid .card .cloud-viz { width: 70px; height: 44px; }
    .hero-grid .card .sea-viz   { width: 60px; height: 60px; }
    .hero-grid .card .rain-viz  { width: 70px; height: 70px; }
    .hero-grid .card .uv-viz    { width: 68px; height: 68px; }
    .hero-grid .card .wave-viz,
    .hero-grid .card svg.wave-viz { height: 44px; width: auto; }
    /* Consistently pin vizzes to bottom-right */
    .hero-grid .card { position: relative; }
    .hero-grid .card .cloud-viz,
    .hero-grid .card .sea-viz,
    .hero-grid .card .rain-viz,
    .hero-grid .card .uv-viz,
    .hero-grid .card .wave-viz {
      position: absolute;
      right: 12px;
      bottom: 12px;
      pointer-events: none;
      opacity: 0.92;
    }
```

Note: if the actual class names differ (e.g. `.hud-cloud`, `.hud-sea`, etc.) grep for the real selectors and substitute. The intent: every in-card viz pinned bottom-right, same visual anchor across all cards, at the shrunk sizes above.

---

## Apply order recap

1. **Item 8** — `html { background }` + header opacity bump (safest, 2 small edits)
2. **Item 5** — Pixelabs inline SVG + new CSS block (isolated, no layout risk)
3. **Item 3** — Header lastupdate visibility tweak + JS text trim
4. **Item 1** — Theme JS (preview mode preservation, remove Apply button) + CSS scoping of `:root[data-theme="light"]` to hud-only
5. **Item 7** — Verdict hero nuke-and-rebuild (absorbs Items 4 and 10)
6. **Item 6** — Surfboard icon SVG + alignment CSS
7. **Item 9** — Windsock + anemometer icon swaps
8. **Item 11** — Conditions grid density

Items 12–15 intentionally out of scope per task brief.

---

## Verification checklist after applying

- [ ] No dark band above header in any pack × mode, including iOS overscroll
- [ ] Pixelabs icon is a clean silhouette P with pixel dot, hover turns accent + glows
- [ ] `#lastUpdate` pill is visible and legible on hud dark, hud light, cyber-arcade, desert-ethnic
- [ ] Clicking desert-ethnic from hud-dark: bg turns sand immediately, no navy flash, picker closes on single tap
- [ ] Hovering cyber-arcade from hud-dark then mouseleave: returns to hud-dark (not hud-light)
- [ ] No Apply button anywhere in picker
- [ ] Verdict hero: `left text | 3 horizontal callouts | vertical divider | compass stacked above WSW readout` on desktop
- [ ] Verdict hero mobile: stacks vertically, callouts wrap to 3-across, compass centered with readout next to it
- [ ] Gust-ring pulse is barely noticeable (5s period, 2% scale)
- [ ] Surfboard icon visibly looks like two stacked boards with fins, pinned to the right edge of the section bar, 44×44 touch area
- [ ] Windsock icon in wind section shows 3 segments, last drooping
- [ ] Wind-analysis icon is a 3-cup anemometer, not a radar
- [ ] Conditions grid fits 4 cards per row at 1024px, 5+ at desktop, 2 at mobile; smaller values and labels
