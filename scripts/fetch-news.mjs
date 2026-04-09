#!/usr/bin/env node
/**
 * fetch-news.mjs — Guston news aggregator
 *
 * Fetches a set of RSS feeds in parallel, normalizes items, de-duplicates,
 * sorts by date, and writes data/news.json. Designed to be resilient:
 *   - Individual feed failures are logged and recorded in source_status;
 *     the pipeline continues with remaining feeds.
 *   - If ALL feeds fail, the previous data/news.json is preserved (only
 *     generated_at is bumped) so the frontend never sees an empty state
 *     due to a transient outage.
 *
 * Run locally:
 *   cd scripts && npm install && node fetch-news.mjs
 */

import { createHash } from 'node:crypto';
import { readFileSync, writeFileSync, existsSync, mkdirSync } from 'node:fs';
import { dirname, resolve } from 'node:path';
import { fileURLToPath } from 'node:url';

import Parser from 'rss-parser';

const __dirname = dirname(fileURLToPath(import.meta.url));
const REPO_ROOT = resolve(__dirname, '..');
const OUT_PATH = resolve(REPO_ROOT, 'data/news.json');

const MAX_ITEMS = 30;
const SNIPPET_LEN = 160;
const FETCH_TIMEOUT_MS = 15_000;
const USER_AGENT = 'Guston/1.0 (+https://guston.surf) news-fetcher';

/**
 * Feed config. Add a new source by appending to this array.
 * `id` is used in source_status; `tags` is copied verbatim onto every item.
 */
const FEEDS = [
  {
    id: 'iksurfmag',
    name: 'IKSURFMAG',
    url: 'https://iksurfmag.com/feed/',
    tags: ['kite'],
  },
  {
    id: 'windsurf_uk',
    name: 'Windsurf Magazine',
    url: 'https://windsurf.co.uk/feed/',
    tags: ['wind'],
  },
  {
    id: 'google_wing',
    name: 'Google News: Wing Foil',
    url: 'https://news.google.com/rss/search?q=wing+foil+OR+wingsurfing&hl=en-US&gl=US&ceid=US:en',
    tags: ['wing'],
  },
  {
    id: 'google_kite',
    name: 'Google News: Kitesurfing',
    url: 'https://news.google.com/rss/search?q=kitesurfing+OR+kiteboarding&hl=en-US&gl=US&ceid=US:en',
    tags: ['kite'],
  },
  {
    id: 'google_surf',
    name: 'Google News: Surfing',
    url: 'https://news.google.com/rss/search?q=surfing+competition&hl=en-US&gl=US&ceid=US:en',
    tags: ['surf'],
  },
];

const parser = new Parser({
  timeout: FETCH_TIMEOUT_MS,
  headers: {
    'User-Agent': USER_AGENT,
    Accept: 'application/rss+xml, application/xml, text/xml, */*',
  },
  customFields: {
    item: [
      ['media:content', 'mediaContent'],
      ['media:thumbnail', 'mediaThumbnail'],
      ['content:encoded', 'contentEncoded'],
    ],
  },
});

function stripHtml(str) {
  if (!str) return '';
  return String(str)
    .replace(/<[^>]*>/g, ' ')
    .replace(/&nbsp;/gi, ' ')
    .replace(/&amp;/gi, '&')
    .replace(/&lt;/gi, '<')
    .replace(/&gt;/gi, '>')
    .replace(/&quot;/gi, '"')
    .replace(/&#39;/gi, "'")
    .replace(/&#(\d+);/g, (_, n) => String.fromCharCode(parseInt(n, 10)))
    .replace(/\s+/g, ' ')
    .trim();
}

function truncate(str, n) {
  if (!str) return '';
  if (str.length <= n) return str;
  return str.slice(0, n - 1).trimEnd() + '…';
}

function normalizeUrl(url) {
  if (!url) return '';
  try {
    const u = new URL(url);
    u.hash = '';
    u.search = '';
    let s = u.toString();
    if (s.endsWith('/')) s = s.slice(0, -1);
    return s.toLowerCase();
  } catch {
    return String(url).trim().toLowerCase();
  }
}

function hashId(input) {
  return createHash('sha1').update(input).digest('hex').slice(0, 12);
}

function parseDate(raw) {
  if (!raw) return null;
  const d = new Date(raw);
  if (Number.isNaN(d.getTime())) return null;
  return d.toISOString();
}

function extractImage(item) {
  // enclosure (rss-parser normalizes to item.enclosure)
  if (item.enclosure && item.enclosure.url) {
    const t = item.enclosure.type || '';
    if (!t || t.startsWith('image/')) return item.enclosure.url;
  }
  // media:content
  const mc = item.mediaContent;
  if (mc) {
    if (Array.isArray(mc)) {
      for (const m of mc) {
        const url = m?.$?.url || m?.url;
        if (url) return url;
      }
    } else {
      const url = mc?.$?.url || mc?.url;
      if (url) return url;
    }
  }
  // media:thumbnail
  const mt = item.mediaThumbnail;
  if (mt) {
    const url = (Array.isArray(mt) ? mt[0] : mt)?.$?.url;
    if (url) return url;
  }
  // first <img> in content:encoded or content
  const html = item.contentEncoded || item.content || item['content:encoded'] || '';
  const m = /<img[^>]+src=["']([^"']+)["']/i.exec(html);
  if (m) return m[1];
  return undefined;
}

async function fetchFeed(feed) {
  const started = Date.now();
  try {
    console.log(`[news] fetching ${feed.id} (${feed.url})`);
    const parsed = await parser.parseURL(feed.url);
    const items = (parsed.items || []).map((it) => {
      const url = it.link || it.guid || '';
      const title = stripHtml(it.title || '');
      const snippetSrc =
        it.contentSnippet || it.summary || it.content || it.contentEncoded || it.description || '';
      const snippet = truncate(stripHtml(snippetSrc), SNIPPET_LEN);
      const date = parseDate(it.isoDate || it.pubDate || it.date) || new Date(0).toISOString();
      const normUrl = normalizeUrl(url);
      return {
        id: hashId(normUrl || title),
        source: feed.id,
        source_name: feed.name,
        title,
        snippet,
        url,
        _normUrl: normUrl,
        date,
        image: extractImage(it),
        tags: [...feed.tags],
      };
    });
    console.log(`[news] ${feed.id} ok — ${items.length} items in ${Date.now() - started}ms`);
    return { ok: true, items };
  } catch (err) {
    console.error(`[news] ${feed.id} FAILED: ${err?.message || err}`);
    return { ok: false, items: [], error: String(err?.message || err) };
  }
}

function dedupe(items) {
  const byKey = new Map();
  for (const it of items) {
    const key = it._normUrl || it.id;
    const existing = byKey.get(key);
    if (!existing) {
      byKey.set(key, it);
    } else {
      // merge tags, keep earliest-source
      const tags = Array.from(new Set([...existing.tags, ...it.tags]));
      existing.tags = tags;
      // prefer item with an image
      if (!existing.image && it.image) existing.image = it.image;
    }
  }
  return [...byKey.values()];
}

function loadPrevious() {
  try {
    if (!existsSync(OUT_PATH)) return null;
    const raw = readFileSync(OUT_PATH, 'utf8');
    return JSON.parse(raw);
  } catch (err) {
    console.warn(`[news] could not read previous output: ${err.message}`);
    return null;
  }
}

function writeOutput(obj) {
  mkdirSync(dirname(OUT_PATH), { recursive: true });
  writeFileSync(OUT_PATH, JSON.stringify(obj, null, 2) + '\n', 'utf8');
}

async function main() {
  const generated_at = new Date().toISOString();
  const results = await Promise.all(FEEDS.map(fetchFeed));

  const source_status = {};
  FEEDS.forEach((f, i) => {
    source_status[f.id] = results[i].ok ? 'ok' : 'failed';
  });

  const allItems = results.flatMap((r) => r.items);
  const anyOk = results.some((r) => r.ok && r.items.length > 0);

  if (!anyOk) {
    console.error('[news] ALL feeds failed or returned no items — preserving previous output');
    const prev = loadPrevious();
    if (prev) {
      prev.generated_at = generated_at;
      prev.source_status = source_status;
      writeOutput(prev);
      console.log(`[news] wrote ${OUT_PATH} (preserved ${prev.items?.length || 0} previous items)`);
      return;
    }
    // No previous either — write an empty shell rather than crash.
    writeOutput({ generated_at, source_status, items: [] });
    console.log('[news] wrote empty shell (no previous output available)');
    return;
  }

  const deduped = dedupe(allItems)
    .sort((a, b) => (a.date < b.date ? 1 : a.date > b.date ? -1 : 0))
    .slice(0, MAX_ITEMS)
    .map(({ _normUrl, ...rest }) => rest);

  const output = {
    generated_at,
    source_status,
    items: deduped,
  };
  writeOutput(output);
  console.log(`[news] wrote ${OUT_PATH} — ${deduped.length} items`);
}

main().catch((err) => {
  // Top-level safety net — we still must not crash the workflow such that
  // stale data is left. Try to preserve previous file.
  console.error('[news] fatal error:', err);
  try {
    const prev = loadPrevious();
    if (prev) {
      prev.generated_at = new Date().toISOString();
      writeOutput(prev);
      console.log('[news] preserved previous output after fatal error');
    }
  } catch {
    // swallow
  }
  process.exit(0); // don't fail the workflow — auto-commit will no-op
});
