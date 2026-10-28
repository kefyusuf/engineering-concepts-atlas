# M1.3 — Batch 4: Abstract Syntax Tree and HTTP Method Semantics

## Scope
- `compilers.abstract-syntax-tree` at `compilers-runtimes/abstract-syntax-tree`
- `api.http-method-semantics` at `http-api-integration/http-method-semantics`

These are the two pre-existing M0 M1-seed concepts. No taxonomy, data schema, new package, backend, CMS, search engine replacement or production gate change.

## Semantics and evidence boundaries
- AST: parser tree vs CST vs IR, syntactic analysis vs type checking, node visiting, source transforms; TypeScript Compiler API version scoped to 5.x/6.x, with Babel and Python as format contrasts.
- HTTP: RFC 9110 safety, idempotency and cacheability are independent properties. GET/HEAD/PUT/POST/DELETE example uses a real loopback Node server. Application method labels do not enforce authorization or retry guarantees.
- Both articles remain drafts with no reviewer or reviewedAt. Sample tests do not constitute an independent editorial review.

## Acceptance criteria
1. 100 catalog candidates, 20 categories, 18 relations stay unchanged.
2. Eleven source-backed unreviewed articles, 34 source routes, zero published articles.
3. TypeScript AST example parses and visits nodes; a broken source generates diagnostics.
4. Local Node HTTP sample checks expected method effects; a deliberately mutating GET is rejected.
5. Category overview, home, A–Z index, source links, build audit, browser fixtures and Pagefind cover both articles.
6. PR CI passes Node source tests, Astro check/build, Pagefind and real Chromium tests. The actual main deployment runs only after verified merge.
7. Production build:release gate remains closed.

## TDD evidence
RED: `27b7f440536763dde61fc7a337b58231fd3077a6` adds eleven-article and 34-route expectations. GitHub Actions run `40633132267` failed as expected (9 articles/32 routes).
GREEN: content and runnable fixtures added on the feature branch. Final CI evidence and merge outcome are recorded in PR #5.

## Deferred
Independent technical/editorial review of every claim, cross-parser compatibility tests, full HTTP RFC conformance suites and production release are explicitly outside this batch.
