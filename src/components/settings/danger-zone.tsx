"use client"

import { useState } from "react"
import { useRouter } from "next/navigation"
import { Button } from "@/components/ui/button"
import {
    AlertDialog,
    AlertDialogAction,
    AlertDialogCancel,
    AlertDialogContent,
    AlertDialogDescription,
    AlertDialogFooter,
    AlertDialogHeader,
    AlertDialogTitle,
    AlertDialogTrigger,
} from "@/components/ui/alert-dialog"
import { Trash2, AlertTriangle } from "lucide-react"

interface DangerZoneProps {
    projectId: string
    projectName: string
}

export function DangerZone({ projectId, projectName }: DangerZoneProps) {
    const [deleting, setDeleting] = useState(false)
    const [clearing, setClearing] = useState(false)
    const router = useRouter()

    const handleDeleteProject = async () => {
        setDeleting(true)
        try {
            const res = await fetch(`/api/projects/${projectId}`, {
                method: "DELETE",
            })
            if (res.ok) {
                router.push("/dashboard")
            } else {
                console.error("Failed to delete project")
                setDeleting(false)
            }
        } catch (error) {
            console.error(error)
            setDeleting(false)
        }
    }

    const handleClearData = async () => {
        setClearing(true)
        try {
            const res = await fetch(`/api/projects/${projectId}/clear-data`, {
                method: "DELETE",
            })
            if (res.ok) {
                router.refresh()
            } else {
                console.error("Failed to clear data")
            }
        } catch (error) {
            console.error(error)
        } finally {
            setClearing(false)
        }
    }

    return (
        <div className="space-y-4">
            {/* Clear All Data */}
            <div className="rounded-md border border-destructive/50 p-4">
                <h4 className="text-sm font-medium text-destructive flex items-center gap-2">
                    <AlertTriangle className="h-4 w-4" />
                    Clear All Data
                </h4>
                <p className="text-sm text-muted-foreground mb-4">
                    Delete all elements and relationships in this project. The project itself will remain.
                </p>
                <AlertDialog>
                    <AlertDialogTrigger asChild>
                        <Button variant="outline" disabled={clearing}>
                            {clearing ? "Clearing..." : "Clear All Data"}
                        </Button>
                    </AlertDialogTrigger>
                    <AlertDialogContent>
                        <AlertDialogHeader>
                            <AlertDialogTitle>Are you sure?</AlertDialogTitle>
                            <AlertDialogDescription>
                                This will permanently delete all elements and relationships in &quot;{projectName}&quot;.
                                This action cannot be undone.
                            </AlertDialogDescription>
                        </AlertDialogHeader>
                        <AlertDialogFooter>
                            <AlertDialogCancel>Cancel</AlertDialogCancel>
                            <AlertDialogAction onClick={handleClearData}>
                                Clear All Data
                            </AlertDialogAction>
                        </AlertDialogFooter>
                    </AlertDialogContent>
                </AlertDialog>
            </div>

            {/* Delete Project */}
            <div className="rounded-md border border-destructive/50 p-4">
                <h4 className="text-sm font-medium text-destructive flex items-center gap-2">
                    <Trash2 className="h-4 w-4" />
                    Delete Project
                </h4>
                <p className="text-sm text-muted-foreground mb-4">
                    Permanently delete this project and all its data. This action cannot be undone.
                </p>
                <AlertDialog>
                    <AlertDialogTrigger asChild>
                        <Button variant="destructive" disabled={deleting}>
                            {deleting ? "Deleting..." : "Delete Project"}
                        </Button>
                    </AlertDialogTrigger>
                    <AlertDialogContent>
                        <AlertDialogHeader>
                            <AlertDialogTitle>Delete &quot;{projectName}&quot;?</AlertDialogTitle>
                            <AlertDialogDescription>
                                This will permanently delete the project &quot;{projectName}&quot; and all of its data
                                (elements, relationships, members). This action cannot be undone.
                            </AlertDialogDescription>
                        </AlertDialogHeader>
                        <AlertDialogFooter>
                            <AlertDialogCancel>Cancel</AlertDialogCancel>
                            <AlertDialogAction
                                onClick={handleDeleteProject}
                                className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
                            >
                                Delete Project
                            </AlertDialogAction>
                        </AlertDialogFooter>
                    </AlertDialogContent>
                </AlertDialog>
            </div>
        </div>
    )
}
