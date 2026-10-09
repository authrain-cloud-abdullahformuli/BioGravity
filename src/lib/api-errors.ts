import { NextResponse } from "next/server"

/**
 * Uniform JSON error response. The body carries both `error` and `message`
 * keyed to the same string so existing clients reading either key keep working
 * while new code can rely on `error`.
 */
export function jsonError(
    status: number,
    error: string,
    details?: unknown
): NextResponse {
    return NextResponse.json(
        details === undefined ? { error, message: error } : { error, message: error, details },
        { status }
    )
}
