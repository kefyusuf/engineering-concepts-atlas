import test from 'node:test';
import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import { spawnSync } from 'node:child_process';
import { fileURLToPath } from 'node:url';

const bounded = readFileSync(new URL('../src/content/docs/software-architecture/bounded-context.mdx', import.meta.url), 'utf8');
const tail = readFileSync(new URL('../src/content/docs/performance-engineering/tail-latency.mdx', import.meta.url), 'utf8');

function example(article) {
  const match = article.match(/~~~js\n([\s\S]*?)\n~~~/);
  assert.ok(match, 'runnable JavaScript example required');
  return match[1];
}
function run(source) {
  return spawnSync(process.execPath, ['--input-type=module', '--eval', source], {
    cwd: fileURLToPath(new URL('..', import.meta.url)),
    timeout: 15000, encoding: 'utf8'
  });
}
test('bounded context sample executes its translation contract', () => {
  const result=run(example(bounded));
  assert.equal(result.status,0,result.stderr || result.error?.message);
});
test('bounded context maps hold, avoids field leakage and rejects unknown states', () => {
  const extra=[
    'const blocked = salesToShipping({orderId:"B-2",status:"hold"});',
    'if (blocked.fulfillmentState !== "blocked") throw new Error("hold must block");',
    'if ("orderId" in blocked || "status" in blocked) throw new Error("Sales model leaked");',
    'let rejected = false;',
    'try { salesToShipping({orderId:"C-3",status:"unknown"}); }',
    'catch (error) { rejected = /unknown Sales status/.test(error.message); }',
    'if (!rejected) throw new Error("unknown state not rejected");',
  ].join('\n');
  const result=run(example(bounded)+'\n'+extra);
  assert.equal(result.status,0,result.stderr || result.error?.message);
});
test('bounded context mutation that removes the guard must fail', () => {
  const sample=example(bounded);
  const old='if (!Object.hasOwn(statusMap, order.status)) {';
  assert.ok(sample.includes(old));
  const broken=sample.replace(old,'if (false) {');
  const extra=[
    'let rejected=false;',
    'try { salesToShipping({orderId:"C-3",status:"unknown"}); }',
    'catch { rejected=true; }',
    'if (!rejected) throw new Error("unknown state accepted");'
  ].join('\n');
  const result=run(broken+'\n'+extra);
  assert.notEqual(result.status,0);
  assert.match(result.stderr,/unknown state accepted/);
});
test('tail latency nearest-rank example reports median and p99', () => {
  const result=run(example(tail));
  assert.equal(result.status,0,result.stderr || result.error?.message);
});
test('tail latency sample rejects invalid input and leaves input array unchanged', () => {
  const extra=[
    'const data=[40,10,20,30];',
    'const prior=[...data];',
    'if (nearestRankPercentile(data,0.75)!==30) throw new Error("p75 incorrect");',
    'if (data.join()!==prior.join()) throw new Error("input mutated");',
    'for (const input of [[],[-1],[NaN],[Infinity]]) {',
    '  let rejected=false;',
    '  try { nearestRankPercentile(input,0.99); } catch { rejected=true; }',
    '  if (!rejected) throw new Error("invalid input accepted");',
    '}',
    'for (const fraction of [0,-0.5,1.1,NaN]) {',
    '  let rejected=false;',
    '  try { nearestRankPercentile([10],fraction); } catch { rejected=true; }',
    '  if (!rejected) throw new Error("invalid fraction accepted");',
    '}',
  ].join('\n');
  const result=run(example(tail)+'\n'+extra);
  assert.equal(result.status,0,result.stderr || result.error?.message);
});
test('tail latency mutation returning the minimum fails p99 assertion', () => {
  const sample=example(tail);
  const old='return sorted[Math.ceil(fraction * sorted.length) - 1];';
  assert.ok(sample.includes(old));
  const broken=sample.replace(old,'return sorted[0];');
  const result=run(broken);
  assert.notEqual(result.status,0);
  assert.match(result.stderr,/tail quantile result mismatch/);
});
test('batch 6 articles retain ten sections, sources and draft-only editorial status', () => {
  for(const article of [bounded,tail]) {
    assert.match(article,/Editorial preview — not approved for publication/);
    assert.match(article,/"editorialStatus": "draft"/);
    assert.doesNotMatch(article,/"reviewedAt"\s*:/);
    for(const heading of ['Precise definition','Why it exists','Mental model','Mechanics and guarantees','Worked example','Failure modes','Trade-offs','Related concepts','Testing and verification','References']) {
      assert.ok(article.includes('## '+heading),'missing heading '+heading);
    }
  }
});
