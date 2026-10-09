# EPIC-NFR — Non-Functional — User Stories

### STORY-NFR-001 — One-command Docker boot
**Feature:** FEAT-NFR-001 | **Role:** Engineer | **Priority:** P0
**Code:** `Dockerfile`, `docker-compose.yml`, `docker-entrypoint.sh`
**Story:** As an engineer, I want `docker compose up --build` to spin up Postgres + the Next.js app, so that I can run BioGravity locally without manual env wiring.
**AC:**
- App listens on `:3020`.
- Postgres listens on `:5433` (host).
- `docker-entrypoint.sh` runs Prisma migrations on container start.
**Audit:** —.

### STORY-NFR-002 — Prisma multi-arch binaries
**Feature:** FEAT-NFR-002 | **Role:** Engineer | **Priority:** P0
**Code:** `prisma/schema.prisma:1-4`
**Story:** As an engineer running on Apple Silicon and as CI running on linux-musl, I want Prisma binaries available for both, so that builds don't fail with "engine not found".
**AC:** `binaryTargets = ["native", "linux-musl", "linux-musl-openssl-3.0.x", "linux-musl-arm64-openssl-3.0.x"]`.
**Audit:** —.

### STORY-NFR-003 — WebGPU polyfill for Three.js
**Feature:** FEAT-NFR-003 | **Role:** End-user | **Priority:** P1
**Code:** `src/lib/webgpu-polyfill.ts`
**Story:** As a user on a browser without WebGPU, I want the graph to still render via WebGL.
**AC:** Polyfill loaded before Three.js modules expecting WebGPU; renders fall back without crash.
**Audit:** —.

### STORY-NFR-004 — Vitest unit + API tests
**Feature:** FEAT-NFR-004 | **Role:** Engineer | **Priority:** P1
**Code:** `vitest.config.mts`, `src/tests/api/seed.test.ts`, `src/tests/api/gedcom-import.test.ts`
**Story:** As an engineer, I want CI-ready tests for the seed and GEDCOM flows.
**AC:** `npm test` runs Vitest; both spec files pass green on `main`.
**Audit:** —.

### STORY-NFR-005 — ESLint + TypeScript strict config
**Feature:** FEAT-NFR-005 | **Role:** Engineer | **Priority:** P1
**Code:** `eslint.config.mjs`, `tsconfig.json`
**Story:** As an engineer, I want lint + type checks wired up so that I catch issues before runtime.
**AC:** `npm run lint` passes on `main`; `tsc --noEmit` passes.
**Audit:** —.

### STORY-NFR-006 — shadcn/ui + Tailwind component baseline
**Feature:** FEAT-NFR-006 | **Role:** Engineer / Designer | **Priority:** P1
**Code:** `components.json`, `src/components/ui/*`, `postcss.config.mjs`
**Story:** As an engineer, I want a consistent component library + design tokens so that I don't reinvent buttons, dialogs, tooltips, etc.
**AC:**
- `components.json` configured for shadcn.
- Core primitives present: button, dialog, dropdown-menu, select, tabs, tooltip, popover, scroll-area, sheet, slider, table, badge, card, alert, alert-dialog, switch, checkbox, command, avatar, input, textarea, label, separator.
**Audit:** —.

### STORY-NFR-007 — CI publishes Docker image to GHCR on push to main (CC-16)
**Feature:** FEAT-NFR-007 | **Role:** Engineer | **Priority:** P1
**Code:** `.github/workflows/build-and-push.yml`
**Story:** As an engineer, I want every push to `main` to automatically build the Dockerfile and publish the image to `ghcr.io/authrain-cloud-abdullahformuli/biogravity-portfolio`, so that deployments do not require a local build step.
**AC:**
- Given a push to `main`, When the workflow runs, Then it builds `linux/amd64` and pushes tags `:latest` and `:sha-<7>` to GHCR.
- Given a `git push` of a `v*` tag, Then the workflow additionally pushes `:vX.Y.Z`.
- Given a manual `workflow_dispatch` run, Then the image builds against whatever ref is selected.
- Given the workflow uses `${{ secrets.GITHUB_TOKEN }}` with `packages: write`, Then no PAT is required.
- Layer cache via `type=gha` brings warm builds under 90s.
**Negative:**
- Given a Dockerfile syntax error, Then the workflow fails red and no image is published.
- Given a CI cancel after publish, Then any partially pushed manifest is overwritten by the next run (Docker push is idempotent per tag).
**Audit:** No (CI emits its own workflow logs to GitHub).

### STORY-NFR-008 — Production deployment on Synology DS723+ via Compose + Watchtower (CC-16)
**Feature:** FEAT-NFR-008 | **Role:** Operator | **Priority:** P1
**Code:** `docker-compose.prod.yml`, `.env.prod.example`, deployment runbook in `README.md`
**Story:** As the operator, I want a Compose overlay that pulls the GHCR image, persists Postgres to a DSM shared folder, exposes only loopback for Cloudflare Tunnel ingress, and auto-pulls new images via Watchtower, so that deploys do not require an SSH session.
**AC:**
- Given `.env.prod` is populated from `.env.prod.example`, When the operator runs `docker compose -f docker-compose.yml -f docker-compose.prod.yml --env-file .env.prod up -d`, Then both services come up healthy.
- Given the `postgres` service has a `pg_isready` healthcheck, Then `app` only starts once the DB is ready (`depends_on.condition: service_healthy`).
- Given Cloudflare Tunnel maps `biogravity.example.com` to `localhost:${APP_PORT:-3020}`, Then the landing page renders over HTTPS.
- Given a new image is published to GHCR `:latest`, Then Watchtower (scoped via `WATCHTOWER_LABEL_ENABLE=true`) recreates only the `app` container within ≤5 minutes.
- Given the operator wants to roll back, Then setting `IMAGE_TAG=sha-XXXXXXX` in `.env.prod` and re-running `up -d` pulls the pinned older image.
- `POSTGRES_PASSWORD` rotation has a documented `ALTER USER` procedure because Postgres only honours the env on first-init.
**Negative:**
- Given the Postgres data dir has wrong ownership, Then the postgres container fails its healthcheck and `app` does not start; runbook documents `chown -R 999:999`.
- Given the GHCR image is private and the NAS is unauthenticated, Then `docker compose pull` returns 401; runbook documents `docker login ghcr.io`.
**Audit:** No (DSM Container Manager + Cloudflare Tunnel logs cover the operational trail).
