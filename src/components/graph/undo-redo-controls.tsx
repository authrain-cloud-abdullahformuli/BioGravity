"use client"

import { Button } from "@/components/ui/button"
import { useGraphStore } from "@/store/use-graph-store"
import { Undo, Redo } from "lucide-react"
import {
    Tooltip,
    TooltipContent,
    TooltipTrigger,
} from "@/components/ui/tooltip"

export function UndoRedoControls() {
    const { undo, redo, history } = useGraphStore()

    return (
        <div className="flex gap-2">
            <Tooltip>
                <TooltipTrigger asChild>
                    <Button
                        variant="secondary"
                        size="icon"
                        onClick={undo}
                        disabled={history.past.length === 0}
                    >
                        <Undo className="h-4 w-4" />
                        <span className="sr-only">Undo</span>
                    </Button>
                </TooltipTrigger>
                <TooltipContent side="top">Undo</TooltipContent>
            </Tooltip>

            <Tooltip>
                <TooltipTrigger asChild>
                    <Button
                        variant="secondary"
                        size="icon"
                        onClick={redo}
                        disabled={history.future.length === 0}
                    >
                        <Redo className="h-4 w-4" />
                        <span className="sr-only">Redo</span>
                    </Button>
                </TooltipTrigger>
                <TooltipContent side="top">Redo</TooltipContent>
            </Tooltip>
        </div>
    )
}
