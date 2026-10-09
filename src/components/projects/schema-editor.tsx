"use client"

import { useState } from "react"
import { useRouter } from "next/navigation"
import { Plus, Trash2, Settings2 } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Slider } from "@/components/ui/slider"
import { Label } from "@/components/ui/label"
import {
    Card,
    CardContent,
    CardDescription,
    CardHeader,
    CardTitle,
} from "@/components/ui/card"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { Separator } from "@/components/ui/separator"



interface SchemaType {
    name: string
    color: string
    strength?: number
}

interface SchemaEditorProps {
    projectId: string
    initialTypes: SchemaType[]
    schemaType: "element" | "relationship"
    title: string
    description: string
}

export function SchemaEditor({
    projectId,
    initialTypes,
    schemaType,
    title,
    description
}: SchemaEditorProps) {
    const [types, setTypes] = useState<SchemaType[]>(Array.isArray(initialTypes) ? initialTypes : [])
    const [newTypeName, setNewTypeName] = useState("")
    const [newTypeColor, setNewTypeColor] = useState("#3b82f6")
    const [newTypeStrength, setNewTypeStrength] = useState(1)

    const [editingType, setEditingType] = useState<string | null>(null)
    const [editName, setEditName] = useState("")
    const [editColor, setEditColor] = useState("")
    const [editStrength, setEditStrength] = useState(1)

    const [loading, setLoading] = useState(false)
    const [error, setError] = useState<string | null>(null)
    const router = useRouter()


    const handleAddType = async () => {
        if (!newTypeName.trim()) return

        setLoading(true)
        setError(null)

        try {
            const res = await fetch("/api/projects/schema", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({
                    projectId,
                    name: newTypeName,
                    color: newTypeColor,
                    schemaType,
                    ...(schemaType === 'relationship' && { strength: newTypeStrength })
                }),
            })

            const data = await res.json()

            if (!res.ok) {
                throw new Error(data.message || "Failed to add type")
            }

            setTypes([...types, {
                name: newTypeName,
                color: newTypeColor,
                ...(schemaType === 'relationship' && { strength: newTypeStrength })
            }])
            setNewTypeName("")
            setNewTypeColor("#3b82f6")
            setNewTypeStrength(1)
            router.refresh()
        } catch (err: any) {
            setError(err.message)
        } finally {
            setLoading(false)
        }
    }

    const handleUpdateType = async (oldName: string) => {
        if (!editName.trim()) return

        setLoading(true)
        setError(null)

        try {
            const res = await fetch("/api/projects/schema", {
                method: "PUT",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({
                    projectId,
                    typeName: oldName,
                    newName: editName !== oldName ? editName : undefined,
                    color: editColor,
                    schemaType,
                    ...(schemaType === 'relationship' && { strength: editStrength })
                }),
            })

            const data = await res.json()

            if (!res.ok) {
                throw new Error(data.message || "Failed to update type")
            }

            setTypes(types.map(t => t.name === oldName ? {
                name: editName,
                color: editColor,
                ...(schemaType === 'relationship' && { strength: editStrength })
            } : t))
            setEditingType(null)
            router.refresh()
        } catch (err: any) {
            setError(err.message)
        } finally {
            setLoading(false)
        }
    }

    const handleDeleteType = async (typeName: string) => {
        if (!confirm(`Are you sure you want to delete the type "${typeName}"?`)) return

        setLoading(true)
        try {
            const res = await fetch("/api/projects/schema", {
                method: "DELETE",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({
                    projectId,
                    typeName,
                    schemaType
                })
            })

            if (!res.ok) throw new Error("Failed to delete type")

            setTypes(types.filter(t => t.name !== typeName))
            router.refresh()
        } catch (err: any) {
            setError(err.message)
        } finally {
            setLoading(false)
        }
    }

    return (
        <Card className="h-fit">
            <CardHeader className="pb-3">
                <CardTitle className="text-xl flex items-center gap-2">
                    <Settings2 className="h-5 w-5 text-primary" />
                    {title}
                </CardTitle>
                <CardDescription>{description}</CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
                {error && (
                    <Alert variant="destructive">
                        <AlertDescription>{error}</AlertDescription>
                    </Alert>
                )}

                {/* New Type Form */}
                <div className="space-y-4 p-4 border rounded-xl bg-muted/30 border-primary/10">
                    <div className="flex gap-3 items-end">
                        <div className="grid w-full gap-1.5">
                            <Label htmlFor={`typeName-${schemaType}`} className="text-xs font-semibold uppercase text-muted-foreground">Type Name</Label>
                            <Input
                                id={`typeName-${schemaType}`}
                                placeholder="e.g. Person, Event"
                                value={newTypeName}
                                onChange={(e) => setNewTypeName(e.target.value)}
                                className="bg-background shadow-sm"
                            />
                        </div>
                        <div className="grid gap-1.5">
                            <Label htmlFor={`typeColor-${schemaType}`} className="text-xs font-semibold uppercase text-muted-foreground">Color</Label>
                            <input
                                type="color"
                                id={`typeColor-${schemaType}`}
                                className="h-10 w-10 p-1 rounded-md border cursor-pointer bg-background"
                                value={newTypeColor}
                                onChange={(e) => setNewTypeColor(e.target.value)}
                            />
                        </div>
                    </div>
                    {schemaType === 'relationship' && (
                        <div className="grid gap-2 mt-2">
                            <Label className="text-xs font-semibold uppercase text-muted-foreground flex justify-between">
                                <span>Strength (Gravity)</span>
                                <span>{newTypeStrength.toFixed(1)}x</span>
                            </Label>
                            <Slider
                                value={[newTypeStrength]}
                                min={0.1}
                                max={5.0}
                                step={0.1}
                                onValueChange={(vals) => setNewTypeStrength(vals[0])}
                                className="py-2"
                            />
                        </div>
                    )}


                    <Button onClick={handleAddType} disabled={loading || !newTypeName.trim()} className="w-full gap-2 shadow-sm">
                        {loading ? "Creating..." : <><Plus className="h-4 w-4" /> Create Type</>}
                    </Button>
                </div>

                <Separator />

                {/* Existing Types List */}
                <div className="space-y-3">
                    <Label className="text-xs font-semibold uppercase text-muted-foreground">Existing Types</Label>
                    {types.length === 0 && (
                        <p className="text-sm text-muted-foreground italic bg-muted/40 p-6 rounded-lg text-center border border-dashed">No types defined yet.</p>
                    )}
                    {types.map((type) => (
                        <div key={type.name} className="border rounded-xl bg-card overflow-hidden shadow-sm hover:border-primary/30 transition-colors mb-4">
                            {editingType === type.name ? (
                                <div className="p-3 space-y-3 bg-muted/20">
                                    <div className="flex gap-3 items-end">
                                        <div className="grid w-full gap-1.5">
                                            <Label className="text-[10px] font-bold uppercase text-muted-foreground">Edit Name</Label>
                                            <Input
                                                value={editName}
                                                onChange={(e) => setEditName(e.target.value)}
                                                className="h-8 bg-background shadow-sm text-sm"
                                                autoFocus
                                            />
                                        </div>
                                        <div className="grid gap-1.5">
                                            <Label className="text-[10px] font-bold uppercase text-muted-foreground">Color</Label>
                                            <input
                                                type="color"
                                                className="h-8 w-8 p-0.5 rounded border cursor-pointer bg-background"
                                                value={editColor}
                                                onChange={(e) => setEditColor(e.target.value)}
                                            />
                                        </div>
                                    </div>
                                    {schemaType === 'relationship' && (
                                        <div className="grid gap-2">
                                            <Label className="text-[10px] font-bold uppercase text-muted-foreground flex justify-between">
                                                <span>Strength</span>
                                                <span>{editStrength.toFixed(1)}x</span>
                                            </Label>
                                            <Slider
                                                value={[editStrength]}
                                                min={0.1}
                                                max={5.0}
                                                step={0.1}
                                                onValueChange={(vals) => setEditStrength(vals[0])}
                                            />
                                        </div>
                                    )}
                                    <div className="flex gap-2 justify-end">
                                        <Button
                                            variant="ghost"
                                            size="sm"
                                            className="h-7 text-xs"
                                            onClick={() => setEditingType(null)}
                                            disabled={loading}
                                        >
                                            Cancel
                                        </Button>
                                        <Button
                                            variant="default"
                                            size="sm"
                                            className="h-7 text-xs bg-primary"
                                            onClick={() => handleUpdateType(type.name)}
                                            disabled={loading || !editName.trim()}
                                        >
                                            {loading ? "Saving..." : "Save Changes"}
                                        </Button>
                                    </div>
                                </div>
                            ) : (
                                <div className="flex items-center justify-between p-3 transition-colors">
                                    <div className="flex items-center gap-3">
                                        <div
                                            className="w-3 h-3 rounded-full shadow-inner"
                                            style={{ backgroundColor: type.color }}
                                        />
                                        <span className="font-semibold text-sm">{type.name}</span>
                                    </div>
                                    <div className="flex items-center gap-1">
                                        <Button
                                            variant="ghost"
                                            size="icon"
                                            className="h-7 w-7 text-muted-foreground hover:text-primary"
                                            onClick={() => {
                                                setEditingType(type.name)
                                                setEditName(type.name)
                                                setEditColor(type.color)
                                                setEditStrength(type.strength ?? 1)
                                            }}
                                            title="Edit type"
                                        >
                                            <Settings2 className="h-3.5 w-3.5" />
                                        </Button>
                                        <Button
                                            variant="ghost"
                                            size="icon"
                                            className="h-7 w-7 text-muted-foreground hover:text-destructive"
                                            onClick={() => handleDeleteType(type.name)}
                                            title="Delete type"
                                        >
                                            <Trash2 className="h-3.5 w-3.5" />
                                        </Button>
                                    </div>
                                </div>
                            )}
                        </div>
                    ))}
                </div>
            </CardContent>
        </Card >

    )
}
