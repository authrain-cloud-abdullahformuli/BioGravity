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
} from "@/components/ui/dialog"
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from "@/components/ui/select"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"

export interface RelationshipTypeModalProps {
    open: boolean
    sourceNodeName: string
    targetNodeName: string
    relationshipTypes: any[]
    onConfirm: (type: string) => void
    onCancel: () => void
}

export function RelationshipTypeModal({
    open,
    sourceNodeName,
    targetNodeName,
    relationshipTypes,
    onConfirm,
    onCancel,
}: RelationshipTypeModalProps) {
    const [selectedType, setSelectedType] = useState("")
    const [customType, setCustomType] = useState("")

    const handleConfirm = () => {
        const typeToUse = customType.trim() || selectedType
        if (typeToUse) {
            onConfirm(typeToUse)
            setSelectedType("")
            setCustomType("")
        }
    }

    const handleOpenChange = (newOpen: boolean) => {
        if (!newOpen) {
            onCancel()
            setSelectedType("")
            setCustomType("")
        }
    }

    return (
        <Dialog open={open} onOpenChange={handleOpenChange}>
            <DialogContent className="sm:max-w-[425px]">
                <DialogHeader>
                    <DialogTitle>Create Relationship</DialogTitle>
                    <DialogDescription>
                        Define the relationship between <em>{sourceNodeName}</em> and <em>{targetNodeName}</em>
                    </DialogDescription>
                </DialogHeader>

                <div className="grid gap-4 py-4">
                    <div className="grid gap-2">
                        <Label htmlFor="type">Relationship Type</Label>
                        <Select value={selectedType} onValueChange={setSelectedType}>
                            <SelectTrigger id="type">
                                <SelectValue placeholder="Select a type..." />
                            </SelectTrigger>
                            <SelectContent>
                                {relationshipTypes.map(type => (
                                    <SelectItem key={type.name} value={type.name}>
                                        {type.name}
                                    </SelectItem>
                                ))}
                            </SelectContent>
                        </Select>
                    </div>

                    <div className="relative">
                        <div className="absolute inset-0 flex items-center">
                            <span className="w-full border-t border-gray-200" />
                        </div>
                        <div className="relative flex justify-center text-sm">
                            <span className="bg-white px-2 text-gray-500">or custom</span>
                        </div>
                    </div>

                    <div className="grid gap-2">
                        <Label htmlFor="custom">Custom Type (optional)</Label>
                        <Input
                            id="custom"
                            placeholder="e.g., Colleague, Friend"
                            value={customType}
                            onChange={(e) => setCustomType(e.target.value)}
                        />
                        {customType && (
                            <p className="text-xs text-gray-500">
                                This will create a new relationship type: <strong>{customType}</strong>
                            </p>
                        )}
                    </div>
                </div>

                <DialogFooter>
                    <Button variant="outline" onClick={onCancel}>
                        Cancel
                    </Button>
                    <Button
                        onClick={handleConfirm}
                        disabled={!selectedType && !customType.trim()}
                    >
                        Create Link
                    </Button>
                </DialogFooter>
            </DialogContent>
        </Dialog>
    )
}
