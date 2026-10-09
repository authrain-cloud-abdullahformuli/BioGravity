# EPIC-GRP — Graph Visualization — User Stories

### STORY-GRP-001 — Render the project in 3D force-directed graph
**Feature:** FEAT-GRP-001 | **Role:** Viewer+ | **Priority:** P0
**Code:** `src/components/graph/graph-canvas.tsx`, `src/components/graph/graph-scene.tsx`
**Story:** As a project member, when I open the Graph tab, I want to see all elements as colored spheres and all relationships as lines, in 3D space.
**AC:**
- `GET /api/projects/[id]/graph` returns `{elements, relationships, elementTypes, relationshipTypes}`.
- `ForceGraph3D` renders nodes at their stored positions (or simulated if not pinned).
- Color comes from `elementTypes[type].color`.
**Negative:** Fetch error → error banner; empty project → empty canvas + "Seed data" CTA.
**Audit:** No.

### STORY-GRP-002 — Switch to 2D mode
**Feature:** FEAT-GRP-002, FEAT-GRP-003 | **Role:** Viewer+ | **Priority:** P1
**Code:** `src/components/graph/graph-scene-2d.tsx`, `src/components/graph/navigation-controls.tsx`
**Story:** As a user, I want to switch between 3D and 2D, so that I can read dense graphs flat.
**AC:** Toggle in navigation controls flips `UISlice.is2D`; 2D scene mounts with 2D force simulation.
**Audit:** No.

### STORY-GRP-003 — Tune force physics
**Feature:** FEAT-GRP-004, FEAT-GRP-005 | **Role:** Viewer+ (UI), Editor+ (persistence n/a) | **Priority:** P1
**Code:** `src/components/settings/physics-settings.tsx`, `src/store/ui-slice.ts:48-53`
**Story:** As a user, I want sliders for cluster attraction, link strength, repulsion, and link distance.
**AC:** Each slider calls `setPhysics({...})`; graph re-simulates immediately; defaults restorable.
**Negative:** Extreme values → graph may glitch but does not crash (no validation).
**Audit:** No (client-only state).

### STORY-GRP-004 — Pin a node to a fixed position
**Feature:** FEAT-GRP-006 | **Role:** Editor+ | **Priority:** P1
**Code:** `src/store/graph-slice.ts:63-108`, `PATCH /api/projects/[id]/elements/[elementId]`
**Story:** As an Editor, I want to pin a node so that the simulation stops moving it.
**AC:**
- Context menu → Pin → `togglePin(id, true)`.
- Captures live `x/y/z` from graph, stores as `positionX/Y/Z`, sets `pinned = true`.
- Subsequent loads place the node at the pinned coords with `fx/fy/fz` set.
- Unpin reverts to simulation.
**Audit:** Yes (PATCH triggers changelog).

### STORY-GRP-005 — Search nodes by text
**Feature:** FEAT-GRP-007 | **Role:** Viewer+ | **Priority:** P0
**Code:** `src/components/graph/filter-panel.tsx`
**Story:** As a user, I want to type a query and have non-matching nodes fade/hide.
**AC:** Search matches name OR type OR description (case-insensitive). Matches highlighted; non-matches dimmed/hidden depending on mode.
**Audit:** No.

### STORY-GRP-006 — Filter by element type
**Feature:** FEAT-GRP-008 | **Role:** Viewer+ | **Priority:** P1
**Code:** `src/components/graph/filter-panel.tsx`
**Story:** As a user, I want to pick an element type from a dropdown to isolate that type.
**AC:** Dropdown lists unique types from `elementTypes`; selecting one hides all nodes of other types.
**Audit:** No.

### STORY-GRP-007 — Enter focus mode on a node
**Feature:** FEAT-GRP-009 | **Role:** Viewer+ | **Priority:** P0
**Code:** `src/components/graph/focus-controls.tsx`, `src/store/ui-slice.ts`
**Story:** As a user, I want to click "Focus" on a selected node and see only the node + its connections.
**AC:** Setting `focusMode = true` hides nodes more than N hops away from `selectedNodeId`.
**Negative:** No node selected → Focus button disabled or no-op.
**Audit:** No.

### STORY-GRP-008 — Expand focus mode by degrees of separation
**Feature:** FEAT-GRP-009 | **Role:** Viewer+ | **Priority:** P1
**Code:** `src/components/graph/focus-controls.tsx`, `UISlice.focusDegrees`
**Story:** As a user in focus mode, I want a slider/controls to widen the visible neighbourhood to 1, 2, 3+ hops.
**AC:** Increment/decrement updates `focusDegrees`; graph recomputes visible set via BFS.
**Audit:** No.

### STORY-GRP-009 — Toggle node labels
**Feature:** FEAT-GRP-010 | **Role:** Viewer+ | **Priority:** P1
**Code:** `src/components/graph/navigation-controls.tsx`, `UISlice.showLabels`
**Story:** As a user, I want to hide labels for a clean overview, or show them when scanning.
**AC:** Toggle flips `showLabels`; labels appear/disappear immediately.
**Audit:** No.

### STORY-GRP-010 — Resize all nodes with a slider
**Feature:** FEAT-GRP-011 | **Role:** Viewer+ | **Priority:** P2
**Code:** `src/components/graph/node-size-slider.tsx`, `UISlice.nodeSize`
**Story:** As a user, I want a global node-size slider, so I can match my screen and density.
**AC:** Slider drives `nodeSize` multiplier (~0.5–3); rendering scales spheres accordingly.
**Audit:** No.

### STORY-GRP-011 — Enable generational ordering
**Feature:** FEAT-GRP-012 | **Role:** Viewer+ | **Priority:** P2
**Code:** `src/components/graph/generational-toggle.tsx`, `UISlice.generationalOrdering`
**Story:** As a family-tree user, I want a hierarchical (tree-like) layout where ancestors stack above descendants.
**AC:** Toggle enables generational force; strength slider (0–1) tunes pull.
**Audit:** No.

### STORY-GRP-012 — Zoom in / out / reset
**Feature:** FEAT-GRP-013 | **Role:** Viewer+ | **Priority:** P0
**Code:** `src/components/graph/navigation-controls.tsx`
**Story:** As a user, I want explicit zoom and reset controls.
**AC:** Zoom in / out buttons step camera distance; Reset fits the camera to all nodes.
**Audit:** No.

### STORY-GRP-013 — Pan and orbit the camera
**Feature:** FEAT-GRP-014 | **Role:** Viewer+ | **Priority:** P0
**Code:** `src/components/graph/graph-scene.tsx`
**Story:** As a user, I want mouse drag / touch gestures for pan and orbit, like Kumu.
**AC:** OrbitControls drives rotation in 3D; pan in 2D. Touch supported on tablet/mobile.
**Audit:** No.

### STORY-GRP-014 — Click a node → details panel
**Feature:** FEAT-GRP-015 | **Role:** Viewer+ | **Priority:** P0
**Code:** `src/components/graph/details-panel.tsx`, `UISlice.selectedNodeId`
**Story:** As a user, I want a side panel showing the selected node's attributes.
**AC:** Click node → `setSelectedNode(id)` → panel renders name, type, description, DOB, image, pinned state.
**Negative:** Click empty space → panel closes / no selection.
**Audit:** No.

### STORY-GRP-015 — Right-click a node for context menu
**Feature:** FEAT-GRP-016 | **Role:** Viewer+ (read), Editor+ (mutating actions) | **Priority:** P0
**Code:** `src/components/graph/graph-context-menu.tsx`
**Story:** As a user, I want a context menu to quickly Edit / Delete / Pin / view properties.
**AC:** Menu opens at cursor; mutating items disabled for Viewer.
**Audit:** No (the resulting actions are individually audited).

### STORY-GRP-016 — Edit a node from the graph
**Feature:** FEAT-GRP-017 | **Role:** Editor+ | **Priority:** P0
**Code:** `src/components/graph/node-edit-modal.tsx`, `PATCH /api/projects/[id]/elements/[elementId]`
**Story:** As an Editor, I want to edit a node's name, type, description, DOB, photo, and pinned coordinates from the graph.
**AC:** Modal pre-fills; save → `PATCH` element route; graph reflects new name/type/color.
**Audit:** Yes — `ChangeLog` row with `previousState` + `newState`.

### STORY-GRP-017 — Drag from a node to create a relationship
**Feature:** FEAT-GRP-018, FEAT-GRP-020 | **Role:** Editor+ | **Priority:** P0
**Code:** `src/components/graph/link-drag-overlay.tsx`, `src/components/graph/link-creation-indicator.tsx`, `src/components/graph/relationship-type-modal.tsx`, `src/lib/linkCreationManager.ts`
**Story:** As an Editor, I want to drag from one node to another to create a relationship, like Kumu.
**AC:**
- Start drag on source node → overlay tracks pointer with indicator line.
- Drop on target node → `RelationshipTypeModal` opens with list of relationship types.
- Pick type → `POST /api/projects/[id]/relationships`.
**Negative:** Drop on empty space → cancel; drop on same node → cancel.
**Audit:** Yes (relationship creation).

### STORY-GRP-018 — Cancel a link-creation gesture
**Feature:** FEAT-GRP-018 | **Role:** Editor+ | **Priority:** P1
**Code:** `src/store/ui-slice.ts:92-99`, `src/components/graph/link-drag-overlay.tsx`
**Story:** As an Editor, I want Esc / drop-on-empty to cancel a partial link.
**AC:** `cancelLinkCreation()` clears `linkCreationMode`; overlay hides; no relationship is persisted.
**Audit:** No.

### STORY-GRP-019 — Drag to create a node on the canvas 🔍
**Feature:** FEAT-GRP-019 | **Role:** Editor+ | **Priority:** P2
**Code:** `src/components/graph/use-graph-interactions.ts`
**Story:** As an Editor, I want to drag onto empty canvas to spawn a new element.
**AC:** Drag from a creation affordance places a temp element at the drop point; modal asks for name/type; save persists via `POST /api/projects/[id]/elements`.
**Verify:** Confirm gesture actually wired to creation; partial coverage in current code.
**Audit:** Yes.

### STORY-GRP-020 — Undo / Redo graph mutations
**Feature:** FEAT-GRP-021 | **Role:** Editor+ | **Priority:** P1
**Code:** `src/components/graph/undo-redo-controls.tsx`, `src/store/history-slice.ts`
**Story:** As an Editor, I want Undo and Redo buttons to reverse my local edits.
**AC:** Every `saveToHistory()` snapshot lets Undo restore prior `{elements, relationships}`; Redo replays forward. Stack depth bounded.
**Negative:** Empty past → Undo no-op (disabled); empty future → Redo disabled.
**Audit:** No (client-only; server state diverges until next save).

### STORY-GRP-021 — Color legend at corner
**Feature:** FEAT-GRP-022 | **Role:** Viewer+ | **Priority:** P1
**Code:** `src/components/graph/graph-scene.tsx:72-118`
**Story:** As a user, I want a legend showing element/relationship type colors.
**AC:** Legend renders unique types with color swatches; collapsible.
**Audit:** No.

### STORY-GRP-022 — Help dialog from legend 🔍
**Feature:** FEAT-GRP-022 | **Role:** Viewer+ | **Priority:** P2
**Code:** `src/components/graph/graph-scene.tsx:80-87`
**Story:** As a new user, I want an in-app help dialog to learn the controls.
**AC:** Click ? icon opens dialog with control reference.
**Verify:** Confirm dialog content vs. placeholder.
**Audit:** No.

### STORY-GRP-023 — View insights panel (degree centrality + density)
**Feature:** FEAT-GRP-023 | **Role:** Viewer+ | **Priority:** P1
**Code:** `src/components/graph/insights-panel.tsx`
**Story:** As an analyst, I want quick stats: most-connected nodes, total nodes/edges, average degree, density, type distribution, and the selected node's degree.
**AC:**
- Top 5 nodes by degree centrality listed.
- Network stats: totalNodes, totalEdges, avgDegree, density %.
- Type distribution sorted desc.
- Selected node card shows its degree when one is selected.
**Audit:** No.

### STORY-GRP-024 — Toggle Insights panel from graph view (CC-11)
**Feature:** FEAT-GRP-025 | **Role:** Viewer+ | **Priority:** P1
**Code:** `src/components/graph/navigation-controls.tsx`, `src/components/graph/graph-canvas.tsx`, `src/store/ui-slice.ts`
**Story:** As a viewer or editor, I want a one-click control to open or close the Insights panel from the graph view so I can read network analytics without leaving the canvas.
**AC:**
- Given I am on a project graph, When I look at the bottom-right navigation cluster, Then I see a BarChart3 icon button labeled "Show Insights" / "Hide Insights".
- Given the panel is closed, When I click the BarChart3 button, Then the Insights panel appears anchored top-right and shows all FEAT-GRP-023 metrics.
- Given the panel is open, When I click the BarChart3 button again, Then the panel unmounts and the graph canvas reclaims that space.
- Given I navigate away and back within the same browser tab, Then the panel's open/closed state is preserved (session-scoped).
**Negative:**
- Given a project with zero elements, When I open Insights, Then totals render as 0 / 0 / 0 / 0 without NaN or crash.
- Given the bottom-right navigation cluster is hovered, Then opening Insights does not block any existing button.
**Audit:** No.

### STORY-GRP-025 — Tune graph physics from a side drawer (CC-12)
**Feature:** FEAT-GRP-026 | **Role:** Viewer+ | **Priority:** P1
**Code:** `src/components/graph/navigation-controls.tsx`, `src/components/graph/graph-canvas.tsx`, `src/components/settings/physics-settings.tsx`, `src/store/ui-slice.ts`
**Story:** As a viewer or editor, I want a one-click drawer of physics sliders (cluster attraction, link strength, repulsion, link distance, generational strength) so I can tune layout while the graph re-simulates live.
**AC:**
- Given I am on a project graph, When I look at the bottom-right navigation cluster, Then I see a SlidersHorizontal icon button labeled "Tune Physics" / "Hide Physics".
- Given the drawer is closed, When I click the button, Then a right-side Sheet opens with five sliders and a Reset button.
- Given the drawer is open, When I drag a slider, Then `UISlice.physics` updates and the graph re-simulates immediately (no apply button).
- Given I click Reset, Then all four physics fields snap back to documented defaults (cluster 100 / link strength 0.5 / repulsion -200 / link distance 100) and generational strength snaps to 1.0.
- Given I close the drawer (Esc, close button, or click outside) and re-open within the same browser tab, Then the slider values from before the close are preserved.
**Negative:**
- Given Generational Ordering is off, When I drag the Generational Strength slider, Then the value updates but no layout change occurs until Generational Ordering is turned on (documented intentional behaviour).
- Given I refresh the page, Then physics resets to defaults (session-only — documented in RUNBOOK).
**Audit:** No.
