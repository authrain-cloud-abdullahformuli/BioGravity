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
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { useGraphStore } from "@/store/use-graph-store"
import { Plus, Loader2 } from "lucide-react"
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from "@/components/ui/select"
import { parseFromInput, getDateErrorMessage } from "@/lib/dateFormatting"

interface AddElementDialogProps {
    projectId: string
}

export function AddElementDialog({ projectId }: AddElementDialogProps) {
    const [open, setOpen] = useState(false)
    const [name, setName] = useState("")
    const [type, setType] = useState("")
    const [description, setDescription] = useState("")
    const [dateOfBirth, setDateOfBirth] = useState("")
    const [dateError, setDateError] = useState("")
    const [loading, setLoading] = useState(false)
    const { fetchGraphData, elementTypes } = useGraphStore()



    const handleAdd = async () => {
        if (!name.trim() || !type.trim()) return

        // Validate date if provided
        if (dateOfBirth && getDateErrorMessage(dateOfBirth)) {
            setDateError(getDateErrorMessage(dateOfBirth))
            return
        }

        setLoading(true)
        try {
            const parsedDate = dateOfBirth ? parseFromInput(dateOfBirth) : null

            const response = await fetch(`/api/projects/${projectId}/elements`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    name: name.trim(),
                    type: type.trim(),
                    description: description.trim(),
                    dateOfBirth: parsedDate || null,
                    // Random position near center for now
                    positionX: (Math.random() - 0.5) * 50,
                    positionY: (Math.random() - 0.5) * 50,
                    positionZ: (Math.random() - 0.5) * 50
                }),
            })

            if (!response.ok) {
                throw new Error('Failed to create element')
            }

            // Refresh graph data
            await fetchGraphData(projectId)

            // Reset form and close
            setName("")
            setType("")
            setDescription("")
            setDateOfBirth("")
            setDateError("")
            setOpen(false)
        } catch (error) {
            console.error('Error creating element:', error)
        } finally {
            setLoading(false)
        }
    }

    return (
        <Dialog open={open} onOpenChange={setOpen}>
            <DialogTrigger asChild>
                <Button variant="default" size="sm" className="gap-2">
                    <Plus className="h-4 w-4" />
                    Add Element
                </Button>
            </DialogTrigger>
            <DialogContent className="sm:max-w-[425px] max-h-[90vh] overflow-y-auto">
                <DialogHeader>
                    <DialogTitle>Add New Element</DialogTitle>
                    <DialogDescription>
                        Create a new node in the graph.
                    </DialogDescription>
                </DialogHeader>
                <div className="grid gap-4 py-4">
                    <div className="grid gap-2">
                        <Label htmlFor="name">Name</Label>
                        <Input
                            id="name"
                            value={name}
                            onChange={(e) => setName(e.target.value)}
                            placeholder="e.g., John Doe"
                        />
                    </div>
                    <div className="grid gap-2">
                        <Label htmlFor="type">Type</Label>
                        <Select value={type} onValueChange={(val) => setType(val)}>
                            <SelectTrigger>
                                <SelectValue placeholder="Select type" />
                            </SelectTrigger>
                            <SelectContent>
                                {elementTypes.map(t => (
                                    <SelectItem key={t.name} value={t.name}>{t.name}</SelectItem>
                                ))}
                                {elementTypes.length === 0 && (
                                    <SelectItem value="Person">Person (Default)</SelectItem>
                                )}
                            </SelectContent>
                        </Select>
                    </div>
                    <div className="grid gap-2">
                        <Label htmlFor="description">Description (Optional)</Label>
                        <Input
                            id="description"
                            value={description}
                            onChange={(e) => setDescription(e.target.value)}
                            placeholder="Brief description..."
                        />
                    </div>
                    <div className="grid gap-2">
                        <Label htmlFor="dateOfBirth">Date of Birth (optional)</Label>
                        <Input
                            id="dateOfBirth"
                            type="text"
                            value={dateOfBirth}
                            onChange={(e) => {
                                setDateOfBirth(e.target.value)
                                setDateError("")
                            }}
                            onBlur={() => {
                                if (dateOfBirth) {
                                    const error = getDateErrorMessage(dateOfBirth)
                                    setDateError(error)
                                }
                            }}
                            placeholder="dd/mm/yyyy"
                            className={dateError ? "border-red-500" : ""}
                        />
                        {dateError && (
                            <p className="text-sm text-red-500">{dateError}</p>
                        )}
                    </div>
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
                        disabled={!name.trim() || !type.trim() || loading}
                    >
                        {loading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                        Create Element
                    </Button>
                </DialogFooter>
            </DialogContent>
        </Dialog>
    )
}
