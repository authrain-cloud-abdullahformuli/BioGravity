import { NextRequest, NextResponse } from 'next/server'
import { z } from 'zod'
import prisma from '@/lib/prisma'
import { authorizeProjectAccess } from '@/lib/roles'
import { recordChange } from '@/lib/changelog'

const createElementSchema = z.object({
    name: z.string().min(1).max(500),
    type: z.string().min(1).max(200),
    description: z.string().max(5000).optional().nullable(),
    dateOfBirth: z.string().datetime().or(z.string().regex(/^\d{4}-\d{2}-\d{2}/)).optional().nullable(),
    positionX: z.number().optional(),
    positionY: z.number().optional(),
    positionZ: z.number().optional(),
})

export async function POST(
    req: NextRequest,
    { params }: { params: Promise<{ id: string }> }
) {
    try {
        const { id: projectId } = await params

        const access = await authorizeProjectAccess(projectId, "Editor")
        if (!access.ok) return access.response

        const body = await req.json()
        const parsed = createElementSchema.safeParse(body)
        if (!parsed.success) {
            return NextResponse.json(
                { error: parsed.error.issues[0]?.message ?? 'Invalid request' },
                { status: 400 }
            )
        }
        const { name, type, description, positionX, positionY, positionZ, dateOfBirth } = parsed.data

        const element = await prisma.element.create({
            data: {
                projectId,
                name,
                type,
                description,
                dateOfBirth: dateOfBirth ? new Date(dateOfBirth) : null,
                positionX: positionX || 0,
                positionY: positionY || 0,
                positionZ: positionZ || 0,
            }
        })

        await recordChange({
            projectId,
            userId: access.access.userId,
            action: 'CREATE',
            entityType: 'Element',
            entityId: element.id,
            entityName: element.name,
            newState: element,
        })

        return NextResponse.json(element, { status: 201 })
    } catch (error) {
        console.error('Error creating element:', error)
        return NextResponse.json({ error: 'Failed to create element' }, { status: 500 })
    }
}
