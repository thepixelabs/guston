# Guston data pipeline scripts

Two Node scripts, run on cron by GitHub Actions, that fetch news and event
calendars and commit normalized JSON into `data/` for the static frontend.

## Layout

```
scripts/
├── package.json        # rss-parser + cheerio
├── fetch-news.mjs      # RSS aggregator  -> data/news.json
├── fetch-events.mjs    # HTML scrapers   -> data/events.json
└── README.md
```

Workflows: `.github/workflows/fetch-news.yml` (every 6h) and
`.github/workflows/fetch-events.yml` (daily 06:00 UTC). Both auto-commit back
to `main` with `[skip ci]` via `stefanzweifel/git-auto-commit-action`.

## Run locally

```sh
cd scripts
npm install
node fetch-news.mjs
node fetch-events.mjs
```

Both write into `../data/`. Safe to run repeatedly — output is deterministic
for a given input set and atomically overwrites the previous file.

## Add a new news feed

Edit the `FEEDS` array near the top of `fetch-news.mjs`:

```js
{
  id: 'my_source',           // unique, used in source_status
  name: 'My Source',          // display name
  url: 'https://example.com/feed/',
  tags: ['kite'],             // any of: kite | wind | wing | surf
},
```

That's it — nothing else to wire. Failures for the new feed are isolated and
recorded in `data/news.json -> source_status.my_source`.

## Add a manual event

Edit `data/events-manual.json`. Minimum fields:

```json
{
  "id": "unique-slug-2026",
  "name": "Event Name",
  "tour": "RB",
  "sport": "kite",
  "start_date": "2026-06-01",
  "end_date": "2026-06-07",
  "location": "City, Region",
  "country": "ZA",
  "url": "https://..."
}
```

Manual entries with `tour: RB` or `tour: USER` are merged on top of scraped
data and are never overwritten by scrapers.

## Selector drift — when a scraper breaks

The news pipeline uses RSS and is stable. The events pipeline scrapes HTML and
will break when tour sites redesign. Symptoms: `source_status.<id>` flips to
`failed`, or the scraper returns 0 items and the previous run's items are
reused as fallback.

Debug steps:

1. Run the script locally and watch stdout:
   `node fetch-events.mjs` — each scraper logs count + duration.
2. Open the source URL in a browser and view-source. Compare to the selectors
   in `fetch-events.mjs`:
   - **GKA** — `scrapeGKA()` prefers JSON-LD `<script type="application/ld+json">`
     with `@type: Event`. If GKA removes JSON-LD, the fallback card selector
     (`.event, .events-item, article`) picks up the slack. Update if neither
     matches.
   - **WSL** — `scrapeWSL()` is text-regex based against the annual post.
     When a new season post is published, update `SOURCES.wsl` to the new
     `/posts/<id>/...` URL. Look for the canonical schedule post on
     worldsurfleague.com.
   - **PWA** — `scrapePWA()` scans `article, .news-list-item, li, tr` for
     date-range patterns. If the calendar page ID changes, update
     `SOURCES.pwa`.
   - **GWA** — `scrapeGWA()` walks event cards. If wingfoilworldtour.com
     changes its DOM, tweak the selector list.
3. Test the regex parser with a problematic date string:
   `node -e "import('./fetch-events.mjs')"` — or copy `parseDateRange` into a
   REPL.
4. The pipeline will preserve the previous `data/events.json` for any source
   that fails, so the site never shows an empty calendar — you have time to
   fix the scraper.

## Resilience contract

- Individual feed/scraper failure: logged, recorded in `source_status`,
  previous items for that source are reused.
- Total failure: previous full file is preserved with only `generated_at`
  bumped.
- Top-level fatal error: caught, previous file preserved, `process.exit(0)`
  so the workflow does not mark the run red for a transient network blip.
  Check logs daily in the Actions tab for sustained failures.

## Known risks

- **Google News links** are redirect URLs (`news.google.com/rss/articles/...`).
  We keep them as-is; clicks still land on the publisher. Resolving them
  would require following redirects for every item on every run — slow and
  rate-limit-prone.
- **Scraper selectors** for WSL/PWA/GWA are heuristic. Expect to touch them
  once or twice per season.
- **PWA 429**: the PWA site rate-limits. The scraper uses a single GET with a
  descriptive User-Agent; if this stops working, switch `SOURCES.pwa` to the
  Windsurf Magazine mirror.
