# Engineering Concepts Atlas

**Milestone:** M1.2.5 — GitHub Pages editorial preview deployment configuration.
**Status:** Preview deployment configured but not executed; real Astro build and browser gate still environment-blocked; not production-approved.
**Content language:** English.

A static-first, language-agnostic technical atlas built around exact semantics, boundaries, failure modes, verifiable examples and primary references.

## Prerequisites

- Node.js **22.23.4 or newer, even-numbered supported release** (`.nvmrc` is provided).
- npm with access to the npm registry.

## Run locally

```bash
npm install
npm run test
npm run validate:content
npm run check
npm run dev
```

Open the address Astro prints (normally `http://localhost:4321/`). For a static production-like preview:

```bash
npm run verify:m1-2
npm run preview
```

**Important:** This ZIP does not contain `node_modules/`, `dist/` or a `package-lock.json`, because the build environment could not reach the npm registry. On the first successful `npm install`, **commit the generated lockfile**. The bootstrap GitHub Actions workflow uses `npm install` until a lockfile is committed; then change it to `npm ci` for reproducible CI. Do not mark the Astro build, Pagefind search or browser UX as verified until install, `npm run check`, `npm run build` and browser checks succeed.

## M1.2 verification status

Local dependency-free catalog, source-link and synthetic built-output audit tests pass. **Actual `astro check`, `astro build`, Pagefind search and browser verification have not been run** because this execution image runs Node 22.16.0 and has no npm registry connectivity. See `docs/11-m1-2-build-and-browser-gate.md`, `docs/12-m1-2-1-browser-smoke-gate.md` and `docs/13-m1-2-2-navigation-and-verification.md` for the exact remaining gates. The browser harness could not be exercised successfully here: managed Chromium blocks local network navigation (`ERR_BLOCKED_BY_ADMINISTRATOR`). This is an **environment blocker**, not a passing browser test. The additional tests do not demonstrate a compiled Astro site.

## Current content

- Six navigation groups, 20 category overview pages.
- 100 planned candidate concepts, five in each category; original M0 CSV is preserved.
- Three advanced, **unreviewed local preview** articles: Idiomatic Programming, Atomic Operation and Idempotency.
- 18 proposed typed conceptual connections, validated by ID; planned entries do not become live articles.
- 38 passing dependency-free Node.js tests, plus an **unverified, opt-in browser integration test harness** and content integrity checks.

A catalog candidate **must not** be represented as an independently reviewed article. The three existing pages explicitly show draft warnings and have no `reviewedAt` claims.

## Release gate

`npm run build` builds the M1 preview and must not be deployed as an approved reference. `npm run build:release` first requires **20 independently reviewed and published M1 seed articles covering all 20 categories** and then builds. In the current milestone the release gate **correctly rejects publication**.

## Structure

```text
src/content/docs/        Static pages (20 category overviews + 3 preview articles)
src/content.config.ts     Starlight/Zod content schema
astro.config.mjs          Sidebar generated from the authoritative M0 CSV
src/styles/atlas.css     Minimal visual layer
scripts/lib/catalog.mjs  Dependency-free catalog/parser/page validators
scripts/validate-content.mjs  M0/M1 content validation
scripts/verify-publication.mjs Production publication gate
scripts/check-dist.mjs   Post-build route, internal-link, asset and Pagefind integrity checks
scripts/lib/dist-audit.mjs  Testable generated-site route, asset, fragment and index audit
scripts/lib/source-navigation.mjs  Dependency-free Markdown/MDX source route validation
scripts/lib/browser-audit.mjs  Headless Chrome smoke verification for real `dist/`
scripts/browser-smoke.mjs  All 26 routes, Pagefind queries and 375px layout checks
verify:m1-2 (npm script)  Single fail-closed local milestone verification chain
tests/                   Tests using node:test
data/                    Unmodified M0 catalog and relationship data
docs/                    Unmodified M0 project documents + M1 evidence
```

## Editorial format

Concept frontmatter is a **JSON flow mapping between YAML frontmatter delimiters**. JSON syntax is a YAML-compatible subset, which allows the Node.js validation tests to run **without external dependencies** before installation. Starlight uses `docsSchema({ extend: ... })` to validate the content during the Astro build. The Node validator additionally checks cross-file IDs and catalog ownership.

## Scope decisions

No backend, CMS, user accounts, AI semantic search, knowledge graph database, dynamic API or playground. Expand only after the publishable static loop and 20-article editorial review have been demonstrated.

## Sources for tooling choices

- [Starlight Getting Started](https://starlight.astro.build/getting-started/)
- [Starlight Sidebar Navigation](https://starlight.astro.build/guides/sidebar/)
- [Starlight Frontmatter Schema](https://starlight.astro.build/reference/frontmatter/)
- [Starlight Search / Pagefind](https://starlight.astro.build/guides/site-search/)
- [Astro Installation Prerequisites](https://docs.astro.build/en/install-and-setup/)


### M1.2.3 environment diagnosis (2026-10-27)

The next open gate is **actual** Astro build and browser verification. First use a supported Node.js version (>=22.23.4, even-numbered major), then install dependencies and run:

```bash
npm install --no-audit --no-fund
npm run doctor:m1-2
npm run verify:m1-2
```

`doctor:m1-2` independently checks the Node runtime, installed Astro/Starlight packages, the npm lockfile and available Chrome/Chromium/Edge executable. Windows installations in the standard Program Files or local user directories are auto-detected; if needed set `CHROME_BIN` to the browser's absolute executable path. **Commit the real npm-generated `package-lock.json`** before switching CI to `npm ci`.

M1.2.3 source checks passed (38/38). This runtime could not install Astro packages (DNS restriction); Chromium was blocked from even local navigation by `ERR_BLOCKED_BY_ADMINISTRATOR`. Neither actual Astro build nor live Pagefind/DOM smoke has passed. See `docs/14-m1-2-3-runtime-and-pilot-browser-evidence.md` and `evidence/m1.2.3/`.


### M1.2.4 CI evidence handoff (2026-10-27)

The tracked GitHub Actions workflow now runs real dependency installation, Astro checks, build, Pagefind/Chromium verification, and uploads an `m1-2-verification-<run-id>` artifact even after failed steps. This contains stage logs, the actual `package-lock.json` if installation succeeded, and `dist/` if generated. **This is not a deploy**, and uploading a built draft preview does not confer editorial approval. No real GitHub Actions run has been performed from this local archive.

After the first successful installation, inspect and commit the generated `package-lock.json`, then replace the bootstrap `npm install` step with `npm ci`. Run the same workflow again to verify reproducibility. See `docs/15-m1-2-4-ci-evidence-handoff.md`.


## GitHub Pages editorial preview (M1.2.5)

The `main` branch CI now builds under the GitHub repository base path, runs Pagefind/Chromium checks and uploads a Pages artifact **only if all gates pass**. A separate `deploy-preview` job requires the checks job to pass and has narrowly scoped `pages: write` and `id-token: write` permissions. Pull requests perform validation but never deploy.

- Public repository: `kefyusuf/engineering-concepts-atlas` (planned; this source ZIP is not pushed).
- Once Pages is configured, expected URL: `https://kefyusuf.github.io/engineering-concepts-atlas/`.
- Settings → Pages → Build and deployment → Source: **GitHub Actions**.
- Environment `github-pages`: restrict permitted deployment branches to `main`.
- Pages builds set `GITHUB_PAGES=true` and use `GITHUB_REPOSITORY` to calculate the actual site and base path. Local builds retain root URLs.
- A small dependency-free rehype transform prefixes known internal Markdown links for the repository subpath; homepage hero actions use site-relative links. Built output and Chromium gates check the base path, rather than assuming `/`.
- The publicly accessible site is **an unfinished editorial preview** with visible draft notices, `noindex,nofollow` meta tags. These are crawler signals, not access controls. Do not expose secrets or unlicensed content.
- The `npm run build:release` gate remains blocked until 20 independently reviewed published articles exist.
- Package lock: the source still has no verified npm-generated `package-lock.json`. Bootstrap uses `npm install`; commit the lockfile after the first successful CI install, then change to `npm ci`.

**Verification distinction:** code/test checks in this archive can run offline. Real Astro build, Pagefind output, GitHub Actions run, deploy and publicly reachable Pages URL have **not** been verified. No remote repository was modified.
