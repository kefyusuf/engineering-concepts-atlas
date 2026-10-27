import test from 'node:test';
import assert from 'node:assert/strict';
import { browserCandidates } from '../scripts/lib/browser-audit.mjs';

test('Windows browser discovery finds Chrome and Edge in standard installation directories', () => {
  const paths = browserCandidates({ ProgramFiles: 'C:\\Program Files', 'PROGRAMFILES(X86)': 'C:\\Program Files (x86)', LOCALAPPDATA: 'C:\\Users\\dev\\AppData\\Local' }, 'win32');
  assert.ok(paths.includes('C:\\Program Files\\Google\\Chrome\\Application\\chrome.exe'));
  assert.ok(paths.includes('C:\\Program Files (x86)\\Microsoft\\Edge\\Application\\msedge.exe'));
  assert.ok(paths.includes('C:\\Users\\dev\\AppData\\Local\\Google\\Chrome\\Application\\chrome.exe'));
});

test('browser discovery respects CHROME_BIN in any platform', () => {
  assert.equal(browserCandidates({ CHROME_BIN: '/custom/browser' }, 'linux')[0], '/custom/browser');
});
