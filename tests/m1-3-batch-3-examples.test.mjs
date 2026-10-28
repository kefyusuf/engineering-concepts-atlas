import test from 'node:test';
import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import { spawnSync } from 'node:child_process';
import { runInNewContext } from 'node:vm';

const io = readFileSync(new URL('../src/content/docs/io-networking/input-output.mdx', import.meta.url), 'utf8');
const isolation = readFileSync(new URL('../src/content/docs/databases-transactions/transaction-isolation-levels.mdx', import.meta.url), 'utf8');

function fence(article, language) {
  const found = article.match(new RegExp('~~~' + language + '\\n([\\s\\S]*?)\\n~~~'));
  assert.ok(found, 'expected runnable ' + language + ' example');
  return found[1];
}

test('real asynchronous Node.js I/O example runs with correct byte counts and EOF', () => {
  const example = fence(io, 'js');
  const result = spawnSync(process.execPath, ['--input-type=module', '--eval', example], { encoding: 'utf8', timeout: 15000 });
  assert.equal(result.status, 0, result.stderr || result.stdout || String(result.error));
});

test('incorrect I/O byte-count expectation is rejected in a negative run', () => {
  const example = fence(io, 'js');
  assert.ok(example.includes('Buffer.from("abc")'));
  const corrupted = example.replace('Buffer.from("abc")', 'Buffer.from("ab")');
  const result = spawnSync(process.execPath, ['--input-type=module', '--eval', corrupted], { encoding: 'utf8', timeout: 15000 });
  assert.notEqual(result.status, 0, 'incorrect transfer assumption must fail');
  assert.match(result.stderr, /expected three bytes/);
});

test('abstract isolation schedule illustrates write skew without claiming database execution', () => {
  const snippet = fence(isolation, 'js');
  const evaluateOnCallSchedule = runInNewContext(snippet + '\nevaluateOnCallSchedule');
  assert.equal(evaluateOnCallSchedule({ abortSecond: false }), 0);
  assert.equal(evaluateOnCallSchedule({ abortSecond: true }), 1);
  assert.match(isolation, /does not simulate PostgreSQL MVCC/);
});

test('isolation page documents specific PostgreSQL behavior and the two-session manual SQL scenario', () => {
  assert.match(isolation, /PostgreSQL 18/);
  assert.match(isolation, /Read Uncommitted/);
  assert.match(isolation, /Read Committed/);
  assert.match(isolation, /Repeatable Read/);
  assert.match(isolation, /Serializable/);
  assert.match(isolation, /write skew/i);
  assert.match(isolation, /40001/);
  assert.match(fence(isolation, 'sql'), /CREATE TABLE on_call/);
  assert.match(isolation, /two-session PostgreSQL 18 teaching script/);
});

test('both deep dives contain ten advanced sections and never claim review approval', () => {
  for (const page of [io, isolation]) {
    assert.match(page, /Editorial preview — not approved for publication/);
    assert.match(page, /"editorialStatus": "draft"/);
    assert.doesNotMatch(page, /"reviewedAt"\s*:/);
    for (const heading of ['Precise definition','Why it exists','Mental model','Mechanics and guarantees','Worked example','Failure modes','Trade-offs','Related concepts','Testing and verification','References']) {
      assert.ok(page.includes('## '+heading), 'missing section: '+heading);
    }
  }
});
