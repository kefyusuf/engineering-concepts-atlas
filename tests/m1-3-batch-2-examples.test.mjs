import test from 'node:test';
import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import { runInNewContext } from 'node:vm';

const observer = readFileSync(new URL('../src/content/docs/oop-design-patterns/observer-pattern.mdx', import.meta.url), 'utf8');
const memory = readFileSync(new URL('../src/content/docs/operating-systems-memory/virtual-memory.mdx', import.meta.url), 'utf8');

function example(article) {
  const match = article.match(/~~~js\n([\s\S]*?)\n~~~/);
  assert.ok(match, 'expected runnable JavaScript code fence');
  return match[1];
}

test('Observer sample demonstrates delivery and unsubscription', () => {
  const createPublisher = runInNewContext(example(observer) + '\ncreatePublisher');
  const publisher = createPublisher();
  const received = [];
  const stop = publisher.subscribe((event) => received.push(event));
  publisher.publish('alpha');
  assert.deepEqual(received, ['alpha']);
  assert.equal(stop(), true);
  publisher.publish('beta');
  assert.deepEqual(received, ['alpha']);
  assert.equal(stop(), false);
});

test('Observer snapshot excludes listeners added during the current emission', () => {
  const createPublisher = runInNewContext(example(observer) + '\ncreatePublisher');
  const bus = createPublisher();
  const sequence = [];
  bus.subscribe(() => {
    sequence.push('original');
    bus.subscribe(() => sequence.push('late'));
  });
  bus.publish('one');
  assert.deepEqual(sequence, ['original']);
  bus.publish('two');
  assert.deepEqual(sequence, ['original','original','late']);
});

test('Observer callback errors propagate under documented fail-fast semantics', () => {
  const createPublisher = runInNewContext(example(observer) + '\ncreatePublisher');
  const bus = createPublisher();
  let invoked = false;
  bus.subscribe(() => { throw new Error('subscriber failure'); });
  bus.subscribe(() => { invoked = true; });
  assert.throws(() => bus.publish('event'), /subscriber failure/);
  assert.equal(invoked, false);
});

test('Virtual Memory arithmetic example preserves page offset and rejects invalid addresses', () => {
  const translate = runInNewContext(example(memory) + '\ntranslate');
  assert.equal(translate(7 * 4096), 23 * 4096);
  assert.equal(translate(7 * 4096 + 4095), 23 * 4096 + 4095);
  assert.throws(() => translate(8 * 4096), /unmapped virtual page/);
  assert.throws(() => translate(-1), /nonnegative safe integer/);
  assert.throws(() => translate(4.5), /nonnegative safe integer/);
});

test('Both articles retain advanced sections and draft review status', () => {
  for (const doc of [observer, memory]) {
    assert.match(doc, /Editorial preview — not approved for publication/);
    assert.match(doc, /"editorialStatus": "draft"/);
    assert.doesNotMatch(doc, /"reviewedAt":/);
    for (const section of ['Precise definition','Why it exists','Mental model','Mechanics and guarantees','Worked example','Failure modes','Trade-offs','Related concepts','Testing and verification','References']) {
      assert.ok(doc.includes('## '+section), 'missing '+section);
    }
  }
});
