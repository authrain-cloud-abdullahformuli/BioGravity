"use client"

import { CalendarHeart } from "lucide-react"
import { Button } from "@/components/ui/button"
import { useGraphStore } from "@/store/use-graph-store"
import {
    Tooltip,
    TooltipContent,
    TooltipTrigger,
} from "@/components/ui/tooltip"

export function GenerationalToggle() {
    const { generationalOrdering, setGenerationalOrdering } = useGraphStore()

    return (
        <Tooltip>
            <TooltipTrigger asChild>
                <Button
                    variant={generationalOrdering ? "default" : "ghost"}
                    size="icon"
                    className={`transition-all duration-300 ${generationalOrdering ? 'bg-primary/20 text-primary' : 'hover:bg-primary/20 hover:text-primary'}`}
                    onClick={() => setGenerationalOrdering(!generationalOrdering)}
                >
                    <CalendarHeart className="h-4 w-4" />
                    <span className="sr-only">Toggle Generational Ordering</span>
                </Button>
            </TooltipTrigger>
            <TooltipContent side="left">{generationalOrdering ? "Generational Ordering On" : "Generational Ordering Off"}</TooltipContent>
        </Tooltip>
    )
}
