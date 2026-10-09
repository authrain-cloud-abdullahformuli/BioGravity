import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest'
import { POST as createProject } from '@/app/api/projects/route'
import { PUT as updateProfile } from '@/app/api/profile/route'
import { getServerSession } from 'next-auth'
import prisma from '@/lib/prisma'

const DEMO = 'demo@example.com'

const signedInAs = (email: string) =>
    (getServerSession as any).mockResolvedValue({ user: { id: 'u1', email } })

const projectRequest = () =>
    new Request('http://localhost/api/projects', {
        method: 'POST',
        body: JSON.stringify({ name: 'Sneaky Project', type: 'Family' }),
    })

const profileRequest = () =>
    new Request('http://localhost/api/profile', {
        method: 'PUT',
        body: JSON.stringify({ name: 'Hijacked', email: 'attacker@example.com' }),
    }) as any

describe('read-only demo account guard', () => {
    beforeEach(() => {
        vi.clearAllMocks()
        process.env.DEMO_READONLY_EMAIL = DEMO
    })
    afterEach(() => {
        delete process.env.DEMO_READONLY_EMAIL
    })

    it('blocks the demo account from creating projects', async () => {
        signedInAs(DEMO)

        const res = await createProject(projectRequest())

        expect(res.status).toBe(403)
        expect(prisma.project.create).not.toHaveBeenCalled()
    })

    it('blocks the demo account from changing its own profile', async () => {
        signedInAs(DEMO)

        const res = await updateProfile(profileRequest())

        expect(res.status).toBe(403)
        expect(prisma.user.update).not.toHaveBeenCalled()
    })

    it('still lets other accounts create projects', async () => {
        signedInAs('curator@example.com')
        ;(prisma.project.create as any).mockResolvedValue({ id: 'p1', type: 'Family' })

        const res = await createProject(projectRequest())

        expect(res.status).toBe(201)
        expect(prisma.project.create).toHaveBeenCalled()
    })

    it('still lets other accounts edit their profile', async () => {
        signedInAs('curator@example.com')
        ;(prisma.user.findUnique as any).mockResolvedValue(null)
        ;(prisma.user.update as any).mockResolvedValue({
            id: 'u1',
            name: 'Curator',
            email: 'curator@example.com',
        })

        const res = await updateProfile(profileRequest())

        expect(res.status).toBe(200)
        expect(prisma.user.update).toHaveBeenCalled()
    })

    it('leaves the demo account writable when the guard is not configured', async () => {
        delete process.env.DEMO_READONLY_EMAIL
        signedInAs(DEMO)
        ;(prisma.project.create as any).mockResolvedValue({ id: 'p1', type: 'Family' })

        const res = await createProject(projectRequest())

        expect(res.status).toBe(201)
    })
})
