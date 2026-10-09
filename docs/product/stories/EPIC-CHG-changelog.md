# EPIC-CHG — Change Log & Restore — User Stories

### STORY-CHG-001 — Audit trail captured for every element/relationship mutation
**Feature:** FEAT-CHG-001, FEAT-CHG-005 | **Role:** System | **Priority:** P0
**Code:** `prisma/schema.prisma:122-135`, `src/app/api/projects/[id]/elements/*`, `src/app/api/projects/[id]/relationships/*`
**Story:** As a project member, I want every CREATE / UPDATE / DELETE on Elements or Relationships to be logged.
**AC:**
- `ChangeLog` row written with `{action, entityType, entityId, entityName, previousState, newState, userId, projectId, createdAt}`.
- `previousState` = null on CREATE; `newState` = null on DELETE.
- Cascade deletes from a parent element MAY or MAY NOT emit per-row logs (verify).
**Audit:** Yes — this story *is* the audit feature.

### STORY-CHG-002 — Open History tab and see ordered list of changes
**Feature:** FEAT-CHG-002 | **Role:** Viewer+ | **Priority:** P0
**Code:** `src/components/projects/history-tab.tsx`, `GET /api/projects/[id]/changelog`
**Story:** As a member, I want a History tab showing recent changes ordered newest-first.
**AC:**
- Tab fetches `/api/projects/[id]/changelog`.
- Each entry shows: action label (Created / Updated / Deleted), entity type, entity name (or ID), timestamp, user avatar + name.
**Audit:** No.

### STORY-CHG-003 — Display relative timestamps and user identity
**Feature:** FEAT-CHG-003 | **Role:** Viewer+ | **Priority:** P1
**Code:** `src/components/projects/history-tab.tsx`, `src/lib/dateFormatting.ts`
**Story:** As a member, I want timestamps like "2 hours ago" and a user avatar per change, so that I can scan history fast.
**AC:** `dateFormatting.ts` returns human-readable relative strings; absolute datetime in tooltip.
**Audit:** No.

### STORY-CHG-004 — Restore a previous state from a change entry
**Feature:** FEAT-CHG-004 | **Role:** Editor+ | **Priority:** P1
**Code:** `src/components/projects/history-tab.tsx:65-79`, `POST /api/projects/[id]/restore`
**Story:** As an Editor, I want to click "Restore" on a history entry to revert to that state.
**AC:**
- Confirmation dialog.
- Server applies the `previousState` of the chosen entry to the entity.
- A new `ChangeLog` row is appended documenting the restore (verify).
**Negative:** Restore of a DELETE that no longer exists → reinstates the entity (verify). Restore by Viewer → 403.
**Audit:** Yes — restore action itself is logged.

### STORY-CHG-005 — Cannot restore on the Public view
**Feature:** FEAT-CHG-002, FEAT-PUB-004 | **Role:** Unauthenticated | **Priority:** P1
**Code:** `src/components/graph/public-graph-view.tsx`
**Story:** As an Owner, I want the History tab + restore button to be unavailable in the public view.
**AC:** `/public/[token]` does not render the History tab; `POST /api/projects/[id]/restore` rejects unauthenticated requests.
**Audit:** No.
