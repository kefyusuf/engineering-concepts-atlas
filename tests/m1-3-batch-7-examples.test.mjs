import test from 'node:test';
import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import { spawnSync } from 'node:child_process';
import { fileURLToPath } from 'node:url';

const sbom = readFileSync(new URL('../src/content/docs/devops-ci-cd/software-bill-of-materials.mdx', import.meta.url), 'utf8');
const observability = readFileSync(new URL('../src/content/docs/observability-sre/observability.mdx', import.meta.url), 'utf8');

function snippet(doc) {
  const match = doc.match(/~~~js\n([\s\S]*?)\n~~~/);
  assert.ok(match, 'runnable JavaScript example required');
  return match[1];
}
function run(js) {
  return spawnSync(process.execPath, ['--input-type=module', '--eval', js], {
    cwd: fileURLToPath(new URL('..', import.meta.url)),
    timeout: 15000, encoding: 'utf8',
  });
}
test('SBOM model verifies declared three-node direct and transitive graph', () => {
  const result = run(snippet(sbom));
  assert.equal(result.status, 0, result.stderr || result.error?.message);
});
test('SBOM model rejects unresolved transitive dependency', () => {
  const code = snippet(sbom).replace('{ id: "utility", version: "4.1.0", dependsOn: [] },', '');
  assert.notEqual(code, snippet(sbom), 'fixture modification required');
  const result = run(code);
  assert.notEqual(result.status, 0);
  assert.match(result.stderr, /missing component: utility/);
});
test('SBOM model rejects duplicates, blank versions and records unreachable declarations', () => {
  const extra = [
    'const withExtra = { ...inventory, components: [...inventory.components, { id: "orphan", version: "2", dependsOn: [] }] };',
    'if (inspectInventory(withExtra).unreachable.join() !== "orphan") throw new Error("unreachable not detected");',
    'for (const extraComponent of [inventory.components[0], { id: "empty", version: "", dependsOn: [] }]) {',
    '  let rejected = false;',
    '  try { inspectInventory({ ...inventory, components: [...inventory.components, extraComponent] }); }',
    '  catch { rejected = true; }',
    '  if (!rejected) throw new Error("bad inventory accepted");',
    '}',
  ].join('\n');
  const result=run(snippet(sbom)+'\n'+extra);
  assert.equal(result.status,0,result.stderr || result.error?.message);
});
test('observability sample correlates spans and logs but not request count to individual trace', () => {
  const result = run(snippet(observability));
  assert.equal(result.status, 0, result.stderr || result.error?.message);
});
test('observability model rejects a missing parent span', () => {
  const source=snippet(observability);
  const changed=source.replace('parentId: "api"','parentId: "missing"');
  assert.notEqual(source,changed);
  const result=run(changed);
  assert.notEqual(result.status,0);
  assert.match(result.stderr,/orphaned parent span/);
});
test('observability model rejects logs for unknown spans and duplicate span identities', () => {
  const extra=[
    'const withBadLog = { ...data, logs: [{ traceId: "t1", spanId: "none" }] };',
    'let badLog = false;',
    'try { correlateTelemetry(withBadLog, "t1"); } catch (e) { badLog = /log references missing span/.test(e.message); }',
    'if (!badLog) throw new Error("bad log accepted");',
    'const duplicate = { ...data, spans: [...data.spans, data.spans[1]] };',
    'let badDuplicate = false;',
    'try { correlateTelemetry(duplicate,"t1"); } catch (e) { badDuplicate = /duplicate span id/.test(e.message); }',
    'if (!badDuplicate) throw new Error("duplicate accepted");',
  ].join('\n');
  const result=run(snippet(observability)+'\n'+extra);
  assert.equal(result.status,0,result.stderr || result.error?.message);
});
test('observability negative mutation omitting parent validation breaks documented contract', () => {
  const s=snippet(observability);
  const old='if (span.parentId !== null && !ids.has(span.parentId)) {';
  assert.ok(s.includes(old));
  const broken=s.replace(old,'if (false) {');
  const extra=[
    'const invalid={...data,spans: data.spans.map(s=>s.spanId==="db" ? {...s,parentId:"unknown"}:s)};',
    'let rejected = false;',
    'try { correlateTelemetry(invalid, "t1"); } catch { rejected=true; }',
    'if (!rejected) throw new Error("orphan was incorrectly accepted");',
  ].join('\n');
  const result=run(broken+'\n'+extra);
  assert.notEqual(result.status,0);
  assert.match(result.stderr,/orphan was incorrectly accepted/);
});
test('SBOM and Observability are source-backed ten-section editorial drafts, not certified outputs', () => {
  for (const doc of [sbom,observability]) {
    assert.match(doc,/Editorial preview — not approved for publication/);
    assert.match(doc,/"editorialStatus": "draft"/);
    assert.doesNotMatch(doc,/"reviewedAt"\s*:/);
    for(const heading of ['Precise definition','Why it exists','Mental model','Mechanics and guarantees','Worked example','Failure modes','Trade-offs','Related concepts','Testing and verification','References']) {
      assert.ok(doc.includes('## '+heading),'missing '+heading);
    }
  }
  assert.match(sbom,/not.*SPDX\/CycloneDX schema implementation/);
  assert.match(observability,/not valid OpenTelemetry IDs/);
});
