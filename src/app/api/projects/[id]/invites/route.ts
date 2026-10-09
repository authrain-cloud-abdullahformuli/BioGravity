import { NextResponse } from "next/server"
import prisma from "@/lib/prisma"
import { inviteStatus } from "@/lib/invites"
import { authorizeProjectAccess } from "@/lib/roles"

interface RouteParams {
    params: Promise<{ id: string }>
}

export async function GET(_req: Request, { params }: RouteParams) {
    const { id: projectId } = await params

    try {
        const access = await authorizeProjectAccess(projectId, "Viewer")
        if (!access.ok) return access.response

        const invites = await prisma.projectInvite.findMany({
            where: { projectId },
            orderBy: { createdAt: "desc" },
        })

        const visible = invites
            .filter(i => inviteStatus(i) === "pending")
            .map(i => ({
                id: i.id,
                email: i.email,
                role: i.role,
                expiresAt: i.expiresAt,
                createdAt: i.createdAt,
                lastSentAt: i.lastSentAt,
                sendFailureCount: i.sendFailureCount,
                lastSendError: i.lastSendError,
            }))

        return NextResponse.json({ invites: visible })
    } catch (error) {
        console.error(JSON.stringify({ action: "invites.list", outcome: "error", error: String(error) }))
        return NextResponse.json({ error: "Internal Server Error" }, { status: 500 })
    }
}
