"use client"

import Link from "next/link"
import { Suspense, useState } from "react"
import { useRouter, useSearchParams } from "next/navigation"
import { signIn } from "next-auth/react"
import { ThreeBackground } from "@/components/landing/ThreeBackground"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Alert, AlertDescription } from "@/components/ui/alert"

function resolveNext(next: string | null): string {
    if (!next || !next.startsWith("/")) return "/dashboard"
    return next
}

function LoginInner() {
    const searchParams = useSearchParams()
    const presetEmail = searchParams.get("email") ?? ""
    const next = resolveNext(searchParams.get("next"))
    const [impulse, setImpulse] = useState(0)
    const [formData, setFormData] = useState({ email: presetEmail, password: "" })
    const [error, setError] = useState<string | null>(null)
    const [loading, setLoading] = useState(false)
    const router = useRouter()

    const handleInteraction = () => {
        setImpulse(prev => prev + 1)
        setTimeout(() => setImpulse(prev => Math.max(0, prev - 1)), 500)
    }

    const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        setFormData(prev => ({ ...prev, [e.target.id]: e.target.value }))
        handleInteraction()
    }

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault()
        setLoading(true)
        setError(null)

        try {
            const res = await signIn("credentials", {
                redirect: false,
                email: formData.email,
                password: formData.password,
            })

            if (res?.error) {
                setError("Invalid email or password")
            } else {
                router.push(next)
            }
        } catch {
            setError("Something went wrong")
        } finally {
            setLoading(false)
        }
    }

    return (
        <main className="relative flex min-h-screen flex-col items-center justify-center p-4">
            <ThreeBackground triggerImpulse={impulse} />

            <Card className="z-10 w-full max-w-md backdrop-blur-sm bg-background/80">
                <CardHeader>
                    <CardTitle>Log In</CardTitle>
                    <CardDescription>Enter your credentials to access your projects.</CardDescription>
                </CardHeader>
                <CardContent>
                    <form onSubmit={handleSubmit}>
                        <div className="grid w-full items-center gap-4">
                            {error && (
                                <Alert variant="destructive">
                                    <AlertDescription>{error}</AlertDescription>
                                </Alert>
                            )}
                            <div className="flex flex-col space-y-1.5">
                                <Label htmlFor="email">Email</Label>
                                <Input id="email" type="email" placeholder="name@example.com" value={formData.email} onChange={handleChange} required />
                            </div>
                            <div className="flex flex-col space-y-1.5">
                                <Label htmlFor="password">Password</Label>
                                <Input id="password" type="password" value={formData.password} onChange={handleChange} required />
                            </div>
                        </div>

                        <div className="flex justify-between mt-6">
                            <Button variant="outline" asChild>
                                <Link href="/">Cancel</Link>
                            </Button>
                            <Button type="submit" disabled={loading}>
                                {loading ? "Logging In..." : "Log In"}
                            </Button>
                        </div>
                    </form>
                </CardContent>
            </Card>
        </main>
    )
}

export default function LoginPage() {
    return (
        <Suspense fallback={null}>
            <LoginInner />
        </Suspense>
    )
}
