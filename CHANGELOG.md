# Changelog

## [Unreleased]

### Added

- CC-11: Insights panel is now reachable from the graph view via a new BarChart3 toggle in the navigation cluster; the panel renders network analytics (totals, average degree, density, most-connected nodes, type distribution, selected-node degree) without obscuring controls.
- CC-12: Physics controls are now reachable from the graph view via a SlidersHorizontal toggle that opens a right-side drawer with sliders for cluster attraction, link strength, repulsion, link distance, generational strength, and a Reset button. Session-scoped, not per-project persisted.
- CC-13: Project Owners and Admins can invite collaborators by email even when the invitee has no account yet; a secure 7-day single-use invite link lets the recipient register or sign in and join the project with the intended role. Existing-user invites preserved.
- CC-15: Invitations now send as transactional email via Resend (EU region) with React Email + plain-text fallback. Pending-invitation rows surface delivery state (Sent / Failed / Not sent) and a Send button to redeliver using the same token. Copy-link remains the fallback when Resend is unconfigured or the API call errors.
- CC-16: GitHub Actions workflow publishes the Docker image to GHCR (`ghcr.io/authrain-cloud-abdullahformuli/biogravity-portfolio`) on every push to `main` (`:latest` + `:sha-<7>`) and on `v*` tags (`:vX.Y.Z`). A `docker-compose.prod.yml` overlay deploys the published image to a Synology DS723+ with Postgres bind-mounted to a DSM shared folder, an `app` healthcheck-gated start, no host-port exposure, and an optional Watchtower service (label-scoped to BioGravity) that auto-pulls new images every 5 minutes. Operator runbook covers DSM Container Manager import, upgrade, and rollback procedures. Cloudflare Tunnel terminates TLS at the edge for `biogravity.example.com`.

### Changed

- CC-14: Story Mode is formally classified as Deferred for the public release. `features/app-requirements.md` now points at the canonical out-of-scope record; a reserved `EPIC-STM` epic block keeps the ID stable for a future un-defer.
- Docker: `.dockerignore` excludes `.env*`, `node_modules`, `.next`, `.git`, `wip`, and build/IDE artifacts from the build context. `docker-compose.yml` now forwards `RESEND_API_KEY` and `RESEND_FROM` from the host `.env` to the app container via Compose interpolation.
- Default host port for the `app` container moved from `3010` to `3020` (both dev `docker-compose.yml` and prod `docker-compose.prod.yml` defaults). Resolves a port conflict on the target Synology DS723+ where `3010` was already in use. `APP_PORT` env can still override.

### Fixed

- CC-5: Restored the release lint gate by clearing ESLint errors and warnings while preserving the app's dynamic graph/API typing surfaces.
- CC-6: Restored production build completion by using the webpack build path, local font fallbacks, and a non-standalone Docker runtime.
- CC-7: Added rollback and user-facing error handling for failed optimistic graph edit mutations.
- CC-8: Persisted graph node pin state and coordinates through the element update API.
- CC-9: Allowed project Admin members to access and manage project settings consistently with the project UI.
- CC-10: Honored the selected project type during creation and applied the matching default schemas.
