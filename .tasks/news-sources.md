# News & Events Data Sources — Research Findings

Research date: 2026-04-08. All feed probes executed with WebFetch against live URLs.

---

## Part A — News Sources (RSS/Atom)

Legend: VERIFIED = WebFetch returned 200 + valid XML in this session.

### A1. IKSurfMag — VERIFIED, kite-specific
- Feed: `https://iksurfmag.com/feed/` (WordPress feed, RSS 2.0)
- Fields: `title`, `link`, `guid`, `pubDate`, `dc:creator`, `description`, `content:encoded`, `category`, `media:content`
- Update hints: `sy:updatePeriod=hourly`, `lastBuildDate` current (2026-04-08 17:00)
- Example items: "WORLD RECORD jump would you react the same", "Hendrick Lopez Joins the Ride Engine Squad"
- Quality: high — brand announcements, athlete news, event coverage. Daily cadence.
- License/TOS: standard WordPress feed, no explicit restriction observed; titles + snippets + link-out is standard fair use. Attribute "IKSURFMAG".
- Verdict: BEST kite-specific source. Include by default.

### A2. Windsurf Magazine UK — VERIFIED, windsurf-specific
- Feed: `https://windsurf.co.uk/feed/` (WordPress RSS 2.0)
- Fields: `title`, `link`, `dc:creator`, `pubDate`, `category`, `description`, `content:encoded`, `guid`, `media:content`, `wfw:commentRss`
- Example items: "DUOTONE: BLITZ SLS, BLITZ & X_PACE" (2026-04-08), "QUATRO PYRAMID 6 89L" (2026-04-07)
- Quality: high — gear, PWA coverage, pro features. Daily/near-daily.
- License: WordPress default feed, attribute "Windsurf Magazine".
- Verdict: BEST windsurf source. Include by default.

### A3. Google News RSS (catch-all) — VERIFIED, multi-sport
- Feed pattern: `https://news.google.com/rss/search?q=<query>&hl=en-US&gl=US&ceid=US:en`
- Verified queries:
  - `kitesurfing` — current (2026-04-08)
  - `windsurfing` — current
  - `"wing foil" OR "wingfoil"` — current
  - Recommend also: `"kiteboarding"`, `"big air kite"`, `"surfing competition"`
- Fields: `title`, `link` (Google redirect), `pubDate`, `description` (HTML snippet), `source` (publication name)
- Caveats: links are Google redirects (need to follow or resolve server-side); no images in feed (must fetch `og:image` from target, or skip thumbnails); mix of quality — fatalities, human interest, competition. Needs keyword/source allowlist filtering.
- License: Google News RSS is widely used; titles + snippets + linkout is the intended model. Each item also carries its publisher, so attribution is automatic.
- Verdict: BEST catch-all for coverage breadth. Include by default with de-dup + quality filter.

### A4. Surfer Today — NOT USABLE
- `/feed`, `/xml/news.xml` return 403 (bot block / Cloudflare).
- Published RSS index at `https://www.surfertoday.com/rss-feeds` exists but returns 403 to WebFetch, and their TOS explicitly **prohibits embedding RSS feeds and news stories in websites, blogs, digital magazines or company sites** (per their about/rss-feeds page). **Do not use.**

### A5. Kiteworld Magazine — NOT USABLE
- `https://www.kiteworldmag.com/feed/` fails TLS (ERR_TLS_CERT_ALTNAME_INVALID). `https://kiteworldmag.com/feed/` same. Magazine has been in transitional/final-issue state (see kiteforum thread). **Skip.**

### A6. The Kiteboarder Magazine — NOT USABLE
- `https://www.thekiteboarder.com/feed/` returns a JS redirect to `/lander` (domain parked / migrated). **Skip.**

### A7. Boards Magazine UK — NOT USABLE (dead)
- `https://boards.co.uk/feed/` is a valid RSS feed but the most recent articles are from 2017 (legal/privacy pages newer). Site is effectively dormant. **Skip.**

### A8. Surfline — NOT USABLE via RSS
- `https://www.surfline.com/feed` → 403. `/surf-news` → 403. Historically Surfline had a very limited RSS (North Shore coverage only). No general news feed. **Skip RSS;** could scrape `https://www.surfline.com/surf-news` server-side later if needed, but not in v1.

### A9. Red Bull Surfing/Watersports — NOT VERIFIED
- `https://www.redbull.com/int-en/event-series/red-bull-king-of-the-air` returned 429 (rate limited) on probe. Red Bull historically does not publish a public RSS for editorial. Treat as **event calendar source only** (see B6), not a news feed.

### Other feeds considered
- **Stormrider Surf**, **Magicseaweed** — Magicseaweed is defunct (redirect to Surfline). Stormrider is a guidebook, not news. Skip both.
- **Bing News RSS** — deprecated / unreliable in 2026. Google News RSS is strictly better.

### Summary table

| Source | URL | Focus | Verified | Recommend |
|---|---|---|---|---|
| IKSurfMag | `https://iksurfmag.com/feed/` | Kite | Yes | Default ON |
| Windsurf Mag UK | `https://windsurf.co.uk/feed/` | Windsurf | Yes | Default ON |
| Google News (kitesurfing) | `news.google.com/rss/search?q=kitesurfing&hl=en-US&gl=US&ceid=US:en` | Multi | Yes | Default ON |
| Google News (wing foil) | `news.google.com/rss/search?q=%22wing+foil%22+OR+%22wingfoil%22&hl=en-US&gl=US&ceid=US:en` | Wing | Yes | Default ON (supplement) |
| Google News (windsurfing) | `news.google.com/rss/search?q=windsurfing&...` | Wind | Yes | Optional |
| SurferToday | — | Multi | Blocked + TOS forbids | No |
| Kiteworld / Kiteboarder / Boards | — | Kite/Wind | Broken/dead | No |
| Surfline | — | Surf | Blocked | No (v1) |

---

## Part B — Competition / Events Calendars

No single source offers iCal/RSS/JSON. All need HTML scraping, but structured data is usable on several.

### B1. GKA Kite World Tour — SCRAPE (schema.org JSON-LD present)
- Page: `https://www.gkakiteworldtour.com/events/`
- Format: No iCal/RSS. Page **does** embed `application/ld+json` with `@type=Event` entries — predictable structured data for a server-side scraper.
- 2026 calendar verified live (Cape Verde Feb 16-21, Big Air France Mar 28-Apr 26, Freestyle Mexico May 26-30, Freestyle Germany Jun 3-7, Big Air Greece Jun 15-21, Sylt Aug 25-30, Dakhla Oct 4-11, Hydrofoil Big Air Abu Dhabi Oct 20-25, Freestyle Taiba Oct 28-31)
- Coverage: Kite-Surf, Big Air, Freestyle, Hydrofoil, Wave — all pro kite disciplines globally.
- Scraper strategy: parse JSON-LD first, fall back to the `/events/` cards if missing.
- Verdict: PRIMARY kite events source. INCLUDE.

### B2. WSL World Surf League — SCRAPE via posts page
- Canonical schedule page: `https://www.worldsurfleague.com/events/2026/ct` (SPA — WebFetch returns mostly CSS/JS shell, body is client-rendered; not usable as-is).
- Workable fallback: the **annual schedule post** — `https://www.worldsurfleague.com/posts/546281/2026-championship-tour-schedule-and-formats`. This is server-rendered HTML with the full CT calendar as text; publish once per year, easy to scrape.
- 2026 CT: 12 events over 9 months / 9 countries. Confirmed stops include Bells Beach (Apr 1-11), Margaret River (Apr 17-27), Surf Abu Dhabi (Oct 14-18), Peniche (Oct 22-Nov 1), Pipeline (Dec 8-20).
- Coverage: CT (primary). Challenger Series / Longboard / Big Wave have parallel post pages each season.
- Scraper strategy: annual post → parse bulleted schedule via regex of date-location lines. Rebuild once at season launch; refresh status/URL weekly.
- Verdict: PRIMARY surf events source. INCLUDE.

### B3. PWA World Tour — SCRAPE (news-detail pages)
- Page: `https://www.pwaworldtour.com/index.php?id=2365` (2026 calendar). Probe returned 429 in this session but page is publicly accessible; scraper should use backoff + realistic UA.
- Canonical schedule post: `https://www.pwaworldtour.com/index.php?id=35&tx_news_pi1[news]=8244` (2026 PWA World Tour Calendar).
- 2026 events confirmed via mirror sources (Windsurf Mag, surf-magazin.de): Maui Pro (Mar 30-Apr 4), Tenerife Wave & Slalom (Jul 31-Aug 9), Sylt (Sep 25-Oct 4), Aloha Classic (Oct 19-30), Chile Grand Final (Nov 14-29), plus Gran Canaria TBC.
- Verdict: PRIMARY windsurf events source. INCLUDE. Fallback: scrape `https://www.windsurf.co.uk/pwa-2026-tour-calendar/` which republishes the same calendar in cleaner HTML.

### B4. GWA Wingfoil World Tour — SCRAPE
- Page: `https://www.wingfoilworldtour.com/events/` (note: `gwawingtour.com` does NOT resolve; correct domain is `wingfoilworldtour.com`).
- Structured data: page has JSON-LD for the CollectionPage but not per-event Event markup. Event cards have predictable DOM (title, date range, discipline, TBC flag). Scrapable.
- 2026 verified: Düsseldorf Jan 16-18 (finished), Leucate Apr 21-26, Tarifa Jun 24-27, Lanzarote Jul 1-4, Gran Canaria Jul 21-25, Fuerteventura Jul 27-Aug 1, Abu Dhabi Oct 20-25, Ibiraquera Nov 5-13, Taiba Nov 16-22, Jericoacoara Dec 7-10.
- Coverage: Surf-Freestyle (8 stops), FreeFly-Slalom (3), Wave (1).
- Verdict: PRIMARY wing events source. INCLUDE.

### B5. IKA / Formula Kite — SECONDARY
- `internationalkiteboarding.org/events/` — blocked on WebFetch (403) but publicly accessible in-browser. Covers Formula Kite (Olympic), Youth, TwinTip. Less flashy than GKA but needed for Olympic year coverage. Optional v2.

### B6. Red Bull King of the Air & series events — MANUAL/EDITORIAL
- No programmatic feed for event series; dates change yearly (KOTA window Jan-Feb in Cape Town). Best approach: a small **hand-curated `data/events-manual.json`** checked into the repo with Red Bull events (KOTA, Megaloop, Cape Classic, Cold Hawaii) — 5-10 entries per year, updated by hand. The GKA Big Air page also redundantly tracks KOTA when it's a tour stop.
- Verdict: manual list, merged into main `events.json` by the pipeline.

### B7. Aggregators — NONE USABLE
- Searched `ocean sports calendar`, `kitesurfing competition calendar 2026`, `watersports events aggregator`. No single aggregator exists. Feedspot lists kiteboarding RSS feeds but not events. sportscalendar.com / sportstravel.com do not cover watersports pro tours. Eventbrite is amateur-local. Public Google Calendars for kitesurfing events are hobbyist and stale. **Conclusion: build the aggregator ourselves from the 4 tour sources above + manual Red Bull list.**

### Summary table

| Source | Page | Format | Sports | Include |
|---|---|---|---|---|
| GKA | `gkakiteworldtour.com/events/` | JSON-LD + HTML | Kite (all disciplines) | Yes |
| WSL | `worldsurfleague.com/posts/546281/...` | HTML post | Surf (CT) | Yes |
| PWA | `pwaworldtour.com/index.php?id=2365` | HTML | Windsurf | Yes |
| GWA | `wingfoilworldtour.com/events/` | HTML (DOM) | Wing foil | Yes |
| Red Bull KOTA + series | n/a | Manual JSON | Kite big air | Yes (manual) |
| IKA | `internationalkiteboarding.org/events/` | HTML | Formula Kite / Olympic | v2 |

---

## Part C — Recommendations

### C1. Top 3 news feeds (default ON)

1. **IKSurfMag** — `https://iksurfmag.com/feed/` — covers kite deeply, hourly updates, rich metadata including images. Tag all items `kite`.
2. **Windsurf Magazine UK** — `https://windsurf.co.uk/feed/` — covers windsurf + PWA tour news + gear. Tag `wind`.
3. **Google News RSS (multi-query union)** — run 3 queries: `kitesurfing`, `windsurfing`, `"wing foil" OR wingfoil`. De-dup by normalized title. Auto-tag by query source. Broad coverage + Surf is picked up via general news hits. Gives us `wing` coverage which no dedicated RSS provides in 2026.

### C2. Top 3 event sources (scrapers)

1. **GKA** (JSON-LD, cleanest) — all kite disciplines.
2. **WSL** annual schedule post (`/posts/546281/...`) — plain HTML, stable for the season.
3. **PWA** (`id=2365`) — windsurf, fallback to Windsurf Mag mirror if 429.

Plus: **GWA** (`wingfoilworldtour.com/events/`) as 4th — wing is rising; include from day one. And **manual Red Bull list** for KOTA-class events.

### C3. Data pipeline

```
GitHub Action (cron: every 6h for news, every 24h for events)
  ├─ scripts/fetch_news.mjs
  │    ├─ fetch IKSurfMag, Windsurf, Google News × N queries (parallel, 10s timeout each)
  │    ├─ parse RSS (fast-xml-parser or rss-parser)
  │    ├─ normalize → {id, source, title, snippet, url, date, image, tags[]}
  │    ├─ resolve Google News redirects to publisher URLs
  │    ├─ de-dup by normalized-title hash + url host
  │    ├─ sort desc by date, cap at 100 items, 14-day window
  │    └─ write data/news.json
  ├─ scripts/fetch_events.mjs
  │    ├─ scrape GKA (parse JSON-LD), WSL post, PWA page, GWA DOM
  │    ├─ merge data/events-manual.json (Red Bull, one-offs)
  │    ├─ compute status from start/end vs now: upcoming | live | past
  │    ├─ sort by start_date, drop events >60 days past
  │    └─ write data/events.json
  └─ git commit + push (only if file hash changed)
Frontend: static fetch of /data/news.json and /data/events.json at page load.
```

Why commit-to-repo rather than serverless KV: free, cacheable via CDN, full history in git, zero-runtime on the frontend, works on GitHub Pages. This mirrors the existing Guston architecture.

### C4. JSON schemas

**`data/news.json`**
```jsonc
{
  "generated_at": "2026-04-08T17:00:00Z",
  "sources": [
    {"id": "iksurfmag", "name": "IKSURFMAG", "ok": true, "fetched_at": "...", "item_count": 10},
    {"id": "windsurf-uk", "name": "Windsurf Magazine", "ok": true, "...": "..."},
    {"id": "gnews-kite", "name": "Google News: kitesurfing", "ok": true, "...": "..."}
  ],
  "items": [
    {
      "id": "sha1(url)",
      "source": "iksurfmag",
      "source_name": "IKSURFMAG",
      "title": "Hendrick Lopez Joins the Ride Engine Squad",
      "snippet": "Plain-text first ~240 chars of description, HTML stripped",
      "url": "https://iksurfmag.com/...",
      "date": "2026-04-08T14:00:41Z",
      "image": "https://...jpg",   // nullable
      "tags": ["kite"]              // ['kite'|'wind'|'wing'|'surf'], 1..n
    }
  ]
}
```

**`data/events.json`**
```jsonc
{
  "generated_at": "2026-04-08T17:00:00Z",
  "sources": [
    {"id": "gka", "ok": true, "fetched_at": "...", "event_count": 9},
    {"id": "wsl", "ok": true, "...": "..."},
    {"id": "pwa", "ok": true, "...": "..."},
    {"id": "gwa", "ok": true, "...": "..."},
    {"id": "manual", "ok": true, "...": "..."}
  ],
  "items": [
    {
      "id": "gka-big-air-greece-2026",
      "name": "GKA Big Air Kite World Cup Greece",
      "tour": "GKA",                 // 'GKA'|'WSL'|'PWA'|'GWA'|'RedBull'|'IKA'
      "discipline": "big-air",       // tour-specific string
      "sport": "kite",               // 'kite'|'wind'|'wing'|'surf'
      "start_date": "2026-06-15",
      "end_date": "2026-06-21",
      "location": "Kos",             // nullable
      "country": "GR",               // ISO-3166 alpha-2, nullable
      "url": "https://www.gkakiteworldtour.com/events/...",
      "status": "upcoming",          // 'upcoming'|'live'|'past'
      "tbc": false
    }
  ]
}
```

### C5. Failure modes

- **Feed returns 4xx/5xx or timeout:** log into `sources[].ok=false`, keep previous items for that source from last successful run (cached in repo), continue pipeline. Never let one broken feed nuke the whole file.
- **Feed returns malformed XML:** wrap parser in try/catch, treat same as failure.
- **Scraper DOM changes (WSL/PWA/GWA):** use resilient selectors (look for date-range regex + proper-noun location patterns rather than brittle CSS classes). Add a schema assertion — if extracted count drops >50% vs previous run, mark source failed and keep previous data. Alert via GitHub Action failure email.
- **All events/news stale >48h:** frontend shows a small "Last updated: X hours ago" badge; if >48h render a subtle "Data may be stale" notice. Section still renders, never 500s.
- **Empty `items` array:** UI shows a friendly "No recent news" / "Season calendar coming soon" empty state, not a broken skeleton.
- **Google News redirect resolution fails:** keep the Google URL — clicks still work, just lose publisher attribution styling.
- **Image missing:** UI falls back to a sport-tagged gradient placeholder (kite=cyan, wind=blue, wing=teal, surf=indigo). Never broken-img icon.

### C6. Ethical / legal

- **Titles + short snippet (≤280 chars) + canonical link-out** is well-established fair use for news aggregation (Google News, Flipboard, Feedly model). Always display **source name prominently** and **link directly to the original article** — never reader-mode / full-text republish.
- **Hotlinking thumbnails:** technically allowed by most publishers' TOS but bandwidth-rude and fragile (referer blocks, hotlink protection). Recommended: at build time, download and re-host thumbnails under `/data/thumbs/<sha>.jpg`, max 600px wide, JPEG 75. Keeps UI fast and polite. Alternatively proxy via a small Cloudflare Worker cache.
- **Attribution:** every card must render `<publisher>` line (e.g. "IKSURFMAG", "The Guardian via Google News"). Add a small "Sources" footer linking to each feed's home page.
- **robots.txt / rate limits for scrapers (GKA/WSL/PWA/GWA):** fetch once per 24h max, single request per page, set `User-Agent: Guston/1.0 (+https://<site>)`, respect robots.txt, back off on 429.
- **Explicit block:** **SurferToday — do NOT include.** Their published TOS forbids embedding their feeds on other sites. Honor it.
- **GDPR / cookies:** linking out does not set cookies on our site; no consent banner needed for this feature.
- **Takedown:** add a `data/news-blocklist.json` (url patterns) and `data/events-blocklist.json` so a publisher complaint can be honored in a single-commit fix.

---

## Appendix — Verified URLs quick reference

News (all 200 OK verified this session):
- `https://iksurfmag.com/feed/`
- `https://windsurf.co.uk/feed/`
- `https://news.google.com/rss/search?q=kitesurfing&hl=en-US&gl=US&ceid=US:en`
- `https://news.google.com/rss/search?q=windsurfing&hl=en-US&gl=US&ceid=US:en`
- `https://news.google.com/rss/search?q=%22wing+foil%22+OR+%22wingfoil%22&hl=en-US&gl=US&ceid=US:en`

Events (pages verified or confirmed via cross-source):
- `https://www.gkakiteworldtour.com/events/`
- `https://www.worldsurfleague.com/posts/546281/2026-championship-tour-schedule-and-formats`
- `https://www.pwaworldtour.com/index.php?id=2365`
- `https://www.wingfoilworldtour.com/events/`
