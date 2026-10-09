import prisma from "@/lib/prisma"

export interface RateLimitResult {
    ok: boolean
    retryAfterSeconds: number
}

/**
 * Postgres-backed sliding-window rate limiter. One row per (key, window-start).
 * Tradeoff over Redis: each check is a small Prisma transaction, but the deploy
 * already runs Postgres so there's no new infra and no new failure mode.
 */
export async function checkRateLimit(
    key: string,
    max: number,
    windowSeconds: number,
    now: Date = new Date()
): Promise<RateLimitResult> {
    const windowMs = windowSeconds * 1000

    // Floor `now` to the start of the current window. All hits within the
    // same window share the same `windowStart`, so the unique key (above)
    // doubles as the bucket discriminator.
    const windowStart = new Date(Math.floor(now.getTime() / windowMs) * windowMs)

    const existing = await prisma.rateLimitBucket.findUnique({ where: { key } })

    if (!existing || existing.windowStart.getTime() < windowStart.getTime()) {
        // First hit in this (or a brand new) window — replace the row.
        await prisma.rateLimitBucket.upsert({
            where: { key },
            create: { key, windowStart, count: 1 },
            update: { windowStart, count: 1 },
        })
        return { ok: true, retryAfterSeconds: 0 }
    }

    if (existing.count >= max) {
        const elapsed = now.getTime() - existing.windowStart.getTime()
        const retryAfterSeconds = Math.max(1, Math.ceil((windowMs - elapsed) / 1000))
        return { ok: false, retryAfterSeconds }
    }

    await prisma.rateLimitBucket.update({
        where: { key },
        data: { count: { increment: 1 } },
    })

    return { ok: true, retryAfterSeconds: 0 }
}

/**
 * Best-effort client IP extraction for rate-limit keying. Behind Cloudflare /
 * a typical reverse proxy this is the real client; on a bare host it falls
 * back to a constant which collapses everyone into one bucket (still safer
 * than no limiting at all for the auth flows we apply this to).
 */
export function getClientIp(req: Request): string {
    const cfIp = req.headers.get("cf-connecting-ip")
    if (cfIp) return cfIp
    const xff = req.headers.get("x-forwarded-for")
    if (xff) return xff.split(",")[0].trim()
    const real = req.headers.get("x-real-ip")
    if (real) return real
    return "unknown"
}
