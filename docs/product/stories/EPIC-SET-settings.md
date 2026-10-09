# EPIC-SET — Settings & Sharing — User Stories

### STORY-SET-001 — Open project Settings page
**Feature:** FEAT-SET-001 | **Role:** Viewer+ (read), Owner (write) | **Priority:** P0
**Code:** `src/app/projects/[id]/settings/page.tsx`
**Story:** As a member, I want a Settings page that shows me what's configurable for this project.
**AC:**
- Sections: Schema (Owner), Members (Owner), Physics (Viewer+ for UI), Visibility (Owner), Danger Zone (Owner).
- Non-owners see no write controls under Owner-only sections (rendered read-only or hidden).
**Audit:** No.

### STORY-SET-002 — Adjust force-physics sliders
**Feature:** FEAT-SET-002 | **Role:** Viewer+ (client) | **Priority:** P1
**Code:** `src/components/settings/physics-settings.tsx`
**Story:** As a user, I want sliders to live-tune cluster attraction, link strength, repulsion, and link distance.
**AC:** Each slider writes to `UISlice.physics`; the graph re-simulates immediately.
**Negative:** Out-of-range values clamp at slider min/max.
**Audit:** No (settings are client-side state, not persisted to DB today).

### STORY-SET-003 — Toggle project visibility Private ↔ Public
**Feature:** FEAT-SET-003 | **Role:** Owner | **Priority:** P0
**Code:** `src/components/settings/visibility-settings.tsx`, `PATCH /api/projects/[id]/visibility`
**Story:** As an Owner, I want a switch that exposes my project as Public (anyone with the link can view).
**AC:**
- Setting → Public ensures `Project.shareToken` is generated (random string).
- Setting → Private keeps the token but blocks `/public/[token]` route (verify: route checks `visibility = Public`).
**Negative:** Non-owner → 403.
**Audit:** No (visibility flip not currently logged).

### STORY-SET-004 — Copy share link
**Feature:** FEAT-SET-004 | **Role:** Owner | **Priority:** P1
**Code:** `src/components/settings/visibility-settings.tsx:121-149`
**Story:** As an Owner, I want a one-click "Copy share link" that copies `https://.../public/<shareToken>`.
**AC:** Click → writes URL to clipboard → toast "Copied".
**Negative:** Visibility is Private → link is shown but anyone clicking it gets a 404 / 403 from the public route.
**Audit:** No.

### STORY-SET-005 — Regenerate share token
**Feature:** FEAT-SET-005 | **Role:** Owner | **Priority:** P1
**Code:** `src/components/settings/visibility-settings.tsx:59-77`, `PATCH /api/projects/[id]/visibility`
**Story:** As an Owner, I want to regenerate the share token, so that previously circulated links no longer work.
**AC:** "Regenerate" button → confirm dialog → PATCH with `regenerateToken: true` → new token issued; the visible link updates.
**Audit:** No.

### STORY-SET-006 — Copy embed iframe code
**Feature:** FEAT-SET-006 | **Role:** Owner | **Priority:** P1
**Code:** `src/components/settings/visibility-settings.tsx:152-173`
**Story:** As an Owner, I want an `<iframe>` snippet to embed the graph on an external site.
**AC:**
- Snippet contains `src="https://.../public/<token>?embed=true"`.
- Width/height defaults set.
- Copy button → clipboard.
**Audit:** No.

### STORY-SET-007 — Clear all project data
**Feature:** FEAT-SET-007 | **Role:** Owner | **Priority:** P1
**Code:** `src/components/settings/danger-zone.tsx`, `DELETE /api/projects/[id]/clear-data`
**Story:** As an Owner, I want to wipe all elements and relationships while keeping the project's schema and members.
**AC:** Click → confirm → server deletes every `Element` and `Relationship` for the project; schema, members, project survive.
**Negative:** Non-owner → 403.
**Audit:** Implicit — bulk delete (may or may not emit a `ChangeLog` per row; verify).

### STORY-SET-008 — Delete the project
**Feature:** FEAT-SET-008 | **Role:** Owner | **Priority:** P1
**Code:** `src/components/settings/danger-zone.tsx`, `DELETE /api/projects/[id]`
**Story:** As an Owner, I want a "Delete project" button that permanently removes everything.
**AC:** Click → confirm → DELETE → cascade removes members, elements, relationships, change logs → redirect to `/dashboard`.
**Negative:** Non-owner → 403; UI hides the button.
**Audit:** No (whole project gone).
