# M1.2.3 — Runtime Preflight and Pilot Browser Evidence

**Status:** SOURCE VERIFIED / RUNTIME AND BROWSER GATES BLOCKED
**Date:** 2026-10-27
**Milestone:** M1.2 only. No M1.3 articles and no publication approval.

## Motivation

The previous M1.2 browser smoke opened routes and exercised Pagefind, but did not verify that the three pilot articles visibly displayed the editorial disclaimer, References, code examples, and source links. Additionally, browser discovery overlooked standard Windows Chrome and Edge installations.

## Changes

1. Added a pure, dependency-free pilot-page assertion function and four RED→GREEN tests to check the required rendered article markers.
2. Updated the browser smoke to check the *rendered DOM* of all three pilots against the editorial preview contract, in addition to the existing 26 route checks, three Pagefind search queries, and 375px overflow check. The integration fixture was upgraded accordingly.
3. Added Windows Chrome/Edge lookup in standard Program Files and per-user directories, with two RED→GREEN tests.
4. Added `doctor:m1-2`: dependency-free prerequisite diagnosis covering Node runtime, installed Astro/Starlight, actual package-lock.json, and an available Chromium-based browser; four tests.

## Verification evidence

| Check | Result | Evidence |
|---|---|---|
| Node tests | PASS (38/38) | `evidence/m1.2.3/node-tests.txt` |
| Catalog and source navigation | PASS | `evidence/m1.2.3/content-validation.txt` |
| Local runtime preflight | BLOCKED | `evidence/m1.2.3/doctor.json`: Node 22.16.0, missing installed dependencies and lockfile |
| Browser harness against synthetic fixtures | BLOCKED | `evidence/m1.2.3/browser-harness.txt`: Chromium policy returned `ERR_BLOCKED_BY_ADMINISTRATOR` |
| Publication gate | REJECTED BY DESIGN | `evidence/m1.2.3/release-blocked.txt`: 0 independently approved M1 concept articles |
| Astro check/build | NOT RUN | No installable dependency set in this execution environment |
| Pagefind real search | NOT RUN | Requires an Astro-generated static site and a usable browser |

The 38 passing checks do **not** establish that Astro generated a valid site. Four pilot-page assertion tests operate on data structures, not actual MDX-generated HTML. The integration fixture is synthetic. No CI job or release was executed.

## Workstation verification (Windows / WSL / Linux)

Use Node.js >=22.23.4 in a supported even-numbered major, install dependencies using a working npm registry, and record output:

```sh
node --version
npm install --no-audit --no-fund
npm run doctor:m1-2
npm run verify:m1-2
npm run build:release  # Expected to fail until 20 independently approved articles exist.
```

`npm install` should generate a `package-lock.json`. Add it to version control after inspecting it. The CI pipeline currently uses `npm install` as a bootstrap exception; migrate to `npm ci` only after committing that genuine lockfile. Do not invent or hand-author one.

For Windows Chrome/Edge, common installation paths are checked automatically. If Chrome cannot be detected, set `CHROME_BIN` to the actual full path of the installed browser executable.

## Exit criteria still open

- Genuine Astro type check and production static build.
- `dist/` audit covering the real 26 routes and Pagefind artifacts.
- Real Chromium/Edge browser smoke: 26 routes, three pilot article DOM contracts, three real Pagefind queries and 375px viewport.
- Keyboard/accessibility manual review and CI evidence.

**Decision:** Keep M1.2 OPEN, preserve the 100-concept M0 catalog and 20-category taxonomy, and defer M1.3 content expansion.
