import { NextResponse } from "next/server"
import prisma from "@/lib/prisma"
import { authorizeProjectAccess } from "@/lib/roles"
import { logError } from "@/lib/logger"
import { jsonError } from "@/lib/api-errors"

interface RouteParams {
    params: Promise<{
        id: string
    }>
}

export async function GET(_req: Request, { params }: RouteParams) {
    const { id: projectId } = await params

    try {
        const access = await authorizeProjectAccess(projectId, "Viewer")
        if (!access.ok) return access.response

        const elements = await prisma.element.findMany({
            where: { projectId },
            select: {
                id: true,
                name: true,
                type: true,
                description: true,
                dateOfBirth: true,
                imageUrl: true,
                pinned: true,
                positionX: true,
                positionY: true,
                positionZ: true,
            }
        })

        const relationships = await prisma.relationship.findMany({
            where: { projectId },
            select: { id: true, type: true, fromId: true, toId: true }
        })

        const links = relationships.map(r => ({
            id: r.id,
            type: r.type,
            source: r.fromId,
            target: r.toId,
        }))

        return NextResponse.json({
            elements,
            relationships: links,
            elementTypes: access.access.project.elementTypes,
            relationshipTypes: access.access.project.relationshipTypes,
        })
    } catch (error) {
        logError({ action: "project.graph.get", projectId }, error)
        return jsonError(500, "Internal Server Error")
    }
}
