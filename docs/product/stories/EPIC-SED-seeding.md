# EPIC-SED — Seeding & Sample Data — User Stories

### STORY-SED-001 — See Seed CTA on an empty project
**Feature:** FEAT-SED-001 | **Role:** Editor+ | **Priority:** P0
**Code:** `src/components/projects/seed-button.tsx`
**Story:** As an Editor in a project with zero elements, I want a prominent "Seed sample data" button so I can populate the project instantly.
**AC:**
- Button renders only when `elements.length === 0`.
- Disappears once data exists.
**Audit:** No (the click itself; see STORY-SED-002 / 003 for the writes).

### STORY-SED-002 — Seed the Family demo dataset
**Feature:** FEAT-SED-002 | **Role:** Editor+ | **Priority:** P0
**Code:** `src/lib/data/modern-family.ts`, `POST /api/projects/[id]/seed`
**Story:** As an Editor on a Family-type project, I want the Modern Family dataset to load with one click.
**AC:**
- Server reads `Project.type`, selects `modern-family` dataset, bulk-inserts elements + relationships.
- Page reloads → graph renders the seeded data.
**Audit:** Yes — each row writes a `ChangeLog` CREATE (verify whether seed writes are logged or skipped).

### STORY-SED-003 — Seed the Organization demo dataset
**Feature:** FEAT-SED-003 | **Role:** Editor+ | **Priority:** P0
**Code:** `src/lib/data/organization.ts`, `POST /api/projects/[id]/seed`
**Story:** As an Editor on an Organization-type project, I want the org-chart dataset to load with one click.
**AC:** Same as STORY-SED-002 but with the organization dataset.
**Audit:** Yes (verify).

### STORY-SED-004 — Reload after seed
**Feature:** FEAT-SED-004 | **Role:** Editor+ | **Priority:** P1
**Code:** `src/components/projects/seed-button.tsx`
**Story:** As an Editor, after seeding, I want the page to refresh so I see the new graph without a manual reload.
**AC:** Successful seed triggers `window.location.reload()` (or store rehydrate); graph + tables update.
**Negative:** Seed failure → toast + button stays available.
**Audit:** No.
