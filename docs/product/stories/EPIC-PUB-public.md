# EPIC-PUB — Public View — User Stories

### STORY-PUB-001 — Open a public project by token
**Feature:** FEAT-PUB-001, FEAT-PUB-002 | **Role:** Unauthenticated | **Priority:** P0
**Code:** `src/app/public/[token]/page.tsx`, `src/components/graph/public-graph-view.tsx`
**Story:** As anyone with a share link, I want to view a public project without logging in.
**AC:**
- GET `/public/<token>` resolves a `Project` where `visibility = "Public"` AND `shareToken = token`.
- Graph + legend render in read-only mode.
- No auth required.
**Negative:** Token not found OR project Private → 404.
**Audit:** No (no session identity to attribute).

### STORY-PUB-002 — Embed mode hides chrome
**Feature:** FEAT-PUB-003 | **Role:** Unauthenticated | **Priority:** P1
**Code:** `src/app/public/[token]/page.tsx:17-18`
**Story:** As a site author, I want `/public/<token>?embed=true` to render the graph only (no navbar, no header), so that it fits inside an iframe.
**AC:** Query param `embed=true` strips top chrome; only the graph + minimal controls render.
**Audit:** No.

### STORY-PUB-003 — Public view is strictly read-only
**Feature:** FEAT-PUB-004 | **Role:** Unauthenticated | **Priority:** P0
**Code:** `src/components/graph/public-graph-view.tsx`
**Story:** As an Owner, I want public visitors to never be able to mutate my data, even by manipulating client state.
**AC:**
- No Add / Edit / Delete / Pin / Schema / Settings buttons render.
- Direct API calls return 401 (no session).
**Audit:** No.

### STORY-PUB-004 — Public viewer can still pan / zoom / 2D-3D / search
**Feature:** FEAT-PUB-001 | **Role:** Unauthenticated | **Priority:** P1
**Code:** `src/components/graph/public-graph-view.tsx`
**Story:** As a public visitor, I want full navigation controls so I can explore the graph.
**AC:** Public view exposes 2D/3D toggle, search, filter, zoom, focus mode, labels toggle — all client-side.
**Negative:** Pin / context-menu Edit / Delete are hidden or disabled.
**Audit:** No.
