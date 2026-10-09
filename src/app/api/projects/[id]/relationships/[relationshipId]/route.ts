import { NextRequest, NextResponse } from "next/server"
import { z } from "zod"
import prisma from "@/lib/prisma"
import { authorizeProjectAccess } from "@/lib/roles"
import { logError } from "@/lib/logger"
import { jsonError } from "@/lib/api-errors"
import { recordChange } from "@/lib/changelog"

const updateRelationshipSchema = z.object({
    type: z.string().min(1).max(200),
})

interface RouteParams {
    params: Promise<{
        id: string
        relationshipId: string
    }>
}

export async function DELETE(_req: NextRequest, { params }: RouteParams) {
    const { id: projectId, relationshipId } = await params

    try {
        const access = await authorizeProjectAccess(projectId, "Editor")
        if (!access.ok) return access.response

        const relationship = await prisma.relationship.findUnique({ where: { id: relationshipId } })

        if (!relationship || relationship.projectId !== projectId) {
            return NextResponse.json({ error: "Relationship not found" }, { status: 404 })
        }

        await prisma.relationship.delete({ where: { id: relationshipId } })

        await recordChange({
            projectId,
            userId: access.access.userId,
            action: 'DELETE',
            entityType: 'Relationship',
            entityId: relationshipId,
            entityName: relationship.type,
            previousState: relationship,
        })

        return NextResponse.json({ message: "Relationship deleted" }, { status: 200 })
    } catch (error) {
        logError({ action: "relationship.delete", projectId, relationshipId }, error)
        return jsonError(500, "Internal Server Error")
    }
}

export async function PATCH(req: Request, { params }: RouteParams) {
    const { id: projectId, relationshipId } = await params

    try {
        const access = await authorizeProjectAccess(projectId, "Editor")
        if (!access.ok) return access.response

        const body = await req.json()
        const parsed = updateRelationshipSchema.safeParse(body)
        if (!parsed.success) {
            return NextResponse.json(
                { error: parsed.error.issues[0]?.message ?? "Invalid request" },
                { status: 400 }
            )
        }
        const { type } = parsed.data

        const currentRelationship = await prisma.relationship.findUnique({ where: { id: relationshipId } })

        if (!currentRelationship || currentRelationship.projectId !== projectId) {
            return NextResponse.json({ error: "Relationship not found" }, { status: 404 })
        }

        const updatedRelationship = await prisma.relationship.update({
            where: { id: relationshipId },
            data: { type }
        })

        await recordChange({
            projectId,
            userId: access.access.userId,
            action: 'UPDATE',
            entityType: 'Relationship',
            entityId: relationshipId,
            entityName: updatedRelationship.type,
            previousState: currentRelationship,
            newState: updatedRelationship,
        })

        return NextResponse.json({ message: "Relationship updated", relationship: updatedRelationship }, { status: 200 })
    } catch (error) {
        logError({ action: "relationship.update", projectId, relationshipId }, error)
        return jsonError(500, "Internal Server Error")
    }
}
