# Increment 1: Foundation & Authentication Walkthrough

## Progress

Successfully initialized the BioGravity project, established the local database, and implemented the full authentication system.

### Features Implemented

1. **Project Setup**:
    - Initialized Next.js 14 (App Router) with TypeScript and Tailwind CSS.
    - Configured Shadcn UI for component library.
    - Installed Three.js and React Three Fiber for 3D visualization.

2. **Theme Toggle**:
    - Implemented Dark/Light mode support using `next-themes`.
    - Added a [Navbar](../src/components/navbar.tsx#4-35) with a theme toggle button.

3. **Local Database Setup**:
    - **Dockerized Postgres**: Configured a local PostgreSQL instance using Docker Compose on port 5433.
    - **Prisma ORM**: Initialized Prisma (v5.13.0) and pushed the schema for Users, Accounts, Sessions, Projects, and Graph Elements.
    - **Schema**: Defined comprehensive schema compatible with NextAuth.js.

4. **Authentication System**:
    - **NextAuth.js**: Configured with `CredentialsProvider` and `PrismaAdapter`.
    - **API Routes**: Implemented `api/auth/[...nextauth]` for auth handling and `api/register` for new user registration.
    - **Password Hashing**: Used `bcryptjs` for secure password storage.
    - **Session Management**: Wrapped application with [SessionProvider](../src/components/session-provider.tsx#5-8) for client-side state.

5. **UI Implementation**:
    - **Landing Page (3D Background)**: Interactive 3D graph background with impulse effects.
    - **Login & Signup**: Responsive forms connected to the backend APIs with error handling and loading states.
    - **Dashboard**: Protected route that redirects unauthenticated users and displays the user's name.

# Increment 2: Project Management & Data Structure Walkthrough

## Progress

Implemented core project management features, allowing users to create projects, define their data structure (schema), and manage team members.

### Features Implemented

1. **Project Creation**:
    - **API**: Created `api/projects` endpoint to handle project creation and listing.
    - **UI**: Added [NewProjectDialog](../src/components/dashboard/new-project-dialog.tsx#28-138) to the Dashboard for creating "Family" or "Organization" projects.
    - **Dashboard**: Updated Dashboard to display a list of the user's projects with real-time data integration.

2. **Project Details & Settings**:
    - **Project Page**: Created logic for `/projects/[id]` to display project details (currently a shell for the graph).
    - **Settings Page**: Implemented `/projects/[id]/settings` with a responsive sidebarless layout.

3. **Schema Configuration**:
    - **Element Types**: Implemented [SchemaEditor](../src/components/projects/schema-editor.tsx#31-137) to allow users to define custom element types (e.g., Person, Place) with color coding.
    - **Relationship Types**: Extended [SchemaEditor](../src/components/projects/schema-editor.tsx#31-137) to support relationship types (e.g., Parent, Friend).
    - **API**: Updated `api/projects/schema` to handle dynamic schema updates using JSON fields in Postgres.

4. **User Management**:
    - **Member List**: Created [MemberList](../src/components/projects/member-list.tsx#37-170) component to view and manage project members.
    - **Invite System**: Implemented functionality to add existing users to a project by email and remove members.
    - **Role Management**: Basic role assignment (defaulting to Editor) implementation.

## Verification

- **Build**: Successfully passed `npm run build`.
- **Database**: Prisma schema updated with `elementTypes` and `relationshipTypes` JSON fields.
- **API**: verified endpoints for Projects, Schema, and Members.

# Increment 3: Core Graph Visualization Walkthrough

I have successfully implemented the core graph visualization features for BioGravity. This increment focuses on rendering the graph in 3D, managing graph data, and providing basic interactivity.

## Changes

### 1. Graph Data Management

- **API Endpoints**: Created endpoints to fetch graph data (`/api/projects/[id]/graph`) and seed sample data (`/api/projects/[id]/seed`).
- **Zustand Store**: Implemented `useGraphStore` to manage graph data, selection state, and view mode (2D/3D).

### 2. 3D Graph Component

- **GraphScene**: Built a 3D scene using `@react-three/fiber` and `d3-force-3d` for physics simulation.
- **Rendering**: Nodes are rendered as spheres and links as lines, with color-coding based on type.
- **Dynamic Updates**: The graph automatically updates when data changes or when toggling between 2D and 3D modes.

### 3. Interactive Features

- **Node Selection**: Clicking a node highlights it and opens a details panel showing its attributes.
- **Details Panel**: A floating panel displays information about the selected node.
- **Navigation Controls**: Added Zoom In/Out and Reset View buttons.
- **2D/3D Toggle**: A button to switch the simulation and camera between 2D and 3D modes.

## Verification Results

### Automated Build Verification

- Ran `npm run build` successfully, confirming no type errors in the new components and updated keys.

### Manual Verification Steps

1. **Project Page**: Navigate to a project page.
2. **Seeding**: If empty, click "Seed Data" to generate sample nodes and links.
3. **Visualization**: Verify nodes and links render in 3D space.
4. **Interaction**: Click a node to see the details panel.
5. **Navigation**: Use mouse/touch to orbit/pan and buttons to zoom.
6. **View Toggle**: Switch between 2D and 3D modes and observe the graph flattening/expanding.

# Walkthrough - Increment 4: Data Management & Advanced Graph Features

This increment focused on enhancing the capabilities of BioGravity with a robust Data View (spreadsheet-like interface), advanced graph interaction features (Search, Filter, Undo/Redo), and Import/Export functionality.

## Changes

### 1. Data View (Spreadsheet UI)

- **Tabbed Interface**: The Project Details page now features a tabbed layout, allowing users to switch between the immersive "Graph View" and the structured "Data View".
- **Elements & Relationships Tables**: Implemented comprehensive tables to list all graph elements and relationships.
- **Inline Editing**: Users can now edit Element and Relationship properties directly from the table using a dialog interface.
- **Delete Functionality**: Added the ability to delete items directly from the tables with optimistic UI updates.

### 2. Search & Filtering

- **Filter Panel**: Introduced a floating filter panel in the Graph View and a dedicated filter section in the Data View.
- **Global Search**: Allows searching for elements by name, type, or description.
- **Type Filtering**: Users can filter elements by their defined Type (e.g., Person, Event).
- **Graph Integration**: The 3D graph visualization dynamically updates to show only the filtered elements and their connections.

### 3. Import & Export

- **Export to Excel**: Added functionality to export the entire graph dataset (Elements and Relationships) to an Excel (.xlsx) file.
- **Import from Excel**: Implemented a bulk import feature that reads Elements and Relationships from an Excel file and upserts them into the database. This serves as a powerful Bulk Edit tool.

### 4. Undo/Redo System

- **History Tracking**: Added an action history to the application state.
- **Undo/Redo Controls**: Users can undo and redo local state changes (visual undo).
- *Note*: Currently, the Undo/Redo system operates on the client-side state. Complex synchronization with the backend for reverted actions is planned for a future update.

## Validation Results

### Automated Tests

- **Build Verification**: The project builds successfully with `npm run build`.
- **Linting**: Addressed linting issues in new components.

### Manual Verification Steps

1. **Data View**:
    - Navigate to a project.
    - Click "Data View" tab.
    - Verify Elements and Relationships are listed.
    - Click "Edit" (pencil icon) on an element, change name, save. Verify update in table.
    - Click "Delete" (trash icon), confirm. Verify item removal.
2. **Graph View Filtering**:
    - Switch to "Graph View".
    - Type in the Search box (e.g., a node name). Verify only matching nodes remain visible.
    - Select a Type from the dropdown. Verify filtering.
3. **Import/Export**:
    - In Data View, click "Export". Open the downloaded Excel file.
    - Add a new row to "Elements" in the Excel file.
    - Click "Import" and select the modified file.
    - Verify the new element appears in the list.

## Screenshots

*(Screenshots would be embedded here in a real verification run)*

- **Data View Interface**: Shows the table layout.
- **Filter Panel**: Shows the search and select inputs.
- **Edit Dialog**: Shows the modal for editing properties.
