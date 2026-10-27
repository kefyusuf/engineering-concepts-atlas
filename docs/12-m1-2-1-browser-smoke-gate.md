# M1.2.1 — Browser Smoke Gate (No Scope Expansion)

**Date:** 2026-10-27  
**Status:** IMPLEMENTED, NOT VERIFIED AGAINST A REAL ASTRO BUILD  
**Milestone:** M1.2 remains OPEN.

## Purpose

The existing dependency-free tests inspected source routes and synthetic generated HTML. They did not drive a browser or execute the Pagefind search module. This increment adds a minimal, browser-driven verification mechanism without a new npm dependency or changes to the 100-concept catalog.

## Changes

- `scripts/lib/browser-audit.mjs`: starts a local static server for `dist/`, opens Chrome/Chromium through the Chrome DevTools Protocol (CDP), visits the source-required routes, executes the built Pagefind client, and checks a 375px mobile viewport for page-level horizontal overflow.
- `scripts/browser-smoke.mjs`: drives all 26 required routes, three query-to-concept search cases, and the mobile-layout check against the **real** `dist/` output.
- `tests/browser.integration.mjs`: exercises the browser harness with synthetic HTML and a synthetic search implementation. It is deliberately excluded from the dependency-free `npm test` gate, because browser tests require an operational browser permitted to reach `localhost`.
- `npm run verify:browser`: post-build browser verification.
- `npm run test:browser`: isolated synthetic browser-harness integration tests.
- GitHub Actions workflow adds `npm run verify:browser` after `npm run build`, so successful CI must also show the browser gate. If the runner lacks Chrome/Chromium, CI fails visibly rather than silently skipping the gate.

## Automated acceptance behavior

1. Browser actually navigates to home, about, index, all 20 category routes, and three concept routes.
2. Every visited page must finish loading and present a nonempty `h1` and a `main` element.
3. Pagefind's built JavaScript must respond with the corresponding page in the first 10 results for `idiomatic`, `atomic operation`, and `idempotency`.
4. At a 375px simulated viewport, the HTML document must not overflow horizontally. This does **not** substitute for a full responsive or accessibility audit.
5. Any navigation, search, browser startup, or layout failure causes a nonzero exit code. A missing `dist/` also fails.

## Evidence and limitations

| Gate | Observed result | Interpretation |
| --- | --- | --- |
| `npm test` | PASS: 20/20 | Dependency-free catalog and synthetic site checks remain green. |
| `npm run validate:content` | PASS | 100 concepts, 20 categories, 18 relations, 3 drafts, 26 routes, 14 source links. |
| `npm run build:release` | BLOCKED as expected | None of the 20 required articles have independent publication approval. |
| Browser harness test (RED) | FAIL before implementation | New module did not exist, demonstrating the test was initially red. |
| Browser harness test with Chromium | ENVIRONMENT-BLOCKED | Browser navigation fails with `net::ERR_BLOCKED_BY_ADMINISTRATOR`. No actual browser behavior or search validation is claimed. |
| `astro check` / `astro build` | NOT RUN SUCCESSFULLY | Installed Node is 22.16.0, below Astro's supported 22.23.4 minimum; npm registry DNS is unavailable (`EAI_AGAIN`). |
| GitHub Actions | NOT RUN | No Git remote was provided or operated on. |

All three pilot articles remain unreviewed previews. Do not claim that the browser tests passed or that production deployment is approved.

## Reproduction on a workstation

Use a supported Node version (`>=22.23.4`), npm registry access, and Chrome/Chromium. On Windows, set `CHROME_BIN` to the full Chrome executable path if not on the PATH. Run:

```powershell
npm install
npm run test
npm run validate:content
npm run check
npm run build
npm run test:browser
npm run verify:browser
npm run preview
```

Save the command exit codes and console output. If Chrome is disabled by organizational policy, run browser smoke in an authorized unrestricted runner instead; do not bypass the policy. Commit a generated `package-lock.json` after a successful install and then switch CI to `npm ci` for reproducibility.

## Remaining M1.2 exit criteria

- Real supported-Node `npm install`, `astro check`, and `astro build` success.
- Real compiled `dist/` passes the existing `check-dist` and new `verify:browser` gates.
- Human browser review of narrow layout, keyboard navigation, focus indicators, search overlay and relevant accessibility issues, with recorded evidence.
- No content expansion into M1.3 until these gates are demonstrated.

## External references

- https://docs.astro.build/en/install-and-setup/
- https://starlight.astro.build/guides/site-search/
- https://developer.chrome.com/docs/devtools-protocol/
