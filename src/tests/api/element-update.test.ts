import { describe, it, expect, vi, beforeEach } from 'vitest'
import { PATCH } from '@/app/api/projects/[id]/elements/[elementId]/route'
import { getServerSession } from 'next-auth'
import prisma from '@/lib/prisma'

describe('Element update API', () => {
    beforeEach(() => {
        vi.clearAllMocks()
    })

    it('persists pin state and coordinates', async () => {
        ; (getServerSession as any).mockResolvedValue({ user: { id: 'user1' } })
            ; (prisma.element.findUnique as any).mockResolvedValue({
                id: 'element1',
                projectId: 'project1',
                name: 'Node',
                type: 'Person',
                pinned: false,
                positionX: 0,
                positionY: 0,
                positionZ: 0,
            })
            ; (prisma.project.findUnique as any).mockResolvedValue({
                id: 'project1',
                ownerId: 'owner1',
                members: [{ userId: 'user1', role: 'Editor' }],
            })
            ; (prisma.element.update as any).mockResolvedValue({
                id: 'element1',
                name: 'Node',
                type: 'Person',
                pinned: true,
                positionX: 10,
                positionY: 20,
                positionZ: 30,
            })

        const req = new Request('http://localhost/api/projects/project1/elements/element1', {
            method: 'PATCH',
            body: JSON.stringify({
                pinned: true,
                positionX: 10,
                positionY: 20,
                positionZ: 30,
            }),
        })

        const res = await PATCH(req, {
            params: Promise.resolve({ id: 'project1', elementId: 'element1' }),
        })

        expect(res.status).toBe(200)
        expect(prisma.element.update).toHaveBeenCalledWith({
            where: { id: 'element1' },
            data: expect.objectContaining({
                pinned: true,
                positionX: 10,
                positionY: 20,
                positionZ: 30,
            }),
        })
        expect(prisma.changeLog.create).toHaveBeenCalledWith({
            data: expect.objectContaining({
                action: 'UPDATE',
                entityType: 'Element',
                entityId: 'element1',
            }),
        })
    })

    it('rejects invalid pin coordinate values', async () => {
        ; (getServerSession as any).mockResolvedValue({ user: { id: 'user1' } })
            ; (prisma.element.findUnique as any).mockResolvedValue({
                id: 'element1',
                projectId: 'project1',
                name: 'Node',
                type: 'Person',
            })
            ; (prisma.project.findUnique as any).mockResolvedValue({
                id: 'project1',
                ownerId: 'owner1',
                members: [{ userId: 'user1', role: 'Editor' }],
            })

        const req = new Request('http://localhost/api/projects/project1/elements/element1', {
            method: 'PATCH',
            body: JSON.stringify({
                pinned: true,
                positionX: '10',
            }),
        })

        const res = await PATCH(req, {
            params: Promise.resolve({ id: 'project1', elementId: 'element1' }),
        })

        expect(res.status).toBe(400)
        expect(prisma.element.update).not.toHaveBeenCalled()
    })
})
