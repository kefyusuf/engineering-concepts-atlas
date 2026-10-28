import test from 'node:test';
import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import { spawnSync } from 'node:child_process';

const ast = readFileSync(new URL('../src/content/docs/compilers-runtimes/abstract-syntax-tree.mdx', import.meta.url), 'utf8');
const http = readFileSync(new URL('../src/content/docs/http-api-integration/http-method-semantics.mdx', import.meta.url), 'utf8');

function jsExample(article) {
  const found = article.match(/~~~js\n([\s\S]*?)\n~~~/);
  assert.ok(found, 'an executable JavaScript example is required');
  return found[1];
}
function run(code) {
  return spawnSync(process.execPath, ['--input-type=module', '--eval', code], {
    cwd: new URL('..', import.meta.url).pathname, encoding: 'utf8', timeout: 20000
  });
}
test('AST example parses and walks the documented declaration using TypeScript', () => {
  const result = run(jsExample(ast));
  assert.equal(result.status, 0, result.stderr || result.error?.message);
});
test('AST negative example rejects malformed source syntax', () => {
  const sample = jsExample(ast);
  assert.match(sample, /"const total = 2 \+ 3;"/);
  const corrupt = sample.replace('"const total = 2 + 3;"', '"const total = ;"');
  const result = run(corrupt);
  assert.notEqual(result.status, 0, 'parse diagnostics must fail the example');
  assert.match(result.stderr, /unexpected parse diagnostics/);
});
test('HTTP example exercises real loopback GET, HEAD, PUT, POST, DELETE', () => {
  const result = run(jsExample(http));
  assert.equal(result.status, 0, result.stderr || result.error?.message);
});
test('HTTP negative example detects mutation on GET', () => {
  const sample = jsExample(http);
  const original = 'response.writeHead(representation === null ? 404 : 200).end(representation ?? "");';
  assert.ok(sample.includes(original));
  const corrupt = sample.replace(original, 'representation = "changed"; ' + original);
  const result = run(corrupt);
  assert.notEqual(result.status, 0, 'mutating GET must be rejected by sample assertion');
  assert.match(result.stderr, /GET changed the resource/);
});
test('M1.3 batch 4 sources are ten-section drafts without review metadata', () => {
  for (const page of [ast,http]) {
    assert.match(page, /Editorial preview — not approved for publication/);
    assert.match(page, /"editorialStatus": "draft"/);
    assert.doesNotMatch(page, /"reviewedAt"\s*:/);
    for(const heading of ['Precise definition','Why it exists','Mental model','Mechanics and guarantees','Worked example','Failure modes','Trade-offs','Related concepts','Testing and verification','References']){
      assert.ok(page.includes('## '+heading), 'missing heading '+heading);
    }
  }
});
