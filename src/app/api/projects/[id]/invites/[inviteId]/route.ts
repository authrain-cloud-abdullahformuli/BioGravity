import { NextResponse } from "next/server"
import prisma from "@/lib/prisma"
import { authorizeProjectAccess } from "@/lib/roles"

interface RouteParams {
    params: Promise<{ id: string; inviteId: string }>
}

export async function DELETE(_req: Request, { params }: RouteParams) {
    const { id: projectId, inviteId } = await params

    try {
        const access = await authorizeProjectAccess(projectId, "Admin")
        if (!access.ok) return access.response

        const invite = await prisma.projectInvite.findUnique({ where: { id: inviteId } })
        if (!invite || invite.projectId !== projectId) {
            return NextResponse.json({ error: "Invite not found" }, { status: 404 })
        }

        if (!invite.revokedAt) {
            await prisma.projectInvite.update({
                where: { id: inviteId },
                data: { revokedAt: new Date() },
            })
        }

        console.info(JSON.stringify({
            action: "invite.revoke",
            inviteId,
            projectId,
            actorUserId: access.access.userId,
            outcome: "ok",
        }))

        return NextResponse.json({ message: "Invite revoked" })
    } catch (error) {
        console.error(JSON.stringify({ action: "invite.revoke", outcome: "error", error: String(error) }))
        return NextResponse.json({ error: "Internal Server Error" }, { status: 500 })
    }
}
