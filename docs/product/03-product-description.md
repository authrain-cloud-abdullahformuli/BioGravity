# BioGravity — Product Description

## One-liner

**BioGravity is a collaborative 3D / 2D relationship-mapping workspace for visualising people, organisations and the connections between them.**

## What it is

A web application that lets users build, navigate and share interactive graphs of "elements" (nodes) and "relationships" (edges) inside named projects. Visualisation is force-directed and runs in either an immersive 3D mode (Three.js + react-force-graph-3d) or a flatter 2D mode, with physics tuning, focus isolation and a spreadsheet-style data view for bulk editing.

Each project carries its own schema (element types, relationship types, colors, force strengths), member ACL (Viewer / Editor / Admin / Owner), audit log, and optional public share token with embed-ready iframe.

## Who it's for

- **Family historians / genealogists** — build family trees, import existing GEDCOM files, share read-only links.
- **Org designers / consultants** — map reporting lines, departments, teams; demo restructures.
- **Researchers / educators** — visualise networks of any kind (case-study actors, characters, ecosystems).
- **Anyone with a relationship dataset** — the project type is just a default schema; users can build any taxonomy.

## Mental model

```
User ──owns──▶ Project ──contains──▶ Elements (nodes)
                                  ▶ Relationships (edges)
                                  ▶ Schema (element types + relationship types)
                                  ▶ Members (Viewer/Editor/Admin)
                                  ▶ ChangeLog (audit + restore)
                                  ▶ Visibility (Private | Public + shareToken)
```

A **project** is the unit of collaboration. Everything else — elements, relationships, schema, members, audit, sharing — lives inside it. A user can own many projects and be a Viewer/Editor/Admin on others.

## Core capability pillars

| Pillar | What you do |
|---|---|
| **Visualise** | Open the graph tab, orbit/pan/zoom, toggle 2D ↔ 3D, pin nodes, isolate via focus mode + degrees-of-separation, search & filter. |
| **Edit** | Add/edit/delete elements & relationships from the graph (right-click, drag-to-link, modal) or from the spreadsheet-like Data view. Photo upload with crop on each element. |
| **Configure** | Define element & relationship types (name, color, strength) — Owner only. Pick force physics (cluster attraction, link strength, repulsion). Toggle generational layout. |
| **Collaborate** | Invite by email, assign Viewer/Editor/Admin, hand off ownership-equivalent rights through Admin role. |
| **Share** | Flip visibility to Public, copy a `/public/<token>` link, embed via iframe. Token-bearer access is read-only. |
| **Trust** | Every element/relationship change is logged to `ChangeLog` with prior + new state. History tab lists changes with timestamps and lets Editors+ restore any prior state. |
| **Onboard** | New project? Choose "Family" or "Organization" and one click on Seed populates a working demo (Modern Family or org chart). |

## What BioGravity is *not*

- **Not a strategy / OKR tool.** No goals, budgets, value rollups, scenarios. (See out-of-scope.)
- **Not an attribute platform.** Element attributes today are a fixed set (name, type, description, dateOfBirth, imageUrl, pinned, position). Custom attribute schemas were specified but are not implemented.
- **Not story-telling software.** "Story Mode" (slide-based narrative with camera transitions) was specified but deferred.
- **Not multi-tenant with org-level RBAC.** Auth is per-user, ACL is per-project, no organisation/workspace abstraction.
- **Not API-first.** No machine tokens, no public REST contract — every endpoint is session-cookie protected.

## Stack at a glance

- **Frontend**: Next.js 15 App Router, React 19, Tailwind, shadcn/ui.
- **3D**: Three.js, React Three Fiber, `react-force-graph-3d`, `d3-force-3d`.
- **State**: Zustand (slice composition: graph / ui / history).
- **Backend**: Next.js Route Handlers under `src/app/api/`.
- **Auth**: NextAuth.js (Credentials + Prisma adapter, JWT sessions).
- **DB**: PostgreSQL via Prisma ORM (`prisma/schema.prisma`).
- **Infra**: Docker Compose (postgres on `:5433`, app on `:3020`).

## Why "BioGravity"

The name evokes the central metaphor: every element exerts force on its neighbours; clusters attract and repel; the layout settles into a shape that reveals structure that pure tabular data hides. The "gravity of connections" — what holds a family, a team, an idea together.
