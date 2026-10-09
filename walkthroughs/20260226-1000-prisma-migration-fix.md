# Walkthrough: Resolve Prisma Migration Error on NAS

## Problem Description

After deploying to the NAS, the application was failing during login with the error: `The table public.User does not exist`. This was caused by:

1. Missing Prisma migrations in the production environment.
2. A version mismatch where `npx` incorrectly downloaded Prisma v7 (defaulting to latest), which is incompatible with the current project configuration (v5.13.0).

## Changes Made

### 1. Prisma Migration Initialization

- Manually generated the initial migration: [migration.sql](../prisma/migrations/0_init/migration.sql).
- Synchronized the database and marked the migration as applied.

### 2. Docker Configuration

- **Global Install**: Updated [Dockerfile](../Dockerfile) to install `prisma@5.13.0` globally in the runner stage. This ensures the correct version is always used and prevents runtime downloads.
- **Entrypoint**: Created [docker-entrypoint.sh](../docker-entrypoint.sh) to run `prisma migrate deploy` automatically before starting the Next.js server.
- **Permissions**: Ensured correct ownership of the `prisma` directory for the `nextjs` user.

## Verification Results

- **Migration Status**: Confirmed that the database schema is up to date with `npx prisma migrate status`.
- **Version Pinning**: The production image now has the correct Prisma CLI (v5.13.0) baked in.

## Proof of Work

The migration status check passed:

```bash
npx prisma migrate status
# Output: Database schema is up to date!
```
