"use client"

import { Button } from "@/components/ui/button"
import { Plus, Minus, RotateCcw, Box, Cuboid, Type, EyeOff, BarChart3, SlidersHorizontal } from "lucide-react"
import { useGraphStore } from "@/store/use-graph-store"
import { UndoRedoControls } from "./undo-redo-controls"
import { FocusControls } from "./focus-controls"
import { NodeSizeSlider } from "./node-size-slider"
import { GenerationalToggle } from "./generational-toggle"
import {
    Tooltip,
    TooltipContent,
    TooltipTrigger,
} from "@/components/ui/tooltip"

export function NavigationControls() {
    const { is2D, setIs2D, showLabels, setShowLabels, graphRef, showInsights, setShowInsights, showPhysics, setShowPhysics } = useGraphStore()

    const handleZoom = (factor: number) => {
        if (!graphRef) return
        if (is2D && typeof graphRef.zoom === 'function') {
            const currentZoom = graphRef.zoom()
            graphRef.zoom(currentZoom * (1 / factor), 400) // 0.8 to zoom out? Wait, 0.8 means camera position gets closer if zoom in, but d3 zoom is reversed: scale up is zoom in.
            return
        }

        // 3D Mode
        if (typeof graphRef.cameraPosition === 'function') {
            const { x, y, z } = graphRef.cameraPosition()
            graphRef.cameraPosition(
                { x: x * factor, y: y * factor, z: z * factor },
                null,
                400
            )
        }
    }

    const handleReset = () => {
        if (!graphRef) return
        graphRef.zoomToFit(1000, 100)
    }

    return (
        <div className="absolute bottom-6 right-6 flex flex-col gap-2 z-20 items-end p-2 rounded-xl backdrop-blur-md bg-card/40 border border-primary/20 shadow-[0_0_15px_rgba(0,229,255,0.1)]">
            <UndoRedoControls />
            <div className="flex flex-col gap-2">
                {/* Focus Controls */}
                <FocusControls />

                <GenerationalToggle />

                {/* Insights Toggle */}
                <Tooltip>
                    <TooltipTrigger asChild>
                        <Button
                            variant={showInsights ? "default" : "ghost"}
                            size="icon"
                            className={`transition-all duration-300 ${showInsights ? 'bg-primary/20 text-primary' : 'hover:bg-primary/20 hover:text-primary'}`}
                            onClick={() => setShowInsights(!showInsights)}
                            aria-pressed={showInsights}
                        >
                            <BarChart3 className="h-4 w-4" />
                            <span className="sr-only">Toggle Insights</span>
                        </Button>
                    </TooltipTrigger>
                    <TooltipContent side="left">{showInsights ? "Hide Insights" : "Show Insights"}</TooltipContent>
                </Tooltip>

                {/* Physics Toggle */}
                <Tooltip>
                    <TooltipTrigger asChild>
                        <Button
                            variant={showPhysics ? "default" : "ghost"}
                            size="icon"
                            className={`transition-all duration-300 ${showPhysics ? 'bg-primary/20 text-primary' : 'hover:bg-primary/20 hover:text-primary'}`}
                            onClick={() => setShowPhysics(!showPhysics)}
                            aria-pressed={showPhysics}
                        >
                            <SlidersHorizontal className="h-4 w-4" />
                            <span className="sr-only">Toggle Physics Controls</span>
                        </Button>
                    </TooltipTrigger>
                    <TooltipContent side="left">{showPhysics ? "Hide Physics" : "Tune Physics"}</TooltipContent>
                </Tooltip>

                {/* Labels Toggle */}
                <Tooltip>
                    <TooltipTrigger asChild>
                        <Button
                            variant={showLabels ? "default" : "ghost"}
                            size="icon"
                            className={`transition-all duration-300 ${showLabels ? 'bg-primary/20 text-primary' : 'hover:bg-primary/20 hover:text-primary'}`}
                            onClick={() => setShowLabels(!showLabels)}
                        >
                            {showLabels ? <Type className="h-4 w-4" /> : <EyeOff className="h-4 w-4" />}
                            <span className="sr-only">Toggle Labels</span>
                        </Button>
                    </TooltipTrigger>
                    <TooltipContent side="left">{showLabels ? "Hide Labels" : "Show Labels"}</TooltipContent>
                </Tooltip>

                <NodeSizeSlider />

                {/* 2D/3D Toggle */}
                <Tooltip>
                    <TooltipTrigger asChild>
                        <Button
                            variant="ghost"
                            size="icon"
                            className="hover:bg-primary/20 hover:text-primary transition-all duration-300"
                            onClick={() => setIs2D(!is2D)}
                        >
                            {is2D ? <Box className="h-4 w-4" /> : <Cuboid className="h-4 w-4" />}
                            <span className="sr-only">Toggle 2D/3D</span>
                        </Button>
                    </TooltipTrigger>
                    <TooltipContent side="left">{is2D ? "Switch to 3D" : "Switch to 2D"}</TooltipContent>
                </Tooltip>

                {/* Zoom In */}
                <Tooltip>
                    <TooltipTrigger asChild>
                        <Button
                            variant="ghost"
                            size="icon"
                            className="hover:bg-primary/20 hover:text-primary transition-all duration-300"
                            onClick={() => handleZoom(0.8)}
                        >
                            <Plus className="h-4 w-4" />
                            <span className="sr-only">Zoom In</span>
                        </Button>
                    </TooltipTrigger>
                    <TooltipContent side="left">Zoom In</TooltipContent>
                </Tooltip>

                {/* Zoom Out */}
                <Tooltip>
                    <TooltipTrigger asChild>
                        <Button
                            variant="ghost"
                            size="icon"
                            className="hover:bg-primary/20 hover:text-primary transition-all duration-300"
                            onClick={() => handleZoom(1.2)}
                        >
                            <Minus className="h-4 w-4" />
                            <span className="sr-only">Zoom Out</span>
                        </Button>
                    </TooltipTrigger>
                    <TooltipContent side="left">Zoom Out</TooltipContent>
                </Tooltip>

                {/* Reset View */}
                <Tooltip>
                    <TooltipTrigger asChild>
                        <Button
                            variant="ghost"
                            size="icon"
                            className="hover:bg-primary/20 hover:text-primary transition-all duration-300"
                            onClick={handleReset}
                        >
                            <RotateCcw className="h-4 w-4" />
                            <span className="sr-only">Reset View</span>
                        </Button>
                    </TooltipTrigger>
                    <TooltipContent side="left">Reset View</TooltipContent>
                </Tooltip>
            </div>
        </div>
    )
}
