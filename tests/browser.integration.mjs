import test from 'node:test';
import assert from 'node:assert/strict';
import { mkdtempSync, mkdirSync, writeFileSync, rmSync, } from 'node:fs';
import { join, dirname } from 'node:path';
import { tmpdir } from 'node:os';
import { runBrowserAudit, findBrowser } from '../scripts/lib/browser-audit.mjs';

const articles = [
  ['/programming-language-concepts/idiomatic-programming/', 'Idiomatic Programming'],
  ['/concurrency-parallelism/atomic-operation/', 'Atomic Operation'],
  ['/distributed-systems/idempotency/', 'Idempotency'],
];
function fixture(run, breakSearch = false) {
  const root = mkdtempSync(join(tmpdir(), 'atlas-browser-fixture-'));
  const put = (name, body) => { const path = join(root, name); mkdirSync(dirname(path), { recursive: true }); writeFileSync(path, body); };
  const html = (title, isPilot) => `<!doctype html><html lang="en"><head><meta charset="utf-8"><meta name="viewport" content="width=device-width, initial-scale=1"><title>${title}</title></head><body><main><h1>${title}</h1><a href="/concept-index/">Concept index</a>${isPilot ? '<aside>Editorial preview — not approved for publication</aside><pre><code>example();</code></pre><h2>References</h2><a href="https://example.org/source">Primary source</a>' : ''}</main></body></html>`;
  for (const [route, title] of [['/', 'Engineering Concepts Atlas'], ['/concept-index/', 'Concept index'], ['/about/', 'About'], ...articles]) put(`${route.slice(1)}index.html`, html(title, articles.some(item => item[0] === route)));
  put('pagefind/pagefind.js', `export async function search(query) {
    const mapping = ${JSON.stringify(Object.fromEntries([['idiomatic', articles[0][0]], ['atomic operation', articles[1][0]], ['idempotency', articles[2][0]]]))};
    return {results: ${breakSearch ? '[]' : '[{data: async () => ({url: mapping[query] ?? "/not-found/"})}]'}};
  }`);
  return Promise.resolve().then(() => run(root)).finally(() => rmSync(root, { recursive: true, force: true }));
}

test('headless browser follows authored routes and queries Pagefind runtime', { skip: !findBrowser() }, async () => {
  const output = await fixture(root => runBrowserAudit(root));
  assert.equal(output.pagesChecked, 6);
  assert.equal(output.pilotPagesChecked, 3);
  assert.equal(output.searchesChecked, 3);
  assert.equal(output.mobileWidth, 375);
});

test('headless browser detects a search index that does not return the expected concept', { skip: !findBrowser() }, async () => {
  await assert.rejects(() => fixture(root => runBrowserAudit(root), true), /Pagefind.*idiomatic/i);
});
