"use client"

import { Button } from "@/components/ui/button"
import { Slider } from "@/components/ui/slider"
import { useGraphStore } from "@/store/use-graph-store"
import { Focus, X } from "lucide-react"
import {
    Popover,
    PopoverContent,
    PopoverTrigger,
} from "@/components/ui/popover"
import { Label } from "@/components/ui/label"
import {
    Tooltip,
    TooltipContent,
    TooltipTrigger,
} from "@/components/ui/tooltip"

export function FocusControls() {
    const {
        focusMode,
        focusDegrees,
        selectedNodeId,
        setFocusMode,
        setFocusDegrees
    } = useGraphStore()

    const handleToggleFocus = (e: React.MouseEvent) => {
        if (focusMode) {
            setFocusMode(false)
            // Prevent popover from opening if we're turning it off
            e.preventDefault()
        } else if (selectedNodeId) {
            setFocusMode(true)
        }
    }

    return (
        <Popover>
            <Tooltip>
                <TooltipTrigger asChild>
                    <PopoverTrigger asChild>
                        <Button
                            variant={focusMode ? "default" : "ghost"}
                            size="icon"
                            className={`
                                transition-all duration-300 relative
                                ${focusMode
                                    ? "bg-primary text-primary-foreground"
                                    : "hover:bg-primary/20 hover:text-primary"}
                            `}
                            onClick={handleToggleFocus}
                            disabled={!selectedNodeId && !focusMode}
                        >
                            {focusMode ? <X className="h-4 w-4" /> : <Focus className="h-4 w-4" />}
                            {focusMode && (
                                <span className="absolute -top-1 -right-1 flex h-2 w-2">
                                    <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-primary-foreground opacity-75"></span>
                                    <span className="relative inline-flex rounded-full h-2 w-2 bg-primary-foreground"></span>
                                </span>
                            )}
                            <span className="sr-only">Toggle Focus Mode</span>
                        </Button>
                    </PopoverTrigger>
                </TooltipTrigger>
                <TooltipContent side="left">
                    {focusMode ? "Exit Focus Mode" : "Focus on selected node"}
                </TooltipContent>
            </Tooltip>
            {focusMode && (
                <PopoverContent side="left" className="w-64 z-50">
                    <div className="space-y-4">
                        <div className="space-y-2">
                            <div className="flex items-center justify-between">
                                <Label>Degrees of Separation</Label>
                                <span className="text-sm font-mono text-primary">{focusDegrees}</span>
                            </div>
                            <Slider
                                value={[focusDegrees]}
                                min={1}
                                max={5}
                                step={1}
                                onValueChange={(val: number[]) => setFocusDegrees(val[0])}
                                className="py-4"
                            />
                            <p className="text-[10px] text-muted-foreground leading-tight italic">
                                Showing elements within {focusDegrees} {focusDegrees === 1 ? 'connection' : 'connections'} of the selected node.
                            </p>
                        </div>
                    </div>
                </PopoverContent>
            )}
        </Popover>
    )
}
