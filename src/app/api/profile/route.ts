import { NextRequest, NextResponse } from "next/server"
import { getServerSession } from "next-auth"
import { authOptions } from "@/lib/auth"
import prisma from "@/lib/prisma"
import { logError } from "@/lib/logger"
import { isReadOnlyDemoAccount, DEMO_READONLY_MESSAGE } from "@/lib/demo-mode"

export async function PUT(request: NextRequest) {
    try {
        const session = await getServerSession(authOptions)

        if (!session || !session.user?.id) {
            return NextResponse.json(
                { message: "Unauthorized" },
                { status: 401 }
            )
        }

        // Changing this account's email would rename the shared demo login and
        // lock every other visitor out.
        if (isReadOnlyDemoAccount(session.user.email)) {
            return NextResponse.json(
                { message: DEMO_READONLY_MESSAGE },
                { status: 403 }
            )
        }

        const body = await request.json()
        const { name, email } = body

        // Check if email is already taken by another user
        if (email && email !== session.user.email) {
            const existingUser = await prisma.user.findUnique({
                where: { email },
            })

            if (existingUser) {
                return NextResponse.json(
                    { message: "Email is already in use" },
                    { status: 400 }
                )
            }
        }

        const updatedUser = await prisma.user.update({
            where: { id: session.user.id },
            data: {
                name: name || undefined,
                email: email || undefined,
            },
        })

        return NextResponse.json({
            message: "Profile updated successfully",
            user: {
                id: updatedUser.id,
                name: updatedUser.name,
                email: updatedUser.email,
            },
        })
    } catch (error) {
        logError({ action: "profile.update" }, error)
        return NextResponse.json(
            { message: "Failed to update profile" },
            { status: 500 }
        )
    }
}
