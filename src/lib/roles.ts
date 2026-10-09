import type { NextResponse } from "next/server"
import { getServerSession } from "next-auth"
import type { Project, ProjectMember } from "@prisma/client"
import { authOptions } from "@/lib/auth"
import prisma from "@/lib/prisma"
import { jsonError } from "@/lib/api-errors"

export type ProjectRole = "Viewer" | "Editor" | "Admin"

const ROLE_RANK: Record<ProjectRole, number> = {
    Viewer: 1,
    Editor: 2,
    Admin: 3,
}

export type ProjectWithSelfMembership = Project & { members: ProjectMember[] }

export interface ProjectAccess {
    userId: string
    role: ProjectRole
    isOwner: boolean
    project: ProjectWithSelfMembership
}

export type AuthorizeResult =
    | { ok: true; access: ProjectAccess }
    | { ok: false; response: NextResponse }

/**
 * Single source of truth for project authorization.
 * Loads the project plus *only* the requesting user's membership row (avoids fan-out),
 * treats the owner as Admin, and short-circuits to a ready-to-return NextResponse on failure.
 */
export async function authorizeProjectAccess(
    projectId: string,
    minimumRole: ProjectRole
): Promise<AuthorizeResult> {
    const session = await getServerSession(authOptions)

    if (!session?.user?.id) {
        return { ok: false, response: jsonError(401, "Unauthorized") }
    }

    const userId = session.user.id

    const project = await prisma.project.findUnique({
        where: { id: projectId },
        include: { members: { where: { userId } } },
    })

    if (!project) {
        return { ok: false, response: jsonError(404, "Project not found") }
    }

    const isOwner = project.ownerId === userId
    const membershipRole = project.members[0]?.role as ProjectRole | undefined

    if (!isOwner && !membershipRole) {
        return { ok: false, response: jsonError(403, "Forbidden") }
    }

    const role: ProjectRole = isOwner ? "Admin" : membershipRole!

    if (ROLE_RANK[role] < ROLE_RANK[minimumRole]) {
        return { ok: false, response: jsonError(403, `Requires ${minimumRole} role or higher`) }
    }

    return { ok: true, access: { userId, role, isOwner, project } }
}

export function canEdit(role: ProjectRole | null): boolean {
    return role === "Editor" || role === "Admin"
}

export function isAdmin(role: ProjectRole | null): boolean {
    return role === "Admin"
}
