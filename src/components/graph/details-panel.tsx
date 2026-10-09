"use client"

import { memo, useMemo } from "react"
import { useParams } from "next/navigation"
import { useGraphStore } from "@/store/use-graph-store"
import { formatDate } from "@/lib/utils"
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { X, Pin, PinOff, Edit } from "lucide-react"
import {
    Tooltip,
    TooltipContent,
    TooltipTrigger,
} from "@/components/ui/tooltip"

export interface DetailsPanelProps {
    onEditClick?: () => void
}

function DetailsPanelImpl({ onEditClick }: DetailsPanelProps) {
    const selectedNodeId = useGraphStore(s => s.selectedNodeId)
    const elements = useGraphStore(s => s.elements)
    const setSelectedNode = useGraphStore(s => s.setSelectedNode)
    const togglePin = useGraphStore(s => s.togglePin)
    const params = useParams<{ id: string }>()
    const projectId = params?.id ?? ''

    const selectedNode = useMemo(
        () => (selectedNodeId ? elements.find(el => el.id === selectedNodeId) ?? null : null),
        [elements, selectedNodeId]
    )

    if (!selectedNode) return null

    const isPinned = !!(selectedNode as { pinned?: boolean }).pinned

    return (
        <div className="absolute top-4 right-4 w-80 z-20">
            <Card className="backdrop-blur-xl bg-card/80 shadow-[0_0_15px_rbga(0,229,255,0.1)] border-primary/20">
                <CardHeader className="flex flex-row items-start justify-between pb-2">
                    <div className="flex-1 overflow-hidden">
                        <CardTitle className="text-lg truncate">{selectedNode.name}</CardTitle>
                        <CardDescription>{selectedNode.type}</CardDescription>
                    </div>
                    <div className="flex gap-1">
                        <Tooltip>
                            <TooltipTrigger asChild>
                                <Button
                                    variant="ghost"
                                    size="icon"
                                    className="h-8 w-8"
                                    onClick={onEditClick}
                                >
                                    <Edit className="h-4 w-4" />
                                </Button>
                            </TooltipTrigger>
                            <TooltipContent side="bottom">Edit Node</TooltipContent>
                        </Tooltip>

                        <Tooltip>
                            <TooltipTrigger asChild>
                                <Button
                                    variant="ghost"
                                    size="icon"
                                    className={`h-8 w-8 transition-colors ${isPinned ? 'text-primary' : 'text-muted-foreground'}`}
                                    onClick={() => togglePin(selectedNode.id, !isPinned, projectId)}
                                >
                                    {isPinned ? <PinOff className="h-4 w-4" /> : <Pin className="h-4 w-4" />}
                                </Button>
                            </TooltipTrigger>
                            <TooltipContent side="bottom">{isPinned ? "Unpin Node" : "Pin Node"}</TooltipContent>
                        </Tooltip>

                        <Tooltip>
                            <TooltipTrigger asChild>
                                <Button
                                    variant="ghost"
                                    size="icon"
                                    className="h-8 w-8"
                                    onClick={() => setSelectedNode(null)}
                                >
                                    <X className="h-4 w-4" />
                                </Button>
                            </TooltipTrigger>
                            <TooltipContent side="bottom">Close</TooltipContent>
                        </Tooltip>
                    </div>
                </CardHeader>
                <CardContent>
                    {selectedNode.description && (
                        <p className="text-sm text-muted-foreground mb-4 line-clamp-3">
                            {selectedNode.description}
                        </p>
                    )}
                    {selectedNode.dateOfBirth && (
                        <p className="text-sm text-muted-foreground">
                            Born: {formatDate(selectedNode.dateOfBirth)}
                        </p>
                    )}
                </CardContent>
            </Card>
        </div>
    )
}

export const DetailsPanel = memo(DetailsPanelImpl)
