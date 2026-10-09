"use client"

import { Button } from "@/components/ui/button"
import { Camera } from "lucide-react"
import { useGraphStore } from "@/store/use-graph-store"

export function PrintscreenButton() {
    const { setTriggerScreenshot } = useGraphStore()

    return (
        <Button
            variant="outline"
            size="sm"
            onClick={() => setTriggerScreenshot(true)}
        >
            <Camera className="mr-2 h-4 w-4" /> Printscreen
        </Button>
    )
}
