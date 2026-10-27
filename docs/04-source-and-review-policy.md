# M0.4 — Source, Evidence and Editorial Policy

## Source hierarchy

1. **Normative:** standards and specifications (e.g. IETF RFCs, ISO/IEC where accessible, language specifications). Cite exact versions/sections where relevant.
2. **Primary implementation documentation:** official language, runtime, database, browser or framework docs, with versions when behavior changed. One vendor's API contract only supports claims about that vendor/version.
3. **Canonical project/organization references:** OWASP, CNCF, standards bodies, official research papers and original design publications. **Active Internet-Drafts are drafts, not issued RFCs**, and must be marked informative or provisional.
4. **Secondary explanations:** technical books, recognized engineering blogs and tutorials for intuition and real-world examples; not sole evidence for normative claims.
5. **Community discussion:** optional context, not the definitive source of a formal guarantee.

## Publication requirements

- One **appropriate primary source** per article, or documented editorial exception for broad/community terms.
- At least two independent supporting sources for contested or nontrivial multi-claim deep technical pieces when available; a single definitive standard may suffice for a tightly scoped normative definition.
- Source references include title, URL, role, relevant version/section, accessed/reviewed date where useful.
- Put sources next to the claims they support and in a bibliography (not just a general reading list).
- Do not claim a source proves a broader conclusion than it actually states. E.g. RFC 9110 establishes *HTTP method semantics*, not all guarantees of payment processing.
- Mark experimental/version-dependent behavior explicitly, avoid unqualified 'always/never' outside a normative scope.
- Examples must be original or reused under compatible licensing with proper attribution; do not reproduce large excerpts from protected books and sites.
- A correction should preserve change history and document the corrected claim.

## Content workflow

`catalogued -> drafted -> technically-reviewed -> copy-reviewed -> publish-approved -> published`

Each state is a **human editorial workflow label** (no CMS/state-machine implementation in M0). Claim verification and source coverage are recorded during technical review. The author may be the reviewer for an independent check, but should record a separate review pass and supporting evidence; for critical security or concurrency articles seek a second reviewer when feasible.

## Version and change policy

- `reviewedAt` is the date of actual verification, **not** creation or build date.
- Track evolving external references: OWASP Top 10 editions, runtime/library APIs, RFC status, framework releases, CVE advisories.
- Review on a meaningful source revision or reported factual error, not an invented mandatory calendar unless the content needs it.
- Dated references are not by themselves evidence of present-day applicability.

## Recommended authoritative seed references

| Area | Reference | Appropriate claims |
| --- | --- | --- |
| Idiomatic programming | https://go.dev/doc/effective_go | Go conventions; not language-universal law |
| Atomic shared-memory primitives | https://doc.rust-lang.org/std/sync/atomic/ | Rust atomic types and their scope |
| Memory ordering | https://doc.rust-lang.org/stable/core/sync/atomic/enum.Ordering.html | Rust/C++-related ordering distinctions |
| HTTP idempotent methods | https://www.rfc-editor.org/rfc/rfc9110#section-9.2.2 | Normative HTTP method semantics |
| OWASP programs | https://owasp.org/ | Organization/ecosystem overview |
| OWASP Top 10 2025 | https://owasp.org/projects/top-ten | Awareness document/version; not a comprehensive standard |
| OWASP ASVS | https://asvs.owasp.org/ | Security verification requirements |
| Starlight frontmatter | https://starlight.astro.build/reference/frontmatter/ | Schema extension and docs collection fields |
| Starlight search | https://starlight.astro.build/guides/site-search/ | Built-in Pagefind static search |

## 2026-10-27 scope checks

- RFC 9110 §9.2.2 describes the *intended effect* of identical HTTP requests and explicitly permits incidental differences such as logging and possibly different responses.
- The Idempotency-Key Internet-Draft `-08` was published 2026-10-22; check its live status before any public article claims it is standard.
- Stripe documents API v1 and API v2 idempotency handling differently. Cite the exact behavior and API version instead of treating Stripe as a protocol definition.
- Rust atomic operation ordering does not imply unrelated data become correctly synchronized under `Relaxed`; a single atomic counter does not establish multi-variable invariants.
- Go style examples prove only Go idioms, not language-independent universals.

## Licensing gate

Choose a publication license and contributor/content permissions before public launch. Do not assume software code licenses automatically cover original explanatory prose and diagrams. Reference links do not grant text reproduction rights.
