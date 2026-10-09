# EPIC-AUT — Authentication & User Management — User Stories

### STORY-AUT-001 — Register with email + password
**Feature:** FEAT-AUT-001 | **Role:** Unauthenticated | **Priority:** P0
**Code:** `src/app/signup/page.tsx`, `src/app/api/register/route.ts`
**Story:** As a visitor, I want to register with my name, email, and password, so that I can use BioGravity.
**AC:**
- Given valid name, unique email, and password ≥ 8 chars; when I submit; then a `User` row is created with bcrypt-hashed password.
- After successful registration, I am automatically signed in and redirected to `/dashboard`.
**Negative:** Email already in use → 4xx + form error; missing fields → form-level validation blocks submit.
**Audit:** No.

### STORY-AUT-002 — Log in with email + password
**Feature:** FEAT-AUT-002 | **Role:** Unauthenticated | **Priority:** P0
**Code:** `src/app/login/page.tsx`, `src/lib/auth.ts`
**Story:** As a returning user, I want to log in with my credentials, so that I can access my projects.
**AC:**
- Given valid credentials; when I submit; then NextAuth creates a JWT session and redirects to `/dashboard`.
- The session carries `user.id`, `email`, `name`, `image`.
**Negative:** Wrong password / unknown email → `null` from `authorize()` → "Sign in failed" error rendered.
**Audit:** No.

### STORY-AUT-003 — Receive JWT session with `user.id`
**Feature:** FEAT-AUT-003 | **Role:** Authenticated | **Priority:** P0
**Code:** `src/lib/auth.ts:55-70`
**Story:** As a system, I need `session.user.id` populated, so that authorization checks work.
**AC:** `jwt()` callback persists `user.id` into the token; `session()` callback mirrors it onto `session.user.id`.
**Audit:** No.

### STORY-AUT-004 — Passwords stored as bcrypt hashes
**Feature:** FEAT-AUT-004 | **Role:** System | **Priority:** P0
**Code:** `src/app/api/register/route.ts`, `src/lib/auth.ts:37-41`
**Story:** As a security-conscious user, I want my password to never be stored in plaintext.
**AC:** Registration hashes via `bcryptjs.hash`; login compares via `bcryptjs.compare`. No raw password is persisted.
**Audit:** No.

### STORY-AUT-005 — Open user-menu and log out
**Feature:** FEAT-AUT-005 | **Role:** Authenticated | **Priority:** P0
**Code:** `src/components/user-menu.tsx`, `src/components/navbar.tsx`
**Story:** As an authenticated user, I want an avatar menu with Profile and Log out options.
**AC:**
- Avatar (or initials) renders in navbar.
- Click → dropdown with "Profile" link → `/profile` and "Log out" → `signOut()` → redirect to `/login`.
**Negative:** No session → user-menu not rendered.
**Audit:** No.

### STORY-AUT-006 — View and edit profile
**Feature:** FEAT-AUT-006 | **Role:** Authenticated | **Priority:** P1
**Code:** `src/app/profile/page.tsx`, `src/app/profile/profile-form.tsx`, `src/app/api/profile/route.ts`
**Story:** As an authenticated user, I want to edit my display name, email, and image, so that other members see me correctly.
**AC:** Form pre-fills with current user; on save → `PATCH /api/profile` updates the `User` row; session reflects new name on next page load.
**Negative:** Email collision → 4xx + form error.
**Audit:** No.

### STORY-AUT-007 — Toggle dark/light theme
**Feature:** FEAT-AUT-007 | **Role:** Any | **Priority:** P1
**Code:** `src/components/mode-toggle.tsx`, `src/components/theme-provider.tsx`
**Story:** As any user, I want to toggle dark/light/system theme.
**AC:** Toggle persists in `localStorage` via `next-themes`; respects OS preference on first load.
**Audit:** No.

### STORY-AUT-008 — Server-side redirect on unauthenticated `/dashboard`
**Feature:** FEAT-AUT-008 | **Role:** Unauthenticated | **Priority:** P0
**Code:** `src/app/dashboard/page.tsx`
**Story:** As an unauthenticated visitor, I want to be sent to `/login` if I open a protected route.
**AC:** Server component reads `getServerSession`; if null → `redirect('/login')`.
**Audit:** No.

### STORY-AUT-009 — Theme + 3D background present on login/signup screens
**Feature:** FEAT-AUT-007, FEAT-LND-002 | **Role:** Unauthenticated | **Priority:** P2
**Code:** `src/app/login/page.tsx`, `src/app/signup/page.tsx`, `src/components/landing/ThreeBackground.tsx`
**Story:** As a visitor, I want a polished login/signup experience matching the landing page.
**AC:** Same animated `<ThreeBackground />` renders behind both forms; keyboard input triggers impulse on background.
**Audit:** No.
