import test from 'node:test';
import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import { fileURLToPath } from 'node:url';
import { dirname, resolve } from 'node:path';
import { parseCsv, loadCatalog, validateCatalog, readConceptPages, validateConceptPage, auditSite } from '../scripts/lib/catalog.mjs';

const ROOT = resolve(dirname(fileURLToPath(import.meta.url)), '..');
const catalog = () => loadCatalog(ROOT);

test('RFC-4180 CSV parser preserves quoted commas and escaped quotes', () => {
  const rows = parseCsv('id,label\r\na,"alpha, ""beta"""\r\n');
  assert.deepEqual(rows, [{ id: 'a', label: 'alpha, "beta"' }]);
});

test('the M0 catalog is 100 unique IDs, 20 categories, and 20 seeds', () => {
  const c = catalog();
  const ids = new Set(c.concepts.map((row) => row.concept_id));
  const categories = new Set(c.concepts.map((row) => row.category_id));
  assert.equal(c.concepts.length, 100);
  assert.equal(ids.size, 100);
  assert.equal(categories.size, 20);
  assert.equal(c.concepts.filter((row) => row.m1_seed === 'yes').length, 20);
  assert.deepEqual(validateCatalog(c), []);
});

test('18 relations are typed and refer only to existing concepts', () => {
  const c = catalog();
  assert.equal(c.relationships.length, 18);
  assert.deepEqual(validateCatalog(c), []);
});

test('rejects missing relationship endpoints', () => {
  const c = catalog();
  c.relationships[0] = { ...c.relationships[0], target_concept_id: 'missing.key' };
  assert.match(validateCatalog(c).join(' '), /unknown target/i);
});

test('rejects duplicate concept IDs', () => {
  const c = catalog();
  c.concepts[1] = { ...c.concepts[1], concept_id: c.concepts[0].concept_id };
  assert.match(validateCatalog(c).join(' '), /duplicate concept/i);
});

test('all categories have real navigable overview files, but seven M1 seed preview concept routes exist', () => {
  const pages = readConceptPages(ROOT);
  assert.equal(pages.length, 7);
  assert.equal(pages.filter((p) => p.meta.editorialStatus === 'draft').length, 7);
  assert.equal(pages.filter((p) => p.meta.editorialStatus === 'published').length, 0);
  assert.ok(pages.some((p) => p.meta.conceptId === 'types.type-inference'));
  assert.ok(pages.some((p) => p.meta.conceptId === 'functional.pure-function'));
  assert.ok(pages.some((p) => p.meta.conceptId === 'patterns.observer-pattern'));
  assert.ok(pages.some((p) => p.meta.conceptId === 'os.virtual-memory'));
  const errors = auditSite(ROOT);
  assert.deepEqual(errors, []);
});

test('wrong category, unknown relation, and missing source are rejected', () => {
  const c = catalog();
  const original = readConceptPages(ROOT)[0];
  assert.match(validateConceptPage({ ...original, meta: { ...original.meta, category: 'unknown' } }, c).join(' '), /category/i);
  assert.match(validateConceptPage({ ...original, meta: { ...original.meta, related: [{ conceptId: 'none.none', relation: 'related_to' }] } }, c).join(' '), /unknown related/i);
  assert.match(validateConceptPage({ ...original, meta: { ...original.meta, sources: [] } }, c).join(' '), /source/i);
});

test('unreviewed content cannot falsely claim published status', () => {
  const c = catalog();
  const original = readConceptPages(ROOT)[0];
  const errors = validateConceptPage({ ...original, meta: { ...original.meta, editorialStatus: 'published' } }, c);
  assert.match(errors.join(' '), /reviewedAt|reviewer/i);
});

test('catalog remains editable, but M1 release stays gated until 20 approved articles', () => {
  const pages = readConceptPages(ROOT);
  assert.equal(pages.filter((p) => p.meta.editorialStatus === 'published').length, 0);
  assert.equal(pages.length < 20, true);
});

test('release command blocks all unreviewed preview content (actual process gate)', async () => {
  const { spawnSync } = await import('node:child_process');
  const result = spawnSync(process.execPath, ['scripts/verify-publication.mjs'], {
    cwd: ROOT, encoding: 'utf8', timeout: 10000,
  });
  assert.equal(result.status, 1);
  assert.match(result.stderr, /Release blocked/);
  assert.match(result.stderr, /requires 20 approved articles/);
});
