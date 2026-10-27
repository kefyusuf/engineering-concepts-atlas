# M0.9 — Pilot Acceptance Scenarios

**Status:** Design scenarios only. Execution belongs to M1 and must be recorded as evidence.

## Editorial cases — Idiomatic Programming

| ID | Given | When | Then |
| --- | --- | --- | --- |
| IDIO-01 | An example claims an idiom is mandatory | Reviewed against the relevant language spec | Grammar or semantic obligation is distinguished from convention |
| IDIO-02 | A Go example uses `(value, error)` | Compared with Go documentation | Convention, error-path readability and limits are documented |
| IDIO-03 | An example claims idiomatic is fastest | Reviewer requests performance evidence | Claim is removed or scoped to measured conditions |

## Atomic Operation

| ID | Given | When | Then |
| --- | --- | --- | --- |
| ATOM-01 | A single atomic counter | N workers each increment M times, then join | Final value is N×M assuming no integer overflow and supported target |
| ATOM-02 | Two atomic variables encode a cross-variable invariant | Their updates interleave | A counterexample shows why individual atomics may be insufficient |
| ATOM-03 | A `Relaxed` counter example | Article claims it publishes unrelated data | Review rejects claim absent correct synchronization |
| ATOM-04 | A comparison with database transactions | Editor inspects definition | Memory atomicity and ACID transaction atomicity are explicitly separated |

## Idempotency

| ID | Given | When | Then |
| --- | --- | --- | --- |
| IDEMP-01 | A committed logical operation has a durable identity record | Same request identity is retried | Intended operation effect occurs only once in the documented scope |
| IDEMP-02 | A request completes, but transport drops response | Client retries same identity | No duplicate logical effect; response behavior follows API contract |
| IDEMP-03 | Two matching requests start concurrently | Both are processed | Uniqueness or conflict handling prevents two intended effects |
| IDEMP-04 | An existing key is reused with different payload | Server enforces its documented policy | Server rejects or otherwise resolves the conflict per policy; no silent different operation |
| IDEMP-05 | Retention window has expired | Retry arrives | Documented expiry behavior is explicit; guarantee is not overstated |
| IDEMP-06 | Upstream side effect succeeds before local record persists | Process crashes | Article identifies ambiguity and need for reconciliation; it does not assert automatic exactly-once |
| IDEMP-07 | RFC 9110 §9.2.2 supports PUT idempotency | Article says POST is always idempotent | Review rejects the unqualified claim |
| IDEMP-08 | IETF header specification has Internet-Draft status | Article labels it a finalized RFC | Review rejects and requires current-status correction |
| IDEMP-09 | Stripe API response replay is cited | Article treats response replay as universal | Review rejects; version-specific behavior must be stated |

## Publication gate

For each M1 article: record source versions/sections, independent technical review (or an explicitly documented exception), real execution result for runnable examples, and link/build/accessibility validation. These rows are not proof of execution until M1 evidence is attached.
