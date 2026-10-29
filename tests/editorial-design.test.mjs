import test from 'node:test';
import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';

const home = readFileSync(new URL('../src/content/docs/index.mdx', import.meta.url), 'utf8');
const css = readFileSync(new URL('../src/styles/atlas.css', import.meta.url), 'utf8');
const config = readFileSync(new URL('../astro.config.mjs', import.meta.url), 'utf8');

const routes = [
  'programming-language-concepts/idiomatic-programming/',
  'concurrency-parallelism/atomic-operation/',
  'distributed-systems/idempotency/',
  'type-systems/type-inference/',
  'functional-programming/pure-function/',
  'oop-design-patterns/observer-pattern/',
  'operating-systems-memory/virtual-memory/',
  'io-networking/input-output/',
  'databases-transactions/transaction-isolation-levels/',
  'compilers-runtimes/abstract-syntax-tree/',
  'http-api-integration/http-method-semantics/',
  'data-structures-algorithms/bloom-filter/',
  'testing-verification/mutation-testing/',
  'software-architecture/bounded-context/',
  'performance-engineering/tail-latency/',
  'devops-ci-cd/software-bill-of-materials/',
  'observability-sre/observability/',
];

test('home has one compact custom masthead and purposeful first-screen reading paths', () => {
  assert.match(home, /template: splash/);
  assert.doesNotMatch(home, /\nhero:/);
  assert.match(home, /class="atlas-masthead"/);
  assert.match(home, /class="atlas-quickstart"/);
  assert.match(home, /<h1>/);
  assert.match(home, /class="atlas-directory"/);
  assert.doesNotMatch(home, /atlas-principles|atlas-intro/);
});

test('all seventeen editorial preview articles remain discoverable on homepage', () => {
  for(const route of routes) assert.ok(home.includes('href="./' + route + '"'), route);
  assert.match(home, /17 draft articles/i);
  assert.match(home, /20 categories/i);
  assert.match(home, /100 planned concepts/i);
});

test('editorial previews stay explicitly labelled and production status is not claimed', () => {
  assert.match(home, /editorial preview/i);
  assert.match(home, /not approved/i);
  assert.match(home, /not independently reviewed/i);
  assert.match(config, /noindex, nofollow/);
});

test('reading design has responsive content, code, callout and accessible focus styles', () => {
  for(const token of ['--atlas-surface','--atlas-ink','--atlas-muted','--atlas-line']) assert.ok(css.includes(token), token);
  assert.match(css, /\.atlas-masthead/);
  assert.match(css, /\.atlas-quickstart/);
  assert.match(css, /\.atlas-directory/);
  assert.match(css, /\.sl-markdown-content/);
  assert.ok(css.includes('.content-panel:not(:has(.atlas-home))'));

  assert.match(css, /\.starlight-aside/);
  assert.match(css, /:focus-visible/);
  assert.ok(css.includes('body:has(.atlas-home)'));
  assert.match(css, /@media\s*\(max-width:\s*48rem\)/);
  assert.match(css, /prefers-reduced-motion/);
  assert.match(css, /:root\[data-theme='light'\]/);
});

test('site has no added scripts, font imports, autoplay media or visual dependency', () => {
  assert.doesNotMatch(css, /@import\s+url\s*\(/);
  assert.doesNotMatch(home, /<script|<iframe|<video/i);
  assert.doesNotMatch(home, /<CardGrid|<Card /);
});
