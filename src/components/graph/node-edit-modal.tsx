"use client"

import { useState, useEffect } from "react"
import { Button } from "@/components/ui/button"
import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogFooter,
    DialogHeader,
    DialogTitle,
} from "@/components/ui/dialog"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from "@/components/ui/select"
import { Checkbox } from "@/components/ui/checkbox"
import { GraphElement } from "@/store/use-graph-store"
import { formatToDisplay, parseFromInput, getDateErrorMessage } from "@/lib/dateFormatting"
import { Loader2, Upload, X as XIcon } from "lucide-react"
import { PhotoCropModal } from "@/components/projects/photo-crop-modal"

export interface NodeEditModalProps {
    open: boolean
    node: GraphElement | null
    elementTypes: any[]
    onSave: (nodeId: string, updates: Partial<GraphElement>) => Promise<void>
    onClose: () => void
}

export function NodeEditModal({
    open,
    node,
    elementTypes,
    onSave,
    onClose,
}: NodeEditModalProps) {
    const [name, setName] = useState("")
    const [type, setType] = useState("")
    const [description, setDescription] = useState("")
    const [dateOfBirth, setDateOfBirth] = useState("")
    const [dateError, setDateError] = useState("")
    const [imageUrl, setImageUrl] = useState("")
    const [pinned, setPinned] = useState(false)
    const [posX, setPosX] = useState("0")
    const [posY, setPosY] = useState("0")
    const [posZ, setPosZ] = useState("0")
    const [loading, setLoading] = useState(false)
    const [photoCropOpen, setPhotoCropOpen] = useState(false)
    const [imageUrlInput, setImageUrlInput] = useState("")

    // Initialize form when node changes or modal opens
    useEffect(() => {
        if (node && open) {
            setName(node.name || "")
            setType(node.type || "")
            setDescription(node.description || "")
            setDateOfBirth(node.dateOfBirth ? formatToDisplay(node.dateOfBirth) : "")
            setImageUrl(node.imageUrl || "")
            setImageUrlInput(node.imageUrl || "")
            setPinned(node.pinned || false)
            setPosX(String(node.x || 0))
            setPosY(String(node.y || 0))
            setPosZ(String(node.z || 0))
            setDateError("")
        }
    }, [node, open])

    const handleSave = async () => {
        if (!node) return

        // Validate date if provided
        if (dateOfBirth && getDateErrorMessage(dateOfBirth)) {
            setDateError(getDateErrorMessage(dateOfBirth))
            return
        }

        setLoading(true)
        try {
            const parsedDate = dateOfBirth ? parseFromInput(dateOfBirth) : null

            const updates: Partial<GraphElement> & { positionX?: number; positionY?: number; positionZ?: number } = {
                name,
                type,
                description,
                dateOfBirth: parsedDate || null,
                imageUrl: imageUrl || null,
                pinned,
            }

            // Add position data if pinned (required for fixed positions)
            if (pinned) {
                updates.positionX = parseFloat(posX) || 0
                updates.positionY = parseFloat(posY) || 0
                updates.positionZ = parseFloat(posZ) || 0
            }

            await onSave(node.id, updates)
            onClose()
        } catch (error) {
            console.error('Error updating node:', error)
        } finally {
            setLoading(false)
        }
    }

    const handleOpenChange = (newOpen: boolean) => {
        if (!newOpen) {
            onClose()
        }
    }

    const handleImageUrlLoad = () => {
        if (imageUrlInput.trim()) {
            setImageUrl(imageUrlInput.trim())
            setPhotoCropOpen(true)
        }
    }

    const handleCropComplete = (croppedBase64: string) => {
        setImageUrl(croppedBase64)
        setPhotoCropOpen(false)
    }

    const handleRemoveImage = () => {
        setImageUrl("")
        setImageUrlInput("")
    }

    return (
        <Dialog open={open} onOpenChange={handleOpenChange}>
            <DialogContent className="sm:max-w-[600px] max-h-[90vh] overflow-y-auto">
                <DialogHeader>
                    <DialogTitle>Edit Node</DialogTitle>
                    <DialogDescription>
                        Update node properties and attributes
                    </DialogDescription>
                </DialogHeader>

                <div className="grid gap-4 py-4">
                    {/* Name */}
                    <div className="grid gap-2">
                        <Label htmlFor="name">Name *</Label>
                        <Input
                            id="name"
                            value={name}
                            onChange={(e) => setName(e.target.value)}
                            placeholder="Node name"
                        />
                    </div>

                    {/* Type */}
                    <div className="grid gap-2">
                        <Label htmlFor="type">Type *</Label>
                        <Select value={type} onValueChange={(val) => setType(val)}>
                            <SelectTrigger id="type">
                                <SelectValue placeholder="Select type" />
                            </SelectTrigger>
                            <SelectContent>
                                {elementTypes.map(t => (
                                    <SelectItem key={t.name} value={t.name}>
                                        {t.name}
                                    </SelectItem>
                                ))}
                                {!elementTypes.find(t => t.name === type) && type && (
                                    <SelectItem value={type}>{type}</SelectItem>
                                )}
                            </SelectContent>
                        </Select>
                    </div>

                    {/* Description */}
                    <div className="grid gap-2">
                        <Label htmlFor="description">Description</Label>
                        <Textarea
                            id="description"
                            value={description}
                            onChange={(e) => setDescription(e.target.value)}
                            placeholder="Node description"
                            className="min-h-[80px]"
                        />
                    </div>

                    {/* Date of Birth */}
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

                    {/* Image */}
                    <div className="grid gap-2">
                        <Label>Image (optional)</Label>

                        {/* Image Preview */}
                        {imageUrl && (
                            <div className="relative w-24 h-24 rounded-lg overflow-hidden border border-gray-200 bg-gray-100">
                                <img
                                    src={imageUrl}
                                    alt="Node preview"
                                    className="w-full h-full object-cover"
                                />
                                <button
                                    onClick={handleRemoveImage}
                                    className="absolute top-0 right-0 bg-red-500 text-white p-1 rounded-bl hover:bg-red-600"
                                >
                                    <XIcon className="h-3 w-3" />
                                </button>
                            </div>
                        )}

                        {/* Image URL Input */}
                        <div className="flex gap-2">
                            <Input
                                type="text"
                                value={imageUrlInput}
                                onChange={(e) => setImageUrlInput(e.target.value)}
                                placeholder="https://example.com/image.jpg"
                            />
                            <Button
                                type="button"
                                variant="outline"
                                size="sm"
                                onClick={handleImageUrlLoad}
                                disabled={!imageUrlInput.trim()}
                            >
                                <Upload className="h-4 w-4" />
                            </Button>
                        </div>
                    </div>

                    {/* Position Section */}
                    <div className="border-t pt-4 mt-4">
                        <h3 className="text-sm font-semibold mb-3">Position</h3>
                        <div className="grid grid-cols-3 gap-3">
                            <div className="grid gap-1">
                                <Label htmlFor="posX" className="text-xs">X</Label>
                                <Input
                                    id="posX"
                                    type="number"
                                    value={posX}
                                    onChange={(e) => setPosX(e.target.value)}
                                    placeholder="0"
                                    step="0.1"
                                />
                            </div>
                            <div className="grid gap-1">
                                <Label htmlFor="posY" className="text-xs">Y</Label>
                                <Input
                                    id="posY"
                                    type="number"
                                    value={posY}
                                    onChange={(e) => setPosY(e.target.value)}
                                    placeholder="0"
                                    step="0.1"
                                />
                            </div>
                            <div className="grid gap-1">
                                <Label htmlFor="posZ" className="text-xs">Z</Label>
                                <Input
                                    id="posZ"
                                    type="number"
                                    value={posZ}
                                    onChange={(e) => setPosZ(e.target.value)}
                                    placeholder="0"
                                    step="0.1"
                                />
                            </div>
                        </div>
                    </div>

                    {/* Pinned */}
                    <div className="border-t pt-4 mt-4">
                        <div className="flex items-center gap-2">
                            <Checkbox
                                id="pinned"
                                checked={pinned}
                                onCheckedChange={(checked) => setPinned(checked as boolean)}
                            />
                            <Label htmlFor="pinned" className="cursor-pointer">
                                Pin this node in place
                            </Label>
                        </div>
                        <p className="text-xs text-gray-500 mt-2">
                            Pinned nodes will maintain their position and not be affected by physics simulation
                        </p>
                    </div>
                </div>

                <DialogFooter>
                    <Button variant="outline" onClick={onClose}>
                        Cancel
                    </Button>
                    <Button onClick={handleSave} disabled={loading || !name.trim() || !type.trim()}>
                        {loading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                        Save Changes
                    </Button>
                </DialogFooter>
            </DialogContent>

            {/* Photo Crop Modal */}
            {imageUrl && imageUrlInput && (
                <PhotoCropModal
                    open={photoCropOpen}
                    onOpenChange={setPhotoCropOpen}
                    imageSrc={imageUrl}
                    onCropComplete={handleCropComplete}
                />
            )}
        </Dialog>
    )
}
