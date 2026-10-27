# M0.1 — Product Definition

**Project:** Engineering Concepts Atlas (working title)  
**Status:** Draft; no implementation authorized  
**Date:** 2026-10-26

## Problem statement

Engineering terminology is spread across language documentation, standards, security frameworks, books, and vendor guides. Search results often offer shallow definitions, omit scope and failure modes, or conflate similar terms (e.g. concurrency versus parallelism, atomicity versus idempotency, OWASP versus a vulnerability taxonomy).

A reader needs an explainable, navigable, evidence-backed reference that does not depend on one language or toolchain.

## Primary users

1. Intermediate-to-senior software engineers moving into systems, distributed computing and security.
2. Technical leads and architects who need precise terminology for technical decisions and reviews.
3. Advanced learners investigating unfamiliar terms from research papers, RFCs, code and incident reports.

**Not target users (M1):** guided beginner curricula, certification candidates requiring a full course, or organizations seeking a hosted knowledge-management product.

## Jobs to be done

- Find the exact meaning and boundaries of a term.
- Distinguish concepts commonly confused in production design decisions.
- See internal mechanisms, assumptions, limitations and failure modes.
- Follow prerequisite and contrasting concepts without losing context.
- Verify claims through dated, trustworthy citations and normative sources.

## Value proposition

A **technical reference** with deep explanation, scoped claims, concrete examples, engineering trade-offs, and meaningful concept links; not a crowdsourced term list nor an AI answer generator.

## M0 deliverables

- Controlled taxonomy with twenty categories in six discoverable navigation groups.
- Prioritized 100-concept backlog, one seed concept per category.
- Editorial metadata contract and stable concept identity rules.
- Source and verification policy suitable for advanced technical material.
- Three representative article outlines to validate that the schema works across topics.
- Measurable M1 acceptance gates.

## M1 product scope

- 20 fully edited English concept pages, one per category.
- Static page generation, table of contents, built-in full-text search and ordinary cross links.
- 20 category landing/navigation views and simple alphabetical concept discovery if feasible without custom backend.
- Clear definition, mechanisms, limitations, comparison and test/verification content appropriate to the concept.
- Accessible presentation; desktop and mobile browsing.

## Non-goals for M0 and M1

No auth, profiles, CMS, comments, user analytics platform, hosted API, databases, embeddings, AI-powered search, knowledge graph renderer, interactive compiler playgrounds, automated external crawling, AI autopublishing, advanced localization, paid subscriptions, or vendor-specific teaching track.

## Constraints

- Write all publishable content and internal docs in English.
- Distinguish language-specific exceptions from general principles.
- Never turn a proposed catalog row into a published page without evidence and review.
- Prefer reference links and paraphrase over copyrighted reproduction.
- Keep stable concept IDs independent from filesystem path and route slug.
- Avoid premature generalization; no custom content management stack while Git and MDX suffice.

## M1 success measures (proposed)

- 20/20 taxonomic coverage (one fully reviewed page per category).
- All published concepts have unique IDs and pass schema/link checks.
- All normative technical claims have traceable, appropriate evidence.
- Every published article explains at least one major misconception or limitation.
- Search relevance: target concept in top 3 results for >= 27 of 30 predefined queries (evaluated after deployment).
- Static build succeeds without an application database or backend.

## Risks and mitigation

| Risk | Mitigation |
| --- | --- |
| Incorrect claims presented confidently | Human technical review, primary sources, claim-level links, correction process |
| Broad scope delays launch | 100 planning rows; publish only 20 in M1 |
| Unclear category ownership | Unique canonical category and stable ID; aliases for interdisciplinary terms |
| Content quickly becomes stale | Version-specific claims, last-reviewed date and change triggers |
| Copyright or source-license conflict | Original prose, attribution where required; explicit content license review |
| Premature platform design | Use documented Starlight conventions before custom components |
| Search results miss synonyms | Metadata aliases and test query corpus |
| Complex term relationships become inaccurate | Typed relationship policy and editorial verification |

## Not yet decided

Public project name/domain, publication license, hosting provider, branding, and whether the repo will be public. These do not block this planning pack, but licensing/hosting choices must be settled before publication.
