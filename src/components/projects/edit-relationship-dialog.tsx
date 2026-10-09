"use client"

import { useState } from "react"
import { useParams } from "next/navigation"
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
import { GraphRelationship, useGraphStore } from "@/store/use-graph-store"
import { Pencil, Loader2 } from "lucide-react"
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from "@/components/ui/select"

interface EditRelationshipDialogProps {
    relationship: GraphRelationship
}

export function EditRelationshipDialog({ relationship }: EditRelationshipDialogProps) {
    const [open, setOpen] = useState(false)
    const [type, setType] = useState(relationship.type)
    const [loading, setLoading] = useState(false)
    const { updateRelationship, relationshipTypes } = useGraphStore()
    const params = useParams<{ id: string }>()
    const projectId = params?.id ?? ''


    const handleSave = async () => {
        setLoading(true)
        await updateRelationship(relationship.id, projectId, {
            type
        })
        setLoading(false)
        setOpen(false)
    }

    return (
        <Dialog open={open} onOpenChange={setOpen}>
            <DialogTrigger asChild>
                <Button variant="ghost" size="icon" className="h-8 w-8 text-muted-foreground hover:text-primary">
                    <Pencil className="h-4 w-4" />
                </Button>
            </DialogTrigger>
            <DialogContent className="sm:max-w-[500px] max-h-[90vh] overflow-y-auto">
                <DialogHeader>
                    <DialogTitle>Edit Relationship</DialogTitle>
                    <DialogDescription>
                        Make changes to the relationship here. Click save when you&apos;re done.
                    </DialogDescription>
                </DialogHeader>
                <div className="grid gap-6 py-4">
                    <div className="grid gap-2">
                        <Label htmlFor="type">Type</Label>
                        <Select value={type} onValueChange={(val) => setType(val)}>
                            <SelectTrigger>
                                <SelectValue placeholder="Select type" />
                            </SelectTrigger>
                            <SelectContent>
                                {relationshipTypes.map(t => (
                                    <SelectItem key={t.name} value={t.name}>{t.name}</SelectItem>
                                ))}
                                {!relationshipTypes.find(t => t.name === type) && (
                                    <SelectItem value={type}>{type}</SelectItem>
                                )}
                            </SelectContent>
                        </Select>
                    </div>


                </div>
                <DialogFooter>
                    <Button variant="outline" onClick={() => setOpen(false)}>Cancel</Button>
                    <Button type="submit" onClick={handleSave} disabled={loading}>
                        {loading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                        Save changes
                    </Button>
                </DialogFooter>
            </DialogContent>
        </Dialog>
    )
}
