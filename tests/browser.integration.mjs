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
  ['/type-systems/type-inference/', 'Type Inference'],
  ['/functional-programming/pure-function/', 'Pure Function'],
  ['/oop-design-patterns/observer-pattern/', 'Observer Pattern'],
  ['/operating-systems-memory/virtual-memory/', 'Virtual Memory'],
  ['/io-networking/input-output/', 'Input/Output (I/O)'],
  ['/databases-transactions/transaction-isolation-levels/', 'Transaction Isolation Levels'],
  ['/compilers-runtimes/abstract-syntax-tree/', 'Abstract Syntax Tree (AST)'],
  ['/http-api-integration/http-method-semantics/', 'HTTP Method Semantics'],
  ['/data-structures-algorithms/bloom-filter/', 'Bloom Filter'],
  ['/testing-verification/mutation-testing/', 'Mutation Testing'],
  ['/software-architecture/bounded-context/', 'Bounded Context'],
  ['/performance-engineering/tail-latency/', 'Tail Latency'],
  ['/devops-ci-cd/sbom/', 'Software Bill of Materials (SBOM)'],
  ['/observability-sre/observability/', 'Observability'],
];
function fixture(run, breakSearch = false) {
  const root = mkdtempSync(join(tmpdir(), 'atlas-browser-fixture-'));
  const put = (name, body) => { const path = join(root, name); mkdirSync(dirname(path), { recursive: true }); writeFileSync(path, body); };
  const html = (title, isPilot) => `<!doctype html><html lang="en"><head><meta charset="utf-8"><meta name="viewport" content="width=device-width, initial-scale=1"><title>${title}</title></head><body><main><h1>${title}</h1><a href="/concept-index/">Concept index</a>${isPilot ? '<aside>Editorial preview — not approved for publication</aside><pre><code>example();</code></pre><h2>References</h2><a href="https://example.org/source">Primary source</a>' : ''}</main></body></html>`;
  for (const [route, title] of [['/', 'Engineering Concepts Atlas'], ['/concept-index/', 'Concept index'], ['/about/', 'About'], ...articles]) put(`${route.slice(1)}index.html`, html(title, articles.some(item => item[0] === route)));
  put('pagefind/pagefind.js', `export async function search(query) {
    const mapping = ${JSON.stringify(Object.fromEntries([['idiomatic', articles[0][0]], ['atomic operation', articles[1][0]], ['idempotency', articles[2][0]], ['type inference', articles[3][0]], ['pure function', articles[4][0]], ['observer pattern', articles[5][0]], ['virtual memory', articles[6][0]], ['input output', articles[7][0]], ['transaction isolation levels', articles[8][0]], ['abstract syntax tree', articles[9][0]], ['http method semantics', articles[10][0]], ['bloom filter', articles[11][0]], ['mutation testing', articles[12][0]], ['bounded context', articles[13][0]], ['tail latency', articles[14][0]], ['software bill of materials', articles[15][0]], ['observability', articles[16][0]]]))};
    return {results: ${breakSearch ? '[]' : '[{data: async () => ({url: mapping[query] ?? "/not-found/"})}]'}};
  }`);
  return Promise.resolve().then(() => run(root)).finally(() => rmSync(root, { recursive: true, force: true }));
}

test('headless browser follows authored routes and queries Pagefind runtime', { skip: !findBrowser() }, async () => {
  const output = await fixture(root => runBrowserAudit(root, { basePath: '' }));
  assert.equal(output.pagesChecked, 20);
  assert.equal(output.pilotPagesChecked, 17);
  assert.equal(output.searchesChecked, 17);
  assert.equal(output.mobileWidth, 375);
});

test('headless browser detects a search index that does not return the expected concept', { skip: !findBrowser() }, async () => {
  await assert.rejects(() => fixture(root => runBrowserAudit(root, { basePath: '' }), true), /Pagefind.*idiomatic/i);
});
