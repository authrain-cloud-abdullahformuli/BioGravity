# BioGravity — Out of Scope / Backlog

Items present in [features/app-requirements.md](../../features/app-requirements.md) (original spec) but **not in the current code**. These are tracked here so QA does not author tests for them and PM has a single backlog view.

---

## Deferred features (named in spec)

| Item | Spec ref | Notes |
|---|---|---|
| **Story Mode** — slide-based narrative with camera capture, Markdown overlay, transitions, Next/Prev nav | `app-requirements.md` § Story Mode | Entire feature deferred. No `Story` / `Slide` Prisma models, no `/story` route, no store slice. **Decision recorded in CC-14 on 2026-05-19 — DEFERRED for public release.** |
| **Custom element attributes (Text / List / Checkbox / Date / Numeric / Image)** | `app-requirements.md` § Settings | Element schema is fixed at name + type + description + DOB + imageUrl. JSON `elementTypes` column carries only `{name, color}` per type. |
| **Cluster collapsing** (collapse groups of nodes into a single virtual node) | `app-requirements.md` § Graph | No virtual-node rendering, no group state. |
| **Camera-state share link** (share URL that opens at specific angle/selection) | `app-requirements.md` § Settings | Share link points only at the project token, not a serialized camera state. |
| ~~**Invite-token signup flow**~~ | ~~`app-requirements.md` § User Requirements~~ | ✅ Shipped in CC-13 on 2026-05-19. See `FEAT-MEM-007` / `STORY-MEM-007`. |
| **Backup zip export** (XLSX + uploaded images bundled) | `app-requirements.md` § Data Section | XLSX export ships, but no zip + images. |
| **GEDCOM export** | `app-requirements.md` § Data Section | Import-only today. |
| **Mobile-optimised undo/redo (thumb-reach)** | `app-requirements.md` § Other | Undo/Redo buttons exist; mobile placement / gesture not separately verified. |

---

## Verify-before-test (code path unclear)

Author functional tests only after confirming the surface manually.

| Story | Surface | Why |
|---|---|---|
| `STORY-IMP-002` | Excel bulk import wiring | `import-export-controls.tsx:82-91` has a TODO comment; round-trip from export → modify → import has not been confirmed end-to-end. |
| `STORY-GRP-019` | Drag-to-create node from empty canvas | `use-graph-interactions.ts` exposes interaction hooks, but spec-level "drag from background to create a node" gesture is not explicitly testable via E2E; needs manual verification. |
| `STORY-GRP-022` | Help dialog content | Help button in legend opens a dialog — confirm whether dialog body is wired or shows placeholder. |

---

## Non-features by design

| Item | Reason |
|---|---|
| **Public REST API w/ token auth** | All routes are session-cookie protected. No `/api/v1/*` or machine token model. |
| **Workspace / Organisation tenancy** | Single-user account model. Sharing happens per-project, not at workspace level. |
| **SSO (Google / Apple / SAML)** | Credentials provider only (`src/lib/auth.ts:15-54`). |
| **Realtime multi-cursor collaboration** | No WebSocket / CRDT layer. Concurrent edits last-write-wins through Prisma. |
| **Mobile apps (iOS / Android native)** | Web-only PWA-style responsive layout. |
| **i18n** | English copy hardcoded throughout. |
| **Billing / Plans** | No commerce surface. |

---

## Spec items flagged "Partial" by gap analysis but actually shipped in current code

Cross-referenced against [features/MissingImplementation.md](../../features/MissingImplementation.md) — the gap doc is older than the code and several items it flags ⚠️/❌ are now ✅:

- Physics controls — ✅ (`physics-settings.tsx`, `UISlice.physics`)
- Visibility settings + share token + embed — ✅ (`visibility-settings.tsx`)
- Public read-only view — ✅ (`public-graph-view.tsx`, `/public/[token]/page.tsx`)
- Insights panel — ✅ (`insights-panel.tsx`, degree centrality + density + distribution)
- Focus mode w/ degrees-of-separation — ✅ (`focus-controls.tsx`, `UISlice.focusDegrees`)
- Element labels toggle — ✅ (`UISlice.showLabels`)
- Change Log + Quick Restore — ✅ (`history-tab.tsx`, `ChangeLog` model, restore route)
- GEDCOM import — ✅ (`/api/projects/[id]/import/gedcom`, `src/lib/gedcom.ts`)
- Type-ahead search in relationship dialog — ✅ (`element-combobox.tsx`)
- Clear-all-data + Delete-project — ✅ (`danger-zone.tsx`, both routes wired)
- User avatar menu — ✅ (`user-menu.tsx`)
- Role-based access control — ✅ (`src/lib/roles.ts`, `requireRole()` on every project route)
- Project type defaults (Family / Organization) — ✅ (`src/lib/data/*.ts`, applied on `POST /api/projects`)

> The gap doc reflects an earlier point in delivery. **This epic taxonomy is the current source of truth.**
