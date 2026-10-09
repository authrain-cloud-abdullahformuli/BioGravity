import { describe, it, expect, vi, beforeEach } from 'vitest'
import { POST } from '@/app/api/projects/route'
import { getServerSession } from 'next-auth'
import prisma from '@/lib/prisma'

describe('Projects API', () => {
    beforeEach(() => {
        vi.clearAllMocks()
    })

    it('creates Family projects with Family schema defaults', async () => {
        ; (getServerSession as any).mockResolvedValue({ user: { id: 'user1' } })
            ; (prisma.project.create as any).mockResolvedValue({ id: 'project1', type: 'Family' })

        const res = await POST(new Request('http://localhost/api/projects', {
            method: 'POST',
            body: JSON.stringify({ name: 'Family Tree', type: 'Family' }),
        }))

        expect(res.status).toBe(201)
        expect(prisma.project.create).toHaveBeenCalledWith({
            data: expect.objectContaining({
                type: 'Family',
                elementTypes: expect.arrayContaining([
                    expect.objectContaining({ name: 'Person' }),
                    expect.objectContaining({ name: 'Pet' }),
                ]),
                relationshipTypes: expect.arrayContaining([
                    expect.objectContaining({ name: 'Parent/Child' }),
                    expect.objectContaining({ name: 'Partner' }),
                ]),
            }),
        })
    })

    it('creates Organization projects with Organization schema defaults', async () => {
        ; (getServerSession as any).mockResolvedValue({ user: { id: 'user1' } })
            ; (prisma.project.create as any).mockResolvedValue({ id: 'project1', type: 'Organization' })

        const res = await POST(new Request('http://localhost/api/projects', {
            method: 'POST',
            body: JSON.stringify({ name: 'Org Map', type: 'Organization' }),
        }))

        expect(res.status).toBe(201)
        expect(prisma.project.create).toHaveBeenCalledWith({
            data: expect.objectContaining({
                type: 'Organization',
                elementTypes: expect.arrayContaining([
                    expect.objectContaining({ name: 'Company' }),
                    expect.objectContaining({ name: 'Department' }),
                    expect.objectContaining({ name: 'Team' }),
                ]),
                relationshipTypes: expect.arrayContaining([
                    expect.objectContaining({ name: 'Direct Report' }),
                    expect.objectContaining({ name: 'Indirect Report' }),
                ]),
            }),
        })
    })
})
