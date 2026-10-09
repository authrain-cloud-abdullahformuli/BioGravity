"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogFooter,
    DialogHeader,
    DialogTitle,
    DialogTrigger,
} from "@/components/ui/dialog"
import { Label } from "@/components/ui/label"
import { useGraphStore } from "@/store/use-graph-store"
import { Plus, ArrowRight, Loader2 } from "lucide-react"
import { ElementCombobox } from "./element-combobox"
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from "@/components/ui/select"

interface AddRelationshipDialogProps {
    projectId: string
}

export function AddRelationshipDialog({ projectId }: AddRelationshipDialogProps) {
    const [open, setOpen] = useState(false)
    const [sourceId, setSourceId] = useState<string | null>(null)
    const [targetId, setTargetId] = useState<string | null>(null)
    const [type, setType] = useState("")
    const [loading, setLoading] = useState(false)
    const { elements, fetchGraphData, relationshipTypes } = useGraphStore()



    const handleAdd = async () => {
        if (!sourceId || !targetId || !type.trim()) return

        setLoading(true)
        try {
            const response = await fetch(`/api/projects/${projectId}/relationships`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    sourceId,
                    targetId,
                    type: type.trim(),
                }),
            })

            if (!response.ok) {
                throw new Error('Failed to create relationship')
            }

            // Refresh graph data
            await fetchGraphData(projectId)

            // Reset form and close
            setSourceId(null)
            setTargetId(null)
            setType("")
            setOpen(false)
        } catch (error) {
            console.error('Error creating relationship:', error)
        } finally {
            setLoading(false)
        }
    }

    const isValid = sourceId && targetId && type.trim() && sourceId !== targetId

    return (
        <Dialog open={open} onOpenChange={setOpen}>
            <DialogTrigger asChild>
                <Button variant="outline" size="sm" className="gap-2">
                    <Plus className="h-4 w-4" />
                    Add Relationship
                </Button>
            </DialogTrigger>
            <DialogContent className="sm:max-w-[500px] max-h-[90vh] overflow-y-auto">
                <DialogHeader>
                    <DialogTitle>Add New Relationship</DialogTitle>
                    <DialogDescription>
                        Create a connection between two elements. Search and select from existing elements.
                    </DialogDescription>
                </DialogHeader>
                <div className="grid gap-4 py-4">
                    {/* Source Element */}
                    <div className="grid gap-2">
                        <Label htmlFor="source">From Element</Label>
                        <ElementCombobox
                            elements={elements}
                            value={sourceId}
                            onChange={setSourceId}
                            placeholder="Select source element..."
                            excludeIds={targetId ? [targetId] : []}
                        />
                    </div>

                    {/* Visual Arrow */}
                    <div className="flex justify-center">
                        <ArrowRight className="h-6 w-6 text-muted-foreground" />
                    </div>

                    {/* Target Element */}
                    <div className="grid gap-2">
                        <Label htmlFor="target">To Element</Label>
                        <ElementCombobox
                            elements={elements}
                            value={targetId}
                            onChange={setTargetId}
                            placeholder="Select target element..."
                            excludeIds={sourceId ? [sourceId] : []}
                        />
                    </div>

                    {/* Relationship Type */}
                    <div className="grid gap-2">
                        <Label htmlFor="type">Relationship Type</Label>
                        <Select value={type} onValueChange={(val) => setType(val)}>
                            <SelectTrigger>
                                <SelectValue placeholder="Select type" />
                            </SelectTrigger>
                            <SelectContent>
                                {relationshipTypes.map(t => (
                                    <SelectItem key={t.name} value={t.name}>{t.name}</SelectItem>
                                ))}
                                {relationshipTypes.length === 0 && (
                                    <SelectItem value="Connects_To">Connects To (Default)</SelectItem>
                                )}
                            </SelectContent>
                        </Select>
                    </div>



                    {/* Preview */}
                    {sourceId && targetId && type && (
                        <div className="bg-muted/50 rounded-lg p-3 text-sm">
                            <span className="font-medium">
                                {elements.find(e => e.id === sourceId)?.name}
                            </span>
                            <span className="text-primary mx-2">—{type}→</span>
                            <span className="font-medium">
                                {elements.find(e => e.id === targetId)?.name}
                            </span>
                        </div>
                    )}
                </div>
                <DialogFooter>
                    <Button
                        variant="outline"
                        onClick={() => setOpen(false)}
                    >
                        Cancel
                    </Button>
                    <Button
                        onClick={handleAdd}
                        disabled={!isValid || loading}
                    >
                        {loading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                        Add Relationship
                    </Button>
                </DialogFooter>
            </DialogContent>
        </Dialog>
    )
}
