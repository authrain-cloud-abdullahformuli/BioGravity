import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest'
import { sendInviteEmail } from '@/lib/email/send-invite'
import prisma from '@/lib/prisma'
import { resendSendMock } from '@/tests/mocks/resend-send'

const baseArgs = {
    inviteId: 'invite1',
    projectId: 'project1',
    actorUserId: 'owner1',
    toEmail: 'invitee@example.com',
    replyTo: 'owner@example.com',
    template: {
        projectName: 'Sample',
        inviterName: 'Owner',
        role: 'Editor',
        url: 'http://localhost:3000/invite/abc',
        expiresAt: new Date('2026-05-26T10:00:00Z'),
    },
}

function asMock<T extends (...args: never[]) => unknown>(fn: T) {
    return fn as unknown as ReturnType<typeof vi.fn>
}

describe('STORY-MEM-008 — sendInviteEmail (CC-15)', () => {
    const prevKey = process.env.RESEND_API_KEY

    beforeEach(() => {
        vi.clearAllMocks()
        process.env.RESEND_API_KEY = 'test-key'
        asMock(prisma.projectInvite.update).mockResolvedValue({})
    })

    afterEach(() => {
        process.env.RESEND_API_KEY = prevKey
    })

    it('short-circuits when RESEND_API_KEY is unset and records the failure', async () => {
        delete process.env.RESEND_API_KEY

        const result = await sendInviteEmail(baseArgs)

        expect(result.ok).toBe(false)
        expect(result.error).toMatch(/missing/i)
        expect(resendSendMock).not.toHaveBeenCalled()
        expect(asMock(prisma.projectInvite.update)).toHaveBeenCalledWith(
            expect.objectContaining({
                where: { id: 'invite1' },
                data: expect.objectContaining({
                    sendFailureCount: { increment: 1 },
                    lastSendError: expect.stringMatching(/missing/i),
                }),
            }),
        )
    })

    it('returns ok with messageId on a successful send and records lastSentAt', async () => {
        resendSendMock.mockResolvedValueOnce({ data: { id: 'msg-123' }, error: null })

        const result = await sendInviteEmail(baseArgs)

        expect(result.ok).toBe(true)
        expect(result.messageId).toBe('msg-123')
        expect(resendSendMock).toHaveBeenCalledTimes(1)
        const sendArgs = resendSendMock.mock.calls[0][0]
        expect(sendArgs.from).toMatch(/invites@mail\.example\.com/)
        expect(sendArgs.to).toEqual(['invitee@example.com'])
        expect(sendArgs.replyTo).toBe('owner@example.com')
        expect(asMock(prisma.projectInvite.update)).toHaveBeenCalledWith(
            expect.objectContaining({
                where: { id: 'invite1' },
                data: expect.objectContaining({
                    lastSentAt: expect.any(Date),
                    lastSendError: null,
                }),
            }),
        )
    })

    it('retries once after an error then succeeds', async () => {
        resendSendMock
            .mockResolvedValueOnce({ data: null, error: { name: 'rate_limit', message: 'slow down' } })
            .mockResolvedValueOnce({ data: { id: 'msg-456' }, error: null })

        const result = await sendInviteEmail(baseArgs)

        expect(result.ok).toBe(true)
        expect(result.messageId).toBe('msg-456')
        expect(resendSendMock).toHaveBeenCalledTimes(2)
    })

    it('returns ok=false with the last error after retry-then-fail', async () => {
        resendSendMock
            .mockResolvedValueOnce({ data: null, error: { name: 'server', message: 'boom' } })
            .mockResolvedValueOnce({ data: null, error: { name: 'server', message: 'still boom' } })

        const result = await sendInviteEmail(baseArgs)

        expect(result.ok).toBe(false)
        expect(result.error).toContain('still boom')
        expect(resendSendMock).toHaveBeenCalledTimes(2)
        expect(asMock(prisma.projectInvite.update)).toHaveBeenCalledWith(
            expect.objectContaining({
                data: expect.objectContaining({
                    sendFailureCount: { increment: 1 },
                    lastSendError: expect.stringContaining('still boom'),
                }),
            }),
        )
    })

    it('treats an exception thrown by the SDK as a failure', async () => {
        resendSendMock.mockRejectedValue(new Error('network down'))

        const result = await sendInviteEmail(baseArgs)

        expect(result.ok).toBe(false)
        expect(result.error).toContain('network down')
        expect(resendSendMock).toHaveBeenCalledTimes(2)
    })
})
