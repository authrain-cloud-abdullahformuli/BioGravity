import { render } from "react-email"
import prisma from "@/lib/prisma"
import { getFromAddress, getResendClient, isEmailEnabled } from "./resend-client"
import { InviteEmail, renderInviteText, type InviteEmailProps } from "./templates/InviteEmail"

export interface SendInviteResult {
    ok: boolean
    messageId?: string
    error?: string
}

interface SendInviteArgs {
    inviteId: string
    projectId: string
    actorUserId: string
    toEmail: string
    replyTo: string
    template: InviteEmailProps
}

const MAX_ATTEMPTS = 2
const ATTEMPT_TIMEOUT_MS = 1500
const RETRY_DELAY_MS = 250

function truncate(message: string, max = 256): string {
    return message.length > max ? message.slice(0, max) : message
}

function logLine(action: string, fields: Record<string, unknown>): void {
    try {
        console.info(JSON.stringify({ action, ...fields }))
    } catch {
        // logging must never throw
    }
}

async function withTimeout<T>(promise: Promise<T>, ms: number, label: string): Promise<T> {
    return new Promise<T>((resolve, reject) => {
        const timer = setTimeout(() => reject(new Error(`${label} timeout after ${ms}ms`)), ms)
        promise.then(
            value => { clearTimeout(timer); resolve(value) },
            err => { clearTimeout(timer); reject(err) },
        )
    })
}

/**
 * Sends the invite email via Resend and records delivery state on the invite row.
 *
 * Never throws — failures return `{ ok: false, error }` and persist
 * `sendFailureCount` + `lastSendError` so the inviter UI can surface them.
 * On success, persists `lastSentAt` and clears `lastSendError`.
 *
 * When RESEND_API_KEY is unset, short-circuits with `ok: false, error: "missing api key"`
 * so local dev keeps working without a network call.
 */
export async function sendInviteEmail({
    inviteId,
    projectId,
    actorUserId,
    toEmail,
    replyTo,
    template,
}: SendInviteArgs): Promise<SendInviteResult> {
    logLine("email.send.start", { inviteId, projectId, actorUserId })

    if (!isEmailEnabled()) {
        const error = "RESEND_API_KEY missing"
        await persistFailure(inviteId, error)
        logLine("email.send.skipped", { inviteId, reason: error })
        return { ok: false, error }
    }

    const client = getResendClient()
    if (!client) {
        const error = "Resend client unavailable"
        await persistFailure(inviteId, error)
        return { ok: false, error }
    }

    const html = await render(InviteEmail(template))
    const text = renderInviteText(template)
    const subject = `${template.inviterName} invited you to ${template.projectName} on BioGravity`

    let lastError: string | undefined
    for (let attempt = 1; attempt <= MAX_ATTEMPTS; attempt += 1) {
        try {
            const response = await withTimeout(
                client.emails.send({
                    from: getFromAddress(),
                    to: [toEmail],
                    replyTo,
                    subject,
                    html,
                    text,
                }),
                ATTEMPT_TIMEOUT_MS,
                "resend.emails.send",
            )

            if (response.error) {
                lastError = truncate(`${response.error.name ?? "ResendError"}: ${response.error.message ?? "unknown"}`)
                logLine("email.send.error", { inviteId, attempt, errorCode: response.error.name })
            } else if (response.data) {
                await persistSuccess(inviteId)
                logLine("email.send.ok", { inviteId, attempt, resendMessageId: response.data.id })
                return { ok: true, messageId: response.data.id }
            } else {
                lastError = "empty Resend response"
                logLine("email.send.error", { inviteId, attempt, errorCode: "empty-response" })
            }
        } catch (err) {
            lastError = truncate(err instanceof Error ? err.message : String(err))
            logLine("email.send.error", { inviteId, attempt, errorCode: "exception" })
        }

        if (attempt < MAX_ATTEMPTS) {
            await new Promise(r => setTimeout(r, RETRY_DELAY_MS))
        }
    }

    await persistFailure(inviteId, lastError ?? "unknown error")
    return { ok: false, error: lastError }
}

async function persistSuccess(inviteId: string): Promise<void> {
    try {
        await prisma.projectInvite.update({
            where: { id: inviteId },
            data: { lastSentAt: new Date(), lastSendError: null },
        })
    } catch (err) {
        logLine("email.send.persist_error", { inviteId, errorCode: "persist-success", error: String(err) })
    }
}

async function persistFailure(inviteId: string, error: string): Promise<void> {
    try {
        await prisma.projectInvite.update({
            where: { id: inviteId },
            data: {
                sendFailureCount: { increment: 1 },
                lastSendError: truncate(error),
            },
        })
    } catch (err) {
        logLine("email.send.persist_error", { inviteId, errorCode: "persist-failure", error: String(err) })
    }
}
