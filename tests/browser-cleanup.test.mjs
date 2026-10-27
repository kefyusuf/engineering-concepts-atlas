import test from 'node:test';
import assert from 'node:assert/strict';
import { cleanupBrowserProfile } from '../scripts/lib/browser-audit.mjs';

test('browser-profile cleanup failure is reported without replacing a prior browser audit failure', () => {
  const error = new Error('directory still in use');
  error.code = 'ENOTEMPTY';
  assert.match(cleanupBrowserProfile('/not-real', () => { throw error; }), /ENOTEMPTY.*directory still in use/);
});

test('successful cleanup produces no warning', () => {
  assert.equal(cleanupBrowserProfile('/not-real', () => {}), null);
});
