# M0.3 — Content Contract

## Identity and directory mapping

`concept_id` must be globally unique, human-readable and stable (`distributed.idempotency`, `concurrency.atomic-operation`). It is an editorial identity, **not** the Starlight route. `category_id` is one of the canonical IDs in the taxonomy. `slug` is a URL/file-friendly identifier and may change when a title changes. A name or acronym can be an alias but not a second canonical article.

Proposed future route: `/<category-id>/<slug>/`, using a static route generated from `src/content/docs/<category-id>/<slug>.mdx`; this is a convention, not a built route. Stable IDs should be retained across redirects and locale copies.

## Content types

- **Concept:** programming, computing, architecture or engineering mechanism/discipline.
- **Organization/ecosystem:** OWASP and similar bodies; do not apply code-centric sections literally.
- **Standards/specification:** versioned technical authorities (later catalog expansion).
- **Comparison:** optional future article class, not required in M1.

## Required metadata for a *published concept*

| Field | Meaning | Validation |
| --- | --- | --- |
| `title` | Reader-facing canonical name | Nonempty |
| `description` | Search summary (neutral, technically accurate) | Nonempty |
| `conceptId` | Stable identity | Unique and matches catalog |
| `category` | Canonical category ID | Must exist in taxonomy |
| `kind` | `concept` or `organization` in M1 | Known value |
| `aliases` | Accepted alternate names/spellings | Array, may be empty |
| `related` | Typed concept IDs | Existing catalog IDs, no self links; public link only when target page is actually published |
| `reviewedAt` | Actual complete technical/editorial verification date | Valid date, not future-dated; cannot be set by an automated build or outline review |
| `sources` | Source descriptions, URLs and scope | Primary source or documented exception; mark Internet-Drafts as drafts and vendors as version-specific |
| `editorialStatus` | `draft`, `reviewed`, `published` | No planned page publicly published |

**Relationship policy:** `data/relationships.csv` is a planned *editorial map* with `source_concept_id`, `target_concept_id`, `relation_type`, and `editorial_rationale`. Its initial types are `related_to` (undirected conceptual association) and `contrasts_with` (comparative distinction); directional types are deferred. Relationships are stored once per pair unless direction is later defined. Each endpoint must exist in `concepts.csv`; links to planned-but-unpublished pages must **not** render as live article links. A related-concept badge can render only when the target has a published page. A free-text mention of a non-catalogued concept may appear without a navigation link.

**Catalog-only rows** need not have sources yet and cannot be shown as verified articles. `concepts.csv` uses the planning state `planned`; published-page frontmatter uses `editorialStatus` and must not silently inherit `planned`. A catalog entry is not automatically a Starlight content entry.

Example **design sketch**, not an implemented schema:

```yaml
---
title: Idempotency
description: Intended effects of repeated operations, guarantees and failure modes.
conceptId: distributed.idempotency
category: distributed-systems
kind: concept
aliases:
  - Idempotent Operation
related:
  - conceptId: concurrency.atomic-operation
    relation: contrasts_with
  - conceptId: api.http-method-semantics
    relation: related_to
reviewedAt: '2026-10-26' # Set to actual review date at publication
editorialStatus: draft
sources:
  - title: RFC 9110 - HTTP Semantics, section 9.2.2
    url: https://www.rfc-editor.org/rfc/rfc9110#section-9.2.2
    role: primary
---
```

This example is **unreviewed**, and its source establishes *HTTP method* idempotence, not the full semantics of payment idempotency or distributed operation deduplication. Add separate source evidence for these claims in the eventual article.

## Advanced concept article template

1. **Precise definition and scope** — what property/entity is being discussed; where it applies.
2. **Why it exists** — concrete engineering problem, not marketing.
3. **Mental model** — analogy that is faithful but clearly limited.
4. **Mechanics and guarantees** — observable behavior, invariants, assumptions, complexity if relevant.
5. **Worked example** — minimal portable pseudocode or a well-labeled language example.
6. **Failure modes and edge cases** — counterexamples; conditions under which the property fails.
7. **Alternatives and trade-offs** — benefits, costs and when not to use.
8. **Similar and related concepts** — at least two relevant comparisons, or a justified exception.
9. **Testing and verification** — concrete assertion/property/test idea or an explanation of why testing is inapplicable.
10. **References and version notes** — primary sources, secondary support and review date.

Organization and specification pages adapt items 4, 5 and 9 to governance/versioning rather than pretend an organization is an algorithm.

## Standards-status and source-scope rules (added in v0.2)

- An Internet-Draft must **never** be cited as an issued RFC or binding standard. Record document status and retrieval date.
- API-specific behavior cannot be generalized from one vendor or API version.
- A reference about HTTP method semantics cannot alone support claims about application-level deduplication, payment execution, or response replay.
- A reference about atomic memory access cannot be used to establish ACID transaction guarantees.
- Do not conflate `lastUpdated` (Starlight content field) with our `reviewedAt` technical verification timestamp.

## Quality gate for publication

- Metadata is valid; category, stable ID and relations resolve.
- Definition states *scope* and does not substitute an analogy for semantics.
- Distinguishes similar terms correctly, especially overlapping technical meanings.
- Hard claims (guarantees, security claims, complexity claims, specification behavior) are traceable to appropriate sources.
- Code/pseudocode declares environment and observable expectation; production examples are verified where executable.
- No silent use of AI-generated unreviewed statements or citations.
- English grammar, headings, accessible code blocks and cross-links are reviewed.
- No page shows a fabricated `reviewedAt` date or speculative version-specific claim.

## Not in M0

No Zod implementation, Astro route generation, build script, automated linting or schema implementation. Those belong to M1, beginning with failing validation tests.
