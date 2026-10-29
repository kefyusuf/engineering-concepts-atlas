# M1.3 — Batch 6: Bounded Context and Tail Latency

## Scope
Two existing M0 M1 seed articles only:
- architecture.bounded-context in software-architecture
- performance.tail-latency in performance-engineering

Retain 100 candidates, 20 categories, six groups, 18 planned relationships and a separate production gate requiring twenty independently reviewed articles.

## Technical contract
- Bounded Context: strategic DDD model and language boundary, not a microservice. Source-scoped to Martin Fowler and Microsoft Learn. Executable JavaScript example tests a Sales-to-Shipping adapter, not the organizational correctness of the proposed model split.
- Tail Latency: finite-sample nearest-rank percentiles, synthetic p50/p95/p99, distribution aggregation and Prometheus classic histogram example. Synthetic numbers are not production performance data.
- Articles have ten major sections, visible preview notice, external sources and editorialStatus draft without reviewer or reviewedAt.
- The compact reference-library UI from PR #8 remains intact; only existing directory groups, links and counts are updated.

## TDD evidence
RED commit 441f45c5dde6ea93596cb1b75ad185d4235482c0 and failed run 40859337368: expected fifteen concepts and 38 authored routes but found thirteen and 36, and homepage discovery failed.
GREEN: draft content, runnable positive/negative tests, category and A–Z links, static route and Pagefind/Chromium assertions.

## Acceptance
1. Exactly 15 draft articles, 38 authored routes, 0 approved for production.
2. Bounded Context adapter accepts known status, rejects unknown status and avoids source DTO leakage.
3. Nearest-rank percentiles preserve input and reject invalid observations; a deliberately broken implementation fails.
4. All source, Astro, static links, browser fixtures, real browser navigation, Pagefind and design regression checks pass.
5. PR receives review and merge only after green CI; main-only Pages deployment is verified separately.
6. No dependencies, backend, CMS, search rewrite or new UI layout.

## Deferred
Independent domain workshops and editorial approval, real context integration contracts, workload telemetry and production SLO validation.
