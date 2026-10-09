import { NextResponse } from "next/server"
import prisma from "@/lib/prisma"
import { z } from "zod"
import { authorizeProjectAccess } from "@/lib/roles"
import { logError } from "@/lib/logger"
import { jsonError } from "@/lib/api-errors"
import {
    parseElementTypes,
    parseRelationshipTypes,
    type ElementType,
    type RelationshipType,
} from "@/lib/schemas/project-types"

const schemaAddSchema = z.object({
    projectId: z.string(),
    name: z.string().min(1, "Name is required"),
    color: z.string().optional(),
    schemaType: z.enum(["element", "relationship"]),
    strength: z.number().optional(),
})

const schemaUpdateSchema = z.object({
    projectId: z.string(),
    typeName: z.string().min(1, "Type name is required"),
    newName: z.string().optional(),
    schemaType: z.enum(["element", "relationship"]),
    color: z.string().optional(),
    strength: z.number().optional(),
})

const schemaDeleteSchema = z.object({
    projectId: z.string(),
    typeName: z.string().min(1, "Type name is required"),
    schemaType: z.enum(["element", "relationship"]),
})

type SchemaTypeEntry = ElementType | RelationshipType

export async function POST(req: Request) {
    try {
        const body = await req.json()
        const { projectId, name, color, schemaType, strength } = schemaAddSchema.parse(body)

        const access = await authorizeProjectAccess(projectId, "Editor")
        if (!access.ok) return access.response
        const { project } = access.access

        const targetField = schemaType === 'element' ? 'elementTypes' : 'relationshipTypes'
        const currentTypes: SchemaTypeEntry[] = schemaType === 'element'
            ? parseElementTypes(project.elementTypes)
            : parseRelationshipTypes(project.relationshipTypes)

        if (currentTypes.some(t => t.name === name)) {
            return NextResponse.json({ error: "Type already exists" }, { status: 409 })
        }

        const newType: SchemaTypeEntry = {
            name,
            color: color || "#cccccc",
            ...(schemaType === 'relationship' && strength !== undefined && { strength }),
        }
        const updatedTypes = [...currentTypes, newType]

        await prisma.project.update({
            where: { id: projectId },
            data: { [targetField]: updatedTypes }
        })

        return NextResponse.json({ message: "Schema updated", type: newType }, { status: 200 })
    } catch (error) {
        if (error instanceof z.ZodError) {
            const first = error.issues[0]?.message ?? "Invalid request"
            return jsonError(400, first)
        }
        logError({ action: "project.schema.add" }, error)
        return jsonError(500, "Error updating schema")
    }
}

export async function PUT(req: Request) {
    try {
        const body = await req.json()
        const { projectId, typeName, newName, schemaType, color, strength } = schemaUpdateSchema.parse(body)

        const access = await authorizeProjectAccess(projectId, "Editor")
        if (!access.ok) return access.response
        const { project } = access.access

        const targetField = schemaType === 'element' ? 'elementTypes' : 'relationshipTypes'
        const currentTypes: SchemaTypeEntry[] = schemaType === 'element'
            ? parseElementTypes(project.elementTypes)
            : parseRelationshipTypes(project.relationshipTypes)

        const typeIndex = currentTypes.findIndex(t => t.name === typeName)
        if (typeIndex === -1) {
            return NextResponse.json({ error: "Type not found" }, { status: 404 })
        }

        if (newName && newName !== typeName) {
            if (currentTypes.some(t => t.name === newName)) {
                return NextResponse.json({ error: "Target type name already exists" }, { status: 409 })
            }
        }

        const finalName = newName || typeName
        const existing = currentTypes[typeIndex]!

        const updatedType: SchemaTypeEntry = {
            name: finalName,
            color: color ?? existing.color,
            ...(schemaType === 'relationship' && strength !== undefined && { strength }),
        }
        currentTypes[typeIndex] = updatedType

        await prisma.$transaction(async (tx) => {
            await tx.project.update({
                where: { id: projectId },
                data: { [targetField]: currentTypes }
            })

            if (newName && newName !== typeName) {
                if (schemaType === 'element') {
                    await tx.element.updateMany({
                        where: { projectId, type: typeName },
                        data: { type: newName }
                    })
                } else {
                    await tx.relationship.updateMany({
                        where: { projectId, type: typeName },
                        data: { type: newName }
                    })
                }
            }
        })

        return NextResponse.json({ message: "Type updated", type: updatedType }, { status: 200 })
    } catch (error) {
        if (error instanceof z.ZodError) {
            const first = error.issues[0]?.message ?? "Invalid request"
            return jsonError(400, first)
        }
        logError({ action: "project.schema.update" }, error)
        return jsonError(500, "Error updating type")
    }
}

export async function DELETE(req: Request) {
    try {
        const body = await req.json()
        const { projectId, typeName, schemaType } = schemaDeleteSchema.parse(body)

        const access = await authorizeProjectAccess(projectId, "Editor")
        if (!access.ok) return access.response
        const { project } = access.access

        const targetField = schemaType === 'element' ? 'elementTypes' : 'relationshipTypes'
        const currentTypes: SchemaTypeEntry[] = schemaType === 'element'
            ? parseElementTypes(project.elementTypes)
            : parseRelationshipTypes(project.relationshipTypes)

        const filteredTypes = currentTypes.filter(t => t.name !== typeName)

        if (filteredTypes.length === currentTypes.length) {
            return NextResponse.json({ error: "Type not found" }, { status: 404 })
        }

        await prisma.project.update({
            where: { id: projectId },
            data: { [targetField]: filteredTypes }
        })

        return NextResponse.json({ message: "Type deleted" }, { status: 200 })
    } catch (error) {
        if (error instanceof z.ZodError) {
            const first = error.issues[0]?.message ?? "Invalid request"
            return jsonError(400, first)
        }
        logError({ action: "project.schema.delete" }, error)
        return jsonError(500, "Error deleting type")
    }
}
