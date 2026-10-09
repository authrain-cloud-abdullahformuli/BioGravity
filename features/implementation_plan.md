# BioGravity Implementation Plan

## Goal

Develop a modern, 3D relationship mapping application called **BioGravity**, inspired by Kumu.io but with a focus on 3D visualization, mobile responsiveness, and a premium user experience.

## Technology Stack

- **Frontend**: Next.js (App Router), TypeScript, Tailwind CSS, Shadcn UI.
- **3D Visualization**: Three.js, React Three Fiber (R3F), Drei.
- **State Management**: Zustand (for complex graph state and UI interactions).
- **Backend/Database**: Supabase (PostgreSQL) or Vercel Postgres + Prisma.
- **Authentication**: Supabase Auth or NextAuth.js.
- **Testing**: Vitest (Unit), Playwright (E2E).

## Development Strategy

The project will be implemented in 5 manageable increments. Each increment builds upon the previous one and concludes with a testing phase.

---

### Increment 1: Foundation & Authentication

**Objective**: Establish the project structure, core UI layout, and user authentication system.

#### Features

1. **Project Setup**: Initialize Next.js with TypeScript, Tailwind, Shadcn UI, and R3F.
    - *Testing*: Verify build pipeline and linting.
2. **Landing Page (3D Background)**: Create a login/signup page with an interactive 3D graph background (nodes connect/react to input).
    - *Testing*: Visual verification of 3D background interactivity.
3. **Authentication System**: Implement Sign Up, Login, and Logout using Supabase/NextAuth.
    - *Testing*: E2E test for successful signup, login, and logout.
    - *Testing*: Unit test for form validation (email format, password strength).
4. **User Dashboard**: Create a protected route for the dashboard showing a list of projects (empty state initially).
    - *Testing*: E2E test verifying redirection to login if unauthenticated.
    - *Testing*: Unit test for `ProjectList` component empty state.
5. **Theme Toggle**: Implement Light/Dark mode toggle in the navigation bar.
    - *Testing*: E2E test verifying theme persistence across reloads.

### Increment 2: Project Management & Data Structure

**Objective**: Enable users to create projects, manage settings, and define data structures.

#### Features

1. **Database Schema**: Define tables for `User`, `Project`, `Element`, `Relationship`, `Attribute`.
    - *Testing*: Integration test for database migrations.
2. **Project Creation**: Implement UI to create new projects (Name, Description, Type: Family/Organization).
    - *Testing*: E2E test for creating a new project and verifying it appears in the list.
3. **Project Types**: Seed default types (Family, Organization) with predefined elements/relationships.
    - *Testing*: Unit test ensuring correct default attributes are applied on project creation.
4. **Settings - Schema Configuration**: Interface to add/edit Element Types and Relationship Types (e.g., Person, Company).
    - *Testing*: Unit test for adding a new Element Type and validating uniqueness.
5. **Settings - User Management**: Interface to invite users (Viewer/Editor/Admin) to a project.
    - *Testing*: Integration test for invite link generation and role assignment.

### Increment 3: Data Management & Advanced Graph Features

**Objective**: Provide robust data entry tools and advanced analysis capabilities.

#### Features

1. **Data View (Spreadsheet UI)**: Table view for bulk editing Elements and Relationships.
    - *Testing*: Unit test for cell editing and data validation.
2. **Search & Filtering**: Global search bar and attribute-based filtering (e.g., "Show only Engineers").
    - *Testing*: Unit test for filter logic (AND/OR conditions).
3. **Undo/Redo Stack**: Implement a history stack for the last 20 actions.
    - *Testing*: Unit test verifying state reversion after 5 actions.
4. **Import/Export**: Support Excel and GEDCOM formats.
    - *Testing*: Integration test for importing a valid GEDCOM file and verifying node count.
5. **Cluster Collapsing**: Ability to group nodes into a single "Group Node".
    - *Testing*: Unit test for graph topology changes (nodes mapped to group).

### Increment 4: Core Graph Visualization

**Objective**: Develop the primary 3D and 2D graph visualization with interactivity.

#### Features

1. **Graph Rendering Engine**: Implement force-directed graph using `d3-force-3d` or R3F.
    - *Testing*: Visual regression test for rendering 100+ nodes without crashing.
2. **Node/Link Interaction**: Click to select, hover effects, drag to move nodes.
    - *Testing*: E2E test for selecting a node and verifying details panel opens.
3. **2D/3D Toggle**: Switch between 2D and 3D camera modes.
    - *Testing*: Manual visual verification of transition smoothness.
4. **Navigation Controls**: Zoom, Pan, Rotate controls (Touch-optimized for mobile).
    - *Testing*: E2E test for zoom functionality.
5. **Focus Mode**: Isolate selected node + 1 degree of connection. (Expandable to 2, 3 degrees).
    - *Testing*: Unit test for "get neighbors" algorithm at different depths.

### Increment 5: Story Mode & Polish

NOT DONE YET
**Objective**: Implement the narrative "Story Mode" and finalize UI/UX.

#### Features

1. **Story Editor**: UI to create "Slides" (snapshots of camera state + focus).
    - *Testing*: E2E test for capturing a slide and saving it.
2. **Presentation Mode**: Playback interface with smooth camera transitions between slides.
    - *Testing*: Visual check for transition smoothness and text overlay positioning.
3. **Mobile Optimization**: Ensure touch targets are sized correctly and layout adapts to tablets.
    - *Testing*: Automated layout tests at mobile breakpoints.
4. **Social Sharing & Embedding**: Generate public links and iframe code.
    - *Testing*: E2E test visiting a public link as an unauthenticated user.
5. **Performance Optimization**: Optimize graph rendering for large datasets (1000+ nodes).
    - *Testing*: Benchmark test ensuring 60fps interaction on standard devices.

## Verification Plan

For each increment, a manual walkthrough will be performed in addition to the automated tests.
Screenshots and videos (where applicable) will be generated to document the progress.
