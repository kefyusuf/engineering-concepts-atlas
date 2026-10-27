# M1.2 — Build and Browser Verification Gate

**Status:** PARTIAL / ENVIRONMENT-BLOCKED (2026-10-27)
**Scope:** Verify M1.1 Astro/Starlight preview before expanding the 20-article seed.

## Baseline

- The M0 v0.2 catalog and documentation remain intact.
- 100 catalog candidates, 20 categories, 18 typed relations and three unreviewed pilot pages.
- Local source contains 26 authored routes: home, about, index, 20 categories and three pilot articles.
- This stage does not mark any draft as reviewed or create a public release.

## Validation improvements completed

1. Added test-first `scripts/lib/source-navigation.mjs`, validating root-relative Markdown links and homepage hero links without npm dependencies.
2. Replaced the minimal output checker with the test-first `scripts/lib/dist-audit.mjs`. It inspects generated HTML for broken root-relative and page-relative links, missing local assets, missing required routes, absent Pagefind runtime, missing `.pf_index` fragments and empty/invalid Pagefind manifests.
3. `scripts/check-dist.mjs` now derives all 20 required category routes from the M0 catalog rather than checking only three pilot paths.
4. Added synthetic generated-site fixtures to test the output checker honestly. Synthetic fixture passes do **not** count as an actual Astro build.
5. Added a real process-level negative test for the independent-review publication gate.

## Evidence matrix

| Gate | Result | Evidence or blocker |
| --- | --- | --- |
| Node built-in tests | PASS | `npm test`, all tests passed; synthetic fixtures only for dist tests |
| Catalog + source navigation | PASS | `npm run validate:content`, all source routes and 14 root-relative links validated |
| M0 catalog continuity | PASS | 100 concepts; 20 categories; 18 relationships |
| Release gate negative test | PASS | `scripts/verify-publication.mjs` rejects 0/20 published articles |
| Node toolchain prerequisite | BLOCKED | Execution image contains Node 22.16.0; Astro 7 requires >=22.23.4 |
| npm dependency installation | BLOCKED | `registry.npmjs.org` DNS resolution failed in this execution environment |
| Astro TypeScript check | NOT RUN | npm dependencies unavailable |
| Astro build | NOT RUN | npm dependencies unavailable; no compiled `dist/` exists |
| Output smoke against actual Astro build | NOT RUN | `npm run build` must generate `dist/` first |
| Pagefind search relevance | NOT RUN | Requires compiled Pagefind index and real browser checks |
| Responsive and keyboard accessibility | NOT RUN | Requires actual compiled site and browser |
| GitHub Actions checks | NOT RUN | No repository remote/CI execution supplied |
| Public release | BLOCKED | Requires all 20 independently reviewed seed articles and runtime checks |

## Reproduction on a supported workstation

Use Node >=22.23.4 (supported even-numbered LTS line). From the package root:

```bash
node --version
npm install --no-audit --no-fund
npm run test
npm run validate:content
npm run check
npm run build
npm run preview
```

Open the URL printed by Astro (normally `http://localhost:4321/`). The `build` script automatically executes the stronger `check-dist.mjs` after `astro build`.

When `npm install` succeeds, commit the generated `package-lock.json` and replace `npm install` in `.github/workflows/ci.yml` with `npm ci` before treating CI as reproducible. Do not fabricate a lockfile or mark a build passing without executing it.

## Browser acceptance checklist

For each check record browser/OS, date, observed behavior and screenshots or logs when necessary:

1. Home splash renders, no missing styles, and both hero actions lead to existing pages.
2. All six sidebar navigation groups expand; all 20 category overview routes load.
3. Three pilot routes load with their **editorial draft** warning, source list and technical sections intact.
4. A–Z index links only to real pilot pages; other 97 candidates remain explicitly planned.
5. Site search finds the relevant pilot page for `idiomatic`, `atomic operation`, and `idempotency`; verify search actually works, not only that the Pagefind directory exists.
6. Local links on all pages resolve; no JavaScript errors in DevTools console.
7. At narrow mobile width (approximately 375 CSS px) the menu, search, main text and code examples are usable without horizontal layout overflow.
8. Keyboard-only navigation: skip link, focus indicators, menu and search dialog work; Escape closes overlays where applicable.
9. Basic accessibility audit: readable text contrast, document heading hierarchy, images with alternative text and logical focus order.
10. `npm run build:release` rejects draft-only content. Never deploy the preview as an approved reference site.

## Exit criterion

M1.2 remains **OPEN** until actual supported-Node install, Astro check, Astro build, output audit, search test and browser/navigation/accessibility checks are evidenced. Successful offline synthetic tests are preparation, not substitution. No M1.3 content expansion is authorized by this document.

## References

- https://docs.astro.build/en/install-and-setup/
- https://starlight.astro.build/guides/site-search/
- https://starlight.astro.build/reference/configuration/
- https://pagefind.app/docs/
