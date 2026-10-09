# BioGravity Requirements Gap Analysis & Implementation Plan

This document identifies all missing or incorrectly implemented features from [app-requirements.md](app-requirements.md) and provides a prioritized implementation plan.

---

## Executive Summary

After comprehensive analysis of the current BioGravity implementation against the requirements document, the following gaps have been identified:

| Category | Implemented | Partial | Missing |
|----------|-------------|---------|---------|
| UX/UI | 2 | 1 | 1 |
| Core Sections | 2 | 0 | 2 |
| User Requirements | 4 | 2 | 4 |
| Project Requirements | 4 | 2 | 2 |
| Other Requirements | 2 | 0 | 4 |
| Settings | 3 | 4 | 5 |
| Graph Section | 3 | 2 | 7 |
| Data Section | 2 | 1 | 2 |
| Story Mode | 0 | 0 | 5 |

---

## Detailed Gap Analysis

### 1. UX/UI Requirements

| Requirement | Status | Notes |
|-------------|--------|-------|
| Unique UX/UI (not similar to kumu.io) | ✅ Implemented | Futuristic dark theme with glassmorphism |
| User-friendly, modern, professional UI | ✅ Implemented | shadcn/ui components with custom theming |
| Light/Dark mode toggle | ✅ Implemented | `ModeToggle` component in navbar |
| Login 3D background with keypress interaction | ✅ Implemented | `ThreeBackground` component responds to form interaction |

---

### 2. Core Sections

| Section | Status | Notes |
|---------|--------|-------|
| Graph View | ✅ Implemented | Tab in project page with 3D visualization |
| Data View | ✅ Implemented | Tab with elements/relationships tables |
| Story Mode | ❌ **Missing** | No routes, components, or store for Story Mode |
| Settings | ⚠️ Partial | Basic settings page exists, missing many features |

> [!CAUTION]
> **Story Mode is completely missing** - requires database schema changes, new store, components, and routes.

---

### 3. User Requirements

| Requirement | Status | Notes |
|-------------|--------|-------|
| User login required | ✅ Implemented | NextAuth with credentials provider |
| User registration | ✅ Implemented | `/signup` route exists |
| Mandatory attributes (name, email, password) | ✅ Implemented | Schema has name, email, password fields |
| Project list on login | ✅ Implemented | Dashboard shows user's projects |
| Default to Graph view on project entry | ✅ Implemented | Tabs default to "graph" |
| Invite users with roles (viewer/editor/admin) | ⚠️ Partial | Member invitation exists but role enforcement incomplete |
| Viewer cannot change data/settings | ❌ **Missing** | No role-based access control on UI/API |
| Editor can change data/settings | ❌ **Missing** | Role checks not implemented |
| Admin can delete projects | ⚠️ Partial | Delete button exists but not functional |
| Invite link registration flow | ❌ **Missing** | No invite token system |

---

### 4. Project Requirements

| Requirement | Status | Notes |
|-------------|--------|-------|
| Create projects with owner | ✅ Implemented | Project creation with ownerId |
| Creator is admin | ✅ Implemented | Owner has admin access to settings |
| Elements as graph nodes | ✅ Implemented | Elements rendered as spheres |
| Relationship type attribute | ✅ Implemented | Relationships have type field |
| Exit project button | ✅ Implemented | Back arrow navigates to dashboard |
| Project type selection on creation | ⚠️ Partial | Type field exists but presets not properly applied |
| Create custom project type | ❌ **Missing** | No flow to create empty project with custom type |
| Default project types (Family, Organization) | ⚠️ Partial | Types exist but default attributes not populated |

---

### 5. Other Requirements

| Requirement | Status | Notes |
|-------------|--------|-------|
| User avatar button (edit info, logout) | ❌ **Missing** | Navbar only has mode toggle, no user menu |
| Session history (last 20 actions) | ✅ Implemented | `useGraphStore` has undo/redo history |
| Undo/Redo buttons | ✅ Implemented | `UndoRedoControls` component exists |
| Change Log in Data section | ❌ **Missing** | No History tab, no change tracking |
| Quick Restore from History | ❌ **Missing** | No revert functionality |

> [!WARNING]
> **User avatar menu is missing** - this is a core navigation element required by the spec.

---

### 6. Settings Section

| Requirement | Status | Notes |
|-------------|--------|-------|
| Relationship types configuration | ✅ Implemented | SchemaEditor for relationship types |
| Element types configuration | ✅ Implemented | SchemaEditor for element types |
| Element attributes configuration | ❌ **Missing** | Types have name/color only, no attribute schema |
| Attribute types (Text, List, Checkbox, Date, Numeric, Image) | ❌ **Missing** | No attribute type system |
| Physics controls (cluster attraction, link strength, repulsion) | ❌ **Missing** | Force settings hardcoded in graph-scene |
| Delete all project data | ⚠️ Partial | Button exists but not functional |
| Delete project (redirect to selection) | ⚠️ Partial | Button exists but not functional |
| Visibility settings (Private/Public) | ❌ **Missing** | No visibility field in Project model |
| Read-only public view | ❌ **Missing** | No public access system |
| Embed code generation (iframe snippet) | ❌ **Missing** | No embed functionality |
| Social share (link to camera angle/selection) | ❌ **Missing** | No share state serialization |
| Project type definition section | ⚠️ Partial | Schema editor exists but incomplete |
| Family project type defaults | ⚠️ Partial | Type exists but defaults not fully applied |
| Organization project type defaults | ⚠️ Partial | Type exists but defaults not fully applied |

---

### 7. Graph Section

| Requirement | Status | Notes |
|-------------|--------|-------|
| 2D/3D visualization toggle | ✅ Implemented | `is2D` state in store, OrbitControls respects it |
| Element/relationship data entry (kumu-style) | ⚠️ Partial | Basic add functionality exists |
| Kumu-style navigation/zoom | ✅ Implemented | OrbitControls with pan/zoom/rotate |
| Filter and search | ✅ Implemented | FilterPanel with search and type filter |
| Insights panel | ❌ **Missing** | No analytics panel or functions |
| - Most connected element | ❌ **Missing** | - |
| - Distance between nodes | ❌ **Missing** | - |
| - Hierarchy levels | ❌ **Missing** | - |
| Show/hide element names | ❌ **Missing** | No label toggle |
| Focus Mode (isolate node + connections) | ⚠️ Partial | Node selection exists but no isolation |
| Degrees of separation slider | ❌ **Missing** | No degree expansion controls |
| Cluster collapsing | ❌ **Missing** | No grouping functionality |
| Isolate by attribute (search hides non-matches) | ⚠️ Partial | Filter hides but doesn't fade |

---

### 8. Data Section

| Requirement | Status | Notes |
|-------------|--------|-------|
| Export/Import (Excel with elements/relationships) | ✅ Implemented | XLSX export/import works |
| Export as backup (zip with images) | ❌ **Missing** | No image export |
| GEDCOM import/export | ❌ **Missing** | No GEDCOM support |
| Edit elements/relationships (datasheet mode) | ✅ Implemented | Tables with edit dialogs |
| Filter/search on all attributes | ⚠️ Partial | Basic search exists, not attribute-level |
| Type-ahead search in relationship dropdowns | ❌ **Missing** | Basic select, no search |
| Delete all project data (editor/admin) | ⚠️ Partial | Not implemented with role check |

---

### 9. Story Mode Section

| Requirement | Status | Notes |
|-------------|--------|-------|
| Story Mode section | ❌ **Missing** | Entire feature missing |
| Slides/Steps creation | ❌ **Missing** | - |
| Camera position capture | ❌ **Missing** | - |
| Focus/selection capture | ❌ **Missing** | - |
| Text overlay (Markdown support) | ❌ **Missing** | - |
| Transitions (smooth camera animation) | ❌ **Missing** | - |
| Next/Previous navigation (touch-optimized) | ❌ **Missing** | - |

---

## Implementation Plan

### Priority 1: Critical Missing Features

#### P1.1 User Avatar Menu (Estimated: 0.5 day)

**Components:**

- [MODIFY] [navbar.tsx](../src/components/navbar.tsx) - add user avatar dropdown
- [NEW] `user-menu.tsx` - dropdown with profile link and logout

**Routes:**

- [NEW] `/profile/page.tsx` - user profile editing

---

#### P1.2 Role-Based Access Control (Estimated: 1-2 days)

**API Changes:**

- [MODIFY] All `/api/projects/[id]/*` routes - add role checks
- [NEW] Middleware or utility function for role verification

**UI Changes:**

- [MODIFY] [data-view.tsx](../src/components/projects/data-view.tsx) - disable editing for viewers
- [MODIFY] [settings/page.tsx](../src/app/projects/%5Bid%5D/settings/page.tsx) - hide for non-admins or show read-only

---

### Priority 2: Settings Enhancements

#### P2.1 Attribute Configuration System (Estimated: 2-3 days)

**Database Changes:**

- [MODIFY] [Project](../src/app/projects/%5Bid%5D/page.tsx#19-114) model - enhance `elementTypes` JSON schema to include attributes with types

**Components:**

- [MODIFY] [schema-editor.tsx](../src/components/projects/schema-editor.tsx) - add attribute definition UI
- [NEW] `attribute-type-selector.tsx` - Text/List/Checkbox/Date/Numeric/Image picker

---

#### P2.2 Physics Controls (Estimated: 0.5 day)

**Settings UI:**

- [NEW] `physics-settings.tsx` - sliders for cluster attraction, link strength, repulsion

**Store:**

- [MODIFY] [use-graph-store.ts](../src/store/use-graph-store.ts) - add physics config state

**Graph:**

- [MODIFY] [graph-scene.tsx](../src/components/graph/graph-scene.tsx) - read physics config from store

---

#### P2.3 Project Visibility & Sharing (Estimated: 1-2 days)

**Database:**

- [MODIFY] [Project](../src/app/projects/%5Bid%5D/page.tsx#19-114) model - add `visibility` enum (Private/Public)

**Settings:**

- [NEW] Visibility toggle in settings
- [NEW] Embed code generator
- [NEW] Share button with camera state serialization

**Routes:**

- [MODIFY] Project access - allow public read access
- [NEW] `/public/[id]/page.tsx` - public viewer route

---

#### P2.4 Delete Functionality (Estimated: 0.5 day)

**API:**

- [NEW] `/api/projects/[id]/delete` - delete project and redirect
- [NEW] `/api/projects/[id]/clear-data` - delete all elements/relationships

**UI:**

- [MODIFY] Settings danger zone - wire up delete buttons

---

### Priority 3: Graph Enhancements

#### P3.1 Insights Panel (Estimated: 1-2 days)

**Components:**

- [NEW] `insights-panel.tsx` - analytics sidebar

**Functions:**

- [NEW] Most connected element (degree centrality)
- [NEW] Shortest path between nodes (BFS)
- [NEW] Hierarchy depth calculation

---

#### P3.2 Focus Mode Enhancement (Estimated: 1 day)

**Components:**

- [NEW] `focus-controls.tsx` - Focus button + degree slider

**Store:**

- [MODIFY] [use-graph-store.ts](../src/store/use-graph-store.ts) - add `focusMode`, `focusDegrees` state

**Graph:**

- [MODIFY] [graph-scene.tsx](../src/components/graph/graph-scene.tsx) - filter to show only N degrees from selected

---

#### P3.3 Cluster Collapsing (Estimated: 2 days)

**Complex feature requiring:**

- Group selection UI
- Virtual "group node" rendering
- Expand/collapse state management

---

#### P3.4 Element Labels Toggle (Estimated: 0.5 day)

**Store:**

- [MODIFY] Add `showLabels` state

**Graph:**

- [MODIFY] Render HTML labels (using drei's Html component)

---

### Priority 4: Data Section Enhancements

#### P4.1 GEDCOM Support (Estimated: 2-3 days)

**Dependencies:**

- GEDCOM parsing library (e.g., `gedcom-js`)

**Components:**

- [MODIFY] [import-export-controls.tsx](../src/components/projects/import-export-controls.tsx) - add GEDCOM format option

**API:**

- [NEW] `/api/projects/[id]/import-gedcom` - parse and create elements/relationships

---

#### P4.2 Change Log & Quick Restore (Estimated: 2 days)

**Database:**

- [NEW] `ChangeLog` model with `projectId`, `userId`, [action](../src/app/login/page.tsx#21-25), `entityType`, `entityId`, `previousState`, `timestamp`

**Components:**

- [NEW] `history-tab.tsx` - list of changes with restore buttons

**API:**

- [NEW] `/api/projects/[id]/changelog` - list changes
- [NEW] `/api/projects/[id]/restore` - revert to previous state

---

#### P4.3 Enhanced Search & Type-ahead (Estimated: 0.5 day)

**Components:**

- [MODIFY] [edit-relationship-dialog.tsx](../src/components/projects/edit-relationship-dialog.tsx) - replace Select with Combobox for searchable dropdown

---

### Priority 5: Project Type Defaults

#### P5.1 Fix Project Type Initialization (Estimated: 0.5 day)

**API:**

- [MODIFY] `/api/projects/route.ts` (POST) - properly initialize Family/Organization defaults

**Defaults to apply:**

```
Family:
- Element Types: Person, Pet
- Element Attributes: name, age, gender, image
- Relationship Types: parent/child, partner, owner/pet

Organization:
- Element Types: Person, Company, Department, Team
- Element Attributes: Name, Role, Image
- Relationship Types: direct report, indirect report
```

---

## Verification Plan

Since this is a planning document and no implementation is being done, verification will be defined per feature during implementation tickets.

**General verification approach:**

1. **Unit Tests**: For store logic, utility functions, analytics calculations
2. **API Tests**: For all new/modified endpoints using the existing test framework
3. **Browser Tests**: For UI features using the browser subagent
4. **Manual Tests**: For complex interactions like Story Mode transitions

---

## Summary

The BioGravity application has a solid foundation with the core graph visualization, authentication, and basic data management implemented. However, several critical features are missing:

1. **Role-based access control** - Members can be added but permissions aren't enforced
2. **Settings features** - Many configuration options missing (physics, visibility, attributes)
3. **Graph insights and focus mode** - Analytics and isolation features missing
4. **GEDCOM and change history** - Data import format and audit trail missing

The implementation plan above prioritizes these features based on user impact and dependencies.

---

## Deferred Features

### Story Mode (To be implemented later)

> [!NOTE]
> Story Mode implementation has been deferred to a future phase.

**When ready to implement, will require:**

- Database: `Story` and `Slide` models
- Store: `use-story-store.ts`
- Components: story-mode-layout, slide-panel, presentation-controls, annotation-overlay
- Routes: `/projects/[id]/story` and related API endpoints
