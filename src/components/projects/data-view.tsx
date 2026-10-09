"use client"

import { useGraphStore } from "@/store/use-graph-store"
import { Loader2 } from "lucide-react"
import { useParams } from "next/navigation"
import { ElementsTable } from "./elements-table"
import { RelationshipsTable } from "./relationships-table"
import { FilterPanel } from "@/components/graph/filter-panel"
import { ImportExportControls } from "./import-export-controls"
import { AddRelationshipDialog } from "./add-relationship-dialog"
import { AddElementDialog } from "./add-element-dialog"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { useEffect } from "react"

interface DataViewProps {
    canEdit: boolean
    projectId?: string
}

export function DataView({ canEdit, projectId }: DataViewProps) {
    const { elements, relationships, loading, searchQuery, selectedTypeFilter, fetchGraphData } = useGraphStore()

    const params = useParams<{ id: string }>()
    const derivedProjectId = projectId || params?.id || ''

    // Ensure data is fetched
    useEffect(() => {
        if (elements.length === 0 && derivedProjectId) {
            fetchGraphData(derivedProjectId)
        }
    }, [elements.length, derivedProjectId, fetchGraphData])

    // Filter logic
    const filteredElements = elements.filter(el => {
        const matchesSearch = el.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
            el.type.toLowerCase().includes(searchQuery.toLowerCase()) ||
            (el.description && el.description.toLowerCase().includes(searchQuery.toLowerCase()))

        const matchesType = selectedTypeFilter ? el.type === selectedTypeFilter : true

        return matchesSearch && matchesType
    })

    const filteredRelationships = relationships.filter(rel => {
        const sourceName = typeof rel.source === 'string' ? '' : rel.source.name
        const targetName = typeof rel.target === 'string' ? '' : rel.target.name

        const matchesSearch = rel.type.toLowerCase().includes(searchQuery.toLowerCase()) ||
            sourceName.toLowerCase().includes(searchQuery.toLowerCase()) ||
            targetName.toLowerCase().includes(searchQuery.toLowerCase())

        // Relationships don't strictly have a 'type' like elements do for the filter,
        // but we could filter relationships where ANY connected node matches the type filter?
        // Or just don't apply type filter to relationships effectively, or filter only connections between filtered nodes.
        // Let's filter relationships where source OR target matches the type filter if applied.

        const matchesType = selectedTypeFilter ? (
            (typeof rel.source !== 'string' && rel.source.type === selectedTypeFilter) ||
            (typeof rel.target !== 'string' && rel.target.type === selectedTypeFilter)
        ) : true

        return matchesSearch && matchesType
    })


    if (loading) {
        return (
            <div className="flex justify-center p-8">
                <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
            </div>
        )
    }

    // Derive projectId from URL if not passed (if not already derived)

    return (
        <div className="flex flex-col h-full bg-background overflow-hidden min-h-0">
            <div className="flex justify-between items-start p-6 border-b shrink-0">
                <div className="max-w-sm w-full">
                    <FilterPanel />
                </div>
                <div className="flex gap-2">
                    {canEdit && derivedProjectId && (
                        <>
                            <AddElementDialog projectId={derivedProjectId} />
                            <AddRelationshipDialog projectId={derivedProjectId} />
                        </>
                    )}
                    {canEdit && <ImportExportControls />}
                </div>
            </div>

            <Tabs defaultValue="elements" className="flex-1 flex flex-col min-h-0">
                <div className="flex-1 overflow-auto min-h-0 p-6 pt-2">
                    <TabsContent value="elements" className="h-full m-0 p-0 border-none data-[state=inactive]:hidden">
                        <div className="overflow-auto h-full rounded-md border bg-card">
                            <ElementsTable elements={filteredElements} canEdit={canEdit} />
                        </div>
                    </TabsContent>

                    <TabsContent value="relationships" className="h-full m-0 p-0 border-none data-[state=inactive]:hidden">
                        <div className="overflow-auto h-full rounded-md border bg-card">
                            <RelationshipsTable relationships={filteredRelationships} canEdit={canEdit} />
                        </div>
                    </TabsContent>
                </div>

                <div className="border-t bg-muted/20 px-6 pt-1 shrink-0">
                    <TabsList className="bg-transparent h-auto p-0 gap-1 w-auto justify-start">
                        <TabsTrigger
                            value="elements"
                            className="rounded-t-md rounded-b-none border border-b-0 border-transparent data-[state=active]:bg-background data-[state=active]:border-border data-[state=active]:shadow-sm px-6 py-2 data-[state=inactive]:text-muted-foreground/70"
                        >
                            Elements ({filteredElements.length})
                        </TabsTrigger>
                        <TabsTrigger
                            value="relationships"
                            className="rounded-t-md rounded-b-none border border-b-0 border-transparent data-[state=active]:bg-background data-[state=active]:border-border data-[state=active]:shadow-sm px-6 py-2 data-[state=inactive]:text-muted-foreground/70"
                        >
                            Relationships ({filteredRelationships.length})
                        </TabsTrigger>
                    </TabsList>
                </div>
            </Tabs>
        </div>
    )
}
