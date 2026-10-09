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
import { GraphElement, GraphRelationship, useGraphStore } from "@/store/use-graph-store"
import { Button } from "@/components/ui/button"
import { Trash2, Check, X, Loader2 } from "lucide-react"
import { EditRelationshipDialog } from "./edit-relationship-dialog"
import { Input } from "@/components/ui/input"

interface RelationshipsTableProps {
    relationships: GraphRelationship[]
    canEdit: boolean
}

export function RelationshipsTable({ relationships, canEdit }: RelationshipsTableProps) {
    const { deleteRelationship, updateRelationship, elements } = useGraphStore()
    const params = useParams<{ id: string }>()
    const projectId = params?.id ?? ''
    const [editingId, setEditingId] = useState<string | null>(null)
    const [editType, setEditType] = useState("")
    const [saving, setSaving] = useState(false)

    if (relationships.length === 0) {
        return <div className="text-center p-4 text-muted-foreground">No relationships found.</div>
    }

    const getLabel = (node: string | GraphElement) => {
        if (!node) return 'Unknown'

        // If it's a string ID
        if (typeof node === 'string') {
            const element = elements.find(e => e.id === node)
            if (element) return element.name

            // Fallback: search in elements for ID match (case-insensitive just in case)
            const fallbackElement = elements.find(e => e.id.toLowerCase() === node.toLowerCase())
            if (fallbackElement) return fallbackElement.name

            return `ID: ${node.substring(0, 8)}...`
        }

        // If it's an object (D3 pointer or already mapped)
        const typedNode = node as any
        return typedNode.name || typedNode.id || 'Unknown'
    }

    const handleStartEdit = (rel: GraphRelationship) => {
        setEditingId(rel.id)
        setEditType(rel.type)
    }

    const handleCancel = () => {
        setEditingId(null)
        setEditType("")
    }

    const handleSave = async (id: string) => {
        setSaving(true)
        try {
            await updateRelationship(id, projectId, { type: editType })
            setEditingId(null)
            setEditType("")
        } catch (error) {
            console.error("Error saving relationship:", error)
        } finally {
            setSaving(false)
        }
    }

    return (
        <div className="w-full bg-background border rounded-md">
            <Table>
                <TableHeader>
                    <TableRow>
                        <TableHead>From</TableHead>
                        <TableHead>Type</TableHead>
                        <TableHead>To</TableHead>

                        {canEdit && <TableHead className="w-[120px] text-right">Actions</TableHead>}
                    </TableRow>
                </TableHeader>
                <TableBody>
                    {relationships.map((rel) => {
                        const isEditing = editingId === rel.id

                        return (
                            <TableRow key={rel.id} className={isEditing ? "bg-muted/30" : ""}>
                                <TableCell className="font-medium text-muted-foreground">{getLabel(rel.source)}</TableCell>
                                <TableCell>
                                    {isEditing ? (
                                        <Input
                                            value={editType}
                                            onChange={(e) => setEditType(e.target.value)}
                                            className="h-8"
                                        />
                                    ) : (
                                        <span
                                            className="cursor-pointer hover:text-primary transition-colors"
                                            onDoubleClick={() => canEdit && handleStartEdit(rel)}
                                        >
                                            {rel.type}
                                        </span>
                                    )}
                                </TableCell>
                                <TableCell className="text-muted-foreground">{getLabel(rel.target)}</TableCell>

                                {canEdit && (
                                    <TableCell className="text-right">
                                        <div className="flex justify-end gap-1">
                                            {isEditing ? (
                                                <>
                                                    <Button
                                                        variant="ghost"
                                                        size="icon"
                                                        className="h-8 w-8 text-green-600 hover:text-green-700 hover:bg-green-50"
                                                        onClick={() => handleSave(rel.id)}
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
                                                    <EditRelationshipDialog relationship={rel} />
                                                    <Button
                                                        variant="ghost"
                                                        size="icon"
                                                        className="h-8 w-8 text-muted-foreground hover:text-destructive"
                                                        onClick={() => {
                                                            if (confirm('Are you sure you want to delete this relationship?')) {
                                                                deleteRelationship(rel.id, projectId)
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

