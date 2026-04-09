/* PIXELABS THEME ENGINE v1 — Switcher + Picker */
//
// Drop-in usage:
//   <link rel="stylesheet" href="/assets/themes/pixelabs-themes.css">
//   <script src="/assets/themes/pixelabs-themes.js"></script>
//
// FOUC guard — paste this inline in <head> BEFORE any stylesheet that depends
// on data-theme-pack, and BEFORE the main script tag above:
//
//   <script>
//     (function () {
//       try {
//         var p = localStorage.getItem('pixelabsThemePack') || 'hud';
//         document.documentElement.setAttribute('data-theme-pack', p);
//       } catch (e) {
//         document.documentElement.setAttribute('data-theme-pack', 'hud');
//       }
//     })();
//   </script>
//
// After load: PixelabsThemes.init({ container: '#theme-picker', defaultPack: 'hud' });
//
(function (root) {
  'use strict';

  var STORAGE_KEY = 'pixelabsThemePack';
  var EVENT_NAME = 'pixelabs:themechange';

  var PIXELABS_THEMES = {
    hud: {
      name: 'HUD Classic',
      mood: 'Futuristic space dashboard',
      swatches: ['#071027', '#71e0ff', '#a78bfa'],
      displayFont: 'JetBrains Mono',
      bodyFont: 'Inter',
      googleFontsHref: null,
      modes: ['dark', 'light'],
    },
    'cyber-arcade': {
      name: 'Cyber Arcade',
      mood: 'Neon pixel chaos',
      swatches: ['#0a0015', '#ff2bd6', '#00f0ff'],
      displayFont: 'Press Start 2P',
      bodyFont: 'VT323',
      googleFontsHref:
        'https://fonts.googleapis.com/css2?family=Press+Start+2P&family=VT323&display=swap',
      modes: ['dark'],
    },
    'desert-ethnic': {
      name: 'Desert Ethnic',
      mood: 'Warm sand, serif, earthen',
      swatches: ['#f3e9d2', '#c77d4e', '#7a9a7a'],
      displayFont: 'Amiri',
      bodyFont: 'Rubik',
      googleFontsHref:
        'https://fonts.googleapis.com/css2?family=Amiri:wght@400;700&family=Rubik:wght@400;600&display=swap',
      modes: ['light'],
    },
  };

  var loadedFontPacks = new Set();
  var committedPack = null; // last persisted pack
  var currentPack = null;   // possibly a preview
  var pickerState = { container: null, open: false, pendingPreview: null, isMobile: false };

  function track(eventName, payload) {
    try {
      if (root.dataLayer && typeof root.dataLayer.push === 'function') {
        root.dataLayer.push(Object.assign({ event: eventName }, payload || {}));
      }
    } catch (e) { /* no-op */ }
  }

  function isMobileViewport() {
    return root.matchMedia && root.matchMedia('(hover: none), (max-width: 768px)').matches;
  }

  function ensureFontsLoaded(pack) {
    if (!pack.googleFontsHref) return Promise.resolve();
    var href = pack.googleFontsHref;
    if (loadedFontPacks.has(href)) return Promise.resolve();
    var existing = document.head.querySelector('link[href="' + href + '"]');
    if (!existing) {
      var link = document.createElement('link');
      link.rel = 'stylesheet';
      link.href = href;
      document.head.appendChild(link);
    }
    loadedFontPacks.add(href);
    if (document.fonts && document.fonts.ready) {
      return document.fonts.ready.catch(function () {});
    }
    return Promise.resolve();
  }

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

  function getCurrentPack() { return committedPack || currentPack; }
  function listPacks() { return PIXELABS_THEMES; }

  // ---- Picker UI ----------------------------------------------------------

  function syncPickerPressedState() {
    if (!pickerState.container) return;
    var btns = pickerState.container.querySelectorAll('[data-pack-id]');
    btns.forEach(function (b) {
      b.setAttribute('aria-pressed', b.getAttribute('data-pack-id') === currentPack ? 'true' : 'false');
    });
  }

  function hideApplyBar() {
    if (!pickerState.container) return;
    var bar = pickerState.container.querySelector('.pxl-theme-applybar');
    if (bar) bar.hidden = true;
  }

  function showApplyBar() {
    if (!pickerState.container) return;
    var bar = pickerState.container.querySelector('.pxl-theme-applybar');
    if (bar) bar.hidden = false;
  }

  function buildPicker(containerEl) {
    if (!containerEl) return;
    pickerState.container = containerEl;
    pickerState.isMobile = isMobileViewport();
    containerEl.classList.add('pxl-theme-picker');
    containerEl.setAttribute('role', 'group');
    containerEl.setAttribute('aria-label', 'Theme picker');

    var grid = document.createElement('div');
    grid.className = 'pxl-theme-grid';

    Object.keys(PIXELABS_THEMES).forEach(function (packId, idx) {
      var pack = PIXELABS_THEMES[packId];
      var btn = document.createElement('button');
      btn.type = 'button';
      btn.className = 'pxl-theme-card';
      btn.setAttribute('data-pack-id', packId);
      btn.setAttribute('aria-pressed', 'false');
      btn.setAttribute('aria-label', pack.name + ' — ' + pack.mood);
      btn.tabIndex = idx === 0 ? 0 : -1;

      var sample = document.createElement('div');
      sample.className = 'pxl-theme-card__sample';
      sample.style.fontFamily = '"' + pack.displayFont + '", monospace';
      sample.textContent = 'Aa';

      var sw = document.createElement('div');
      sw.className = 'pxl-theme-card__swatches';
      pack.swatches.forEach(function (c) {
        var s = document.createElement('span');
        s.className = 'pxl-theme-card__swatch';
        s.style.background = c;
        sw.appendChild(s);
      });

      var name = document.createElement('div');
      name.className = 'pxl-theme-card__name';
      name.textContent = pack.name;

      var mood = document.createElement('div');
      mood.className = 'pxl-theme-card__mood';
      mood.textContent = pack.mood;

      btn.appendChild(sample);
      btn.appendChild(sw);
      btn.appendChild(name);
      btn.appendChild(mood);

      // Desktop hover preview
      btn.addEventListener('mouseenter', function () {
        if (isMobileViewport()) return;
        previewTheme(packId);
      });
      btn.addEventListener('mouseleave', function () {
        if (isMobileViewport()) return;
        revertPreview();
      });

      // Click — single tap always commits + closes picker.
      btn.addEventListener('click', function () {
        setTheme(packId, { from: 'picker' }).then(function () { closePicker(false); });
      });

      // Arrow key navigation
      btn.addEventListener('keydown', function (e) {
        var keys = ['ArrowRight', 'ArrowLeft', 'ArrowDown', 'ArrowUp', 'Home', 'End'];
        if (keys.indexOf(e.key) === -1) return;
        e.preventDefault();
        var all = Array.prototype.slice.call(grid.querySelectorAll('[data-pack-id]'));
        var i = all.indexOf(btn);
        var next = i;
        if (e.key === 'ArrowRight' || e.key === 'ArrowDown') next = (i + 1) % all.length;
        else if (e.key === 'ArrowLeft' || e.key === 'ArrowUp') next = (i - 1 + all.length) % all.length;
        else if (e.key === 'Home') next = 0;
        else if (e.key === 'End') next = all.length - 1;
        all.forEach(function (b) { b.tabIndex = -1; });
        all[next].tabIndex = 0;
        all[next].focus();
      });

      grid.appendChild(btn);
    });

    containerEl.appendChild(grid);

    syncPickerPressedState();
    pickerState.open = true;
    track('theme_picker_opened', {});

    // Outside click
    setTimeout(function () {
      document.addEventListener('click', onDocClick, true);
      document.addEventListener('keydown', onDocKey, true);
    }, 0);
  }

  function onDocClick(e) {
    if (!pickerState.container || !pickerState.open) return;
    if (pickerState.container.contains(e.target)) return;
    closePicker(true);
  }

  function onDocKey(e) {
    if (e.key === 'Escape' && pickerState.open) closePicker(true);
  }

  function closePicker(revert) {
    if (!pickerState.open) return;
    pickerState.open = false;
    document.removeEventListener('click', onDocClick, true);
    document.removeEventListener('keydown', onDocKey, true);
    if (revert) revertPreview();
    hideApplyBar();
    pickerState.pendingPreview = null;
    if (pickerState.container) pickerState.container.classList.add('pxl-theme-picker--closed');
    track('theme_picker_dismissed', {});
  }

  // ---- Bootstrap / init ---------------------------------------------------

  function bootstrapFOUC() {
    try {
      var p = localStorage.getItem(STORAGE_KEY) || 'hud';
      if (!PIXELABS_THEMES[p]) p = 'hud';
      document.documentElement.setAttribute('data-theme-pack', p);
    } catch (e) {
      document.documentElement.setAttribute('data-theme-pack', 'hud');
    }
  }

  function init(options) {
    options = options || {};
    var stored = null;
    try { stored = localStorage.getItem(STORAGE_KEY); } catch (e) {}
    var packId = (stored && PIXELABS_THEMES[stored]) ? stored : (options.defaultPack || 'hud');
    setTheme(packId, { from: 'init', persist: !!stored });
    if (options.container) {
      var el = typeof options.container === 'string'
        ? document.querySelector(options.container)
        : options.container;
      if (el) buildPicker(el);
    }
  }

  root.PixelabsThemes = {
    init: init,
    setTheme: setTheme,
    previewTheme: previewTheme,
    revertPreview: revertPreview,
    getCurrentPack: getCurrentPack,
    listPacks: listPacks,
    buildPicker: buildPicker,
    bootstrapFOUC: bootstrapFOUC,
    closePicker: closePicker,
  };
})(typeof window !== 'undefined' ? window : this);
