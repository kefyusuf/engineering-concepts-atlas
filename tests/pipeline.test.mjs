import test from 'node:test';
import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';

const workflow = readFileSync(new URL('../.github/workflows/ci.yml', import.meta.url), 'utf8');

test('CI validates browser harness before auditing compiled output', () => {
  const harness = workflow.indexOf('npm run test:browser');
  const build = workflow.indexOf('npm run build');
  const liveAudit = workflow.indexOf('npm run verify:browser');
  assert.ok(harness >= 0, 'CI must run the positive and negative browser harness tests');
  assert.ok(build > harness, 'real build must follow browser harness tests');
  assert.ok(liveAudit > build, 'real browser audit must follow the build');
});

test('one-shot local M1.2 verification follows the gate order', () => {
  const pkg = JSON.parse(readFileSync(new URL('../package.json', import.meta.url), 'utf8'));
  const cmd = pkg.scripts['verify:m1-2'];
  assert.ok(cmd, 'provide a single local M1.2 verification command');
  const steps = ['test', 'validate:content', 'check', 'build', 'test:browser', 'verify:browser'];
  let previous = -1;
  for (const step of steps) {
    const at = cmd.indexOf(`npm run ${step}`);
    assert.ok(at > previous, `${step} must be present in the correct order`);
    previous = at;
  }
  assert.equal(cmd.split(' && ').length, steps.length, 'fail on first unsuccessful gate');
});
