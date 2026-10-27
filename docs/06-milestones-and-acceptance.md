# M0.6 — Milestones, Acceptance and Verification

## State of work on 2026-10-27 (v0.2 review)

- Planning artefacts: generated.
- Candidate concepts: 100, across 20 categories and 6 groups.
- Concept-relationship references: **18 proposed typed pairs in `data/relationships.csv`**, repaired after the v0.1 file was found missing; locally checked for referential integrity. The previously reported count of 34 cannot be substantiated by the v0.1 artifact.
- Pilot topics and editorial policy: desk-reviewed with primary sources and revised; **independent editorial/product sign-off pending**.
- Site implementation or tests: not started.

## M0 acceptance gate (before implementation)

| ID | Criterion | Objective evidence | State |
| --- | --- | --- | --- |
| M0-01 | Problem, users, non-goals, risks defined | Product definition doc | Drafted |
| M0-02 | 6 groups and 20 unambiguous canonical categories | Taxonomy doc and CSV | Drafted |
| M0-03 | 100 unique valid canonical concept IDs | Catalog audit | Checked locally |
| M0-04 | 20 M1 seed concepts, exactly one per category | Catalog audit | Checked locally |
| M0-05 | Relation types and no dangling IDs | Relationships CSV audit (18 rows) | Checked locally in v0.2 |
| M0-06 | Publish schema, source policy, editorial workflow | Revised contract + policy | Revised; proposed |
| M0-07 | 3 pilot outlines inspected for technical scope | Review report, source map, acceptance cases | Desk review done; independent sign-off pending |
| M0-08 | Product/editorial sign-off on M1 scope | Explicit decision | Pending |

**Gate rule:** M0 does not become Accepted just because files exist. M0-07 needs recorded review acceptance, and M0-08 needs explicit product approval before writing application code. M1 technical article approval is a separate publication gate.

## M1 delivery order (TDD-compatible)

1. RED — Define acceptance scenarios for catalog integrity and a representative MDX page schema.
2. GREEN — Install minimal Astro + Starlight static site and content collections with schema extensions.
3. REFACTOR/VERIFY — Confirm link validation, frontmatter, navigation and search output.
4. CONTENT — Author, source and review the 20 canonical seed pages (minimum one per category).
5. VERIFY — Build, link crawl, accessibility smoke checks, search relevance evaluation, metadata, source audit.
6. REVIEW — Scope check; PR and CI gate before merge and deployment.

## M1 acceptance matrix

| ID | Acceptance | Test / proof |
| --- | --- | --- |
| M1-01 | A static site builds without a runtime backend | Production build succeeds; output inspectable |
| M1-02 | 20 reviewed, unique pages cover all 20 categories | Count/query site data; human review records |
| M1-03 | Exactly 100 candidates may remain in catalog without fake published pages | Site only routes published content |
| M1-04 | All published page frontmatter validates | Negative schema tests and build |
| M1-05 | No broken internal article/category links | Generated-site link checker |
| M1-06 | Sources are traceable; dated claims scoped | Manual claim audit and review checklist |
| M1-07 | No unsupported related IDs | Cross-reference validation |
| M1-08 | Search retrieves target page within top 3 for >= 27/30 fixed queries | Recorded Pagefind acceptance query fixture |
| M1-09 | Accessible navigation on desktop/mobile | Keyboard, screen reader basics, viewport checks |
| M1-10 | CI gates pass prior to merge/deploy | PR results and deployment evidence |

## Deferrals beyond M1

Advanced graph, machine translations, playgrounds, AI-powered indexing, automatic writing pipeline, user accounts, persistent progress, analytics service and API. Add only when usage evidence makes the benefit measurable.

## Initial 30-query search suite design

Collect exactly 30 queries covering: canonical labels, acronyms, alternate spellings, ambiguous queries, and contrasted terms. Examples: `idiomatic`, `type inference`, `observer`, `atomic`, `concurrency`, `I/O`, `AST`, `idempotent`, `OWASP`, `OAuth`, `mutation testing`, `SBOM`, `tail latency`, `distributed trace`, `tool calling`. Final fixed set and expected results must be frozen **before** search evaluation to avoid optimizing only for favorable examples.
