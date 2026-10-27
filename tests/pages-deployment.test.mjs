import test from 'node:test';
import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import { pagesConfig, addBase, rebaseDocumentLinks } from '../scripts/lib/pages-config.mjs';

const workflow = readFileSync(new URL('../.github/workflows/ci.yml', import.meta.url), 'utf8');
const astro = readFileSync(new URL('../astro.config.mjs', import.meta.url), 'utf8');
const home = readFileSync(new URL('../src/content/docs/index.mdx', import.meta.url), 'utf8');

test('repository pages URL derives from GitHub repository; local build stays root', () => {
  assert.deepEqual(pagesConfig({}), { base: '', site: undefined, preview: false });
  assert.deepEqual(pagesConfig({ GITHUB_PAGES: 'true', GITHUB_REPOSITORY: 'kefyusuf/engineering-concepts-atlas' }), {
    base: '/engineering-concepts-atlas', site: 'https://kefyusuf.github.io', preview: true,
  });
  assert.equal(pagesConfig({ GITHUB_PAGES: 'true', GITHUB_REPOSITORY: 'acme/acme.github.io' }).base, '');
});

test('internal root links are rebased exactly once and external links are unchanged', () => {
  const base = '/engineering-concepts-atlas';
  assert.equal(addBase('/concept-index/', base), `${base}/concept-index/`);
  assert.equal(addBase(`${base}/concept-index/`, base), `${base}/concept-index/`);
  assert.equal(addBase('//cdn.example.com/hi.js', base), '//cdn.example.com/hi.js');
  assert.equal(addBase('https://example.org', base), 'https://example.org');
  assert.equal(addBase('/concept-index/', ''), '/concept-index/');
  const tree = { type: 'root', children: [
    { type: 'element', tagName: 'a', properties: { href: '/idempotency/' } },
    { type: 'element', tagName: 'img', properties: { src: '/favicon.svg' } },
    { type: 'element', tagName: 'a', properties: { href: 'https://rfc-editor.org' } },
  ] };
  rebaseDocumentLinks(base)(tree);
  assert.equal(tree.children[0].properties.href, `${base}/idempotency/`);
  assert.equal(tree.children[1].properties.src, `${base}/favicon.svg`);
  assert.equal(tree.children[2].properties.href, 'https://rfc-editor.org');
});

test('Pages workflow deploys only after successful main-branch CI, never for PR', () => {
  assert.match(workflow, /GITHUB_PAGES:\s*'true'/);
  assert.match(workflow, /actions\/upload-pages-artifact@v4/);
  assert.match(workflow, /actions\/deploy-pages@v4/);
  assert.match(workflow, /deploy-preview:[\s\S]+needs: checks/);
  assert.match(workflow, /if: github\.event_name == 'push' && github\.ref == 'refs\/heads\/main'/);
  assert.match(workflow, /pages: write/);
  assert.match(workflow, /id-token: write/);
  assert.ok(workflow.indexOf('npm run verify:browser') < workflow.indexOf('actions/upload-pages-artifact@v4'));
});

test('static preview is explicitly non-production and discourages search indexing', () => {
  assert.match(home, /PUBLIC EDITORIAL PREVIEW — NOT A RELEASE/);
  assert.match(astro, /noindex, nofollow/);
  assert.match(astro, /Engineering Concepts Atlas — Editorial Preview/);
  assert.match(astro, /rebaseDocumentLinks/);
  assert.match(home, /link: \.\/concept-index\//);
  assert.match(home, /link: \.\/about\//);
});


test('Starlight favicon is authored root-relative and receives Pages prefix only once', () => {
  assert.match(astro, /favicon:\s*['"]\/favicon\.svg['"]/);
  assert.doesNotMatch(astro, /favicon:\s*`\$\{pages\.base\}/);
});
