import { NextRequest, NextResponse } from 'next/server'
import prisma from '@/lib/prisma'
import { authorizeProjectAccess } from '@/lib/roles'

export async function GET(
    _req: NextRequest,
    { params }: { params: Promise<{ id: string }> }
) {
    try {
        const { id: projectId } = await params

        const access = await authorizeProjectAccess(projectId, "Viewer")
        if (!access.ok) return access.response

        const logs = await prisma.changeLog.findMany({
            where: { projectId },
            orderBy: { createdAt: 'desc' },
            take: 50,
            include: {
                user: {
                    select: {
                        name: true,
                        image: true
                    }
                }
            }
        })

        return NextResponse.json(logs)
    } catch (error) {
        console.error('Error fetching change log:', error)
        return NextResponse.json({ error: 'Failed to fetch change log' }, { status: 500 })
    }
}
