# EPIC-LND — Landing Page — User Stories

### STORY-LND-001 — Render the marketing hero
**Feature:** FEAT-LND-001 | **Role:** Unauthenticated | **Priority:** P1
**Code:** `src/app/page.tsx`
**Story:** As a visitor, I want a clean landing page that pitches BioGravity and pushes me to Login or Sign Up.
**AC:**
- Title "BioGravity" with gradient styling.
- Tagline: "Interactive 3D Relationship Mapping".
- CTAs: "Log in" → `/login`, "Sign up" → `/signup`.
**Audit:** No.

### STORY-LND-002 — Animated 3D background reacts to interaction
**Feature:** FEAT-LND-002 | **Role:** Unauthenticated | **Priority:** P1
**Code:** `src/components/landing/ThreeBackground.tsx`
**Story:** As a visitor, I want a striking animated 3D graph behind the page that responds when I type into the form, reinforcing the product's nature.
**AC:**
- Three.js scene renders spheres + edges.
- Keypresses in `/login` and `/signup` forms emit "impulse" events that perturb the simulation.
- 60fps on modern desktop; degrades gracefully on mobile.
**Audit:** No.

### STORY-LND-003 — Auto-redirect to dashboard when logged in
**Feature:** FEAT-LND-003 | **Role:** Authenticated | **Priority:** P1
**Code:** `src/app/page.tsx`
**Story:** As a returning logged-in user, I don't want to see the landing page; I want to go straight to my projects.
**AC:** `/` checks `getServerSession`; if present → `redirect('/dashboard')`.
**Audit:** No.
