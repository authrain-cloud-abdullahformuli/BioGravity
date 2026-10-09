# EPIC-MEM — Roles & Membership — User Stories

### STORY-MEM-001 — Role hierarchy is enforced server-side
**Feature:** FEAT-MEM-001 | **Role:** System | **Priority:** P0
**Code:** `src/lib/roles.ts:101-133`
**Story:** As the platform, I want every project API call to validate the caller's role, so that Viewers cannot write and non-members cannot read.
**AC:**
- `requireRole(projectId, "Viewer"|"Editor"|"Admin")` returns `{authorized: false, status}` on rejection.
- Owner is auto-mapped to Admin.
- Hierarchy: Viewer (1) < Editor (2) < Admin (3).
**Negative:** Missing session → 401; not a member → 401 ("Access denied"); project not found → 404; below required role → 403.
**Audit:** No.

### STORY-MEM-002 — Invite a member by email (defaults to Editor)
**Feature:** FEAT-MEM-002 | **Role:** Owner | **Priority:** P0
**Code:** `src/components/projects/member-list.tsx`, `POST /api/projects/members`
**Story:** As an Owner, I want to invite a teammate by email so that they can collaborate on the project.
**AC:**
- Owner enters an email; submit → `POST /api/projects/members`.
- Server looks up `User` by email → creates `ProjectMember` with role = "Editor".
- New row appears in member list.
**Negative:** Email belongs to no user → 4xx + "User not found". (No invite-token signup flow today — see out-of-scope.) Already a member → 4xx.
**Audit:** No.

### STORY-MEM-003 — See members with avatar, name, email, role badge
**Feature:** FEAT-MEM-003 | **Role:** Owner | **Priority:** P1
**Code:** `src/components/projects/member-list.tsx`
**Story:** As an Owner, I want a list of all members showing who they are and what role they hold.
**AC:** Renders Owner row + every `ProjectMember`. Each row: avatar (or initials), display name, email, role badge.
**Audit:** No.

### STORY-MEM-004 — Remove a member (Owner only)
**Feature:** FEAT-MEM-004 | **Role:** Owner | **Priority:** P1
**Code:** `src/components/projects/member-list.tsx`, `DELETE /api/projects/members`
**Story:** As an Owner, I want to remove a member, so that they lose access to the project.
**AC:** Trash icon next to non-owner row → confirm → `DELETE /api/projects/members` removes the `ProjectMember`.
**Negative:** Cannot remove the Owner row.
**Audit:** No.

### STORY-MEM-005 — Viewer sees read-only Data view
**Feature:** FEAT-MEM-006 | **Role:** Viewer | **Priority:** P0
**Code:** `src/components/projects/data-view.tsx`, `src/components/projects/elements-table.tsx`, `src/components/projects/relationships-table.tsx`
**Story:** As a Viewer, I want write actions hidden so that I am not tempted to attempt unauthorised changes.
**AC:**
- Add / Edit / Delete buttons are not rendered when role is Viewer.
- Even if the request is forged, server-side `requireRole(projectId, "Editor")` rejects with 403.
**Audit:** No.

### STORY-MEM-006 — Viewer cannot enter Schema editor or Settings
**Feature:** FEAT-MEM-005 | **Role:** Viewer / Editor / Admin (non-owner) | **Priority:** P0
**Code:** `src/lib/roles.ts`, `src/app/projects/[id]/settings/page.tsx`
**Story:** As a non-owner, I want the Settings page to either gate to read-only or hide owner-only sections.
**AC:**
- Settings page only renders Schema editor, Member management, Visibility, and Danger Zone when `isOwner = true` (or for Schema/Members: when role = Admin).
- API endpoints behind those surfaces also reject non-owners.
**Negative:** Direct URL access to settings as a Viewer → empty/read-only state; mutation endpoints return 403.
**Audit:** No.

### STORY-MEM-007 — Invite an unregistered email via secure copy-link (CC-13)
**Feature:** FEAT-MEM-007 | **Role:** Owner / Admin | **Priority:** P1
**Code:** `prisma/schema.prisma` (model ProjectInvite), `src/lib/invites.ts`, `src/app/api/projects/members/route.ts`, `src/app/api/invites/[token]/route.ts`, `src/app/api/invites/[token]/accept/route.ts`, `src/app/api/projects/[id]/invites/route.ts`, `src/app/api/projects/[id]/invites/[inviteId]/route.ts`, `src/app/invite/[token]/page.tsx`, `src/app/invite/[token]/accept-form.tsx`, `src/components/projects/member-list.tsx`
**Story:** As an Owner or Admin, I want to invite a collaborator by email even if they don't have an account yet, so that onboarding does not require pre-existing accounts.
**AC:**
- Given an Owner/Admin types an unregistered email in member list, When they click `+`, Then a 7-day invite token is created, the invite appears under "Pending invitations", and a copy-link button reveals `/invite/<token>`.
- Given an Owner/Admin types a registered email, When they click `+`, Then a `ProjectMember` is created immediately (existing behaviour preserved).
- Given an invitee opens the invite link while logged out, Then the landing page shows "Create account" and "Sign in" links pre-filled with the invited email.
- Given an invitee signs up via the invite link, Then the auto-login redirects back to the invite landing page, which shows "Accept invitation".
- Given the invitee clicks Accept, Then a `ProjectMember` row is created with the invited role, the invite is marked accepted, and the invitee is routed to the project.
- Given an Owner/Admin clicks "Revoke" on a pending invite, Then `revokedAt` is set and the link stops working immediately.
**Negative:**
- Given the invite has expired (>7 days), Then `/api/invites/<token>/accept` returns 410.
- Given the invite has been revoked, Then accept returns 410.
- Given the invite has already been accepted, Then accept returns 410.
- Given the logged-in user's email does not match the invite, Then accept returns 403 and the landing page shows "Wrong account".
- Given an Owner/Admin tries to invite a second open invite for the same email + project, Then the create endpoint returns 409 and tells the inviter to revoke the existing invite first.
- Given an unauthenticated request to accept, Then the endpoint returns 401.
**Audit:** Yes — `console.info` JSON lines: `invite.create`, `invite.accept`, `invite.revoke` (with `inviteId`, `projectId`, `actorUserId`, `outcome`). Token value is never logged.

### STORY-MEM-008 — Email invitations automatically via Resend (CC-15)
**Feature:** FEAT-MEM-008 | **Role:** Owner / Admin / Invitee | **Priority:** P1
**Code:** `src/lib/email/resend-client.ts`, `src/lib/email/send-invite.ts`, `src/lib/email/templates/InviteEmail.tsx`, `src/app/api/projects/members/route.ts`, `src/app/api/projects/[id]/invites/[inviteId]/resend/route.ts`, `src/components/projects/member-list.tsx`, `prisma/schema.prisma` (lastSentAt, sendFailureCount, lastSendError columns)
**Story:** As an Owner or Admin, I want invitations to send by email automatically so I don't have to manually paste the link into another app; and as an Invitee I want to receive a clear branded email with the project name, role, expiry, and a one-click accept button.
**AC:**
- Given an Owner/Admin creates an invite for an unregistered email, When the request completes, Then a transactional email is dispatched via Resend with `from: BioGravity Invites <invites@mail.example.com>`, `reply-to:` set to the inviter's email, subject naming the project, and an HTML body (React Email) plus plain-text fallback containing the `/invite/<token>` URL.
- Given the email send succeeds, Then `lastSentAt` is set on the invite row and the inviter UI shows a green "Sent" chip.
- Given the email send fails (5xx, timeout, or missing key), Then the invite is still created, the URL is still returned to the inviter, `sendFailureCount` is incremented, `lastSendError` is recorded, and the UI shows a red "Failed" chip with the error.
- Given a pending invite is shown in the inviter UI, When the inviter clicks the Send (paper-plane) button, Then `POST /api/projects/<id>/invites/<inviteId>/resend` re-sends the email using the **same token** and updates the chip.
- Given `RESEND_API_KEY` is unset (local dev), Then send short-circuits without a network call and the row is marked failed with `RESEND_API_KEY missing`; copy-link continues to work.
- Given the inviter's session has no name, Then the email displays the inviter's email as the inviter name.
**Negative:**
- Given the caller of the resend route is not Owner/Admin, Then the route returns 403.
- Given the invite is expired, accepted, or revoked, Then the resend route returns 410 without calling Resend.
- Given the invite belongs to a different project than the URL parameter, Then the resend route returns 404.
- Given Resend returns an error on the first attempt, Then the send module retries exactly once (250ms delay, 1.5s per-attempt timeout, ~3s total budget); persistent failure surfaces in `lastSendError`.
- Given the React Email render throws at build time, Then the plain-text fallback still ships in the same `send()` call (`text` field is always populated independently of `html`).
**Audit:** Yes — `console.info` JSON lines: `email.send.start`, `email.send.ok`, `email.send.error`, `email.send.skipped`, `email.send.persist_error` (with `inviteId`, `projectId`, `actorUserId`, `attempt`, `resendMessageId`/`errorCode`). Token value, API key, and recipient PII beyond the email already typed by the inviter are never logged.
