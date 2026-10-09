import { NextRequest, NextResponse } from 'next/server'
import prisma from '@/lib/prisma'
import { parseGedcom } from '@/lib/gedcom'
import { Prisma } from "@prisma/client"
import { randomUUID } from 'crypto'
import { authorizeProjectAccess } from '@/lib/roles'

export async function POST(
    req: NextRequest,
    { params }: { params: Promise<{ id: string }> }
) {
    try {
        const { id: projectId } = await params

        const access = await authorizeProjectAccess(projectId, "Editor")
        if (!access.ok) return access.response

        const formData = await req.formData()
        const file = formData.get('file') as File

        if (!file) {
            return NextResponse.json({ error: 'No file uploaded' }, { status: 400 })
        }

        const MAX_SIZE = 5 * 1024 * 1024
        if (file.size > MAX_SIZE) {
            return NextResponse.json({ error: 'File too large (5MB max)' }, { status: 400 })
        }
        const name = file.name.toLowerCase()
        if (!name.endsWith('.ged') && !name.endsWith('.gedcom')) {
            return NextResponse.json({ error: 'Only .ged or .gedcom files are accepted' }, { status: 400 })
        }

        const text = await file.text()
        const { individuals, families } = parseGedcom(text)

        const idMap = new Map<string, string>()

        const elementsData: Prisma.ElementCreateManyInput[] = individuals.map(indi => {
            const dbId = randomUUID()
            idMap.set(indi.id, dbId)
            return {
                id: dbId,
                projectId,
                name: indi.name?.replace(/\//g, '') || 'Unknown',
                type: 'Person',
                description: indi.notes,
                positionX: (Math.random() - 0.5) * 100,
                positionY: (Math.random() - 0.5) * 100,
                positionZ: (Math.random() - 0.5) * 100
            }
        })

        const relationshipsData: Prisma.RelationshipCreateManyInput[] = []
        for (const fam of families) {
            const husbandId = fam.husbandId ? idMap.get(fam.husbandId) : null
            const wifeId = fam.wifeId ? idMap.get(fam.wifeId) : null
            const childrenIds = fam.childrenIds.map(id => idMap.get(id)).filter(id => id) as string[]

            if (husbandId && wifeId) {
                relationshipsData.push({ projectId, fromId: husbandId, toId: wifeId, type: 'Partner' })
            }

            const parents = [husbandId, wifeId].filter(p => p) as string[]
            for (const parentId of parents) {
                for (const childId of childrenIds) {
                    relationshipsData.push({ projectId, fromId: parentId, toId: childId, type: 'Parent/Child' })
                }
            }
        }

        await prisma.$transaction(async (tx) => {
            if (elementsData.length > 0) {
                await tx.element.createMany({ data: elementsData })
            }
            if (relationshipsData.length > 0) {
                await tx.relationship.createMany({ data: relationshipsData })
            }
            await tx.changeLog.create({
                data: {
                    projectId,
                    userId: access.access.userId,
                    action: 'CREATE',
                    entityType: 'Import',
                    entityId: 'gedcom-import',
                    entityName: `Imported ${individuals.length} people and ${families.length} families`,
                    newState: { individualCount: individuals.length, familyCount: families.length }
                }
            })
        })

        return NextResponse.json({
            success: true,
            imported: { individuals: individuals.length, families: families.length }
        })
    } catch (error) {
        console.error('Error importing GEDCOM:', error)
        const message = error instanceof Error ? error.message : 'Failed to import GEDCOM'
        return NextResponse.json({ error: message }, { status: 500 })
    }
}
