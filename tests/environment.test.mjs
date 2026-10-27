import test from 'node:test';
import assert from 'node:assert/strict';
import { assessM12Environment } from '../scripts/lib/environment.mjs';

test('M1.2 prerequisite check rejects an older Node.js 22', () => {
  const result = assessM12Environment({ nodeVersion: 'v22.16.0', hasDependencies: true, hasLockfile: true, hasChromium: true });
  assert.equal(result.ready, false);
  assert.match(result.errors.join(' '), /Node\.js.*22\.23\.4/);
});

test('M1.2 prerequisite check accepts a supported Node.js 22 or 24', () => {
  for (const version of ['v22.23.4', 'v22.25.0', 'v24.0.0']) {
    const result = assessM12Environment({ nodeVersion: version, hasDependencies: true, hasLockfile: true, hasChromium: true });
    assert.deepEqual(result.errors, []);
  }
});

test('M1.2 prerequisite check never treats odd-numbered releases as supported', () => {
  const result = assessM12Environment({ nodeVersion: 'v23.7.0', hasDependencies: true, hasLockfile: true, hasChromium: true });
  assert.equal(result.ready, false);
});

test('M1.2 prerequisite check names missing npm dependencies, lockfile and Chromium', () => {
  const result = assessM12Environment({ nodeVersion: 'v24.1.0', hasDependencies: false, hasLockfile: false, hasChromium: false });
  assert.equal(result.errors.length, 3);
  assert.match(result.errors.join(' '), /npm install/);
  assert.match(result.errors.join(' '), /package-lock\.json/);
  assert.match(result.errors.join(' '), /Chromium/);
});
