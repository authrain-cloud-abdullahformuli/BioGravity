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

        const access = await authorizeProjectAccess(projectId, "Admin")
        if (!access.ok) return access.response

        await prisma.project.delete({ where: { id: projectId } })

        return NextResponse.json({ message: "Project deleted successfully" })
    } catch (error) {
        logError({ action: "project.delete" }, error)
        return jsonError(500, "Failed to delete project")
    }
}
