import { NextResponse } from "next/server"
import prisma from "@/lib/prisma"
import { MODERN_FAMILY_DATA } from "@/lib/data/modern-family"
import { ORGANIZATION_DATA } from "@/lib/data/organization"
import { randomUUID } from "crypto"
import { Prisma } from "@prisma/client"
import { authorizeProjectAccess } from "@/lib/roles"
import { logError } from "@/lib/logger"
import { jsonError } from "@/lib/api-errors"
import type { ElementType, RelationshipType } from "@/lib/schemas/project-types"

interface SeedData {
    elements: { id: string; name: string; type: string; description?: string }[]
    relationships: { fromId: string; toId: string; type: string }[]
}

interface RouteParams {
    params: Promise<{
        id: string
    }>
}

async function seedFromData(projectId: string, data: SeedData) {
    const elementIdMap = new Map<string, string>()

    const elementTypes: ElementType[] = Array.from(new Set(data.elements.map(e => e.type))).map(type => ({
        name: type,
        color: "#3b82f6",
    }))

    const relationshipTypes: RelationshipType[] = Array.from(new Set(data.relationships.map(r => r.type))).map(type => ({
        name: type,
        color: "#6b7280",
    }))

    const elementsData = data.elements.map((item) => {
        const dbId = randomUUID()
        elementIdMap.set(item.id, dbId)
        return {
            id: dbId,
            projectId,
            name: item.name,
            type: item.type,
            description: item.description,
        }
    })

    const relationshipsData = data.relationships
        .map((rel) => {
            const fromId = elementIdMap.get(rel.fromId)
            const toId = elementIdMap.get(rel.toId)
            if (fromId && toId) {
                return { projectId, fromId, toId, type: rel.type }
            }
            return null
        })
        .filter((r): r is { projectId: string; fromId: string; toId: string; type: string } => r !== null)

    await prisma.$transaction(async (tx) => {
        await tx.project.update({
            where: { id: projectId },
            data: {
                elementTypes: elementTypes as unknown as Prisma.InputJsonValue,
                relationshipTypes: relationshipTypes as unknown as Prisma.InputJsonValue,
            }
        })

        if (elementsData.length > 0) {
            await tx.element.createMany({ data: elementsData })
        }

        if (relationshipsData.length > 0) {
            await tx.relationship.createMany({ data: relationshipsData })
        }
    })

    return elementsData.length
}

export async function POST(_req: Request, { params }: RouteParams) {
    const { id: projectId } = await params

    try {
        // Seeding can rewrite the schema and overwrite data — restrict to Admin/Owner.
        const access = await authorizeProjectAccess(projectId, "Admin")
        if (!access.ok) return access.response
        const { project } = access.access

        if (project.type === "Family") {
            const count = await seedFromData(projectId, MODERN_FAMILY_DATA)
            return NextResponse.json({ message: "Seeded Modern Family data successfully", count }, { status: 201 })
        }

        if (project.type === "Organization") {
            const count = await seedFromData(projectId, ORGANIZATION_DATA)
            return NextResponse.json({ message: "Seeded Organization data successfully", count }, { status: 201 })
        }

        // Default Random Generation for other types
        const types: readonly string[] = ["Person", "Event", "Location"]
        const elementsData: Prisma.ElementCreateManyInput[] = []

        for (let i = 0; i < 15; i++) {
            const type = types[Math.floor(Math.random() * types.length)] ?? "Person"
            elementsData.push({
                id: randomUUID(),
                projectId,
                name: `${type} ${i + 1}`,
                type,
                description: `This is a sample ${type}.`,
            })
        }

        const relationshipsData: Prisma.RelationshipCreateManyInput[] = []
        for (let i = 0; i < 20; i++) {
            const source = elementsData[Math.floor(Math.random() * elementsData.length)]
            const target = elementsData[Math.floor(Math.random() * elementsData.length)]
            if (!source || !target || source.id === target.id) continue

            relationshipsData.push({
                projectId,
                fromId: source.id as string,
                toId: target.id as string,
                type: "Connects_To",
            })
        }

        await prisma.$transaction(async (tx) => {
            if (elementsData.length > 0) {
                await tx.element.createMany({ data: elementsData })
            }
            if (relationshipsData.length > 0) {
                await tx.relationship.createMany({ data: relationshipsData })
            }
        })


        return NextResponse.json({ message: "Seeded successfully", count: elementsData.length }, { status: 201 })

    } catch (error) {
        logError({ action: "project.seed", projectId }, error)
        return jsonError(500, "Internal Server Error")
    }
}

