"use client"

import { Circle } from "lucide-react"
import { Slider } from "@/components/ui/slider"
import { useGraphStore } from "@/store/use-graph-store"
import {
    Tooltip,
    TooltipContent,
    TooltipTrigger,
} from "@/components/ui/tooltip"

export function NodeSizeSlider() {
    const { nodeSize, setNodeSize } = useGraphStore()

    return (
        <div className="flex h-10 w-10 items-center justify-center rounded-md hover:bg-primary/20 hover:text-primary transition-all duration-300 relative group cursor-pointer text-foreground">
            <Tooltip>
                <TooltipTrigger asChild>
                    <Circle className="h-4 w-4" />
                </TooltipTrigger>
                <TooltipContent side="top">Node Size</TooltipContent>
            </Tooltip>
            <div className="absolute right-12 top-1/2 -translate-y-1/2 w-40 opacity-0 group-hover:opacity-100 transition-opacity bg-background p-3 rounded-md shadow-lg border pointer-events-none group-hover:pointer-events-auto flex items-center gap-3">
                <span className="text-xs text-muted-foreground w-8 text-right font-medium">{nodeSize.toFixed(1)}x</span>
                <Slider
                    value={[nodeSize]}
                    min={0.5}
                    max={3.0}
                    step={0.1}
                    onValueChange={(vals) => setNodeSize(vals[0])}
                    className="flex-1"
                />
            </div>
        </div>
    )
}
