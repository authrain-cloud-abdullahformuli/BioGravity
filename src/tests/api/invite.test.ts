import { describe, it, expect, vi, beforeEach } from 'vitest'
import { POST as POST_MEMBERS } from '@/app/api/projects/members/route'
import { GET as GET_INVITE } from '@/app/api/invites/[token]/route'
import { POST as POST_ACCEPT } from '@/app/api/invites/[token]/accept/route'
import { DELETE as DELETE_INVITE } from '@/app/api/projects/[id]/invites/[inviteId]/route'
import { getServerSession } from 'next-auth'
import prisma from '@/lib/prisma'

const owner = { id: 'owner1', email: 'owner@example.com' }
const inviteeEmail = 'newperson@example.com'

const baseProject = {
    id: 'project1',
    ownerId: owner.id,
    members: [{ userId: owner.id, role: 'Admin' }],
}

function asMock<T extends (...args: never[]) => unknown>(fn: T) {
    return fn as unknown as ReturnType<typeof vi.fn>
}

describe('STORY-MEM-007 — Invite token flow (CC-13)', () => {
    beforeEach(() => {
        vi.clearAllMocks()
    })

    describe('POST /api/projects/members — invite creation when user is unregistered', () => {
        it('creates an invite and returns a copyable URL', async () => {
            asMock(getServerSession).mockResolvedValue({ user: owner })
            asMock(prisma.project.findUnique).mockResolvedValue(baseProject)
            asMock(prisma.user.findUnique).mockResolvedValue(null)
            asMock(prisma.projectInvite.findFirst).mockResolvedValue(null)
            asMock(prisma.projectInvite.create).mockResolvedValue({
                id: 'invite1',
                token: 'sometokenvalue',
                email: inviteeEmail,
                role: 'Editor',
                expiresAt: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000),
                projectId: baseProject.id,
            })

            const req = new Request('http://localhost/api/projects/members', {
                method: 'POST',
                headers: { origin: 'http://localhost:3000' },
                body: JSON.stringify({ projectId: baseProject.id, email: inviteeEmail, role: 'Editor' }),
            })
            const res = await POST_MEMBERS(req)
            expect(res.status).toBe(201)
            const data = await res.json()
            expect(data.status).toBe('invited')
            expect(data.invite.email).toBe(inviteeEmail)
            expect(data.invite.url).toMatch(/^http:\/\/localhost:3000\/invite\/[A-Za-z0-9_-]+$/)
        })

        it('returns 409 if an open invite already exists for that email + project', async () => {
            asMock(getServerSession).mockResolvedValue({ user: owner })
            asMock(prisma.project.findUnique).mockResolvedValue(baseProject)
            asMock(prisma.user.findUnique).mockResolvedValue(null)
            asMock(prisma.projectInvite.findFirst).mockResolvedValue({
                id: 'existing',
                expiresAt: new Date(Date.now() + 1000 * 60 * 60),
                acceptedAt: null,
                revokedAt: null,
            })

            const req = new Request('http://localhost/api/projects/members', {
                method: 'POST',
                body: JSON.stringify({ projectId: baseProject.id, email: inviteeEmail, role: 'Editor' }),
            })
            const res = await POST_MEMBERS(req)
            expect(res.status).toBe(409)
        })

        it('preserves existing-user behaviour: adds a ProjectMember when user exists', async () => {
            asMock(getServerSession).mockResolvedValue({ user: owner })
            asMock(prisma.project.findUnique).mockResolvedValue(baseProject)
            asMock(prisma.user.findUnique).mockResolvedValue({ id: 'user2', email: inviteeEmail })
            asMock(prisma.projectMember.findUnique).mockResolvedValue(null)
            asMock(prisma.projectMember.create).mockResolvedValue({ id: 'm1', userId: 'user2', role: 'Editor' })

            const req = new Request('http://localhost/api/projects/members', {
                method: 'POST',
                body: JSON.stringify({ projectId: baseProject.id, email: inviteeEmail, role: 'Editor' }),
            })
            const res = await POST_MEMBERS(req)
            expect(res.status).toBe(201)
            const data = await res.json()
            expect(data.status).toBe('added')
        })
    })

    describe('GET /api/invites/[token]', () => {
        it('returns invite metadata + status without requiring auth', async () => {
            asMock(prisma.projectInvite.findUnique).mockResolvedValue({
                token: 'tok',
                email: inviteeEmail,
                role: 'Editor',
                expiresAt: new Date(Date.now() + 1000 * 60 * 60),
                acceptedAt: null,
                revokedAt: null,
                project: { id: baseProject.id, name: 'Sample' },
            })

            const res = await GET_INVITE(new Request('http://localhost/api/invites/tok'), {
                params: Promise.resolve({ token: 'tok' }),
            })
            expect(res.status).toBe(200)
            const data = await res.json()
            expect(data.status).toBe('pending')
            expect(data.email).toBe(inviteeEmail)
            expect(data.projectName).toBe('Sample')
        })

        it('returns 404 for an unknown token', async () => {
            asMock(prisma.projectInvite.findUnique).mockResolvedValue(null)
            const res = await GET_INVITE(new Request('http://localhost/api/invites/nope'), {
                params: Promise.resolve({ token: 'nope' }),
            })
            expect(res.status).toBe(404)
        })
    })

    describe('POST /api/invites/[token]/accept', () => {
        const pendingInvite = {
            id: 'invite1',
            projectId: baseProject.id,
            email: inviteeEmail,
            role: 'Editor',
            expiresAt: new Date(Date.now() + 1000 * 60 * 60),
            acceptedAt: null,
            revokedAt: null,
        }

        it('accepts when email matches and creates a ProjectMember', async () => {
            asMock(getServerSession).mockResolvedValue({ user: { id: 'user2', email: inviteeEmail } })
            asMock(prisma.projectInvite.findUnique).mockResolvedValue(pendingInvite)
            asMock(prisma.projectMember.findUnique).mockResolvedValue(null)
            asMock(prisma.projectMember.create).mockResolvedValue({ id: 'm1' })
            asMock(prisma.projectInvite.update).mockResolvedValue({})

            const res = await POST_ACCEPT(new Request('http://localhost/api/invites/tok/accept', { method: 'POST' }), {
                params: Promise.resolve({ token: 'tok' }),
            })
            expect(res.status).toBe(200)
            const data = await res.json()
            expect(data.projectId).toBe(baseProject.id)
        })

        it('returns 403 when session email does not match invite email', async () => {
            asMock(getServerSession).mockResolvedValue({ user: { id: 'user2', email: 'other@example.com' } })
            asMock(prisma.projectInvite.findUnique).mockResolvedValue(pendingInvite)

            const res = await POST_ACCEPT(new Request('http://localhost/api/invites/tok/accept', { method: 'POST' }), {
                params: Promise.resolve({ token: 'tok' }),
            })
            expect(res.status).toBe(403)
        })

        it('returns 410 when invite is expired', async () => {
            asMock(getServerSession).mockResolvedValue({ user: { id: 'user2', email: inviteeEmail } })
            asMock(prisma.projectInvite.findUnique).mockResolvedValue({
                ...pendingInvite,
                expiresAt: new Date(Date.now() - 1000),
            })

            const res = await POST_ACCEPT(new Request('http://localhost/api/invites/tok/accept', { method: 'POST' }), {
                params: Promise.resolve({ token: 'tok' }),
            })
            expect(res.status).toBe(410)
        })

        it('returns 410 when invite has been revoked', async () => {
            asMock(getServerSession).mockResolvedValue({ user: { id: 'user2', email: inviteeEmail } })
            asMock(prisma.projectInvite.findUnique).mockResolvedValue({ ...pendingInvite, revokedAt: new Date() })

            const res = await POST_ACCEPT(new Request('http://localhost/api/invites/tok/accept', { method: 'POST' }), {
                params: Promise.resolve({ token: 'tok' }),
            })
            expect(res.status).toBe(410)
        })

        it('returns 401 for an unauthenticated request', async () => {
            asMock(getServerSession).mockResolvedValue(null)

            const res = await POST_ACCEPT(new Request('http://localhost/api/invites/tok/accept', { method: 'POST' }), {
                params: Promise.resolve({ token: 'tok' }),
            })
            expect(res.status).toBe(401)
        })
    })

    describe('DELETE /api/projects/[id]/invites/[inviteId]', () => {
        it('owner revokes a pending invite', async () => {
            asMock(getServerSession).mockResolvedValue({ user: owner })
            asMock(prisma.project.findUnique).mockResolvedValue(baseProject)
            asMock(prisma.projectInvite.findUnique).mockResolvedValue({
                id: 'invite1', projectId: baseProject.id, revokedAt: null,
            })
            asMock(prisma.projectInvite.update).mockResolvedValue({})

            const res = await DELETE_INVITE(new Request('http://localhost/api/projects/project1/invites/invite1', { method: 'DELETE' }), {
                params: Promise.resolve({ id: baseProject.id, inviteId: 'invite1' }),
            })
            expect(res.status).toBe(200)
        })

        it('non-owner/non-admin gets 403', async () => {
            asMock(getServerSession).mockResolvedValue({ user: { id: 'stranger', email: 'x@x.com' } })
            // Prisma filters members by the requesting userId — stranger sees an empty array.
            asMock(prisma.project.findUnique).mockResolvedValue({ ...baseProject, members: [] })

            const res = await DELETE_INVITE(new Request('http://localhost/api/projects/project1/invites/invite1', { method: 'DELETE' }), {
                params: Promise.resolve({ id: baseProject.id, inviteId: 'invite1' }),
            })
            expect(res.status).toBe(403)
        })
    })
})
