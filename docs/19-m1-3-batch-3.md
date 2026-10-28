# M1.3 — Batch 3: Input/Output and Transaction Isolation Levels

## Scope and invariants
Two existing M1 seeds only:
- `io.input-output` at `io-networking/input-output`
- `db.transaction-isolation-levels` at `databases-transactions/transaction-isolation-levels`

Preserve 100 catalog candidates, 20 categories, 18 candidate relationships, six navigation groups and production release blocking. Both articles remain draft with no reviewer or reviewedAt.

## Editorial semantics
- I/O: separate blocking from async, readiness from completion, successful system calls from persistence, and short reads/writes from logical message framing. Node.js v22 and Linux man-pages scope the claims.
- Isolation: the implementation-specific anomaly matrix refers explicitly to PostgreSQL 18. Read Uncommitted maps to Read Committed there, Repeatable Read is stronger than the SQL minimum yet may permit write skew, Serializable can produce 40001. Distinguish MVCC from an isolation level.
- The PostgreSQL two-session schedule is a **manual integration exercise**, not run on CI. A runnable deterministic JavaScript model only illustrates a hazard; it is not an MVCC emulator.

## Test-first evidence
RED commit `8111c64c597c1ca1379e8a055737d57039690f9a` and failed [CI run 40631564688](https://github.com/kefyusuf/engineering-concepts-atlas/actions/runs/40631564688): expected 9 draft pages/32 routes but found 7/30.
GREEN: two full articles, runnable Node I/O fixture and abstract schedule tests, source metadata and ten-section validation, category/index/homepage discovery, static route audit, Pagefind and Chromium checks.

## Acceptance
1. Nine unreviewed M1 articles, 32 source routes, zero editorial approvals.
2. Positive/negative executable Node I/O tests; async read must check byte count and EOF.
3. Abstract SQL anomaly model test checks the invariant with and without a hypothetical abort; no PostgreSQL execution claim.
4. CI succeeds for content, Astro, static build, browser fixtures, Pagefind and full Chromium smoke.
5. PR receives scope self-review before merge and main deploy is independently verified.
6. No new backend, CMS, database dependency, security claim, production editorial review, or release-gate bypass.

## Deferred verification
An actual PostgreSQL 18 two-connection integration test with controlled interleaving and SQLSTATE 40001 assertion belongs to independent editorial verification. Until then, any example is **illustrative**, not empirically validated against PostgreSQL.
