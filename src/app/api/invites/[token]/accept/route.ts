import { NextResponse } from "next/server"
import { getServerSession } from "next-auth"
import { authOptions } from "@/lib/auth"
import prisma from "@/lib/prisma"
import { inviteStatus, normalizeEmail } from "@/lib/invites"
import { checkRateLimit, getClientIp } from "@/lib/rate-limit"

interface RouteParams {
    params: Promise<{ token: string }>
}

export async function POST(req: Request, { params }: RouteParams) {
    const session = await getServerSession(authOptions)

    if (!session || !session.user || !session.user.email) {
        return NextResponse.json({ message: "Unauthorized" }, { status: 401 })
    }

    const { token } = await params

    try {
        // 10 attempts per hour per (IP, token) — discourages bulk token guessing.
        const ip = getClientIp(req)
        const rl = await checkRateLimit(`invite:accept:${ip}:${token}`, 10, 60 * 60)
        if (!rl.ok) {
            return NextResponse.json(
                { message: "Too many requests, please try again later." },
                { status: 429, headers: { "Retry-After": String(rl.retryAfterSeconds) } }
            )
        }

        const invite = await prisma.projectInvite.findUnique({ where: { token } })

        if (!invite) {
            return NextResponse.json({ message: "Invalid or expired invite" }, { status: 404 })
        }

        const status = inviteStatus(invite)
        if (status !== "pending") {
            return NextResponse.json({ message: "Invalid or expired invite" }, { status: 410 })
        }

        if (normalizeEmail(session.user.email) !== invite.email) {
            return NextResponse.json(
                { message: "Email does not match invite" },
                { status: 403 }
            )
        }

        const existingMember = await prisma.projectMember.findUnique({
            where: {
                projectId_userId: { projectId: invite.projectId, userId: session.user.id },
            },
        })

        if (existingMember) {
            return NextResponse.json(
                { message: "You are already a member of this project" },
                { status: 409 }
            )
        }

        await prisma.$transaction([
            prisma.projectMember.create({
                data: {
                    projectId: invite.projectId,
                    userId: session.user.id,
                    role: invite.role,
                },
            }),
            prisma.projectInvite.update({
                where: { id: invite.id },
                data: { acceptedAt: new Date(), acceptedById: session.user.id },
            }),
        ])

        console.info(JSON.stringify({
            action: "invite.accept",
            inviteId: invite.id,
            projectId: invite.projectId,
            actorUserId: session.user.id,
            outcome: "ok",
        }))

        return NextResponse.json({ projectId: invite.projectId })
    } catch (error) {
        console.error(JSON.stringify({ action: "invite.accept", outcome: "error", error: String(error) }))
        return NextResponse.json({ message: "Internal Server Error" }, { status: 500 })
    }
}
