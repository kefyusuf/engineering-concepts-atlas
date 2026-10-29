# Engineering Concepts Atlas

**Current milestone:** M1.3 — advanced content, batch 7 (editorial preview).
**Content language:** English.
**Publication:** GitHub Pages is an unreviewed preview, not a production knowledge reference.

A static-first, language-agnostic technical atlas covering exact semantics, guarantees, failure modes, worked examples and primary sources.

## Verified foundation (M1.2)

The first GitHub Actions build, Pagefind search, Chromium route smoke and Pages deployment succeeded on 27 October 2026.
- [GitHub Actions evidence](https://github.com/kefyusuf/engineering-concepts-atlas/actions/runs/40491335613)
- [Editorial preview](https://kefyusuf.github.io/engineering-concepts-atlas/)
- The public preview uses a noindex policy and visible draft notices.

## Local development

Requirements: Node.js 22.23.4 or newer on a supported even-numbered release, plus npm registry access.

~~~bash
npm install
npm run test
npm run validate:content
npm run check
npm run build
npm run verify:browser
npm run dev
~~~

The repository does not yet contain an npm lockfile. CI therefore uses npm install; commit a genuine npm-generated package-lock.json and switch to npm ci in a separately reviewed change.

## Knowledge coverage

- 100 planned candidates in 20 categories and six navigation groups.
- Seventeen **draft** concept articles: Idiomatic Programming, Atomic Operation, Idempotency, Type Inference, Pure Function, Observer Pattern, Virtual Memory, Input/Output (I/O), Transaction Isolation Levels, Abstract Syntax Tree (AST), HTTP Method Semantics, Bloom Filter, Mutation Testing, Bounded Context, Tail Latency, Software Bill of Materials (SBOM), and Observability.
- Remaining 83 candidates are plans, not articles.
- The M0 catalog and relationships are authoritative and are not modified by this batch.

Every article must cover definition, motivation, mental model, mechanics, example, failure modes, trade-offs, comparisons, verification and scope-matched references.

## Publication discipline

**Do not claim production publication based on preview deployment.** Production build:release requires 20 independently reviewed M1 seed articles, one per category. A draft has no reviewedAt date.

Pull requests run tests, content/schema validation, Astro build, Pagefind and Chromium checks. Only a successful merge to main may deploy the static preview. Refer to docs/17-m1-3-batch-1.md and docs/18-m1-3-batch-2.md and docs/19-m1-3-batch-3.md and docs/20-m1-3-batch-4.md and docs/21-m1-3-batch-5.md and docs/22-m1-3-batch-6.md and docs/23-m1-3-batch-7.md for content groups.

## Structure

- src/content/docs/: category pages and individual MDX concepts.
- src/content.config.ts: Starlight + Zod schema.
- data/: canonical M0 catalog and relationships.
- scripts/: content, link, Pagefind and real-browser gates.
- tests/: Node and content/example tests.
- docs/: decisions, M0 and milestone evidence.

Out of scope: backend, CMS, login, dynamic search service, AI assistant, knowledge graph database and playground.
