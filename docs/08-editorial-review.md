# M0.8 — Editorial Review Report

**Review date:** 2026-10-27  
**Review stage:** Editorial/technical desk review of planning pack and three pilot outlines.  
**Overall outcome:** **Conditional M0 readiness**. Internal reference problems corrected; independent content approval and product sign-off remain open.

## Method and limits

1. Read the previous v0.1 planning files and checked their manifest against files that physically existed.
2. Verified selected primary public sources for claims in the three pilot outlines.
3. Revised language to separate descriptive guidance, implementation guarantees, RFC semantics, and provisional Internet-Drafts.
4. Authored a small, typed relationship seed from the actual catalog. Checked identifier integrity locally.
5. Drafted observable pass/fail scenarios, without running application code or a Starlight build.

This review does **not** assert that an independent subject-matter expert signed off the articles, that executable examples were run, or that publication is authorized.

## Findings and dispositions

| Finding | Severity | Previous risk | Resolution |
| --- | --- | --- | --- |
| ER-01 | High | README names `data/relationships.csv`, but it was absent; 34 checked relationships could not be reproduced | Created **18** explicitly provisional relation rows in v0.2 and validated endpoints; prior count withdrawn |
| ER-02 | Medium | README names `docs/07-decision-record.md`, but it was absent | Created explicit decision record with approval status |
| ER-03 | High | Idempotency prose could blur method semantics and payment operation guarantees | Separated RFC 9110 method property, client key policy, server guarantees and downstream effects |
| ER-04 | High | October 2026 Idempotency-Key draft might be mistakenly called an RFC | Recorded Internet-Draft `-08` status with its 2026-10-22 publication date |
| ER-05 | Medium | Provider-specific replay could be presented as universal | Noted Stripe API v1/v2 documented differences; no universal response guarantee |
| ER-06 | Medium | Atomic operation might be conflated with database ACID or whole-workflow thread safety | Added explicit memory model / invariant / ordering boundaries |
| ER-07 | Medium | Idiomatic practice could be mistaken for language rule or formatter validity | Added compiler-versus-style distinction with Go-only evidence |
| ER-08 | High | Links from 20 published pages to 80 planned concepts could yield broken links | Defined catalog-level relations separately from public published links |
| ER-09 | Medium | `planned` CSV state and published-page `editorialStatus` enums differ | Documented explicit workflow mapping; not a direct enum match |
| ER-10 | Medium | Source metadata lacked explicit RFC/draft/vendor scope safeguards | Added source scope/status checks to content contract and policy |

## Specific claim-to-evidence disposition

| Claim | Source | Editorial conclusion |
| --- | --- | --- |
| What is conventional Go style | Effective Go; Go Code Review Comments | Supported *for Go*, not general to all languages |
| Atomic RMW vs memory-order constraints | Rust `std::sync::atomic`, `Ordering` | Supported *for Rust*; never implies cross-variable invariants |
| Idempotent method semantics in HTTP | RFC 9110 §9.2.2 | Normative only for HTTP method semantics |
| `Idempotency-Key` expectations | HTTPAPI Internet-Draft `-08` | Provisional, not an issued RFC; check status before publishing |
| Retried API response behavior | Stripe official API reference | Vendor/version-dependent; v1 and v2 differ |

See `data/pilot-evidence.csv` for the URLs and precise scope.

## Unresolved conditions

- U-01: Explicit product owner sign-off of M0 scope and the 20-page M1 target.
- U-02: Independent technical editorial approval of fully written pages (M1 publication gate, not M0 outline review).
- U-03: Publication license and contributor permissions before publishing material publicly.
- U-04: Execute example snippets (and concurrency stress tests where relevant) when M1 article implementations exist.
- U-05: Freeze the 30-query search evaluation fixture before testing the built search index.

## Recommendation

The product and editorial architecture is **ready to be submitted for M0 acceptance**, not automatically accepted. On explicit sign-off, proceed to M1 as a small, test-first Astro/Starlight publishable slice. Keep the 80 remaining concepts planned; do not create empty public article routes.
