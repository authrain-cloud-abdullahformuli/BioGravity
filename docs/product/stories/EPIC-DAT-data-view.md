# EPIC-DAT — Data View & Editing — User Stories

### STORY-DAT-001 — View elements in a table
**Feature:** FEAT-DAT-001 | **Role:** Viewer+ | **Priority:** P0
**Code:** `src/components/projects/elements-table.tsx`, `src/components/projects/data-view.tsx`
**Story:** As a user, I want a table listing every element with name, type, description, DOB, and avatar.
**AC:** Table fetches from store; renders one row per element; supports row-level actions per role.
**Audit:** No.

### STORY-DAT-002 — View relationships in a table
**Feature:** FEAT-DAT-002 | **Role:** Viewer+ | **Priority:** P0
**Code:** `src/components/projects/relationships-table.tsx`
**Story:** As a user, I want a table listing every relationship with source, target, and type.
**AC:** Source and target are rendered as element names (resolved via store); type shows the configured label.
**Audit:** No.

### STORY-DAT-003 — Add a new element from Data view
**Feature:** FEAT-DAT-003 | **Role:** Editor+ | **Priority:** P0
**Code:** `src/components/projects/add-element-dialog.tsx`, `POST /api/projects/[id]/elements`
**Story:** As an Editor, I want a dialog to add a new element with name, type, description, DOB, and optional photo.
**AC:**
- Submit → `POST /api/projects/[id]/elements` with random initial position.
- New row appears at top of table; graph re-fetches and renders new node.
**Negative:** Type not in schema → submit blocked.
**Audit:** Yes — CREATE Element.

### STORY-DAT-004 — Edit an element inline
**Feature:** FEAT-DAT-004 | **Role:** Editor+ | **Priority:** P0
**Code:** `src/components/projects/edit-element-dialog.tsx`, `PATCH /api/projects/[id]/elements/[elementId]`
**Story:** As an Editor, I want to click the edit icon and update any field on an element.
**AC:** Dialog pre-fills; save → `PATCH` → row + graph update.
**Audit:** Yes — UPDATE Element with prev/new state.

### STORY-DAT-005 — Add a new relationship from Data view
**Feature:** FEAT-DAT-005 | **Role:** Editor+ | **Priority:** P0
**Code:** `src/components/projects/add-relationship-dialog.tsx`, `POST /api/projects/[id]/relationships`
**Story:** As an Editor, I want a dialog to add a relationship with source, target, and type.
**AC:** Source and target picked via `ElementCombobox` (type-ahead search); type from schema.
**Negative:** Source == Target → submit blocked; missing fields → form errors.
**Audit:** Yes — CREATE Relationship.

### STORY-DAT-006 — Edit relationship type
**Feature:** FEAT-DAT-006 | **Role:** Editor+ | **Priority:** P1
**Code:** `src/components/projects/edit-relationship-dialog.tsx`, `PATCH /api/projects/[id]/relationships/[relationshipId]`
**Story:** As an Editor, I want to change a relationship's type without recreating it.
**AC:** Dialog pre-fills with current type; save → PATCH; type label in graph reflects change.
**Audit:** Yes — UPDATE Relationship.

### STORY-DAT-007 — Type-ahead search for elements
**Feature:** FEAT-DAT-007 | **Role:** Editor+ | **Priority:** P1
**Code:** `src/components/projects/element-combobox.tsx`
**Story:** As an Editor adding a relationship, I want a searchable dropdown of elements.
**AC:** Typing filters to elements whose name contains the query; clicking selects.
**Audit:** No.

### STORY-DAT-008 — Upload and crop a photo on an element
**Feature:** FEAT-DAT-008 | **Role:** Editor+ | **Priority:** P1
**Code:** `src/components/projects/photo-crop-modal.tsx`
**Story:** As an Editor, I want to attach a photo to an element and crop it before saving.
**AC:**
- File picker opens local image.
- Crop modal shows preview with aspect ratio control.
- Save stores the cropped image (base64 or URL) on `Element.imageUrl`.
**Audit:** Yes — UPDATE Element with new `imageUrl`.

### STORY-DAT-009 — Delete an element
**Feature:** FEAT-DAT-009 | **Role:** Editor+ | **Priority:** P0
**Code:** `src/components/projects/elements-table.tsx`, `DELETE /api/projects/[id]/elements/[elementId]`
**Story:** As an Editor, I want to delete an element via the trash icon.
**AC:** Confirm dialog → DELETE → element removed; any relationships referencing it are cascade-removed by Prisma (`onDelete: Cascade`).
**Audit:** Yes — DELETE Element.

### STORY-DAT-010 — Delete a relationship
**Feature:** FEAT-DAT-010 | **Role:** Editor+ | **Priority:** P0
**Code:** `src/components/projects/relationships-table.tsx`, `DELETE /api/projects/[id]/relationships/[relationshipId]`
**Story:** As an Editor, I want to delete a relationship without touching its endpoints.
**AC:** Confirm → DELETE → row removed; endpoint elements remain.
**Audit:** Yes — DELETE Relationship.

### STORY-DAT-011 — Search & filter in Data view
**Feature:** FEAT-DAT-011 | **Role:** Viewer+ | **Priority:** P1
**Code:** `src/components/projects/data-view.tsx`
**Story:** As a user, I want a search box and type filter that narrow what the tables show.
**AC:** Search matches name/type/description; type filter restricts rows; both tables stay in sync.
**Audit:** No.
