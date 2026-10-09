"use client"

import { memo, useMemo } from "react"
import { Input } from "@/components/ui/input"
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from "@/components/ui/select"
import { useGraphStore } from "@/store/use-graph-store"
import { Search, X } from "lucide-react"
import { Button } from "@/components/ui/button"
import {
    Tooltip,
    TooltipContent,
    TooltipTrigger,
} from "@/components/ui/tooltip"

function FilterPanelImpl() {
    // Individual selectors — subscribes to *just* these fields, not the whole store.
    const searchQuery = useGraphStore(s => s.searchQuery)
    const setSearchQuery = useGraphStore(s => s.setSearchQuery)
    const selectedTypeFilter = useGraphStore(s => s.selectedTypeFilter)
    const setSelectedTypeFilter = useGraphStore(s => s.setSelectedTypeFilter)
    const elements = useGraphStore(s => s.elements)

    const uniqueTypes = useMemo(
        () => Array.from(new Set(elements.map(e => e.type))).sort(),
        [elements]
    )

    return (
        <div className="flex flex-col gap-4 p-4 bg-background/80 backdrop-blur-sm border rounded-lg shadow-sm w-full max-w-sm">
            <div className="relative">
                <Search className="absolute left-2 top-2.5 h-4 w-4 text-muted-foreground" />
                <Input
                    placeholder="Search elements..."
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    className="pl-8"
                />
                {searchQuery && (
                    <Tooltip>
                        <TooltipTrigger asChild>
                            <Button
                                variant="ghost"
                                size="icon"
                                className="absolute right-1 top-1 h-7 w-7"
                                onClick={() => setSearchQuery("")}
                            >
                                <X className="h-3 w-3" />
                                <span className="sr-only">Clear Search</span>
                            </Button>
                        </TooltipTrigger>
                        <TooltipContent side="bottom">Clear Search</TooltipContent>
                    </Tooltip>
                )}
            </div>

            <div className="flex items-center gap-2">
                <Select value={selectedTypeFilter || "all"} onValueChange={(val) => setSelectedTypeFilter(val === "all" ? null : val)}>
                    <SelectTrigger className="w-full">
                        <SelectValue placeholder="Filter by Type" />
                    </SelectTrigger>
                    <SelectContent>
                        <SelectItem value="all">All Types</SelectItem>
                        {uniqueTypes.map((type) => (
                            <SelectItem key={type} value={type}>
                                {type}
                            </SelectItem>
                        ))}
                    </SelectContent>
                </Select>
                {selectedTypeFilter && (
                    <Tooltip>
                        <TooltipTrigger asChild>
                            <Button
                                variant="ghost"
                                size="icon"
                                onClick={() => setSelectedTypeFilter(null)}
                            >
                                <X className="h-4 w-4" />
                                <span className="sr-only">Clear Filter</span>
                            </Button>
                        </TooltipTrigger>
                        <TooltipContent side="bottom">Clear Filter</TooltipContent>
                    </Tooltip>
                )}
            </div>
        </div>
    )
}

export const FilterPanel = memo(FilterPanelImpl)
