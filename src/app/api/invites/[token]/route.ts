import { NextResponse } from "next/server"
import prisma from "@/lib/prisma"
import { inviteStatus } from "@/lib/invites"

interface RouteParams {
    params: Promise<{ token: string }>
}

export async function GET(_req: Request, { params }: RouteParams) {
    const { token } = await params

    try {
        const invite = await prisma.projectInvite.findUnique({
            where: { token },
            include: { project: { select: { id: true, name: true } } },
        })

        // Generic error — do not distinguish "missing" vs "expired" vs "revoked"
        // so attackers cannot enumerate valid tokens.
        if (!invite) {
            return NextResponse.json({ message: "Invalid or expired invite" }, { status: 404 })
        }

        const status = inviteStatus(invite)
        if (status !== "pending") {
            return NextResponse.json({ message: "Invalid or expired invite" }, { status: 404 })
        }

        return NextResponse.json({
            projectId: invite.project.id,
            projectName: invite.project.name,
            email: invite.email,
            role: invite.role,
            expiresAt: invite.expiresAt,
            status,
        })
    } catch (error) {
        console.error(JSON.stringify({ action: "invite.get", outcome: "error", error: String(error) }))
        return NextResponse.json({ message: "Internal Server Error" }, { status: 500 })
    }
}
