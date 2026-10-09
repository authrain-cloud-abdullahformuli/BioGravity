# Walkthroughs — the dev log

This folder is the running journal of how BioGravity got built. Each file
captures the context for a single change: what I was trying to do, what
broke, what I tried, and what eventually shipped.

The entries are unedited working notes — they're useful to read if you
want to see how the project actually evolved, not how it looks in the
polished README. Filenames follow `YYYY-MM-DD-short-slug.md` (with some
older `YYYYMMDD-HHMMSS-…` variants from before I settled on a convention).

Below is a grouped index of what's here.

---

## Foundational increments

Big-step feature batches from the early life of the project, when the
shape of the app was still being established.

- [Increments.md](Increments.md) — increment 1: foundation & authentication.
- [20260208-085904-p1-user-menu-roles.md](20260208-085904-p1-user-menu-roles.md) — P1: user menu and roles.
- [20260208-091147-p2-settings-enhancements.md](20260208-091147-p2-settings-enhancements.md) — P2: project settings.
- [20260208-092048-p3-graph-enhancements.md](20260208-092048-p3-graph-enhancements.md) — P3: graph enhancements.
- [20260208-111732-p4-data-enhancements.md](20260208-111732-p4-data-enhancements.md) — P4: data section.
- [20260208-113533-p4-1-gedcom.md](20260208-113533-p4-1-gedcom.md) — P4.1: GEDCOM import.
- [20260208-113311-p5-project-defaults.md](20260208-113311-p5-project-defaults.md) — P5: project defaults & seed data.

## Graph & visualisation

The 3D/2D canvas, the legend, exports, focus mode, and the visual identity.

- [2026-02-08-futuristic-redesign.md](2026-02-08-futuristic-redesign.md) — design language refresh.
- [2026-02-26-dynamic-graph-legend.md](2026-02-26-dynamic-graph-legend.md) — legend that follows the project schema.
- [2026-02-26-graph-legend-mockup.png](2026-02-26-graph-legend-mockup.png) — paired design mockup.
- [2026-02-26-printscreen-feature.md](2026-02-26-printscreen-feature.md) — high-res PNG export of the graph.
- [2026-02-26-export-graph-improvement.md](2026-02-26-export-graph-improvement.md) — making the export usable for sharing.
- [2026-02-26-edit-schema-types.md](2026-02-26-edit-schema-types.md) — editing element & relationship types.

## Data & editing

The spreadsheet-style data view, validation, and editing flows.

- [2026-02-25-data-editing.md](2026-02-25-data-editing.md) — bug validation pass on data editing.
- [20260208-data-view-layout-fix.md](20260208-data-view-layout-fix.md) — data tab layout fix.

## Auth & onboarding

- [2026-02-26-signup-auto-login.md](2026-02-26-signup-auto-login.md) — auto-login after signup.
- [2026-02-26-signup-auto-login.png](2026-02-26-signup-auto-login.png) — paired UI screenshot.
- [biogravity_signup.png](biogravity_signup.png) — early signup screen.

## Bug-fix sessions

Dated triage notes from days I spent burning down the backlog.

- [2026-02-09-bug-fixes.md](2026-02-09-bug-fixes.md)
- [2026-02-25-bug-fixes.md](2026-02-25-bug-fixes.md)

## Infrastructure & deployment

The deploy-to-Synology saga, Prisma engine quirks on ARM, WebGL fallout
from a too-new Three.js, and Docker oddities.

- [2026-02-26-fix-docker-build-public-dir.md](2026-02-26-fix-docker-build-public-dir.md) — Docker build can't find `public/`.
- [20260226-1000-prisma-migration-fix.md](20260226-1000-prisma-migration-fix.md) — Prisma migration error on the NAS.
- [20260226-fix-prisma-binary-targets.md](20260226-fix-prisma-binary-targets.md) — pinning Prisma binary targets for the NAS arch.
- [20260226-1135-fix-webgl-vertex-crash.md](20260226-1135-fix-webgl-vertex-crash.md) — `VERTEX` undefined on Three.js v0.182 with mismatched deps.

## Testing & housekeeping

- [2026-02-08-comprehensive-testing.md](2026-02-08-comprehensive-testing.md) — Vitest + Testing Library setup pass.
- [2026-02-15-project-cleanup.md](2026-02-15-project-cleanup.md) — dead-file purge while keeping the dev log intact.
- [2026-02-26-readme-update.md](2026-02-26-readme-update.md) — earlier README rewrite.

---

If you're trying to get a feel for how the project really evolved rather
than what the README claims, the infrastructure and bug-fix sections are
the most honest reading.
