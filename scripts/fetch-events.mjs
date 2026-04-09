#!/usr/bin/env node
/**
 * fetch-events.mjs — Guston event calendar aggregator
 *
 * Scrapes 4 pro-tour websites (GKA kite, WSL surf, PWA windsurf, GWA wing)
 * and merges a hand-curated data/events-manual.json list (Red Bull + friends).
 * Writes data/events.json.
 *
 * Resilience:
 *  - Each scraper is wrapped in try/catch; failures mark source_status[...]='failed'
 *    and fall back to previous successful items for that source.
 *  - If ALL scrapers fail AND manual list is empty, previous events.json is preserved.
 *  - Selector drift is expected over time — see README.md for troubleshooting.
 *
 * Run locally:
 *   cd scripts && npm install && node fetch-events.mjs
 */

import { readFileSync, writeFileSync, existsSync, mkdirSync } from 'node:fs';
import { dirname, resolve } from 'node:path';
import { fileURLToPath } from 'node:url';

import * as cheerio from 'cheerio';

const __dirname = dirname(fileURLToPath(import.meta.url));
const REPO_ROOT = resolve(__dirname, '..');
const OUT_PATH = resolve(REPO_ROOT, 'data/events.json');
const MANUAL_PATH = resolve(REPO_ROOT, 'data/events-manual.json');

const FETCH_TIMEOUT_MS = 20_000;
const USER_AGENT = 'Guston/1.0 (+https://guston.surf) events-fetcher';

const SOURCES = {
  gka: 'https://www.gkakiteworldtour.com/events/',
  wsl: 'https://www.worldsurfleague.com/posts/546281/2026-championship-tour-schedule-and-formats',
  pwa: 'https://www.pwaworldtour.com/index.php?id=2365',
  gwa: 'https://www.wingfoilworldtour.com/events/',
};

// ---------- helpers ----------

async function fetchHtml(url) {
  const ctl = new AbortController();
  const t = setTimeout(() => ctl.abort(), FETCH_TIMEOUT_MS);
  try {
    const res = await fetch(url, {
      signal: ctl.signal,
      headers: {
        'User-Agent': USER_AGENT,
        Accept: 'text/html,application/xhtml+xml,application/xml;q=0.9,*/*;q=0.8',
        'Accept-Language': 'en-US,en;q=0.9',
      },
      redirect: 'follow',
    });
    if (!res.ok) throw new Error(`HTTP ${res.status}`);
    return await res.text();
  } finally {
    clearTimeout(t);
  }
}

function slugify(s) {
  return String(s || '')
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-+|-+$/g, '')
    .slice(0, 80);
}

function isoDate(d) {
  if (!d) return null;
  const dt = d instanceof Date ? d : new Date(d);
  if (Number.isNaN(dt.getTime())) return null;
  return dt.toISOString().slice(0, 10);
}

function computeStatus(startDate, endDate) {
  const today = new Date().toISOString().slice(0, 10);
  if (!startDate) return 'upcoming';
  const end = endDate || startDate;
  if (today < startDate) return 'upcoming';
  if (today > end) return 'past';
  return 'live';
}

const COUNTRY_MAP = {
  'cape verde': 'CV', 'france': 'FR', 'mexico': 'MX', 'germany': 'DE',
  'greece': 'GR', 'germany (sylt)': 'DE', 'sylt': 'DE', 'dakhla': 'MA',
  'morocco': 'MA', 'abu dhabi': 'AE', 'uae': 'AE', 'brazil': 'BR',
  'taiba': 'BR', 'portugal': 'PT', 'spain': 'ES', 'italy': 'IT',
  'south africa': 'ZA', 'australia': 'AU', 'usa': 'US', 'united states': 'US',
  'hawaii': 'US', 'pipeline': 'US', 'fiji': 'FJ', 'tahiti': 'PF',
  'el salvador': 'SV', 'indonesia': 'ID', 'chile': 'CL', 'peru': 'PE',
  'japan': 'JP', 'canary islands': 'ES', 'tenerife': 'ES', 'gran canaria': 'ES',
  'lanzarote': 'ES', 'fuerteventura': 'ES', 'ibiraquera': 'BR',
  'jericoacoara': 'BR', 'tarifa': 'ES', 'leucate': 'FR', 'maui': 'US',
};
function guessCountry(location) {
  if (!location) return null;
  const lc = location.toLowerCase();
  for (const [k, v] of Object.entries(COUNTRY_MAP)) {
    if (lc.includes(k)) return v;
  }
  const tail = location.split(',').pop()?.trim().toLowerCase();
  if (tail && COUNTRY_MAP[tail]) return COUNTRY_MAP[tail];
  return null;
}

// Parse a date-range string like "Feb 16-21, 2026" / "28 March - 26 April 2026"
// Returns { start, end } as YYYY-MM-DD or nulls.
function parseDateRange(str, fallbackYear) {
  if (!str) return { start: null, end: null };
  const year = (str.match(/\b(20\d{2})\b/) || [])[1] || fallbackYear || new Date().getFullYear();
  const monthNames = {
    jan: 0, january: 0, feb: 1, february: 1, mar: 2, march: 2, apr: 3, april: 3,
    may: 4, jun: 5, june: 5, jul: 6, july: 6, aug: 7, august: 7,
    sep: 8, sept: 8, september: 8, oct: 9, october: 9, nov: 10, november: 10,
    dec: 11, december: 11,
  };
  // Pattern A: "Month DD-DD[, YYYY]"
  let m = str.match(/([A-Za-z]{3,9})\s+(\d{1,2})\s*[-–—]\s*(\d{1,2})/);
  if (m) {
    const mo = monthNames[m[1].toLowerCase()];
    if (mo !== undefined) {
      return {
        start: isoDate(new Date(Date.UTC(+year, mo, +m[2]))),
        end: isoDate(new Date(Date.UTC(+year, mo, +m[3]))),
      };
    }
  }
  // Pattern B: "DD Month - DD Month [YYYY]" (cross-month)
  m = str.match(/(\d{1,2})\s+([A-Za-z]{3,9})\s*[-–—]\s*(\d{1,2})\s+([A-Za-z]{3,9})/);
  if (m) {
    const mo1 = monthNames[m[2].toLowerCase()];
    const mo2 = monthNames[m[4].toLowerCase()];
    if (mo1 !== undefined && mo2 !== undefined) {
      return {
        start: isoDate(new Date(Date.UTC(+year, mo1, +m[1]))),
        end: isoDate(new Date(Date.UTC(+year, mo2, +m[3]))),
      };
    }
  }
  // Pattern C: "Month DD - Month DD[, YYYY]"
  m = str.match(/([A-Za-z]{3,9})\s+(\d{1,2})\s*[-–—]\s*([A-Za-z]{3,9})\s+(\d{1,2})/);
  if (m) {
    const mo1 = monthNames[m[1].toLowerCase()];
    const mo2 = monthNames[m[3].toLowerCase()];
    if (mo1 !== undefined && mo2 !== undefined) {
      return {
        start: isoDate(new Date(Date.UTC(+year, mo1, +m[2]))),
        end: isoDate(new Date(Date.UTC(+year, mo2, +m[4]))),
      };
    }
  }
  // Pattern D: single date "Month DD[, YYYY]"
  m = str.match(/([A-Za-z]{3,9})\s+(\d{1,2})/);
  if (m) {
    const mo = monthNames[m[1].toLowerCase()];
    if (mo !== undefined) {
      const d = isoDate(new Date(Date.UTC(+year, mo, +m[2])));
      return { start: d, end: d };
    }
  }
  return { start: null, end: null };
}

function kiteSportFromName(name) {
  const n = (name || '').toLowerCase();
  if (n.includes('hydrofoil') || n.includes('formula kite')) return 'foil';
  return 'kite';
}

// ---------- scrapers ----------

async function scrapeGKA() {
  const html = await fetchHtml(SOURCES.gka);
  const $ = cheerio.load(html);
  const events = [];

  // Prefer JSON-LD
  $('script[type="application/ld+json"]').each((_, el) => {
    const raw = $(el).contents().text();
    if (!raw) return;
    let data;
    try { data = JSON.parse(raw); } catch { return; }
    const list = Array.isArray(data) ? data : data['@graph'] || [data];
    for (const node of list) {
      if (!node || typeof node !== 'object') continue;
      const type = node['@type'];
      const types = Array.isArray(type) ? type : [type];
      if (!types.some((t) => String(t).toLowerCase().includes('event'))) continue;
      const name = node.name;
      if (!name) continue;
      const start = isoDate(node.startDate);
      const end = isoDate(node.endDate || node.startDate);
      const locNode = node.location || {};
      const location = locNode.name || locNode.address?.addressLocality || null;
      const country =
        locNode.address?.addressCountry ||
        guessCountry(location || name) ||
        null;
      const url = node.url || SOURCES.gka;
      events.push({
        id: `gka-${slugify(name)}`,
        name,
        tour: 'GKA',
        sport: kiteSportFromName(name),
        start_date: start,
        end_date: end,
        location,
        country: typeof country === 'string' ? country : country?.name || null,
        url,
      });
    }
  });

  if (events.length === 0) {
    // Fallback: scan event cards — selectors are best-effort.
    $('.event, .events-item, article').each((_, el) => {
      const name = $(el).find('h2, h3, .event-title').first().text().trim();
      if (!name) return;
      const dateText = $(el).find('.event-date, time, .date').first().text().trim();
      const location = $(el).find('.event-location, .location').first().text().trim() || null;
      const { start, end } = parseDateRange(dateText, 2026);
      const link = $(el).find('a').first().attr('href') || SOURCES.gka;
      events.push({
        id: `gka-${slugify(name)}`,
        name,
        tour: 'GKA',
        sport: kiteSportFromName(name),
        start_date: start,
        end_date: end,
        location,
        country: guessCountry(location || name),
        url: link.startsWith('http') ? link : new URL(link, SOURCES.gka).toString(),
      });
    });
  }

  return events;
}

async function scrapeWSL() {
  const html = await fetchHtml(SOURCES.wsl);
  const $ = cheerio.load(html);
  const events = [];
  const text = $('article, .post, main, body').first().text();

  // Look for lines like "Event Name — Mar 1-10" / "Month DD-DD, YYYY: Location"
  const lines = text.split('\n').map((l) => l.trim()).filter(Boolean);
  const dateRe = /([A-Za-z]{3,9}\s+\d{1,2}\s*[-–—]\s*(?:[A-Za-z]{3,9}\s+)?\d{1,2})/;
  for (const line of lines) {
    const dm = line.match(dateRe);
    if (!dm) continue;
    if (line.length > 240) continue;
    const { start, end } = parseDateRange(dm[1], 2026);
    if (!start) continue;
    // Heuristic: name is everything that isn't the date, cleaned
    let name = line.replace(dm[1], '').replace(/[:,\-–—]+/g, ' ').replace(/\s+/g, ' ').trim();
    if (name.length < 3) continue;
    // Drop extremely generic lines
    if (/^(schedule|format|championship tour)$/i.test(name)) continue;
    events.push({
      id: `wsl-${slugify(name)}`,
      name: name.length > 100 ? name.slice(0, 100) : name,
      tour: 'WSL',
      sport: 'surf',
      start_date: start,
      end_date: end,
      location: null,
      country: guessCountry(name),
      url: SOURCES.wsl,
    });
  }
  // De-dupe by id
  const seen = new Set();
  return events.filter((e) => (seen.has(e.id) ? false : (seen.add(e.id), true)));
}

async function scrapePWA() {
  const html = await fetchHtml(SOURCES.pwa);
  const $ = cheerio.load(html);
  const events = [];

  // PWA typoscript output varies; scan news articles and list items with a date.
  $('article, .news-list-item, li, tr').each((_, el) => {
    const txt = $(el).text().replace(/\s+/g, ' ').trim();
    if (!txt || txt.length > 400) return;
    const dm = txt.match(/([A-Za-z]{3,9}\s+\d{1,2}\s*[-–—]\s*(?:[A-Za-z]{3,9}\s+)?\d{1,2})/);
    if (!dm) return;
    const { start, end } = parseDateRange(dm[1], 2026);
    if (!start) return;
    const name = txt.replace(dm[1], '').replace(/\s+/g, ' ').trim().slice(0, 120);
    if (name.length < 3) return;
    const href = $(el).find('a').first().attr('href');
    events.push({
      id: `pwa-${slugify(name)}`,
      name,
      tour: 'PWA',
      sport: 'wind',
      start_date: start,
      end_date: end,
      location: null,
      country: guessCountry(name),
      url: href
        ? href.startsWith('http')
          ? href
          : new URL(href, SOURCES.pwa).toString()
        : SOURCES.pwa,
    });
  });

  const seen = new Set();
  return events.filter((e) => (seen.has(e.id) ? false : (seen.add(e.id), true)));
}

async function scrapeGWA() {
  const html = await fetchHtml(SOURCES.gwa);
  const $ = cheerio.load(html);
  const events = [];

  $('article, .event, .event-card, .events-list > *, li').each((_, el) => {
    const name = $(el).find('h1, h2, h3, .title, .event-title').first().text().trim();
    if (!name || name.length < 3) return;
    const block = $(el).text().replace(/\s+/g, ' ').trim();
    const dm = block.match(/([A-Za-z]{3,9}\s+\d{1,2}\s*[-–—]\s*(?:[A-Za-z]{3,9}\s+)?\d{1,2})/);
    if (!dm) return;
    const { start, end } = parseDateRange(dm[1], 2026);
    if (!start) return;
    const location =
      $(el).find('.location, .event-location, .place').first().text().trim() || null;
    const href = $(el).find('a').first().attr('href');
    events.push({
      id: `gwa-${slugify(name)}`,
      name,
      tour: 'GWA',
      sport: 'wing',
      start_date: start,
      end_date: end,
      location,
      country: guessCountry(location || name),
      url: href
        ? href.startsWith('http')
          ? href
          : new URL(href, SOURCES.gwa).toString()
        : SOURCES.gwa,
    });
  });

  const seen = new Set();
  return events.filter((e) => (seen.has(e.id) ? false : (seen.add(e.id), true)));
}

// ---------- pipeline ----------

async function runScraper(id, fn) {
  const started = Date.now();
  try {
    console.log(`[events] scraping ${id}`);
    const items = await fn();
    console.log(`[events] ${id} ok — ${items.length} events in ${Date.now() - started}ms`);
    return { ok: true, items };
  } catch (err) {
    console.error(`[events] ${id} FAILED: ${err?.message || err}`);
    return { ok: false, items: [], error: String(err?.message || err) };
  }
}

function loadJson(path) {
  try {
    if (!existsSync(path)) return null;
    return JSON.parse(readFileSync(path, 'utf8'));
  } catch (err) {
    console.warn(`[events] could not read ${path}: ${err.message}`);
    return null;
  }
}

function loadManual() {
  const m = loadJson(MANUAL_PATH);
  if (!m || !Array.isArray(m.items)) return [];
  return m.items.map((it) => ({
    id: it.id || `manual-${slugify(it.name || '')}`,
    name: it.name,
    tour: it.tour || 'USER',
    sport: it.sport || 'kite',
    start_date: isoDate(it.start_date),
    end_date: isoDate(it.end_date || it.start_date),
    location: it.location || null,
    country: it.country || guessCountry(it.location || it.name) || null,
    url: it.url || null,
    _manual: true,
  }));
}

function writeOutput(obj) {
  mkdirSync(dirname(OUT_PATH), { recursive: true });
  writeFileSync(OUT_PATH, JSON.stringify(obj, null, 2) + '\n', 'utf8');
}

function previousItemsForSource(prev, sourceId) {
  if (!prev || !Array.isArray(prev.items)) return [];
  const tourMap = { gka: 'GKA', wsl: 'WSL', pwa: 'PWA', gwa: 'GWA' };
  const tour = tourMap[sourceId];
  return prev.items.filter((it) => it.tour === tour);
}

async function main() {
  const generated_at = new Date().toISOString();
  const prev = loadJson(OUT_PATH);

  const [gka, wsl, pwa, gwa] = await Promise.all([
    runScraper('gka', scrapeGKA),
    runScraper('wsl', scrapeWSL),
    runScraper('pwa', scrapePWA),
    runScraper('gwa', scrapeGWA),
  ]);

  const source_status = {
    gka: gka.ok ? 'ok' : 'failed',
    wsl: wsl.ok ? 'ok' : 'failed',
    pwa: pwa.ok ? 'ok' : 'failed',
    gwa: gwa.ok ? 'ok' : 'failed',
  };

  // Fallback to previous items for any failed source
  const gkaItems = gka.ok && gka.items.length ? gka.items : previousItemsForSource(prev, 'gka');
  const wslItems = wsl.ok && wsl.items.length ? wsl.items : previousItemsForSource(prev, 'wsl');
  const pwaItems = pwa.ok && pwa.items.length ? pwa.items : previousItemsForSource(prev, 'pwa');
  const gwaItems = gwa.ok && gwa.items.length ? gwa.items : previousItemsForSource(prev, 'gwa');

  const manualItems = loadManual();

  const allScraped = [...gkaItems, ...wslItems, ...pwaItems, ...gwaItems];
  const anyScraped = [gka, wsl, pwa, gwa].some((r) => r.ok && r.items.length > 0);

  if (!anyScraped && manualItems.length === 0) {
    console.error('[events] ALL scrapers failed and no manual items — preserving previous output');
    if (prev) {
      prev.generated_at = generated_at;
      prev.source_status = source_status;
      writeOutput(prev);
      return;
    }
    writeOutput({ generated_at, source_status, items: [] });
    return;
  }

  // Merge: manual entries win over scraped entries with the same id.
  const byId = new Map();
  for (const it of allScraped) {
    if (!it || !it.id) continue;
    byId.set(it.id, it);
  }
  for (const it of manualItems) {
    byId.set(it.id, it); // manual overwrites
  }

  const items = [...byId.values()]
    .map((it) => {
      const status = computeStatus(it.start_date, it.end_date);
      const { _manual, ...rest } = it;
      return { ...rest, status };
    })
    .filter((it) => it.start_date) // drop malformed
    .sort((a, b) => (a.start_date < b.start_date ? -1 : a.start_date > b.start_date ? 1 : 0));

  writeOutput({ generated_at, source_status, items });
  console.log(`[events] wrote ${OUT_PATH} — ${items.length} events`);
}

main().catch((err) => {
  console.error('[events] fatal error:', err);
  try {
    const prev = loadJson(OUT_PATH);
    if (prev) {
      prev.generated_at = new Date().toISOString();
      writeOutput(prev);
      console.log('[events] preserved previous output after fatal error');
    }
  } catch {
    // swallow
  }
  process.exit(0);
});
