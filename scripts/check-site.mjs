// Site checks: run after `npm run build` to verify the built site in dist/.
//
//   npm test                   → all checks, including external links
//   npm test -- --no-external  → skip external links (fast, works offline)
//
// Errors (✗) fail the run and block publishing. Warnings (⚠) are printed but don't block.
import { readFile, readdir, stat } from 'node:fs/promises';
import { existsSync } from 'node:fs';
import { join, relative } from 'node:path';

const DIST = new URL('../dist/', import.meta.url).pathname;
const SITE = 'https://www.alinadocs.com';
const CHECK_EXTERNAL = !process.argv.includes('--no-external');

// Pages that must never be published or listed while they are work in progress
const HIDDEN_PATHS = ['/mexidocs/', '/speaking/kit/'];
// Text that must never appear on a published page
const FORBIDDEN_TEXT = [/\bTODO\b/, /\blorem ipsum\b/i, /example\.com/i, /\bplaceholder\b/i];
// Sites that block automated checks: their links are reported as "not checked", never as broken
const BOT_PROTECTED = ['linkedin.com', 'lnkd.in'];
const MAX_FILE_BYTES = 5 * 1024 * 1024; // error above 5 MB
const WARN_FILE_BYTES = 3 * 1024 * 1024; // warning above 3 MB

const errors = [];
const warnings = [];
const fail = (where, msg) => errors.push(`${where}: ${msg}`);
const warn = (where, msg) => warnings.push(`${where}: ${msg}`);

// ---------- helpers ----------
async function walk(dir) {
  const out = [];
  for (const entry of await readdir(dir, { withFileTypes: true })) {
    const p = join(dir, entry.name);
    if (entry.isDirectory()) out.push(...(await walk(p)));
    else out.push(p);
  }
  return out;
}

const decode = (s) => s.replace(/&amp;/g, '&').replace(/&quot;/g, '"').replace(/&#39;/g, "'");
const attr = (tag, name) => {
  const m = tag.match(new RegExp(`\\s${name}\\s*=\\s*"([^"]*)"`, 'i'));
  return m ? decode(m[1]) : null;
};

// Map a site URL path ("/about/", "/files/cv.pdf") to a file in dist/, or null if missing
function resolveInternal(pathname) {
  let p = decodeURIComponent(pathname);
  const candidates = p.endsWith('/') ? [join(DIST, p, 'index.html')] : [join(DIST, p), join(DIST, p, 'index.html'), join(DIST, `${p}.html`)];
  return candidates.find((c) => existsSync(c)) ?? null;
}

const idCache = new Map();
async function hasAnchor(file, id) {
  if (!idCache.has(file)) {
    const html = await readFile(file, 'utf8');
    idCache.set(file, new Set([...html.matchAll(/\s(?:id|name)="([^"]+)"/g)].map((m) => decode(m[1]))));
  }
  return idCache.get(file).has(decodeURIComponent(id));
}

const visibleText = (html) =>
  html
    .replace(/<script[\s\S]*?<\/script>/gi, ' ')
    .replace(/<style[\s\S]*?<\/style>/gi, ' ')
    .replace(/<!--[\s\S]*?-->/g, ' ')
    .replace(/<[^>]+>/g, ' ')
    .replace(/\s+/g, ' ');

// ---------- collect files ----------
if (!existsSync(DIST)) {
  console.error('✗ dist/ not found. Run `npm run build` first.');
  process.exit(1);
}
const files = await walk(DIST);
const pages = files.filter((f) => f.endsWith('.html') && !/google[0-9a-f]+\.html$/.test(f));
const externalLinks = new Map(); // url -> first page that uses it
const internalRefs = []; // { from, url }

// ---------- 1. per-page checks ----------
for (const file of pages) {
  const html = await readFile(file, 'utf8');
  const where = '/' + relative(DIST, file).replace(/index\.html$/, '');
  const noindex = /<meta name="robots" content="noindex"/.test(html);

  const title = html.match(/<title>([^<]*)<\/title>/)?.[1]?.trim();
  if (!title) fail(where, 'missing <title>');

  const h1s = (html.match(/<h1[\s>]/g) ?? []).length;
  if (h1s !== 1) fail(where, `expected exactly 1 <h1>, found ${h1s}`);

  const desc = html.match(/<meta name="description" content="([^"]*)"/)?.[1];
  if (!desc) fail(where, 'missing meta description');
  else if (decode(desc).length > 165) warn(where, `description is ${decode(desc).length} characters (Google shows ~160)`);
  else if (decode(desc).length < 50) warn(where, `description is only ${decode(desc).length} characters`);

  if (!noindex) {
    const canonical = html.match(/<link rel="canonical" href="([^"]*)"/)?.[1];
    if (!canonical) fail(where, 'missing canonical link');
    else if (!canonical.startsWith(SITE)) fail(where, `canonical points outside the site: ${canonical}`);
  }

  const ogImage = html.match(/<meta property="og:image" content="([^"]*)"/)?.[1];
  if (!ogImage) fail(where, 'missing og:image (link preview)');
  else internalRefs.push({ from: where, url: ogImage });

  for (const m of html.matchAll(/<script type="application\/ld\+json">([\s\S]*?)<\/script>/g)) {
    try { JSON.parse(m[1]); } catch { fail(where, 'structured data (JSON-LD) is not valid JSON'); }
  }

  const text = visibleText(html);
  for (const re of FORBIDDEN_TEXT) {
    const hit = text.match(re);
    if (hit) fail(where, `placeholder text on the page: "${text.slice(Math.max(0, hit.index - 30), hit.index + 40).trim()}"`);
  }

  for (const tag of html.match(/<img\b[^>]*>/g) ?? []) {
    if (attr(tag, 'alt') === null) fail(where, `image without alt text: ${attr(tag, 'src')}`);
  }

  // Collect links and asset references
  for (const tag of html.match(/<(a|link|img|script|iframe|source)\b[^>]*>/g) ?? []) {
    if (/rel="(preconnect|dns-prefetch)"/.test(tag)) continue;
    const url = attr(tag, 'href') ?? attr(tag, 'src');
    if (!url || /^(mailto:|tel:|javascript:|data:)/i.test(url)) continue;
    if (/^https?:\/\//i.test(url) && !url.startsWith(SITE)) externalLinks.set(url, externalLinks.get(url) ?? where);
    else internalRefs.push({ from: where, url, page: file });
  }
}

// ---------- 2. internal links, assets, and anchors ----------
for (const { from, url, page } of internalRefs) {
  const u = new URL(url, SITE + from);
  if (u.origin !== SITE) continue;
  if (HIDDEN_PATHS.some((h) => u.pathname.startsWith(h))) fail(from, `links to a hidden page: ${u.pathname}`);
  const target = u.pathname === new URL(SITE + from).pathname && page ? page : resolveInternal(u.pathname);
  if (!target) { fail(from, `broken link: ${url}`); continue; }
  if (u.hash && u.hash.length > 1 && target.endsWith('.html') && !(await hasAnchor(target, u.hash.slice(1)))) {
    fail(from, `link to a missing section: ${url}`);
  }
}

// ---------- 3. hidden pages must not be built ----------
for (const h of HIDDEN_PATHS) {
  if (existsSync(join(DIST, h, 'index.html'))) fail(h, 'hidden page was published (check showMexiDocs / showSpeakerKit)');
}

// ---------- 4. sitemap ----------
const sitemapFile = join(DIST, 'sitemap.xml');
if (!existsSync(sitemapFile)) fail('/sitemap.xml', 'missing');
else {
  const locs = [...(await readFile(sitemapFile, 'utf8')).matchAll(/<loc>([^<]+)<\/loc>/g)].map((m) => m[1]);
  if (locs.length === 0) fail('/sitemap.xml', 'lists no pages');
  for (const loc of locs) {
    const u = new URL(loc);
    if (u.origin !== SITE) fail('/sitemap.xml', `URL outside the site: ${loc}`);
    else if (!resolveInternal(u.pathname)) fail('/sitemap.xml', `lists a page that doesn't exist: ${loc}`);
    if ([...HIDDEN_PATHS, '/404'].some((h) => u.pathname.startsWith(h))) fail('/sitemap.xml', `lists an excluded page: ${loc}`);
  }
  const listed = new Set(locs.map((l) => new URL(l).pathname));
  for (const file of pages) {
    const path = '/' + relative(DIST, file).replace(/index\.html$/, '');
    if (path !== '/404.html' && !listed.has(path)) warn('/sitemap.xml', `page not listed: ${path}`);
  }
}
for (const f of ['sitemap-index.xml', 'robots.txt', 'llms.txt']) if (!existsSync(join(DIST, f))) fail(`/${f}`, 'missing');

// ---------- 5. llms.txt links ----------
if (existsSync(join(DIST, 'llms.txt'))) {
  for (const m of (await readFile(join(DIST, 'llms.txt'), 'utf8')).matchAll(/\]\((https?:\/\/[^)\s]+)\)/g)) {
    const url = m[1];
    if (url.startsWith(SITE)) { if (!resolveInternal(new URL(url).pathname)) fail('/llms.txt', `broken link: ${url}`); }
    else externalLinks.set(url, externalLinks.get(url) ?? '/llms.txt');
  }
}

// ---------- 6. images: privacy (no hidden metadata) and file size ----------
for (const file of files) {
  const where = '/' + relative(DIST, file);
  const { size } = await stat(file);
  if (size > MAX_FILE_BYTES) fail(where, `file is ${(size / 1048576).toFixed(1)} MB (limit 5 MB)`);
  else if (size > WARN_FILE_BYTES) warn(where, `file is ${(size / 1048576).toFixed(1)} MB`);
  if (/\.jpe?g$/i.test(file)) {
    const buf = await readFile(file);
    // An APP1 "Exif" segment can contain GPS location, camera and date: published photos must have none
    for (let i = 2; i < buf.length - 10; ) {
      if (buf[i] !== 0xff) break;
      const marker = buf[i + 1], len = buf.readUInt16BE(i + 2);
      if (marker === 0xe1 && buf.toString('latin1', i + 4, i + 8) === 'Exif') { fail(where, 'photo contains hidden metadata (EXIF: may include GPS location). Strip it before publishing.'); break; }
      if (marker === 0xda) break; // start of image data
      i += 2 + len;
    }
  }
}

// ---------- 7. external links ----------
async function checkExternal(url) {
  const host = new URL(url).hostname;
  if (BOT_PROTECTED.some((d) => host === d || host.endsWith(`.${d}`))) return { skipped: true };
  const opts = { redirect: 'follow', signal: AbortSignal.timeout(20000), headers: { 'user-agent': 'Mozilla/5.0 (link checker for alinadocs.com)' } };
  try {
    let res = await fetch(url, { ...opts, method: 'HEAD' });
    if (res.status >= 400) res = await fetch(url, { ...opts, method: 'GET' }); // some servers reject HEAD
    return { status: res.status };
  } catch (e) {
    return { error: e.name === 'TimeoutError' ? 'timed out' : e.cause?.code ?? e.message };
  }
}
let skipped = 0;
if (CHECK_EXTERNAL && externalLinks.size) {
  const urls = [...externalLinks.keys()];
  const results = [];
  for (let i = 0; i < urls.length; i += 8) results.push(...(await Promise.all(urls.slice(i, i + 8).map(checkExternal))));
  urls.forEach((url, i) => {
    const r = results[i], from = externalLinks.get(url);
    if (r.skipped) skipped++;
    else if (r.error) (/ENOTFOUND|EAI_AGAIN/.test(r.error) ? fail : warn)(from, `external link unreachable (${r.error}): ${url}`);
    else if (r.status === 404 || r.status === 410) fail(from, `external link is gone (${r.status}): ${url}`);
    else if (r.status >= 400) warn(from, `external link returned ${r.status} (may be bot protection): ${url}`);
  });
}

// ---------- report ----------
console.log(`\nChecked ${pages.length} pages, ${internalRefs.length} internal references, ` +
  (CHECK_EXTERNAL ? `${externalLinks.size} external links (${skipped} on LinkedIn not checked: it blocks automated requests).` : 'external links skipped.'));
for (const w of warnings) console.log(`⚠ ${w}`);
for (const e of errors) console.log(`✗ ${e}`);
if (errors.length) {
  console.log(`\n✗ ${errors.length} problem(s) found. Fix them before publishing.`);
  process.exit(1);
}
console.log(`\n✓ All checks passed${warnings.length ? ` (${warnings.length} warning(s))` : ''}.`);
