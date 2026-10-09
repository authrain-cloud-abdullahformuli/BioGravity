# EPIC-IMP — Import / Export — User Stories

### STORY-IMP-001 — Export project to Excel
**Feature:** FEAT-IMP-001 | **Role:** Viewer+ | **Priority:** P0
**Code:** `src/components/projects/import-export-controls.tsx:14-38`
**Story:** As a user, I want to export the entire project as an `.xlsx` file with separate Elements and Relationships sheets.
**AC:**
- Click Export → workbook downloads.
- Elements sheet columns: id, name, type, description, dateOfBirth.
- Relationships sheet columns: id, source, target, type.
**Audit:** No.

### STORY-IMP-002 — Import project from Excel 🟡
**Feature:** FEAT-IMP-002 | **Role:** Editor+ | **Priority:** P1
**Code:** `src/components/projects/import-export-controls.tsx:72-114`, `POST /api/projects/[id]/import`
**Story:** As an Editor, I want to upload an Excel file and have it upsert into the project.
**AC:**
- File picker accepts `.xlsx`, `.xls`, `.csv`.
- Parser reads Elements + Relationships sheets.
- Server upserts rows (by `id` if present, else creates new).
**Verify:** TODO comment in code indicates bulk API may not be fully wired — confirm round-trip before authoring full E2E.
**Negative:** Malformed file → 4xx + error toast.
**Audit:** Yes — each row emits a `ChangeLog`.

### STORY-IMP-003 — Import a GEDCOM (`.ged`) file
**Feature:** FEAT-IMP-003 | **Role:** Editor+ | **Priority:** P1
**Code:** `src/components/projects/import-export-controls.tsx:47-69`, `src/lib/gedcom.ts`, `POST /api/projects/[id]/import/gedcom`
**Story:** As a family-history user, I want to upload a GEDCOM file and have BioGravity create elements (individuals) and relationships (families) automatically.
**AC:**
- File picker accepts `.ged`.
- Server parses INDI + FAM records; creates Person elements; creates parent/child + partner relationships.
- Success toast shows individuals + families counts.
**Negative:** Invalid GEDCOM → 4xx + parse error.
**Audit:** Yes — bulk CREATE for each row.

### STORY-IMP-004 — Capture canvas screenshot
**Feature:** FEAT-IMP-006 | **Role:** Viewer+ | **Priority:** P2
**Code:** `src/components/projects/printscreen-button.tsx`, `UISlice.triggerScreenshot`
**Story:** As a user, I want a Printscreen button that downloads a PNG of the current graph.
**AC:** Click → `setTriggerScreenshot(true)` → graph canvas captures WebGL buffer → file downloads.
**Audit:** No.

### STORY-IMP-005 — Export GEDCOM ⛔
**Feature:** FEAT-IMP-004 | **Role:** Viewer+ | **Priority:** P2
**Status:** Backlog — see [05-out-of-scope.md](../05-out-of-scope.md).

### STORY-IMP-006 — Export backup zip (XLSX + images) ⛔
**Feature:** FEAT-IMP-005 | **Role:** Viewer+ | **Priority:** P2
**Status:** Backlog — see [05-out-of-scope.md](../05-out-of-scope.md).
