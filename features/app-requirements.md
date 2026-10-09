# BioGravity

I want to create a relationship app that has a similar graph representation as kumu.io has, but 3d. The app must be able to be used on mobile and tablets as well.
data should be persisted on the server side so that users can access their data from any device.
The name of the app is BioGravity

## UX/UI requirements

[ ]The UX/UI should be new, and not similar to kumu.io.
[ ]the UX/UI should be very user friendly, modern and professional.
[ ]light and dark mode should be available
[ ]Login/signup screen should be impactful having a blurred 3d graph as background that should contain spheres of different colours as the graph nodes connected by straight connection lines. Every time a user presses a key in the forms, the graph should move as if it was tapped.

## Core requirements

### The app should have the following sections

[ ] Graph (visualization of the elements and relationships)
[ ] Data (where users can edit the data)
[ ] Story mode
[ ] Settings

### User requirements

[ ] User login must login to access the app
[ ] User should be able to register to the app
[ ] User mandatory attributes on signup are: User Name, email, password.
[ ] On login, the user shall be presented with the list of project that he has access to. If he does not have access to any project, the user should be able to create one.
[ ] When entering a project, the default section to open should the the graph view.
[ ] Users can invite people to a project specifying his role in the project as viewer, editor, admin.
[ ] A user that is a viewer cannot change data or settings
[ ] a user that is a editor, can change the data of the project and it’s settings.
[ ] Admin users can delete projects
[ ] When a user follows the invite to a project to register, after registration he should have access to that project.

### Project requirements

[ ] User can create projects in the app. A project is owned by the creator of the project and should be the main entity of the model. Elements, relationships, settings and all other data elements will be stored under projects.
[ ] The creator of the project is the admin of the project.
[ ] Elements are the nodes in the graph, by default spheres/circles.
[ ] Relationships between two members should have a relationship type attribute.
[ ] A exit project button should be always present in the app allowing the users to navigate to the project selection page
[ ] when a project is created, a project type should be selected. This will determine the default elements and relationships available to set on the project.
[ ] the user should also be able to create a new project type from the project selection screen. in that case, an empty project with no entity or relationship types should be created, and the user directed to the project settings to define the project type settings (element types and attribure and relationship types and attributes). the user can then save that project type for future use.

### other requirements

[ ]Similar to google, a user should have an avatar button on the screen that will allow him to edit his information and to log off the application.
[ ]Session History: The app must maintain a local history stack of the last 20 actions performed in the Graph or Data view.
[ ]Undo/Redo UI: "Undo" and "Redo" buttons must be visible in the graph interface. On mobile, these should be easily accessible via thumb-reach.
[ ]Change Log: The Data section should feature a "History" tab showing a list of recent changes (e.g., "John Doe added," "Relationship deleted") with a timestamp and the user who made the change (crucial for the collaboration roles you defined).
[ ]Quick Restore: From the History tab, an Admin or Editor should be able to revert the project to a previous state.

## Settings section

User should be able to configure on a settings tab the following:
[ ]Relationship types available to set on the relationships - this should be text initially populated on project creation based on the project type. There must be at least one relationship type.
[ ]Element types are configurable in the settings section (add, delete, edit). Default type present is setup on project creation determined by the project type. There must be always at least one element type.
[ ]Elements attributes should be configurable allowing the user to edited, add, delete them.
[ ]attributes can be of different types: Text, lists of elements (that are possible to define in a coma seperated string), check boxes (like the alive status), date, numeric, Image File.
[ ]On the settings tab the user should be able to control the cluster attraction of the elements not connected (this will define how close together the separate clusters should be), the strength of the links (pull elements together), elements repletion (the push away force between elements)
[ ]users that have edit or admin rights should be able delete all data of a project and delete the project in the settings section.
[ ]when a user deletes a project he should be directed to the project selection screen (just as on login)
[ ]Visibility Settings: In Project Settings, the Admin should be able to toggle project visibility between "Private" (invite only) and "Public" (anyone with the link).
[ ]Read-Only Public View: Public links must open the project in "Viewer" mode automatically. Public users cannot edit data or settings.
[ ]Embed Code: The app should generate an HTML <iframe> snippet allowing users to embed their 3D graph on external websites (blogs, portfolios).
[ ]Social Share: A "Share" button in the Graph view should allow generating a direct link to the current specific camera angle/selection (e.g., sending a link that opens directly focused on a specific grandfather node).
[ ] there will be a section in the settings tab where the user can define the project type. This will determine the default elements types and relationships types available to set on the project, as well as the predefined attributes of the elements and relationships.
[ ] two default project types should be available: Family and Organization.
[ ] family project type should have:

- element types: Person, Pet
- element attributes: name, age, gender, image
- relationship types: parent/child, partner, owner/pet
- no relationship attributes by default
[ ] organization project type should have:
- element types: Person, Company, Department, Team
- element attributes: Name, Role, Image
- relationship types: direct report, indirect report
- no relationship attributes by default

## Graph Section

[ ]Should allow for a 2d or 3d visualization. This will be controlled by a switch/button.
[ ]User should be able to enter data on a similar way as in kumu. Both elements and relationships.
[ ]Take kumu.io navigation, and other graph elements like zoom as reference for creating our graph navigation.
[ ]filter and search capabilities should be available
[ ]there should be a insights panel where analytical functions will be available. To start with the following insights will be available:

- Who is the most connected element
- at is the distance between two nodes
- how many levels does the hierarchy have
[ ]there will be an option to show / hide the elements names.
[ ]Focus Mode: When a user selects a node (element), a "Focus" button should appear. Clicking this hides all elements except the selected node and its direct connections.
[ ]Degrees of Separation: In Focus Mode, a slider (or + / - buttons) should allow the user to expand the view to 1, 2, or 3 degrees of separation (e.g., Show me John, his parents, and his grandparents, but no one else).
[ ]Cluster Collapsing: Users should be able to "collapse" a cluster of nodes into a single "Group Node" to declutter the view (e.g., collapse all "Cousins" into one sphere).
[ ]Isolate by Attribute: The search bar should support "Isolation." If a user searches for "Type: Engineer," the graph should fade out or hide all non-Engineers, rather than just highlighting the Engineers.

## Data Section

[ ] User should be able to export and import projects. Projects can be exported as backup (a zip file containing the data in excel format with the elements and the relationships along with any images uploaded) or as data (only excel file with the data without the uploaded images). Import and export to GEDCOM must be available as well.
[ ] User should be able to edit both elements and relationships on a data sheet type mode (similar functionality as kumu.io)
[ ] filter and search capabilities should be available. Filtering should be possible on all attributes of the elements, including type.
[ ] Relationships edit on selecting elements to connect should allow the selection of the existing elements with a type search capability (on the drop down I should be able to type text and that will filter elements that contain that text in their name).
[ ] users that have edit or admin rights should be able delete all data of a project

## Story Mode Section

> **⛔ DEFERRED for the public release (CC-14, 2026-05-19).** Story Mode is not part of the public-release scope. The canonical out-of-scope record lives at [docs/product/05-out-of-scope.md](../docs/product/05-out-of-scope.md) and the deferred epic block at [docs/product/02-epic-taxonomy.md § EPIC-STM](../docs/product/02-epic-taxonomy.md#epic-stm--story-mode-deferred). Items below are kept verbatim for historical traceability of the original spec, but they are NOT release blockers and do not need tests, code, or release-checklist coverage.

[ ] The app shall include a "Story Mode" (distinct from Graph and Data views) allowing creators to build a narrative sequence.
[ ] Slides/Steps: Users can create "Slides." Each slide captures the current state of the graph, including:
[ ] Camera Position: The specific 3D angle and zoom level.
[ ] Focus: Which elements are currently selected or isolated.
[ ] Text Overlay: A customizable text box (supports Markdown) floating over the graph to explain the view.
[ ] Transitions: When navigating between slides in Story Mode, the camera should smoothly animate (pan/zoom/rotate) from the first position to the next to maintain the "impactful" 3D feel.
[ ] Navigation: Viewers should have simple "Next" and "Previous" controls overlaying the bottom of the screen, optimized for touch (mobile/tablet).
