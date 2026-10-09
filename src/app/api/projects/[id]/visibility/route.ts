import { NextRequest, NextResponse } from "next/server"
import prisma from "@/lib/prisma"
import { randomBytes } from "crypto"
import { authorizeProjectAccess } from "@/lib/roles"
import { logError } from "@/lib/logger"
import { jsonError } from "@/lib/api-errors"

interface RouteParams {
    params: Promise<{
        id: string
    }>
}

export async function PATCH(req: NextRequest, { params }: RouteParams) {
    try {
        const { id: projectId } = await params

        const access = await authorizeProjectAccess(projectId, "Admin")
        if (!access.ok) return access.response

        const body = await req.json()
        const { project } = access.access

        const updates: { visibility?: string; shareToken?: string } = {}

        if (body.visibility) {
            updates.visibility = body.visibility

            if (body.visibility === "Public" && !project.shareToken) {
                updates.shareToken = randomBytes(32).toString('base64url')
            }
        }

        if (body.regenerateToken) {
            updates.shareToken = randomBytes(32).toString('base64url')
        }

        const updatedProject = await prisma.project.update({
            where: { id: projectId },
            data: updates
        })

        return NextResponse.json({
            visibility: updatedProject.visibility,
            shareToken: updatedProject.shareToken
        })
    } catch (error) {
        logError({ action: "project.visibility" }, error)
        return jsonError(500, "Failed to update visibility")
    }
}
