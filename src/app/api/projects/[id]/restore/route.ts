import { NextRequest, NextResponse } from 'next/server'
import prisma from '@/lib/prisma'
import { authorizeProjectAccess } from '@/lib/roles'

export async function POST(
    req: NextRequest,
    { params }: { params: Promise<{ id: string }> }
) {
    try {
        const { id: projectId } = await params

        const access = await authorizeProjectAccess(projectId, "Editor")
        if (!access.ok) return access.response

        const body = await req.json()
        const { changeLogId } = body

        if (!changeLogId) {
            return NextResponse.json({ error: 'changeLogId is required' }, { status: 400 })
        }

        const changeLog = await prisma.changeLog.findUnique({ where: { id: changeLogId } })

        if (!changeLog) {
            return NextResponse.json({ error: 'Change log entry not found' }, { status: 404 })
        }

        if (changeLog.projectId !== projectId) {
            return NextResponse.json({ error: 'Change log does not belong to this project' }, { status: 400 })
        }

        const { action, entityType, entityId, previousState } = changeLog
        const prevState = previousState as any

        if (action === 'CREATE') {
            if (entityType === 'Element') {
                await prisma.element.delete({ where: { id: entityId } })
            } else if (entityType === 'Relationship') {
                await prisma.relationship.delete({ where: { id: entityId } })
            }
        } else if (action === 'UPDATE') {
            if (entityType === 'Element') {
                await prisma.element.update({ where: { id: entityId }, data: prevState })
            } else if (entityType === 'Relationship') {
                await prisma.relationship.update({ where: { id: entityId }, data: prevState })
            }
        } else if (action === 'DELETE') {
            if (entityType === 'Element') {
                await prisma.element.create({
                    data: { ...prevState, project: { connect: { id: projectId } } }
                })
            } else if (entityType === 'Relationship') {
                await prisma.relationship.create({
                    data: {
                        ...prevState,
                        project: { connect: { id: projectId } },
                        from: { connect: { id: prevState.fromId } },
                        to: { connect: { id: prevState.toId } }
                    }
                })
            }
        }

        return NextResponse.json({ success: true })
    } catch (error) {
        console.error('Error restoring change:', error)
        return NextResponse.json({ error: 'Failed to restore change' }, { status: 500 })
    }
}
