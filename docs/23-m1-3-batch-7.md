# M1.3 — Batch 7: Software Bill of Materials and Observability

## Scope
Exactly two existing M0 M1 seed concepts:
- devops.sbom — devops-ci-cd/software-bill-of-materials
- sre.observability — observability-sre/observability

100 catalog candidates, 20 categories, six groups, 18 relationships and the 20-approved-article production release gate remain unchanged.

## Technical evidence boundaries
- SBOM: inventory, dependency completeness, transitive coverage, versioning and known unknowns, scoped to SPDX, CycloneDX and CISA 2025. The executable Node example checks **only a manually declared graph**; it is **not** an SPDX/CycloneDX validator, binary analyzer or security attestation.
- Observability: traces, metrics, logs, propagation, sampling/cost/cardinality and diagnostic limitations, scoped to OpenTelemetry official docs and Google SRE. The example correlates in-memory synthetic records, **not** OpenTelemetry trace IDs, a collector or monitoring backend.
- Each article has ten major editorial sections, source roles/scopes, visible draft warning and no reviewer/reviewedAt.
- The compact reference library design from PR #8 is preserved: no CSS, layout or group restructuring; only two directory entries and counters.

## RED → GREEN
RED commit f23508b31a072b2f1c35c0caa07c00e534ebf359; GitHub Actions 40882417655 failed as intended: expected 17 drafts and 40 authored routes, found 15 and 38, missing homepage discoverability.
GREEN: advanced content, runnable positive/negative Node examples, category/A-Z/home links, source/static route checks, real Chromium routes, Pagefind discovery and compact-design regression verification.

## Acceptance
1. Exactly 17 unreviewed draft concept pages and 40 authored routes; zero published.
2. SBOM example catches transitive missing nodes, duplicate IDs and blank versions; no schema compliance claim.
3. Observability example rejects orphan spans, duplicate spans and unknown log links; aggregate metrics do not imply trace membership.
4. All Node source tests, Astro check, static build, Pagefind and real Chromium evidence pass.
5. PR scope review before merge; main-only Pages deploy success verified after merge.
6. No new dependency, backend, telemetry service, UI overhaul, search system, automatic editorial approval or production release.

## Deferred
Independent technical/editorial review, artifact-level SBOM generation and standards validator, real service OTel instrumentation, collector and performance investigations.
