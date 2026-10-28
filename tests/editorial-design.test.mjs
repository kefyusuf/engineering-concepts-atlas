import test from 'node:test';
import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';

const home = readFileSync(new URL('../src/content/docs/index.mdx', import.meta.url), 'utf8');
const css = readFileSync(new URL('../src/styles/atlas.css', import.meta.url), 'utf8');

test('homepage uses a curated editorial directory, not thirteen identical marketing cards', () => {
  assert.match(home, /atlas-home/);
  assert.match(home, /atlas-principles/);
  assert.match(home, /atlas-directory/);
  assert.match(home, /atlas-preview-notice/);
  assert.match(home, /<h2>Explore the current articles<\/h2>/);
  assert.match(home, /<h3>Language & design<\/h3>/);
  assert.doesNotMatch(home, /<CardGrid|<Card /);
});

test('homepage retains every current editorial draft destination', () => {
  const routes = [
    '/programming-language-concepts/idiomatic-programming/',
    '/concurrency-parallelism/atomic-operation/',
    '/distributed-systems/idempotency/',
    '/type-systems/type-inference/',
    '/functional-programming/pure-function/',
    '/oop-design-patterns/observer-pattern/',
    '/operating-systems-memory/virtual-memory/',
    '/io-networking/input-output/',
    '/databases-transactions/transaction-isolation-levels/',
    '/compilers-runtimes/abstract-syntax-tree/',
    '/http-api-integration/http-method-semantics/',
    '/data-structures-algorithms/bloom-filter/',
    '/testing-verification/mutation-testing/',
  ];
  for (const route of routes) assert.ok(home.includes('href="./' + route.slice(1) + '"'), 'missing homepage-relative editorial draft link ' + route);
  assert.equal((home.match(/<li><a href="\.\//g) ?? []).length, 13);
  assert.match(home, /thirteen|13/i);
  assert.match(home, /not independently reviewed/i);
});

test('site CSS has coherent light/dark tokens and responsive reading layouts', () => {
  for (const token of ['--atlas-surface', '--atlas-line', '--atlas-ink', '--atlas-muted']) {
    assert.ok(css.includes(token), 'missing token ' + token);
  }
  assert.match(css, /:root\[data-theme=['"]light['"]\]/);
  assert.match(css, /\.atlas-directory/);
  assert.match(css, /@media\s*\(max-width:\s*48rem\)/);
  assert.match(css, /prefers-reduced-motion/);
});

test('site retains accessible focus and does not fetch external fonts or introduce animation dependencies', () => {
  assert.match(css, /:focus-visible/);
  assert.match(css, /--sl-font/);
  assert.doesNotMatch(css, /@import\s+url\s*\(/);
  assert.doesNotMatch(home, /<script|<iframe|<video/i);
});

test('redesign leaves content and approval status separated', () => {
  assert.match(home, /editorial preview/i);
  assert.match(home, /not approved/i);
  assert.match(home, /20 categories/);
});
