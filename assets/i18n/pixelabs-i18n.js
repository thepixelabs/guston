/* PIXELABS I18N ENGINE v1 */
//
// Portable, vanilla, no-build i18n engine. Mirrors pixelabs-themes.js shape.
//
// Drop-in usage:
//   <script src="/assets/i18n/strings.js"></script>
//   <script src="/assets/i18n/pixelabs-i18n.js"></script>
//
// FOUC guard — paste this inline in <head> BEFORE any stylesheet that depends
// on [dir] or [lang], and BEFORE the strings/engine script tags above:
//
//   <script>
//     (function(){
//       var l = localStorage.getItem('pixelabsLang') || 'en';
//       var m = { en:'ltr', he:'rtl', es:'ltr' };
//       var r = document.documentElement;
//       r.setAttribute('lang', l);
//       r.setAttribute('dir', m[l] || 'ltr');
//     })();
//   </script>
//
// After load:
//   PixelabsI18n.init({
//     defaultLang: 'en',
//     strings: window.PIXELABS_I18N_STRINGS,
//     container: '#lang-picker'   // optional — auto-builds the picker
//   });
//
// HTML markup pattern:
//   <span data-i18n="section.conditions">Current Conditions</span>
//   <input data-i18n-attr="placeholder:search.placeholder">
//   <button data-i18n-attr="aria-label:button.refresh,title:button.refresh">…</button>
//   <span data-i18n-html="footer.copyright">© 2026 …</span>
//
// Listen for language changes:
//   window.addEventListener('pixelabs:langchange', e => console.log(e.detail.lang));
//
// Coexists peacefully with pixelabs-themes.js (separate storage key, separate
// DOM attributes, separate CustomEvent name).
//
(function (root) {
  'use strict';

  var STORAGE_KEY = 'pixelabsLang';
  var EVENT_NAME = 'pixelabs:langchange';

  var LANGS = {
    en: { name: 'English', flag: 'us', dir: 'ltr', locale: 'en-US' },
    he: { name: 'עברית',   flag: 'il', dir: 'rtl', locale: 'he-IL' },
    es: { name: 'Español', flag: 'es', dir: 'ltr', locale: 'es-ES' }
  };

  // Inline circular flag SVGs. 18x18, flat, no external deps.
  var FLAGS = {
    us: '<svg viewBox="0 0 18 18" width="18" height="18" aria-hidden="true">' +
        '<defs><clipPath id="pxlF-us"><circle cx="9" cy="9" r="9"/></clipPath></defs>' +
        '<g clip-path="url(#pxlF-us)">' +
        '<rect width="18" height="18" fill="#bf0a30"/>' +
        '<rect y="1.4" width="18" height="1.4" fill="#fff"/>' +
        '<rect y="4.2" width="18" height="1.4" fill="#fff"/>' +
        '<rect y="7" width="18" height="1.4" fill="#fff"/>' +
        '<rect y="9.8" width="18" height="1.4" fill="#fff"/>' +
        '<rect y="12.6" width="18" height="1.4" fill="#fff"/>' +
        '<rect y="15.4" width="18" height="1.4" fill="#fff"/>' +
        '<rect width="8" height="8" fill="#002868"/>' +
        '<g fill="#fff" font-family="serif" font-size="3">' +
        '<text x="1" y="3.2">★</text><text x="4" y="3.2">★</text>' +
        '<text x="1" y="6.2">★</text><text x="4" y="6.2">★</text>' +
        '</g></g></svg>',
    il: '<svg viewBox="0 0 18 18" width="18" height="18" aria-hidden="true">' +
        '<defs><clipPath id="pxlF-il"><circle cx="9" cy="9" r="9"/></clipPath></defs>' +
        '<g clip-path="url(#pxlF-il)">' +
        '<rect width="18" height="18" fill="#fff"/>' +
        '<rect y="2" width="18" height="2.2" fill="#0038b8"/>' +
        '<rect y="13.8" width="18" height="2.2" fill="#0038b8"/>' +
        '<polygon points="9,5.5 10.4,7.9 13.2,7.9 10.9,9.5 11.8,12.1 9,10.5 6.2,12.1 7.1,9.5 4.8,7.9 7.6,7.9" ' +
        'fill="none" stroke="#0038b8" stroke-width="0.6"/>' +
        '<polygon points="9,12.5 10.4,10.1 13.2,10.1 10.9,8.5 11.8,5.9 9,7.5 6.2,5.9 7.1,8.5 4.8,10.1 7.6,10.1" ' +
        'fill="none" stroke="#0038b8" stroke-width="0.6"/>' +
        '</g></svg>',
    es: '<svg viewBox="0 0 18 18" width="18" height="18" aria-hidden="true">' +
        '<defs><clipPath id="pxlF-es"><circle cx="9" cy="9" r="9"/></clipPath></defs>' +
        '<g clip-path="url(#pxlF-es)">' +
        '<rect width="18" height="4.5" fill="#aa151b"/>' +
        '<rect y="4.5" width="18" height="9" fill="#f1bf00"/>' +
        '<rect y="13.5" width="18" height="4.5" fill="#aa151b"/>' +
        '<rect x="4.5" y="7" width="2.2" height="4" fill="#aa151b" opacity="0.6"/>' +
        '<rect x="6.7" y="7" width="2.2" height="4" fill="#f1bf00" opacity="0.4" stroke="#aa151b" stroke-width="0.2"/>' +
        '</g></svg>'
  };

  var state = {
    lang: 'en',
    strings: {},
    pickerEl: null,
    pickerOpen: false
  };

  // ---- core ---------------------------------------------------------------

  function track(eventName, payload) {
    try {
      if (root.dataLayer && typeof root.dataLayer.push === 'function') {
        root.dataLayer.push(Object.assign({ event: eventName }, payload || {}));
      }
    } catch (e) { /* no-op */ }
  }

  function resolveLang(code) {
    return (code && LANGS[code]) ? code : 'en';
  }

  function lookup(key, lang) {
    var dict = state.strings[lang];
    if (dict && dict[key] != null) return dict[key];
    var en = state.strings.en;
    if (en && en[key] != null) return en[key];
    return null;
  }

  function interpolate(template, params) {
    if (template == null) return '';
    if (!params) return String(template);
    return String(template).replace(/\{(\w+)\}/g, function (_, k) {
      return params[k] != null ? params[k] : '{' + k + '}';
    });
  }

  function t(key, params) {
    var raw = lookup(key, state.lang);
    if (raw == null) return key; // last-resort: surface the key
    return interpolate(raw, params);
  }

  // ---- DOM application ----------------------------------------------------

  function applyTextNodes(root_) {
    var nodes = root_.querySelectorAll('[data-i18n]');
    for (var i = 0; i < nodes.length; i++) {
      var el = nodes[i];
      var key = el.getAttribute('data-i18n');
      var raw = lookup(key, state.lang);
      if (raw == null) {
        // Preserve original text on first miss; subsequent renders keep it.
        if (el.dataset.i18nFallback) el.textContent = el.dataset.i18nFallback;
        continue;
      }
      if (!el.dataset.i18nFallback) el.dataset.i18nFallback = el.textContent;
      el.textContent = interpolate(raw, null);
    }
  }

  function applyAttrNodes(root_) {
    var nodes = root_.querySelectorAll('[data-i18n-attr]');
    for (var i = 0; i < nodes.length; i++) {
      var el = nodes[i];
      var spec = el.getAttribute('data-i18n-attr');
      // Format: "attr:key,attr:key"
      var parts = spec.split(',');
      for (var j = 0; j < parts.length; j++) {
        var bits = parts[j].split(':');
        if (bits.length !== 2) continue;
        var attr = bits[0].trim();
        var key = bits[1].trim();
        var raw = lookup(key, state.lang);
        if (raw != null) el.setAttribute(attr, interpolate(raw, null));
      }
    }
  }

  function applyHtmlNodes(root_) {
    var nodes = root_.querySelectorAll('[data-i18n-html]');
    for (var i = 0; i < nodes.length; i++) {
      var el = nodes[i];
      var key = el.getAttribute('data-i18n-html');
      var raw = lookup(key, state.lang);
      if (raw != null) el.innerHTML = interpolate(raw, null);
    }
  }

  function applyAll() {
    applyTextNodes(document);
    applyAttrNodes(document);
    applyHtmlNodes(document);
  }

  function setDocAttrs(lang) {
    var meta = LANGS[lang];
    var html = document.documentElement;
    html.setAttribute('lang', lang);
    html.setAttribute('dir', meta.dir);
  }

  // ---- public API ---------------------------------------------------------

  function setLang(lang, opts) {
    opts = opts || { persist: true };
    lang = resolveLang(lang);
    state.lang = lang;
    setDocAttrs(lang);
    applyAll();
    if (opts.persist !== false) {
      try { localStorage.setItem(STORAGE_KEY, lang); } catch (e) {}
    }
    syncPickerPressedState();
    var meta = LANGS[lang];
    track('lang_changed', { lang: lang });
    try {
      root.dispatchEvent(new CustomEvent(EVENT_NAME, {
        detail: { lang: lang, dir: meta.dir, locale: meta.locale }
      }));
    } catch (e) {}
  }

  function getCurrentLang() { return state.lang; }
  function listLangs() { return Object.keys(LANGS); }

  function currentLocale() {
    return (LANGS[state.lang] || LANGS.en).locale;
  }

  function fmtNum(n, opts) {
    if (n == null || isNaN(n)) return '';
    try { return new Intl.NumberFormat(currentLocale(), opts || {}).format(n); }
    catch (e) { return String(n); }
  }

  function fmtDate(date, opts) {
    if (!date) return '';
    var d = (date instanceof Date) ? date : new Date(date);
    if (isNaN(d.getTime())) return '';
    try { return new Intl.DateTimeFormat(currentLocale(), opts || {}).format(d); }
    catch (e) { return d.toISOString(); }
  }

  function fmtRelTime(date) {
    if (!date) return '';
    var d = (date instanceof Date) ? date : new Date(date);
    if (isNaN(d.getTime())) return '';
    var diffSec = Math.round((d.getTime() - Date.now()) / 1000);
    var abs = Math.abs(diffSec);
    var unit, value;
    if (abs < 60)         { unit = 'second'; value = diffSec; }
    else if (abs < 3600)  { unit = 'minute'; value = Math.round(diffSec / 60); }
    else if (abs < 86400) { unit = 'hour';   value = Math.round(diffSec / 3600); }
    else if (abs < 2592000) { unit = 'day';  value = Math.round(diffSec / 86400); }
    else if (abs < 31536000){ unit = 'month';value = Math.round(diffSec / 2592000); }
    else                    { unit = 'year'; value = Math.round(diffSec / 31536000); }
    try {
      return new Intl.RelativeTimeFormat(currentLocale(), { numeric: 'auto' }).format(value, unit);
    } catch (e) { return d.toISOString(); }
  }

  function bootstrapFOUC() {
    try {
      var l = localStorage.getItem(STORAGE_KEY) || 'en';
      if (!LANGS[l]) l = 'en';
      var html = document.documentElement;
      html.setAttribute('lang', l);
      html.setAttribute('dir', LANGS[l].dir);
    } catch (e) {
      document.documentElement.setAttribute('lang', 'en');
      document.documentElement.setAttribute('dir', 'ltr');
    }
  }

  // ---- picker UI ----------------------------------------------------------

  function syncPickerPressedState() {
    if (!state.pickerEl) return;
    var btns = state.pickerEl.querySelectorAll('[data-lang]');
    for (var i = 0; i < btns.length; i++) {
      var b = btns[i];
      b.setAttribute('aria-pressed', b.getAttribute('data-lang') === state.lang ? 'true' : 'false');
    }
    var cur = state.pickerEl.querySelector('.pxl-lang-current-flag');
    if (cur) cur.innerHTML = FLAGS[LANGS[state.lang].flag];
  }

  function openPicker() {
    if (!state.pickerEl || state.pickerOpen) return;
    state.pickerOpen = true;
    var menu = state.pickerEl.querySelector('.pxl-lang-menu');
    var toggle = state.pickerEl.querySelector('.pxl-lang-toggle');
    if (menu) menu.hidden = false;
    if (toggle) toggle.setAttribute('aria-expanded', 'true');
    setTimeout(function () {
      document.addEventListener('click', onDocClick, true);
      document.addEventListener('keydown', onDocKey, true);
    }, 0);
  }

  function closePicker() {
    if (!state.pickerEl || !state.pickerOpen) return;
    state.pickerOpen = false;
    var menu = state.pickerEl.querySelector('.pxl-lang-menu');
    var toggle = state.pickerEl.querySelector('.pxl-lang-toggle');
    if (menu) menu.hidden = true;
    if (toggle) toggle.setAttribute('aria-expanded', 'false');
    document.removeEventListener('click', onDocClick, true);
    document.removeEventListener('keydown', onDocKey, true);
  }

  function onDocClick(e) {
    if (!state.pickerEl) return;
    if (state.pickerEl.contains(e.target)) return;
    closePicker();
  }

  function onDocKey(e) {
    if (e.key === 'Escape') closePicker();
    if (!state.pickerOpen) return;
    if (e.key === 'ArrowDown' || e.key === 'ArrowUp') {
      e.preventDefault();
      var items = Array.prototype.slice.call(state.pickerEl.querySelectorAll('.pxl-lang-menu [data-lang]'));
      var idx = items.indexOf(document.activeElement);
      var next = e.key === 'ArrowDown'
        ? (idx + 1) % items.length
        : (idx - 1 + items.length) % items.length;
      if (items[next]) items[next].focus();
    }
  }

  function buildPicker(containerEl) {
    if (!containerEl) return;
    state.pickerEl = containerEl;
    containerEl.classList.add('pxl-lang-picker');
    containerEl.setAttribute('role', 'group');
    containerEl.setAttribute('aria-label', 'Language picker');
    containerEl.innerHTML = '';

    var toggle = document.createElement('button');
    toggle.type = 'button';
    toggle.className = 'pxl-lang-toggle';
    toggle.setAttribute('aria-haspopup', 'menu');
    toggle.setAttribute('aria-expanded', 'false');
    toggle.setAttribute('aria-label', 'Select language');
    toggle.innerHTML =
      '<span class="pxl-lang-current-flag">' + FLAGS[LANGS[state.lang].flag] + '</span>' +
      '<svg class="pxl-lang-caret" viewBox="0 0 12 12" width="10" height="10" aria-hidden="true">' +
      '<path d="M3 5l3 3 3-3" stroke="currentColor" fill="none" stroke-width="1.6"/></svg>';
    toggle.addEventListener('click', function (e) {
      e.stopPropagation();
      if (state.pickerOpen) closePicker(); else openPicker();
    });

    var menu = document.createElement('div');
    menu.className = 'pxl-lang-menu';
    menu.setAttribute('role', 'menu');
    menu.hidden = true;

    Object.keys(LANGS).forEach(function (code) {
      var meta = LANGS[code];
      var item = document.createElement('button');
      item.type = 'button';
      item.className = 'pxl-lang-item';
      item.setAttribute('role', 'menuitem');
      item.setAttribute('data-lang', code);
      item.setAttribute('aria-pressed', code === state.lang ? 'true' : 'false');
      item.innerHTML =
        '<span class="pxl-lang-flag">' + FLAGS[meta.flag] + '</span>' +
        '<span class="pxl-lang-name">' + meta.name + '</span>';
      item.addEventListener('click', function () {
        setLang(code);
        closePicker();
      });
      menu.appendChild(item);
    });

    containerEl.appendChild(toggle);
    containerEl.appendChild(menu);
    syncPickerPressedState();
  }

  // ---- init ---------------------------------------------------------------

  function init(options) {
    options = options || {};
    if (options.strings) state.strings = options.strings;
    else if (root.PIXELABS_I18N_STRINGS) state.strings = root.PIXELABS_I18N_STRINGS;

    var stored = null;
    try { stored = localStorage.getItem(STORAGE_KEY); } catch (e) {}
    var lang = resolveLang(stored || options.defaultLang || 'en');
    state.lang = lang;
    setDocAttrs(lang);

    if (document.readyState === 'loading') {
      document.addEventListener('DOMContentLoaded', function () { applyAll(); });
    } else {
      applyAll();
    }

    if (options.container) {
      var el = typeof options.container === 'string'
        ? document.querySelector(options.container)
        : options.container;
      if (el) buildPicker(el);
    }
  }

  root.PixelabsI18n = {
    init: init,
    setLang: setLang,
    getCurrentLang: getCurrentLang,
    listLangs: listLangs,
    t: t,
    fmtNum: fmtNum,
    fmtDate: fmtDate,
    fmtRelTime: fmtRelTime,
    bootstrapFOUC: bootstrapFOUC,
    buildPicker: buildPicker,
    LANGS: LANGS,
    FLAGS: FLAGS
  };
})(typeof window !== 'undefined' ? window : this);
