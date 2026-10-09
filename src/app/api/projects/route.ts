import { NextResponse } from "next/server"
import { getServerSession } from "next-auth"
import { authOptions } from "@/lib/auth"
import prisma from "@/lib/prisma"
import { z } from "zod"
import { PROJECT_TYPE_DEFAULTS, PROJECT_TYPES } from "@/lib/project-defaults"
import { isReadOnlyDemoAccount, DEMO_READONLY_MESSAGE } from "@/lib/demo-mode"

const projectSchema = z.object({
    name: z.string().min(1, "Name is required"),
    description: z.string().optional(),
    type: z.enum(PROJECT_TYPES).optional().default("Family"),
})

export async function GET() {
    const session = await getServerSession(authOptions)

    if (!session || !session.user) {
        return NextResponse.json({ message: "Unauthorized" }, { status: 401 })
    }

    try {
        const projects = await prisma.project.findMany({
            where: {
                OR: [
                    { ownerId: session.user.id },
                    { members: { some: { userId: session.user.id } } },
                ],
            },
            include: {
                owner: { select: { name: true, email: true } },
                _count: { select: { elements: true, members: true } },
            },
            orderBy: { updatedAt: 'desc' },
        })

        return NextResponse.json(projects)
    } catch {
        return NextResponse.json(
            { message: "Something went wrong" },
            { status: 500 }
        )
    }
}

export async function POST(req: Request) {
    const session = await getServerSession(authOptions)

    if (!session || !session.user) {
        return NextResponse.json({ message: "Unauthorized" }, { status: 401 })
    }

    // Creating a project makes the creator its Admin, which would hand every
    // visitor sharing the demo login a fully writable project on the shared
    // dashboard.
    if (isReadOnlyDemoAccount(session.user.email)) {
        return NextResponse.json({ message: DEMO_READONLY_MESSAGE }, { status: 403 })
    }

    try {
        const body = await req.json()
        const { name, description, type } = projectSchema.parse(body)
        const { elementTypes, relationshipTypes } = PROJECT_TYPE_DEFAULTS[type]

        const project = await prisma.project.create({
            data: {
                name,
                description,
                type,
                ownerId: session.user.id,
                elementTypes,
                relationshipTypes,
                members: {
                    create: {
                        userId: session.user.id,
                        role: 'Admin'
                    }
                }
            },
        })

        return NextResponse.json(project, { status: 201 })
    } catch (error) {
        if (error instanceof z.ZodError) {
            return NextResponse.json(
                { message: error.issues[0].message },
                { status: 400 }
            )
        }
        return NextResponse.json(
            { message: "Something went wrong" },
            { status: 500 }
        )
    }
}
