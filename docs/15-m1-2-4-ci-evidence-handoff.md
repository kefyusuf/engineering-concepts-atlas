# M1.2.4 — CI Evidence Handoff

**Milestone:** M1.2 (still open)  
**Date:** 2026-10-27  
**Status:** Offline/source checks verified; hosted build and browser run not yet executed.

## Problem

The local execution environment runs Node.js 22.16.0 and cannot resolve registry.npmjs.org. It cannot install the project's Astro and Starlight dependencies. Chromium also blocks loopback navigation in this managed runtime. Continued synthetic tests cannot establish that Astro actually builds or Pagefind works in a browser.

## Limited change

- The existing GitHub Actions workflow is now an evidence-capturing validation chain (not a deployment).
- Every completed gate writes its CLI output to `evidence/ci/` and preserves failures through shell `pipefail`.
- `actions/upload-artifact@v4` runs even if a prior step fails; it attaches the genuine package lockfile and/or built site if generated.
- The workflow has read-only GitHub contents permission. It never commits, merges, deploys, or claims editorial approval.
- The project code, 100-concept M0 catalog, 20 categories, and three draft articles are unchanged.

## How to execute

1. Import the source tree into a **private** GitHub repository under the user's control. Preserve `.github/workflows/ci.yml`. Repository creation and push are not performed by this package.
2. Push a feature branch and open a PR to trigger this workflow; do not merge prior to review.
3. Review the GitHub Actions outcome, download `m1-2-verification-<run-id>` under workflow artifacts, and inspect the logs.
4. If installation created a lockfile, inspect the generated `package-lock.json`, commit it on the same branch, change bootstrap install to `npm ci`, and re-run CI.
5. M1.2 may close only when real Astro schema checks, real static build, built HTML/asset/Pagefind audits, Chromium route/search checks, and keyboard/accessibility review pass.

## Caveats

- `npm install` is a temporary first-install exception; repeatability is not established until a genuine lockfile is committed and `npm ci` passes.
- Real browser tests may reveal runner-specific Chromium launch issues. In that case use browser logs to diagnose; do not label the gate green.
- Artifact storage lasts seven days. `dist/` is a **preview of unapproved drafts** and must not be deployed as a published reference.
- No GitHub repository or remote CI run has been created by this milestone.
