type LogLevel = "info" | "warn" | "error"

interface LogContext {
    action: string
    projectId?: string
    userId?: string
    requestId?: string
    [key: string]: unknown
}

function emit(level: LogLevel, context: LogContext): void {
    const line = JSON.stringify({ level, ts: new Date().toISOString(), ...context })
    if (level === "error") console.error(line)
    else if (level === "warn") console.warn(line)
    else console.info(line)
}

/**
 * Structured info/warn log. Goes to stdout as JSON so log aggregators can parse it.
 * Always pass at least { action }. Add projectId / userId when known.
 */
export function log(context: LogContext): void {
    emit("info", context)
}

export function warn(context: LogContext): void {
    emit("warn", context)
}

/**
 * Structured error log. Captures the error message + code, never the raw object
 * (which Prisma errors include verbose query info we don't want in logs).
 */
export function logError(context: LogContext, err: unknown): void {
    const message = err instanceof Error ? err.message : String(err)
    const code = err instanceof Error && "code" in err ? (err as { code: unknown }).code : undefined
    emit("error", { ...context, error: message, code: code === undefined ? null : String(code) })
}
