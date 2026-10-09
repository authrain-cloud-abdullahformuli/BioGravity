-- Closes drift between schema.prisma and the migration history: `attributes`
-- was added to both models in the schema but never captured in a migration, so
-- any database built purely from `prisma migrate deploy` was missing it and the
-- graph/public routes failed with P2022.
--
-- IF NOT EXISTS keeps this a no-op on databases where the column was already
-- introduced out-of-band (e.g. via `prisma db push`).

-- AlterTable
ALTER TABLE "Element" ADD COLUMN IF NOT EXISTS "attributes" JSONB;

-- AlterTable
ALTER TABLE "Relationship" ADD COLUMN IF NOT EXISTS "attributes" JSONB;
