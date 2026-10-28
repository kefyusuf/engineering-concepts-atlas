import { resolve } from 'node:path';
import { runBrowserAudit } from './lib/browser-audit.mjs';
import { loadCatalog } from './lib/catalog.mjs';

const root = resolve(import.meta.dirname, '..');
const categories = [...new Set(loadCatalog(root).concepts.map(row => row.category_id))];
const routes = ['/', '/about/', '/concept-index/', ...categories.map(c => `/${c}/`),
  '/programming-language-concepts/idiomatic-programming/',
  '/concurrency-parallelism/atomic-operation/',
  '/distributed-systems/idempotency/',
  '/type-systems/type-inference/',
  '/oop-design-patterns/observer-pattern/',
  '/operating-systems-memory/virtual-memory/',
  '/io-networking/input-output/',
  '/databases-transactions/transaction-isolation-levels/',
  '/functional-programming/pure-function/'];
try {
  const result = await runBrowserAudit(resolve(root, 'dist'), { routes });
  console.log('Browser smoke PASS:', JSON.stringify(result, null, 2));
} catch (error) {
  console.error('Browser smoke FAIL:', error.message);
  process.exitCode = 1;
}
