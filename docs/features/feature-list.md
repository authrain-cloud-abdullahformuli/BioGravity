# Feature List

## CC-5 — Release blocker: ESLint fails with 137 errors
The release lint gate now completes cleanly, with blocking lint failures resolved and remaining intentional dynamic typing choices documented in the ESLint configuration.

## CC-6 — Release blocker: production build hangs after page optimization
Production builds now complete successfully with the webpack build pipeline, local font fallbacks, and a Docker runtime that serves the generated Next.js app without relying on standalone tracing.

## CC-7 — Graph edits are optimistic but do not roll back on failed update/delete/pin requests
Graph edits now protect users from stale optimistic state by rolling back failed update, delete, and pin operations and surfacing an error message when persistence fails.

## CC-8 — Pinning a graph node is not persisted by the element update API
Pinned graph nodes now persist their pinned state and saved coordinates through the element update API, so pinned layouts survive refreshes and reloads.

## CC-9 — Non-owner Admins see settings button but are redirected away from settings
Project Admin members can now access settings consistently with the admin controls shown elsewhere in the project interface.

## CC-10 — Project creation ignores project type and always writes Family defaults
Project creation now respects the selected Family or Organization type and applies the corresponding element and relationship defaults from a shared schema source.

## CC-11 — Expose graph Insights panel in the project UI
The graph view now includes a one-click toggle that opens an Insights panel anchored to the top-right of the canvas, exposing degree centrality, total nodes and edges, average degree, density, type distribution, and selected-node statistics.

## CC-12 — Make physics controls discoverable from project settings or graph view
Graph physics is now tunable from a right-side drawer launched from the navigation cluster, with sliders for cluster attraction, link strength, repulsion, link distance, generational strength, and a Reset button that restores documented defaults. Settings live in the current browser session.

## CC-13 — Implement invite-token registration flow for project members
Project Owners and Admins can now invite collaborators by email even when the invitee has no account yet. The system generates a secure 7-day single-use link the inviter shares; the recipient can register or sign in with the invited email, then accept the invitation and join the project with the intended role. Existing-user invites continue to work unchanged.

## CC-14 — Add Story Mode or formally remove it from release scope
Story Mode is formally classified as Deferred for the public release. The original requirements text remains for historical traceability, but every doc and the canonical product catalog agree it is out of scope, so QA and prioritisation no longer treat it as a release blocker.

## CC-15 — Email invitations via Resend (automate the CC-13 copy-link UX)
Invitations now send as transactional email via Resend from `invites@mail.example.com` the moment the inviter creates them, with the inviter's address as the reply-to. The pending-invitations list surfaces the delivery state (Sent / Failed / Not sent) and a Send button re-delivers using the same token. Copy-link remains as a graceful fallback when Resend is unconfigured or the API call errors.

## CC-16 — Deploy BioGravity to Synology DS723+ via GitHub Actions + GHCR
A GitHub Actions workflow now publishes the Docker image to GHCR on every push to `main` and on every `v*` tag. A production Compose overlay deploys the image on a Synology DS723+ with Postgres persisted to a DSM shared folder, no host-port exposure, an auto-pulling Watchtower scoped to BioGravity images only, and a healthcheck-gated startup order. Cloudflare Tunnel terminates TLS at the edge for `biogravity.example.com`. The operator runbook covers DSM Container Manager import, upgrades, rollback via `IMAGE_TAG`, and six named failure modes.
