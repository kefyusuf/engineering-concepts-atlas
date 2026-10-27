# M1.3 — Batch 1: Type Inference and Pure Function

## Scope

Two canonical M1 seeds only:
- types.type-inference under type-systems
- functional.pure-function under functional-programming

The category taxonomy, 100-entry M0 catalog, 18 candidate relations, production release gate and Pages preview policy remain unchanged. Both pages must use editorialStatus: draft and no reviewedAt.

## Acceptance criteria

1. Source articles follow the ten-section advanced editorial content contract.
2. Primary sources are scoped to the semantics they support. TypeScript/Rust inference is not generalized across all languages; React purity rules are not presented as a language specification.
3. The TypeScript example passes a strict compile-time test. A deliberately invalid assignment must fail type checking.
4. The pure JavaScript example runs repeatedly with frozen input and preserves caller-owned data.
5. Category pages, index, homepage, Starlight sidebar, built route audit, browser route checks and Pagefind search discover both drafts.
6. A GitHub PR passes Node tests, content validation, Astro check/build and Chromium/Pagefind checks.
7. No automated process may mark the articles independently reviewed or bypass build:release.

## TDD evidence

RED: branch commit 676ff7d5911379684c8e2f27bd87b7ff4324ba4a adds expectations for five seed pages and 28 routes before the MDX files exist. GitHub Actions run 40588929218 returned failure as expected.

GREEN: advanced drafts, discovery navigation, source validation and executable examples are added after the failing CI run. CI result and exact merge decision must be recorded separately once the PR finishes.

## Independent review still required

The content is an *editorial preview* and must not be described as independently reviewed based on successful build or example tests. A future reviewer must verify each claim against the linked reference, run language-specific snippets and resolve factual or style comments before editorial approval.
