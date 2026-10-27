import { existsSync } from 'node:fs';
import { join, resolve } from 'node:path';
import { assessM12Environment } from './lib/environment.mjs';
import { findBrowser } from './lib/browser-audit.mjs';

const root = resolve(import.meta.dirname, '..');
const browser = findBrowser();
const result = assessM12Environment({
  nodeVersion: process.version,
  hasDependencies: existsSync(join(root, 'node_modules/astro/package.json')) && existsSync(join(root, 'node_modules/@astrojs/starlight/package.json')),
  hasLockfile: existsSync(join(root, 'package-lock.json')),
  hasChromium: Boolean(browser),
});
console.log(JSON.stringify({
  status: result.ready ? 'READY_TO_VERIFY' : 'BLOCKED',
  nodeVersion: process.version,
  browser: browser ?? null,
  errors: result.errors,
}, null, 2));
if (!result.ready) process.exitCode = 1;
