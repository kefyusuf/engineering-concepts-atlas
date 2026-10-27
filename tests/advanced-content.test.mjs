import test from 'node:test';
import assert from 'node:assert/strict';
import { readFileSync, mkdtempSync, writeFileSync, rmSync } from 'node:fs';
import { tmpdir } from 'node:os';
import { join } from 'node:path';
import { runInNewContext } from 'node:vm';
import ts from 'typescript';

const typePage = readFileSync(new URL('../src/content/docs/type-systems/type-inference.mdx', import.meta.url), 'utf8');
const purePage = readFileSync(new URL('../src/content/docs/functional-programming/pure-function.mdx', import.meta.url), 'utf8');

function fenced(body, lang) {
  const match = body.match(new RegExp('~~~' + lang + '\\n([\\s\\S]*?)\\n~~~'));
  assert.ok(match, 'expected documented ' + lang + ' example');
  return match[1];
}

test('advanced TypeScript article example passes strict static compilation', () => {
  const folder = mkdtempSync(join(tmpdir(), 'atlas-type-example-'));
  try {
    const file = join(folder, 'example.ts');
    const snippet = fenced(typePage, 'ts');
    writeFileSync(file, snippet);
    const config = { strict: true, target: ts.ScriptTarget.ES2022, module: ts.ModuleKind.ESNext, noEmit: true, skipLibCheck: true };
    const program = ts.createProgram([file], config);
    const errors = ts.getPreEmitDiagnostics(program);
    assert.deepEqual(errors.map(d => ts.flattenDiagnosticMessageText(d.messageText, '\n')), []);
    const invalidFile = join(folder, 'negative.ts');
    writeFileSync(invalidFile, snippet + '\nconst mustFail: number = "not a number";\n');
    const invalidProgram = ts.createProgram([invalidFile], config);
    assert.ok(ts.getPreEmitDiagnostics(invalidProgram).some(d => d.code === 2322), 'type mismatch must be rejected');
  } finally {
    rmSync(folder, { recursive: true, force: true });
  }
});

test('pure-function documented JavaScript example executes deterministically without input mutation', () => {
  const code = fenced(purePage, 'js');
  const subtotal = runInNewContext(code + '\nsubtotal');
  const input = Object.freeze([Object.freeze({ unitPrice: 100, quantity: 2 }), Object.freeze({ unitPrice: 50, quantity: 1 })]);
  const previous = JSON.stringify(input);
  for (let i = 0; i < 10; i++) assert.equal(subtotal(input), 250);
  assert.equal(JSON.stringify(input), previous);
});

test('new concept articles remain visibly drafts without fabricated review metadata', () => {
  for (const page of [typePage, purePage]) {
    assert.match(page, /Editorial preview — not approved for publication/);
    assert.match(page, /"editorialStatus": "draft"/);
    assert.doesNotMatch(page, /"reviewedAt"\s*:/);
    for (const section of ['Precise definition', 'Why it exists', 'Mental model', 'Mechanics and guarantees', 'Worked example', 'Failure modes', 'Trade-offs', 'Related concepts', 'Testing and verification', 'References']) {
      assert.ok(page.includes('## ' + section), 'missing ' + section);
    }
  }
});
