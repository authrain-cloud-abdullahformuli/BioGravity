"use client"

import { useState } from "react"
import { useRouter } from "next/navigation"
import { Button } from "@/components/ui/button"
import { Alert, AlertDescription } from "@/components/ui/alert"

interface AcceptInviteFormProps {
    token: string
    projectId: string
}

export function AcceptInviteForm({ token, projectId }: AcceptInviteFormProps) {
    const [loading, setLoading] = useState(false)
    const [error, setError] = useState<string | null>(null)
    const router = useRouter()

    const handleAccept = async () => {
        setLoading(true)
        setError(null)
        try {
            const res = await fetch(`/api/invites/${token}/accept`, { method: "POST" })
            const data = await res.json()
            if (!res.ok) {
                throw new Error(data.message || "Failed to accept invitation")
            }
            router.push(`/projects/${data.projectId ?? projectId}`)
        } catch (err) {
            setError(err instanceof Error ? err.message : "Failed to accept invitation")
            setLoading(false)
        }
    }

    return (
        <>
            {error && (
                <Alert variant="destructive">
                    <AlertDescription>{error}</AlertDescription>
                </Alert>
            )}
            <Button onClick={handleAccept} disabled={loading} className="w-full">
                {loading ? "Accepting..." : "Accept invitation"}
            </Button>
        </>
    )
}
