import test from 'node:test';
import assert from 'node:assert/strict';
import { mkdtempSync, mkdirSync, writeFileSync, rmSync } from 'node:fs';
import { join, dirname } from 'node:path';
import { tmpdir } from 'node:os';
import { auditDist as auditDistWithEnvironment } from '../scripts/lib/dist-audit.mjs';

// Synthetic fixtures use a root-hosted layout unless a test opts into a Pages
// base path. Isolate tests from GITHUB_PAGES and GITHUB_REPOSITORY in CI.
const auditDist = (root, options) => auditDistWithEnvironment(root, { basePath: '', ...options });

const routes = [
  '/', '/concept-index/',
  '/programming-language-concepts/idiomatic-programming/',
  '/concurrency-parallelism/atomic-operation/',
  '/distributed-systems/idempotency/',
];

function fixture(fn) {
  const root = mkdtempSync(join(tmpdir(), 'eca-dist-'));
  const put = (path, content) => {
    const target = join(root, path);
    mkdirSync(dirname(target), { recursive: true });
    writeFileSync(target, content);
  };
  for (const url of routes) put(`${url.slice(1)}index.html`, `<html lang="en"><body><main><h1>Engineering Concept</h1><a href="/concept-index/">Index</a></main></body></html>`);
  put('pagefind/pagefind.js', 'export const search = async () => [];');
  put('pagefind/pagefind-entry.json', JSON.stringify({ version: '1.3.0', languages: { en: { page_count: 5 } } }));
  put('pagefind/index/en_test.pf_index', 'fake-index-for-shape-test-only');
  try { return fn({ root, put }); } finally { rmSync(root, { recursive: true, force: true }); }
}

// Audit logic is tested against synthetic outputs, not falsely described as an Astro build.
test('valid output has navigable routes, local links and a nonempty search manifest', () => fixture(({ root, put }) => {
  put('index.html', `<a href="./concept-index/">Index</a><img src="/favicon.svg"><a href="https://example.org/reference">Reference</a>`);
  put('favicon.svg', '<svg/>');
  assert.deepEqual(auditDist(root, { requiredRoutes: routes }).errors, []);
}));

test('detects broken root-relative and page-relative links', () => fixture(({ root, put }) => {
  put('index.html', `<a href="/missing/">Broken</a>`);
  put('concept-index/index.html', `<a href="../gone/">Also broken</a>`);
  const errors = auditDist(root, { requiredRoutes: routes }).errors.join('\n');
  assert.match(errors, /missing/);
  assert.match(errors, /gone/);
}));

test('detects broken local assets including src references', () => fixture(({ root, put }) => {
  put('index.html', '<script src="/_astro/missing.js"></script>');
  assert.match(auditDist(root, { requiredRoutes: routes }).errors.join('\n'), /_astro\/missing\.js/);
}));

test('detects a missing required concept route', () => fixture(({ root }) => {
  assert.match(auditDist(root, { requiredRoutes: [...routes, '/not-written/'] }).errors.join('\n'), /not-written/);
}));

test('does not accept a Pagefind directory without an index', () => fixture(({ root }) => {
  rmSync(join(root, 'pagefind/index'), { recursive: true });
  assert.match(auditDist(root, { requiredRoutes: routes }).errors.join('\n'), /Pagefind index fragments/);
}));

test('rejects zero indexed pages or malformed Pagefind manifest', () => fixture(({ root, put }) => {
  put('pagefind/pagefind-entry.json', JSON.stringify({ languages: { en: { page_count: 0 } } }));
  assert.match(auditDist(root, { requiredRoutes: routes }).errors.join('\n'), /zero indexed pages/);
  put('pagefind/pagefind-entry.json', '{bad json');
  assert.match(auditDist(root, { requiredRoutes: routes }).errors.join('\n'), /manifest/i);
}));

test('external protocols and hash-only links are not mistaken for local pages', () => fixture(({ root, put }) => {
  put('index.html', '<a href="mailto:editor@example.org">Email</a><a href="https://example.org/">External</a><a href="#top">Top</a><span id="top"></span>');
  assert.deepEqual(auditDist(root, { requiredRoutes: routes }).errors, []);
}));

// Anchor correctness is distinct from a page/asset existence check.
test('accepts valid same-page and cross-page anchor targets', () => fixture(({ root, put }) => {
  put('index.html', '<h1 id="overview">Overview</h1><a href="#overview">Self</a><a href="/concept-index/#definitions">Definitions</a>');
  put('concept-index/index.html', '<h2 id="definitions">Definitions</h2>');
  assert.deepEqual(auditDist(root, { requiredRoutes: routes }).errors, []);
}));

test('reports a missing same-page and cross-page anchor while routes exist', () => fixture(({ root, put }) => {
  put('index.html', '<a href="#missing-section">Broken local anchor</a><a href="/concept-index/#absent">Broken remote anchor</a>');
  const errors = auditDist(root, { requiredRoutes: routes }).errors.join('\n');
  assert.match(errors, /#missing-section/);
  assert.match(errors, /#absent/);
}));

test('encoded anchors and text-fragment directives are interpreted correctly', () => fixture(({ root, put }) => {
  put('index.html', '<h2 id="memory-model">Memory model</h2><a href="#memory%2Dmodel">Encoded ID</a><a href="#%3A~%3Atext=memory">Text fragment</a>');
  assert.deepEqual(auditDist(root, { requiredRoutes: routes }).errors, []);
}));

test('data-id is not treated as an HTML fragment target', () => fixture(({ root, put }) => {
  put('index.html', '<div data-id="not-an-anchor"></div><a href="#not-an-anchor">Broken</a>');
  assert.match(auditDist(root, { requiredRoutes: routes }).errors.join('\n'), /#not-an-anchor/);
}));


const pagesBase = '/engineering-concepts-atlas';
test('GitHub Pages subpath accepts properly prefixed links and page assets', () => fixture(({ root, put }) => {
  for (const route of routes) put(`${route.slice(1)}index.html`, `<html><main><h1>Preview</h1><a href="${pagesBase}/concept-index/">Browse</a></main></html>`);
  put('index.html', `<h1 id="hello">Home</h1><a href="${pagesBase}/concept-index/#notes">Notes</a><link rel="icon" href="${pagesBase}/favicon.svg">`);
  put('concept-index/index.html', `<h2 id="notes">Notes</h2><a href="${pagesBase}/">Home</a>`);
  put('favicon.svg', '<svg/>');
  assert.deepEqual(auditDist(root, { requiredRoutes: routes, basePath: pagesBase }).errors, []);
}));

test('GitHub Pages subpath fails on root-relative links that would escape the site', () => fixture(({ root, put }) => {
  put('index.html', `<a href="/concept-index/">Bad link</a><a href="${pagesBase}/concept-index/">Good link</a>`);
  assert.match(auditDist(root, { requiredRoutes: routes, basePath: pagesBase }).errors.join('\n'), /Missing base prefix.*concept-index/);
}));
