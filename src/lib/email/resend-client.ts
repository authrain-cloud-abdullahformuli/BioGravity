import { Resend } from "resend"

let cachedClient: Resend | null = null

/**
 * Returns true when RESEND_API_KEY is present. Used by `sendInviteEmail` to
 * short-circuit gracefully in local dev or when the key has not been provisioned.
 */
export function isEmailEnabled(): boolean {
    return Boolean(process.env.RESEND_API_KEY)
}

/**
 * Lazily-instantiated Resend client. Returns null when the API key is unset so
 * that callers can decide whether to fail or skip without ever throwing at
 * import time. Reads the EU vs US tenant from the API key itself — no region
 * env var needed; Resend's SDK auto-routes.
 */
export function getResendClient(): Resend | null {
    if (!isEmailEnabled()) return null
    if (!cachedClient) {
        cachedClient = new Resend(process.env.RESEND_API_KEY)
    }
    return cachedClient
}

export const DEFAULT_FROM = "BioGravity Invites <invites@mail.example.com>"

export function getFromAddress(): string {
    return process.env.RESEND_FROM || DEFAULT_FROM
}
