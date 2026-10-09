#!/usr/bin/env node
/**
 * Demo seeder — stands up a predictable BioGravity instance for screenshots,
 * screencasts and first-run demos.
 *
 * Creates (or refreshes) two accounts and two fully-populated projects:
 *
 *   - a curator account that OWNS both projects (owners are auto-Admin, so this
 *     is the login to use for recording edit flows). Keep its password private.
 *   - a demo account added to both projects as a Viewer. Safe to advertise
 *     publicly: the role model blocks every project write, and setting
 *     DEMO_READONLY_EMAIL to the same address blocks the two account-level
 *     actions that sit outside it (see src/lib/demo-mode.ts).
 *
 * Re-running wipes both accounts' projects and rebuilds them, so every
 * recording take starts from an identical state.
 *
 * Deliberately plain `.mjs` with no TypeScript and no dependencies beyond
 * `@prisma/client` + `bcryptjs`: this has to run *inside* the production image,
 * where `src/` is not present but `prisma/` and `node_modules/` are.
 *
 *   DATABASE_URL=postgresql://... node prisma/seed.mjs
 *
 * Env overrides: DEMO_EMAIL, DEMO_PASSWORD, DEMO_NAME,
 *                DEMO_OWNER_EMAIL, DEMO_OWNER_PASSWORD, DEMO_OWNER_NAME.
 */
import { PrismaClient } from "@prisma/client"
import { hash } from "bcryptjs"
import { randomUUID } from "node:crypto"
import { readFileSync } from "node:fs"
import { dirname, join } from "node:path"
import { fileURLToPath } from "node:url"

const here = dirname(fileURLToPath(import.meta.url))
const dataset = (name) =>
    JSON.parse(readFileSync(join(here, "demo", `${name}.json`), "utf8"))

// Shared, publicly-advertised login. Viewer on both projects.
const DEMO_EMAIL = process.env.DEMO_EMAIL || "demo@example.com"
const DEMO_PASSWORD = process.env.DEMO_PASSWORD || "biogravity-demo"
const DEMO_NAME = process.env.DEMO_NAME || "Demo User"

// Owns both projects, so it is Admin on them. Not for sharing.
const OWNER_EMAIL = process.env.DEMO_OWNER_EMAIL || "curator@example.com"
const OWNER_PASSWORD = process.env.DEMO_OWNER_PASSWORD || "biogravity-curator"
const OWNER_NAME = process.env.DEMO_OWNER_NAME || "Demo Curator"

// The in-app Seed button paints every type the same colour, which makes for a
// flat-looking graph. A demo instance exists to be filmed, so give each type a
// distinct colour and let the legend earn its place on screen.
const ELEMENT_COLORS = {
    Person: "#3b82f6",
    Pet: "#f59e0b",
    Executive: "#8b5cf6",
    Management: "#14b8a6",
    Engineering: "#3b82f6",
    "Data Science": "#ec4899",
    Product: "#f59e0b",
}

const RELATIONSHIP_COLORS = {
    Parent: "#64748b",
    Spouse: "#ec4899",
    Owner: "#22c55e",
    Pet: "#22c55e",
    Reports_To: "#64748b",
}

// Any type not named above still gets a stable, distinct colour.
const FALLBACK = ["#3b82f6", "#f59e0b", "#8b5cf6", "#14b8a6", "#ec4899", "#22c55e", "#ef4444"]

const palette = (names, table) =>
    names.map((name, i) => ({ name, color: table[name] ?? FALLBACK[i % FALLBACK.length] }))

const distinct = (values) => [...new Set(values)]

const PROJECTS = [
    {
        name: "Modern Family",
        type: "Family",
        description:
            "Three generations of the Pritchett-Dunphy-Tucker family, plus the pets. A dense, highly interconnected graph — good for showing focus mode and degrees of separation.",
        // Public so the read-only share link and embed flow can be demonstrated.
        visibility: "Public",
        data: dataset("modern-family"),
    },
    {
        name: "Acme Corporation",
        type: "Organization",
        description:
            "A flat-to-mid-size org chart running from the CEO down to tech leads. Mostly a tree — good for showing generational layout and the hierarchy view.",
        visibility: "Private",
        data: dataset("organization"),
    },
]

async function createProject(prisma, ownerId, viewerId, spec) {
    const { data } = spec

    const project = await prisma.project.create({
        data: {
            name: spec.name,
            description: spec.description,
            type: spec.type,
            ownerId,
            visibility: spec.visibility,
            shareToken: spec.visibility === "Public" ? randomUUID() : null,
            elementTypes: palette(distinct(data.elements.map((e) => e.type)), ELEMENT_COLORS),
            relationshipTypes: palette(
                distinct(data.relationships.map((r) => r.type)),
                RELATIONSHIP_COLORS
            ),
            // The demo account is a member, never the owner — `getProjectRole()`
            // promotes owners to Admin, which would make it writable.
            members: { create: { userId: viewerId, role: "Viewer" } },
        },
    })

    // Dataset ids are human-readable slugs ("jay", "gloria"); the database wants
    // its own. Map slug -> generated id so relationships can be wired up.
    const idFor = new Map()
    const elements = data.elements.map((element) => {
        const id = randomUUID()
        idFor.set(element.id, id)
        return {
            id,
            projectId: project.id,
            name: element.name,
            type: element.type,
            description: element.description,
        }
    })

    const relationships = data.relationships
        .map((rel) => {
            const fromId = idFor.get(rel.fromId)
            const toId = idFor.get(rel.toId)
            return fromId && toId ? { projectId: project.id, fromId, toId, type: rel.type } : null
        })
        .filter(Boolean)

    const dropped = data.relationships.length - relationships.length
    if (dropped > 0) {
        console.warn(`  ! ${dropped} relationship(s) skipped — endpoint not found in dataset`)
    }

    await prisma.element.createMany({ data: elements })
    await prisma.relationship.createMany({ data: relationships })

    console.log(
        `  ✓ ${spec.name} — ${elements.length} elements, ${relationships.length} relationships` +
            (project.shareToken ? `\n      public link: /public/${project.shareToken}` : "")
    )
}

async function upsertUser(prisma, email, name, plainPassword) {
    const password = await hash(plainPassword, 12)
    return prisma.user.upsert({
        where: { email },
        update: { name, password },
        create: { email, name, password },
    })
}

async function main() {
    const prisma = new PrismaClient()
    try {
        const owner = await upsertUser(prisma, OWNER_EMAIL, OWNER_NAME, OWNER_PASSWORD)
        const demo = await upsertUser(prisma, DEMO_EMAIL, DEMO_NAME, DEMO_PASSWORD)

        // Full reset. Includes projects owned by the demo account itself, so a
        // database seeded by an earlier version (where demo was the owner, and
        // therefore Admin) is corrected rather than left writable.
        const { count } = await prisma.project.deleteMany({
            where: { ownerId: { in: [owner.id, demo.id] } },
        })
        if (count > 0) console.log(`Removed ${count} existing demo project(s).`)

        console.log(`Seeding projects owned by ${OWNER_EMAIL}`)
        for (const spec of PROJECTS) {
            await createProject(prisma, owner.id, demo.id, spec)
        }

        console.log(
            `\nDone.` +
                `\n  Read-only (share this):  ${DEMO_EMAIL} / ${DEMO_PASSWORD}` +
                `\n  Owner    (keep private): ${OWNER_EMAIL} / ${OWNER_PASSWORD}` +
                `\n\nSet DEMO_READONLY_EMAIL=${DEMO_EMAIL} on the app container to also block` +
                `\nprofile edits and project creation for the shared account.`
        )
    } finally {
        await prisma.$disconnect()
    }
}

main().catch((error) => {
    console.error("Seed failed:", error)
    process.exit(1)
})
