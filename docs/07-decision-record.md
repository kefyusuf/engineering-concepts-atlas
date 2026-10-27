# M0.7 — Decision Record

**Date:** 2026-10-27  
**Status:** Technical recommendations recorded; project/product sign-off pending. No implementation authorization implied.

| ID | Decision | Status | Rationale / boundary |
| --- | --- | --- | --- |
| D-001 | Preserve six navigation groups and twenty canonical categories | Proposed | Maintains coverage while giving readers a manageable navigation hierarchy |
| D-002 | Preserve 100 catalog-only entries and twenty M1 seed-page targets | Proposed | Breadth of catalog does not count as published evidence-backed content |
| D-003 | Use Astro + Starlight + MDX with built-in static search | Proposed | Documented low-infrastructure route; no app backend needed at M1 |
| D-004 | Keep stable concept IDs separate from path/route slugs | Proposed | Renames should not break conceptual identity |
| D-005 | Require source *scope*, source *status*, and claim-level support | Proposed after review | Prevents draft-as-standard, vendor-to-universal and API-to-business-policy errors |
| D-006 | Store planned typed relationships; render links only to published targets | Proposed after review | Allows 100-entry map without broken navigation to unpublished pages |
| D-007 | Technical/editorial review is distinct from automated catalog checks | Proposed after review | Prevents schema correctness from being mistaken for factual correctness |
| D-008 | No new code or site scaffold until explicit M0 sign-off | Carry-forward | Respect scope and review gate |

## Deferred

- Brand/domain/license/hosting selection (licensing and hosting gate before launch).
- Interactive relation graph, translations, personalization, analytics, AI search, CMS, and server runtime.
- Formal graph relationship ontology beyond `related_to` and `contrasts_with` until real content requires it.

## Gate

A decision status here records a recommendation, **not** a signed ADR. Product owner must accept/reject the M0 scope; a separate competent editorial pass is needed before the three pilot texts become published material.
