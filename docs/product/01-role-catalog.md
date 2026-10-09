# BioGravity Role Catalog

Derived from [prisma/schema.prisma](../../prisma/schema.prisma) (`ProjectMember.role`) and [src/lib/roles.ts](../../src/lib/roles.ts) (`requireRole`, `canEdit`, `isAdmin`).

## Identity roles

| Role | Scope | Capabilities | Source |
|---|---|---|---|
| **Unauthenticated** | Global | View landing page, login, register. Open `/public/[token]` URLs for projects whose `visibility = "Public"`. No write. | `src/app/page.tsx`, `src/app/public/[token]/page.tsx` |
| **Authenticated User** | Global | Dashboard, create projects, edit own profile, log out, toggle theme. Owns the projects they create. | `src/app/dashboard/page.tsx`, `src/app/profile/page.tsx` |
| **Viewer** *(project)* | Per-project | Read graph, data tables, history. Cannot mutate. | `ProjectMember.role = "Viewer"`, enforced via `requireRole(projectId, "Viewer")` |
| **Editor** *(project)* | Per-project | Viewer + create/update/delete elements & relationships, import data, pin nodes, restore from history, seed sample data. | `ProjectMember.role = "Editor"`, `canEdit()` |
| **Admin** *(project, non-owner)* | Per-project | Editor + (currently no additional rights distinct from Editor in code; reserved for future schema/member ops). | `ProjectMember.role = "Admin"`, `isAdmin()` |
| **Owner** *(project)* | Per-project | Admin + edit schema (element/relationship types), invite/remove members, toggle visibility, regenerate share token, copy embed code, clear all data, delete project. Project creator is automatically Owner. | `Project.ownerId`, auto-mapped to "Admin" by `getProjectRole()` |

## Role hierarchy

```
Owner ⊇ Admin ⊇ Editor ⊇ Viewer
```

Numeric levels enforced by `roleHierarchy` in `src/lib/roles.ts:115-119`:
- Viewer = 1
- Editor = 2
- Admin = 3 (owner is mapped to Admin)

## Authorization flow

1. `getServerSession(authOptions)` → resolve `session.user.id` (NextAuth JWT).
2. `getProjectRole(projectId)` → look up `Project` + matching `ProjectMember` row.
3. Project owner short-circuits to `Admin`.
4. `requireRole(projectId, minimumRole)` returns `{ authorized, error, status }` — used in every API route under `/api/projects/[id]/*`.

## Notes & gotchas

- **No separate "Admin (member)" UI surface.** In current code, Admin and Editor have identical write capabilities. Owner-only features (schema, members, visibility, danger zone) are gated by ownership check, not by `Admin` role. The `Admin` role label is reserved.
- **Public token is not a role.** It is a `shareToken` (random string on `Project`) consumed by `/public/[token]` route. Token holders have read-only access to elements + relationships; no audit identity is recorded.
- **No service / MCP / API-token scope.** Unlike Stratos, BioGravity exposes no machine-to-machine tokens; all writes flow through NextAuth session cookies.
