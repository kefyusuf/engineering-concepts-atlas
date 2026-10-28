import test from 'node:test';
import assert from 'node:assert/strict';
import { join, resolve } from 'node:path';
import { mkdtempSync, mkdirSync, writeFileSync, rmSync } from 'node:fs';
import { tmpdir } from 'node:os';
import { auditSourceNavigation } from '../scripts/lib/source-navigation.mjs';

const root = resolve(import.meta.dirname, '..');

test('all authored source pages have resolvable root-relative Markdown and hero links', () => {
  const result = auditSourceNavigation(join(root, 'src/content/docs'));
  assert.equal(result.pageCount, 30);
  assert.ok(result.linkCount >= 10);
  assert.deepEqual(result.errors, []);
});

test('broken Markdown source links are rejected', () => {
  const temp = mkdtempSync(join(tmpdir(), 'eca-nav-'));
  try {
    writeFileSync(join(temp, 'index.md'), '---\ntitle: X\n---\n[Broken](/missing/)');
    assert.match(auditSourceNavigation(temp).errors.join('\n'), /missing/);
  } finally { rmSync(temp, { recursive: true, force: true }); }
});

test('broken hero links are rejected without a renderer', () => {
  const temp = mkdtempSync(join(tmpdir(), 'eca-nav-'));
  try {
    writeFileSync(join(temp, 'index.mdx'), '---\ntitle: X\nhero:\n  actions:\n    - link: /gone/\n---');
    assert.match(auditSourceNavigation(temp).errors.join('\n'), /gone/);
  } finally { rmSync(temp, { recursive: true, force: true }); }
});
