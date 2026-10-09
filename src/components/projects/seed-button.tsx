"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Database } from "lucide-react"
import { useRouter } from "next/navigation"

interface SeedButtonProps {
    projectId: string
}

export function SeedButton({ projectId }: SeedButtonProps) {
    const [loading, setLoading] = useState(false)
    const router = useRouter()

    const handleSeed = async () => {
        setLoading(true)
        try {
            const res = await fetch(`/api/projects/${projectId}/seed`, {
                method: "POST"
            })
            if (res.ok) {
                router.refresh()
                // Force reload of graph data if store doesn't auto-refresh from page props (which it doesn't)
                // The store fetches on mount. 
                // We might need to trigger a re-fetch.
                // Or simply simple: reload page.
                window.location.reload()
            }
        } catch (error) {
            console.error(error)
        } finally {
            setLoading(false)
        }
    }

    return (
        <Button variant="secondary" size="sm" onClick={handleSeed} disabled={loading}>
            <Database className="mr-2 h-4 w-4" />
            {loading ? "Seeding..." : "Seed Data"}
        </Button>
    )
}
