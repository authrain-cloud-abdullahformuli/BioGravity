# BioGravity Epic & Feature Taxonomy

Status legend: ✅ Implemented · 🟡 Partial · 🔍 Verify (code surface unclear) · ⛔ Out of scope (backlog).
All features below = ✅ unless tagged.

IDs are stable forever. Format: `FEAT-<epic>-NNN`.

---

## EPIC-AUT — Authentication & User Management

NextAuth.js (JWT strategy, Prisma adapter) + Credentials provider. No OAuth.

| ID | Feature | Code path | Audit | Modules |
|---|---|---|---|---|
| FEAT-AUT-001 | Email/password sign-up with auto-login | `src/app/signup/page.tsx`, `src/app/api/register/route.ts` | No | Auth |
| FEAT-AUT-002 | Email/password login (NextAuth Credentials) | `src/app/login/page.tsx`, `src/lib/auth.ts` | No | Auth |
| FEAT-AUT-003 | JWT session w/ user ID injection | `src/lib/auth.ts:55-70` | No | Auth |
| FEAT-AUT-004 | bcrypt password hashing (cost default) | `src/app/api/register/route.ts`, `src/lib/auth.ts:37-41` | No | Auth |
| FEAT-AUT-005 | User avatar menu (Profile + Log out) | `src/components/user-menu.tsx` | No | Auth |
| FEAT-AUT-006 | Profile view + edit (name, email, image) | `src/app/profile/page.tsx`, `src/app/profile/profile-form.tsx`, `src/app/api/profile/route.ts` | No | Auth |
| FEAT-AUT-007 | Dark/Light theme toggle (next-themes) | `src/components/mode-toggle.tsx`, `src/components/theme-provider.tsx` | No | Auth |
| FEAT-AUT-008 | Protected dashboard redirect (server-side) | `src/app/dashboard/page.tsx` | No | Auth |

---

## EPIC-PRJ — Project Management (Dashboard)

A project owns elements, relationships, schema (element & relationship types), members, change log.

| ID | Feature | Code path | Audit | Modules |
|---|---|---|---|---|
| FEAT-PRJ-001 | Dashboard project list (owned + member) | `src/app/dashboard/page.tsx` | No | Project |
| FEAT-PRJ-002 | Create project dialog (name, description, type) | `src/components/dashboard/new-project-dialog.tsx`, `POST /api/projects` | No | Project |
| FEAT-PRJ-003 | Project type defaults — Family / Organization seed schema | `src/lib/data/modern-family.ts`, `src/lib/data/organization.ts`, `src/app/api/projects/route.ts` | No | Project |
| FEAT-PRJ-004 | Project page tabs (Graph / Data / History) | `src/app/projects/[id]/page.tsx` | No | Project |
| FEAT-PRJ-005 | Exit project nav (back to dashboard) | `src/app/projects/[id]/page.tsx`, `src/components/navbar.tsx` | No | Project |
| FEAT-PRJ-006 | Permanent project deletion w/ confirm | `src/components/settings/danger-zone.tsx`, `DELETE /api/projects/[id]` | Implicit cascade | Project |

---

## EPIC-MEM — Roles & Membership

Owner manages a per-project ACL of `Viewer / Editor / Admin`. Owner is implicit Admin.

| ID | Feature | Code path | Audit | Modules |
|---|---|---|---|---|
| FEAT-MEM-001 | Role hierarchy enforcement (Viewer < Editor < Admin) | `src/lib/roles.ts` | No | Auth, Project |
| FEAT-MEM-002 | Invite member by email (defaults to Editor) | `src/components/projects/member-list.tsx`, `POST /api/projects/members` | No | Project |
| FEAT-MEM-003 | Member list with avatar, role badge | `src/components/projects/member-list.tsx` | No | Project |
| FEAT-MEM-004 | Remove member (owner only) | `src/components/projects/member-list.tsx`, `DELETE /api/projects/members` | No | Project |
| FEAT-MEM-005 | Server-side `requireRole()` guard on all `/api/projects/[id]/*` | `src/lib/roles.ts:101-133` + every route under `src/app/api/projects/[id]/` | No | Auth |
| FEAT-MEM-006 | Read-only UI for Viewers (action buttons hidden) | `src/components/projects/data-view.tsx`, `src/components/projects/elements-table.tsx`, `src/components/projects/relationships-table.tsx` | No | Project |
| FEAT-MEM-007 | Invite token + registration flow for unregistered emails (7-day TTL, copy-link, revoke) | `prisma/schema.prisma` (ProjectInvite), `src/lib/invites.ts`, `src/app/api/projects/members/route.ts`, `src/app/api/invites/[token]/*`, `src/app/api/projects/[id]/invites/*`, `src/app/invite/[token]/page.tsx`, `src/components/projects/member-list.tsx` | Yes (info logs: create / accept / revoke) | Project, Auth |
| FEAT-MEM-008 | Transactional invite email via Resend (auto-send on create, resend action, delivery state surfaced) | `src/lib/email/*`, `src/app/api/projects/members/route.ts`, `src/app/api/projects/[id]/invites/[inviteId]/resend/route.ts`, `src/components/projects/member-list.tsx`, `prisma/schema.prisma` (lastSentAt/sendFailureCount/lastSendError) | Yes (info logs: email.send.start / ok / error) | Project, Auth, Email |

---

## EPIC-GRP — Graph Visualization

The interactive 3D/2D force-directed graph — BioGravity's core canvas. Powered by `react-force-graph-3d` + `d3-force-3d` + Three.js.

| ID | Feature | Code path | Audit | Modules |
|---|---|---|---|---|
| FEAT-GRP-001 | 3D force-directed graph rendering | `src/components/graph/graph-scene.tsx`, `src/components/graph/graph-canvas.tsx` | No | Graph |
| FEAT-GRP-002 | 2D force-directed alternative | `src/components/graph/graph-scene-2d.tsx` | No | Graph |
| FEAT-GRP-003 | 2D/3D toggle | `src/components/graph/navigation-controls.tsx`, `UISlice.is2D` | No | Graph |
| FEAT-GRP-004 | Force physics config (cluster attraction, link strength, repulsion, link distance) | `src/store/ui-slice.ts:33-38`, `src/components/graph/use-graph-forces.ts` | No | Graph |
| FEAT-GRP-005 | Physics tuning UI sliders | `src/components/settings/physics-settings.tsx` | No | Graph |
| FEAT-GRP-006 | Node pinning to fixed XYZ position | `src/store/graph-slice.ts:63-108`, `PATCH /api/projects/[id]/elements/[elementId]` | No | Graph |
| FEAT-GRP-007 | Full-text search filter (name/type/description) | `src/components/graph/filter-panel.tsx`, `UISlice.searchQuery` | No | Graph |
| FEAT-GRP-008 | Type filter dropdown | `src/components/graph/filter-panel.tsx` | No | Graph |
| FEAT-GRP-009 | Focus Mode (isolate node + N degrees) | `src/components/graph/focus-controls.tsx`, `UISlice.focusMode`, `UISlice.focusDegrees` | No | Graph |
| FEAT-GRP-010 | Labels toggle (show/hide node names) | `src/components/graph/navigation-controls.tsx`, `UISlice.showLabels` | No | Graph |
| FEAT-GRP-011 | Node size slider | `src/components/graph/node-size-slider.tsx`, `UISlice.nodeSize` | No | Graph |
| FEAT-GRP-012 | Generational ordering toggle + strength | `src/components/graph/generational-toggle.tsx`, `UISlice.generationalOrdering` | No | Graph |
| FEAT-GRP-013 | Zoom in / out / reset to fit | `src/components/graph/navigation-controls.tsx` | No | Graph |
| FEAT-GRP-014 | Pan + orbit (OrbitControls) | `src/components/graph/graph-scene.tsx` | No | Graph |
| FEAT-GRP-015 | Node click → Details panel | `src/components/graph/details-panel.tsx`, `UISlice.selectedNodeId` | No | Graph |
| FEAT-GRP-016 | Right-click context menu on nodes | `src/components/graph/graph-context-menu.tsx` | No | Graph |
| FEAT-GRP-017 | Node edit modal (name, type, description, DOB, photo, pinned XYZ) | `src/components/graph/node-edit-modal.tsx`, `PATCH /api/projects/[id]/elements/[elementId]` | Yes (changelog) | Graph, Data |
| FEAT-GRP-018 | Link creation by drag (with overlay + indicator) | `src/components/graph/link-drag-overlay.tsx`, `src/components/graph/link-creation-indicator.tsx`, `src/lib/linkCreationManager.ts` | Yes (changelog) | Graph |
| FEAT-GRP-019 | Drag-to-create node (canvas) 🔍 | `src/components/graph/use-graph-interactions.ts` | Yes (changelog) | Graph |
| FEAT-GRP-020 | Relationship type modal (post link-drag picker) | `src/components/graph/relationship-type-modal.tsx` | No | Graph |
| FEAT-GRP-021 | Undo / Redo controls (client-side history stack) | `src/components/graph/undo-redo-controls.tsx`, `src/store/history-slice.ts` | No | Graph |
| FEAT-GRP-022 | Color legend + collapsible | `src/components/graph/graph-scene.tsx:72-118` | No | Graph |
| FEAT-GRP-023 | Insights panel (degree centrality top-5, type distribution, network density) | `src/components/graph/insights-panel.tsx` | No | Graph |
| FEAT-GRP-024 | Screenshot capture (canvas PNG) | `src/components/projects/printscreen-button.tsx`, `UISlice.triggerScreenshot` | No | Graph |
| FEAT-GRP-025 | Insights panel toggle (BarChart3 button + GraphCanvas mount) | `src/components/graph/navigation-controls.tsx`, `src/components/graph/graph-canvas.tsx`, `UISlice.showInsights` | No | Graph |
| FEAT-GRP-026 | Physics controls drawer (SlidersHorizontal button + right Sheet) | `src/components/graph/navigation-controls.tsx`, `src/components/graph/graph-canvas.tsx`, `UISlice.showPhysics` | No | Graph |

---

## EPIC-DAT — Data View & Editing

Spreadsheet-style CRUD over elements + relationships.

| ID | Feature | Code path | Audit | Modules |
|---|---|---|---|---|
| FEAT-DAT-001 | Elements table (name, type, description, DOB, avatar) | `src/components/projects/elements-table.tsx` | No | Data |
| FEAT-DAT-002 | Relationships table (source, target, type) | `src/components/projects/relationships-table.tsx` | No | Data |
| FEAT-DAT-003 | Add element dialog | `src/components/projects/add-element-dialog.tsx`, `POST /api/projects/[id]/elements` | Yes | Data |
| FEAT-DAT-004 | Edit element dialog | `src/components/projects/edit-element-dialog.tsx`, `PATCH /api/projects/[id]/elements/[elementId]` | Yes | Data |
| FEAT-DAT-005 | Add relationship dialog | `src/components/projects/add-relationship-dialog.tsx`, `POST /api/projects/[id]/relationships` | Yes | Data |
| FEAT-DAT-006 | Edit relationship dialog | `src/components/projects/edit-relationship-dialog.tsx`, `PATCH /api/projects/[id]/relationships/[relationshipId]` | Yes | Data |
| FEAT-DAT-007 | Element combobox (type-ahead search) | `src/components/projects/element-combobox.tsx` | No | Data |
| FEAT-DAT-008 | Photo upload + crop modal | `src/components/projects/photo-crop-modal.tsx` | No | Data |
| FEAT-DAT-009 | Delete element (row trash icon) | `src/components/projects/elements-table.tsx`, `DELETE /api/projects/[id]/elements/[elementId]` | Yes | Data |
| FEAT-DAT-010 | Delete relationship (row trash icon) | `src/components/projects/relationships-table.tsx`, `DELETE /api/projects/[id]/relationships/[relationshipId]` | Yes | Data |
| FEAT-DAT-011 | Search & type filter in Data View | `src/components/projects/data-view.tsx` | No | Data |

---

## EPIC-SCH — Schema Editor

Owner-only customisation of element & relationship taxonomy stored on `Project.elementTypes` / `Project.relationshipTypes` (JSON columns).

| ID | Feature | Code path | Audit | Modules |
|---|---|---|---|---|
| FEAT-SCH-001 | Element types CRUD (name + color) | `src/components/projects/schema-editor.tsx`, `POST /api/projects/schema` | No | Schema |
| FEAT-SCH-002 | Relationship types CRUD (name, color, strength) | `src/components/projects/schema-editor.tsx`, `POST /api/projects/schema` | No | Schema |
| FEAT-SCH-003 | Hex color picker per type | `src/components/projects/schema-editor.tsx` | No | Schema |
| FEAT-SCH-004 | Relationship strength parameter (force weight) | `src/components/projects/schema-editor.tsx` | No | Schema |
| FEAT-SCH-005 | Schema validates at least one type of each kind | `src/components/projects/schema-editor.tsx` | No | Schema |

---

## EPIC-IMP — Import / Export

XLSX bidirectional + GEDCOM import.

| ID | Feature | Code path | Audit | Modules |
|---|---|---|---|---|
| FEAT-IMP-001 | Excel export (elements + relationships sheets) | `src/components/projects/import-export-controls.tsx:14-38` | No | Import/Export |
| FEAT-IMP-002 | Excel import (bulk upsert) 🟡 | `src/components/projects/import-export-controls.tsx:72-114`, `POST /api/projects/[id]/import` | Yes | Import/Export |
| FEAT-IMP-003 | GEDCOM import (`.ged`) | `src/components/projects/import-export-controls.tsx:47-69`, `src/lib/gedcom.ts`, `POST /api/projects/[id]/import/gedcom` | Yes | Import/Export |
| FEAT-IMP-004 | GEDCOM export | — | — | ⛔ Backlog |
| FEAT-IMP-005 | Backup zip (XLSX + images) | — | — | ⛔ Backlog |
| FEAT-IMP-006 | Printscreen / screenshot button | `src/components/projects/printscreen-button.tsx` | No | Import/Export |

---

## EPIC-SET — Settings & Sharing

Owner-only configuration: physics, visibility, danger zone.

| ID | Feature | Code path | Audit | Modules |
|---|---|---|---|---|
| FEAT-SET-001 | Settings page (sidebarless layout) | `src/app/projects/[id]/settings/page.tsx` | No | Settings |
| FEAT-SET-002 | Physics settings (sliders for force config) | `src/components/settings/physics-settings.tsx` | No | Settings, Graph |
| FEAT-SET-003 | Visibility toggle Private / Public | `src/components/settings/visibility-settings.tsx`, `PATCH /api/projects/[id]/visibility` | No | Settings, Sharing |
| FEAT-SET-004 | Share link (copy `/public/[shareToken]`) | `src/components/settings/visibility-settings.tsx:121-149` | No | Sharing |
| FEAT-SET-005 | Regenerate share token (invalidate prior URL) | `src/components/settings/visibility-settings.tsx:59-77`, `PATCH /api/projects/[id]/visibility` | No | Sharing |
| FEAT-SET-006 | Embed code generator (`<iframe>` snippet w/ `?embed=true`) | `src/components/settings/visibility-settings.tsx:152-173` | No | Sharing |
| FEAT-SET-007 | Clear all data (delete elements + relationships, keep project) | `src/components/settings/danger-zone.tsx`, `DELETE /api/projects/[id]/clear-data` | Yes (changelog) | Settings |
| FEAT-SET-008 | Delete project (cascade) | `src/components/settings/danger-zone.tsx`, `DELETE /api/projects/[id]` | Implicit | Settings |

---

## EPIC-PUB — Public View

Read-only access to projects flagged `Public` via `shareToken`.

| ID | Feature | Code path | Audit | Modules |
|---|---|---|---|---|
| FEAT-PUB-001 | Public graph viewer route | `src/app/public/[token]/page.tsx`, `src/components/graph/public-graph-view.tsx` | No | Sharing |
| FEAT-PUB-002 | Token-based access (no auth required) | `src/app/public/[token]/page.tsx` | No | Sharing |
| FEAT-PUB-003 | Embed mode (`?embed=true` hides chrome) | `src/app/public/[token]/page.tsx:17-18` | No | Sharing |
| FEAT-PUB-004 | Read-only enforcement (no mutation surfaces) | `src/components/graph/public-graph-view.tsx` | No | Sharing |

---

## EPIC-CHG — Change Log & Restore

Server-side audit trail of element / relationship mutations + point-in-time restore.

| ID | Feature | Code path | Audit | Modules |
|---|---|---|---|---|
| FEAT-CHG-001 | ChangeLog Prisma model (action, entityType, entityId, prev/new state, user) | `prisma/schema.prisma:122-135` | — | Audit |
| FEAT-CHG-002 | History tab (per-project audit list) | `src/components/projects/history-tab.tsx`, `GET /api/projects/[id]/changelog` | No | Audit |
| FEAT-CHG-003 | Relative timestamp + user avatar per entry | `src/components/projects/history-tab.tsx`, `src/lib/dateFormatting.ts` | No | Audit |
| FEAT-CHG-004 | Restore previous state from change entry | `src/components/projects/history-tab.tsx:65-79`, `POST /api/projects/[id]/restore` | Yes (logs restore) | Audit |
| FEAT-CHG-005 | Audit entries emitted from element/relationship CRUD routes | `src/app/api/projects/[id]/elements/*`, `src/app/api/projects/[id]/relationships/*` | Yes | Audit |

---

## EPIC-SED — Seeding & Sample Data

One-click demo dataset.

| ID | Feature | Code path | Audit | Modules |
|---|---|---|---|---|
| FEAT-SED-001 | Seed button (appears only when project empty) | `src/components/projects/seed-button.tsx` | No | Seeding |
| FEAT-SED-002 | Family seed (Modern Family dataset) | `src/lib/data/modern-family.ts`, `POST /api/projects/[id]/seed` | No | Seeding |
| FEAT-SED-003 | Organization seed (org chart dataset) | `src/lib/data/organization.ts`, `POST /api/projects/[id]/seed` | No | Seeding |
| FEAT-SED-004 | Page reload after seed (refreshes graph) | `src/components/projects/seed-button.tsx` | No | Seeding |

---

## EPIC-LND — Landing Page

Pre-auth marketing surface.

| ID | Feature | Code path | Audit | Modules |
|---|---|---|---|---|
| FEAT-LND-001 | Hero with gradient title + CTA buttons | `src/app/page.tsx` | No | Landing |
| FEAT-LND-002 | Three.js animated background w/ key-press impulse | `src/components/landing/ThreeBackground.tsx` | No | Landing |
| FEAT-LND-003 | Auto-redirect to `/dashboard` when authenticated | `src/app/page.tsx` | No | Landing |

---

## EPIC-STM — Story Mode (Deferred)

⛔ Out of scope (backlog) — entire epic deferred for the public release. Decision recorded in CC-14 on 2026-05-19. Backlog detail lives in [05-out-of-scope.md](05-out-of-scope.md). No features ship today.

| ID | Feature | Code path | Audit | Modules |
|---|---|---|---|---|
| — | (no features in scope) | — | — | — |

---

## EPIC-NFR — Non-Functional

Cross-cutting concerns.

| ID | Feature | Code path | Audit | Modules |
|---|---|---|---|---|
| FEAT-NFR-001 | Dockerised dev environment (Postgres + Next.js) | `Dockerfile`, `docker-compose.yml`, `docker-entrypoint.sh` | — | Infra |
| FEAT-NFR-002 | Prisma multi-arch binary targets (native + linux-musl arm64/x64) | `prisma/schema.prisma:1-4` | — | Infra |
| FEAT-NFR-003 | WebGPU polyfill for Three.js | `src/lib/webgpu-polyfill.ts` | — | Graph |
| FEAT-NFR-004 | Vitest unit + API tests (`seed`, `gedcom-import`) | `vitest.config.mts`, `src/tests/api/*.test.ts` | — | Quality |
| FEAT-NFR-005 | ESLint config (Next.js + TS) | `eslint.config.mjs` | — | Quality |
| FEAT-NFR-006 | shadcn/ui component library + Tailwind | `components.json`, `src/components/ui/*` | — | UI |
| FEAT-NFR-007 | CI publishes Docker image to GHCR on push to main + `v*` tags | `.github/workflows/build-and-push.yml` | — (CI logs) | Infra |
| FEAT-NFR-008 | Synology DS723+ production deploy (Compose overlay + Watchtower + Cloudflare Tunnel ingress) | `docker-compose.prod.yml`, `.env.prod.example` | — (DSM + CF logs) | Infra |

---

## Counts

- **12 functional epics + 1 NFR epic = 13 epics**
- **67 features** total (60 ✅, 4 🟡, 1 🔍, 2 ⛔)
- **96 stories** (see [04-traceability-matrix.csv](04-traceability-matrix.csv) and [stories/](stories/))
