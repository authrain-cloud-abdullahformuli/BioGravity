# BioGravity — Product Documentation

Single source of truth for what BioGravity ships. Derived from code audit at SHA `98d3ded` (main, 2026-05-18).

## Read by role

| If you are… | Start with |
|---|---|
| **New joiner / executive / sales** | [03-product-description.md](03-product-description.md) — exec narrative |
| **QA lead** | [04-traceability-matrix.csv](04-traceability-matrix.csv) → import to TestRail/Xray, then [stories/](stories/) |
| **PM / roadmap planning** | [02-epic-taxonomy.md](02-epic-taxonomy.md) + [05-out-of-scope.md](05-out-of-scope.md) |
| **Engineer onboarding** | [01-role-catalog.md](01-role-catalog.md) + [prisma/schema.prisma](../../prisma/schema.prisma) |

## Files

| File | Purpose |
|---|---|
| [01-role-catalog.md](01-role-catalog.md) | 4 identity roles + unauthenticated public-token scope. Derived from `schema.prisma` + `src/lib/roles.ts` |
| [02-epic-taxonomy.md](02-epic-taxonomy.md) | **12 epics, 67 features** with stable IDs, status, code paths, audit flags |
| [03-product-description.md](03-product-description.md) | Executive product narrative — what BioGravity is, who uses it, mental model |
| [04-traceability-matrix.csv](04-traceability-matrix.csv) | **96 stories** × (epic, feature, role, priority, modules, audit, code path). QA-ready CSV |
| [05-out-of-scope.md](05-out-of-scope.md) | Backlog + non-features + "verify-before-test" items |
| [stories/](stories/) | Thick user stories, one file per epic — Gherkin AC |

## Story files

| Epic | Stories | File |
|---|---|---|
| Authentication & User Management | 9 | [stories/EPIC-AUT-auth.md](stories/EPIC-AUT-auth.md) |
| Project Management | 6 | [stories/EPIC-PRJ-project-management.md](stories/EPIC-PRJ-project-management.md) |
| Roles & Membership | 8 | [stories/EPIC-MEM-membership.md](stories/EPIC-MEM-membership.md) |
| Graph Visualization | 25 | [stories/EPIC-GRP-graph.md](stories/EPIC-GRP-graph.md) |
| Data View & Editing | 11 | [stories/EPIC-DAT-data-view.md](stories/EPIC-DAT-data-view.md) |
| Schema Editor | 5 | [stories/EPIC-SCH-schema.md](stories/EPIC-SCH-schema.md) |
| Import / Export | 6 | [stories/EPIC-IMP-import-export.md](stories/EPIC-IMP-import-export.md) |
| Settings & Sharing | 8 | [stories/EPIC-SET-settings.md](stories/EPIC-SET-settings.md) |
| Public View | 4 | [stories/EPIC-PUB-public.md](stories/EPIC-PUB-public.md) |
| Change Log & Restore | 5 | [stories/EPIC-CHG-changelog.md](stories/EPIC-CHG-changelog.md) |
| Seeding & Sample Data | 4 | [stories/EPIC-SED-seeding.md](stories/EPIC-SED-seeding.md) |
| Landing Page | 3 | [stories/EPIC-LND-landing.md](stories/EPIC-LND-landing.md) |
| Story Mode (Deferred) | 0 | [stories/EPIC-STM-story-mode.md](stories/EPIC-STM-story-mode.md) |
| Non-Functional | 8 | [stories/EPIC-NFR-non-functional.md](stories/EPIC-NFR-non-functional.md) |
| **Total** | **102** | |

## Story ID convention

`STORY-<EPIC>-NNN`. Epic ID = 3-letter prefix (see table). Story IDs are stable forever — do not renumber.

Format inside each story file:
```
### STORY-<EPIC>-NNN — short title
**Feature:** FEAT-<EPIC>-NNN | **Role:** <role> | **Priority:** P0|P1|P2
**Code:** path/to/file:line
**Story:** As <role>, I want <capability>, so that <value>.
**AC:** Given/When/Then bullets
**Negative:** explicit failure cases
**Audit:** Yes|No — what gets logged
```

## Verify-before-test rows (read before QA execution)

Items tagged `Verify` in CSV. QA should confirm code surface exists prior to writing tests:

- `STORY-IMP-002` — Excel bulk import (TODO comment in `import-export-controls.tsx`; partial wiring)
- `STORY-GRP-019` — Drag-to-create node behaviour (`use-graph-interactions.ts`; verify gesture path)
- `STORY-GRP-022` — Help dialog content (button exists in legend; content source unclear)

## Relationship to `features/app-requirements.md`

[features/app-requirements.md](../../features/app-requirements.md) is the **original product spec** authored before implementation. [features/MissingImplementation.md](../../features/MissingImplementation.md) is the **gap analysis** drafted partway through delivery. This folder is the **structured QA + governance source of truth derived from the actual code**, not from the spec.

When updating product capabilities:
1. Update code.
2. Update [02-epic-taxonomy.md](02-epic-taxonomy.md) — add/modify feature row.
3. Add stories under [stories/](stories/).
4. Append CSV row to [04-traceability-matrix.csv](04-traceability-matrix.csv).

## Maintenance

- Feature/story IDs are append-only. Deprecated features stay in taxonomy with `⛔ Deprecated` status, not removed.
- Re-audit codebase when surfaces drift materially; bump epic/feature rows accordingly.
