import { NextResponse } from "next/server"
import prisma from "@/lib/prisma"

// Liveness + readiness probe. The DB check distinguishes "container up, app crashed"
// from "container up, DB unreachable" — the latter must not receive traffic.
export async function GET() {
    try {
        await prisma.$queryRaw`SELECT 1`
        return NextResponse.json({ status: "ok" }, { status: 200 })
    } catch (error) {
        return NextResponse.json(
            { status: "degraded", error: error instanceof Error ? error.message : String(error) },
            { status: 503 }
        )
    }
}
