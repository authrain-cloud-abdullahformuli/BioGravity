import { describe, it, expect, vi, beforeEach } from 'vitest'
import { POST } from '@/app/api/projects/[id]/seed/route'
import { getServerSession } from 'next-auth'
import prisma from '@/lib/prisma'

describe('Seed API', () => {
    beforeEach(() => {
        vi.clearAllMocks()
    })

    it('should return 401 if unauthorized', async () => {
        ; (getServerSession as any).mockResolvedValue(null)
        const res = await POST(new Request('http://localhost'), { params: Promise.resolve({ id: '1' }) })
        expect(res.status).toBe(401)
    })

    it('should return 404 if project not found', async () => {
        ; (getServerSession as any).mockResolvedValue({ user: { id: 'user1' } })
            ; (prisma.project.findUnique as any).mockResolvedValue(null)

        const res = await POST(new Request('http://localhost'), { params: Promise.resolve({ id: 'non-existent' }) })
        expect(res.status).toBe(404)
    })

    it('should return 403 if user is not the owner', async () => {
        ; (getServerSession as any).mockResolvedValue({ user: { id: 'user1' } })
            // Prisma filters members by the requesting userId — a stranger sees an empty array.
            ; (prisma.project.findUnique as any).mockResolvedValue({ ownerId: 'other-user', members: [] })

        const res = await POST(new Request('http://localhost'), { params: Promise.resolve({ id: '1' }) })
        expect(res.status).toBe(403)
    })
})
