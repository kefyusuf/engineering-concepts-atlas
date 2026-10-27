import { resolve } from 'node:path';
import { loadCatalog } from './lib/catalog.mjs';
import { auditDist, REQUIRED_ROUTES } from './lib/dist-audit.mjs';

const root = resolve(import.meta.dirname, '..');
const output = resolve(root, 'dist');
const catalog = loadCatalog(root);
const categories = [...new Set(catalog.concepts.map((concept) => concept.category_id))];
const requiredRoutes = [
  ...REQUIRED_ROUTES,
  ...categories.map((category) => `/${category}/`),
];
const result = auditDist(output, { requiredRoutes });
if (result.errors.length) {
  console.error(`Build smoke FAILED (${result.errors.length} findings):\n${result.errors.map(e => '- ' + e).join('\n')}`);
  process.exitCode = 1;
} else {
  console.log(`Build smoke PASS: ${result.htmlCount} HTML pages, ${requiredRoutes.length} required routes, internal links, Pagefind manifest with ${result.pagefindPageCount} indexed pages.`);
}
