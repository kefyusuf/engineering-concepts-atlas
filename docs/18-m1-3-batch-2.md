# M1.3 — Batch 2: Observer Pattern and Virtual Memory

## Scope
- `patterns.observer-pattern` in `oop-design-patterns`
- `os.virtual-memory` in `operating-systems-memory`

Both are existing M1 seeds in the 100-concept catalog. No data schema, taxonomy, production gate or runtime infrastructure change.

## Editorial decisions
- Observer: distinguish synchronous in-process subscription from asynchronous/distributed durable messaging. Define unsubscribe, snapshot iteration, reentrancy and callback error contract explicitly.
- Virtual Memory: distinguish virtual address reservation from resident RAM, valid page faults from access violations, mapping from protection, and virtual memory from swap.
- All external technical claims are scoped to original documentation or appropriately labeled teaching references. Both pages are draft; reviewer and reviewedAt remain absent.

## Acceptance
1. Existing 100 concept IDs and 20 categories unchanged.
2. Exactly seven M1 advanced draft articles, thirty source routes, no production editorial approval.
3. Runnable JavaScript examples have positive/negative verification tests; examples do not claim to model actual hardware or durable delivery.
4. Category overview, homepage, A–Z index, static route audit, Chromium fixture, live browser audit and Pagefind find both drafts.
5. PR CI passes before merge; main-branch CI and GitHub Pages deployment succeed after merge.
6. build:release still blocks the preview.

## TDD
RED commit: `6fdfe8bda99a48634dcce5327731bd5eea2e5fd9`; expected failure until pages authored.
GREEN changes: deep dive MDX and test/navigation coverage.
Record actual passing CI run in PR review before merge.

## Non-goals
No additional concepts beyond the two seeds, backend, user account, CMS, new graph system, automatic editorial approval or production release.
