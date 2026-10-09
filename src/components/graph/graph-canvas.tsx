"use client"

import { useEffect, useState, useRef } from "react"
import { useTheme } from "next-themes"
import { GraphScene, GraphSceneRef } from "./graph-scene"
import { useGraphStore } from "@/store/use-graph-store"
import { Loader2 } from "lucide-react"
import { DetailsPanel } from "./details-panel"
import { NavigationControls } from "./navigation-controls"
import { FilterPanel } from "./filter-panel"
import { InsightsPanel } from "./insights-panel"
import { PhysicsSettings } from "@/components/settings/physics-settings"
import { Sheet, SheetContent, SheetDescription, SheetHeader, SheetTitle } from "@/components/ui/sheet"

interface GraphCanvasProps {
    projectId: string
    canEdit: boolean
}

export function GraphCanvas({ projectId, canEdit }: GraphCanvasProps) {
    const { fetchGraphData, loading, error, elements, showInsights, showPhysics, setShowPhysics } = useGraphStore()
    const { resolvedTheme } = useTheme()
    const [mounted, setMounted] = useState(false)
    const graphSceneRef = useRef<GraphSceneRef>(null)

    useEffect(() => {
        setMounted(true)
    }, [])

    useEffect(() => {
        fetchGraphData(projectId)
    }, [projectId, fetchGraphData])

    if (error) {
        return (
            <div className="flex items-center justify-center h-full w-full text-destructive">
                <p>Error loading graph: {error}</p>
            </div>
        )
    }

    return (
        <div className="relative w-full h-full bg-background transition-colors duration-300">
            <DetailsPanel onEditClick={() => graphSceneRef.current?.openEditModal()} />
            <NavigationControls />

            <div className="absolute top-4 left-4 z-10 w-80">
                <FilterPanel />
            </div>

            {showInsights && (
                <div className="absolute top-4 right-4 z-10 w-80 max-h-[calc(100vh-8rem)]">
                    <InsightsPanel />
                </div>
            )}

            <Sheet open={showPhysics} onOpenChange={setShowPhysics}>
                <SheetContent side="right" className="w-full sm:max-w-md overflow-y-auto">
                    <SheetHeader>
                        <SheetTitle>Physics Controls</SheetTitle>
                        <SheetDescription>
                            Tune graph forces. Changes apply immediately. Session-only — not saved per project.
                        </SheetDescription>
                    </SheetHeader>
                    <div className="mt-4">
                        <PhysicsSettings />
                    </div>
                </SheetContent>
            </Sheet>

            {loading && (
                <div className="absolute inset-0 flex items-center justify-center z-10 bg-black/20 backdrop-blur-sm">
                    <Loader2 className="h-8 w-8 animate-spin text-white" />
                </div>
            )}

            {!loading && elements.length === 0 && (
                <div className="absolute inset-0 flex items-center justify-center z-10 pointer-events-none">
                    <p className="text-muted-foreground bg-background/80 p-4 rounded-md backdrop-blur-md">
                        Graph is empty. Use the seed button or add data manually.
                    </p>
                </div>
            )}

            {/* react-force-graph-3d creates its own WebGL context, no R3F Canvas needed */}
            <GraphScene ref={graphSceneRef} theme={mounted ? resolvedTheme : 'dark'} canEdit={canEdit} />
        </div>
    )
}
