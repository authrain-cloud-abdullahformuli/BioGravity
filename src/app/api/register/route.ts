import { NextResponse } from "next/server"
import { hash } from "bcryptjs"
import prisma from "@/lib/prisma"
import { z } from "zod"
import { checkRateLimit, getClientIp } from "@/lib/rate-limit"
import { logError } from "@/lib/logger"

const userSchema = z.object({
    name: z.string().min(1, "Name is required").max(200),
    email: z.string().min(1, "Email is required").email("Invalid email").max(320),
    password: z.string().min(12, "Password must be at least 12 characters").max(200),
})

export async function POST(req: Request) {
    try {
        const ip = getClientIp(req)
        const rl = await checkRateLimit(`auth:register:${ip}`, 5, 15 * 60)
        if (!rl.ok) {
            return NextResponse.json(
                { user: null, message: "Too many requests, please try again later." },
                { status: 429, headers: { "Retry-After": String(rl.retryAfterSeconds) } }
            )
        }

        const body = await req.json()
        const { email, name, password } = userSchema.parse(body)

        const existingUser = await prisma.user.findUnique({
            where: { email: email },
        })

        if (existingUser) {
            return NextResponse.json(
                { user: null, message: "User with this email already exists" },
                { status: 409 }
            )
        }

        const hashedPassword = await hash(password, 12)

        const newUser = await prisma.user.create({
            data: {
                email,
                name,
                password: hashedPassword,
            },
        })

        const { password: omittedPassword, ...rest } = newUser
        void omittedPassword

        return NextResponse.json(
            { user: rest, message: "User created successfully" },
            { status: 201 }
        )
    } catch (error) {
        if (error instanceof z.ZodError) {
            return NextResponse.json(
                { user: null, message: error.issues[0]?.message ?? "Invalid request" },
                { status: 400 }
            )
        }
        logError({ action: "auth.register" }, error)
        return NextResponse.json(
            { user: null, message: "Something went wrong" },
            { status: 500 }
        )
    }
}
