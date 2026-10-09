import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest'
import { POST as POST_RESEND } from '@/app/api/projects/[id]/invites/[inviteId]/resend/route'
import { getServerSession } from 'next-auth'
import prisma from '@/lib/prisma'
import { resendSendMock } from '@/tests/mocks/resend-send'

const owner = { id: 'owner1', email: 'owner@example.com', name: 'Owner' }
const project = {
    id: 'project1',
    name: 'Sample',
    ownerId: owner.id,
    members: [{ userId: owner.id, role: 'Admin' }],
}
const pendingInvite = {
    id: 'invite1',
    token: 'tok-aaa',
    projectId: project.id,
    email: 'invitee@example.com',
    role: 'Editor',
    expiresAt: new Date(Date.now() + 1000 * 60 * 60),
    acceptedAt: null,
    revokedAt: null,
}

function asMock<T extends (...args: never[]) => unknown>(fn: T) {
    return fn as unknown as ReturnType<typeof vi.fn>
}

describe('STORY-MEM-008 — POST /api/projects/[id]/invites/[id]/resend (CC-15)', () => {
    const prevKey = process.env.RESEND_API_KEY

    beforeEach(() => {
        vi.clearAllMocks()
        process.env.RESEND_API_KEY = 'test-key'
        asMock(prisma.projectInvite.update).mockResolvedValue({})
    })

    afterEach(() => {
        process.env.RESEND_API_KEY = prevKey
    })

    it('Owner can resend a pending invite without minting a new token', async () => {
        asMock(getServerSession).mockResolvedValue({ user: owner })
        asMock(prisma.project.findUnique).mockResolvedValue(project)
        asMock(prisma.projectInvite.findUnique).mockResolvedValue(pendingInvite)
        resendSendMock.mockResolvedValue({ data: { id: 'msg-789' }, error: null })

        const res = await POST_RESEND(new Request('http://localhost/api/projects/project1/invites/invite1/resend', {
            method: 'POST',
            headers: { origin: 'http://localhost:3000' },
        }), { params: Promise.resolve({ id: 'project1', inviteId: 'invite1' }) })

        expect(res.status).toBe(200)
        const data = await res.json()
        expect(data.send.ok).toBe(true)
        expect(data.send.messageId).toBe('msg-789')
        const sendArgs = resendSendMock.mock.calls[0][0]
        expect(sendArgs.to).toEqual(['invitee@example.com'])
        // URL must use the existing token, not a new one
        // (verified indirectly via template — we do not regenerate the token)
        expect(sendArgs.html).toContain('tok-aaa')
    })

    it('rejects unauthenticated callers with 401', async () => {
        asMock(getServerSession).mockResolvedValue(null)

        const res = await POST_RESEND(new Request('http://localhost/api/projects/project1/invites/invite1/resend', { method: 'POST' }), {
            params: Promise.resolve({ id: 'project1', inviteId: 'invite1' }),
        })

        expect(res.status).toBe(401)
        expect(resendSendMock).not.toHaveBeenCalled()
    })

    it('rejects callers who are neither Owner nor Admin with 403', async () => {
        asMock(getServerSession).mockResolvedValue({ user: { id: 'stranger', email: 'x@x.com', name: 'X' } })
        // Prisma filters members by the requesting userId — stranger sees an empty members array.
        asMock(prisma.project.findUnique).mockResolvedValue({ ...project, members: [] })

        const res = await POST_RESEND(new Request('http://localhost/api/projects/project1/invites/invite1/resend', { method: 'POST' }), {
            params: Promise.resolve({ id: 'project1', inviteId: 'invite1' }),
        })

        expect(res.status).toBe(403)
    })

    it('returns 410 for an expired invite', async () => {
        asMock(getServerSession).mockResolvedValue({ user: owner })
        asMock(prisma.project.findUnique).mockResolvedValue(project)
        asMock(prisma.projectInvite.findUnique).mockResolvedValue({
            ...pendingInvite,
            expiresAt: new Date(Date.now() - 1000),
        })

        const res = await POST_RESEND(new Request('http://localhost/api/projects/project1/invites/invite1/resend', { method: 'POST' }), {
            params: Promise.resolve({ id: 'project1', inviteId: 'invite1' }),
        })

        expect(res.status).toBe(410)
        expect(resendSendMock).not.toHaveBeenCalled()
    })

    it('returns 404 if the invite belongs to a different project', async () => {
        asMock(getServerSession).mockResolvedValue({ user: owner })
        asMock(prisma.project.findUnique).mockResolvedValue(project)
        asMock(prisma.projectInvite.findUnique).mockResolvedValue({ ...pendingInvite, projectId: 'other-project' })

        const res = await POST_RESEND(new Request('http://localhost/api/projects/project1/invites/invite1/resend', { method: 'POST' }), {
            params: Promise.resolve({ id: 'project1', inviteId: 'invite1' }),
        })

        expect(res.status).toBe(404)
    })
})
