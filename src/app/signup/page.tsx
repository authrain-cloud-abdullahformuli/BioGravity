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

function SignupInner() {
    const searchParams = useSearchParams()
    const presetEmail = searchParams.get("email") ?? ""
    const next = resolveNext(searchParams.get("next"))
    const emailLocked = presetEmail.length > 0
    const [impulse, setImpulse] = useState(0)
    const [formData, setFormData] = useState({ name: "", email: presetEmail, password: "" })
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
            const res = await fetch("/api/register", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify(formData),
            })

            let data
            const contentType = res.headers.get("content-type")
            if (contentType && contentType.includes("application/json")) {
                data = await res.json()
            } else {
                // If response is not JSON (e.g. 500 error page), handle gracefully
                if (!res.ok) {
                    throw new Error(`Server error: ${res.status} ${res.statusText}`)
                }
            }

            if (!res.ok) {
                throw new Error(data?.message || "Something went wrong")
            }

            // Auto-login after successful registration
            const signInResult = await signIn("credentials", {
                redirect: false,
                email: formData.email,
                password: formData.password,
            })

            if (signInResult?.ok) {
                router.push(next)
            } else {
                console.error("Auto-login failed:", signInResult?.error)
                // Fallback to login page if auto-login fails
                router.push(`/login?next=${encodeURIComponent(next)}`)
            }
        } catch (err: unknown) {
            console.error("Signup error:", err)
            const errorMessage = err instanceof Error ? err.message : "Failed to sign up. Please try again."
            setError(errorMessage)
        } finally {
            setLoading(false)
        }
    }

    return (
        <main className="relative flex min-h-screen flex-col items-center justify-center p-4">
            <ThreeBackground triggerImpulse={impulse} />

            <Card className="relative z-10 w-full max-w-md backdrop-blur-sm bg-background/80">
                <CardHeader>
                    <CardTitle>Sign Up</CardTitle>
                    <CardDescription>Create an account to start mapping relationships.</CardDescription>
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
                                <Label htmlFor="name">Name</Label>
                                <Input id="name" placeholder="John Doe" value={formData.name} onChange={handleChange} required />
                            </div>
                            <div className="flex flex-col space-y-1.5">
                                <Label htmlFor="email">Email</Label>
                                <Input
                                    id="email"
                                    type="email"
                                    placeholder="name@example.com"
                                    value={formData.email}
                                    onChange={handleChange}
                                    required
                                    readOnly={emailLocked}
                                    aria-readonly={emailLocked}
                                />
                                {emailLocked && (
                                    <p className="text-xs text-muted-foreground">Email locked to your invitation.</p>
                                )}
                            </div>
                            <div className="flex flex-col space-y-1.5">
                                <Label htmlFor="password">Password</Label>
                                <Input id="password" type="password" value={formData.password} onChange={handleChange} required minLength={8} />
                            </div>
                        </div>

                        <div className="flex justify-between mt-6">
                            <Button variant="outline" asChild>
                                <Link href="/">Cancel</Link>
                            </Button>
                            <Button type="submit" disabled={loading}>
                                {loading ? "Creating Account..." : "Sign Up"}
                            </Button>
                        </div>
                    </form>
                </CardContent>
            </Card>
        </main>
    )
}

export default function SignupPage() {
    return (
        <Suspense fallback={null}>
            <SignupInner />
        </Suspense>
    )
}
