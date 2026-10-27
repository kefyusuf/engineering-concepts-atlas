# M1.2.2 — Anchor Integrity and Verification Gate

**Date:** 2026-10-27  
**Milestone:** M1.2 remains **OPEN**.  
**Release:** **NOT APPROVED**.  
**Scope:** Generated HTML navigation audits and execution of existing verification gates. No new articles or architectural components.

## Defects identified

1. The generated HTML audit checked whether a page existed, but not whether `href="#section"` or cross-page `#section` links referred to an actual HTML ID.
2. A loose regular expression could treat a `data-id` attribute as an actual fragment `id`, producing false positives.
3. CI ran real browser smoke verification but did not explicitly exercise the positive and negative tests for its browser harness.
4. Under managed Chromium, cleanup could fail with `ENOTEMPTY` and mask the more actionable original browser navigation error.
5. The local M1.2 verification chain required manually running multiple commands with no single fail-closed entry point.

## Changes

- `scripts/lib/dist-audit.mjs` checks same-page and cross-page HTML fragment references, percentage-encoded IDs, and text-fragment exceptions. It avoids mistaking `data-id` attributes for real IDs.
- `tests/dist.test.mjs` adds regression cases for valid and invalid anchors and attribute confusion.
- `tests/browser-cleanup.test.mjs` covers graceful handling of temporary Chromium-profile cleanup errors without overwriting the actual browser verdict.
- `.github/workflows/ci.yml` runs `npm run test:browser` before building and continues to run `npm run verify:browser` after the build. These two checks test different things and must both pass.
- `tests/pipeline.test.mjs` tests the CI ordering and local `verify:m1-2` command.
- `npm run verify:m1-2` is a single local runner for test, content validation, Astro check, build, synthetic browser harness, and compiled browser smoke.

## Test evidence

| Gate | Result | Evidence |
| --- | --- | --- |
| Dependency-free Node.js tests | **PASS: 28/28** | `evidence/m1.2.2/tests.txt` |
| Catalog, source routes, relationships | **PASS** | `evidence/m1.2.2/content-validation.txt` |
| Editorial publication gate | **BLOCKED as intended** (0 independently approved articles; 20 required) | `evidence/m1.2.2/release-blocked.txt` |
| RED/GREEN cases | **Demonstrated for new rules** | `evidence/m1.2.2/red-green-summary.txt` |
| Supported Node availability | **Default Node too old**; alternate Node 24 available only in this container | `evidence/m1.2.2/environment.txt` |
| npm dependency install | **BLOCKED:** offline cache missing `@astrojs/check`, registry DNS unavailable | `evidence/m1.2.2/npm-offline-blocked.txt` |
| Real Astro check/build | **NOT VERIFIED** | Requires installing dependencies |
| Real Pagefind queries | **NOT VERIFIED** | Requires generated `dist/` and browser networking |
| Managed Chromium local navigation | **ENVIRONMENT-BLOCKED** (`ERR_BLOCKED_BY_ADMINISTRATOR`) | Observed in earlier M1.2.1 and current attempts |
| GitHub Actions workflow | **NOT EXECUTED** | No remote run performed |

## How to complete M1.2 on a supported workstation

1. Install Node.js 22.23.4+ (supported even-numbered release) and Chrome/Chromium.
2. In the project directory, run `npm install` with working npm registry access; commit the generated `package-lock.json` before deploying and switch CI from `npm install` to `npm ci`.
3. Run `npm run verify:m1-2`. All gates must return exit status zero. The command does not grant editorial approval and does not invoke `build:release`.
4. Open the `npm run preview` site and manually check keyboard navigation, search overlay, focus states, and small-screen layout. Preserve screenshots and actual command logs with the commit SHA.
5. Close M1.2 only after actual Astro build, generated Pagefind index, browser smoke, and manual navigation checks pass. M1.3 content expansion remains on hold until then.

## Scope and safety notes

- HTML-anchor inspection is a deterministic generated-output check, not a full DOM/accessibility test or a replacement for browser verification. Dynamic JavaScript-generated anchors may require an explicit exception if introduced in future milestones.
- The three pilot concepts remain **draft content**, visible only in a local **preview build** for evaluation. `npm run build` is not authorized as a public release path; `npm run build:release` is intentionally blocked.
- No dependency installation succeeded in this environment. Do not claim tested Astro compilation, successful live search, or a production-ready deployment.
