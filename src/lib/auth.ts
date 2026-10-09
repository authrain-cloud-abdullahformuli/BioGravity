import { NextAuthOptions } from "next-auth"
import { PrismaAdapter } from "@next-auth/prisma-adapter"
import CredentialsProvider from "next-auth/providers/credentials"
import prisma from "@/lib/prisma"
import { compare } from "bcryptjs"
import { checkRateLimit } from "@/lib/rate-limit"

const ONE_DAY_SECONDS = 60 * 60 * 24

export const authOptions: NextAuthOptions = {
    adapter: PrismaAdapter(prisma),
    session: {
        strategy: "jwt",
        // Cap session lifetime so a stolen JWT expires within a day rather than the default 30.
        maxAge: ONE_DAY_SECONDS,
    },
    pages: {
        signIn: "/login",
    },
    providers: [
        CredentialsProvider({
            name: "Credentials",
            credentials: {
                email: { label: "Email", type: "email" },
                password: { label: "Password", type: "password" },
            },
            async authorize(credentials, req) {
                if (!credentials?.email || !credentials?.password) {
                    return null
                }

                const xff = req?.headers?.["x-forwarded-for"]
                const ip = (Array.isArray(xff) ? xff[0] : xff)?.split(",")[0]?.trim()
                    || (req?.headers?.["cf-connecting-ip"] as string | undefined)
                    || "unknown"

                // 5 attempts per 15 minutes per (IP, email) — slows online brute-force
                // without locking real users out across multiple sessions.
                const rl = await checkRateLimit(
                    `auth:login:${ip}:${credentials.email.toLowerCase()}`,
                    5,
                    15 * 60,
                )
                if (!rl.ok) {
                    return null
                }

                const user = await prisma.user.findUnique({
                    where: {
                        email: credentials.email,
                    },
                })

                if (!user || !user.password) {
                    return null
                }

                const isPasswordValid = await compare(
                    credentials.password,
                    user.password
                )

                if (!isPasswordValid) {
                    return null
                }

                return {
                    id: user.id,
                    email: user.email,
                    name: user.name,
                    image: user.image,
                }
            },
        }),
    ],
    callbacks: {
        async session({ session, token }) {
            if (typeof token.id === "string" && session.user) {
                session.user.id = token.id
            }
            return session
        },
        async jwt({ token, user }) {
            if (user) {
                token.id = user.id
            }
            return token
        },
    },
}
