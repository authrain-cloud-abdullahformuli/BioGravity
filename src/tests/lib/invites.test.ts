import { describe, it, expect } from 'vitest'
import {
    INVITE_TTL_DAYS,
    buildInviteUrl,
    defaultInviteExpiry,
    generateInviteToken,
    inviteStatus,
    normalizeEmail,
} from '@/lib/invites'

describe('STORY-MEM-007 — invite helpers (CC-13)', () => {
    describe('generateInviteToken', () => {
        it('returns a URL-safe string at least 32 characters long', () => {
            const token = generateInviteToken()
            expect(token).toMatch(/^[A-Za-z0-9_-]+$/)
            expect(token.length).toBeGreaterThanOrEqual(32)
        })

        it('produces unique tokens across calls', () => {
            const tokens = new Set<string>()
            for (let i = 0; i < 1000; i += 1) tokens.add(generateInviteToken())
            expect(tokens.size).toBe(1000)
        })
    })

    describe('normalizeEmail', () => {
        it('lowercases and trims', () => {
            expect(normalizeEmail('  Bob@X.COM  ')).toBe('bob@x.com')
        })
    })

    describe('inviteStatus', () => {
        const future = new Date(Date.now() + 1000 * 60 * 60)
        const past = new Date(Date.now() - 1000 * 60 * 60)

        it('returns "pending" for a fresh non-accepted non-revoked invite', () => {
            expect(inviteStatus({ expiresAt: future, acceptedAt: null, revokedAt: null })).toBe('pending')
        })

        it('returns "revoked" when revokedAt is set, even if not expired', () => {
            expect(inviteStatus({ expiresAt: future, acceptedAt: null, revokedAt: new Date() })).toBe('revoked')
        })

        it('returns "accepted" when acceptedAt is set and not revoked', () => {
            expect(inviteStatus({ expiresAt: future, acceptedAt: new Date(), revokedAt: null })).toBe('accepted')
        })

        it('returns "expired" when expiresAt has passed', () => {
            expect(inviteStatus({ expiresAt: past, acceptedAt: null, revokedAt: null })).toBe('expired')
        })

        it('prefers "revoked" over "accepted" if both are set', () => {
            expect(inviteStatus({ expiresAt: future, acceptedAt: new Date(), revokedAt: new Date() })).toBe('revoked')
        })
    })

    describe('defaultInviteExpiry', () => {
        it(`is exactly INVITE_TTL_DAYS (=${INVITE_TTL_DAYS}) days in the future`, () => {
            const now = new Date('2026-05-19T10:00:00Z')
            const expiry = defaultInviteExpiry(now)
            const diffMs = expiry.getTime() - now.getTime()
            expect(diffMs).toBe(INVITE_TTL_DAYS * 24 * 60 * 60 * 1000)
        })
    })

    describe('buildInviteUrl', () => {
        it('appends /invite/<token> to the origin without trailing slashes', () => {
            expect(buildInviteUrl('https://app.example.com', 'abc')).toBe('https://app.example.com/invite/abc')
            expect(buildInviteUrl('https://app.example.com/', 'abc')).toBe('https://app.example.com/invite/abc')
            expect(buildInviteUrl('https://app.example.com///', 'abc')).toBe('https://app.example.com/invite/abc')
        })
    })
})
