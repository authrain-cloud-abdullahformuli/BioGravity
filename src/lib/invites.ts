import { randomBytes } from "crypto"

export const INVITE_TTL_DAYS = 7

export type InviteRole = "Viewer" | "Editor" | "Admin"
export type InviteStatus = "pending" | "expired" | "accepted" | "revoked"

/**
 * Generates a 256-bit URL-safe random token.
 * Used as the unguessable component of an invite link.
 */
export function generateInviteToken(): string {
    return randomBytes(32).toString("base64url")
}

/**
 * Lowercases and trims an email so that "Alice@X.com " and "alice@x.com"
 * collide in invite lookups and acceptance checks.
 */
export function normalizeEmail(email: string): string {
    return email.trim().toLowerCase()
}

/**
 * Computes an invite's status from its database row.
 * Order matters: revoked beats expired beats accepted beats pending.
 */
export function inviteStatus(invite: {
    expiresAt: Date
    acceptedAt: Date | null
    revokedAt: Date | null
}, now: Date = new Date()): InviteStatus {
    if (invite.revokedAt) return "revoked"
    if (invite.acceptedAt) return "accepted"
    if (invite.expiresAt.getTime() <= now.getTime()) return "expired"
    return "pending"
}

/**
 * Default expiration for a freshly created invite (now + INVITE_TTL_DAYS).
 */
export function defaultInviteExpiry(now: Date = new Date()): Date {
    return new Date(now.getTime() + INVITE_TTL_DAYS * 24 * 60 * 60 * 1000)
}

/**
 * Returns the absolute URL a user should visit to accept this invite.
 * Prefers NEXTAUTH_URL — never trusts a request Host/Origin header, which an
 * attacker can spoof to make the invite email link at an attacker domain.
 * Falls back to the supplied request origin only when NEXTAUTH_URL is unset
 * (i.e. local dev with no override).
 */
export function buildInviteUrl(requestOrigin: string, token: string): string {
    const trusted = process.env.NEXTAUTH_URL || requestOrigin
    const trimmed = trusted.replace(/\/+$/, "")
    return `${trimmed}/invite/${token}`
}
