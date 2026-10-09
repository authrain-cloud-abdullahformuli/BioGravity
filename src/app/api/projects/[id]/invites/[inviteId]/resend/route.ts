import { NextResponse } from "next/server"
import { getServerSession } from "next-auth"
import { authOptions } from "@/lib/auth"
import prisma from "@/lib/prisma"
import { buildInviteUrl, inviteStatus } from "@/lib/invites"
import { sendInviteEmail } from "@/lib/email/send-invite"
import { authorizeProjectAccess } from "@/lib/roles"
import { checkRateLimit } from "@/lib/rate-limit"

interface RouteParams {
    params: Promise<{ id: string; inviteId: string }>
}

export async function POST(req: Request, { params }: RouteParams) {
    const { id: projectId, inviteId } = await params

    try {
        const access = await authorizeProjectAccess(projectId, "Admin")
        if (!access.ok) return access.response
        const { project } = access.access

        // 10 resends per hour per invite — prevents using resend as a spam vector.
        const rl = await checkRateLimit(`invite:resend:${inviteId}`, 10, 60 * 60)
        if (!rl.ok) {
            return NextResponse.json(
                { error: "Too many resends, please try again later." },
                { status: 429, headers: { "Retry-After": String(rl.retryAfterSeconds) } }
            )
        }

        // We still need session here for the reply-to and display name on the email.
        const session = await getServerSession(authOptions)

        const invite = await prisma.projectInvite.findUnique({ where: { id: inviteId } })
        if (!invite || invite.projectId !== projectId) {
            return NextResponse.json({ error: "Invite not found" }, { status: 404 })
        }

        const status = inviteStatus(invite)
        if (status !== "pending") {
            return NextResponse.json({ error: `Invite is ${status}` }, { status: 410 })
        }

        const requestOrigin = req.headers.get("origin") ?? new URL(req.url).origin
        const url = buildInviteUrl(requestOrigin, invite.token)

        const send = await sendInviteEmail({
            inviteId: invite.id,
            projectId,
            actorUserId: access.access.userId,
            toEmail: invite.email,
            replyTo: session?.user?.email ?? "",
            template: {
                projectName: project.name,
                inviterName: session?.user?.name ?? session?.user?.email ?? "A teammate",
                role: invite.role,
                url,
                expiresAt: invite.expiresAt,
            },
        })

        return NextResponse.json({ send })
    } catch (error) {
        console.error(JSON.stringify({ action: "invite.resend", outcome: "error", error: String(error) }))
        return NextResponse.json({ error: "Internal Server Error" }, { status: 500 })
    }
}
