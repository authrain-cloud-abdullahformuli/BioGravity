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
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { GraphElement, useGraphStore } from "@/store/use-graph-store"
import { Pencil, Loader2 } from "lucide-react"
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from "@/components/ui/select"
import { PhotoCropModal } from "./photo-crop-modal"
import { formatToDisplay, parseFromInput, getDateErrorMessage } from "@/lib/dateFormatting"

interface EditElementDialogProps {
    element: GraphElement
}

export function EditElementDialog({ element }: EditElementDialogProps) {
    const [open, setOpen] = useState(false)
    const [name, setName] = useState(element.name)
    const [type, setType] = useState(element.type)
    const [description, setDescription] = useState(element.description || "")
    const [dateOfBirth, setDateOfBirth] = useState(() => element.dateOfBirth ? formatToDisplay(element.dateOfBirth) : "")
    const [dateError, setDateError] = useState("")
    const [imageUrl, setImageUrl] = useState(element.imageUrl || "")
    const [loading, setLoading] = useState(false)
    const [cropModalOpen, setCropModalOpen] = useState(false)
    const [tempImageSrc, setTempImageSrc] = useState("")
    const { updateElement, elementTypes, fetchGraphData } = useGraphStore()
    const params = useParams<{ id: string }>()
    const projectId = params?.id ?? ''


    const handleSave = async () => {
        // Validate date if provided
        if (dateOfBirth && getDateErrorMessage(dateOfBirth)) {
            setDateError(getDateErrorMessage(dateOfBirth))
            return
        }

        setLoading(true)
        const parsedDate = dateOfBirth ? parseFromInput(dateOfBirth) : null

        await updateElement(element.id, projectId, {
            name,
            type,
            description,
            dateOfBirth: parsedDate || null,
            imageUrl: imageUrl || null
        })
        await fetchGraphData(projectId)
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
                    <DialogTitle>Edit Element</DialogTitle>
                    <DialogDescription>
                        Make changes to the element here. Click save when you&apos;re done.
                    </DialogDescription>
                </DialogHeader>
                <div className="grid gap-6 py-4">
                    <div className="flex flex-col items-center gap-4">
                        <div className="relative w-24 h-24 rounded-full bg-muted overflow-hidden border border-border flex items-center justify-center">
                            {imageUrl ? (
                                <img src={imageUrl} alt={name} className="w-full h-full object-cover" />
                            ) : (
                                <span className="text-3xl text-muted-foreground">{name.charAt(0).toUpperCase()}</span>
                            )}
                        </div>
                        <div className="flex gap-2">
                            <input
                                type="file"
                                accept="image/*"
                                className="hidden"
                                id={`photo-upload-${element.id}`}
                                onChange={(e) => {
                                    if (e.target.files && e.target.files.length > 0) {
                                        const reader = new FileReader()
                                        reader.addEventListener('load', () => {
                                            setTempImageSrc(reader.result?.toString() || "")
                                            setCropModalOpen(true)
                                            e.target!.value = '' // clear input
                                        })
                                        reader.readAsDataURL(e.target.files[0])
                                    }
                                }}
                            />
                            <Label htmlFor={`photo-upload-${element.id}`} className="cursor-pointer bg-secondary text-secondary-foreground hover:bg-secondary/80 h-9 px-4 py-2 inline-flex items-center justify-center whitespace-nowrap rounded-md text-sm font-medium transition-colors">
                                Upload Photo
                            </Label>
                            {imageUrl && (
                                <Button variant="outline" size="sm" onClick={() => setImageUrl("")}>
                                    Remove
                                </Button>
                            )}
                        </div>
                    </div>

                    <div className="space-y-4">
                        <div className="grid gap-2">
                            <Label htmlFor="name">Name</Label>
                            <Input
                                id="name"
                                value={name}
                                onChange={(e) => setName(e.target.value)}
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
                                    {!elementTypes.find(t => t.name === type) && (
                                        <SelectItem value={type}>{type}</SelectItem>
                                    )}
                                </SelectContent>
                            </Select>
                        </div>
                        <div className="grid gap-2">
                            <Label htmlFor="description">Description</Label>
                            <Textarea
                                id="description"
                                value={description}
                                onChange={(e) => setDescription(e.target.value)}
                                className="min-h-[100px]"
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


                </div>
                <DialogFooter>
                    <Button variant="outline" onClick={() => setOpen(false)}>Cancel</Button>
                    <Button type="submit" onClick={handleSave} disabled={loading}>
                        {loading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                        Save changes
                    </Button>
                </DialogFooter>
            </DialogContent>
            <PhotoCropModal
                open={cropModalOpen}
                onOpenChange={setCropModalOpen}
                imageSrc={tempImageSrc}
                onCropComplete={(base64) => {
                    setImageUrl(base64)
                    setCropModalOpen(false)
                }}
            />
        </Dialog>
    )
}
