"use client"

import { useCallback, useEffect, useState } from "react"
import { useGraphStore } from "@/store/use-graph-store"
import { formatDate } from "@/lib/utils"
import { formatDistanceToNow } from "date-fns"
import {
    History,
    RotateCcw,
    Plus,
    Trash2,
    Pencil,
    Loader2,
    User
} from "lucide-react"
import { Button } from "@/components/ui/button"
import { ScrollArea } from "@/components/ui/scroll-area"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Badge } from "@/components/ui/badge"
import { toast } from "sonner"

interface ChangeLogEntry {
    id: string
    action: 'CREATE' | 'UPDATE' | 'DELETE'
    entityType: 'Element' | 'Relationship'
    entityId: string
    entityName: string | null
    createdAt: string
    user: {
        name: string | null
        image: string | null
    }
}

interface HistoryTabProps {
    projectId: string
    canEdit: boolean
}

export function HistoryTab({ projectId, canEdit }: HistoryTabProps) {
    const [logs, setLogs] = useState<ChangeLogEntry[]>([])
    const [loading, setLoading] = useState(true)
    const [restoring, setRestoring] = useState<string | null>(null)
    const { fetchGraphData } = useGraphStore()

    const fetchLogs = useCallback(async () => {
        setLoading(true)
        try {
            const response = await fetch(`/api/projects/${projectId}/changelog`)
            if (response.ok) {
                const data = await response.json()
                setLogs(data)
            }
        } catch (error) {
            console.error("Failed to fetch history:", error)
        } finally {
            setLoading(false)
        }
    }, [projectId])

    useEffect(() => {
        fetchLogs()
    }, [fetchLogs])

    const handleRestore = async (logId: string) => {
        if (!confirm("Are you sure you want to undo this action? This might affect related data.")) return

        setRestoring(logId)
        try {
            const response = await fetch(`/api/projects/${projectId}/restore`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ changeLogId: logId })
            })

            if (!response.ok) {
                const error = await response.json()
                throw new Error(error.error || "Failed to restore")
            }

            toast.success("Action undone successfully")
            // Refresh logs and graph data
            await Promise.all([
                fetchLogs(),
                fetchGraphData(projectId)
            ])
        } catch (error: any) {
            toast.error(error.message)
        } finally {
            setRestoring(null)
        }
    }

    const getActionIcon = (action: string) => {
        switch (action) {
            case 'CREATE': return <Plus className="h-4 w-4 text-green-500" />
            case 'DELETE': return <Trash2 className="h-4 w-4 text-red-500" />
            case 'UPDATE': return <Pencil className="h-4 w-4 text-blue-500" />
            default: return <History className="h-4 w-4" />
        }
    }

    const getActionLabel = (action: string) => {
        switch (action) {
            case 'CREATE': return "Created"
            case 'DELETE': return "Deleted"
            case 'UPDATE': return "Updated"
            default: return action
        }
    }

    if (loading) {
        return (
            <div className="flex justify-center items-center h-full">
                <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
            </div>
        )
    }

    if (logs.length === 0) {
        return (
            <div className="flex flex-col items-center justify-center h-full text-muted-foreground p-8">
                <History className="h-12 w-12 mb-4 opacity-20" />
                <p>No history available for this project yet.</p>
            </div>
        )
    }

    return (
        <div className="h-full flex flex-col">
            <div className="flex justify-between items-center p-4 border-b">
                <h3 className="font-semibold flex items-center gap-2">
                    <History className="h-4 w-4" />
                    Project History
                </h3>
                <Button variant="ghost" size="sm" onClick={fetchLogs}>
                    Refresh
                </Button>
            </div>
            <ScrollArea className="flex-1">
                <div className="space-y-4 p-4 max-w-3xl mx-auto">
                    {logs.map((log) => (
                        <div key={log.id} className="flex items-start gap-4 p-4 rounded-lg border bg-card text-card-foreground shadow-sm">
                            <div className="mt-1 p-2 rounded-full bg-muted/50">
                                {getActionIcon(log.action)}
                            </div>

                            <div className="flex-1 space-y-1">
                                <div className="flex items-center gap-2">
                                    <span className="font-medium text-sm">
                                        {getActionLabel(log.action)} {log.entityType}
                                    </span>
                                    <Badge variant="outline" className="text-xs font-normal">
                                        {log.entityName || "Unnamed"}
                                    </Badge>
                                </div>

                                <div className="flex items-center gap-2 text-xs text-muted-foreground mt-2">
                                    <div className="flex items-center gap-1">
                                        <Avatar className="h-5 w-5">
                                            <AvatarImage src={log.user.image || undefined} />
                                            <AvatarFallback><User className="h-3 w-3" /></AvatarFallback>
                                        </Avatar>
                                        <span>{log.user.name || "Unknown User"}</span>
                                    </div>
                                    <span>•</span>
                                    <span>{formatDistanceToNow(new Date(log.createdAt), { addSuffix: true })} ({formatDate(log.createdAt)})</span>
                                </div>
                            </div>

                            {canEdit && (
                                <Button
                                    variant="outline"
                                    size="sm"
                                    disabled={restoring === log.id}
                                    onClick={() => handleRestore(log.id)}
                                    title="Undo this action"
                                    className="shrink-0 gap-1 text-xs h-7 px-2"
                                >
                                    {restoring === log.id ? (
                                        <Loader2 className="h-3 w-3 animate-spin" />
                                    ) : (
                                        <RotateCcw className="h-3 w-3" />
                                    )}
                                    Undo
                                </Button>
                            )}
                        </div>
                    ))}
                </div>
            </ScrollArea>
        </div>
    )
}
