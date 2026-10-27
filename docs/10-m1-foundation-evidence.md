# M1.1 Foundation Verification Evidence

## Intent and scope

Started the M1 local development foundation after the user's request to continue from the M0 v0.2 editorial review. This is **not** final M0 independent editorial sign-off and not a published product. No GitHub repository, PR, CI job or deployment was created.

## TDD evidence

1. RED — Wrote `tests/catalog.test.mjs` before implementing `scripts/lib/catalog.mjs`. `node --test tests/*.test.mjs` exited `1` with missing module error (a structural RED, not a proof of behavior-level failure).
2. GREEN — Added a dependency-free CSV parser, canonical catalog validation, relationships/slug ownership checks, pilot page metadata validation, and editorial state restrictions. `npm run test` exited `0`, **9 tests passed**.
3. CHECK — `npm run validate:content` exited `0`: 100 unique catalog entries, 20 categories, 18 relations, 3 preview drafts, zero approved articles.
4. NEGATIVE CASES — Missing relationship targets, duplicate IDs, wrong category, bad related ID, missing sources, unsupported published status are rejected by tests.
5. RELEASE GATE — `npm run build:release` must reject the current state (requires independent review evidence and one published M1 seed per category).

## What has not been demonstrated

- The npm registry was unavailable (`EAI_AGAIN`), so dependencies could not be installed.
- Node in this execution environment was 22.16.0; current Astro documentation requires Node >=22.23.4. This is reflected in `.nvmrc` and `engines`.
- Consequently `astro check`, `astro build`, Pagefind generation, actual HTML link checking, mobile/keyboard accessibility, the 30-query relevance suite, and deploy/CI runs were **not executed**.
- Source links and prose were constructed from M0 editorial outlines, not independently approved for external publishing.

## M1 acceptance disposition

M1.1 source scaffold and dependency-free content validation are ready for local installation. M1 production acceptance **remains blocked** until all 20 articles are reviewed, dependency-verified, built, browser-tested and CI-proven.

## Next controlled step

Install dependencies on Node >=22.23.4, commit the generated `package-lock.json`, fix any real-world build/check issues, then execute the browser and search checks. Only after that should additional M1 seed articles be authored.
