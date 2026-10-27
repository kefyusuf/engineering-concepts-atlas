import test from 'node:test';
import assert from 'node:assert/strict';
import { validatePilotPage } from '../scripts/lib/browser-audit.mjs';

const valid = {
  title: 'Idempotency',
  hasDraftNotice: true,
  hasReferences: true,
  hasCodeSample: true,
  externalSourceLinks: 2,
};

test('pilot page audit accepts a complete unapproved article preview', () => {
  assert.deepEqual(validatePilotPage(valid, 'Idempotency'), []);
});

test('pilot page audit rejects a missing draft notice', () => {
  assert.match(validatePilotPage({ ...valid, hasDraftNotice: false }, 'Idempotency').join('\n'), /editorial draft notice/);
});

test('pilot page audit detects missing references and external links', () => {
  const errors = validatePilotPage({ ...valid, hasReferences: false, externalSourceLinks: 0 }, 'Idempotency').join('\n');
  assert.match(errors, /References heading/);
  assert.match(errors, /source link/);
});

test('pilot page audit detects a missing code example or wrong heading', () => {
  const errors = validatePilotPage({ ...valid, title: 'Wrong page', hasCodeSample: false }, 'Idempotency').join('\n');
  assert.match(errors, /expected heading/);
  assert.match(errors, /code example/);
});
