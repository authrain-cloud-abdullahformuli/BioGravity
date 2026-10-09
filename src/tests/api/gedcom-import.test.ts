import { describe, it, expect, vi, beforeEach } from 'vitest'
import { POST } from '@/app/api/projects/[id]/import/gedcom/route'
import { getServerSession } from 'next-auth'
import prisma from '@/lib/prisma'
import { NextRequest } from 'next/server'

describe('GEDCOM Import API', () => {
    beforeEach(() => {
        vi.clearAllMocks()
    })

    it('should return 401 if unauthorized', async () => {
        ; (getServerSession as any).mockResolvedValue(null)
        const req = new NextRequest('http://localhost/api/projects/1/import/gedcom', { method: 'POST' })
        const res = await POST(req, { params: Promise.resolve({ id: '1' }) })
        expect(res.status).toBe(401)
    })

    it('should return 403 if user is not an editor', async () => {
        ; (getServerSession as any).mockResolvedValue({ user: { id: 'user1' } })
            ; (prisma.project.findUnique as any).mockResolvedValue({
                ownerId: 'other-user',
                members: [{ userId: 'user1', role: 'Viewer' }],
            })

        const req = new NextRequest('http://localhost/api/projects/1/import/gedcom', { method: 'POST' })
        const res = await POST(req, { params: Promise.resolve({ id: '1' }) })
        expect(res.status).toBe(403)
    })
})
