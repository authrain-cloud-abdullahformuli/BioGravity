"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from "@/components/ui/select"
import { useGraphStore } from "@/store/use-graph-store"
import { toast } from "sonner"
import { Loader2 } from "lucide-react"

interface GraphContextMenuProps {
    visible: boolean
    position: { x: number; y: number }
    worldPosition: { x: number; y: number; z: number }
    projectId: string
    onClose: () => void
}

export function GraphContextMenu({
    visible,
    position,
    worldPosition,
    projectId,
    onClose,
}: GraphContextMenuProps) {
    const [expanded, setExpanded] = useState(false)
    const [name, setName] = useState("")
    const [type, setType] = useState("")
    const [loading, setLoading] = useState(false)
    const { elementTypes, addElement } = useGraphStore()

    const handleAddNode = async () => {
        if (!name.trim()) {
            toast.error("Please enter a name")
            return
        }
        if (!type.trim()) {
            toast.error("Please select a type")
            return
        }

        setLoading(true)
        try {
            const result = await addElement(projectId, {
                name: name.trim(),
                type: type.trim(),
                x: worldPosition.x,
                y: worldPosition.y,
                z: worldPosition.z,
            })
            if (result) {
                toast.success("Node created")
                setName("")
                setType("")
                setExpanded(false)
                onClose()
            } else {
                toast.error("Failed to create node")
            }
        } catch (error) {
            console.error("Error creating node:", error)
            toast.error("Error creating node")
        } finally {
            setLoading(false)
        }
    }

    if (!visible) return null

    if (elementTypes.length === 0) {
        return (
            <div
                className="fixed z-50 bg-card border border-border rounded-md shadow-lg p-3 min-w-48"
                style={{
                    left: `${position.x}px`,
                    top: `${position.y}px`,
                }}
            >
                <p className="text-sm text-muted-foreground">
                    No element types configured. Go to Settings.
                </p>
                <Button
                    variant="outline"
                    size="sm"
                    className="w-full mt-2"
                    onClick={onClose}
                >
                    Close
                </Button>
            </div>
        )
    }

    return (
        <div
            className="fixed z-50 bg-card border border-border rounded-md shadow-lg p-3 min-w-56"
            style={{
                left: `${position.x}px`,
                top: `${position.y}px`,
            }}
        >
            {!expanded ? (
                <Button
                    variant="outline"
                    size="sm"
                    className="w-full"
                    onClick={() => setExpanded(true)}
                >
                    Add Node Here
                </Button>
            ) : (
                <div className="space-y-3">
                    <div className="space-y-2">
                        <Label htmlFor="node-name" className="text-xs">
                            Name
                        </Label>
                        <Input
                            id="node-name"
                            value={name}
                            onChange={(e) => setName(e.target.value)}
                            placeholder="Node name"
                            className="h-8 text-sm"
                            autoFocus
                            onKeyDown={(e) => {
                                if (e.key === "Enter") handleAddNode()
                                if (e.key === "Escape") onClose()
                            }}
                        />
                    </div>

                    <div className="space-y-2">
                        <Label htmlFor="node-type" className="text-xs">
                            Type
                        </Label>
                        <Select value={type} onValueChange={setType}>
                            <SelectTrigger className="h-8 text-sm">
                                <SelectValue placeholder="Select type" />
                            </SelectTrigger>
                            <SelectContent>
                                {elementTypes.map((t) => (
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
                            onClick={handleAddNode}
                            disabled={loading || !name.trim()}
                        >
                            {loading ? (
                                <Loader2 className="h-3 w-3 animate-spin" />
                            ) : (
                                "Create"
                            )}
                        </Button>
                        <Button
                            variant="outline"
                            size="sm"
                            className="flex-1 text-xs h-8"
                            onClick={onClose}
                            disabled={loading}
                        >
                            Cancel
                        </Button>
                    </div>
                </div>
            )}
        </div>
    )
}
