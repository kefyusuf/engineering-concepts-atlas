import { readdirSync, readFileSync, existsSync, statSync } from 'node:fs';
import { join, relative, resolve, dirname, sep } from 'node:path';
import { pagesConfig } from './pages-config.mjs';

export const REQUIRED_ROUTES = [
  '/', '/concept-index/', '/about/',
  '/programming-language-concepts/idiomatic-programming/',
  '/concurrency-parallelism/atomic-operation/',
  '/distributed-systems/idempotency/',
  '/type-systems/type-inference/',
  '/oop-design-patterns/observer-pattern/',
  '/operating-systems-memory/virtual-memory/',
  '/io-networking/input-output/',
  '/databases-transactions/transaction-isolation-levels/',
  '/compilers-runtimes/abstract-syntax-tree/',
  '/http-api-integration/http-method-semantics/',
  '/data-structures-algorithms/bloom-filter/',
  '/testing-verification/mutation-testing/',
  '/functional-programming/pure-function/',
];

function filesWithin(root) {
  const paths = [];
  const visit = (dir) => {
    if (!existsSync(dir)) return;
    for (const entry of readdirSync(dir, { withFileTypes: true })) {
      const path = join(dir, entry.name);
      if (entry.isDirectory()) visit(path);
      else if (entry.isFile()) paths.push(path);
    }
  };
  visit(root);
  return paths;
}

function isFile(path) {
  try { return statSync(path).isFile(); } catch { return false; }
}

function pageRoute(root, file) {
  const rel = relative(root, file).replaceAll('\\', '/');
  if (rel === 'index.html') return '/';
  if (rel.endsWith('/index.html')) return `/${rel.slice(0, -'index.html'.length)}`;
  return `/${rel}`;
}

function htmlRefs(html) {
  const refs = [];
  for (const [tag] of html.matchAll(/<(?:a|link|script|img|source)\b[^>]*>/gi)) {
    for (const match of tag.matchAll(/\b(?:href|src)\s*=\s*(["'])(.*?)\1/gi)) {
      refs.push(match[2].replaceAll('&amp;', '&'));
    }
  }
  return refs;
}

function anchorRefs(html) {
  const refs = [];
  for (const [tag] of html.matchAll(/<a\b[^>]*>/gi)) {
    const match = tag.match(/\bhref\s*=\s*(["'])(.*?)\1/i);
    if (match) refs.push(match[2].replaceAll('&amp;', '&'));
  }
  return refs;
}

// Validate only actual HTML fragment IDs; text fragments (#:~:text=) are not IDs.
function missingAnchor(root, route, raw, cache, basePath = '') {
  if (!raw || raw.startsWith('//')) return null;
  let url;
  try { url = new URL(raw, `https://atlas.invalid${basePath}${route}`); }
  catch { return null; } // Malformed paths are handled by the asset check.
  if (url.origin !== 'https://atlas.invalid' || !url.hash) return null;
  let fragment;
  try { fragment = decodeURIComponent(url.hash.slice(1)).split(':~:text=')[0]; }
  catch { return `Malformed fragment: ${raw}`; }
  if (!fragment) return null;
  let pathname;
  try { pathname = decodeURIComponent(url.pathname); }
  catch { return null; }
  const base = resolve(root);
  if (basePath && pathname !== basePath && !pathname.startsWith(basePath + '/')) return `Missing base prefix: ${raw}`;
  const sitePath = basePath ? pathname.slice(basePath.length) || '/' : pathname;
  const path = resolve(base, '.' + sitePath);
  if (path !== base && !path.startsWith(base + sep)) return null;
  const candidates = [path, `${path}.html`, join(path, 'index.html')];
  const target = candidates.find(file => isFile(file) && file.endsWith('.html'));
  if (!target) return null; // Missing destination is reported by resolvedAsset().
  if (!cache.has(target)) {
    const html = readFileSync(target, 'utf8');
    const ids = new Set();
    for (const [tag] of html.matchAll(/<[a-z][^>]*>/gi)) {
      const match = tag.match(/\s+id\s*=\s*(?:"([^"]*)"|'([^']*)'|([^\s>]+))/i);
      if (match) ids.add((match[1] ?? match[2] ?? match[3]).replaceAll('&amp;', '&'));
    }
    cache.set(target, ids);
  }
  return cache.get(target).has(fragment) ? null : `Missing fragment target: ${raw}`;
}

function resolvedAsset(root, route, raw, basePath = '') {
  if (!raw || raw.startsWith('#') || raw.startsWith('//')) return null;
  let url;
  try { url = new URL(raw, `https://atlas.invalid${basePath}${route}`); }
  catch { return { error: `Invalid URL ${raw}` }; }
  if (url.origin !== 'https://atlas.invalid') return null;
  let pathname;
  try { pathname = decodeURIComponent(url.pathname); }
  catch { return { error: `Malformed URL encoding ${raw}` }; }
  const base = resolve(root);
  if (basePath && pathname !== basePath && !pathname.startsWith(basePath + '/')) return { error: `Missing base prefix: ${raw}` };
  const sitePath = basePath ? pathname.slice(basePath.length) || '/' : pathname;
  const path = resolve(base, '.' + sitePath);
  if (path !== base && !path.startsWith(base + sep)) return { error: `Path outside output: ${raw}` };
  const valid = [path, `${path}.html`, join(path, 'index.html')].some(isFile);
  return valid ? null : { error: `Missing local target: ${raw}` };
}

export function auditDist(distRoot, { requiredRoutes = REQUIRED_ROUTES, basePath = pagesConfig().base } = {}) {
  const root = resolve(distRoot);
  const errors = [];
  if (!existsSync(root)) return { errors: [`Missing dist output: ${root}`], htmlCount: 0, pagefindPageCount: 0 };
  const paths = filesWithin(root);
  const anchorIds = new Map();
  const htmlFiles = paths.filter(path => path.endsWith('.html'));
  if (!htmlFiles.length) errors.push('No rendered HTML files found');
  for (const file of htmlFiles) {
    const route = pageRoute(root, file);
    const html = readFileSync(file, 'utf8');
    for (const raw of htmlRefs(html)) {
      const result = resolvedAsset(root, route, raw, basePath);
      if (result) errors.push(`${route}: ${result.error}`);
    }
    for (const raw of anchorRefs(html)) {
      const error = missingAnchor(root, route, raw, anchorIds, basePath);
      if (error) errors.push(`${route}: ${error}`);
    }
  }
  for (const route of requiredRoutes) {
    const result = resolvedAsset(root, '/', `${basePath}${route}`, basePath);
    if (result) errors.push(`Missing required route: ${route}`);
  }
  const pagefindRoot = join(root, 'pagefind');
  if (!isFile(join(pagefindRoot, 'pagefind.js'))) errors.push('Missing Pagefind runtime: pagefind/pagefind.js');
  const indexFiles = paths.filter(file => file.startsWith(pagefindRoot + sep) && file.endsWith('.pf_index'));
  if (!indexFiles.length) errors.push('Missing Pagefind index fragments (.pf_index)');
  let pagefindPageCount = 0;
  const manifest = join(pagefindRoot, 'pagefind-entry.json');
  if (!isFile(manifest)) errors.push('Missing Pagefind manifest: pagefind-entry.json');
  else {
    try {
      const metadata = JSON.parse(readFileSync(manifest, 'utf8'));
      const languages = Object.values(metadata.languages ?? {});
      pagefindPageCount = languages.reduce((sum, item) => sum + (Number(item?.page_count) || 0), 0);
      if (pagefindPageCount === 0) errors.push('Pagefind manifest reports zero indexed pages');
    } catch (error) { errors.push(`Invalid Pagefind manifest: ${error.message}`); }
  }
  return { errors, htmlCount: htmlFiles.length, pagefindPageCount };
}
