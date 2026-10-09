"use client"

import { useState } from "react"
import { useParams } from "next/navigation"
import {
    Table,
    TableBody,
    TableCell,
    TableHead,
    TableHeader,
    TableRow,
} from "@/components/ui/table"
import { GraphElement, useGraphStore } from "@/store/use-graph-store"
import { formatDate } from "@/lib/utils"
import { Button } from "@/components/ui/button"
import { Avatar, AvatarImage, AvatarFallback } from "@/components/ui/avatar"
import { Trash2, Check, X, Loader2 } from "lucide-react"
import { EditElementDialog } from "./edit-element-dialog"
import { Input } from "@/components/ui/input"

interface ElementsTableProps {
    elements: GraphElement[]
    canEdit: boolean
}

export function ElementsTable({ elements, canEdit }: ElementsTableProps) {
    const { deleteElement, updateElement } = useGraphStore()
    const params = useParams<{ id: string }>()
    const projectId = params?.id ?? ''
    const [editingId, setEditingId] = useState<string | null>(null)
    const [editData, setEditData] = useState<Partial<GraphElement>>({})
    const [saving, setSaving] = useState(false)

    const handleStartEdit = (element: GraphElement) => {
        setEditingId(element.id)
        setEditData({
            name: element.name,
            type: element.type,
            description: element.description,
            dateOfBirth: element.dateOfBirth,
            imageUrl: element.imageUrl,
        })
    }

    const handleCancel = () => {
        setEditingId(null)
        setEditData({})
    }

    const handleSave = async (id: string) => {
        setSaving(true)
        try {
            await updateElement(id, projectId, editData)
            setEditingId(null)
            setEditData({})
        } catch (error) {
            console.error("Error saving element:", error)
        } finally {
            setSaving(false)
        }
    }

    if (elements.length === 0) {
        return <div className="text-center p-4 text-muted-foreground">No elements found.</div>
    }

    return (
        <div className="w-full bg-background border rounded-md">
            <Table>
                <TableHeader>
                    <TableRow>
                        <TableHead className="w-12"></TableHead>
                        <TableHead>Name</TableHead>
                        <TableHead>Type</TableHead>
                        <TableHead>Description</TableHead>
                        <TableHead>Date of Birth</TableHead>

                        {canEdit && <TableHead className="w-[120px] text-right">Actions</TableHead>}
                    </TableRow>
                </TableHeader>
                <TableBody>
                    {elements.map((element) => {
                        const isEditing = editingId === element.id

                        return (
                            <TableRow key={element.id} className={isEditing ? "bg-muted/30" : ""}>
                                <TableCell className="w-12">
                                    <Avatar className="h-8 w-8">
                                        {element.imageUrl ? (
                                            <AvatarImage src={element.imageUrl} alt={element.name} />
                                        ) : null}
                                        <AvatarFallback className="text-xs">{element.name[0]?.toUpperCase()}</AvatarFallback>
                                    </Avatar>
                                </TableCell>
                                <TableCell>
                                    {isEditing ? (
                                        <Input
                                            value={editData.name || ""}
                                            onChange={(e) => setEditData({ ...editData, name: e.target.value })}
                                            className="h-8"
                                            autoFocus
                                            onKeyDown={(e) => {
                                                if (e.key === 'Enter') handleSave(element.id)
                                                if (e.key === 'Escape') handleCancel()
                                            }}
                                        />
                                    ) : (
                                        <div
                                            className="font-medium cursor-pointer hover:text-primary transition-colors py-1 px-2 -mx-2 rounded hover:bg-muted/50"
                                            onDoubleClick={() => canEdit && handleStartEdit(element)}
                                            title="Double click to edit"
                                        >
                                            {element.name}
                                        </div>
                                    )}
                                </TableCell>
                                <TableCell>
                                    {isEditing ? (
                                        <Input
                                            value={editData.type || ""}
                                            onChange={(e) => setEditData({ ...editData, type: e.target.value })}
                                            className="h-8"
                                        />
                                    ) : (
                                        element.type
                                    )}
                                </TableCell>
                                <TableCell>
                                    {isEditing ? (
                                        <Input
                                            value={editData.description || ""}
                                            onChange={(e) => setEditData({ ...editData, description: e.target.value })}
                                            className="h-8"
                                            placeholder="Description..."
                                        />
                                    ) : (
                                        element.description || "-"
                                    )}
                                </TableCell>
                                <TableCell>
                                    {isEditing ? (
                                        <Input type="date" value={editData.dateOfBirth ? new Date(editData.dateOfBirth).toISOString().split('T')[0] : ""} onChange={(e) => setEditData({ ...editData, dateOfBirth: e.target.value || null })} className="h-8" />
                                    ) : (
                                        element.dateOfBirth ? formatDate(element.dateOfBirth) : "-"
                                    )}
                                </TableCell>

                                {canEdit && (
                                    <TableCell className="text-right">
                                        <div className="flex justify-end gap-1">
                                            {isEditing ? (
                                                <>
                                                    <Button
                                                        variant="ghost"
                                                        size="icon"
                                                        className="h-8 w-8 text-green-600 hover:text-green-700 hover:bg-green-50"
                                                        onClick={() => handleSave(element.id)}
                                                        disabled={saving}
                                                    >
                                                        {saving ? <Loader2 className="h-4 w-4 animate-spin" /> : <Check className="h-4 w-4" />}
                                                    </Button>
                                                    <Button
                                                        variant="ghost"
                                                        size="icon"
                                                        className="h-8 w-8 text-muted-foreground hover:text-foreground"
                                                        onClick={handleCancel}
                                                        disabled={saving}
                                                    >
                                                        <X className="h-4 w-4" />
                                                    </Button>
                                                </>
                                            ) : (
                                                <>
                                                    <EditElementDialog element={element} />
                                                    <Button
                                                        variant="ghost"
                                                        size="icon"
                                                        className="h-8 w-8 text-muted-foreground hover:text-destructive"
                                                        onClick={() => {
                                                            if (confirm('Are you sure you want to delete this element?')) {
                                                                deleteElement(element.id, projectId)
                                                            }
                                                        }}
                                                    >
                                                        <Trash2 className="h-4 w-4" />
                                                    </Button>
                                                </>
                                            )}
                                        </div>
                                    </TableCell>
                                )}
                            </TableRow>
                        )
                    })}
                </TableBody>
            </Table>
        </div>
    )
}

