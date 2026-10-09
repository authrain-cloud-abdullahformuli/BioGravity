import { NextRequest, NextResponse } from 'next/server'
import { z } from 'zod'
import prisma from '@/lib/prisma'
import { authorizeProjectAccess } from '@/lib/roles'
import { recordChange } from '@/lib/changelog'

const createRelationshipSchema = z.object({
    sourceId: z.string().min(1),
    targetId: z.string().min(1),
    type: z.string().min(1).max(200),
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
        const parsed = createRelationshipSchema.safeParse(body)
        if (!parsed.success) {
            return NextResponse.json(
                { error: parsed.error.issues[0]?.message ?? 'Invalid request' },
                { status: 400 }
            )
        }
        const { sourceId, targetId, type } = parsed.data

        const [source, target] = await Promise.all([
            prisma.element.findFirst({ where: { id: sourceId, projectId } }),
            prisma.element.findFirst({ where: { id: targetId, projectId } })
        ])

        if (!source || !target) {
            return NextResponse.json(
                { error: 'Source or target element not found in this project' },
                { status: 400 }
            )
        }

        const relationship = await prisma.relationship.create({
            data: { projectId, fromId: sourceId, toId: targetId, type }
        })

        await recordChange({
            projectId,
            userId: access.access.userId,
            action: 'CREATE',
            entityType: 'Relationship',
            entityId: relationship.id,
            entityName: relationship.type,
            newState: relationship,
        })

        return NextResponse.json(relationship, { status: 201 })
    } catch (error) {
        console.error('Error creating relationship:', error)
        return NextResponse.json({ error: 'Failed to create relationship' }, { status: 500 })
    }
}
