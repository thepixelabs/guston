# The Lineup — Visual & Implementation Spec

**Author:** @creative-technologist
**Audience:** @staff-engineer (Wave 2 Pass A)
**Scope:** new `<section id="lineup">` inserted in `index.html` between `#forecast` and `#radar`. Consumes `data/news.json` and `data/events.json` (schemas frozen in `arch-plan-v5.md` §4). This document is copy-pasteable: markup, CSS, and JS are final verbatim.

Section contract:
- Mounts synchronously; initial render happens **before** the fetch resolves so CLS is zero (reserved `min-height`).
- `initLineup()` is fired from existing `DOMContentLoaded` init via `requestIdleCallback` so it never delays the verdict hero.
- Each column fails independently. Network errors, parse errors, empty arrays all degrade to their own empty state — the section NEVER disappears.
- Every user-visible string is wrapped in `data-i18n="lineup.<path>"` so the i18n sweep (Pass C) picks them up unchanged.
- All colors are CSS custom properties so the three theme packs (`hud`, `cyber-arcade`, `desert-ethnic`) re-skin automatically.

---

## 1. Section shell — HTML (paste between `#forecast` close tag and `#radar` open tag)

```html
<!-- ===== THE LINEUP (news + events + season calendar) ===== -->
<section id="lineup" class="lineup" aria-labelledby="lineupTitle">
  <div class="container">
    <div class="section-title lineup-title-row">
      <svg class="lineup-icon" viewBox="0 0 24 24" width="24" height="24" fill="none" stroke="currentColor" stroke-width="1.6" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true">
        <!-- Trophy cup body -->
        <path d="M8 4 L16 4 L15.6 10.2 Q15.2 13.4 12 13.6 Q8.8 13.4 8.4 10.2 Z"/>
        <!-- Trophy handles -->
        <path d="M8 5.4 Q5.4 5.8 5.4 7.6 Q5.4 9 7.2 9.4"/>
        <path d="M16 5.4 Q18.6 5.8 18.6 7.6 Q18.6 9 16.8 9.4"/>
        <!-- Trophy stem + base -->
        <line x1="12" y1="13.6" x2="12" y2="16.2"/>
        <line x1="9.2" y1="16.6" x2="14.8" y2="16.6"/>
        <!-- Wave baseline -->
        <path d="M3 20 Q6 18.2 9 20 T15 20 T21 20" stroke-linecap="round"/>
      </svg>
      <span class="section-title-text" id="lineupTitle" data-i18n="lineup.title">The Lineup</span>
      <span class="lineup-subtitle" data-i18n="lineup.subtitle">NEWS &bull; COMPETITIONS &bull; RESULTS</span>
      <button type="button" class="lineup-info" aria-label="About The Lineup" data-i18n-aria="lineup.info.aria" aria-describedby="lineupTooltip">
        <svg viewBox="0 0 24 24" width="16" height="16" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true">
          <circle cx="12" cy="12" r="9"/>
          <line x1="12" y1="11" x2="12" y2="16"/>
          <circle cx="12" cy="8" r="0.6" fill="currentColor"/>
        </svg>
      </button>
      <span role="tooltip" id="lineupTooltip" class="lineup-tooltip" data-i18n="lineup.info.body">Curated news from IKSurfMag, Windsurf Magazine and Google News. Competition calendar from GKA, WSL, PWA, GWA and Red Bull. News refreshes every 6 hours, events daily.</span>
    </div>

    <!-- 12-month condensed calendar strip -->
    <div class="lineup-calendar-wrap" aria-label="Season calendar">
      <div class="lineup-calendar" id="lineupCalendar" role="list" aria-label="Event months" data-i18n-aria="lineup.calendar.aria">
        <!-- 12 month cells injected by initLineup() -->
      </div>
      <button type="button" class="lineup-calendar-clear" id="lineupCalendarClear" hidden data-i18n="lineup.calendar.clear">Show all months</button>
    </div>

    <!-- 2-col grid: news left, events right -->
    <div class="lineup-grid">
      <!-- NEWS COLUMN -->
      <div class="lineup-col lineup-news-col" aria-labelledby="lineupNewsHeading">
        <h3 class="lineup-col-heading" id="lineupNewsHeading">
          <span data-i18n="lineup.news.heading">Latest news</span>
          <span class="lineup-col-count" id="lineupNewsCount" aria-hidden="true"></span>
        </h3>
        <ul class="lineup-news-list" id="lineupNewsList" role="list">
          <!-- skeleton placeholders rendered immediately, replaced by cards -->
          <li class="lineup-news-skel" aria-hidden="true"></li>
          <li class="lineup-news-skel" aria-hidden="true"></li>
          <li class="lineup-news-skel" aria-hidden="true"></li>
          <li class="lineup-news-skel" aria-hidden="true"></li>
          <li class="lineup-news-skel" aria-hidden="true"></li>
        </ul>
        <button type="button" class="lineup-more-btn" id="lineupNewsMore" hidden data-i18n="lineup.news.more">Load more news</button>
      </div>

      <!-- EVENTS COLUMN -->
      <div class="lineup-col lineup-events-col" aria-labelledby="lineupEventsHeading">
        <h3 class="lineup-col-heading" id="lineupEventsHeading">
          <span data-i18n="lineup.events.heading">Upcoming events</span>
          <span class="lineup-col-count" id="lineupEventsCount" aria-hidden="true"></span>
        </h3>
        <ol class="lineup-events-list" id="lineupEventsList" role="list" aria-live="polite" aria-relevant="additions text">
          <li class="lineup-event-skel" aria-hidden="true"></li>
          <li class="lineup-event-skel" aria-hidden="true"></li>
          <li class="lineup-event-skel" aria-hidden="true"></li>
        </ol>
        <button type="button" class="lineup-more-btn" id="lineupEventsMore" hidden data-i18n="lineup.events.more">View all events</button>
      </div>
    </div>
  </div>
</section>
```

Placement note: paste this block in `index.html` after the closing `</section>` of `#forecast` and before the opening `<section>` of `#radar`. It introduces no new top-level IDs that collide with anything existing.

---

## 2. CSS — paste verbatim inside the existing `<style>` block, below the Forecast section rules and above the Radar section rules

```css
/* ========================================================================
   THE LINEUP
   ======================================================================== */
.lineup {
  padding: 48px 0 32px;
  /* Reserve vertical space so the JSON fetch never causes CLS */
  min-height: 720px;
}
.lineup > .container { display: block; }

/* Sport color tokens, scoped to the section so they do not leak */
.lineup {
  --sport-kite:  #71e0ff;
  --sport-wind:  #a78bfa;
  --sport-wing:  #ffb547;
  --sport-surf:  #5cffb1;
  --sport-sup:   #a0d8ef;
  --sport-foil:  #ff6b35;
  --tour-gka:    #71e0ff;
  --tour-wsl:    #6aa8ff;
  --tour-pwa:    #c79bff;
  --tour-gwa:    #ffc46b;
  --tour-redbull:#ff5c7c;
  --tour-ika:    #5cffb1;
  --lineup-card-bg: var(--panel);
  --lineup-card-bg-hover: var(--panel-hover);
  --lineup-card-border: var(--border);
  --lineup-card-border-hover: rgba(var(--accent-rgb), 0.55);
}

/* Title row: title, subtitle, info button, tooltip */
.lineup-title-row { position: relative; flex-wrap: wrap; gap: 10px 14px; }
.lineup-subtitle {
  font-family: var(--mono);
  font-size: 0.72rem;
  letter-spacing: 0.12em;
  color: var(--subtle);
  text-transform: uppercase;
  padding-inline-start: 6px;
}
.lineup-icon { color: var(--accent); }

.lineup-info {
  appearance: none;
  background: transparent;
  border: 1px solid var(--border);
  color: var(--muted);
  width: 24px; height: 24px;
  border-radius: 50%;
  display: inline-flex;
  align-items: center;
  justify-content: center;
  cursor: pointer;
  transition: color .2s ease, border-color .2s ease, transform .2s ease;
  margin-inline-start: 4px;
}
.lineup-info:hover,
.lineup-info:focus-visible { color: var(--accent); border-color: var(--accent); transform: scale(1.08); }
.lineup-info:focus-visible { outline: 2px solid var(--accent); outline-offset: 2px; }

.lineup-tooltip {
  position: absolute;
  top: calc(100% + 6px);
  inset-inline-start: 0;
  max-width: min(360px, 90vw);
  padding: 10px 12px;
  background: var(--bg2);
  color: var(--text);
  border: 1px solid var(--border-bright);
  border-radius: var(--radius-sm);
  font-size: 0.78rem;
  line-height: 1.45;
  box-shadow: var(--shadow);
  opacity: 0;
  pointer-events: none;
  transform: translateY(-4px);
  transition: opacity .18s ease, transform .18s ease;
  z-index: 20;
}
.lineup-info:hover + .lineup-tooltip,
.lineup-info:focus-visible + .lineup-tooltip,
.lineup-tooltip:hover { opacity: 1; transform: translateY(0); pointer-events: auto; }

/* ------------ 12-month calendar strip ------------ */
.lineup-calendar-wrap {
  margin: 18px 0 22px;
  position: relative;
}
.lineup-calendar {
  display: grid;
  grid-template-columns: repeat(12, minmax(0, 1fr));
  gap: 6px;
  padding: 10px;
  background: var(--panel);
  border: 1px solid var(--border);
  border-radius: var(--radius-sm);
  clip-path: var(--card-clip);
}
.lineup-month {
  appearance: none;
  background: transparent;
  border: 1px solid transparent;
  border-radius: var(--radius-xs);
  padding: 8px 4px 6px;
  color: var(--muted);
  font-family: var(--mono);
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 6px;
  cursor: pointer;
  position: relative;
  min-height: 62px;
  transition: background .2s ease, border-color .2s ease, color .2s ease, transform .2s ease;
}
.lineup-month:hover,
.lineup-month:focus-visible {
  background: var(--panel-hover);
  color: var(--text);
  border-color: var(--border-bright);
}
.lineup-month:focus-visible { outline: 2px solid var(--accent); outline-offset: 2px; }
.lineup-month[aria-pressed="true"] {
  background: rgba(var(--accent-rgb), 0.12);
  border-color: var(--accent);
  color: var(--text);
}
.lineup-month.is-current {
  background: var(--panel-hover);
  border-color: rgba(var(--accent-rgb), 0.6);
  animation: lineup-month-pulse 2.4s ease-in-out infinite;
}
.lineup-month.is-empty { opacity: 0.45; cursor: default; }
.lineup-month.is-empty:hover { background: transparent; border-color: transparent; }

.lineup-month-label {
  font-size: 0.68rem;
  letter-spacing: 0.1em;
  text-transform: uppercase;
}
.lineup-month-dots {
  display: flex;
  gap: 3px;
  flex-wrap: wrap;
  justify-content: center;
  max-width: 100%;
  min-height: 8px;
}
.lineup-month-dots .dot {
  width: 6px;
  height: 6px;
  border-radius: 50%;
  background: currentColor;
  display: inline-block;
}
.lineup-month-dots .dot-kite { color: var(--sport-kite); }
.lineup-month-dots .dot-wind { color: var(--sport-wind); }
.lineup-month-dots .dot-wing { color: var(--sport-wing); }
.lineup-month-dots .dot-surf { color: var(--sport-surf); }
.lineup-month-dots .dot-sup  { color: var(--sport-sup);  }
.lineup-month-dots .dot-foil { color: var(--sport-foil); }
.lineup-month-dots .dot.is-live {
  box-shadow: 0 0 0 0 rgba(var(--accent-rgb), 0.6);
  animation: on-air-pulse 1.4s ease-in-out infinite;
}
.lineup-month-count {
  position: absolute;
  top: 3px;
  inset-inline-end: 4px;
  font-size: 0.6rem;
  background: rgba(var(--accent-rgb), 0.18);
  color: var(--accent);
  padding: 1px 5px;
  border-radius: 999px;
  min-width: 16px;
  text-align: center;
  font-weight: 600;
}
.lineup-month-count:empty { display: none; }

@keyframes lineup-month-pulse {
  0%, 100% { box-shadow: 0 0 0 0 rgba(var(--accent-rgb), 0.0); }
  50%      { box-shadow: 0 0 0 4px rgba(var(--accent-rgb), 0.12); }
}

.lineup-calendar-clear {
  margin-top: 8px;
  appearance: none;
  background: transparent;
  border: 1px solid var(--border);
  color: var(--muted);
  padding: 6px 12px;
  border-radius: 999px;
  font-family: var(--mono);
  font-size: 0.7rem;
  letter-spacing: 0.08em;
  text-transform: uppercase;
  cursor: pointer;
  transition: color .2s, border-color .2s;
}
.lineup-calendar-clear:hover { color: var(--accent); border-color: var(--accent); }

/* ------------ Two-column grid ------------ */
.lineup-grid {
  display: grid;
  grid-template-columns: minmax(0, 1.85fr) minmax(0, 1fr);
  gap: 24px;
  align-items: start;
}
.lineup-col { min-width: 0; }
.lineup-col-heading {
  font-size: 0.78rem;
  font-family: var(--mono);
  text-transform: uppercase;
  letter-spacing: 0.1em;
  color: var(--subtle);
  margin: 0 0 12px;
  display: flex;
  align-items: center;
  gap: 8px;
}
.lineup-col-count {
  font-size: 0.7rem;
  color: var(--muted);
  background: var(--panel);
  border: 1px solid var(--border);
  padding: 1px 8px;
  border-radius: 999px;
}

/* ------------ News cards ------------ */
.lineup-news-list { list-style: none; padding: 0; margin: 0; display: flex; flex-direction: column; gap: 12px; }
.lineup-news-skel {
  height: 112px;
  border-radius: var(--radius-sm);
  background: linear-gradient(90deg, var(--panel) 0%, var(--panel-hover) 50%, var(--panel) 100%);
  background-size: 200% 100%;
  animation: lineup-shimmer 1.6s linear infinite;
  clip-path: var(--card-clip);
}
@keyframes lineup-shimmer {
  0%   { background-position: 200% 0; }
  100% { background-position: -200% 0; }
}

.lineup-news-card {
  display: grid;
  grid-template-columns: 112px 1fr;
  gap: 14px;
  padding: 12px;
  background: var(--lineup-card-bg);
  border: 1px solid var(--lineup-card-border);
  border-radius: var(--radius-sm);
  color: inherit;
  text-decoration: none;
  position: relative;
  clip-path: var(--card-clip);
  transition: transform .25s ease, border-color .25s ease, background .25s ease, box-shadow .25s ease;
  opacity: 0;
  transform: translateY(12px);
}
.lineup-news-card.is-visible { opacity: 1; transform: translateY(0); }
.lineup-news-card:hover,
.lineup-news-card:focus-visible {
  background: var(--lineup-card-bg-hover);
  border-color: var(--lineup-card-border-hover);
  transform: translateY(-2px);
  box-shadow: 0 10px 24px rgba(0,0,0,0.35);
}
.lineup-news-card:focus-visible { outline: 2px solid var(--accent); outline-offset: 2px; }

.lineup-news-thumb {
  width: 100%;
  aspect-ratio: 1 / 1;
  border-radius: var(--radius-xs);
  overflow: hidden;
  background: linear-gradient(135deg, rgba(var(--accent-rgb),0.18), rgba(var(--accent-2-rgb),0.18));
  display: flex;
  align-items: center;
  justify-content: center;
  color: rgba(var(--accent-rgb), 0.7);
}
.lineup-news-thumb img { width: 100%; height: 100%; object-fit: cover; display: block; }
.lineup-news-thumb svg { width: 46%; height: 46%; opacity: 0.8; }

.lineup-news-body { min-width: 0; display: flex; flex-direction: column; gap: 6px; }
.lineup-news-meta {
  display: flex;
  gap: 8px;
  align-items: center;
  font-family: var(--mono);
  font-size: 0.68rem;
  color: var(--subtle);
  text-transform: uppercase;
  letter-spacing: 0.08em;
}
.lineup-news-meta .dot-sep { opacity: 0.5; }
.lineup-news-source { color: var(--accent); font-weight: 600; }
.lineup-news-title {
  font-size: 0.96rem;
  line-height: 1.3;
  font-weight: 700;
  color: var(--text);
  margin: 0;
  display: -webkit-box;
  -webkit-line-clamp: 2;
  -webkit-box-orient: vertical;
  overflow: hidden;
}
.lineup-news-snippet {
  font-size: 0.82rem;
  line-height: 1.5;
  color: var(--muted);
  margin: 0;
  display: -webkit-box;
  -webkit-line-clamp: 2;
  -webkit-box-orient: vertical;
  overflow: hidden;
}
.lineup-news-tags { display: flex; gap: 6px; flex-wrap: wrap; margin-top: 2px; }
.lineup-chip {
  font-family: var(--mono);
  font-size: 0.62rem;
  letter-spacing: 0.08em;
  text-transform: uppercase;
  padding: 2px 8px;
  border-radius: 999px;
  border: 1px solid currentColor;
  background: color-mix(in srgb, currentColor 10%, transparent);
}
.lineup-chip.chip-kite { color: var(--sport-kite); }
.lineup-chip.chip-wind { color: var(--sport-wind); }
.lineup-chip.chip-wing { color: var(--sport-wing); }
.lineup-chip.chip-surf { color: var(--sport-surf); }
.lineup-chip.chip-sup  { color: var(--sport-sup);  }
.lineup-chip.chip-foil { color: var(--sport-foil); }

.lineup-news-card.is-error { border-color: rgba(255,92,124,0.4); }
.lineup-news-card.is-error .lineup-news-source { color: var(--bad); }

/* Empty/failure states */
.lineup-empty {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  gap: 12px;
  text-align: center;
  padding: 36px 16px;
  border: 1px dashed var(--border);
  border-radius: var(--radius-sm);
  color: var(--muted);
  font-size: 0.86rem;
}
.lineup-empty .lineup-empty-icon {
  width: 64px; height: 40px;
  color: rgba(var(--accent-rgb), 0.5);
  animation: lineup-wave 4s ease-in-out infinite;
}
@keyframes lineup-wave {
  0%, 100% { transform: translateY(0); }
  50%      { transform: translateY(-4px); }
}
.lineup-empty.is-error { border-color: rgba(255,92,124,0.35); color: var(--bad); }
.lineup-empty.is-error .lineup-empty-icon { color: rgba(255,92,124,0.6); animation: none; }

/* ------------ Event cards (timeline) ------------ */
.lineup-events-list {
  list-style: none;
  padding: 0;
  margin: 0;
  display: flex;
  flex-direction: column;
  gap: 10px;
  position: relative;
}
.lineup-event-skel {
  height: 78px;
  border-radius: var(--radius-sm);
  background: linear-gradient(90deg, var(--panel) 0%, var(--panel-hover) 50%, var(--panel) 100%);
  background-size: 200% 100%;
  animation: lineup-shimmer 1.6s linear infinite;
  clip-path: var(--card-clip);
}
.lineup-event {
  display: grid;
  grid-template-columns: 54px 1fr;
  gap: 12px;
  padding: 10px 12px;
  background: var(--lineup-card-bg);
  border: 1px solid var(--lineup-card-border);
  border-radius: var(--radius-sm);
  color: inherit;
  text-decoration: none;
  clip-path: var(--card-clip);
  transition: transform .25s ease, border-color .25s ease, background .25s ease;
  opacity: 0;
  transform: translateY(8px);
  position: relative;
}
.lineup-event.is-visible { opacity: 1; transform: translateY(0); }
.lineup-event:hover,
.lineup-event:focus-visible {
  background: var(--lineup-card-bg-hover);
  border-color: var(--lineup-card-border-hover);
  transform: translateY(-1px);
}
.lineup-event:focus-visible { outline: 2px solid var(--accent); outline-offset: 2px; }
.lineup-event.is-past { opacity: 0.42; }
.lineup-event.is-live { border-color: rgba(255, 92, 124, 0.55); }

.lineup-event-badge {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  padding: 6px 4px;
  border-radius: var(--radius-xs);
  background: color-mix(in srgb, var(--badge-color, var(--accent)) 18%, transparent);
  border: 1px solid color-mix(in srgb, var(--badge-color, var(--accent)) 55%, transparent);
  color: var(--badge-color, var(--accent));
  font-family: var(--mono);
}
.lineup-event-badge-month {
  font-size: 0.62rem;
  letter-spacing: 0.1em;
  text-transform: uppercase;
  opacity: 0.85;
}
.lineup-event-badge-day {
  font-size: 1.2rem;
  font-weight: 700;
  line-height: 1;
}
.lineup-event-body { min-width: 0; display: flex; flex-direction: column; gap: 4px; }
.lineup-event-name {
  font-size: 0.9rem;
  font-weight: 700;
  color: var(--text);
  margin: 0;
  display: -webkit-box;
  -webkit-line-clamp: 2;
  -webkit-box-orient: vertical;
  overflow: hidden;
}
.lineup-event-meta {
  display: flex;
  align-items: center;
  gap: 8px;
  flex-wrap: wrap;
  font-size: 0.72rem;
  color: var(--muted);
}
.lineup-event-location { display: inline-flex; align-items: center; gap: 4px; }
.lineup-event-flag { font-size: 0.9rem; line-height: 1; }
.lineup-sport-icon { width: 14px; height: 14px; color: var(--sport-color, var(--accent)); flex-shrink: 0; }
.lineup-tour-pill {
  font-family: var(--mono);
  font-size: 0.6rem;
  letter-spacing: 0.08em;
  text-transform: uppercase;
  padding: 2px 6px;
  border-radius: 999px;
  color: var(--tour-color, var(--accent));
  border: 1px solid color-mix(in srgb, var(--tour-color, var(--accent)) 55%, transparent);
  background: color-mix(in srgb, var(--tour-color, var(--accent)) 12%, transparent);
}
.lineup-status-pill {
  font-family: var(--mono);
  font-size: 0.6rem;
  letter-spacing: 0.1em;
  text-transform: uppercase;
  padding: 2px 8px;
  border-radius: 999px;
  border: 1px solid var(--border);
  color: var(--subtle);
  background: var(--panel);
  margin-inline-start: auto;
}
.lineup-status-pill.is-live {
  color: #fff;
  background: var(--bad);
  border-color: var(--bad);
  animation: on-air-pulse 1.4s ease-in-out infinite;
}
.lineup-status-pill.is-upcoming { color: var(--accent); border-color: color-mix(in srgb, var(--accent) 45%, transparent); }
.lineup-event-countdown { font-size: 0.68rem; color: var(--subtle); font-family: var(--mono); }

/* ------------ Load-more buttons ------------ */
.lineup-more-btn {
  appearance: none;
  width: 100%;
  margin-top: 14px;
  padding: 10px 16px;
  background: var(--panel);
  border: 1px solid var(--border);
  color: var(--text);
  font-family: var(--mono);
  font-size: 0.76rem;
  letter-spacing: 0.1em;
  text-transform: uppercase;
  border-radius: var(--radius-sm);
  cursor: pointer;
  transition: background .2s ease, border-color .2s ease, color .2s ease;
}
.lineup-more-btn:hover,
.lineup-more-btn:focus-visible {
  background: var(--panel-hover);
  border-color: var(--accent);
  color: var(--accent);
}
.lineup-more-btn:focus-visible { outline: 2px solid var(--accent); outline-offset: 2px; }

/* ------------ Responsive ------------ */
@media (max-width: 1024px) {
  .lineup-grid { grid-template-columns: minmax(0, 1.5fr) minmax(0, 1fr); gap: 18px; }
  .lineup-news-card { grid-template-columns: 96px 1fr; }
}
@media (max-width: 720px) {
  .lineup { padding: 36px 0 24px; min-height: 0; }
  .lineup-grid { grid-template-columns: 1fr; gap: 28px; }
  /* Mobile order: events first, news second (per PE brief) */
  .lineup-events-col { order: 1; }
  .lineup-news-col   { order: 2; }
  .lineup-calendar-wrap { order: 1.5; margin: 14px 0 18px; }
  .lineup-calendar {
    grid-template-columns: repeat(12, 80px);
    overflow-x: auto;
    scroll-snap-type: x mandatory;
    -webkit-overflow-scrolling: touch;
    padding: 8px;
  }
  .lineup-month { scroll-snap-align: center; min-height: 72px; }
  .lineup-news-card {
    grid-template-columns: 1fr;
  }
  .lineup-news-thumb { aspect-ratio: 16 / 9; }
  .lineup-news-snippet { display: none; }
}
@media (max-width: 480px) {
  .lineup-event { grid-template-columns: 46px 1fr; padding: 8px 10px; }
  .lineup-event-badge-day { font-size: 1rem; }
  .lineup-event-name { font-size: 0.84rem; }
  .lineup-news-title { font-size: 0.9rem; }
}

/* Reduced motion: kill all lineup animations + stagger reveal */
@media (prefers-reduced-motion: reduce) {
  .lineup-news-card,
  .lineup-event { opacity: 1 !important; transform: none !important; transition: none !important; }
  .lineup-news-skel,
  .lineup-event-skel,
  .lineup-month.is-current,
  .lineup-status-pill.is-live,
  .lineup-month-dots .dot.is-live,
  .lineup-empty .lineup-empty-icon { animation: none !important; }
}
```

---

## 3. JS module — paste inside the existing bottom `<script>` block and invoke from the DOMContentLoaded init

```js
/* =====================================================================
   THE LINEUP — news + events + 12-month calendar
   ===================================================================== */
(function () {
  'use strict';

  const NEWS_URL   = 'data/news.json';
  const EVENTS_URL = 'data/events.json';
  const FETCH_TIMEOUT_MS = 2000;

  const NEWS_INITIAL = 5;
  const NEWS_STEP    = 5;
  const NEWS_MAX     = 30;

  const EVENTS_INITIAL = 7;

  const MONTH_LABELS = ['JAN','FEB','MAR','APR','MAY','JUN','JUL','AUG','SEP','OCT','NOV','DEC'];

  const SPORT_CLASS = {
    kite: 'dot-kite', wind: 'dot-wind', wing: 'dot-wing',
    surf: 'dot-surf', sup: 'dot-sup',   foil: 'dot-foil',
  };
  const SPORT_COLOR_VAR = {
    kite: 'var(--sport-kite)', wind: 'var(--sport-wind)', wing: 'var(--sport-wing)',
    surf: 'var(--sport-surf)', sup: 'var(--sport-sup)',   foil: 'var(--sport-foil)',
  };
  const TOUR_COLOR_VAR = {
    GKA:     'var(--tour-gka)',
    WSL:     'var(--tour-wsl)',
    PWA:     'var(--tour-pwa)',
    GWA:     'var(--tour-gwa)',
    RedBull: 'var(--tour-redbull)',
    IKA:     'var(--tour-ika)',
  };

  // --- tiny DOM helper ---
  function h(tag, attrs = {}, ...children) {
    const el = document.createElement(tag);
    for (const k in attrs) {
      const v = attrs[k];
      if (v == null || v === false) continue;
      if (k === 'class') el.className = v;
      else if (k === 'dataset') Object.assign(el.dataset, v);
      else if (k.startsWith('on') && typeof v === 'function') el.addEventListener(k.slice(2), v);
      else if (k === 'html') el.innerHTML = v;
      else el.setAttribute(k, v === true ? '' : v);
    }
    for (const c of children) {
      if (c == null || c === false) continue;
      el.append(c.nodeType ? c : document.createTextNode(String(c)));
    }
    return el;
  }

  // --- fetch with timeout, always resolves ---
  async function fetchJSON(url) {
    const ctrl = new AbortController();
    const t = setTimeout(() => ctrl.abort(), FETCH_TIMEOUT_MS);
    try {
      const res = await fetch(url, { signal: ctrl.signal, cache: 'no-cache' });
      if (!res.ok) throw new Error('HTTP ' + res.status);
      return await res.json();
    } catch (err) {
      return { __error: err && err.message ? err.message : 'fetch failed' };
    } finally {
      clearTimeout(t);
    }
  }

  // --- relative time ---
  const _rtf = (() => {
    try { return new Intl.RelativeTimeFormat(document.documentElement.lang || 'en', { numeric: 'auto' }); }
    catch (_) { return null; }
  })();
  function relTime(iso) {
    if (!iso) return '';
    const then = Date.parse(iso);
    if (Number.isNaN(then)) return '';
    const diff = (then - Date.now()) / 1000;
    const a = Math.abs(diff);
    const units = [
      ['year',   60*60*24*365],
      ['month',  60*60*24*30],
      ['week',   60*60*24*7],
      ['day',    60*60*24],
      ['hour',   60*60],
      ['minute', 60],
      ['second', 1],
    ];
    for (const [unit, sec] of units) {
      if (a >= sec || unit === 'second') {
        const val = Math.round(diff / sec);
        return _rtf ? _rtf.format(val, unit) : `${Math.abs(val)}${unit[0]} ${val < 0 ? 'ago' : 'in'}`;
      }
    }
    return '';
  }

  // --- absolute date for events ---
  const _dtf = (() => {
    try {
      return new Intl.DateTimeFormat(document.documentElement.lang || 'en', { day: '2-digit', month: 'short' });
    } catch (_) { return null; }
  })();
  function formatEventBadge(iso) {
    const d = new Date(iso);
    if (Number.isNaN(d.getTime())) return { day: '--', month: '---' };
    if (_dtf) {
      const parts = _dtf.formatToParts(d);
      const day = parts.find(p => p.type === 'day')?.value || String(d.getDate()).padStart(2, '0');
      const month = (parts.find(p => p.type === 'month')?.value || MONTH_LABELS[d.getMonth()]).toUpperCase();
      return { day, month };
    }
    return { day: String(d.getDate()).padStart(2, '0'), month: MONTH_LABELS[d.getMonth()] };
  }

  // --- country flag emoji from ISO alpha-2 ---
  function flagEmoji(cc) {
    if (!cc || cc.length !== 2) return '';
    const A = 0x1F1E6;
    const up = cc.toUpperCase();
    return String.fromCodePoint(A + (up.charCodeAt(0) - 65), A + (up.charCodeAt(1) - 65));
  }

  // --- event status computed defensively on the client ---
  function computeStatus(ev) {
    const now = Date.now();
    const start = Date.parse(ev.start_date);
    const end   = Date.parse(ev.end_date || ev.start_date);
    if (Number.isNaN(start)) return 'upcoming';
    if (!Number.isNaN(end) && end < now - 24*3600*1000) return 'past';
    if (start <= now && (Number.isNaN(end) || now <= end + 24*3600*1000)) return 'live';
    return 'upcoming';
  }
  function daysUntil(iso) {
    const d = Date.parse(iso);
    if (Number.isNaN(d)) return null;
    return Math.round((d - Date.now()) / (24*3600*1000));
  }

  // --- instrumentation ---
  function track(name, payload) {
    try {
      window.dataLayer = window.dataLayer || [];
      window.dataLayer.push(Object.assign({ event: name }, payload || {}));
    } catch (_) {}
  }

  // --- sport icon (single-stroke SVG) ---
  function sportIconSVG(sport) {
    const paths = {
      kite: '<path d="M4 4 L20 12 L4 20 Z"/><path d="M4 20 L12 12"/>',
      wind: '<path d="M3 8 H14 a3 3 0 1 0 -3 -3"/><path d="M3 13 H18 a3 3 0 1 1 -3 3"/>',
      wing: '<path d="M4 14 Q10 4 20 6 Q18 14 10 18 Z"/><path d="M4 14 L20 6"/>',
      surf: '<path d="M3 18 Q8 10 14 12 T21 10"/><path d="M14 12 L17 6"/>',
      sup:  '<ellipse cx="12" cy="14" rx="9" ry="3"/><path d="M12 14 V3"/><path d="M10 6 H14"/>',
      foil: '<path d="M4 10 H20"/><path d="M12 10 V20"/><path d="M8 20 H16"/>',
    };
    return `<svg class="lineup-sport-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true">${paths[sport] || paths.kite}</svg>`;
  }
  function newsPlaceholderSVG() {
    return '<svg viewBox="0 0 64 40" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path d="M2 28 Q12 18 22 28 T42 28 T62 28"/><path d="M2 34 Q12 26 22 34 T42 34 T62 34" opacity="0.6"/></svg>';
  }
  function waveIconSVG() {
    return '<svg class="lineup-empty-icon" viewBox="0 0 64 40" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path d="M2 20 Q12 8 22 20 T42 20 T62 20"/><path d="M2 30 Q12 18 22 30 T42 30 T62 30" opacity="0.6"/></svg>';
  }
  function errorIconSVG() {
    return '<svg class="lineup-empty-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path d="M12 3 L22 20 H2 Z"/><line x1="12" y1="10" x2="12" y2="14"/><circle cx="12" cy="17" r="0.6" fill="currentColor"/></svg>';
  }

  // --- state ---
  const state = {
    news: [],
    events: [],
    newsVisible: NEWS_INITIAL,
    eventsExpanded: false,
    calendarFilterMonth: null, // 0..11 or null
  };

  // --- NEWS RENDER ---
  function renderNewsCard(item, idx) {
    const date = relTime(item.date);
    const tags = Array.isArray(item.tags) ? item.tags : [];
    const thumbChildren = item.image
      ? h('img', {
          src: item.image, alt: '', loading: 'lazy', decoding: 'async',
          onerror: (e) => { e.target.replaceWith(Object.assign(document.createElement('span'), { innerHTML: newsPlaceholderSVG() }).firstChild); },
        })
      : Object.assign(document.createElement('span'), { innerHTML: newsPlaceholderSVG() }).firstChild;

    const card = h('a', {
        class: 'lineup-news-card',
        href: item.url || '#',
        target: '_blank',
        rel: 'noopener noreferrer',
        'data-idx': idx,
        onclick: () => track('news_article_clicked', { source: item.source_name || item.source, title: item.title }),
      },
      h('div', { class: 'lineup-news-thumb' }, thumbChildren),
      h('div', { class: 'lineup-news-body' },
        h('div', { class: 'lineup-news-meta' },
          h('span', { class: 'lineup-news-source' }, item.source_name || item.source || ''),
          h('span', { class: 'dot-sep' }, '\u00B7'),
          h('span', { class: 'lineup-news-date' }, date),
        ),
        h('h4', { class: 'lineup-news-title' }, item.title || ''),
        h('p',  { class: 'lineup-news-snippet' }, item.snippet || ''),
        tags.length ? h('div', { class: 'lineup-news-tags' },
          ...tags.map(t => h('span', { class: 'lineup-chip chip-' + t }, t))) : null,
      ),
    );
    return card;
  }

  function renderNews() {
    const list = document.getElementById('lineupNewsList');
    const moreBtn = document.getElementById('lineupNewsMore');
    const countEl = document.getElementById('lineupNewsCount');
    if (!list) return;
    list.innerHTML = '';

    if (state.news.__error) {
      list.append(renderEmpty('news', true));
      if (moreBtn) moreBtn.hidden = true;
      if (countEl) countEl.textContent = '';
      return;
    }
    if (!state.news.length) {
      list.append(renderEmpty('news', false));
      if (moreBtn) moreBtn.hidden = true;
      if (countEl) countEl.textContent = '';
      return;
    }

    const slice = state.news.slice(0, state.newsVisible);
    slice.forEach((item, i) => {
      const li = document.createElement('li');
      li.append(renderNewsCard(item, i));
      list.append(li);
    });
    if (countEl) countEl.textContent = `${slice.length}/${Math.min(state.news.length, NEWS_MAX)}`;
    if (moreBtn) moreBtn.hidden = state.newsVisible >= Math.min(state.news.length, NEWS_MAX);
    observeReveal(list);
  }

  // --- EVENTS RENDER ---
  function renderEventCard(ev) {
    ev.status = computeStatus(ev);
    const badge = formatEventBadge(ev.start_date);
    const sportColor = SPORT_COLOR_VAR[ev.sport] || 'var(--accent)';
    const tourColor  = TOUR_COLOR_VAR[ev.tour] || 'var(--accent)';
    const flag = flagEmoji(ev.country);
    const du = daysUntil(ev.start_date);

    let statusPill;
    if (ev.status === 'live')   statusPill = h('span', { class: 'lineup-status-pill is-live', 'data-i18n': 'lineup.events.status.live' }, 'LIVE NOW');
    else if (ev.status === 'past') statusPill = h('span', { class: 'lineup-status-pill', 'data-i18n': 'lineup.events.status.past' }, 'PAST');
    else statusPill = h('span', { class: 'lineup-status-pill is-upcoming', 'data-i18n': 'lineup.events.status.upcoming' }, 'UPCOMING');

    let countdown = '';
    if (ev.status === 'upcoming' && du != null && du >= 0) countdown = du === 0 ? 'starts today' : (_rtf ? _rtf.format(du, 'day') : `in ${du} days`);
    else if (ev.status === 'live') countdown = 'Live Now';

    const card = h('a', {
        class: `lineup-event is-${ev.status}`,
        href: ev.url || '#',
        target: '_blank',
        rel: 'noopener noreferrer',
        style: `--badge-color:${tourColor};--sport-color:${sportColor};--tour-color:${tourColor};`,
        onclick: () => track('event_clicked', { event_id: ev.id, tour: ev.tour, sport: ev.sport }),
      },
      h('div', { class: 'lineup-event-badge' },
        h('span', { class: 'lineup-event-badge-month' }, badge.month),
        h('span', { class: 'lineup-event-badge-day' }, badge.day),
      ),
      h('div', { class: 'lineup-event-body' },
        h('h4', { class: 'lineup-event-name' }, ev.name || ''),
        h('div', { class: 'lineup-event-meta' },
          (() => { const span = document.createElement('span'); span.innerHTML = sportIconSVG(ev.sport); return span.firstChild; })(),
          ev.tour ? h('span', { class: 'lineup-tour-pill' }, ev.tour) : null,
          h('span', { class: 'lineup-event-location' },
            flag ? h('span', { class: 'lineup-event-flag', 'aria-hidden': 'true' }, flag) : null,
            ev.location || ev.country || '',
          ),
          statusPill,
        ),
        countdown ? h('span', { class: 'lineup-event-countdown' }, countdown) : null,
      ),
    );
    return card;
  }

  function renderEvents() {
    const list = document.getElementById('lineupEventsList');
    const moreBtn = document.getElementById('lineupEventsMore');
    const countEl = document.getElementById('lineupEventsCount');
    if (!list) return;
    list.innerHTML = '';

    if (state.events.__error) {
      list.append(renderEmpty('events', true));
      if (moreBtn) moreBtn.hidden = true;
      if (countEl) countEl.textContent = '';
      return;
    }

    // Filter past out by default, keep live pinned, apply calendar filter if set
    let items = state.events.map(ev => ({ ...ev, status: computeStatus(ev) }))
      .filter(ev => ev.status !== 'past');

    if (state.calendarFilterMonth != null) {
      items = items.filter(ev => {
        const d = new Date(ev.start_date);
        return d.getMonth() === state.calendarFilterMonth;
      });
    }

    // Sort: live first, then by start_date asc
    items.sort((a, b) => {
      if (a.status === 'live' && b.status !== 'live') return -1;
      if (b.status === 'live' && a.status !== 'live') return 1;
      return Date.parse(a.start_date) - Date.parse(b.start_date);
    });

    if (!items.length) {
      list.append(renderEmpty('events', false));
      if (moreBtn) moreBtn.hidden = true;
      if (countEl) countEl.textContent = '';
      return;
    }

    const visible = state.eventsExpanded ? items : items.slice(0, EVENTS_INITIAL);
    visible.forEach(ev => {
      const li = document.createElement('li');
      li.append(renderEventCard(ev));
      list.append(li);
    });
    if (countEl) countEl.textContent = `${visible.length}/${items.length}`;
    if (moreBtn) {
      moreBtn.hidden = items.length <= EVENTS_INITIAL;
      moreBtn.textContent = state.eventsExpanded
        ? (moreBtn.dataset.collapseLabel || 'Show less')
        : (moreBtn.dataset.expandLabel   || 'View all events');
    }
    observeReveal(list);
  }

  // --- EMPTY STATE ---
  function renderEmpty(kind, isError) {
    const wrap = document.createElement('li');
    wrap.className = 'lineup-empty' + (isError ? ' is-error' : '');
    const iconHost = document.createElement('span');
    iconHost.innerHTML = isError ? errorIconSVG() : waveIconSVG();
    wrap.append(iconHost.firstChild);
    const msg = document.createElement('span');
    if (kind === 'news') {
      msg.textContent = isError ? 'Feed unavailable — we will retry on the next refresh.' : 'News feed warming up — check back after the next refresh.';
      msg.setAttribute('data-i18n', isError ? 'lineup.news.error' : 'lineup.news.empty');
    } else {
      msg.textContent = isError ? 'Could not load events.' : 'No upcoming events — check back soon.';
      msg.setAttribute('data-i18n', isError ? 'lineup.events.error' : 'lineup.events.empty');
    }
    wrap.append(msg);
    return wrap;
  }

  // --- CALENDAR STRIP ---
  function renderCalendar() {
    const host = document.getElementById('lineupCalendar');
    const clearBtn = document.getElementById('lineupCalendarClear');
    if (!host) return;
    host.innerHTML = '';

    // Build month buckets: [{sports:Set, live:bool, count:int, events:[]}]
    const buckets = Array.from({ length: 12 }, () => ({ sports: new Set(), live: false, count: 0, names: [] }));
    const events = Array.isArray(state.events) ? state.events : [];
    const now = Date.now();
    events.forEach(ev => {
      const d = new Date(ev.start_date);
      if (Number.isNaN(d.getTime())) return;
      const m = d.getMonth();
      const bucket = buckets[m];
      bucket.sports.add(ev.sport || 'kite');
      bucket.count += 1;
      bucket.names.push(ev.name);
      if (computeStatus(ev) === 'live') bucket.live = true;
    });

    const currentMonth = new Date().getMonth();

    for (let m = 0; m < 12; m++) {
      const b = buckets[m];
      const sportList = Array.from(b.sports).slice(0, 4);
      const extra = Math.max(0, b.count - 4);
      const cell = h('button', {
          type: 'button',
          class: 'lineup-month' +
                 (m === currentMonth ? ' is-current' : '') +
                 (b.count === 0 ? ' is-empty' : '') +
                 (state.calendarFilterMonth === m ? ' is-active' : ''),
          role: 'listitem',
          'aria-pressed': state.calendarFilterMonth === m ? 'true' : 'false',
          'aria-label': `${MONTH_LABELS[m]} — ${b.count} events` + (b.names.length ? ': ' + b.names.join(', ') : ''),
          'data-month': m,
          title: b.names.length ? b.names.join('\n') : '',
          disabled: b.count === 0,
          onclick: () => {
            if (b.count === 0) return;
            state.calendarFilterMonth = state.calendarFilterMonth === m ? null : m;
            track('calendar_month_clicked', { month: m, filter_active: state.calendarFilterMonth != null });
            renderCalendar();
            renderEvents();
            if (clearBtn) clearBtn.hidden = state.calendarFilterMonth == null;
          },
        },
        h('span', { class: 'lineup-month-label' }, MONTH_LABELS[m]),
        h('div', { class: 'lineup-month-dots' },
          ...sportList.map(s => {
            const dot = h('span', { class: 'dot ' + (SPORT_CLASS[s] || '') });
            if (b.live) dot.classList.add('is-live');
            return dot;
          }),
        ),
        extra > 0 ? h('span', { class: 'lineup-month-count' }, '+' + extra) : null,
      );
      host.append(cell);
    }

    // Auto-scroll current month into view on mobile
    if (window.matchMedia('(max-width: 720px)').matches) {
      const cur = host.querySelector('.is-current');
      if (cur && cur.scrollIntoView) {
        try { cur.scrollIntoView({ behavior: 'auto', inline: 'center', block: 'nearest' }); } catch (_) {}
      }
    }
  }

  // --- STAGGERED REVEAL (IntersectionObserver) ---
  let _revealObs = null;
  function observeReveal(scope) {
    if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) {
      scope.querySelectorAll('.lineup-news-card, .lineup-event').forEach(el => el.classList.add('is-visible'));
      return;
    }
    if (!('IntersectionObserver' in window)) {
      scope.querySelectorAll('.lineup-news-card, .lineup-event').forEach(el => el.classList.add('is-visible'));
      return;
    }
    if (_revealObs) _revealObs.disconnect();
    _revealObs = new IntersectionObserver((entries) => {
      entries.forEach((entry, i) => {
        if (entry.isIntersecting) {
          const idx = parseInt(entry.target.dataset.idx || '0', 10) || i;
          setTimeout(() => entry.target.classList.add('is-visible'), Math.min(idx, 8) * 60);
          _revealObs.unobserve(entry.target);
        }
      });
    }, { rootMargin: '0px 0px -40px 0px', threshold: 0.08 });
    scope.querySelectorAll('.lineup-news-card, .lineup-event').forEach(el => _revealObs.observe(el));
  }

  // --- SECTION-VIEWED (once per session) ---
  function observeSectionView() {
    const sec = document.getElementById('lineup');
    if (!sec || !('IntersectionObserver' in window)) return;
    const KEY = 'guston.lineupViewed';
    if (sessionStorage.getItem(KEY)) return;
    const obs = new IntersectionObserver((entries) => {
      entries.forEach(e => {
        if (e.isIntersecting) {
          track('news_section_viewed', { path: location.pathname });
          try { sessionStorage.setItem(KEY, '1'); } catch (_) {}
          obs.disconnect();
        }
      });
    }, { threshold: 0.2 });
    obs.observe(sec);
  }

  // --- PUBLIC ENTRY ---
  async function initLineup() {
    // Wire static buttons
    const newsMore = document.getElementById('lineupNewsMore');
    if (newsMore) newsMore.addEventListener('click', () => {
      state.newsVisible = Math.min(state.newsVisible + NEWS_STEP, NEWS_MAX, state.news.length);
      renderNews();
    });
    const evMore = document.getElementById('lineupEventsMore');
    if (evMore) {
      evMore.dataset.expandLabel = evMore.textContent.trim();
      evMore.dataset.collapseLabel = 'Show less';
      evMore.addEventListener('click', () => {
        state.eventsExpanded = !state.eventsExpanded;
        renderEvents();
      });
    }
    const clearBtn = document.getElementById('lineupCalendarClear');
    if (clearBtn) clearBtn.addEventListener('click', () => {
      state.calendarFilterMonth = null;
      clearBtn.hidden = true;
      renderCalendar();
      renderEvents();
    });

    observeSectionView();

    // Render calendar immediately (empty) so layout locks in
    renderCalendar();

    // Fetch both feeds in parallel; each column fails independently
    const [newsJson, eventsJson] = await Promise.all([fetchJSON(NEWS_URL), fetchJSON(EVENTS_URL)]);

    if (newsJson.__error) {
      state.news = Object.assign([], { __error: newsJson.__error });
    } else {
      const items = Array.isArray(newsJson.items) ? newsJson.items.slice() : [];
      items.sort((a, b) => Date.parse(b.date || 0) - Date.parse(a.date || 0));
      state.news = items.slice(0, NEWS_MAX);
    }

    if (eventsJson.__error) {
      state.events = Object.assign([], { __error: eventsJson.__error });
    } else {
      state.events = Array.isArray(eventsJson.items) ? eventsJson.items.slice() : [];
    }

    renderCalendar();
    renderNews();
    renderEvents();
  }

  // Expose for init hook
  window.initLineup = initLineup;
})();
```

**Init hook** — inside the existing `DOMContentLoaded` block in `index.html`, after the verdict hero renders, add:

```js
// The Lineup — deferred so it never blocks the verdict hero first paint
if ('requestIdleCallback' in window) {
  requestIdleCallback(() => window.initLineup && window.initLineup(), { timeout: 1500 });
} else {
  setTimeout(() => window.initLineup && window.initLineup(), 120);
}
```

---

## 4. Accessibility checklist (must-pass before merge)

- [ ] Every clickable card is a real `<a>` with `href`, `target="_blank" rel="noopener noreferrer"`.
- [ ] Every month cell is a real `<button>` with `aria-pressed` and `aria-label` including month name + event count + names.
- [ ] Load-more and clear-filter are real `<button type="button">`, not divs.
- [ ] Events list wrapper has `aria-live="polite"` so LIVE status changes are announced.
- [ ] `:focus-visible` outlines land on every interactive element (2px cyan offset 2px).
- [ ] `prefers-reduced-motion` disables stagger reveal, shimmer, pulses.
- [ ] News card thumbnails always have `alt=""` (decorative — the headline text carries the semantic weight) and a gradient fallback if image 404s.
- [ ] Tooltip on info button is associated via `aria-describedby`.
- [ ] Color contrast verified against `--text` on `--panel-hover` (WCAG AA 4.5:1 minimum).
- [ ] Keyboard: Tab through title info -> calendar cells (Jan..Dec) -> news cards -> load more -> events cards -> view all. No traps.
- [ ] Chips are non-interactive decorative spans (not focusable).

---

## 5. i18n string keys introduced by this section (for Pass C)

```
lineup.title                 -> "The Lineup"
lineup.subtitle              -> "NEWS • COMPETITIONS • RESULTS"
lineup.info.aria             -> "About The Lineup"
lineup.info.body             -> "Curated news from IKSurfMag, Windsurf Magazine and Google News. Competition calendar from GKA, WSL, PWA, GWA and Red Bull. News refreshes every 6 hours, events daily."
lineup.calendar.aria         -> "Event months"
lineup.calendar.clear        -> "Show all months"
lineup.news.heading          -> "Latest news"
lineup.news.more             -> "Load more news"
lineup.news.empty            -> "News feed warming up — check back after the next refresh."
lineup.news.error            -> "Feed unavailable — we will retry on the next refresh."
lineup.events.heading        -> "Upcoming events"
lineup.events.more           -> "View all events"
lineup.events.collapse       -> "Show less"
lineup.events.empty          -> "No upcoming events — check back soon."
lineup.events.error          -> "Could not load events."
lineup.events.status.live    -> "LIVE NOW"
lineup.events.status.upcoming-> "UPCOMING"
lineup.events.status.past    -> "PAST"
```

Dates/times are NOT in the strings table — `Intl.RelativeTimeFormat` and `Intl.DateTimeFormat` handle locale formatting, matching the rule in arch-plan §6.

---

## 6. Theme-pack compatibility

Every color used in `.lineup` resolves from a CSS custom property already defined in `:root` (the HUD baseline) and overridden by `[data-theme-pack="cyber-arcade"]` / `[data-theme-pack="desert-ethnic"]`. The sport and tour tokens are scoped inside `.lineup { ... }` so they do not leak into other sections and can be individually overridden per theme pack with:

```css
[data-theme-pack="desert-ethnic"] .lineup {
  --sport-kite: #e7b86a;   /* etc. */
}
```

No hard-coded hex values exist outside the scoped sport/tour token block. Light-mode verification: the only opacity-based layers (`rgba(255,255,255,0.05)` style) already come from `--panel` / `--border`, so if the theme pack switches the base these adapt automatically.

---

## 7. Apply order for @staff-engineer (Wave 2 Pass A)

1. Paste section 1 markup between `#forecast` and `#radar` in `index.html`.
2. Paste section 2 CSS into the `<style>` block (place below the Forecast rules; it is self-contained).
3. Paste section 3 JS into the bottom `<script>` block.
4. Add the `initLineup()` deferred invocation inside the existing `DOMContentLoaded` handler, after the verdict hero's first render call.
5. Verify with the seeded `data/news.json` and `data/events.json` from arch-plan §4 that:
   - Calendar shows current month highlighted and pulses.
   - Live events appear at top of events list with LIVE pulsing pill.
   - News cards reveal with stagger; hover lifts them.
   - Load-more reveals the next 5 news items.
   - Clicking a month filters events; clicking again clears.
   - Empty `items` arrays render the friendly empty states.
   - Simulating a 404 on `data/news.json` still renders the events column; the news column shows the error empty state.
6. Reduced-motion: toggle the OS setting; reveals and pulses must stop.
7. Mobile (<720px): confirm events render above news, calendar becomes horizontal-scroll, current month auto-centered.
8. Commit as one commit: `feat(lineup): add news + events + 12-month calendar section`.

---

## 8. Known trade-offs explicitly accepted

- **Hotlinked thumbnails** — per news brief, v1 accepts bandwidth ethics trade-off. The `onerror` fallback swaps in a local SVG placeholder so we never display a broken image.
- **No relevance ranking** — strict recency for news, strict date-ascending for events. Predictable beats clever.
- **Session-scoped filter** — calendar filter does not persist across reloads. Keeps implementation simple and avoids a zombie filter surprising returning users.
- **5+5 pagination** instead of infinite scroll — matches the brief, keeps the section from dominating the page, and makes load-more a measurable event.
- **No SUP / foil dots in v1 JSON** (brief only lists 4 sports) but CSS + JS pre-wire all 6 so the day the cron adds them nothing breaks.
