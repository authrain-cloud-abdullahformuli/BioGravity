# EPIC-PRJ — Project Management — User Stories

### STORY-PRJ-001 — Dashboard lists my projects
**Feature:** FEAT-PRJ-001 | **Role:** Authenticated | **Priority:** P0
**Code:** `src/app/dashboard/page.tsx`
**Story:** As an authenticated user, I want a dashboard listing every project I own or am a member of, so that I can pick one to open.
**AC:**
- Server-fetches projects where `ownerId = me` OR there exists a `ProjectMember` row for me.
- Each card shows name, type, element count, member count, last updated.
- Click card → `/projects/[id]`.
**Negative:** No projects → empty-state CTA to create one.
**Audit:** No.

### STORY-PRJ-002 — Create a new project
**Feature:** FEAT-PRJ-002 | **Role:** Authenticated | **Priority:** P0
**Code:** `src/components/dashboard/new-project-dialog.tsx`, `POST /api/projects`
**Story:** As an authenticated user, I want to create a project by name, optional description, and project type.
**AC:**
- Dialog with name (required), description (optional), type select (Family / Organization).
- On submit → `POST /api/projects` → `Project` row created with `ownerId = me`, `type` set, and `elementTypes` / `relationshipTypes` populated with the type's defaults.
- After save, dialog closes and dashboard refreshes.
**Negative:** Empty name → submit blocked.
**Audit:** No (creation is implicit; no `ChangeLog` until first element is added).

### STORY-PRJ-003 — Project type applies default schema
**Feature:** FEAT-PRJ-003 | **Role:** Authenticated | **Priority:** P0
**Code:** `src/lib/data/modern-family.ts`, `src/lib/data/organization.ts`, `src/app/api/projects/route.ts`
**Story:** As a user creating a project, I want sensible defaults so that I do not have to define a schema before adding anything.
**AC:**
- Family → element types: Person, Pet; relationship types: parent/child, partner, owner/pet.
- Organization → element types: Person, Company, Department, Team; relationship types: direct report, indirect report.
- Defaults are written to `Project.elementTypes` / `Project.relationshipTypes` at creation.
**Audit:** No.

### STORY-PRJ-004 — Open project to Graph / Data / History tabs
**Feature:** FEAT-PRJ-004 | **Role:** Viewer+ | **Priority:** P0
**Code:** `src/app/projects/[id]/page.tsx`
**Story:** As a project member, I want the project page to default to the Graph view with Data and History tabs.
**AC:**
- Default tab = Graph.
- Tab switcher persists in URL or local state (verify).
- Tabs render: GraphCanvas, DataView, HistoryTab.
**Negative:** Not a member → 401/404 (server check via `requireRole`).
**Audit:** No.

### STORY-PRJ-005 — Exit project back to dashboard
**Feature:** FEAT-PRJ-005 | **Role:** Viewer+ | **Priority:** P1
**Code:** `src/app/projects/[id]/page.tsx`, `src/components/navbar.tsx`
**Story:** As a project member, I want a visible Exit / Back action so that I can return to my project list.
**AC:** Back arrow in header navigates to `/dashboard`.
**Audit:** No.

### STORY-PRJ-006 — Delete project permanently (Owner only)
**Feature:** FEAT-PRJ-006 | **Role:** Owner | **Priority:** P1
**Code:** `src/components/settings/danger-zone.tsx`, `DELETE /api/projects/[id]`
**Story:** As an Owner, I want to delete a project, so that I can remove it permanently.
**AC:**
- Danger Zone shows red "Delete project" button.
- Click → confirmation dialog typing project name (or simple Confirm).
- `DELETE /api/projects/[id]` cascades to elements, relationships, members, change logs.
- Redirects to `/dashboard` on success.
**Negative:** Non-owner → API returns 403; UI hides button.
**Audit:** Implicit (entity removal; no per-row changelog for cascade).
