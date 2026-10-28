# M1.3 — Batch 5: Bloom Filter and Mutation Testing

## Scope
Exactly two existing M0 seed concepts:
- `algorithms.bloom-filter`, at `data-structures-algorithms/bloom-filter`
- `testing.mutation-testing`, at `testing-verification/mutation-testing`

Retain 100 catalog entries, 20 categories, 18 typed planned relations, six navigation groups and the separate 20-approved-article production gate. No new feature, framework or runtime dependency.

## Technical contract
- Bloom Filter: insertion-only approximate set membership, conditional no-false-negative guarantee, false positives, fixed hash/layout compatibility, saturation, sizing assumptions and false-positive fallback. The sample is only an educational 64-bit layout using Node crypto.
- Mutation Testing: distinguish killed, survived, no-coverage, timeouts, equivalent mutants and vendor-specific scores. The sample is one explicit mutation, **not a mutation testing engine**.
- Both must retain ten major editorial sections, cited sources, visible preview notice, `editorialStatus: draft` and absent reviewer/reviewedAt.

## RED → GREEN
RED commit `4062800a119fdcb27c0a544b8d2ab49bf1af5b5e`. [CI 40650171971](https://github.com/kefyusuf/engineering-concepts-atlas/actions/runs/40650171971) failed as intended (expected 13 pages and 36 routes, found 11 and 34).
GREEN adds sourced articles, runnable Node examples, positive/negative verification, navigation, source link audit, Pagefind and real Chromium coverage.

## Acceptance
1. Exactly 13 preview draft concept articles, 36 source routes, 0 independently reviewed articles.
2. Tests reject an invalid Bloom insertion and a weak mutation test suite.
3. Overview, homepage, concept index, built route audit and browser/Pagefind searches include both topics.
4. Passing PR CI (test, Astro check, build, Pagefind, Chromium) and scope review required before merge.
5. Main-only Pages deploy succeeds after merge, while `build:release` stays blocked.

## Deferred
Independent review of technical claims and practical false-positive sizing under load, concurrency-safe Bloom implementation, actual Stryker/PIT integration, full metrics analysis and production editorial approval are not part of this batch.
