import { NextResponse } from "next/server"
import { getServerSession } from "next-auth"
import { authOptions } from "@/lib/auth"
import prisma from "@/lib/prisma"
import { z } from "zod"
import {
    buildInviteUrl,
    defaultInviteExpiry,
    generateInviteToken,
    inviteStatus,
    normalizeEmail,
} from "@/lib/invites"
import { sendInviteEmail } from "@/lib/email/send-invite"
import { authorizeProjectAccess } from "@/lib/roles"
import { logError } from "@/lib/logger"
import { jsonError } from "@/lib/api-errors"

const addMemberSchema = z.object({
    projectId: z.string(),
    email: z.string().email(),
    role: z.enum(["Viewer", "Editor", "Admin"]),
})

const removeMemberSchema = z.object({
    projectId: z.string(),
    userId: z.string(),
})

export async function POST(req: Request) {
    try {
        const body = await req.json()
        const { projectId, email, role } = addMemberSchema.parse(body)

        const access = await authorizeProjectAccess(projectId, "Admin")
        if (!access.ok) return access.response
        const { project, userId: actorUserId } = access.access

        const session = await getServerSession(authOptions)

        const normalizedEmail = normalizeEmail(email)

        const userToAdd = await prisma.user.findUnique({ where: { email: normalizedEmail } })

        if (userToAdd) {
            const existingMember = await prisma.projectMember.findUnique({
                where: { projectId_userId: { projectId, userId: userToAdd.id } }
            })

            if (existingMember) {
                return NextResponse.json({ error: "User is already a member" }, { status: 409 })
            }

            const member = await prisma.projectMember.create({
                data: { projectId, userId: userToAdd.id, role },
                include: { user: true }
            })

            return NextResponse.json({ status: "added", member }, { status: 201 })
        }

        const existingInvite = await prisma.projectInvite.findFirst({
            where: { projectId, email: normalizedEmail },
            orderBy: { createdAt: "desc" },
        })

        if (existingInvite && inviteStatus(existingInvite) === "pending") {
            return NextResponse.json(
                { error: "An open invite already exists for this email. Revoke it first to reissue." },
                { status: 409 }
            )
        }

        const token = generateInviteToken()
        const expiresAt = defaultInviteExpiry()
        const invite = await prisma.projectInvite.create({
            data: {
                token,
                projectId,
                email: normalizedEmail,
                role,
                createdById: actorUserId,
                expiresAt,
            },
        })

        const origin = req.headers.get("origin") ?? new URL(req.url).origin
        const url = buildInviteUrl(origin, token)

        console.info(JSON.stringify({
            action: "invite.create",
            inviteId: invite.id,
            projectId,
            actorUserId,
            outcome: "ok",
        }))

        const send = await sendInviteEmail({
            inviteId: invite.id,
            projectId,
            actorUserId,
            toEmail: normalizedEmail,
            replyTo: session?.user?.email ?? "",
            template: {
                projectName: project.name,
                inviterName: session?.user?.name ?? session?.user?.email ?? "A teammate",
                role,
                url,
                expiresAt,
            },
        })

        return NextResponse.json(
            {
                status: "invited",
                invite: {
                    id: invite.id,
                    email: invite.email,
                    role: invite.role,
                    expiresAt: invite.expiresAt,
                    url,
                    send,
                },
            },
            { status: 201 }
        )
    } catch (error) {
        if (error instanceof z.ZodError) {
            const first = error.issues[0]?.message ?? "Invalid request"
            return jsonError(400, first)
        }
        logError({ action: "member.add" }, error)
        return jsonError(500, "Error adding member")
    }
}

export async function DELETE(req: Request) {
    try {
        const body = await req.json()
        const { projectId, userId } = removeMemberSchema.parse(body)

        const access = await authorizeProjectAccess(projectId, "Admin")
        if (!access.ok) return access.response
        const { project } = access.access

        if (project.ownerId === userId) {
            return NextResponse.json({ error: "Cannot remove project owner" }, { status: 400 })
        }

        await prisma.projectMember.delete({
            where: { projectId_userId: { projectId, userId } }
        })

        return NextResponse.json({ message: "Member removed" }, { status: 200 })
    } catch (error) {
        if (error instanceof z.ZodError) {
            const first = error.issues[0]?.message ?? "Invalid request"
            return jsonError(400, first)
        }
        logError({ action: "member.remove" }, error)
        return jsonError(500, "Error removing member")
    }
}
