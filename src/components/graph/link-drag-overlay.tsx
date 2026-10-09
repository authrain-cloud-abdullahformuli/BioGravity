"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Label } from "@/components/ui/label"
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from "@/components/ui/select"
import { GraphElement, useGraphStore } from "@/store/use-graph-store"
import { toast } from "sonner"
import { Loader2 } from "lucide-react"

interface LinkDragOverlayProps {
    active: boolean
    sourceNode: GraphElement | null
    targetNode: GraphElement | null
    projectId: string
    onComplete: () => void
}

export function LinkDragOverlay({
    active,
    sourceNode,
    targetNode,
    projectId,
    onComplete,
}: LinkDragOverlayProps) {
    const [relationshipType, setRelationshipType] = useState("")
    const [loading, setLoading] = useState(false)
    const { relationshipTypes, relationships, addRelationship } = useGraphStore()

    if (!active || !sourceNode || !targetNode) return null

    const handleCreateLink = async () => {
        if (!relationshipType.trim()) {
            toast.error("Please select a relationship type")
            return
        }

        // Self-loop prevention
        if (sourceNode.id === targetNode.id) {
            toast.error("Cannot link a node to itself")
            return
        }

        // Duplicate check
        const existing = relationships.find(
            (r) => {
                const sourceId = typeof r.source === 'string' ? r.source : r.source.id
                const targetId = typeof r.target === 'string' ? r.target : r.target.id
                return (
                    sourceId === sourceNode.id &&
                    targetId === targetNode.id &&
                    r.type === relationshipType
                )
            }
        )

        if (existing) {
            toast.warning("This relationship already exists")
            return
        }

        setLoading(true)
        try {
            const result = await addRelationship(projectId, {
                fromId: sourceNode.id,
                toId: targetNode.id,
                type: relationshipType,
            })
            if (result) {
                toast.success("Relationship created")
                setRelationshipType("")
                onComplete()
            } else {
                toast.error("Failed to create relationship")
            }
        } catch (error) {
            console.error("Error creating relationship:", error)
            toast.error("Error creating relationship")
        } finally {
            setLoading(false)
        }
    }

    return (
        <div className="fixed z-50 bg-card border border-border rounded-md shadow-lg p-4 min-w-72 pointer-events-auto">
            <div className="space-y-4">
                <div>
                    <p className="text-sm font-medium text-muted-foreground">
                        Link relationship
                    </p>
                    <div className="mt-2 flex items-center gap-2 text-xs">
                        <span className="font-medium">{sourceNode.name}</span>
                        <span className="text-muted-foreground">→</span>
                        <span className="font-medium">{targetNode.name}</span>
                    </div>
                </div>

                <div className="space-y-2">
                    <Label htmlFor="rel-type" className="text-xs">
                        Relationship Type
                    </Label>
                    <Select value={relationshipType} onValueChange={setRelationshipType}>
                        <SelectTrigger className="h-8 text-sm">
                            <SelectValue placeholder="Select type" />
                        </SelectTrigger>
                        <SelectContent>
                            {relationshipTypes.map((t) => (
                                <SelectItem key={t.name} value={t.name}>
                                    {t.name}
                                </SelectItem>
                            ))}
                        </SelectContent>
                    </Select>
                </div>

                <div className="flex gap-2">
                    <Button
                        variant="default"
                        size="sm"
                        className="flex-1 text-xs h-8"
                        onClick={handleCreateLink}
                        disabled={loading || !relationshipType.trim()}
                    >
                        {loading ? (
                            <Loader2 className="h-3 w-3 animate-spin" />
                        ) : (
                            "Create Link"
                        )}
                    </Button>
                    <Button
                        variant="outline"
                        size="sm"
                        className="flex-1 text-xs h-8"
                        onClick={onComplete}
                        disabled={loading}
                    >
                        Cancel
                    </Button>
                </div>
            </div>
        </div>
    )
}
