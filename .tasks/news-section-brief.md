# News & Events Section — Product Brief

**Author:** @product-growth-engineer
**Scope:** UX/IA only. Data sources handled in parallel by research agent.

---

## 1. Placement

**Recommendation: Between Forecast and Rain Radar, as a dedicated full-width section.**

Primary user intent is "should I kite right now?" — the hero, conditions, wind analysis, cameras, and forecast all serve that. News/events are **ambient, motivational content**: a scroll reward, not a decision input. Placing it:

- **Not above cameras** — cameras are decision-critical, don't push them down.
- **Not at the very bottom (below radar)** — radar is the final "am I going?" gut check; news breaks that flow.
- **Between forecast and radar** — forecast is the last data section; news is a natural "you've made your decision, now dream a little" moment before radar closes the loop.

Collapsed-by-default drawer rejected: hides the feature from 90% of users, kills discovery, and events deserve visibility.

## 2. Layout

**Desktop (>=1024px):** CSS grid, `grid-template-columns: minmax(0, 1.85fr) minmax(0, 1fr)` (~65/35). 24px gap. News left, Events right. Both columns independently scrollable if content exceeds 720px max-height (prevents the section from dominating the page).

**Tablet (640–1023px):** Same 2-col grid, `1.5fr / 1fr`. Reduce card padding.

**Mobile (<640px):** **Stack, not tabs.** Events FIRST (smaller, more scannable, motivational hook), news second. Tabs add a click and hide half the content from analytics. Stacking is cheaper and better for SEO.

Section uses existing `--card-clip` polygon and `--panel` background to match the HUD aesthetic.

## 3. News Card Schema & Display

```json
{
  "id": "sha1(url)",
  "title": "string (max 120 chars)",
  "snippet": "string (max 200 chars)",
  "url": "https://...",
  "source": "Kiteworld Mag",
  "source_favicon": "https://.../favicon.ico",
  "image": "https://... | null",
  "published_at": "ISO8601",
  "sport_tags": ["kite"],
  "content_hash": "sha1(title+source)"
}
```

**Display rules:**
- Layout: 96px square thumbnail left, content right (mobile: 72px).
- Title: 2 lines max, `text-overflow: ellipsis`, `-webkit-line-clamp: 2`.
- Snippet: 2 lines max on desktop, hidden on mobile to reduce clutter.
- Meta row: source favicon (16px) + source name (mono, `--subtle`) + "·" + relative date via `Intl.RelativeTimeFormat`.
- Image fallback: if `image` missing or 404s (onerror), show source favicon centered on `--panel-hover` square.
- Whole card clickable, `target="_blank" rel="noopener"`.
- **Show 6 by default**, "Show more" button reveals up to 15 total. No infinite scroll.
- **Ordering:** newest first. No relevance weighting in v1 — keep it predictable.
- **Dedup:** key on normalized URL (strip UTM/query), fallback to lowercased title + source tuple. Handled in the cron, not the client.

## 4. Event Card Schema & Display

```json
{
  "id": "kota-2026",
  "name": "Red Bull King of the Air",
  "start_date": "2026-02-03",
  "end_date": "2026-02-14",
  "location": "Cape Town, ZA",
  "country_code": "ZA",
  "tour": "Red Bull",
  "sport": "kite",
  "url": "https://...",
  "status": "upcoming" // computed client-side
}
```

**Display rules:**
- Vertical timeline, 8 events max visible, scrollable beyond.
- Left: date badge (mono, stacked day/month, e.g. "03\nFEB").
- Right: name (bold) / tour badge pill + sport emoji / location with flag emoji / "in 12 days" countdown OR pulsing `LIVE` pill (using `--good`) when `now` is between start/end.
- **Status logic (client-side, no backend needed):**
  - `past`: end_date < today → hide entirely.
  - `live`: start <= today <= end → pin to top with LIVE pill.
  - `upcoming`: sort by start_date asc.
- Tour badges use existing pill style with tour-specific accent colors (GKA cyan, WSL blue, PWA purple, Red Bull red).
- Click → external site, new tab.

## 5. Empty & Failure States

- **News JSON missing/stale (>48h):** keep section visible, show `NEWS TEMPORARILY UNAVAILABLE` mono label in column. Never hide.
- **Events JSON empty:** "No major competitions scheduled — check back soon."
- **Partial feed failure:** cron commits what it got; a stale-per-source timestamp is fine but not user-visible in v1.
- **Image 404:** onerror → favicon fallback (above).
- Section NEVER collapses the whole UI on error — each column fails independently.

## 6. Title & Icon

**Title: "The Lineup"** — kite/surf native vocabulary (a "lineup" is where surfers wait for waves; doubles as "what's lined up on the calendar"). Beats generic "News & Events". Subtitle in mono: `NEWS • COMPETITIONS • RESULTS`.

**Icon:** minimal SVG — a stylized trophy silhouette with a wave baseline underneath. Single-stroke, 24px, `currentColor`. Captures both columns in one glyph. Reject newspaper (too news-heavy) and calendar (boring).

## 7. Shipping Priority

**v1 (ship this week):**
- Placement between forecast and radar
- Static 2-col desktop / stacked mobile layout
- News cards (6 visible, show-more to 15), newest-first
- Event cards (upcoming + live, past hidden)
- Empty/failure states
- Instrumentation: `news_section_viewed` (IntersectionObserver, once/session), `news_article_clicked {source, title}`, `event_clicked {event_id, tour}`
- GitHub Action cron: news 6h, events daily
- Dedup by normalized URL in cron

**v2 (defer, only if data shows need):**
- Sport/region filters + localStorage persistence — only ship if `news_section_viewed` / session > 30% AND users request it
- Relevance ranking beyond recency
- Image caching/proxying (hot-link in v1, accept the bandwidth ethics trade-off)
- ARIA live region for LIVE events (too noisy)
- Tabs on mobile

**Success criteria (define before merge):**
- Primary: `news_section_viewed` rate >= 25% of sessions within 2 weeks (proves scroll depth reaches it).
- Secondary: CTR on news+event cards combined >= 3% of viewers (proves content is interesting).
- Guard rail: camera/forecast click-through must not drop >5% (proves we didn't cannibalize decision content).
- Kill criteria: if viewed rate <15% after 3 weeks, move section above cameras OR cut it. No zombie features.
