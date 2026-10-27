# M0.5 — Editorial Pilots (revised)

**Updated:** 2026-10-27  
**Status:** Source-checked editorial outlines. Not publish-ready articles, and not a human-editor approval.

These three pilots deliberately represent distinct kinds of claims: convention, low-level concurrency, and distributed request semantics. None is a universal property of all programming languages or runtimes.

## Pilot A — Idiomatic Programming (`programming.idiomatic-programming`)

**Definition, limited scope:** An *idiomatic* way to implement a task is one that is recognizable and conventional in a particular language or ecosystem, under a stated context. It is not part of type-system correctness and does not imply maximum performance or universal agreement.

**Why it matters:** Porting design conventions verbatim from another language can make otherwise correct code difficult for local maintainers to read.

**Mechanism to teach:** Code review culture, standard-library conventions, naming, error handling, and tools constrain local expectations. Distinguish mandatory grammar, compiler checks, formatter output, lint recommendations, and subjective conventions.

**Worked example (Go, documentation-aligned):** Go functions often return `(value, error)`, with explicit `if err != nil` checking. A program may compile and still use awkward error handling. Compare two correct expressions of the *same operation* and explain which is standard in the documented context; do not present another language's style as inherently wrong.

**Counterexample / misconception:** `gofmt` passing does not certify semantic or architectural idiomaticity. Shorter code is not automatically idiomatic.

**Validation scenarios:** (1) State the named language and ecosystem; (2) identify style versus semantics; (3) contrast compiler-valid and conventional patterns; (4) say why a convention is not universally binding; (5) cite a primary source.

**Evidence:** [Effective Go](https://go.dev/doc/effective_go), [Go Code Review Comments](https://go.dev/wiki/CodeReviewComments). These are *Go-specific* examples; they cannot prove what is idiomatic in Rust or PHP.

**Article dependencies:** `programming.abstraction` is in the 100-entry catalog; a generic “Convention” article is not yet catalogued, so it may appear as prose only.

## Pilot B — Atomic Operation (`concurrency.atomic-operation`)

**Definition, limited scope:** Atomicity is a guarantee that an access or read-modify-write takes effect indivisibly under the relevant memory model. It does not automatically make multi-step code thread-safe, prevent all races on other memory, or provide ACID database transaction semantics.

**Why it matters:** A read-then-write update is vulnerable to lost updates under concurrent modification even when each individual read/write appears simple.

**Example (Rust, illustrative; not an executed test):**

```rust
use std::sync::atomic::{AtomicUsize, Ordering};

let counter = AtomicUsize::new(0);
assert_eq!(counter.fetch_add(1, Ordering::Relaxed), 0);
assert_eq!(counter.load(Ordering::Relaxed), 1);
```

`Relaxed` is suitable to explain the *atomicity of this counter operation*; it is not a claim that this counter synchronizes some other non-atomic data. Explain acquire/release separately when a publication protocol requires it.

**Failure cases / limits:** A two-variable invariant may break despite both variables being atomic; stale reads can still be possible; ordering constraints affect visibility; platform support must be checked for the chosen width; ABA can affect CAS-based algorithms.

**Validation scenarios:** (1) Single-thread fetch-add has expected value; (2) multiple workers each increment N times and final count equals workers × N when joined; (3) a two-variable invariant counterexample demonstrates insufficient coordination; (4) distinguish atomic operation from `db.acid`; (5) state memory ordering and target constraints.

**Evidence:** [Rust atomics module](https://doc.rust-lang.org/std/sync/atomic/), [Rust Ordering](https://doc.rust-lang.org/std/sync/atomic/enum.Ordering.html). These sources establish *Rust's* atomic API and memory semantics; cross-language extrapolation requires care.

## Pilot C — Idempotency (`distributed.idempotency`)

**Definition, limited scope:** Repeating the same logical operation does not change its *specified intended effect* after the first successful application, **within a defined identity, scope, and retention policy**. Responses, server logs, retries, and downstream incidental effects require separate guarantees.

**Why it matters:** A request may commit successfully but the response can be lost. Retrying without duplicate protection can create a second order or charge.

**Mechanism to teach:** Identify a logical attempt; verify key scope and payload identity; reserve/record the attempt with concurrency-safe durable coordination; associate outcome with the operation; resolve completed and in-progress duplicates; document expiry and downstream reconciliation. This is an *illustrative design*, not a claim that each HTTP service follows one algorithm.

**HTTP method versus application semantics:** RFC 9110 §9.2.2 defines which standard HTTP methods are idempotent in intended effect. A POST endpoint can choose a separate idempotency policy. A request's `Idempotency-Key` header is not a universal guarantee absent supporting server behavior.

**Draft status:** As checked 2026-10-27, `draft-ietf-httpapi-idempotency-key-header-08` (2026-10-22) is an **Internet-Draft**, not a finalized RFC. Its proposed policy/errors must not be represented as universally normative obligations.

**Vendor behavior:** Stripe API v1 documents response replay including first-execution errors; Stripe API v2 documents different recovery behavior. Do not claim identical response replay is the definition of idempotency or universal across API versions.

**Failure cases:** Simultaneous duplicates; same key with different payload; expired keys; database commit followed by lost response; crash after a remote side effect but before recording it; different tenants sharing an unscoped key.

**Validation scenarios:** (1) Same logical request repeated after commit → one intended effect; (2) two concurrent attempts → one effect or documented in-progress conflict; (3) key reuse with changed payload → rejected per documented API policy; (4) timeout after commit → retry cannot create second effect; (5) expiry behavior documented and exercised; (6) a partially committed external side effect requires reconciliation; (7) returning the same HTTP response is not assumed unless the endpoint promises it.

**Evidence:** [RFC 9110 §9.2.2](https://www.rfc-editor.org/rfc/rfc9110#section-9.2.2) (normative for HTTP method semantics), [Idempotency-Key Internet-Draft -08](https://datatracker.ietf.org/doc/draft-ietf-httpapi-idempotency-key-header/) (non-normative draft, status-specific), [Stripe API idempotent requests](https://docs.stripe.com/api/idempotent_requests) (vendor- and version-specific).

## Pilot acceptance outcomes

| Review check | Result |
| --- | --- |
| Covers convention, atomicity and distributed operation semantics | Pass — three distinct classes of material |
| Every pilot has scoped definition, misconceptions and counterexample | Pass — outline level |
| Every pilot has primary documentation links | Pass — source-checked on 2026-10-27 |
| Every pilot has concrete test/verification cases | Pass — scenario designs, not executed software tests |
| Ready for public publication as a full article | **No** — M1 authoring, executable checks and independent editorial approval remain |

The evidence-to-claim map is recorded separately in `../data/pilot-evidence.csv`. Status of the project-wide M0 gate remains **awaiting user/product editorial sign-off**.
