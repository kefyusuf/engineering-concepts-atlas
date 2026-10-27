# M1.2.5 — GitHub Pages editorial preview

## Decision

Configure Pages as a public **editorial preview** only. Do not bypass the production content-approval gate. The site must not claim that M1.2 was verified without a genuine GitHub-hosted build and browser run.

## Preconditions

1. Audit repository contents for credentials, private data, copyright/licensing and unintended artifacts.
2. Create the public repository `kefyusuf/engineering-concepts-atlas`; preserve the current source files.
3. Configure **Settings > Pages > Source: GitHub Actions**.
4. Restrict `github-pages` environment deployments to `main`.
5. Commit the source to a feature branch; run CI on a PR; review and merge only after checks pass.

## Acceptance gates

- PR runs test, content validation, independent browser harness, Astro checks, base-aware production build, compiled link/Pagefind audit and Chromium smoke without deployment.
- A `main` push runs all the same gates, then uploads an official Pages artifact and deploys only when checks succeed.
- Actual published `/engineering-concepts-atlas/` pages include the editorial preview notice and robots noindex metadata.
- Internal links, hero action links, sidebar, CSS assets, and Pagefind function under the repository subpath.
- Production editorial publication remains blocked by `npm run build:release`.
- Record the workflow run and Pages URL as verification evidence; until then M1.2 remains open.

## Explicit non-goals

No new learning articles, CMS, backend, search engine replacement, preview per PR, GitHub Pages custom domain or auto-approval of technical claims.
