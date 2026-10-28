import test from 'node:test';
import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import { spawnSync } from 'node:child_process';
import { fileURLToPath } from 'node:url';

const bloom = readFileSync(new URL('../src/content/docs/data-structures-algorithms/bloom-filter.mdx', import.meta.url), 'utf8');
const mutation = readFileSync(new URL('../src/content/docs/testing-verification/mutation-testing.mdx', import.meta.url), 'utf8');

function example(doc) {
  const found = doc.match(/~~~js\n([\s\S]*?)\n~~~/);
  assert.ok(found, 'runnable Node example is required');
  return found[1];
}
function run(source) {
  return spawnSync(process.execPath, ['--input-type=module', '--eval', source], {
    cwd: fileURLToPath(new URL('..', import.meta.url)),
    timeout: 15000,
    encoding: 'utf8',
  });
}
test('Bloom example inserts and queries a previously absent key', () => {
  const r = run(example(bloom));
  assert.equal(r.status, 0, r.stderr || r.error?.message);
});
test('Bloom insertion is monotonic and never loses any inserted keys in the example', () => {
  const source = example(bloom);
  const extra = String.raw`
const many = createBloom(256, 3);
const inserted = Array.from({length: 50}, (_, i) => "key:" + i);
for (const key of inserted) many.add(key);
for (const key of inserted) {
  if (!many.mightContain(key)) throw new Error("false negative for " + key);
}
`;
  const r = run(source + '\n' + extra);
  assert.equal(r.status, 0, r.stderr || r.error?.message);
});
test('Bloom negative mutation (cleared rather than set bits) violates insertion guarantee', () => {
  const sample = example(bloom);
  assert.ok(sample.includes('bits[index >> 3] |= 1 << (index & 7)'));
  const broken = sample.replace('bits[index >> 3] |= 1 << (index & 7)', 'bits[index >> 3] &= ~(1 << (index & 7))');
  const r = run(broken);
  assert.notEqual(r.status, 0);
  assert.match(r.stderr, /inserted item must remain a candidate/);
});
test('Mutation Testing example demonstrates weak-survived and strong-killed outcomes', () => {
  const r = run(example(mutation));
  assert.equal(r.status, 0, r.stderr || r.error?.message);
});
test('Mutation Testing negative mutation drops the boundary and must fail', () => {
  const sample = example(mutation);
  assert.ok(sample.includes('[[17, false], [18, true], [19, true]]'));
  const broken = sample.replace('[[17, false], [18, true], [19, true]]', '[[17, false], [19, true]]');
  const r = run(broken);
  assert.notEqual(r.status, 0);
  assert.match(r.stderr, /true !== false|true == false|Expected values to be strictly equal/);
});
test('Both articles have ten sections and remain unapproved editorial drafts', () => {
  for(const doc of [bloom, mutation]) {
    assert.match(doc, /Editorial preview — not approved for publication/);
    assert.match(doc, /"editorialStatus": "draft"/);
    assert.doesNotMatch(doc, /"reviewedAt"\s*:/);
    for(const section of ['Precise definition','Why it exists','Mental model','Mechanics and guarantees','Worked example','Failure modes','Trade-offs','Related concepts','Testing and verification','References']) {
      assert.ok(doc.includes('## ' + section), 'missing '+section);
    }
  }
});
