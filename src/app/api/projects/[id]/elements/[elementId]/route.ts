import { NextResponse } from "next/server"
import { z } from "zod"
import prisma from "@/lib/prisma"
import { authorizeProjectAccess } from "@/lib/roles"
import { logError } from "@/lib/logger"
import { jsonError } from "@/lib/api-errors"
import { recordChange } from "@/lib/changelog"

interface RouteParams {
    params: Promise<{
        id: string
        elementId: string
    }>
}

const updateElementSchema = z.object({
    name: z.string().min(1).max(500).optional(),
    type: z.string().min(1).max(200).optional(),
    description: z.string().max(5000).optional().nullable(),
    dateOfBirth: z.string().optional().nullable(),
    imageUrl: z
        .string()
        .max(2048)
        .refine(
            (val) => {
                if (!val) return true
                try {
                    const u = new URL(val)
                    return u.protocol === "https:" || u.protocol === "data:"
                } catch {
                    return false
                }
            },
            { message: "imageUrl must be an https:// or data: URL" }
        )
        .optional()
        .nullable(),
    pinned: z.boolean().optional(),
    positionX: z.number().optional(),
    positionY: z.number().optional(),
    positionZ: z.number().optional(),
})

export async function DELETE(_req: Request, { params }: RouteParams) {
    const { id: projectId, elementId } = await params

    try {
        const access = await authorizeProjectAccess(projectId, "Editor")
        if (!access.ok) return access.response

        const element = await prisma.element.findUnique({ where: { id: elementId } })

        if (!element || element.projectId !== projectId) {
            return NextResponse.json({ error: "Element not found" }, { status: 404 })
        }

        // Capture related relationships before cascade-delete so the changelog can restore them.
        const relatedRelationships = await prisma.relationship.findMany({
            where: {
                projectId,
                OR: [{ fromId: elementId }, { toId: elementId }],
            },
        })

        await prisma.element.delete({ where: { id: elementId } })

        await recordChange({
            projectId,
            userId: access.access.userId,
            action: 'DELETE',
            entityType: 'Element',
            entityId: elementId,
            entityName: element.name,
            previousState: { element, relationships: relatedRelationships },
        })

        return NextResponse.json({ message: "Element deleted" }, { status: 200 })
    } catch (error) {
        logError({ action: "element.delete", projectId, elementId }, error)
        return jsonError(500, "Internal Server Error")
    }
}

export async function PATCH(req: Request, { params }: RouteParams) {
    const { id: projectId, elementId } = await params

    try {
        const access = await authorizeProjectAccess(projectId, "Editor")
        if (!access.ok) return access.response

        const body = await req.json()
        const parsed = updateElementSchema.safeParse(body)
        if (!parsed.success) {
            return NextResponse.json(
                { error: parsed.error.issues[0]?.message ?? "Invalid request" },
                { status: 400 }
            )
        }
        const { name, type, description, dateOfBirth, imageUrl, pinned, positionX, positionY, positionZ } = parsed.data

        const currentElement = await prisma.element.findUnique({ where: { id: elementId } })

        if (!currentElement || currentElement.projectId !== projectId) {
            return NextResponse.json({ error: "Element not found" }, { status: 404 })
        }

        const updatedElement = await prisma.element.update({
            where: { id: elementId },
            data: {
                name,
                type,
                description,
                ...(dateOfBirth !== undefined && { dateOfBirth: dateOfBirth ? new Date(dateOfBirth) : null }),
                ...(imageUrl !== undefined && { imageUrl }),
                ...(pinned !== undefined && { pinned }),
                ...(positionX !== undefined && { positionX }),
                ...(positionY !== undefined && { positionY }),
                ...(positionZ !== undefined && { positionZ }),
            }
        })

        await recordChange({
            projectId,
            userId: access.access.userId,
            action: 'UPDATE',
            entityType: 'Element',
            entityId: elementId,
            entityName: updatedElement.name,
            previousState: currentElement,
            newState: updatedElement,
        })

        return NextResponse.json({ message: "Element updated", element: updatedElement }, { status: 200 })
    } catch (error) {
        logError({ action: "element.update", projectId, elementId }, error)
        return jsonError(500, "Internal Server Error")
    }
}
