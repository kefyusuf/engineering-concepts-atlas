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
  '/compilers-runtimes/abstract-syntax-tree/',
  '/http-api-integration/http-method-semantics/',
  '/data-structures-algorithms/bloom-filter/',
  '/testing-verification/mutation-testing/',
  '/software-architecture/bounded-context/',
  '/performance-engineering/tail-latency/',
  '/devops-ci-cd/software-bill-of-materials/',
  '/observability-sre/observability/',
  '/functional-programming/pure-function/'];
try {
  const screenshotsDir = process.env.ATLAS_CAPTURE_SCREENSHOTS === 'true' ? resolve(root, 'evidence/ci/screenshots') : undefined;
  const result = await runBrowserAudit(resolve(root, 'dist'), { routes, screenshotsDir });
  console.log('Browser smoke PASS:', JSON.stringify(result, null, 2));
} catch (error) {
  console.error('Browser smoke FAIL:', error.message);
  process.exitCode = 1;
}
