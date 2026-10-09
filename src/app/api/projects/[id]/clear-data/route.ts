import { NextRequest, NextResponse } from "next/server"
import prisma from "@/lib/prisma"
import { authorizeProjectAccess } from "@/lib/roles"
import { logError } from "@/lib/logger"
import { jsonError } from "@/lib/api-errors"

interface RouteParams {
    params: Promise<{
        id: string
    }>
}

export async function DELETE(_req: NextRequest, { params }: RouteParams) {
    try {
        const { id: projectId } = await params

        const access = await authorizeProjectAccess(projectId, "Editor")
        if (!access.ok) return access.response

        await prisma.relationship.deleteMany({ where: { projectId } })
        await prisma.element.deleteMany({ where: { projectId } })

        return NextResponse.json({ message: "All project data cleared successfully" })
    } catch (error) {
        logError({ action: "project.clearData" }, error)
        return jsonError(500, "Failed to clear project data")
    }
}
