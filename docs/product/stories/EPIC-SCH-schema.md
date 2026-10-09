# EPIC-SCH — Schema Editor — User Stories

### STORY-SCH-001 — Manage element types
**Feature:** FEAT-SCH-001 | **Role:** Owner | **Priority:** P0
**Code:** `src/components/projects/schema-editor.tsx`, `POST /api/projects/schema`
**Story:** As an Owner, I want to add, rename, delete, and recolor element types, so that the schema fits my domain.
**AC:**
- Add → new row appended to `elementTypes` JSON array `[{name, color}, ...]` on the `Project`.
- Edit → rename a type; existing elements keep referencing the old name unless migrated separately (verify).
- Delete → blocked when only one type remains.
- Save → `POST /api/projects/schema` upserts the JSON.
**Negative:** Empty name → submit blocked; duplicate name → 4xx.
**Audit:** No (schema changes not currently logged to `ChangeLog`).

### STORY-SCH-002 — Manage relationship types
**Feature:** FEAT-SCH-002 | **Role:** Owner | **Priority:** P0
**Code:** `src/components/projects/schema-editor.tsx`, `POST /api/projects/schema`
**Story:** As an Owner, I want to add, rename, delete, and recolor relationship types.
**AC:** Same shape as element types; `relationshipTypes` JSON column.
**Negative:** At least one relationship type must remain.
**Audit:** No.

### STORY-SCH-003 — Pick a hex color per type
**Feature:** FEAT-SCH-003 | **Role:** Owner | **Priority:** P1
**Code:** `src/components/projects/schema-editor.tsx`
**Story:** As an Owner, I want a hex color picker for each type, so that nodes and edges are visually distinct.
**AC:** Color input writes a 6-digit hex string; graph legend + nodes reflect the new color after save.
**Audit:** No.

### STORY-SCH-004 — Set relationship strength
**Feature:** FEAT-SCH-004 | **Role:** Owner | **Priority:** P2
**Code:** `src/components/projects/schema-editor.tsx`
**Story:** As an Owner, I want to set a strength weight per relationship type, so that important edges pull harder.
**AC:** Strength numeric input persists to relationship type record; force simulation multiplies link strength by this weight (where wired).
**Audit:** No.

### STORY-SCH-005 — Validate schema has at least one type
**Feature:** FEAT-SCH-005 | **Role:** Owner | **Priority:** P0
**Code:** `src/components/projects/schema-editor.tsx`
**Story:** As an Owner, I want the editor to prevent saving a schema with zero element types or zero relationship types.
**AC:** Delete-last button disabled; UI shows "At least one type required."
**Audit:** No.
