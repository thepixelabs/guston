# Pixelabs i18n

Portable, vanilla, no-build i18n engine. Sister package to `pixelabs-themes.js`.

## Files

- `pixelabs-i18n.js` — engine, attaches to `window.PixelabsI18n`
- `strings.js` — translation table, attaches to `window.PIXELABS_I18N_STRINGS`
- `README.md` — this file

## Loading

```html
<!-- 1. FOUC guard, before any CSS that depends on [dir] or [lang] -->
<script>
  (function () {
    var l = localStorage.getItem('pixelabsLang') || 'en';
    var m = { en: 'ltr', he: 'rtl', es: 'ltr' };
    var r = document.documentElement;
    r.setAttribute('lang', l);
    r.setAttribute('dir', m[l] || 'ltr');
  })();
</script>

<!-- 2. Strings (must come before engine) -->
<script src="/assets/i18n/strings.js"></script>
<script src="/assets/i18n/pixelabs-i18n.js"></script>

<!-- 3. Init when DOM is ready -->
<script>
  PixelabsI18n.init({
    defaultLang: 'en',
    container:   '#lang-picker' // optional; auto-builds the dropdown
  });
</script>
```

## Marking up text

```html
<h2 data-i18n="section.conditions">Current Conditions</h2>
<input data-i18n-attr="placeholder:search.placeholder,aria-label:search.placeholder">
<button data-i18n-attr="title:button.refresh" data-i18n="button.refresh">Refresh</button>
<span data-i18n-html="footer.updated">Updated …</span>
```

Always include the English text inside the element. The engine remembers
it and falls back to it if both the active language AND English are
missing the key.

## Adding a new string

1. Open `strings.js`.
2. Add `'your.key': 'English text'` to **all three locales** (`en`, `he`, `es`).
3. Tag your HTML element with `data-i18n="your.key"`.
4. No build step. Just refresh.

Key naming: dot-separated semantic paths (`section.lineup`, `card.wind_speed`).
Never key by English text — refactors will break translations.

## Adding a new language

1. In `pixelabs-i18n.js`, extend the `LANGS` map with `{ name, flag, dir, locale }`.
2. Add a circular flag SVG to the `FLAGS` map.
3. Add the locale block in `strings.js`.
4. Update the FOUC guard's `m` object with the new lang's direction.

## Public API

| Function | Purpose |
|---|---|
| `init(opts)` | Boot the engine. |
| `setLang(code)` | Switch language; fires `pixelabs:langchange`. |
| `getCurrentLang()` | Returns `'en' \| 'he' \| 'es'`. |
| `listLangs()` | Returns the list of supported codes. |
| `t(key, params?)` | Lookup with `{name}` interpolation. |
| `fmtNum(n, opts?)` | `Intl.NumberFormat` in current locale. |
| `fmtDate(d, opts?)` | `Intl.DateTimeFormat` in current locale. |
| `fmtRelTime(d)` | "2 hours ago" via `Intl.RelativeTimeFormat`. |
| `bootstrapFOUC()` | Same as the inline guard, callable from JS. |
| `buildPicker(el)` | Build the dropdown UI inside an element. |

## Gotchas

- **RTL physical properties.** `dir="rtl"` only flips text and inline-axis
  flow. CSS using `margin-left`, `padding-right`, `left:`, `border-left`,
  or `transform: translateX(...)` will NOT mirror. Convert layout-critical
  rules to logical properties (`margin-inline-start`, `padding-inline-end`,
  `inset-inline-start`, `border-inline-start`).
- **Numbers.** Spanish uses comma decimal and dot thousands. Always route
  numeric readouts through `PixelabsI18n.fmtNum(n)` instead of hardcoding.
- **Compass cardinals.** N/E/S/W are universal navigation glyphs even in
  Hebrew. Leave them as-is.
- **Coexistence with `pixelabs-themes.js`.** Different storage key
  (`pixelabsLang` vs `pixelabsThemePack`), different DOM attributes
  (`lang/dir` vs `data-theme-pack`), different events. Both can run side
  by side without conflict.
