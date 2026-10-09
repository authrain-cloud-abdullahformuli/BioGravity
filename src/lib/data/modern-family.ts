// Canonical dataset lives in `prisma/demo/` so that both the app's Seed button
// and the standalone demo seeder (`prisma/seed.mjs`, which runs inside the
// production image where `src/` is absent) read the same file.
import data from "../../../prisma/demo/modern-family.json"

export const MODERN_FAMILY_DATA = data
